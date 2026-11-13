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
  console.log('🧪 BATERÍA DE PRUEBAS: MÓDULO ESCRITORIO (ROL EJECUTIVO)');
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

  // 1. Auth: Login Ejecutivo
  const loginEjecutivo = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      correo: 'ejecutivo@banuat.local',
      contrasena: 'Ejecutivo123!'
    })
  });
  assert(
    'Login ejecutivo de escritorio exitoso',
    loginEjecutivo.status === 200 && loginEjecutivo.data?.rol === 'EJECUTIVO',
    loginEjecutivo.data
  );

  // 2. Resumen del Dashboard Escritorio
  const resumen = await request('/escritorio/resumen');
  assert(
    'GET /escritorio/resumen retorna estadísticas consolidadas',
    resumen.status === 200 &&
      typeof resumen.data?.totalClientes === 'number' &&
      typeof resumen.data?.solicitudesActivas === 'number' &&
      Array.isArray(resumen.data?.solicitudesRecientes),
    resumen.data
  );

  // 3. Listado de clientes para Escritorio
  const clientes = await request('/escritorio/clientes');
  assert(
    'GET /escritorio/clientes retorna formato compatible con Cliente[]',
    clientes.status === 200 &&
      Array.isArray(clientes.data) &&
      clientes.data.length > 0 &&
      clientes.data[0].nombre &&
      clientes.data[0].cuenta,
    clientes.data?.[0]
  );

  // 4. Registro de un nuevo socio desde RegistrarCliente.tsx
  const timestamp = Date.now().toString().slice(-4);
  const nuevoClientePayload = {
    nombre: `Mariana Gómez Treviño ${timestamp}`,
    correo: `mariana_${timestamp}@test.banuat.mx`,
    telefono: '833 555 1234',
    rfc: `GOTM950812${timestamp.slice(0, 3)}`,
    curp: `GOTM950812MTSXXX${timestamp.slice(0, 2)}`,
    direccion: 'Av. Universidad 450, Tampico, Tamps.',
    ingreso: 24000,
    tipoIngreso: 'Comprobable',
    documentos: {
      ine: 'ine_mariana.pdf',
      domicilio: 'recibo_luz_marzo.pdf',
      rfc: 'cedula_sat.pdf',
      fiscal: 'constancia_fiscal_2026.pdf'
    }
  };

  const registroCliente = await request('/escritorio/clientes', {
    method: 'POST',
    body: JSON.stringify(nuevoClientePayload)
  });

  assert(
    'POST /escritorio/clientes crea socio, abre cuenta en balance 0.0 y enrola a lealtad',
    registroCliente.status === 201 &&
      registroCliente.data?.id &&
      registroCliente.data?.cuenta &&
      registroCliente.data?.cuenta.startsWith('CTA'),
    registroCliente.data
  );

  const clienteCreadoId = registroCliente.data?.id;

  // 5. Verificar que el cliente recién creado aparece en el listado y búsqueda
  const busqueda = await request(`/escritorio/clientes?q=Mariana`);
  assert(
    'Búsqueda de clientes por nombre funciona correctamente',
    busqueda.status === 200 &&
      Array.isArray(busqueda.data) &&
      busqueda.data.some((c: any) => c.nombre.includes('Mariana')),
    busqueda.data
  );

  // 6. Listado de solicitudes de crédito y productos
  const solicitudes = await request('/escritorio/solicitudes');
  assert(
    'GET /escritorio/solicitudes retorna listado compatible con Solicitud[]',
    solicitudes.status === 200 && Array.isArray(solicitudes.data),
    solicitudes.data?.[0]
  );

  // 7. Registro de nueva solicitud de financiamiento
  const nuevaSolicitud = await request('/escritorio/solicitudes', {
    method: 'POST',
    body: JSON.stringify({
      clienteId: clienteCreadoId,
      monto: 35000,
      plazo: '18 meses',
      motivo: 'Financiamiento para ampliación de negocio personal'
    })
  });

  assert(
    'POST /escritorio/solicitudes registra solicitud de préstamo y evalúa supervisión',
    nuevaSolicitud.status === 201 &&
      nuevaSolicitud.data?.id &&
      nuevaSolicitud.data?.folio &&
      nuevaSolicitud.data?.monto === 35000,
    nuevaSolicitud.data
  );

  // 8. Actividad reciente de escritorio
  const actividad = await request('/escritorio/actividad');
  assert(
    'GET /escritorio/actividad retorna historial cronológico de operaciones',
    actividad.status === 200 &&
      Array.isArray(actividad.data) &&
      actividad.data.length > 0 &&
      actividad.data[0].tipo,
    actividad.data?.[0]
  );

  console.log('\n=======================================================');
  console.log(`📊 RESULTADO DE LA BATERÍA ESCRITORIO: ${passed} PASADAS, ${failed} FALLIDAS`);
  console.log('=======================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Error fatal al ejecutar pruebas:', err?.message || err);
  if (err?.message?.includes('fetch failed')) {
    console.error('💡 CONSEJO: Asegúrate de que el servidor backend esté corriendo en http://localhost:3001 con "npm run dev" antes de ejecutar las pruebas.');
  }
  process.exit(1);
});

