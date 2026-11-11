import { prisma } from '../src/lib/prisma.js';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

type ResponseData = unknown;

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data: ResponseData = await response.json().catch(() => null);
  return { response, data };
}

function assert(condition: boolean, message: string, details?: unknown) {
  if (!condition) {
    throw new Error(`${message}${details ? `: ${JSON.stringify(details)}` : ''}`);
  }
  console.log(`✅ ${message}`);
}

async function main() {
  let clientes: Array<Record<string, unknown>>;

  const health = await request('/health');
  assert(health.response.ok, 'Backend conectado a MySQL');

  const clientesResponse = await request('/clientes');
  assert(clientesResponse.response.ok && Array.isArray(clientesResponse.data), 'Listado real de clientes disponible');
  clientes = clientesResponse.data as Array<Record<string, unknown>>;
  assert(clientes.length > 0, 'Hay datos de prueba para validar los flujos');

  const cliente = clientes[0];
  const clienteId = String(cliente.id);
  const productos = Array.isArray(cliente.productos) ? cliente.productos : [];
  assert(
    productos.some((producto) => (producto as Record<string, unknown>).tipo === 'Cuenta bancaria'),
    'Cliente de prueba tiene cuenta bancaria'
  );

  const lealtadClientes = await request('/lealtad/clientes');
  assert(lealtadClientes.response.ok && Array.isArray(lealtadClientes.data), 'Clientes con cuenta aparecen en lealtad');
  const socio = (lealtadClientes.data as Array<Record<string, unknown>>)
    .find((item) => String(item.id) === clienteId);
  assert(Boolean(socio), 'La inscripción no depende de movimientos iniciales');

  const lealtadAntes = await request('/lealtad/resumen');
  const metricas = (lealtadAntes.data as Record<string, any>).metricas;
  assert(
    (lealtadAntes.data as Record<string, any>).equivalencia?.puntos === 100,
    'Equivalencia fija: 100 puntos = $1 MXN'
  );
  assert(
    typeof metricas.puntosPorAhorro === 'number' && typeof metricas.puntosPorAbono === 'number',
    'Puntos por ahorro y abono provienen de configuración'
  );

  const cuenta = await prisma.accounts.findFirst({
    where: { customer_id: BigInt(clienteId), status: 'ACTIVE' }
  });
  const usuario = await prisma.app_users.findFirst({
    where: { email: 'supervisor@banuat.local' }
  });
  assert(Boolean(cuenta && usuario), 'Existen cuenta y usuario para operación de prueba');

  const receiptNumber = 'TEST-SAVINGS-001';
  let ahorro = await prisma.financial_transactions.findUnique({
    where: { receipt_number: receiptNumber }
  });
  if (!ahorro) {
    ahorro = await prisma.financial_transactions.create({
      data: {
        receipt_number: receiptNumber,
        customer_id: BigInt(clienteId),
        processed_by_user_id: usuario!.id,
        transaction_type: 'ACCOUNT_DEPOSIT',
        channel: 'SYSTEM',
        payment_method: 'TRANSFER',
        amount: 10,
        status: 'PENDING',
        notes: 'Operación de prueba automatizada'
      }
    });
    await prisma.account_movements.create({
      data: {
        transaction_id: ahorro.id,
        account_id: cuenta!.id,
        movement_type: 'DEPOSIT',
        direction: 'CREDIT',
        amount: 10
      }
    });
    await prisma.financial_transactions.update({
      where: { id: ahorro.id },
      data: { status: 'POSTED', posted_at: new Date() }
    });
  }

  const abonoReceipt = 'TEST-LOAN-PAYMENT-001';
  let abono = await prisma.financial_transactions.findUnique({
    where: { receipt_number: abonoReceipt }
  });
  if (!abono) {
    abono = await prisma.financial_transactions.create({
      data: {
        receipt_number: abonoReceipt,
        customer_id: BigInt(clienteId),
        processed_by_user_id: usuario!.id,
        transaction_type: 'LOAN_PAYMENT',
        channel: 'SYSTEM',
        payment_method: 'TRANSFER',
        amount: 10,
        status: 'POSTED',
        posted_at: new Date(),
        notes: 'Abono de prueba automatizado'
      }
    });
  }

  const operacionesDePrueba = [ahorro!.id, abono?.id].filter(
    (id): id is bigint => id !== undefined
  );
  const procesarPrimeraVez = await request('/lealtad/procesar', { method: 'POST', body: '{}' });
  assert(procesarPrimeraVez.response.ok, 'Procesamiento de puntos ejecutado');
  const movimientosDePrueba = await prisma.loyalty_movements.count({
    where: { related_transaction_id: { in: operacionesDePrueba } }
  });
  assert(movimientosDePrueba === 2, 'Cada operación de ahorro y abono recibe puntos');
  const procesarSegundaVez = await request('/lealtad/procesar', { method: 'POST', body: '{}' });
  assert(procesarSegundaVez.response.ok, 'Procesamiento de puntos repetido sin error');
  assert(
    Number((procesarSegundaVez.data as Record<string, unknown>).procesadas) === 0,
    'Procesamiento idempotente: la segunda ejecución no duplica puntos'
  );

  const beneficios = await request('/catalogos/beneficios');
  assert(beneficios.response.ok && Array.isArray(beneficios.data), 'Apartado de beneficios disponible');

  const reportes = await request('/reportes/operaciones');
  assert(reportes.response.ok && Array.isArray(reportes.data), 'Reporte de operaciones responde con datos reales');

  const solicitudes = await request('/prestamos/solicitudes');
  assert(solicitudes.response.ok && Array.isArray(solicitudes.data), 'Bandeja de préstamos disponible');

  const prestamosDispersados = await prisma.loan_applications.count({ where: { status: 'DISBURSED' } });
  assert(prestamosDispersados === 0, 'No existen desembolsos habilitados en esta fase');

  const totalClientes = await prisma.customers.count();
  assert(clientes.length === totalClientes, 'El total del directorio coincide con la BD');

  const movimientos = await prisma.loyalty_movements.findMany({
    where: { customer_id: BigInt(clienteId) },
    select: { related_transaction_id: true }
  });
  const transacciones = movimientos
    .map((movimiento) => movimiento.related_transaction_id?.toString())
    .filter(Boolean);
  assert(new Set(transacciones).size === transacciones.length, 'No hay puntos duplicados por operación');

  console.log('\n🎉 Todas las pruebas de requerimientos backend pasaron.');
}

main()
  .catch((error) => {
    console.error(`\n❌ Prueba backend fallida: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
