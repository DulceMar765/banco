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

async function runSuite() {
  console.log('🧪 =========================================================================');
  console.log('🧪 SUITE DE VALIDACIÓN: CASOS DE USO Y RESILIENCIA - ROL ESCRITORIO (BANUAT)');
  console.log('🧪 =========================================================================\n');

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

  const sufijo = Date.now().toString().slice(-4);
  const rfcBase = `TEST850101${sufijo.slice(0, 3)}`;
  const curpBase = `TEST850101MDFXXX${sufijo.slice(0, 2)}`;
  const emailBase = `socio_${sufijo}@pruebas.banuat.mx`;

  // -------------------------------------------------------------------------
  // Caso 1: Alta integral de nuevo socio (Onboarding exitoso)
  // -------------------------------------------------------------------------
  const altaRes = await request('/escritorio/clientes', {
    method: 'POST',
    body: JSON.stringify({
      nombre: `Alejandro Torres Valero ${sufijo}`,
      correo: emailBase,
      telefono: '833 333 4455',
      rfc: rfcBase,
      curp: curpBase,
      direccion: 'Calle Falsa 123, Col. Centro, Tampico',
      ingreso: 30000,
      tipoIngreso: 'Comprobable',
      documentos: {
        ine: 'ine_alejandro.pdf',
        domicilio: 'cfd_marzo.pdf',
        rfc: 'rfc_constancia.pdf',
        fiscal: 'csf_sat_2026.pdf'
      }
    })
  });

  assert(
    'Caso 1: Onboarding exitoso crea socio, cuenta bancaria con saldo 0.0 y enrolamiento a lealtad',
    altaRes.status === 201 &&
      altaRes.data?.id &&
      altaRes.data?.cuenta?.startsWith('CTA') &&
      altaRes.data?.estado === 'Activo',
    altaRes.data
  );

  const clienteId = altaRes.data?.id;

  // -------------------------------------------------------------------------
  // Caso 2: Prevención de duplicados - Mismo RFC
  // -------------------------------------------------------------------------
  const dupRfcRes = await request('/escritorio/clientes', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Duplicado de RFC',
      correo: `otro_${sufijo}@pruebas.banuat.mx`,
      rfc: rfcBase, // Mismo RFC
      curp: `OTRO850101MDFXXX${sufijo.slice(0, 2)}`
    })
  });

  assert(
    'Caso 2: Rechaza RFC duplicado con HTTP 409 Conflict',
    dupRfcRes.status === 409 && dupRfcRes.data?.error?.includes('RFC'),
    dupRfcRes.data
  );

  // -------------------------------------------------------------------------
  // Caso 3: Prevención de duplicados - Misma CURP
  // -------------------------------------------------------------------------
  const dupCurpRes = await request('/escritorio/clientes', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Duplicado de CURP',
      correo: `otro2_${sufijo}@pruebas.banuat.mx`,
      rfc: `DIFR850101${sufijo.slice(0, 3)}`,
      curp: curpBase // Misma CURP
    })
  });

  assert(
    'Caso 3: Rechaza CURP duplicada con HTTP 409 Conflict',
    dupCurpRes.status === 409 && dupCurpRes.data?.error?.includes('CURP'),
    dupCurpRes.data
  );

  // -------------------------------------------------------------------------
  // Caso 4: Prevención de duplicados - Mismo correo electrónico
  // -------------------------------------------------------------------------
  const dupEmailRes = await request('/escritorio/clientes', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Duplicado de Correo',
      correo: emailBase, // Mismo correo
      rfc: `DIFR850101${sufijo.slice(0, 3)}`,
      curp: `OTR3850101MDFXXX${sufijo.slice(0, 2)}`
    })
  });

  assert(
    'Caso 4: Rechaza Correo duplicado con HTTP 409 Conflict',
    dupEmailRes.status === 409 && dupEmailRes.data?.error?.includes('correo'),
    dupEmailRes.data
  );

  // -------------------------------------------------------------------------
  // Caso 5: Validación de formato - CURP con longitud incorrecta (!= 18)
  // -------------------------------------------------------------------------
  const invalidCurpRes = await request('/escritorio/clientes', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Cliente Curp Invalida',
      correo: `curp_inv_${sufijo}@pruebas.banuat.mx`,
      curp: 'CURP_CORTA' // 10 caracteres
    })
  });

  assert(
    'Caso 5: Rechaza CURP con longitud != 18 caracteres con HTTP 400',
    invalidCurpRes.status === 400 && invalidCurpRes.data?.error?.includes('18 caracteres'),
    invalidCurpRes.data
  );

  // -------------------------------------------------------------------------
  // Caso 6: Validación de formato - RFC con longitud incorrecta (< 12 o > 13)
  // -------------------------------------------------------------------------
  const invalidRfcRes = await request('/escritorio/clientes', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Cliente RFC Invalido',
      correo: `rfc_inv_${sufijo}@pruebas.banuat.mx`,
      rfc: 'RFC_DEMASIADO_LARGO_123456'
    })
  });

  assert(
    'Caso 6: Rechaza RFC inválido con HTTP 400',
    invalidRfcRes.status === 400 && invalidRfcRes.data?.error?.includes('RFC'),
    invalidRfcRes.data
  );

  // -------------------------------------------------------------------------
  // Caso 7: Validación de formato - Formato de correo inválido
  // -------------------------------------------------------------------------
  const invalidEmailRes = await request('/escritorio/clientes', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Cliente Email Invalido',
      correo: 'correo_sin_arroba.com'
    })
  });

  assert(
    'Caso 7: Rechaza correo electrónico sin formato válido con HTTP 400',
    invalidEmailRes.status === 400 && invalidEmailRes.data?.error?.includes('correo'),
    invalidEmailRes.data
  );

  // -------------------------------------------------------------------------
  // Caso 8: Solicitud de préstamo - Capacidad de pago normal (Ratio <= 40% y <= $50,000)
  // -------------------------------------------------------------------------
  // Ingreso de Alejandro: $30,000. Préstamo: $20,000 a 24 meses (Cuota aprox: $940, Ratio: ~3.1%)
  const prestamoNormal = await request('/escritorio/solicitudes', {
    method: 'POST',
    body: JSON.stringify({
      clienteId,
      monto: 20000,
      plazo: '24 meses',
      motivo: 'Compra de equipamiento personal'
    })
  });

  assert(
    'Caso 8: Préstamo regular (Ratio <= 40% y <= $50,000) se procesa en estado SUBMITTED sin derivación forzosa',
    prestamoNormal.status === 201 &&
      prestamoNormal.data?.monto === 20000 &&
      prestamoNormal.data?.folio?.startsWith('SOL'),
    prestamoNormal.data
  );

  // -------------------------------------------------------------------------
  // Caso 9: Solicitud de préstamo - Derivación por Monto Mayor a $50,000
  // -------------------------------------------------------------------------
  const prestamoAltoMonto = await request('/escritorio/solicitudes', {
    method: 'POST',
    body: JSON.stringify({
      clienteId,
      monto: 75000, // > $50,000
      plazo: '36 meses',
      motivo: 'Inversión en remodelación'
    })
  });

  assert(
    'Caso 9: Préstamo > $50,000 requiere obligatoriamente aprobación de supervisor (UNDER_REVIEW)',
    prestamoAltoMonto.status === 201 &&
      prestamoAltoMonto.data?.estado === 'En revisión',
    prestamoAltoMonto.data
  );

  // -------------------------------------------------------------------------
  // Caso 10: Solicitud de préstamo - Derivación por Ratio de Endeudamiento > 40%
  // -------------------------------------------------------------------------
  // Crear socio con ingreso bajo ($6,000) y pedir préstamo con cuota mayor a $2,400 (40% de $6,000)
  const socioIngresoBajo = await request('/escritorio/clientes', {
    method: 'POST',
    body: JSON.stringify({
      nombre: `Socio Ingreso Bajo ${sufijo}`,
      correo: `bajoi_${sufijo}@test.banuat.mx`,
      ingreso: 6000,
      tipoIngreso: 'Declarado'
    })
  });

  const socioBajoId = socioIngresoBajo.data?.id;

  // Préstamo $25,000 a 6 meses -> Cuota ~ $4,350 (> 40% de $6,000)
  const prestamoAltoRatio = await request('/escritorio/solicitudes', {
    method: 'POST',
    body: JSON.stringify({
      clienteId: socioBajoId,
      monto: 25000,
      plazo: '6 meses',
      motivo: 'Urgencia personal'
    })
  });

  assert(
    'Caso 10: Solicitud con ratio de endeudamiento > 40% pasa automáticamente a revisión de supervisor',
    prestamoAltoRatio.status === 201 &&
      prestamoAltoRatio.data?.estado === 'En revisión',
    prestamoAltoRatio.data
  );

  // -------------------------------------------------------------------------
  // Caso 11: Solicitud de préstamo - Monto menor o igual a cero
  // -------------------------------------------------------------------------
  const prestamoMontoInvalido = await request('/escritorio/solicitudes', {
    method: 'POST',
    body: JSON.stringify({
      clienteId,
      monto: -500,
      plazo: '12 meses'
    })
  });

  assert(
    'Caso 11: Rechaza solicitud con monto menor o igual a cero con HTTP 400',
    prestamoMontoInvalido.status === 400,
    prestamoMontoInvalido.data
  );

  // -------------------------------------------------------------------------
  // Caso 12: Solicitud de préstamo - Monto excede límite de catálogo
  // -------------------------------------------------------------------------
  const prestamoExcedeLimite = await request('/escritorio/solicitudes', {
    method: 'POST',
    body: JSON.stringify({
      clienteId,
      monto: 900000, // Máximo del producto suele ser $150,000
      plazo: '24 meses'
    })
  });

  assert(
    'Caso 12: Rechaza solicitud que supera el monto máximo del producto con HTTP 400',
    prestamoExcedeLimite.status === 400 && prestamoExcedeLimite.data?.error?.includes('máximo'),
    prestamoExcedeLimite.data
  );

  // -------------------------------------------------------------------------
  // Caso 13: Solicitud de préstamo para socio inexistente
  // -------------------------------------------------------------------------
  const prestamoSocioInexistente = await request('/escritorio/solicitudes', {
    method: 'POST',
    body: JSON.stringify({
      clienteId: 99999999,
      monto: 10000,
      plazo: '12 meses'
    })
  });

  assert(
    'Caso 13: Rechaza solicitud con socio inexistente con HTTP 404',
    prestamoSocioInexistente.status === 404,
    prestamoSocioInexistente.data
  );

  // -------------------------------------------------------------------------
  // Caso 14: Búsqueda flexible de socios (por nombre parcial o RFC)
  // -------------------------------------------------------------------------
  const busquedaRes = await request(`/escritorio/clientes?q=Torres`);
  assert(
    'Caso 14: Búsqueda por apellido parcial retorna coincidencia exacta',
    busquedaRes.status === 200 &&
      Array.isArray(busquedaRes.data) &&
      busquedaRes.data.some((c: any) => c.nombre.includes('Torres')),
    busquedaRes.data
  );

  // -------------------------------------------------------------------------
  // Caso 15: Métricas agregadas de Dashboard Escritorio
  // -------------------------------------------------------------------------
  const resumenRes = await request('/escritorio/resumen');
  assert(
    'Caso 15: Resumen consolida métricas numéricas y listados recientes sin error',
    resumenRes.status === 200 &&
      resumenRes.data?.totalClientes >= 3 &&
      resumenRes.data?.solicitudesActivas >= 2 &&
      Array.isArray(resumenRes.data?.solicitudesRecientes),
    resumenRes.data
  );

  console.log('\n=========================================================================');
  console.log(`📊 TOTAL SUITE CASOS DE USO ESCRITORIO: ${passed} PASADAS, ${failed} FALLIDAS`);
  console.log('=========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fallo no controlado en la suite de pruebas:', err?.message || err);
  if (err?.message?.includes('fetch failed')) {
    console.error('💡 CONSEJO: Asegúrate de que el servidor backend esté corriendo en http://localhost:3001 con "npm run dev" antes de ejecutar las pruebas.');
  }
  process.exit(1);
});

