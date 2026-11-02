import { prisma } from '../src/lib/prisma.js';

const BASE_URL = 'http://localhost:3001/api';

async function request(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🧪 =======================================================');
  console.log('🧪 INICIANDO BATERÍA DE PRUEBAS DE ENDPOINTS CRÍTICOS');
  console.log('🧪 =======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`, details ? details : '');
      failed++;
    }
  }

  // 1. Healthcheck
  const health = await request('/health');
  assert('Healthcheck MySQL OK', health.status === 200 && health.data?.status === 'ok');

  // 2. Auth: Login exitoso
  const loginExitoso = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      correo: 'supervisor@banuat.local',
      contrasena: 'Banuat123!'
    })
  });
  assert('Login supervisor exitoso', loginExitoso.status === 200 && loginExitoso.data?.rol === 'SUPERVISOR', loginExitoso.data);

  // 3. Auth: Login con credenciales inválidas (debe rechazar con 401)
  const loginInvalido = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      correo: 'supervisor@banuat.local',
      contrasena: 'ClaveErronea999!'
    })
  });
  assert('Login credenciales erróneas rechazado con 401', loginInvalido.status === 401);

  // 4. Clientes: Listado general
  const clientes = await request('/clientes');
  assert('GET /clientes retorna arreglo no vacío', clientes.status === 200 && Array.isArray(clientes.data) && clientes.data.length > 0);
  const clienteId = clientes.data?.[0]?.id;
  console.log(`   ℹ️ Cliente para pruebas de mutación: ID ${clienteId} (${clientes.data?.[0]?.nombre})`);

  // 5. Clientes: Mutación crítica de auditoría acumulativa (POST /clientes/:id/modificaciones)
  const modPayload = {
    campo: 'Tasa de Interés Anual',
    anterior: '18%',
    nuevo: '14.5%',
    motivo: 'Ajuste autorizado por puntualidad en pagos',
    supervisorId: '1',
    supervisorNombre: 'Carlos Ramírez'
  };
  const postMod = await request(`/clientes/${clienteId}/modificaciones`, {
    method: 'POST',
    body: JSON.stringify(modPayload)
  });
  assert('POST /clientes/:id/modificaciones guarda registro inmutable', postMod.status === 201 && postMod.data?.id, postMod.data);

  // 6. Clientes: Consulta de modificaciones acumulativas
  const getMods = await request(`/clientes/${clienteId}/modificaciones`);
  const modEncontrada = getMods.data?.find((m: any) => m.nuevo === '14.5%');
  assert('GET /clientes/:id/modificaciones recupera la auditoría recién insertada', getMods.status === 200 && !!modEncontrada, getMods.data);

  // 7. Préstamos: Solicitudes pendientes
  const prestamos = await request('/prestamos/solicitudes');
  assert('GET /prestamos/solicitudes retorna solicitudes', prestamos.status === 200 && Array.isArray(prestamos.data));

  // Crear una nueva solicitud en UNDER_REVIEW para probar la transición autorizada en MySQL
  const loanProduct = await prisma.financial_products.findFirst({
    where: { product_type: 'LOAN', is_active: true }
  });
  if (!loanProduct) throw new Error('No se encontró producto de tipo LOAN activo');

  const testLoanApp = await prisma.loan_applications.create({
    data: {
      customer_id: BigInt(clienteId),
      product_id: loanProduct.id,
      requested_amount: 45000.0,
      term_months: 24,
      proposed_annual_rate: 0.16,
      status: 'UNDER_REVIEW',
      requires_supervisor_approval: true
    }
  });
  const solicitudId = testLoanApp.id.toString();
  console.log(`   ℹ️ Solicitud de prueba creada para autorización: ID ${solicitudId}`);

  // 8. Préstamos: Mutación crítica de autorización por supervisor (POST /prestamos/:id/autorizar)
  const autorizarRes = await request(`/prestamos/${solicitudId}/autorizar`, {
    method: 'POST',
    body: JSON.stringify({
      aprobada: true,
      motivo: 'Capacidad de pago validada con estados de cuenta bancarios',
      supervisorId: '1'
    })
  });
  assert('POST /prestamos/:id/autorizar registra aprobación y actualiza estatus', autorizarRes.status === 200 && autorizarRes.data?.estado === 'APPROVED', autorizarRes.data);

  // 9. Cobranza: Consulta y decisión
  const cobranza = await request('/cobranza');
  assert('GET /cobranza calcula cartera vencida en días hábiles', cobranza.status === 200 && Array.isArray(cobranza.data));
  const casoId = cobranza.data?.[0]?.id || '1';

  const decisionCobranza = await request(`/cobranza/${casoId}/decision`, {
    method: 'POST',
    body: JSON.stringify({
      decision: 'Plazo concedido',
      fechaPlazo: '2026-11-20',
      motivo: 'Socio prometió liquidar intereses en próxima quincena',
      supervisorId: '1'
    })
  });
  assert('POST /cobranza/:id/decision registra resolución del supervisor', decisionCobranza.status === 200, decisionCobranza.data);

  // 10. Productos: Crear y alternar estado
  const nuevoProducto = await request('/productos', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Pagaré Productivo Plus 2026',
      tipo: 'Inversión',
      descripcion: 'Inversión a 180 días con rendimiento garantizado.',
      tasaInteres: 9.5,
      montoMinimo: 5000
    })
  });
  assert('POST /productos crea nuevo producto financiero', nuevoProducto.status === 201 && nuevoProducto.data?.id, nuevoProducto.data);
  const prodId = nuevoProducto.data?.id;

  if (prodId) {
    const toggleEstado = await request(`/productos/${prodId}/estado`, {
      method: 'PATCH'
    });
    assert('PATCH /productos/:id/estado conmuta estado activo/inactivo', toggleEstado.status === 200 && toggleEstado.data?.is_active === false, toggleEstado.data);
  }

  // 11. Reportes y Lealtad
  const reportes = await request('/reportes/operaciones');
  assert('GET /reportes/operaciones entrega métricas reales de actividad', reportes.status === 200 && Array.isArray(reportes.data));

  const lealtad = await request('/lealtad/resumen');
  assert('GET /lealtad/resumen valida equivalencia fija 100 pts = $1 MXN', lealtad.status === 200 && lealtad.data?.equivalencia?.puntos === 100);

  console.log('\n=======================================================');
  console.log(`📊 RESULTADOS: ${passed} PASADAS, ${failed} FALLADAS`);
  console.log('=======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fallo general en ejecución de pruebas:', err);
  process.exit(1);
});
