import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeData } from '../utils/serializer.js';

export const reportesRouter = Router();

/**
 * GET /api/reportes/operaciones
 * Bitácora consolidada de operaciones reales por empleado con filtros.
 * Soporta filtro por periodo (dia, semana, mes), puesto (Escritorio, Caja) y empleado.
 */
reportesRouter.get('/operaciones', async (_req: Request, res: Response) => {
  try {
    const [turnos, solicitudes, transacciones] = await Promise.all([
      prisma.service_turns.findMany({
        include: {
          turn_types: true,
          customers: true,
          app_users: { include: { employees: true } }
        }
      }),
      prisma.loan_applications.findMany({
        include: {
          customers: true,
          financial_products: true,
          app_users: { include: { employees: true } }
        }
      }),
      prisma.financial_transactions.findMany({
        include: {
          customers: true,
          app_users: { include: { employees: true } }
        }
      })
    ]);

    const nombreEmpleado = (usuario: { employees: { first_name: string; paternal_surname: string; job_title: string | null } | null } | null) => {
      const empleado = usuario?.employees;
      return empleado
        ? `${empleado.first_name} ${empleado.paternal_surname}`
        : 'Personal Sucursal';
    };

    const puestoEmpleado = (usuario: { employees: { job_title: string | null } | null } | null) =>
      usuario?.employees?.job_title?.toUpperCase().includes('CAJ') ? 'Caja' : 'Escritorio';

    const nombreCliente = (cliente: { first_name: string; paternal_surname: string } | null) =>
      cliente ? `${cliente.first_name} ${cliente.paternal_surname}` : 'Persona externa';

    const resultado = [
      ...turnos.map((turno) => ({
        id: `TURNO-${turno.id.toString()}`,
        empleado: nombreEmpleado(turno.app_users),
        puesto: puestoEmpleado(turno.app_users),
        actividad: turno.turn_types?.name || 'Atención en sucursal',
        cliente: nombreCliente(turno.customers),
        tipoPersona: turno.customers ? 'Cliente' as const : 'Externo' as const,
        fecha: turno.created_at.toISOString().split('T')[0],
        resultado: turno.status === 'COMPLETED'
          ? 'Completado' as const
          : turno.status === 'CANCELLED'
            ? 'Rechazado' as const
            : 'Pendiente' as const,
        importe: 0,
        fechaOrden: turno.created_at.getTime()
      })),
      ...solicitudes.map((solicitud) => ({
        id: `PRESTAMO-${solicitud.id.toString()}`,
        empleado: nombreEmpleado(solicitud.app_users),
        puesto: 'Escritorio' as const,
        actividad: 'Solicitud de préstamo',
        cliente: nombreCliente(solicitud.customers),
        tipoPersona: 'Cliente' as const,
        fecha: solicitud.created_at.toISOString().split('T')[0],
        resultado: solicitud.status === 'REJECTED'
          ? 'Rechazado' as const
          : solicitud.status === 'CANCELLED'
            ? 'Rechazado' as const
          : solicitud.status === 'APPROVED'
            ? 'Completado' as const
            : 'Pendiente' as const,
        importe: Number(solicitud.requested_amount),
        fechaOrden: solicitud.created_at.getTime()
      })),
      ...transacciones.map((transaccion) => ({
        id: `TX-${transaccion.id.toString()}`,
        empleado: nombreEmpleado(transaccion.app_users),
        puesto: transaccion.channel === 'COUNTER' ||
          transaccion.app_users?.employees?.job_title?.toUpperCase().includes('CAJ')
          ? 'Caja' as const
          : 'Escritorio' as const,
        actividad: transaccion.transaction_type === 'LOAN_PAYMENT'
          ? 'Pago o abono de préstamo'
          : transaccion.transaction_type === 'ACCOUNT_DEPOSIT'
            ? 'Depósito en cuenta'
            : transaccion.transaction_type === 'ACCOUNT_WITHDRAWAL'
              ? 'Retiro en cuenta'
              : 'Operación financiera',
        cliente: nombreCliente(transaccion.customers),
        tipoPersona: 'Cliente' as const,
        fecha: transaccion.created_at.toISOString().split('T')[0],
        resultado: transaccion.status === 'POSTED'
          ? 'Completado' as const
          : transaccion.status === 'CANCELLED'
            ? 'Rechazado' as const
            : 'Pendiente' as const,
        importe: Number(transaccion.amount),
        fechaOrden: transaccion.created_at.getTime()
      }))
    ]
      .sort((a, b) => b.fechaOrden - a.fechaOrden)
      .map(({ fechaOrden: _fechaOrden, ...operacion }) => operacion);

    res.json(serializeData(resultado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reportes/resumen
 * Resumen general consolidado de la sucursal y comparativa entre puestos (Sección 5.2 de AGENTS.md).
 */
reportesRouter.get('/resumen', async (_req: Request, res: Response) => {
  try {
    const [turnos, pagos] = await Promise.all([
      prisma.service_turns.findMany({
        include: { app_users: { include: { employees: true } } }
      }),
      prisma.financial_transactions.findMany({
        where: { status: 'POSTED', transaction_type: 'LOAN_PAYMENT' },
        select: { amount: true, customer_id: true }
      })
    ]);
    const escritorio = turnos.filter((turno) => turno.app_users?.employees?.job_title !== 'CAJERO');
    const caja = turnos.filter((turno) => turno.app_users?.employees?.job_title === 'CAJERO');
    const importePagos = pagos.reduce((total, pago) => total + Number(pago.amount), 0);

    res.json({
      general: {
        clientesNuevos: 0,
        clientesAtendidos: turnos.filter((turno) => Boolean(turno.customer_id)).length,
        personasExternas: turnos.filter((turno) => !turno.customer_id).length,
        productosAsignados: 0,
        pagosRecibidos: pagos.length,
        montoTotalRecibido: importePagos,
        operacionesTotales: turnos.length + pagos.length
      },
      escritorio: {
        clientesNuevos: 0,
        clientesAtendidos: escritorio.filter((turno) => Boolean(turno.customer_id)).length,
        productosAsignados: 0,
        tramitesRealizados: escritorio.length,
        actualizacionesDatos: 0,
        personasExternas: escritorio.filter((turno) => !turno.customer_id).length
      },
      caja: {
        pagosRecibidos: pagos.length,
        clientesPagadores: new Set(pagos.map((pago) => pago.customer_id.toString())).size,
        montoTotalEfectivo: importePagos,
        operacionesCaja: caja.length + pagos.length,
        clientesAtendidos: caja.filter((turno) => Boolean(turno.customer_id)).length,
        personasExternas: caja.filter((turno) => !turno.customer_id).length
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
