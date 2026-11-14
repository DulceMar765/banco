import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeData } from '../utils/serializer.js';

export const cajaRouter = Router();

/**
 * GET /api/caja/sesion-activa
 * Consulta la sesión de caja actualmente abierta
 */
cajaRouter.get('/sesion-activa', async (_req: Request, res: Response) => {
  try {
    const sesion = await prisma.cashier_sessions.findFirst({
      where: { status: 'OPEN' },
      include: {
        branches: true,
        app_users_cashier_sessions_cashier_user_idToapp_users: {
          include: { employees: true }
        }
      },
      orderBy: { opened_at: 'desc' }
    });

    if (!sesion) {
      return res.json({ abierta: false, sesion: null });
    }

    const cajero = sesion.app_users_cashier_sessions_cashier_user_idToapp_users;
    const cajeroNombre = cajero?.employees
      ? `${cajero.employees.first_name} ${cajero.employees.paternal_surname}`
      : cajero?.username || 'Cajero de Turno';

    res.json(
      serializeData({
        abierta: true,
        sesion: {
          id: sesion.id.toString(),
          fondoInicial: Number(sesion.opening_cash),
          abiertaEn: sesion.opened_at,
          cajero: cajeroNombre,
          sucursal: sesion.branches.name,
          observaciones: sesion.notes || ''
        }
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar sesión de caja: ' + error.message });
  }
});

/**
 * POST /api/caja/apertura
 * Inicia una nueva jornada de caja con fondo inicial
 */
cajaRouter.post('/apertura', async (req: Request, res: Response) => {
  try {
    const { fondoInicial, observaciones, notas, cajeroId } = req.body;
    const montoInicial = Number(fondoInicial) || 0;

    const sesionExistente = await prisma.cashier_sessions.findFirst({
      where: { status: 'OPEN' }
    });

    if (sesionExistente) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una sesión de caja activa en el sistema. Debe cerrarse antes de iniciar una nueva.',
        message: 'Ya existe una sesión de caja activa en el sistema. Debe cerrarse antes de iniciar una nueva.'
      });
    }

    const branch = await prisma.branches.findFirst();
    const branchId = branch?.id || 1;

    let idCajero = cajeroId ? BigInt(cajeroId) : null;
    if (!idCajero) {
      const uCajero = await prisma.app_users.findFirst({ where: { email: 'cajero@banuat.local' } });
      idCajero = uCajero ? uCajero.id : 1n;
    }

    const nuevaSesion = await prisma.cashier_sessions.create({
      data: {
        branch_id: branchId,
        cashier_user_id: idCajero,
        opened_by_user_id: idCajero,
        opening_cash: montoInicial,
        status: 'OPEN',
        notes: observaciones || notas || 'Apertura de sesión de caja'
      }
    });

    res.status(201).json(
      serializeData({
        success: true,
        ok: true,
        mensaje: 'Apertura de caja realizada exitosamente.',
        message: 'Apertura de caja realizada exitosamente.',
        sesion: {
          id: nuevaSesion.id.toString(),
          session_number: `SES-${nuevaSesion.id}`,
          fondoInicial: montoInicial,
          status: 'OPEN'
        },
        sesionId: nuevaSesion.id.toString(),
        fondoInicial: montoInicial
      })
    );
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error al abrir caja: ' + error.message,
      message: 'Error al abrir caja: ' + error.message
    });
  }
});

/**
 * POST /api/caja/cierre
 * Finaliza la jornada de caja con arqueo de efectivo contado
 */
cajaRouter.post('/cierre', async (req: Request, res: Response) => {
  try {
    const { efectivoContado, observaciones, notas, closedByUserId } = req.body;

    const sesionActiva = await prisma.cashier_sessions.findFirst({
      where: { status: 'OPEN' }
    });

    if (!sesionActiva) {
      return res.status(404).json({
        success: false,
        error: 'No hay ninguna sesión de caja abierta para cerrar.',
        message: 'No hay ninguna sesión de caja abierta para cerrar.'
      });
    }

    const montoContado = Number(efectivoContado);
    if (isNaN(montoContado) || montoContado < 0) {
      return res.status(400).json({
        success: false,
        error: 'Debe ingresar un monto válido de efectivo contado.',
        message: 'Debe ingresar un monto válido de efectivo contado.'
      });
    }

    const closerId = closedByUserId ? BigInt(closedByUserId) : sesionActiva.cashier_user_id;

    // Calcular balance teórico
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const txs = await prisma.financial_transactions.findMany({
      where: { created_at: { gte: inicioDia } }
    });
    let totalDep = 0, totalRet = 0, totalPag = 0;
    for (const t of txs) {
      const m = Number(t.amount);
      if (t.transaction_type === 'ACCOUNT_DEPOSIT') totalDep += m;
      else if (t.transaction_type === 'ACCOUNT_WITHDRAWAL') totalRet += m;
      else if (t.transaction_type === 'LOAN_PAYMENT') totalPag += m;
    }
    const balanceTeorico = Number(sesionActiva.opening_cash) + totalDep + totalPag - totalRet;
    const diferencia = montoContado - balanceTeorico;

    await prisma.cashier_sessions.update({
      where: { id: sesionActiva.id },
      data: {
        status: 'CLOSED',
        counted_cash: montoContado,
        closed_by_user_id: closerId,
        closed_at: new Date(),
        notes: (observaciones || notas) ? `${sesionActiva.notes || ''} | Cierre: ${observaciones || notas}` : sesionActiva.notes
      }
    });

    res.json({
      success: true,
      ok: true,
      mensaje: 'Cierre de caja completado satisfactoriamente.',
      message: 'Cierre de caja completado satisfactoriamente.',
      cierre: {
        efectivoContado: montoContado,
        balanceTeorico,
        diferencia,
        status: 'CLOSED'
      },
      efectivoContado: montoContado,
      diferencia
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error al cerrar caja: ' + error.message,
      message: 'Error al cerrar caja: ' + error.message
    });
  }
});

/**
 * GET /api/caja/resumen
 * Métricas financieras y arqueo en vivo de la jornada
 */
cajaRouter.get('/resumen', async (_req: Request, res: Response) => {
  try {
    const sesionActiva = await prisma.cashier_sessions.findFirst({
      where: { status: 'OPEN' },
      include: {
        app_users_cashier_sessions_cashier_user_idToapp_users: {
          include: { employees: true }
        }
      },
      orderBy: { opened_at: 'desc' }
    });

    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const transaccionesHoy = await prisma.financial_transactions.findMany({
      where: {
        created_at: { gte: inicioDia }
      }
    });

    let totalDepositos = 0;
    let totalRetiros = 0;
    let totalPagosPrestamo = 0;

    for (const t of transaccionesHoy) {
      const monto = Number(t.amount);
      if (t.transaction_type === 'ACCOUNT_DEPOSIT') totalDepositos += monto;
      else if (t.transaction_type === 'ACCOUNT_WITHDRAWAL') totalRetiros += monto;
      else if (t.transaction_type === 'LOAN_PAYMENT') totalPagosPrestamo += monto;
    }

    const fondoInicial = sesionActiva ? Number(sesionActiva.opening_cash) : 0;
    const saldoDisponible = fondoInicial + totalDepositos + totalPagosPrestamo - totalRetiros;

    const cajeroUser = sesionActiva?.app_users_cashier_sessions_cashier_user_idToapp_users;
    let cajeroNombre = 'Marcos Delgado';
    if (cajeroUser?.employees) {
      cajeroNombre = `${cajeroUser.employees.first_name} ${cajeroUser.employees.paternal_surname}`;
    }

    const numDepositos = transaccionesHoy.filter((t) => t.transaction_type === 'ACCOUNT_DEPOSIT').length;
    const numRetiros = transaccionesHoy.filter((t) => t.transaction_type === 'ACCOUNT_WITHDRAWAL').length;
    const numPagos = transaccionesHoy.filter((t) => t.transaction_type === 'LOAN_PAYMENT').length;

    const resumenObj = {
      cajero: cajeroNombre,
      caja: 'Caja 01 - Principal',
      estadoCaja: sesionActiva ? 'ABIERTA' : 'CERRADA',
      fondoInicial,
      totalEntradas: totalDepositos + totalPagosPrestamo,
      totalSalidas: totalRetiros,
      saldoEfectivo: saldoDisponible,
      saldoDisponible,
      totalDepositos,
      totalRetiros,
      totalPagosPrestamo,
      operacionesHoy: transaccionesHoy.length,
      operaciones: {
        total: transaccionesHoy.length,
        depositos: numDepositos,
        retiros: numRetiros,
        pagos: numPagos
      },
      horaApertura: sesionActiva ? sesionActiva.opened_at : null
    };

    res.json({
      success: true,
      ok: true,
      resumen: resumenObj,
      ...resumenObj
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener resumen de caja: ' + error.message,
      message: 'Error al obtener resumen de caja: ' + error.message
    });
  }
});

/**
 * GET /api/caja/movimientos
 * Historial de movimientos de la jornada
 */
cajaRouter.get('/movimientos', async (_req: Request, res: Response) => {
  try {
    const movimientos = await prisma.financial_transactions.findMany({
      include: {
        customers: true,
        account_movements: true
      },
      orderBy: { created_at: 'desc' },
      take: 50
    });

    const formateados = movimientos.map((m) => {
      const esEntrada = m.transaction_type === 'ACCOUNT_DEPOSIT' || m.transaction_type === 'LOAN_PAYMENT';
      const tipoLabel =
        m.transaction_type === 'ACCOUNT_DEPOSIT'
          ? 'Depósito'
          : m.transaction_type === 'ACCOUNT_WITHDRAWAL'
          ? 'Retiro'
          : m.transaction_type === 'LOAN_PAYMENT'
          ? 'Pago de préstamo'
          : 'Operación financiera';

      const titular = m.customers
        ? `${m.customers.first_name} ${m.customers.paternal_surname}`
        : 'Socio BANUAT';

      const fechaObj = new Date(m.created_at);

      return {
        id: m.id.toString(),
        tipo: tipoLabel,
        tipoCodigo: m.transaction_type,
        descripcion: `${tipoLabel} - Titular: ${titular}`,
        referencia: m.receipt_number,
        titular,
        direccion: esEntrada ? 'CREDIT' : 'DEBIT',
        monto: Number(m.amount),
        estado: m.status === 'POSTED' ? 'Aplicado' : m.status,
        entrada: esEntrada ? Number(m.amount) : null,
        salida: !esEntrada ? Number(m.amount) : null,
        fecha: fechaObj.toISOString(),
        hora: fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
    });

    res.json({
      success: true,
      ok: true,
      movimientos: serializeData(formateados),
      total: formateados.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error al consultar movimientos de caja: ' + error.message,
      message: 'Error al consultar movimientos de caja: ' + error.message
    });
  }
});

/**
 * GET /api/caja/consulta-cuenta/:termino
 * Busca una cuenta o socio por número de cuenta, RFC, CURP o nombre
 */
cajaRouter.get('/consulta-cuenta/:termino', async (req: Request, res: Response) => {
  try {
    const { termino } = req.params;
    const busqueda = termino.trim();

    // 1. Buscar por número de cuenta exacto
    let cuenta = await prisma.accounts.findUnique({
      where: { account_number: busqueda },
      include: {
        customers: true,
        financial_products: true
      }
    });

    // 2. Si no es número de cuenta, buscar por cliente
    if (!cuenta) {
      const cliente = await prisma.customers.findFirst({
        where: {
          OR: [
            { rfc: busqueda },
            { curp: busqueda },
            { customer_number: busqueda },
            { first_name: { contains: busqueda } },
            { paternal_surname: { contains: busqueda } }
          ]
        },
        include: {
          accounts: {
            include: { financial_products: true },
            take: 1
          }
        }
      });

      if (cliente && cliente.accounts.length > 0) {
        cuenta = {
          ...cliente.accounts[0],
          customers: cliente,
          financial_products: cliente.accounts[0].financial_products
        } as any;
      }
    }

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        error: 'Cuenta bancaria o socio no localizado con los datos proporcionados.',
        message: 'Cuenta bancaria o socio no localizado con los datos proporcionados.'
      });
    }

    const titular = `${cuenta.customers.first_name} ${cuenta.customers.paternal_surname} ${cuenta.customers.maternal_surname || ''}`.trim();

    const prestamos = await prisma.loans.findMany({
      where: { loan_applications: { customer_id: cuenta.customer_id } },
      include: { loan_applications: { include: { financial_products: true } } }
    });

    const prestamosFormateados = prestamos.map((p) => ({
      id: p.id.toString(),
      contract_number: p.contract_number,
      producto: p.loan_applications.financial_products.name,
      principal_amount: Number(p.principal_amount),
      principal_balance: Number(p.principal_balance),
      tasa: `${(Number(p.annual_interest_rate) * 100).toFixed(2)}% anual`,
      plazo: p.term_months,
      estado: p.status
    }));

    const txsCliente = await prisma.financial_transactions.findMany({
      where: { customer_id: cuenta.customer_id },
      take: 10,
      orderBy: { created_at: 'desc' }
    });

    const pagosFormateados = txsCliente.map((t) => ({
      id: t.id.toString(),
      folio: t.receipt_number,
      tipo: t.transaction_type === 'LOAN_PAYMENT' ? 'Abono a préstamo' : t.transaction_type === 'ACCOUNT_DEPOSIT' ? 'Depósito' : 'Retiro',
      monto: Number(t.amount),
      fecha: t.created_at.toISOString().slice(0, 10),
      estado: t.status
    }));

    const clienteData = {
      id: cuenta.customers.id.toString(),
      codigo: cuenta.customers.customer_number || 'CTE-2026',
      nombre: titular,
      email: cuenta.customers.email || '',
      correo: cuenta.customers.email || '',
      telefono: cuenta.customers.phone || '',
      identificacion: cuenta.customers.curp || cuenta.customers.rfc || 'Registrada',
      fechaRegistro: cuenta.customers.created_at ? cuenta.customers.created_at.toISOString().slice(0, 10) : '2026-01-01',
      estado: cuenta.customers.status
    };

    const cuentaData = {
      id: cuenta.id.toString(),
      numero: cuenta.account_number,
      tipo: cuenta.financial_products?.name || 'Cuenta de Ahorro',
      saldo: Number(cuenta.balance),
      estado: cuenta.status
    };

    res.json(
      serializeData({
        success: true,
        ok: true,
        cliente: clienteData,
        cuenta: cuentaData,
        prestamos: prestamosFormateados,
        pagos: pagosFormateados,
        cuentaId: cuenta.id.toString(),
        numeroCuenta: cuenta.account_number,
        titular,
        rfc: cuenta.customers.rfc || '',
        curp: cuenta.customers.curp || '',
        saldo: Number(cuenta.balance),
        estado: cuenta.status,
        producto: cuenta.financial_products?.name || 'Cuenta de Ahorro',
        customerId: cuenta.customer_id.toString()
      })
    );
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error en consulta de cuenta: ' + error.message,
      message: 'Error en consulta de cuenta: ' + error.message
    });
  }
});

/**
 * POST /api/caja/deposito
 * Registra un depósito en efectivo con asiento contable real en MySQL
 */
cajaRouter.post('/deposito', async (req: Request, res: Response) => {
  try {
    const { numeroCuenta, monto, observaciones, notas } = req.body;
    const cantidad = Number(monto);

    if (!numeroCuenta || isNaN(cantidad) || cantidad <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Número de cuenta y monto positivo son requeridos.',
        message: 'Número de cuenta y monto positivo son requeridos.'
      });
    }

    const cuenta = await prisma.accounts.findUnique({
      where: { account_number: numeroCuenta },
      include: { customers: true }
    });

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        error: 'La cuenta destino especificada no existe.',
        message: 'La cuenta destino especificada no existe.'
      });
    }

    if (cuenta.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'La cuenta no se encuentra activa para recibir depósitos.',
        message: 'La cuenta no se encuentra activa para recibir depósitos.'
      });
    }

    const sesionActiva = await prisma.cashier_sessions.findFirst({
      where: { status: 'OPEN' }
    });

    const folio = `DEP-${Date.now().toString().slice(-8)}`;

    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Registrar transacción financiera en estado PENDING
      const transaccion = await tx.financial_transactions.create({
        data: {
          receipt_number: folio,
          customer_id: cuenta.customer_id,
          cashier_session_id: sesionActiva ? sesionActiva.id : null,
          processed_by_user_id: sesionActiva ? sesionActiva.cashier_user_id : null,
          transaction_type: 'ACCOUNT_DEPOSIT',
          amount: cantidad,
          status: 'PENDING',
          notes: observaciones || notas || 'Depósito en efectivo en ventanilla'
        }
      });

      // 2. Registrar movimiento de cuenta (el trigger de BD actualiza automáticamente accounts.balance)
      await tx.account_movements.create({
        data: {
          account_id: cuenta.id,
          transaction_id: transaccion.id,
          movement_type: 'DEPOSIT',
          direction: 'CREDIT',
          amount: cantidad
        }
      });

      // 3. Confirmar transacción financiera a POSTED
      await tx.financial_transactions.update({
        where: { id: transaccion.id },
        data: {
          status: 'POSTED',
          posted_at: new Date()
        }
      });

      const cuentaActualizada = await tx.accounts.findUnique({
        where: { id: cuenta.id }
      });

      return { nuevoSaldo: Number(cuentaActualizada?.balance), folio };
    });

    const titular = `${cuenta.customers.first_name} ${cuenta.customers.paternal_surname}`;

    res.status(201).json({
      success: true,
      ok: true,
      mensaje: `Depósito de $${cantidad.toFixed(2)} MXN registrado exitosamente.`,
      message: `Depósito de $${cantidad.toFixed(2)} MXN registrado exitosamente.`,
      folio: resultado.folio,
      cuenta: cuenta.account_number,
      titular,
      nuevoSaldo: resultado.nuevoSaldo,
      saldoFinal: resultado.nuevoSaldo
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error al procesar depósito: ' + error.message,
      message: 'Error al procesar depósito: ' + error.message
    });
  }
});

/**
 * POST /api/caja/retiro
 * Registra un retiro de efectivo verificando saldo disponible
 */
cajaRouter.post('/retiro', async (req: Request, res: Response) => {
  try {
    const { numeroCuenta, monto, observaciones, notas } = req.body;
    const cantidad = Number(monto);

    if (!numeroCuenta || isNaN(cantidad) || cantidad <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Número de cuenta y monto positivo son requeridos.',
        message: 'Número de cuenta y monto positivo son requeridos.'
      });
    }

    const cuenta = await prisma.accounts.findUnique({
      where: { account_number: numeroCuenta },
      include: { customers: true }
    });

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        error: 'La cuenta bancaria especificada no existe.',
        message: 'La cuenta bancaria especificada no existe.'
      });
    }

    if (cuenta.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'La cuenta no se encuentra activa para operar retiros.',
        message: 'La cuenta no se encuentra activa para operar retiros.'
      });
    }

    const saldoActual = Number(cuenta.balance);
    if (saldoActual < cantidad) {
      return res.status(400).json({
        success: false,
        error: `Saldo insuficiente. El saldo disponible es de $${saldoActual.toFixed(2)} MXN.`,
        message: `Saldo insuficiente. El saldo disponible es de $${saldoActual.toFixed(2)} MXN.`
      });
    }

    const sesionActiva = await prisma.cashier_sessions.findFirst({
      where: { status: 'OPEN' }
    });

    const folio = `RET-${Date.now().toString().slice(-8)}`;

    const resultado = await prisma.$transaction(async (tx) => {
      const transaccion = await tx.financial_transactions.create({
        data: {
          receipt_number: folio,
          customer_id: cuenta.customer_id,
          cashier_session_id: sesionActiva ? sesionActiva.id : null,
          processed_by_user_id: sesionActiva ? sesionActiva.cashier_user_id : null,
          transaction_type: 'ACCOUNT_WITHDRAWAL',
          amount: cantidad,
          status: 'PENDING',
          notes: observaciones || notas || 'Retiro de efectivo en ventanilla'
        }
      });

      await tx.account_movements.create({
        data: {
          account_id: cuenta.id,
          transaction_id: transaccion.id,
          movement_type: 'WITHDRAWAL',
          direction: 'DEBIT',
          amount: cantidad
        }
      });

      await tx.financial_transactions.update({
        where: { id: transaccion.id },
        data: {
          status: 'POSTED',
          posted_at: new Date()
        }
      });

      const cuentaActualizada = await tx.accounts.findUnique({
        where: { id: cuenta.id }
      });

      return { nuevoSaldo: Number(cuentaActualizada?.balance), folio };
    });

    const titular = `${cuenta.customers.first_name} ${cuenta.customers.paternal_surname}`;

    res.status(201).json({
      success: true,
      ok: true,
      mensaje: `Retiro de $${cantidad.toFixed(2)} MXN ejecutado exitosamente.`,
      message: `Retiro de $${cantidad.toFixed(2)} MXN ejecutado exitosamente.`,
      folio: resultado.folio,
      cuenta: cuenta.account_number,
      titular,
      nuevoSaldo: resultado.nuevoSaldo,
      saldoFinal: resultado.nuevoSaldo
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error al procesar retiro: ' + error.message,
      message: 'Error al procesar retiro: ' + error.message
    });
  }
});

/**
 * GET /api/caja/prestamos-activos
 * Catálogo de préstamos activos para cobro de cuotas
 */
cajaRouter.get('/prestamos-activos', async (_req: Request, res: Response) => {
  try {
    const prestamos = await prisma.loans.findMany({
      where: { status: 'ACTIVE' },
      include: {
        loan_applications: {
          include: {
            customers: true,
            financial_products: true
          }
        }
      }
    });

    const formateados = prestamos.map((p) => {
      const cuota = (Number(p.principal_amount) * (1 + Number(p.annual_interest_rate))) / p.term_months;
      const cliente = p.loan_applications.customers;
      return {
        id: p.id.toString(),
        folio: p.contract_number,
        cliente: `${cliente.first_name} ${cliente.paternal_surname}`,
        producto: p.loan_applications.financial_products.name,
        saldoPendiente: Number(p.principal_balance),
        cuotaSugerida: Math.round(cuota * 100) / 100
      };
    });

    res.json({
      success: true,
      ok: true,
      prestamos: serializeData(formateados)
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error al consultar préstamos: ' + error.message,
      message: 'Error al consultar préstamos: ' + error.message
    });
  }
});

/**
 * POST /api/caja/pago-prestamo
 * Registra el cobro de una cuota de crédito y acredita puntos de lealtad (HU-38 a HU-42)
 */
cajaRouter.post('/pago-prestamo', async (req: Request, res: Response) => {
  try {
    const { prestamoId, referenciaPrestamo, monto, observaciones, notas } = req.body;
    const cantidad = Number(monto);

    if ((!prestamoId && !referenciaPrestamo) || isNaN(cantidad) || cantidad <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Referencia o ID de préstamo y monto válido son requeridos.',
        message: 'Referencia o ID de préstamo y monto válido son requeridos.'
      });
    }

    let prestamo = null;
    if (prestamoId) {
      prestamo = await prisma.loans.findUnique({
        where: { id: BigInt(prestamoId) },
        include: {
          loan_applications: {
            include: { customers: true }
          }
        }
      });
    } else if (referenciaPrestamo) {
      prestamo = await prisma.loans.findUnique({
        where: { contract_number: String(referenciaPrestamo).trim() },
        include: {
          loan_applications: {
            include: { customers: true }
          }
        }
      });
    }

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no localizado con la referencia indicada.',
        message: 'Préstamo no localizado con la referencia indicada.'
      });
    }

    const cliente = prestamo.loan_applications.customers;
    const folio = `PAG-${Date.now().toString().slice(-8)}`;
    const sesionActiva = await prisma.cashier_sessions.findFirst({ where: { status: 'OPEN' } });

    // Regla de lealtad acordada en bitácora 04/11/2026: 500 puntos por abono a préstamo
    const puntosAbono = BigInt(500);

    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Transacción financiera
      const transaccion = await tx.financial_transactions.create({
        data: {
          receipt_number: folio,
          customer_id: cliente.id,
          cashier_session_id: sesionActiva ? sesionActiva.id : null,
          processed_by_user_id: sesionActiva ? sesionActiva.cashier_user_id : null,
          transaction_type: 'LOAN_PAYMENT',
          amount: cantidad,
          status: 'POSTED',
          notes: observaciones || notas || `Abono a contrato ${prestamo.contract_number}`
        }
      });

      // 2. Registro de pago de préstamo
      await tx.loan_payments.create({
        data: {
          loan_id: prestamo.id,
          transaction_id: transaccion.id,
          total_amount: cantidad
        }
      });

      // 3. Actualizar saldo de préstamo
      const nuevoSaldoPrestamo = Math.max(0, Number(prestamo.principal_balance) - cantidad * 0.8);
      await tx.loans.update({
        where: { id: prestamo.id },
        data: {
          principal_balance: nuevoSaldoPrestamo,
          status: nuevoSaldoPrestamo === 0 ? 'PAID_OFF' : 'ACTIVE'
        }
      });

      // 4. Acreditar puntos de lealtad al socio
      const loyaltyAccount = await tx.loyalty_accounts.findFirst({
        where: { customer_id: cliente.id }
      });

      if (loyaltyAccount) {
        await tx.loyalty_accounts.update({
          where: { customer_id: cliente.id },
          data: { points_balance: loyaltyAccount.points_balance + puntosAbono }
        });

        await tx.loyalty_movements.create({
          data: {
            customer_id: cliente.id,
            related_transaction_id: transaccion.id,
            movement_type: 'EARN',
            points_delta: puntosAbono,
            description: `Puntos por abono puntual a préstamo ${prestamo.contract_number}`
          }
        });
      }

      return { nuevoSaldoPrestamo, folio };
    });

    const titular = `${cliente.first_name} ${cliente.paternal_surname}`;

    res.status(201).json({
      success: true,
      ok: true,
      mensaje: `Abono de $${cantidad.toFixed(2)} MXN registrado exitosamente.`,
      message: `Abono de $${cantidad.toFixed(2)} MXN registrado exitosamente.`,
      folio: resultado.folio,
      titular,
      nuevoSaldoPrestamo: resultado.nuevoSaldoPrestamo,
      saldoRestante: resultado.nuevoSaldoPrestamo,
      puntosGanados: Number(puntosAbono)
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error al registrar abono: ' + error.message,
      message: 'Error al registrar abono: ' + error.message
    });
  }
});
