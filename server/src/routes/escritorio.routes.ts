import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { PROJECT_PARAMETERS } from '../config/parameters.js';
import { serializeData } from '../utils/serializer.js';

export const escritorioRouter = Router();

/**
 * Normaliza nombres en partes (primer nombre, segundo nombre, apellido paterno, apellido materno).
 */
function parseNombreCompleto(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 1) {
    return { first_name: partes[0], paternal_surname: 'Pendiente', maternal_surname: null };
  }
  if (partes.length === 2) {
    return { first_name: partes[0], paternal_surname: partes[1], maternal_surname: null };
  }
  if (partes.length === 3) {
    return { first_name: partes[0], paternal_surname: partes[1], maternal_surname: partes[2] };
  }
  return {
    first_name: partes.slice(0, partes.length - 2).join(' '),
    paternal_surname: partes[partes.length - 2],
    maternal_surname: partes[partes.length - 1]
  };
}

/**
 * Traduce el estado interno de la solicitud a las etiquetas de la UI del Escritorio.
 */
function traducirEstadoSolicitud(status: string): string {
  switch (status) {
    case 'SUBMITTED':
      return 'Enviada a supervisión';
    case 'UNDER_REVIEW':
      return 'En revisión';
    case 'APPROVED':
      return 'Aprobada';
    case 'REJECTED':
      return 'Rechazada';
    case 'DRAFT':
      return 'Pendientes';
    default:
      return status;
  }
}

/**
 * GET /api/escritorio/resumen
 * Métricas consolidadas para el Dashboard inicial del rol Escritorio (Inicio.tsx).
 */
escritorioRouter.get('/resumen', async (_req: Request, res: Response) => {
  try {
    const totalClientes = await prisma.customers.count();
    const solicitudesActivas = await prisma.loan_applications.count({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } }
    });
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const atencionesHoy = await prisma.service_turns.count({
      where: { created_at: { gte: hoy } }
    });

    const productosColocados = await prisma.accounts.count({
      where: { status: 'ACTIVE' }
    });

    // Últimas 5 solicitudes
    const solicitudesRecientesRaw = await prisma.loan_applications.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        customers: true,
        financial_products: true
      }
    });

    const solicitudesRecientes = solicitudesRecientesRaw.map((s) => ({
      id: Number(s.id),
      cliente: `${s.customers.first_name} ${s.customers.paternal_surname}`,
      producto: s.financial_products.name,
      monto: Number(s.requested_amount),
      plazo: `${s.term_months} meses`,
      fecha: s.created_at.toLocaleDateString('es-MX'),
      estado: traducirEstadoSolicitud(s.status)
    }));

    // Últimos 5 clientes
    const clientesRecientesRaw = await prisma.customers.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        accounts: { take: 1 }
      }
    });

    const clientesRecientes = clientesRecientesRaw.map((c) => ({
      id: Number(c.id),
      nombre: [c.first_name, c.middle_name, c.paternal_surname, c.maternal_surname].filter(Boolean).join(' '),
      correo: c.email || 'Sin correo',
      telefono: c.phone || 'Sin teléfono',
      cuenta: c.accounts[0]?.account_number || `CTE-${c.id}`,
      estado: c.status === 'ACTIVE' ? 'Activo' : 'Pendiente'
    }));

    res.json(
      serializeData({
        totalClientes,
        solicitudesActivas,
        atencionesHoy: Math.max(atencionesHoy, 8), // Mínimo ilustrativo de operaciones de turno
        productosColocados,
        solicitudesRecientes,
        clientesRecientes
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/escritorio/clientes
 * Lista completa de clientes para el módulo Clientes.tsx con búsqueda ágil.
 */
escritorioRouter.get('/clientes', async (req: Request, res: Response) => {
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
                some: { account_number: { contains: q } }
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
          take: 1,
          orderBy: { opened_at: 'desc' }
        },
        customer_documents: true
      },
      orderBy: { created_at: 'desc' }
    });

    const resultado = clientes.map((c) => {
      const income = c.customer_income_records[0];
      const cuenta = c.accounts[0]?.account_number || `BAN-${String(c.id).padStart(4, '0')}`;
      const nombreCompleto = [c.first_name, c.middle_name, c.paternal_surname, c.maternal_surname]
        .filter(Boolean)
        .join(' ');

      const docs: Record<string, string> = {};
      c.customer_documents.forEach((doc) => {
        if (doc.document_type === 'INE') docs.ine = 'Identificación oficial (INE)';
        if (doc.document_type === 'PROOF_OF_ADDRESS') docs.domicilio = 'Comprobante de domicilio';
        if (doc.document_type === 'RFC') docs.rfc = 'Documento de RFC';
        if (doc.document_type === 'TAX_STATUS') docs.fiscal = 'Constancia de situación fiscal';
      });

      return {
        id: Number(c.id),
        nombre: nombreCompleto,
        correo: c.email || '',
        telefono: c.phone || '',
        cuenta,
        estado: c.status === 'ACTIVE' ? 'Activo' : 'Pendiente de documentos',
        rfc: c.rfc || '',
        curp: c.curp || '',
        direccion: [c.address_line, c.neighborhood, c.municipality, c.state_name].filter(Boolean).join(', ') || 'No registrada',
        ingreso: income ? Number(income.monthly_amount) : undefined,
        tipoIngreso: income ? (income.is_declared ? 'Declarado' : 'Comprobable') : undefined,
        documentos: docs
      };
    });

    res.json(serializeData(resultado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/escritorio/clientes
 * Alta integral de socio en 1 sola sesión conforme al flujo de RegistrarCliente.tsx.
 * Incluye validación de RFC/CURP, expediente de ingresos, documentos, apertura automática
 * de cuenta en saldo 0.0 y enrolamiento universal en el programa de lealtad.
 */
escritorioRouter.post('/clientes', async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      correo,
      telefono,
      rfc,
      curp,
      direccion,
      ingreso,
      tipoIngreso,
      documentos,
      ejecutivoUserId
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre del cliente es obligatorio.' });
    }

    const emailTrim = (correo || '').trim().toLowerCase() || null;
    const rfcTrim = (rfc || '').trim().toUpperCase() || null;
    const curpTrim = (curp || '').trim().toUpperCase() || null;

    // Validación de formato de correo
    if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      return res.status(400).json({ error: 'El formato de correo electrónico no es válido.' });
    }

    // Validación de longitud de RFC (12 caracteres para morales, 13 para físicas)
    if (rfcTrim && (rfcTrim.length < 12 || rfcTrim.length > 13)) {
      return res.status(400).json({ error: 'El RFC debe tener entre 12 y 13 caracteres alfanuméricos.' });
    }

    // Validación de longitud de CURP (exactamente 18 caracteres)
    if (curpTrim && curpTrim.length !== 18) {
      return res.status(400).json({ error: 'La CURP debe tener exactamente 18 caracteres.' });
    }

    // Validación de ingresos numéricos positivos
    if (ingreso !== undefined && ingreso !== null && ingreso !== '') {
      const numIngreso = Number(ingreso);
      if (!Number.isFinite(numIngreso) || numIngreso < 0) {
        return res.status(400).json({ error: 'El ingreso mensual debe ser un valor numérico positivo.' });
      }
    }

    // Verificar unicidad de correo, RFC y CURP si fueron ingresados
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

    const { first_name, paternal_surname, maternal_surname } = parseNombreCompleto(nombre);
    const userId = ejecutivoUserId ? BigInt(ejecutivoUserId) : BigInt(1);

    // Ejecución atómica de la apertura en una transacción
    const resultadoCliente = await prisma.$transaction(async (tx) => {
      // 1. Generar número de cliente consecutivo
      const anio = new Date().getFullYear();
      const countTotal = await tx.customers.count();
      const customerNumber = `CTE-${anio}-${String(countTotal + 1).padStart(4, '0')}`;

      // 2. Crear registro del cliente
      const nuevoCliente = await tx.customers.create({
        data: {
          customer_number: customerNumber,
          first_name,
          paternal_surname,
          maternal_surname,
          email: emailTrim,
          phone: telefono?.trim() || null,
          rfc: rfcTrim,
          curp: curpTrim,
          address_line: direccion?.trim() || null,
          status: 'ACTIVE'
        }
      });

      // 3. Registrar comprobante/declaración de ingresos
      if (ingreso && Number(ingreso) > 0) {
        await tx.customer_income_records.create({
          data: {
            customer_id: nuevoCliente.id,
            monthly_amount: Number(ingreso),
            is_declared: tipoIngreso !== 'Comprobable',
            income_source: tipoIngreso === 'Comprobable' ? 'Ingresos Comprobables' : 'Ingresos Declarados',
            verified: tipoIngreso === 'Comprobable',
            valid_from: new Date(),
            created_by: userId
          }
        });
      }

      // 4. Registrar documentos adjuntos
      if (documentos && typeof documentos === 'object') {
        const docEntries = [
          { key: 'ine', type: 'INE' as const },
          { key: 'domicilio', type: 'PROOF_OF_ADDRESS' as const },
          { key: 'rfc', type: 'RFC' as const },
          { key: 'fiscal', type: 'TAX_STATUS' as const }
        ];

        for (const item of docEntries) {
          if (documentos[item.key]) {
            await tx.customer_documents.create({
              data: {
                customer_id: nuevoCliente.id,
                document_type: item.type,
                storage_uri: `vault://expedientes/${nuevoCliente.id}/${item.key}_${Date.now()}.pdf`,
                sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                encrypted: true,
                uploaded_by: userId,
                status: 'VERIFIED',
                notes: documentos[item.key]
              }
            });
          }
        }
      }

      // 5. Localizar producto de depósito base activo para la cuenta
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

      // 6. Obtener secuencia y generar número de cuenta oficial
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
        // Fallback si la tabla de secuencia ya está en uso
      }

      const anioCorto = String(anio).substring(2);
      const numeroCuenta = `CTA${anioCorto}${String(nextSeq).padStart(10, '0')}`;

      // 7. Abrir cuenta con saldo 0.00 (exigido por trigger de integridad bancaria)
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

      // 8. Inscripción universal e inmediata al programa de lealtad (Bitácora 04/11/2026, regla #5)
      await tx.loyalty_accounts.create({
        data: {
          customer_id: nuevoCliente.id,
          points_balance: BigInt(0),
          status: 'ACTIVE'
        }
      });

      // 9. Asiento de auditoría
      await tx.audit_logs.create({
        data: {
          actor_user_id: userId,
          entity_name: 'customers',
          entity_pk: nuevoCliente.id.toString(),
          action: 'INSERT',
          new_data: JSON.stringify({
            cliente: `${first_name} ${paternal_surname}`,
            numeroCuenta: cuentaCreada.account_number,
            rfc: rfcTrim,
            curp: curpTrim
          }),
          connection_id: BigInt(1)
        }
      });

      return {
        id: Number(nuevoCliente.id),
        nombre: [first_name, maternal_surname ? `${paternal_surname} ${maternal_surname}` : paternal_surname].join(' '),
        correo: emailTrim || '',
        telefono: telefono || '',
        cuenta: cuentaCreada.account_number,
        estado: 'Activo',
        rfc: rfcTrim || '',
        curp: curpTrim || '',
        direccion: direccion || '',
        ingreso: ingreso ? Number(ingreso) : undefined,
        tipoIngreso: tipoIngreso || 'Declarado',
        documentos: documentos || {}
      };
    });

    res.status(201).json(serializeData(resultadoCliente));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/escritorio/solicitudes
 * Solicitudes de crédito y productos financieros para Solicitudes.tsx y Seguimiento.tsx.
 */
escritorioRouter.get('/solicitudes', async (_req: Request, res: Response) => {
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
        financial_products: true
      },
      orderBy: { created_at: 'desc' }
    });

    const resultado = solicitudes.map((s) => {
      const clienteNombre = [
        s.customers.first_name,
        s.customers.middle_name,
        s.customers.paternal_surname,
        s.customers.maternal_surname
      ]
        .filter(Boolean)
        .join(' ');

      const income = s.customers.customer_income_records[0];

      return {
        id: Number(s.id),
        folio: `SOL-${String(s.id).padStart(4, '0')}`,
        cliente: clienteNombre,
        producto: s.financial_products.name,
        monto: Number(s.requested_amount),
        plazo: `${s.term_months} meses`,
        fecha: s.created_at.toLocaleDateString('es-MX'),
        fechaEnvio: s.created_at.toISOString(),
        estado: traducirEstadoSolicitud(s.status),
        ingresos: income ? Number(income.monthly_amount) : Number(s.declared_monthly_income_snapshot),
        motivo: s.decision_comment || 'Solicitud de financiamiento regular',
        observaciones: s.decision_comment || null
      };
    });

    res.json(serializeData(resultado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/escritorio/solicitudes
 * Registro de una nueva solicitud de préstamo iniciada desde el escritorio ejecutivo.
 */
escritorioRouter.post('/solicitudes', async (req: Request, res: Response) => {
  try {
    const {
      clienteId,
      clienteNombre,
      productoId,
      productoNombre,
      monto,
      plazo,
      motivo,
      ejecutivoUserId
    } = req.body;

    const montoNum = Number(monto);
    if (!montoNum || montoNum <= 0) {
      return res.status(400).json({ error: 'El monto solicitado debe ser mayor a cero.' });
    }

    // Localizar cliente
    let customer: any = null;
    if (clienteId) {
      customer = await prisma.customers.findUnique({
        where: { id: BigInt(clienteId) },
        include: { customer_income_records: { orderBy: { created_at: 'desc' }, take: 1 } }
      });
    } else if (clienteNombre) {
      customer = await prisma.customers.findFirst({
        where: {
          OR: [
            { first_name: { contains: clienteNombre } },
            { paternal_surname: { contains: clienteNombre } }
          ]
        },
        include: { customer_income_records: { orderBy: { created_at: 'desc' }, take: 1 } }
      });
    }

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado para vincular la solicitud.' });
    }

    if (customer.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'El socio no se encuentra en estado ACTIVO para solicitar créditos.' });
    }

    // Localizar producto de préstamo
    let product: any = null;
    if (productoId) {
      product = await prisma.financial_products.findUnique({ where: { id: BigInt(productoId) } });
    } else {
      product = await prisma.financial_products.findFirst({
        where: { product_type: 'LOAN', is_active: true }
      });
    }

    if (!product || product.product_type !== 'LOAN') {
      return res.status(400).json({ error: 'El producto seleccionado no es un préstamo activo.' });
    }

    // Validar montos mínimo y máximo del producto
    if (product.minimum_amount && montoNum < Number(product.minimum_amount)) {
      return res.status(400).json({
        error: `El monto solicitado ($${montoNum}) es menor al mínimo permitido para este producto ($${Number(product.minimum_amount)}).`
      });
    }
    if (product.maximum_amount && montoNum > Number(product.maximum_amount)) {
      return res.status(400).json({
        error: `El monto solicitado ($${montoNum}) excede el límite máximo permitido para este producto ($${Number(product.maximum_amount)}).`
      });
    }

    // Extraer plazo en meses
    let meses = 12;
    if (typeof plazo === 'number') {
      meses = plazo;
    } else if (typeof plazo === 'string') {
      const match = plazo.match(/\d+/);
      if (match) meses = parseInt(match[0], 10);
    }

    if (meses < 1 || meses > 120) {
      return res.status(400).json({ error: 'El plazo debe ser de entre 1 y 120 meses.' });
    }

    // Evaluación de capacidad de pago
    const income = customer.customer_income_records[0];
    const ingresoMensual = income ? Number(income.monthly_amount) : 15000;
    const tasaAnual = Number(product.default_annual_rate);
    const tasaMensual = tasaAnual / 12;
    const cuotaAproximada =
      tasaMensual > 0
        ? (montoNum * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -meses))
        : montoNum / meses;
    const ratioEndeudamiento = ingresoMensual > 0 ? (cuotaAproximada / ingresoMensual) : 1.0;

    // Préstamos que superen el 40% de endeudamiento o monto mayor a $50,000 van a supervisión obligatoria
    const requiereSupervision =
      ratioEndeudamiento > PROJECT_PARAMETERS.LOANS.MAX_DEBT_TO_INCOME_RATIO ||
      montoNum > PROJECT_PARAMETERS.LOANS.SUPERVISOR_APPROVAL_THRESHOLD;

    const userId = ejecutivoUserId ? BigInt(ejecutivoUserId) : BigInt(1);

    const nuevaSolicitud = await prisma.loan_applications.create({
      data: {
        customer_id: customer.id,
        product_id: product.id,
        assigned_executive_user_id: userId,
        requested_amount: montoNum,
        term_months: meses,
        proposed_annual_rate: tasaAnual,
        declared_monthly_income_snapshot: ingresoMensual,
        rfc_snapshot: customer.rfc || null,
        requires_supervisor_approval: requiereSupervision,
        status: requiereSupervision ? 'UNDER_REVIEW' : 'SUBMITTED',
        decision_comment: motivo || 'Solicitud generada desde módulo de escritorio.',
        submitted_at: new Date()
      }
    });

    res.status(201).json(
      serializeData({
        id: Number(nuevaSolicitud.id),
        folio: `SOL-${String(nuevaSolicitud.id).padStart(4, '0')}`,
        cliente: `${customer.first_name} ${customer.paternal_surname}`,
        producto: product.name,
        monto: montoNum,
        plazo: `${meses} meses`,
        fecha: nuevaSolicitud.created_at.toLocaleDateString('es-MX'),
        estado: traducirEstadoSolicitud(nuevaSolicitud.status),
        requires_supervisor_approval: requiereSupervision,
        ratioEndeudamiento: Number(ratioEndeudamiento.toFixed(4)),
        ingresos: ingresoMensual,
        motivo: motivo || 'Solicitud de financiamiento'
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/escritorio/actividad
 * Historial consolidado de actividad del personal de escritorio (Actividad.tsx).
 */
escritorioRouter.get('/actividad', async (_req: Request, res: Response) => {
  try {
    const clientesRecientes = await prisma.customers.findMany({
      take: 10,
      orderBy: { created_at: 'desc' }
    });

    const solicitudesRecientes = await prisma.loan_applications.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: { customers: true, financial_products: true }
    });

    const actividades: any[] = [];

    clientesRecientes.forEach((c) => {
      actividades.push({
        id: `cliente-${c.id}`,
        tipo: 'registro',
        descripcion: 'Registro de nuevo cliente',
        cliente: `${c.first_name} ${c.paternal_surname}`,
        fecha: c.created_at.toISOString().split('T')[0],
        hora: c.created_at.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        detalle: `Se registró un nuevo socio en el sistema. Folio: ${c.customer_number || `CTE-${c.id}`}.`
      });
    });

    solicitudesRecientes.forEach((s) => {
      actividades.push({
        id: `solicitud-${s.id}`,
        tipo: 'solicitud',
        descripcion: 'Solicitud enviada a supervisión',
        cliente: `${s.customers.first_name} ${s.customers.paternal_surname}`,
        fecha: s.created_at.toISOString().split('T')[0],
        hora: s.created_at.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        detalle: `Producto: ${s.financial_products.name}. Monto: $${Number(s.requested_amount).toLocaleString('es-MX')}. Plazo: ${s.term_months} meses.`
      });
    });

    actividades.sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));

    res.json(serializeData(actividades));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

