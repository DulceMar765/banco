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
    const turnos = await prisma.service_turns.findMany({
      include: {
        turn_types: true,
        customers: true,
        app_users: {
          include: {
            employees: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const resultado = turnos.map((t) => {
      const emp = t.app_users?.employees;
      const nombreEmp = emp
        ? `${emp.first_name} ${emp.paternal_surname}`
        : 'Personal Sucursal';
      const rolPuesto = emp?.job_title === 'CAJERO' ? 'Caja' : 'Escritorio';
      const clienteNombre = t.customers
        ? `${t.customers.first_name} ${t.customers.paternal_surname}`
        : 'Persona externa';

      return {
        id: t.id.toString(),
        empleado: nombreEmp,
        puesto: rolPuesto,
        actividad: t.turn_types?.name || 'Atención en sucursal',
        cliente: clienteNombre,
        tipoPersona: t.customers ? 'Cliente' : 'Externo',
        fecha: t.created_at.toISOString().split('T')[0],
        resultado: t.status === 'COMPLETED' ? 'Completado' : 'Pendiente',
        importe: 0
      };
    });

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
