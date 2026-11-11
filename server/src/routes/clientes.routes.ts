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
      const ingresos = income ? Number(income.monthly_amount) : 0;
      const gastos = 0;
      const otrasDeudas = 0;

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
 * POST /api/clientes
 * Alta de un nuevo socio en el sistema.
 */
clientesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      primerNombre,
      apellidoPaterno,
      apellidoMaterno,
      correo,
      telefono,
      rfc,
      curp,
      direccion,
      ingresos,
      ingreso,
      tipoIngreso,
      documentos,
      ejecutivoUserId
    } = req.body;

    const nombreCompleto = nombre || [primerNombre, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ');
    if (!nombreCompleto.trim()) {
      return res.status(400).json({ error: 'El nombre del cliente es obligatorio.' });
    }

    const emailTrim = (correo || '').trim().toLowerCase() || null;
    const rfcTrim = (rfc || '').trim().toUpperCase() || null;
    const curpTrim = (curp || '').trim().toUpperCase() || null;

    if (emailTrim) {
      const existeEmail = await prisma.customers.findFirst({ where: { email: emailTrim } });
      if (existeEmail) {
        return res.status(409).json({ error: 'Ya existe un socio registrado con este correo electrónico.' });
      }
    }
    if (rfcTrim) {
      const existeRfc = await prisma.customers.findFirst({ where: { rfc: rfcTrim } });
      if (existeRfc) {
        return res.status(409).json({ error: 'Ya existe un socio registrado con este RFC.' });
      }
    }
    if (curpTrim) {
      const existeCurp = await prisma.customers.findFirst({ where: { curp: curpTrim } });
      if (existeCurp) {
        return res.status(409).json({ error: 'Ya existe un socio registrado con esta CURP.' });
      }
    }

    const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
    const fName = primerNombre || (partes.length > 2 ? partes.slice(0, partes.length - 2).join(' ') : partes[0]);
    const pSurname = apellidoPaterno || (partes.length >= 2 ? partes[partes.length - (partes.length > 2 ? 2 : 1)] : 'Pendiente');
    const mSurname = apellidoMaterno || (partes.length > 2 ? partes[partes.length - 1] : null);

    const userId = ejecutivoUserId ? BigInt(ejecutivoUserId) : BigInt(1);
    const montoIngreso = Number(ingreso || ingresos || 0);

    const resultadoCliente = await prisma.$transaction(async (tx) => {
      const anio = new Date().getFullYear();
      const countTotal = await tx.customers.count();
      const customerNumber = `CTE-${anio}-${String(countTotal + 1).padStart(4, '0')}`;

      const nuevoCliente = await tx.customers.create({
        data: {
          customer_number: customerNumber,
          first_name: fName,
          paternal_surname: pSurname,
          maternal_surname: mSurname,
          email: emailTrim,
          phone: telefono?.trim() || null,
          rfc: rfcTrim,
          curp: curpTrim,
          address_line: direccion?.trim() || null,
          status: 'ACTIVE'
        }
      });

      if (montoIngreso > 0) {
        await tx.customer_income_records.create({
          data: {
            customer_id: nuevoCliente.id,
            monthly_amount: montoIngreso,
            is_declared: tipoIngreso !== 'Comprobable',
            income_source: tipoIngreso === 'Comprobable' ? 'Ingresos Comprobables' : 'Ingresos Declarados',
            verified: tipoIngreso === 'Comprobable',
            valid_from: new Date(),
            created_by: userId
          }
        });
      }

      let productoCuenta = await tx.financial_products.findFirst({
        where: { product_type: 'DEPOSIT_ACCOUNT', is_active: true }
      });

      if (!productoCuenta) {
        productoCuenta = await tx.financial_products.create({
          data: {
            code: 'CTA-AHORRO-01',
            name: 'Cuenta de Ahorro Básica',
            product_type: 'DEPOSIT_ACCOUNT',
            description: 'Cuenta básica de ahorro y operaciones',
            minimum_amount: 0.0,
            default_annual_rate: 0.02,
            is_active: true
          }
        });
      }

      let nextSeq = BigInt(countTotal + 1);
      try {
        const seq = await tx.account_number_sequences.findUnique({
          where: { sequence_name: 'ACCOUNT' }
        });
        if (seq) {
          nextSeq = seq.next_value;
          await tx.account_number_sequences.update({
            where: { sequence_name: 'ACCOUNT' },
            data: { next_value: nextSeq + BigInt(1) }
          });
        }
      } catch {
        // Fallback
      }

      const anioCorto = String(anio).substring(2);
      const numeroCuenta = `CTA${anioCorto}${String(nextSeq).padStart(10, '0')}`;

      const cuentaCreada = await tx.accounts.create({
        data: {
          account_number: numeroCuenta,
          customer_id: nuevoCliente.id,
          product_id: productoCuenta.id,
          balance: 0.0,
          status: 'ACTIVE',
          created_by_user_id: userId
        }
      });

      // Inscripción automática a lealtad
      await tx.loyalty_accounts.upsert({
        where: { customer_id: nuevoCliente.id },
        update: {},
        create: {
          customer_id: nuevoCliente.id,
          points_balance: BigInt(0),
          status: 'ACTIVE'
        }
      });

      return {
        id: nuevoCliente.id.toString(),
        nombre: [fName, pSurname, mSurname].filter(Boolean).join(' '),
        correo: emailTrim || '',
        telefono: telefono || '',
        cuenta: cuentaCreada.account_number,
        estado: 'Activo',
        rfc: rfcTrim || '',
        curp: curpTrim || '',
        direccion: direccion || '',
        ingresos: montoIngreso,
        documentos: documentos || {}
      };
    });

    res.status(201).json(serializeData(resultadoCliente));
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
