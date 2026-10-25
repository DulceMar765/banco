# AGENTS.md · Cooperativa Financiera / BancoMex

> **Documento de Instrucciones y Reglas Maestras para Agentes de Inteligencia Artificial**  
> Basado en el *Análisis de Requerimientos v1.0* y las *Historias de Usuario (HU-01 a HU-56)*.  
> Este archivo define el contexto de negocio, arquitectura técnica, directrices operativas y restricciones críticas que cualquier agente debe seguir estrictamente al desarrollar o refactorizar este proyecto.

---

## 1. Visión y Dominio del Sistema

El proyecto es un **Sistema de Gestión Integral para una Cooperativa Financiera**, diseñado bajo estrictos estándares bancarios de integridad, auditoría y seguridad.

El sistema comprende dos frentes principales:
1. **Web Interna (Backoffice / Operación):** Utilizada en sucursales por personal de canalización, ejecutivos de escritorio, cajeros, supervisores, cobranza y administradores.
2. **App del Cliente (Socio):** Interfaz móvil y responsive para consulta de saldos, movimientos, estados de cuenta, canje de puntos, solicitudes y recordatorios.

---

## 2. Arquitectura y Stack Tecnológico

```
BancoMex-CdS/
├── banco/
│   ├── web-interna/         # Frontend React 19 + TypeScript + Vite
│   │   ├── src/             # Páginas y componentes (Login, Cajas, Clientes, etc.)
│   │   └── package.json
│   └── server/              # Backend API Node.js + Express + TypeScript + Prisma
│       ├── .env             # Configuración y DATABASE_URL
│       ├── cooperativa_financiera_mysql.sql # Esquema maestro (56 tablas, vistas, triggers, SPs)
│       ├── prisma/
│       │   └── schema.prisma# Modelos sincronizados mediante Prisma
│       ├── scripts/
│       │   └── init-db.mjs  # Inicializador automático para todo el equipo
│       ├── src/
│       │   ├── config/      # Parámetros y constantes de negocio
│       │   ├── lib/         # Singleton de Prisma y utilidades
│       │   └── index.ts     # Servidor Express y rutas REST
│       └── package.json
```

### Comandos de Operación Obligatorios:
- **Levantar frontend:** `npm run dev` en `banco/web-interna` (puerto 5173).
- **Levantar backend:** `npm run dev` en `banco/server` (puerto 3001).
- **Inicializar Base de Datos en equipo:** `npm run db:init` en `banco/server`.
- **Panel visual de BD:** `npx prisma studio` en `banco/server`.

---

## 3. Matriz de Roles y Accesos (RBAC)

Cualquier funcionalidad o endpoint debe respetar la matriz de control de acceso basada en roles:

| Rol | Código en Sistema | Responsabilidades Principales |
| :--- | :--- | :--- |
| **Cliente / Socio** | `CLIENTE` | Consultar saldo, movimientos, estados de cuenta, transferencias, canje de puntos, ver eventos. |
| **Personal de canalización** | `CANALIZACION` | Recepción de socios, asignación de turnos prioritarios, derivación a ventanilla/escritorio/caja, primer acceso asistido. |
| **Ejecutivo de escritorio** | `EJECUTIVO` | Alta de clientes, expediente digital, captura y pre-evaluación de préstamos, seguimiento de solicitudes. |
| **Cajero** | `CAJERO` | Apertura/cierre de sesión de caja, arqueo por denominación de billetes, depósitos, retiros, cobro de préstamos. |
| **Supervisor** | `SUPERVISOR` | Autorización/rechazo de préstamos dudosos, arqueos de caja, resolución de excepciones, creación de promociones. |
| **Cobranza** | `COBRANZA` | Monitoreo de cartera vencida (1-2 meses vs. incobrable), exportación de reportes Excel, gestión de cesión de cartera. |
| **Administrador** | `ADMIN` | Gestión de personal, tasas de interés, segmentos de rendimiento, parámetros del modelo financiero y auditoría. |
| **Proveedor** | `PROVEEDOR` | Consulta y surtido del catálogo de productos y recompensas de temporada. |

---

## 4. Mapa de Épicas y Reglas de Negocio Clave

### E1. Acceso y Seguridad (HU-01 a HU-03)
- **Login Dual:** Soporte para autenticación por **correo electrónico** o por **número de cuenta** + contraseña.
- **Seguridad en Fallos:** Mensajes genéricos de credenciales inválidas sin revelar qué dato falló. Bloqueo temporal tras múltiples intentos fallidos consecutivos.
- **Cifrado de Documentos:** Expedientes (INE, RFC, etc.) almacenados con URI cifrada y hash SHA-256 de verificación.

### E2. Alta y Gestión de Clientes (HU-04 a HU-08)
- **Expediente Completo en 1 Sesión:** Registro de datos personales, RFC único, CURP único (18 caracteres).
- **Documentos Mandatorios:** INE, comprobante de domicilio, RFC y constancia de situación fiscal.
- **Generación de Cuenta:** Secuencia automática de cuenta al completar el alta (`account_number_sequences`).
- **Ingresos y Familiares:** Distinción clara entre ingreso declarado vs. comprobado.

### E3. Atención y Turnos (HU-09 a HU-12)
- **Tickets con Prioridad:** Algoritmo de ponderación según trámite (trámites de préstamos y clientes preferentes tienen mayor prioridad que consultas generales).
- **Canalización:** Cola ordenada por prioridad y luego por hora de llegada hacia ventanilla, escritorio o caja.

### E4. Cuentas de Débito y Rendimientos (HU-13 a HU-19)
- **Fórmula de Interés Diario Devengado:**  
  $$\text{Interés Diario} = \frac{\text{Saldo} \times \text{Tasa Anual}}{\text{Días del Año (360 o 365)}}$$
- **Aritmética Exacta:** Usar obligatoriamente tipos `Decimal` (nunca `float` ni `number` de JS para cálculos de dinero).
- **Abono Mensual:** Suma de devengos diarios abonados automáticamente en el corte de mes.
- **Segmentación:** Catálogo de 5 a 7 segmentos de rendimiento basados en saldo promedio o antigüedad.

### E5. Caja y Operaciones en Efectivo (HU-20 a HU-23)
- **Sesión de Caja Obligatoria:** Un cajero solo puede tener una sesión abierta a la vez (`open_cashier_key`).
- **Arqueo por Denominación:** Desglose estricto de billetes y monedas en apertura y cierre.
- **Regla de Retiros:** Prohibido retirar más del saldo disponible.
- **Comprobantes:** Emisión obligatoria con folio único, fecha, cajero, sucursal y monto.

### E6. Productos Financieros y Préstamos (HU-24 a HU-30)
- **Evaluación de Capacidad de Pago:** Capacidad crediticia calculada con base en ingresos netos comprobados y gastos reportados.
- **Flujo de Dudosos:** Si la solicitud excede el umbral o ratio de endeudamiento, se deriva automáticamente a la bandeja del **Supervisor**.
- **Pagos Anticipados:** Permite amortización a capital con recálculo automático del calendario de pagos restante.

### E7. Supervisión (HU-31 a HU-33)
- Bandeja de resolución con bitácora inalterable (aprobación/rechazo con justificación obligatoria).
- Creación de promociones y notificaciones push hacia la app del socio.

### E8. Cobranza (HU-34 a HU-37)
- **Cómputo en Días Hábiles:** Basado en la tabla `business_calendar`.
- **Clasificación de Cartera:**
  - *Cartera Vencida Recuperable:* Atraso de 1 a 2 meses (gestión interna intensiva).
  - *Cartera Vencida No Recuperable:* Mayor a 60 días o sin respuesta (candidata a cesión/venta de cartera).
- Exportación automática a Excel sin intervención manual.

### E9. Lealtad y Puntos (HU-38 a HU-42)
- **Equivalencia Base:** $100\text{ puntos} = \$1.00\text{ MXN}$.
- Puntos acumulables por ahorro mensual consecutivo y puntualidad de pago de préstamos.
- Canje disponible para reducción de tasa de interés o productos de catálogo por temporada.

### E10. Aplicación del Cliente (HU-43 a HU-47)
- Consulta 24/7 en tiempo real de saldos, movimientos, rendimientos y puntos.
- Interfaz simplificada con diseño accesible para usuarios con baja alfabetización digital.

### E11. Administración y Auditoría (HU-48 a HU-51)
- **Bitácora Inmutable:** Toda acción administrativa, de caja o de consulta sensible invoca `sp_audit_write()` o triggers de auditoría. No se permiten `DELETE` físicos en tablas de movimientos o auditoría.

### E12. Modelo de Proyección Financiera (HU-52 a HU-56)
- Parametrización: Inversión inicial, bloques temporales (semanal, trimestral, anual), tasa anual.
- Comparación tripartita de escenarios: **Base**, **Ideal** y **Adverso** (con tasa de morosidad/incumplimiento).

---

## 5. Parámetros del Sistema (Configuración Maestra)

Cualquier lógica de negocio debe consultar estos valores centralizados en [`banco/server/src/config/parameters.ts`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/server/src/config/parameters.ts):

| Parámetro | Valor por Defecto | Descripción |
| :--- | :--- | :--- |
| `MONEDA_DEFAULT` | `"MXN"` | Moneda base del sistema. |
| `INFLACION_REFERENCIA` | `0.05` (5.00%) | Tasa de referencia inflacionaria anual. |
| `DIAS_BASE_ANUAL` | `360` o `365` | Base de cálculo comercial para intereses. |
| `PUNTOS_POR_PESO_CANJE` | `100` | 100 puntos = $1.00 MXN. |
| `MAX_INTENTOS_LOGIN` | `5` | Intentos antes del bloqueo temporal de cuenta. |
| `TIEMPO_BLOQUEO_MINUTOS` | `15` | Duración del bloqueo tras fallos de login. |
| `MIN_SEGMENTOS_RENDIMIENTO`| `5` | Cantidad mínima de segmentos en plan de ahorro. |
| `MAX_SEGMENTOS_RENDIMIENTO`| `7` | Cantidad máxima de segmentos configurables. |
| `DIAS_CARTERA_RECUPERABLE`| `60` | Días máximos para considerar mora recuperable. |

---

## 6. Reglas de Oro para Agentes de Código

1. **Principio del Libro Mayor Inmutable:**
   - **NUNCA** hagas un `UPDATE` directo al saldo de una cuenta o un `DELETE` en movimientos.
   - Todo cambio de saldo debe originarse de un movimiento financiero (`financial_transactions`) que afecte al libro contable.
2. **Precisión Numérica Financiera:**
   - **NUNCA** uses `number` o operaciones flotantes (`+`, `-`, `*`, `/` directos) para dinero en el backend. Usa la clase `Decimal` de Prisma o bibliotecas como `decimal.js`.
3. **Atribución de Auditoría:**
   - Todo endpoint protegido debe inyectar el ID del usuario autenticado en la consulta o contexto de auditoría (`@app_user_id`).
4. **Integridad de Base de Datos:**
   - La base de datos oficial se llama `cooperativa_financiera`.
   - Antes de modificar el esquema, respeta las restricciones de MySQL 8.0: no mezclar `ON UPDATE CASCADE` con `CHECK` constraints o `GENERATED STORED` columns.
5. **Calidad de UI/UX:**
   - En el frontend, diseña componentes visualmente pulidos, legibles, con estados de carga claros, mensajes de error amigables y accesibilidad prioritaria para socios de la tercera edad.
