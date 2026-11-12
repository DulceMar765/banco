import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeData } from '../utils/serializer.js';

export const cobranzaRouter = Router();

/**
 * GET /api/cobranza
 * Listado de casos de cartera vencida calculada en días hábiles.
 * Clasifica en Recuperable (1-2 meses / 20-40 días) vs. Vencida no recuperable (> 60 días hábiles).
 */
cobranzaRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { clasificacion } = req.query;

    const whereClause: any = {};
    if (clasificacion && clasificacion !== 'todas') {
      whereClause.classification = clasificacion === 'Recuperable' ? 'RECOVERABLE' : 'NON_RECOVERABLE';
    }

    const casos = await prisma.collection_cases.findMany({
      where: whereClause,
      include: {
        loans: {
          include: {
            loan_applications: {
              include: {
                customers: true
              }
            }
          }
        }
      },
      orderBy: { business_days_overdue: 'desc' }
    });

    const resultado = casos.map((c) => {
      const loan = c.loans;
      const cliente = loan?.loan_applications?.customers;
      const nombreCliente = cliente
        ? [cliente.first_name, cliente.middle_name, cliente.paternal_surname].filter(Boolean).join(' ')
        : 'Cliente no identificado';
      const rfcCliente = cliente?.rfc || '';

      const esVencida = c.classification === 'NON_RECOVERABLE' || c.business_days_overdue > 60;
      const susceptibleVenta = c.sale_eligibility === 'ELIGIBLE' || c.business_days_overdue > 60;

      return {
        id: c.id.toString(),
        prestamoId: loan?.id.toString(),
        cliente: nombreCliente,
        rfc: rfcCliente,
        prestamo: loan?.contract_number || `PRE-${c.id}`,
        saldo: Number(loan?.principal_balance || 0),
        fechaVencimiento: loan?.maturity_date ? loan.maturity_date.toISOString().split('T')[0] : '',
        ultimoPago: c.last_contact_at ? c.last_contact_at.toISOString().split('T')[0] : 'Sin registro',
        diasHabilesAtraso: c.business_days_overdue,
        clasificacion: esVencida ? 'Vencida' : 'Recuperable',
        susceptibleVenta,
        decision: c.classification === 'SOLD' ? 'Venta autorizada' : 'Pendiente',
        fechaPlazo: c.next_action_at ? c.next_action_at.toISOString().split('T')[0] : '',
        observaciones: c.notes || `Caso en gestión de cobranza (${c.business_days_overdue} días hábiles en mora).`
      };
    });

    res.json(serializeData(resultado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/cobranza/:id/decision
 * Registra una resolución o acuerdo del supervisor (concesión de plazo o venta de cartera).
 */
cobranzaRouter.post('/:id/decision', async (req: Request, res: Response) => {
  try {
    const casoId = BigInt(req.params.id);
    const { decision, fechaPlazo, motivo, supervisorId } = req.body;

    if (!decision || !motivo) {
      return res.status(400).json({ error: 'Se requiere decisión y motivo justificado.' });
    }

    const caso = await prisma.collection_cases.findUnique({ where: { id: casoId } });
    if (!caso) {
      return res.status(404).json({ error: 'Caso de cobranza no encontrado.' });
    }

    await prisma.collection_cases.update({
      where: { id: casoId },
      data: {
        classification: decision === 'Venta autorizada' ? 'SOLD' : decision === 'No autorizada' ? 'NON_RECOVERABLE' : caso.classification,
        sale_eligibility: decision === 'Venta autorizada' ? 'ELIGIBLE' : decision === 'No autorizada' ? 'NOT_ELIGIBLE' : caso.sale_eligibility,
        next_action_at: fechaPlazo ? new Date(fechaPlazo) : null,
        notes: motivo,
      },
    });

    // Registrar en auditoría
    await prisma.audit_logs.create({
      data: {
        entity_name: 'collection_cases',
        entity_pk: casoId.toString(),
        action: 'AUTHORIZE',
        new_data: JSON.stringify({ decision, fechaPlazo, motivo }),
        connection_id: BigInt(1),
        ...(supervisorId ? { actor_user_id: BigInt(supervisorId) } : {})
      }
    });

    res.json({
      status: 'ok',
      mensaje: `Resolución de cobranza registrada: ${decision}`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/cobranza/exportar
 * Genera el paquete de datos para exportación mensual de cartera vencida a despacho externo (RF-26).
 */
cobranzaRouter.get('/exportar', async (_req: Request, res: Response) => {
  try {
    const casos = await prisma.collection_cases.findMany({
      where: { classification: { in: ['NON_RECOVERABLE', 'SOLD'] } },
      include: {
        loans: {
          include: {
            loan_applications: { include: { customers: true } }
          }
        }
      },
      orderBy: { business_days_overdue: 'desc' }
    });

    res.json({
      periodo: new Date().toISOString().substring(0, 7),
      fechaGeneracion: new Date().toISOString(),
      formato: 'XLSX_COMPLIANT',
      registros: casos.map((caso) => {
        const customer = caso.loans.loan_applications.customers;
        return {
          folio: caso.loans.contract_number,
          titular: [customer.first_name, customer.middle_name, customer.paternal_surname].filter(Boolean).join(' '),
          rfc: customer.rfc,
          diasMoraHabiles: caso.business_days_overdue,
          capitalVencido: caso.loans.principal_balance,
          calificacion: caso.classification === 'SOLD' ? 'VENDIDA' : 'NO_RECUPERABLE',
          estatusCesion: caso.sale_eligibility === 'ELIGIBLE' ? 'APTO_VENTA' : 'EN_REVISION'
        };
      })
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
