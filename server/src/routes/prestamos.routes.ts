import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeData } from '../utils/serializer.js';

export const prestamosRouter = Router();

/**
 * GET /api/prestamos/solicitudes
 * Bandeja de solicitudes de préstamo para evaluación del supervisor (ModuloPrestamos.tsx).
 */
prestamosRouter.get('/solicitudes', async (_req: Request, res: Response) => {
  try {
    const solicitudes = await prisma.loan_applications.findMany({
      include: {
        customers: {
          include: {
            customer_income_records: {
              orderBy: { created_at: 'desc' },
              take: 1
            }
          }
        },
        financial_products: true,
        loan_approvals: true
      },
      orderBy: { created_at: 'desc' }
    });

    const resultado = solicitudes.map((s) => {
      const cliente = s.customers;
      const income = cliente?.customer_income_records[0];
      const ingresoComprobado = income && income.verified ? Number(income.monthly_amount) : 0;
      const ingresoDeclarado = income && income.is_declared ? Number(income.monthly_amount) : 0;
      const gastos = 5000;

      // Un préstamo se considera "dudoso" si requiere aprobación de supervisor
      const esDudoso = s.requires_supervisor_approval || Number(s.requested_amount) > 50000;
      const nombreCliente = [cliente?.first_name, cliente?.middle_name, cliente?.paternal_surname]
        .filter(Boolean)
        .join(' ');

      return {
        id: s.id.toString(),
        folio: `SOL-${s.id}`,
        cliente: nombreCliente || 'Cliente no identificado',
        rfc: cliente?.rfc || s.rfc_snapshot || '',
        producto: s.financial_products.name,
        montoSolicitado: Number(s.requested_amount),
        plazoMeses: s.term_months,
        estado: s.status,
        esDudoso,
        ingresosComprobados: ingresoComprobado || ingresoDeclarado,
        gastosDeclarados: gastos,
        fechaSolicitud: s.created_at.toISOString().split('T')[0]
      };
    });

    if (resultado.length === 0) {
      return res.json([
        {
          id: '1',
          folio: 'SOL-2026-001',
          cliente: 'Juan Pérez',
          rfc: 'PEJU900515ABC',
          producto: 'Préstamo Personal Tradicional',
          montoSolicitado: 35000,
          plazoMeses: 24,
          estado: 'UNDER_REVIEW',
          esDudoso: false,
          ingresosComprobados: 18000,
          gastosDeclarados: 6500,
          fechaSolicitud: '2026-10-30'
        },
        {
          id: '2',
          folio: 'SOL-2026-002',
          cliente: 'Roberto Sánchez Díaz',
          rfc: 'SADR880714EF3',
          producto: 'Préstamo de Emergencia',
          montoSolicitado: 80000,
          plazoMeses: 36,
          estado: 'UNDER_REVIEW',
          esDudoso: true,
          ingresosComprobados: 12000,
          gastosDeclarados: 9500,
          fechaSolicitud: '2026-10-31'
        }
      ]);
    }

    res.json(serializeData(resultado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/prestamos/:id/autorizar
 * Resolución de autorización o rechazo de un préstamo dudoso por el supervisor (RF-21, HU-31).
 */
prestamosRouter.post('/:id/autorizar', async (req: Request, res: Response) => {
  try {
    const solicitudId = BigInt(req.params.id);
    const { aprobada, motivo, supervisorId } = req.body;

    if (aprobada === undefined || !motivo) {
      return res.status(400).json({ error: 'Se requiere resolución (aprobada: boolean) y motivo justificado.' });
    }

    const solicitud = await prisma.loan_applications.findUnique({ where: { id: solicitudId } });
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud de préstamo no encontrada.' });
    }
    if (solicitud.status !== 'SUBMITTED' && solicitud.status !== 'UNDER_REVIEW') {
      return res.status(400).json({
        error: `La solicitud no puede ser evaluada porque su estado actual es ${solicitud.status}.`
      });
    }

    const appUserId = supervisorId ? BigInt(supervisorId) : BigInt(1);
    const decision = aprobada ? 'APPROVED' : 'REJECTED';
    const status = aprobada ? 'APPROVED' : 'REJECTED';

    const approval = await prisma.loan_approvals.create({
      data: {
        loan_application_id: solicitudId,
        supervisor_user_id: appUserId,
        decision,
        comment: String(motivo)
      }
    });

    await prisma.loan_applications.update({
      where: { id: solicitudId },
      data: {
        status,
        decision_at: new Date(),
        decision_comment: String(motivo)
      }
    });

    res.json(
      serializeData({
        mensaje: `Préstamo ${aprobada ? 'AUTORIZADO' : 'RECHAZADO'} con éxito.`,
        id: approval.id.toString(),
        estado: status
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
