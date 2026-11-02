import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeData } from '../utils/serializer.js';

export const clientesRouter = Router();

/**
 * GET /api/clientes
 * Directorio general de clientes con búsqueda por nombre, RFC, CURP o número de cuenta.
 * Retorna datos generales, capacidad de pago y resumen de productos financieros.
 */
clientesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();

    const whereClause: any = q
      ? {
          OR: [
            { first_name: { contains: q } },
            { paternal_surname: { contains: q } },
            { rfc: { contains: q } },
            { curp: { contains: q } },
            { email: { contains: q } },
            {
              accounts: {
                some: {
                  account_number: { contains: q }
                }
              }
            }
          ]
        }
      : {};

    const clientes = await prisma.customers.findMany({
      where: whereClause,
      include: {
        customer_income_records: {
          orderBy: { created_at: 'desc' },
          take: 1
        },
        accounts: {
          include: {
            financial_products: true
          }
        },
        loan_applications: {
          include: {
            financial_products: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const resultado = clientes.map((c) => {
      const income = c.customer_income_records[0];
      const ingresos = income ? Number(income.monthly_amount) : 15000;
      const gastos = 5000;
      const otrasDeudas = 1000;

      const productos = [
        ...c.accounts.map((a) => ({
          id: a.id.toString(),
          tipo: a.financial_products.product_type === 'DEPOSIT_ACCOUNT' ? 'Cuenta bancaria' : 'Ahorro',
          nombre: a.financial_products.name,
          numeroCuenta: a.account_number,
          saldo: Number(a.balance),
          estado: a.status
        })),
        ...c.loan_applications.map((la) => ({
          id: la.id.toString(),
          tipo: 'Préstamo',
          nombre: la.financial_products.name,
          numeroPrestamo: `SOL-${la.id}`,
          saldo: Number(la.requested_amount),
          tasa: Number(la.proposed_annual_rate) * 100,
          estado: la.status
        }))
      ];

      const nombreCompleto = [c.first_name, c.middle_name, c.paternal_surname, c.maternal_surname]
        .filter(Boolean)
        .join(' ');

      return {
        id: c.id.toString(),
        nombre: nombreCompleto,
        rfc: c.rfc || '',
        curp: c.curp || '',
        correo: c.email || '',
        telefono: c.phone || '',
        fechaRegistro: c.created_at.toISOString().split('T')[0],
        ingresos,
        gastos,
        otrasDeudas,
        estado: c.status === 'ACTIVE' ? 'Activo' : c.status,
        productos
      };
    });

    res.json(serializeData(resultado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/clientes/:id
 * Detalle completo de un socio: información financiera, cuentas y solicitudes de préstamo.
 */
clientesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const clienteId = BigInt(req.params.id);

    const c = await prisma.customers.findUnique({
      where: { id: clienteId },
      include: {
        customer_income_records: {
          orderBy: { created_at: 'desc' },
          take: 1
        },
        accounts: {
          include: {
            financial_products: true
          }
        },
        loan_applications: {
          include: {
            financial_products: true
          }
        }
      }
    });

    if (!c) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const income = c.customer_income_records[0];
    const ingresos = income ? Number(income.monthly_amount) : 0;
    const gastos = 0;
    const otrasDeudas = 0;

    const nombreCompleto = [c.first_name, c.middle_name, c.paternal_surname, c.maternal_surname]
      .filter(Boolean)
      .join(' ');

    res.json(
      serializeData({
        id: c.id.toString(),
        nombre: nombreCompleto,
        rfc: c.rfc || '',
        curp: c.curp || '',
        correo: c.email || '',
        telefono: c.phone || '',
        fechaRegistro: c.created_at.toISOString().split('T')[0],
        ingresos,
        gastos,
        otrasDeudas,
        estado: c.status,
        cuentas: c.accounts,
        solicitudesPrestamo: c.loan_applications
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/clientes/:id/modificaciones
 * Bitácora acumulativa e inmutable de modificaciones realizadas por supervisores
 * a las condiciones de pago y datos financieros del socio (Sección 5.1 de AGENTS.md).
 */
clientesRouter.get('/:id/modificaciones', async (req: Request, res: Response) => {
  try {
    const clienteId = BigInt(req.params.id);

    const logs = await prisma.audit_logs.findMany({
      where: {
        entity_name: 'customers',
        entity_pk: clienteId.toString()
      },
      orderBy: { occurred_at: 'desc' }
    });

    const historial = logs.map((log) => {
      let supervisorNombre = 'Supervisor de Sucursal';
      let motivo = 'Ajuste de condiciones de socio';
      let campo = 'Modificación de condición';
      let anterior = '';
      let nuevo = '';

      try {
        const parsedNew = typeof log.new_data === 'string' ? JSON.parse(log.new_data) : log.new_data;
        const parsedOld = typeof log.old_data === 'string' ? JSON.parse(log.old_data) : log.old_data;
        if (parsedNew) {
          campo = parsedNew.campo || campo;
          nuevo = parsedNew.nuevo || '';
          motivo = parsedNew.motivo || motivo;
          supervisorNombre = parsedNew.supervisor || supervisorNombre;
        }
        if (parsedOld) {
          anterior = parsedOld.anterior || '';
        }
      } catch {
        // Fallback
      }

      return {
        id: log.id.toString(),
        clienteId: clienteId.toString(),
        campo,
        anterior,
        nuevo,
        supervisor: supervisorNombre,
        fecha: log.occurred_at.toISOString().replace('T', ' ').substring(0, 19),
        motivo
      };
    });

    res.json(serializeData(historial));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/clientes/:id/modificaciones
 * Registro inmutable de una nueva modificación por parte del supervisor.
 * Aplica regla estricta: acumulativo, no borra ni sobreescribe registros previos.
 */
clientesRouter.post('/:id/modificaciones', async (req: Request, res: Response) => {
  try {
    const clienteId = BigInt(req.params.id);
    const { campo, anterior, nuevo, motivo, supervisorId, supervisorNombre } = req.body;

    if (!campo || nuevo === undefined || !motivo) {
      return res.status(400).json({
        error: 'Datos incompletos. Se requiere campo modificado, valor nuevo y motivo obligatorio.'
      });
    }

    const appUserId = supervisorId ? BigInt(supervisorId) : BigInt(1);

    // Inserción inmutable en audit_logs respetando el esquema de MySQL
    const auditRecord = await prisma.audit_logs.create({
      data: {
        actor_user_id: appUserId,
        entity_name: 'customers',
        entity_pk: clienteId.toString(),
        action: 'UPDATE',
        old_data: JSON.stringify({ anterior }),
        new_data: JSON.stringify({
          campo,
          nuevo,
          motivo,
          supervisor: supervisorNombre || 'Carlos Ramírez'
        }),
        connection_id: BigInt(1)
      }
    });

    res.status(201).json(
      serializeData({
        mensaje: 'Modificación registrada exitosamente en el historial acumulativo.',
        id: auditRecord.id.toString(),
        fecha: auditRecord.occurred_at
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
