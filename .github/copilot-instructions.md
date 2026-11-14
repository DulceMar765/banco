# GitHub Copilot Instructions · Cooperativa Financiera BANUAT

> Instrucciones del sistema aplicadas automáticamente para GitHub Copilot (Education, Chat, Edits y Workspace).
> Basado en las Historias de Usuario (HU-01 a HU-56), la **Bitácora de Levantamiento de Requerimientos (04/11/2026)** y la **Guía Operativa del Rol Ejecutivo**.

## 1. Contexto del Proyecto y Reglas Maestras
Este repositorio implementa el sistema de gestión bancaria para **Cooperativa Financiera / BancoMex (BANUAT)**. Consulta siempre el archivo maestro [`AGENTS.md`](../AGENTS.md) para detalles completos de negocio, arquitectura y bitácoras.

## 2. Restricciones Críticas de Código (Anti-Alucinaciones)

1. **Base de Datos y Modelos Prisma:**
   * La base de datos es MySQL 8.0 / MariaDB 10.4+ (`cooperativa_financiera`).
   * Los modelos de Prisma están definidos en inglés en [`banco/server/prisma/schema.prisma`](../server/prisma/schema.prisma).
   * **NUNCA inventes nombres de tablas en español**.
     * Correcto: `prisma.app_users`, `prisma.accounts`, `prisma.customers`, `prisma.employees`, `prisma.financial_transactions`, `prisma.audit_logs`.
     * Incorrecto: `prisma.usuario`, `prisma.cuenta`, `prisma.cliente`.
   * Los identificadores `BigInt` de MySQL (`id`) deben convertirse a `string` (`id.toString()`) antes de enviarse en respuestas JSON (`res.json()`).

2. **Libro Mayor Inmutable y Transacciones:**
   * **PROHIBIDO** hacer `UPDATE` directo a saldos (`accounts.current_balance`).
   * Todo movimiento debe registrarse a través de `financial_transactions` respetando partida doble.
   * **PROHIBIDO** el `DELETE` físico en transacciones, arqueos o bitácoras de auditoría.

3. **Precisión Financiera:**
   * **PROHIBIDO** el uso de `number` de JS o floats para montos de dinero. Utiliza `Decimal` de Prisma o biblioteca `decimal.js`.

4. **Reglas de Negocio Clave y Bitácora 04/11/2026:**
   * **Programa de Lealtad y Puntos:**
     * Equivalencia fija: 100 puntos = $1.00 MXN (inalterable).
     * **Inscripción Inmediata:** Todo socio con cuenta bancaria se integra automáticamente al programa de puntos desde su apertura, incluso sin movimientos iniciales.
     * **Trazabilidad:** Cada asignación de puntos debe quedar ligada al número de orden/folio de captura.
     * **Ahorro y Abonos:** Asignación automática mensual de puntos por ahorro predeterminado, y puntos por abonos de cuotas de préstamos a tiempo. Operaciones recurrentes de ahorro reciben la cuota predeterminada de puntos en cada aportación individual.
     * **Puntos de Confianza:** No se exige pago inicial para comenzar la métrica de confianza del socio.
   * **Préstamos y Desembolsos:**
     * **Restricción Actual:** Los desembolsos físicos de préstamos están temporalmente deshabilitados en esta fase. Se aprueban por supervisor pero no se dispersan.
     * **Corte de Fin de Mes:** Si un préstamo se autoriza el último día del mes, sus movimientos se reflejan el día 1 del siguiente mes.
     * **Capacidad de Pago:** Desglose transparente de cuánto ingresa, cuánto paga actualmente en deudas y su capacidad neta libre ($\le 40\%$).
   * **Cobranza:** Cómputo de cartera vencida en **días hábiles** (`business_calendar`). Cartera recuperable ($\le 60$ días) vs. vencida crítica/venta de cartera (> 60 días).
   * **Trazabilidad:** Toda operación debe guardar el usuario/empleado que atendió (`app_user_id`), puesto, fecha y resultado.

5. **Flujo Cronológico del Rol Ejecutivo (`Escritorio.tsx`):**
   * El ejecutivo de escritorio (`ejecutivo@banuat.local` / `Ejecutivo123!`) atiende al socio siguiendo **7 pasos cronológicos**:
     1. **Inicio – Escritorio:** Resumen general, clientes en espera y accesos rápidos.
     2. **Registrar cliente:** Captura obligatoria de datos generales, RFC, CURP único (18 caracteres), domicilio, ingresos comprobados/declarados y egresos. Envía al supervisor para autorización.
     3. **Clientes:** Directorio oficial de socios con datos de contacto, cuenta bancaria y estado de autorización.
     4. **Solicitudes:** Auditoría del estado de las solicitudes de registro de nuevos clientes (`Pendientes`, `En revisión`, `Aprobadas`, `Rechazadas`, `Con correcciones`).
     5. **Productos:** Catálogo de productos disponibles (**Préstamos**, **Inversiones**, **Ahorro**). Selecciona producto y genera solicitud vinculada que se envía a supervisión.
     6. **Seguimiento:** Consulta del resultado y observaciones de solicitudes de productos financieros emitidas por supervisión.
     7. **Actividad:** Historial inmutable con fecha y hora (`timestamp`) de cada operación realizada por el ejecutivo.

6. **Frontend (Vite + React 19 + TypeScript):**
   * Ubicado en [`banco/web-interna`](../web-interna).
   * Los iconos deben importarse desde `lucide-react`.
   * La Web Interna es para uso de personal interno; no crear pantallas de auto-registro público.
   * **Administración de Clientes:** Mantener el título oficial "Administración de Clientes", visualizador del total de clientes registrados y la bitácora de auditoría acumulativa de condiciones de pago.
   * **Reportes:** Métricas diferenciadas por puesto (Escritorio vs. Caja), con filtros temporales y basadas en operaciones reales.
   * **Resolución y Paneles:** Diseñar con buena ergonomía visual para resoluciones estándar de sucursal (1080p / 768p) con scroll interno contenido.

7. **Compatibilidad Multi-Entorno (MySQL 8 vs MariaDB 10.4 / XAMPP):**
   * Usar siempre collation `utf8mb4_unicode_ci` (evitar `utf8mb4_0900_ai_ci`).
   * Evitar funciones exclusivas no portables como `JSON_TABLE()`; usar `JSON_EXTRACT` y bucles iterativos.
   * La base de datos es SIEMPRE `cooperativa_financiera`.
   * Las suites de pruebas HTTP (`npm run test:all`) requieren tener el servidor encendido previamente con `npm run dev`.

## 8. Directorio de Cuentas de Prueba por Rol
* **Supervisor:** `supervisor@banuat.local` / `Banuat123!` (Carlos Ramírez, `EMP-001`)
* **Ejecutivo (Principal):** `ejecutivo@banuat.local` / `Ejecutivo123!` (Laura Mendoza, `EMP-002`)
* **Ejecutivo (Adicional):** `ejecutivo2@banuat.local` / `Ejecutivo123!` (Roberto Salazar, `EMP-006`)
* **Cajero (Caja 01 - Principal):** `cajero@banuat.local` / `Cajero123!` (Marcos Delgado, `EMP-003`)
* **Cajero (Caja 02 - Adicional):** `cajero2@banuat.local` / `Cajero123!` (Elena Vázquez, `EMP-005`)
* **Recepción (Principal):** `recepcion@banuat.local` / `Recepcion123!` (Sofía Navarro, `EMP-004`)
* **Recepción (Adicional):** `recepcion2@banuat.local` / `Recepcion123!` (Lucía Morales, `EMP-007`)
* **Socio (Ahorro + Puntos):** `cliente@banuat.local` / `Cliente123!` (Juan Pérez, `CTE-2026-001`, Cuenta `0100982341`)
* **Socia (Préstamo Activo + Cuotas):** `socio.maria@banuat.local` / `Cliente123!` (María Gómez, `CTE-2026-003`, Cuenta `0200881122`)
