import { prisma } from '../src/lib/prisma.js';
import { PROJECT_PARAMETERS } from '../config/parameters.js';

const BASE_URL = 'http://localhost:3001/api';

async function ejecutarPruebas() {
  console.log('🏛️ =========================================================================');
  console.log('🏛️ BANUAT – SUITE DE INTEGRACIÓN DE NUEVOS ROLES (CAJERO, RECEPCIÓN, CLIENTE)');
  console.log('🏛️ =========================================================================\n');

  let aprobadas = 0;
  let total = 0;

  function probar(nombre: string, ok: boolean, detalle: string) {
    total++;
    if (ok) {
      aprobadas++;
      console.log(`✅ [${total.toString().padStart(2, '0')}] ${nombre}: APROBADO`);
      console.log(`   └─ ${detalle}\n`);
    } else {
      console.log(`❌ [${total.toString().padStart(2, '0')}] ${nombre}: FALLIDO`);
      console.log(`   └─ Detalle: ${detalle}\n`);
    }
  }

  try {
    // 1. Login Cajero
    const resLoginCajero = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'cajero@banuat.local', contrasena: 'Cajero123!' })
    });
    const dataLoginCajero = await resLoginCajero.json();
    probar(
      'Autenticación de Cajero',
      resLoginCajero.ok && dataLoginCajero.rol === 'CAJERO',
      `Login exitoso. Usuario: ${dataLoginCajero.usuario}, Rol asignado: ${dataLoginCajero.rol}`
    );

    // 2. Login Recepción
    const resLoginRecep = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'recepcion@banuat.local', contrasena: 'Recepcion123!' })
    });
    const dataLoginRecep = await resLoginRecep.json();
    probar(
      'Autenticación de Recepción / Canalización',
      resLoginRecep.ok && dataLoginRecep.rol === 'RECEPCION',
      `Login exitoso. Usuario: ${dataLoginRecep.usuario}, Rol asignado: ${dataLoginRecep.rol}`
    );

    // 3. Login Cliente / Socio
    const resLoginCliente = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'cliente@banuat.local', contrasena: 'Cliente123!' })
    });
    const dataLoginCliente = await resLoginCliente.json();
    probar(
      'Autenticación de Socio / Cliente',
      resLoginCliente.ok && dataLoginCliente.rol === 'CLIENTE',
      `Login exitoso. Usuario: ${dataLoginCliente.usuario}, Rol asignado: ${dataLoginCliente.rol}`
    );

    // 4. Catálogo de Trámites de Recepción con Prioridades
    const resTramites = await fetch(`${BASE_URL}/turnos/catalogo-tramites`);
    const tramites = await resTramites.json();
    const tienePrioridad10 = tramites.some((t: any) => t.prioridad === 10);
    const tienePrioridad5 = tramites.some((t: any) => t.prioridad === 5);
    probar(
      'Catálogo de trámites con ponderación de prioridad (Bitácora 04/11/2026)',
      resTramites.ok && tramites.length >= 4 && tienePrioridad10 && tienePrioridad5,
      `Se obtuvieron ${tramites.length} trámites. Prioridad máxima préstamos (10) y caja (5) verificadas.`
    );

    // 5. Creación dinámica de turno de recepción
    const resNuevoTurno = await fetch(`${BASE_URL}/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombrePersona: 'Valeria Garza',
        tipoPersona: 'nuevo',
        tramiteId: tramites[0].id,
        areaAtencion: 'escritorio'
      })
    });
    const dataNuevoTurno = await resNuevoTurno.json();
    probar(
      'Generación dinámica y asignación de turno en recepción',
      resNuevoTurno.ok && Boolean(dataNuevoTurno.turno),
      `Turno asignado: ${dataNuevoTurno.turno}, Área: ${dataNuevoTurno.area}, Mensaje: ${dataNuevoTurno.mensaje}`
    );

    // 6. Historial y métricas de turnos
    const resResumenTurnos = await fetch(`${BASE_URL}/turnos/resumen`);
    const dataResumenTurnos = await resResumenTurnos.json();
    probar(
      'Métricas en vivo de turnos en recepción',
      resResumenTurnos.ok && dataResumenTurnos.turnosHoy > 0,
      `Turnos hoy: ${dataResumenTurnos.turnosHoy}, En espera: ${dataResumenTurnos.enEspera}, Atendidos: ${dataResumenTurnos.atendidos}`
    );

    // 7. Sesión activa y resumen de caja
    const resSesionCaja = await fetch(`${BASE_URL}/caja/sesion-activa`);
    const dataSesionCaja = await resSesionCaja.json();
    probar(
      'Gestión de sesión activa de caja (CASHIER)',
      resSesionCaja.ok && (dataSesionCaja.abierta === true || dataSesionCaja.abierta === false),
      `Sesión activa detectada: ${dataSesionCaja.abierta ? 'ABIERTA con fondo $' + dataSesionCaja.sesion.fondoInicial : 'SIN SESIÓN'}`
    );

    // 8. Consulta de cuenta para depósito/retiro
    const resConsultaCta = await fetch(`${BASE_URL}/caja/consulta-cuenta/0100982341`);
    const dataConsultaCta = await resConsultaCta.json();
    probar(
      'Búsqueda dinámica de cuenta bancaria y validación de saldo',
      resConsultaCta.ok && Boolean(dataConsultaCta.titular),
      `Titular localizado: ${dataConsultaCta.titular}, Cuenta: ${dataConsultaCta.numeroCuenta}, Saldo actual: $${dataConsultaCta.saldo} MXN`
    );

    // 9. Depósito en efectivo con asiento contable real
    const saldoAntesDep = dataConsultaCta.saldo;
    const resDeposito = await fetch(`${BASE_URL}/caja/deposito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numeroCuenta: '0100982341',
        monto: 1500.0,
        observaciones: 'Depósito de prueba automatizada'
      })
    });
    const dataDeposito = await resDeposito.json();
    probar(
      'Depósito en ventanilla de caja e incremento de saldo en MySQL',
      resDeposito.ok && dataDeposito.nuevoSaldo === saldoAntesDep + 1500,
      `Depósito de $1,500.00 MXN exitoso. Folio: ${dataDeposito.folio}, Nuevo saldo: $${dataDeposito.nuevoSaldo} MXN`
    );

    // 10. Regla de retiro: verificación de saldo y rechazo ante sobregiro
    const resRetiroExcedido = await fetch(`${BASE_URL}/caja/retiro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numeroCuenta: '0100982341',
        monto: 9999999.0,
        observaciones: 'Intento de retiro inválido'
      })
    });
    probar(
      'Regla de caja: Prohibición estricta de retiro superior al saldo disponible',
      resRetiroExcedido.status === 400,
      `Retiro excedido rechazado correctamente con HTTP 400. Control de balance protegido.`
    );

    // 11. Retiro válido en ventanilla
    const resRetiroValido = await fetch(`${BASE_URL}/caja/retiro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numeroCuenta: '0100982341',
        monto: 500.0,
        observaciones: 'Retiro parcial de prueba'
      })
    });
    const dataRetiroValido = await resRetiroValido.json();
    probar(
      'Retiro válido en ventanilla y decremento contable en MySQL',
      resRetiroValido.ok && dataRetiroValido.nuevoSaldo === dataDeposito.nuevoSaldo - 500,
      `Retiro de $500.00 MXN completado. Folio: ${dataRetiroValido.folio}, Saldo restante: $${dataRetiroValido.nuevoSaldo} MXN`
    );

    // 12. Resumen del portal del socio
    const resSocioResumen = await fetch(`${BASE_URL}/socio/resumen?email=juan.perez@email.com`);
    const dataSocioResumen = await resSocioResumen.json();
    probar(
      'Dashboard del Socio: datos consolidados y puntos (100 pts = $1 MXN)',
      resSocioResumen.ok && dataSocioResumen.puntos.saldo >= 15000,
      `Socio: ${dataSocioResumen.nombre}, Saldo cuenta: $${dataSocioResumen.cuentaPrincipal.saldo}, Puntos: ${dataSocioResumen.puntos.saldo} (Equivale a $${dataSocioResumen.puntos.equivalenciaMxn} MXN)`
    );

    // 13. Movimientos del socio
    const resSocioMovs = await fetch(`${BASE_URL}/socio/movimientos?email=juan.perez@email.com`);
    const dataSocioMovs = await resSocioMovs.json();
    probar(
      'Historial de movimientos reales del socio en BD',
      resSocioMovs.ok && Array.isArray(dataSocioMovs) && dataSocioMovs.length >= 2,
      `Se recuperaron ${dataSocioMovs.length} movimientos bancarios reales de MySQL.`
    );

    // 14. Beneficios y segmentos de ahorro del socio
    const resSocioBeneficios = await fetch(`${BASE_URL}/socio/beneficios?email=juan.perez@email.com`);
    const dataSocioBeneficios = await resSocioBeneficios.json();
    probar(
      'Catálogo de beneficios y 5 segmentos de rendimiento basados en inflación',
      resSocioBeneficios.ok && dataSocioBeneficios.segmentosRendimiento.length === 5,
      `Segmentos de rendimiento: ${dataSocioBeneficios.segmentosRendimiento.length} niveles paramétricos confirmados.`
    );

    // 15. Notificaciones del socio
    const resSocioNotifs = await fetch(`${BASE_URL}/socio/notificaciones?email=juan.perez@email.com`);
    const dataSocioNotifs = await resSocioNotifs.json();
    probar(
      'Recepción de notificaciones oficiales en portal del socio',
      resSocioNotifs.ok && dataSocioNotifs.length > 0,
      `Notificaciones recibidas: ${dataSocioNotifs.length}. Última: "${dataSocioNotifs[0].titulo}"`
    );

  } catch (error: any) {
    console.error('❌ Error fatal en ejecución de suite:', error);
  } finally {
    console.log(`\n📊 =========================================================================`);
    console.log(`📊 RESUMEN: ${aprobadas} / ${total} CASOS APROBADOS`);
    console.log(`📊 =========================================================================\n`);
    await prisma.$disconnect();
  }
}

ejecutarPruebas();
