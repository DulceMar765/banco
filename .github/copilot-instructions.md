# GitHub Copilot Instructions · Cooperativa Financiera BANUAT

> Instrucciones del sistema aplicadas automáticamente para GitHub Copilot (Education, Chat, Edits y Workspace).

## 1. Contexto del Proyecto y Reglas Maestras
Este repositorio implementa el sistema de gestión bancaria para **Cooperativa Financiera / BancoMex (BANUAT)**. Consulta siempre el archivo maestro [`AGENTS.md`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/AGENTS.md) para detalles completos de negocio y arquitectura.

## 2. Restricciones Críticas de Código (Anti-Alucinaciones)

1. **Base de Datos y Modelos Prisma:**
   * La base de datos es MySQL 8.0 (`cooperativa_financiera`).
   * Los modelos de Prisma están definidos en inglés en [`server/prisma/schema.prisma`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/server/prisma/schema.prisma).
   * **NUNCA inventes nombres de tablas en español**.
     * Correcto: `prisma.app_users`, `prisma.accounts`, `prisma.customers`, `prisma.employees`, `prisma.financial_transactions`, `prisma.audit_logs`.
     * Incorrecto: `prisma.usuario`, `prisma.cuenta`, `prisma.cliente`.
   * Los identificadores `BigInt` de MySQL (`id`) deben convertirse a `string` (`id.toString()`) antes de enviarse en respuestas JSON (`res.json()`).

2. **Libro Mayor Inmutable:**
   * **PROHIBIDO** hacer `UPDATE` directo a saldos (`accounts.current_balance`).
   * Todo movimiento debe registrarse a través de `financial_transactions` respetando partida doble.
   * **PROHIBIDO** el `DELETE` físico en transacciones, arqueos o bitácoras de auditoría.

3. **Precisión Financiera:**
   * **PROHIBIDO** el uso de `number` de JS o floats para montos de dinero. Utiliza `Decimal` de Prisma o biblioteca `decimal.js`.

4. **Reglas de Negocio Clave:**
   * **Equivalencia de Puntos:** 100 puntos = $1.00 MXN (fija, no configurable).
   * **Cobranza:** Cómputo de cartera vencida en **días hábiles** (`business_calendar`). Cartera recuperable (1 a 2 meses) vs. vencida crítica/venta de cartera (> 60 días).
   * **Trazabilidad:** Toda operación debe guardar el usuario/empleado que atendió (`app_user_id`), puesto, fecha y resultado.

5. **Frontend (Vite + React 19 + TypeScript):**
   * Ubicado en [`web-interna`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/web-interna).
   * Los iconos deben importarse desde `lucide-react`.
   * La Web Interna es para uso de empleados de sucursal; no crear pantallas de auto-registro público de usuarios.
   * El módulo de **Clientes** debe mantener el historial de auditoría acumulativo de modificaciones a condiciones de pago (tasa, fechas, montos, motivo y supervisor responsable).
   * El módulo de **Reportes** debe medir métricas de productividad **diferenciadas por puesto** (Escritorio vs. Caja), con filtros por día/semana/mes/empleado y basadas en operaciones reales.

