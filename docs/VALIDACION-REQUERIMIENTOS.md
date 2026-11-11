# Implementación y validación de requerimientos

## Alcance implementado

### Backend

- Conexión y healthcheck de la API en `http://localhost:3001`.
- Directorio de clientes con métricas y capacidad de pago basada en datos persistidos.
- Inscripción automática e idempotente al programa de lealtad para clientes con cuenta.
- Puntos por ahorro y abonos ligados al folio de la transacción, sin duplicados al reprocesar.
- Equivalencia fija de 100 puntos = $1 MXN.
- Reportes de operaciones basados en turnos y transacciones reales.
- Beneficios y catálogos consultados desde la base de datos.
- Bandeja y autorización/rechazo de préstamos con fecha contable del día siguiente cuando corresponde al cierre de mes.
- Desembolsos físicos restringidos mediante la configuración vigente.
- Cobranza por días hábiles, decisiones persistidas, auditoría y exportación de cartera.
- Productos financieros consultables, creables, editables y activables/desactivables.
- Compatibilidad del script SQL con MariaDB 10.4/XAMPP: `utf8mb4_unicode_ci` y procesamiento JSON sin `JSON_TABLE`.
- Ruta raíz informativa de la API (`/`) y healthcheck (`/api/health`).

### Frontend

- Inicio de sesión interno y navegación por rol de supervisor.
- Módulo **Administración de Clientes** conectado a clientes reales.
- Módulos de lealtad, préstamos, catálogos, productos, cobranza, historial y reportes.
- Productos financieros y cobranza conectados a sus endpoints, sin catálogos ficticios locales.
- Decisiones de cobranza enviadas al backend y reflejadas en la interfaz.
- Diseño con iconos de `lucide-react` y compilación Vite/TypeScript.

## Pruebas ejecutadas

Las siguientes validaciones se ejecutaron con MariaDB local activa y la base
`cooperativa_financiera` disponible:

```bash
# Backend
cd server
npm run build
npm run test:requerimientos

# Frontend
cd web-interna
npm run test:frontend
```

### Resultado

- `server`: compilación TypeScript correcta.
- Suite de requerimientos backend: todas las comprobaciones pasaron.
- `web-interna`: `tsc -b` y `vite build` correctos.
- Oxlint: correcto, sin advertencias.
- `git diff --check`: correcto.

La suite backend valida:

1. Conexión a MariaDB.
2. Clientes, cuentas y total del directorio.
3. Lealtad sin fondeo inicial.
4. Equivalencia fija y configuración de puntos.
5. Puntos por ahorro y abono.
6. Idempotencia y ausencia de duplicados.
7. Beneficios, reportes y bandeja de préstamos.
8. Restricción de desembolsos.

## Smoke test de API

Respondieron HTTP 200 las rutas:

- `/`
- `/api/health`
- `/api/clientes`
- `/api/lealtad/resumen`
- `/api/catalogos/beneficios`
- `/api/catalogos/temporadas`
- `/api/catalogos/sucursales`
- `/api/catalogos/turnos`
- `/api/productos`
- `/api/cobranza`
- `/api/cobranza/exportar`
- `/api/prestamos/solicitudes`
- `/api/reportes/operaciones`

La ruta `/api/prestamos` no existe como endpoint base; la ruta funcional es
`/api/prestamos/solicitudes`.

## Smoke test del frontend

Con Vite en `http://localhost:5173`, se verificó:

- Inicio de sesión con el usuario local de supervisor.
- Navegación sin errores visibles por Préstamos, Clientes, Promociones,
  Lealtad, Catálogos, Productos financieros, Cobranza, Historial y Reportes.
- Carga de datos reales y estados vacíos cuando no existen registros para un módulo.
- Login de los roles locales Supervisor, Ejecutivo y Canalización.
- Bloqueo preventivo: cinco intentos inválidos devuelven `401` y el sexto `429`.

## Preparación local

```bash
cd server
npm install
npm run db:init
npm run seed:test
npm run dev
```

En otra terminal:

```bash
cd web-interna
npm install
npm run dev
```

> `npm run db:init` recrea la base de datos. No debe ejecutarse contra datos
> reales o compartidos sin respaldo y autorización.

## Límites conocidos

El alcance validado no incluye una app independiente para socios, operación
física integral de caja, motor completo de proyección financiera ni recursos
gráficos externos tipo Canva. Esos módulos requieren flujos de negocio y
criterios de aceptación adicionales; no se simularon como datos reales.
