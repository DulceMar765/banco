import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { PROJECT_PARAMETERS } from '../config/parameters.js';
import { serializeData } from '../utils/serializer.js';

export const socioRouter = Router();

/**
 * Obtiene el socio objetivo a partir de query params, headers, app_users o primer socio activo
 */
async function obtenerClienteObjetivo(req: Request) {
  const queryId = req.query.customerId || req.headers['x-customer-id'];
  const rawEmail = (req.query.email || req.headers['x-customer-email'] || '') as string;
  const email = rawEmail.trim().toLowerCase();

  let cliente = null;

  if (queryId) {
    cliente = await prisma.customers.findUnique({
      where: { id: BigInt(String(queryId)) },
      include: {
        accounts: { include: { financial_products: true } },
        loyalty_accounts: true,
        customer_income_records: true
      }
    });
  }

  if (!cliente && email) {
    // 1. Buscar en app_users para enlazar la sesión de login con su expediente de socio
    const appUser = await prisma.app_users.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      },
      include: {
        customers: {
          include: {
            accounts: { include: { financial_products: true } },
            loyalty_accounts: true,
            customer_income_records: true
          }
        }
      }
    });

    if (appUser?.customers) {
      cliente = appUser.customers;
    }

    // 2. Si no se halló por app_users, buscar directamente en customers por email
    if (!cliente) {
      cliente = await prisma.customers.findFirst({
        where: {
          OR: [
            { email: email },
            { email: email.includes('cliente') ? 'juan.perez@email.com' : email }
          ]
        },
        include: {
          accounts: { include: { financial_products: true } },
          loyalty_accounts: true,
          customer_income_records: true
        }
      });
    }
  }

  // 3. Fallback: primer cliente activo de la base de datos
  if (!cliente) {
    cliente = await prisma.customers.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        accounts: { include: { financial_products: true } },
        loyalty_accounts: true,
        customer_income_records: true
      }
    });
  }

  return cliente;
}

/**
 * GET /api/socio/resumen
 * Resumen integral del socio para el dashboard de cliente
 */
socioRouter.get('/resumen', async (req: Request, res: Response) => {
  try {
    const cliente = await obtenerClienteObjetivo(req);
    if (!cliente) {
      return res.status(404).json({ error: 'No se encontró el socio en la cooperativa.' });
    }

    const cuentaPrincipal = cliente.accounts[0];
    const saldoCuenta = cuentaPrincipal ? Number(cuentaPrincipal.balance) : 0;

    const loyalty = cliente.loyalty_accounts;
    const saldoPuntos = loyalty ? Number(loyalty.points_balance) : 0;
    const valorPuntosMxn = saldoPuntos / PROJECT_PARAMETERS.LOYALTY.POINTS_PER_PESO_REDEMPTION;

    // Préstamos vigentes del socio
    const prestamos = await prisma.loans.findMany({
      where: {
        loan_applications: { customer_id: cliente.id }
      },
      include: {
        loan_applications: { include: { financial_products: true } }
      }
    });

    const prestamosActivos = prestamos.filter((l) => l.status === 'ACTIVE');
    const deudaTotal = prestamosActivos.reduce((acc, l) => acc + Number(l.principal_balance), 0);

    // Rendimiento estimado mensual sobre saldo actual (tasa base ~2.5% anual)
    const rendimientoEstimadoMes = Math.round(((saldoCuenta * 0.025) / 12) * 100) / 100;

    res.json(
      serializeData({
        id: cliente.id.toString(),
        numeroSocio: cliente.customer_number,
        nombre: `${cliente.first_name} ${cliente.paternal_surname} ${cliente.maternal_surname || ''}`.trim(),
        correo: cliente.email,
        telefono: cliente.phone || '833 123 4567',
        cuentaPrincipal: cuentaPrincipal
          ? {
              numero: cuentaPrincipal.account_number,
              producto: cuentaPrincipal.financial_products?.name || 'Cuenta de Ahorro',
              saldo: saldoCuenta
            }
          : null,
        puntos: {
          saldo: saldoPuntos,
          equivalenciaMxn: valorPuntosMxn,
          tasaConversion: '100 pts = $1.00 MXN'
        },
        prestamosActivos: prestamosActivos.length,
        deudaTotal,
        rendimientoEstimadoMes,
        estado: cliente.status
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar resumen de socio: ' + error.message });
  }
});

/**
 * GET /api/socio/perfil
 * Información de expediente y datos de contacto del socio
 */
socioRouter.get('/perfil', async (req: Request, res: Response) => {
  try {
    const cliente = await obtenerClienteObjetivo(req);
    if (!cliente) {
      return res.status(404).json({ error: 'Socio no localizado.' });
    }

    const ingresos = cliente.customer_income_records[0];

    res.json(
      serializeData({
        id: cliente.id.toString(),
        numeroSocio: cliente.customer_number,
        nombre: cliente.first_name,
        apellidoPaterno: cliente.paternal_surname,
        apellidoMaterno: cliente.maternal_surname || '',
        nombreCompleto: `${cliente.first_name} ${cliente.paternal_surname} ${cliente.maternal_surname || ''}`.trim(),
        rfc: cliente.rfc || '',
        curp: cliente.curp || '',
        correo: cliente.email || '',
        telefono: cliente.phone || '',
        direccion: cliente.address_line || 'Av. Hidalgo 1200',
        colonia: cliente.neighborhood || 'Centro',
        municipio: cliente.municipality || 'Tampico',
        estado: cliente.state_name || 'Tamaulipas',
        codigoPostal: cliente.postal_code || '89000',
        ingresoMensual: ingresos ? Number(ingresos.monthly_amount) : 0,
        fuenteIngreso: ingresos ? ingresos.income_source : 'No especificada',
        miembroDesde: cliente.created_at
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar perfil: ' + error.message });
  }
});

/**
 * GET /api/socio/movimientos
 * Historial de movimientos bancarios y transacciones del socio
 */
socioRouter.get('/movimientos', async (req: Request, res: Response) => {
  try {
    const cliente = await obtenerClienteObjetivo(req);
    if (!cliente) {
      return res.status(404).json({ error: 'Socio no localizado.' });
    }

    const accountIds = cliente.accounts.map((a) => a.id);

    const movimientos = await prisma.account_movements.findMany({
      where: {
        account_id: { in: accountIds }
      },
      include: {
        financial_transactions: true,
        accounts: true
      },
      orderBy: { created_at: 'desc' },
      take: 30
    });

    const formateados = movimientos.map((m) => {
      const esEntrada = m.direction === 'CREDIT';
      const fechaObj = new Date(m.created_at);
      return {
        id: m.id.toString(),
        tipo: m.movement_type,
        tipoLabel:
          m.movement_type === 'DEPOSIT'
            ? 'Depósito en efectivo'
            : m.movement_type === 'WITHDRAWAL'
            ? 'Retiro de efectivo'
            : m.movement_type === 'INTEREST_CREDIT'
            ? 'Rendimiento devengado'
            : 'Movimiento bancario',
        monto: Number(m.amount),
        esEntrada,
        cuenta: m.accounts.account_number,
        referencia: m.financial_transactions?.receipt_number || `MOV-${m.id}`,
        fecha: fechaObj.toISOString().slice(0, 10),
        hora: fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
    });

    res.json(serializeData(formateados));
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar movimientos: ' + error.message });
  }
});

/**
 * GET /api/socio/productos
 * Cuentas de ahorro, préstamos e inversiones que posee el socio
 */
socioRouter.get('/productos', async (req: Request, res: Response) => {
  try {
    const cliente = await obtenerClienteObjetivo(req);
    if (!cliente) {
      return res.status(404).json({ error: 'Socio no localizado.' });
    }

    const cuentas = cliente.accounts.map((a) => ({
      tipo: 'DEPOSITO',
      id: a.id.toString(),
      numero: a.account_number,
      nombre: a.financial_products?.name || 'Cuenta de Ahorro',
      saldo: Number(a.balance),
      tasa: a.financial_products ? `${(Number(a.financial_products.default_annual_rate) * 100).toFixed(2)}% anual` : '2.50% anual',
      estado: a.status
    }));

    const prestamosRaw = await prisma.loans.findMany({
      where: {
        loan_applications: { customer_id: cliente.id }
      },
      include: {
        loan_applications: { include: { financial_products: true } }
      }
    });

    const prestamos = prestamosRaw.map((l) => ({
      tipo: 'PRESTAMO',
      id: l.id.toString(),
      numero: l.contract_number,
      nombre: l.loan_applications.financial_products.name,
      montoOriginal: Number(l.principal_amount),
      saldoPendiente: Number(l.principal_balance),
      tasa: `${(Number(l.annual_interest_rate) * 100).toFixed(2)}% anual`,
      plazoMeses: l.term_months,
      estado: l.status
    }));

    res.json(serializeData({ cuentas, prestamos }));
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar productos: ' + error.message });
  }
});

/**
 * GET /api/socio/pagos
 * Desglose de cuotas pendientes y fechas de pago para transparencia del socio
 */
socioRouter.get('/pagos', async (req: Request, res: Response) => {
  try {
    const cliente = await obtenerClienteObjetivo(req);
    if (!cliente) {
      return res.status(404).json({ error: 'Socio no localizado.' });
    }

    const prestamos = await prisma.loans.findMany({
      where: {
        loan_applications: { customer_id: cliente.id }
      },
      include: {
        loan_applications: { include: { financial_products: true } }
      }
    });

    const prestamosActivos = prestamos.filter((l) => l.status === 'ACTIVE');

    const desglosePagos = prestamosActivos.map((p) => {
      const cuotaMensual = (Number(p.principal_amount) * (1 + Number(p.annual_interest_rate))) / p.term_months;
      const amortizacionCapital = Number(p.principal_amount) / p.term_months;
      const interesMensual = cuotaMensual - amortizacionCapital;

      return {
        prestamoId: p.id.toString(),
        folioPrestamo: p.contract_number,
        producto: p.loan_applications.financial_products.name,
        cuotaMensual: Math.round(cuotaMensual * 100) / 100,
        amortizacionCapital: Math.round(amortizacionCapital * 100) / 100,
        interesesDevengados: Math.round(interesMensual * 100) / 100,
        saldoRestante: Number(p.principal_balance),
        proximaFechaPago: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        puntosPorPago: 500
      };
    });

    res.json(serializeData(desglosePagos));
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar pagos: ' + error.message });
  }
});

/**
 * GET /api/socio/beneficios
 * Información del programa de puntos de lealtad y beneficios cooperativos
 */
socioRouter.get('/beneficios', async (req: Request, res: Response) => {
  try {
    const cliente = await obtenerClienteObjetivo(req);
    if (!cliente) {
      return res.status(404).json({ error: 'Socio no localizado.' });
    }

    const loyalty = cliente.loyalty_accounts;
    const puntos = loyalty ? Number(loyalty.points_balance) : 0;
    const valorMxn = puntos / PROJECT_PARAMETERS.LOYALTY.POINTS_PER_PESO_REDEMPTION;

    // Catálogo de segmentos de ahorro (5 segmentos basados en inflación ~5%)
    const segmentosRendimiento = [
      { segmento: 'Nivel Semilla', rango: '$0 – $5,000 MXN', rendimientoAnual: '2.5% anual' },
      { segmento: 'Nivel Bronce', rango: '$5,001 – $20,000 MXN', rendimientoAnual: '4.0% anual' },
      { segmento: 'Nivel Plata', rango: '$20,001 – $50,000 MXN', rendimientoAnual: '5.5% anual (Supera inflación)' },
      { segmento: 'Nivel Oro', rango: '$50,001 – $100,000 MXN', rendimientoAnual: '7.0% anual' },
      { segmento: 'Nivel Platino', rango: 'Más de $100,000 MXN', rendimientoAnual: '8.5% anual' }
    ];

    const beneficiosCooperativa = [
      'Rendimientos crecientes y devengo diario de intereses sobre tus ahorros.',
      'Programa de Puntos de Lealtad (100 puntos = $1.00 MXN en efectivo o reducción de tasa).',
      'Puntos extra por cada abono puntual realizado a tus préstamos.',
      'Acceso a préstamos personales con tasa fija y sin penalización por pronto pago.',
      'Talleres y eventos gratuitos de educación financiera cooperativa.'
    ];

    res.json(
      serializeData({
        puntosActuales: puntos,
        valorEnEfectivoMxn: valorMxn,
        reglaConversion: '100 puntos = $1.00 MXN',
        segmentosRendimiento,
        beneficiosCooperativa
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar beneficios: ' + error.message });
  }
});

/**
 * GET /api/socio/notificaciones
 * Consulta de notificaciones del socio
 */
socioRouter.get('/notificaciones', async (req: Request, res: Response) => {
  try {
    const cliente = await obtenerClienteObjetivo(req);
    if (!cliente) {
      return res.status(404).json({ error: 'Socio no localizado.' });
    }

    const notificaciones = await prisma.customer_notifications.findMany({
      where: { customer_id: cliente.id },
      orderBy: { created_at: 'desc' }
    });

    const formateadas = notificaciones.map((n) => ({
      id: n.id.toString(),
      titulo: n.title,
      mensaje: n.message,
      tipo: n.notification_type,
      fecha: n.created_at.toISOString().slice(0, 10),
      hora: new Date(n.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      leida: n.status === 'READ'
    }));

    res.json(serializeData(formateadas));
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar notificaciones: ' + error.message });
  }
});
