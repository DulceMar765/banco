# GitHub Copilot Instructions · Cooperativa Financiera BANUAT

> Instrucciones del sistema aplicadas automáticamente para GitHub Copilot (Education, Chat, Edits y Workspace).
> Basado en las Historias de Usuario (HU-01 a HU-56) y la **Bitácora de Levantamiento de Requerimientos (04/11/2026)**.

## 1. Contexto del Proyecto y Reglas Maestras
Este repositorio implementa el sistema de gestión bancaria para **Cooperativa Financiera / BancoMex (BANUAT)**. Consulta siempre el archivo maestro [`AGENTS.md`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/AGENTS.md) para detalles completos de negocio, arquitectura y bitácoras.

## 2. Restricciones Críticas de Código (Anti-Alucinaciones)

1. **Base de Datos y Modelos Prisma:**
   * La base de datos es MySQL 8.0 (`cooperativa_financiera`).
   * Los modelos de Prisma están definidos en inglés en [`server/prisma/schema.prisma`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/server/prisma/schema.prisma).
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

5. **Frontend (Vite + React 19 + TypeScript):**
   * Ubicado en [`web-interna`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/web-interna).
   * Los iconos deben importarse desde `lucide-react`.
   * La Web Interna es para uso de personal interno; no crear pantallas de auto-registro público.
   * **Administración de Clientes:** Mantener el título oficial "Administración de Clientes", visualizador del total de clientes registrados y la bitácora de auditoría acumulativa de condiciones de pago.
   * **Reportes:** Métricas diferenciadas por puesto (Escritorio vs. Caja), con filtros temporales y basadas en operaciones reales.
   * **Resolución y Paneles:** Diseñar con buena ergonomía visual para resoluciones estándar de sucursal (1080p / 768p) con scroll interno contenido.
