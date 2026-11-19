import { prisma } from '../src/lib/prisma.js';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await response.json().catch(() => null);
  return { response, data };
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
  console.log(`✅ ${message}`);
}

async function main() {
  const [operaciones, auditoria, pendientesEnBd] = await Promise.all([
    request('/reportes/operaciones'),
    request('/admin/auditoria'),
    prisma.loan_applications.count({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } }
    })
  ]);

  assert(operaciones.response.ok && Array.isArray(operaciones.data), 'Reportes responden con operaciones reales');
  const operacionesReporte = operaciones.data as Array<Record<string, unknown>>;
  const pendientesEnReporte = operacionesReporte.filter(
    (operacion) =>
      operacion.actividad === 'Solicitud de préstamo' &&
      operacion.resultado === 'Pendiente'
  ).length;
  assert(
    pendientesEnReporte === pendientesEnBd,
    'Las solicitudes de préstamo pendientes aparecen en el reporte'
  );

  assert(auditoria.response.ok, 'Auditoría administrativa responde correctamente');
  const actividades = (auditoria.data as Record<string, unknown>).actividades;
  assert(Array.isArray(actividades), 'Auditoría devuelve actividades legibles');
  const contieneTextoTecnico = (actividades as Array<Record<string, unknown>>).some(
    (actividad) =>
      String(actividad.accion).match(/^(INSERT|UPDATE|DELETE|AUTHORIZE|REJECT)$/) ||
      String(actividad.detalle).includes('{"')
  );
  assert(!contieneTextoTecnico, 'Auditoría no expone acciones ni JSON técnicos');

  const canjeInvalido = await request('/lealtad/canjear', {
    method: 'POST',
    body: JSON.stringify({ customerId: 'no-valido', catalogItemId: 'no-valido' })
  });
  assert(canjeInvalido.response.status === 400, 'El endpoint de canje valida entradas inválidas');
}

main()
  .catch((error) => {
    console.error(`❌ Prueba de correcciones fallida: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
