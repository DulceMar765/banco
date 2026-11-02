# AGENTS.md · Cooperativa Financiera / BancoMex (BANUAT)

> **Documento de Instrucciones, Arquitectura y Reglas Maestras para Agentes de Inteligencia Artificial**  
> *Aplica para Antigravity, GitHub Copilot (Education / Chat / Workspace) y cualquier otro asistente de desarrollo.*  
> Basado en el **Análisis de Requerimientos v1.0**, las **Historias de Usuario (HU-01 a HU-56)** y las **Especificaciones de Auditoría de Clientes y Reportes de Sucursal**.  
> **Cualquier agente debe leer y respetar estrictamente este documento antes de sugerir, generar o refactorizar código.**

---

## 1. Visión, Dominio y Contexto del Negocio

El sistema es una **Plataforma Integral de Gestión Bancaria para una Cooperativa Financiera (BANUAT)**, orientada a servicios de ahorro, inversión, préstamos, atención en sucursal y cobranza, bajo estrictos estándares de trazabilidad, integridad contable y auditoría inmutable.

El sistema comprende dos frentes:
1. **Web Interna (Backoffice / Operación de Sucursal):** Utilizada por canalización, ejecutivos de escritorio, cajeros, supervisores, cobranza y administradores.
2. **App del Cliente (Socio):** Interfaz responsive / móvil para socios (consulta de saldos, movimientos, rendimientos, notificaciones, canje de puntos y eventos de educación financiera).

---

## 2. Arquitectura de Repositorio y Stack Tecnológico

```
Folder Principal/
├── .github/
│   └── copilot-instructions.md # Instrucciones automáticas para GitHub Copilot
├── AGENTS.md                    # Este archivo maestro de directrices
├── banco/
│   ├── AGENTS.md                # Réplica maestra para navegación interna
│   ├── web-interna/             # Frontend React 19 + TypeScript + Vite + Lucide Icons
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── login/       # Login interno (correo/cuenta + contraseña)
│   │   │   │   └── supervisor/  # Módulos: Clientes, Reportes, Cobranza, Préstamos, etc.
│   │   │   ├── services/        # Servicios de autenticación y conexión API
│   │   │   └── App.tsx
│   │   └── package.json
│   └── server/                  # Backend API Node.js + Express + TypeScript + Prisma + MySQL 8.0
│       ├── .env                 # Configuración de puerto y DATABASE_URL
│       ├── cooperativa_financiera_mysql.sql # Esquema maestro DDL (56 tablas, vistas, triggers, SPs)
│       ├── prisma/
│       │   └── schema.prisma    # Modelos ORM sincronizados con MySQL (tablas en inglés)
│       ├── scripts/
│       │   └── init-db.mjs      # Inicializador automatizado de BD
│       ├── src/
│       │   ├── config/          # Parámetros y constantes de negocio centralizadas
│       │   ├── lib/             # Singleton de Prisma Client
│       │   └── index.ts         # Servidor Express y endpoints REST
│       └── package.json
```

### Comandos de Operación Obligatorios
* **Frontend:** `npm run dev` en `banco/web-interna` (puerto `5173`).
* **Backend:** `npm run dev` en `banco/server` (puerto `3001`).
* **Compilación Frontend:** `npm run build` en `banco/web-interna` (`tsc -b && vite build`).
* **Compilación Backend:** `npm run build` en `banco/server` (`tsc`).
* **Inicializar BD local:** `npm run db:init` en `banco/server`.
* **Panel visual de BD:** `npx prisma studio` en `banco/server` (puerto `5555`).

---

## 3. Matriz de Roles y Responsabilidades (RBAC)

| Rol | Código en Sistema | Responsabilidades Operativas |
| :--- | :--- | :--- |
| **Cliente / Socio** | `CLIENTE` | Consulta de saldo, movimientos, rendimientos, número de cuenta; recepción de notificaciones; agenda de eventos de ahorro; canje de puntos. |
| **Personal de canalización** | `CANALIZACION` | Recepción en puerta, asignación de turnos con prioridad ponderada, derivación al área correspondiente (ventanilla, escritorio o caja), asistencia en el primer acceso a la app. |
| **Ejecutivo de escritorio** | `EJECUTIVO` | Alta de clientes y expediente digital en 1 sesión; captura de ingresos declarados/comprobados; propuesta de préstamos, inversiones y seguros; validación de capacidad de pago. |
| **Cajero** | `CAJERO` | Apertura/cierre de sesión de caja con arqueo por denominación de billetes y monedas; recepción de depósitos y retiros en efectivo; cobro de préstamos; emisión de comprobantes con folio y cajero que atendió. |
| **Supervisor** | `SUPERVISOR` | Autorización/rechazo de préstamos dudosos; resolución de excepciones; modificación autorizada de condiciones de pago; creación de promociones; consulta del historial de auditoría y reportes de productividad. |
| **Cobranza** | `COBRANZA` | Gestión de cartera vencida calculada en días hábiles (1-2 meses recuperable vs. > 60 días no recuperable/crítica); registro de llamadas y acuerdos de pago; exportación mensual a Excel para despacho externo. |
| **Administrador** | `ADMIN` | Alta de trabajadores, asignación de roles y permisos, configuración de tasas base, segmentos de rendimiento, parámetros de modelo financiero y auditoría general. |
| **Proveedor** | `PROVEEDOR` | Surtido del catálogo de productos y recompensas por temporada para el canje de puntos. |

---

## 4. Requerimientos Funcionales y Reglas de Negocio

### 4.1. Acceso y Seguridad (RF-01 a RF-05, HU-01 a HU-03)
* **Login Interno:** Acceso mediante **correo electrónico institucional o número de cuenta** + contraseña.  
  *(Nota de diseño: en la Web Interna NO existe auto-registro público; los trabajadores y clientes son dados de alta por personal facultado).*
* **Seguridad en Fallos:** Mensajes genéricos de credenciales inválidas. Bloqueo temporal de 15 minutos tras 5 intentos fallidos consecutivos.
* **Cifrado y Verificación:** Expedientes digitales (INE, RFC, comprobante de domicilio, constancia fiscal) almacenados con URI cifrada y hash SHA-256 de verificación.

### 4.2. Alta y Gestión de Clientes (RF-01 a RF-05, HU-04 a HU-08)
* **Alta en Sesión Única:** Captura de datos generales, RFC único, CURP único (18 caracteres) y documentos obligatorios en un solo flujo.
* **Generación de Cuenta:** Generación automática y atómica del número de cuenta oficial (`account_number_sequences`).
* **Ingresos y Capacidad:** Distinción obligatoria entre ingreso declarado vs. comprobado, gastos mensuales y familiares cercanos.

### 4.3. Atención y Turnos (RF-06 a RF-08, HU-09 a HU-12)
* **Ponderación de Prioridad:** Trámites de préstamos, apertura de inversiones y socios preferentes tienen prioridad más alta en la cola de asignación que consultas generales.
* **Canalización Directa:** Derivación automática hacia ventanilla, escritorio o caja según trámite.

### 4.4. Cuentas de Débito y Rendimientos Diarios (RF-09 a RF-14, HU-13 a HU-19)
* **Fórmula de Interés Diario Devengado:**  
  $$\text{Interés Diario} = \frac{\text{Saldo} \times \text{Tasa Anual}}{\text{Días Base del Año (360 o 365)}}$$
* **Abono Mensual:** Suma exacta de devengos diarios abonados automáticamente en la fecha de corte mensual.
* **Segmentación:** Catálogo de 5 a 7 segmentos de rendimiento basados en rango de saldo o antigüedad, parametrizados en base a inflación (~5%).
* **Convocatorias e Inversiones:** Soporte para productos financieros base y convocatorias especiales (con requisitos específicos, comprobantes, fechas de vigencia, tasas editables y beneficios fijos).
* **Adelanto de Pagos:** Si un socio adelanta pagos de capital, se recalculan intereses restantes y se restringen retornos futuros proporcionalmente.

### 4.5. Operaciones de Caja y Efectivo (RF-15 a RF-17, HU-20 a HU-23)
* **Sesión Obligatoria:** Un cajero solo puede operar con una sesión abierta a la vez (`open_cashier_key`).
* **Arqueo por Denominación:** Desglose estricto de billetes y monedas tanto en apertura como en cierre de turno.
* **Regla de Saldo:** Prohibido retirar un monto superior al saldo disponible en cuenta.
* **Comprobante Obligatorio:** Toda transacción emite folio único, fecha, hora, sucursal, monto y la identidad del cajero que atendió.

### 4.6. Préstamos y Supervisión (RF-18 a RF-24, HU-24 a HU-33)
* **Evaluación de Crédito:** Validación automática de capacidad de pago según ingresos declarados/comprobados y gastos reportados.
* **Derivación de Dudosos:** Préstamos que excedan el límite o ratio de endeudamiento pasan forzosamente a la bandeja del **Supervisor**.
* **Resolución Inalterable:** Ningún préstamo dudoso se desembolsa sin autorización previa y justificación registrada del supervisor.

### 4.7. Cobranza y Cartera Vencida (RF-25 a RF-27, HU-34 a HU-37)
* **Cómputo en Días Hábiles:** Todo cálculo de antigüedad de mora utiliza el calendario de días hábiles (`business_calendar`).
* **Clasificación de Cartera:**
  * **Cartera Vencida Recuperable (1 a 2 meses):** Gestión interna intensiva, registro de llamadas y promesas de pago.
  * **Cartera Vencida No Recuperable (> 60 días hábiles):** Deudas críticas susceptibles de venta/cesión a despachos externos (`debt_sales`).
* **Exportación:** Generación del reporte mensual en Excel para el despacho externo sin captura manual.

### 4.8. Programa de Lealtad y Puntos (RF-28 a RF-31, HU-38 a HU-42)
* **Regla de Conversión Fija:**  
  $$100\text{ puntos} = \$1.00\text{ MXN}$$  
  *(Esta equivalencia es una regla central no configurable por el usuario final).*
* **Acumulación:** Otorgamiento de puntos por ahorro consecutivo mes a mes y puntualidad en el pago de préstamos.
* **Canje:** Aplicable para reducción de tasa de interés en préstamos o por productos físicos del catálogo de recompensas de temporada.

### 4.9. Modelo de Proyección Financiera (RF-38 a RF-43, HU-52 a HU-56)
* Parametrización: Inversión inicial, bloques temporales (semanal, trimestral, anual) y tasa anual de retorno.
* Simulación tripartita: Escenario **Base**, Escenario **Ideal** y Escenario **Adverso** (considerando tasa de morosidad e incumplimiento de contratos).
* Determinación del punto de equilibrio e ingreso requerido para sostener la operación de la cooperativa y costear el sistema.

---

## 5. Especificaciones Detalladas de Módulos Críticos

### 5.1. Módulo Clientes (`ModuloClientes.tsx`) — Historial de Auditoría Acumulativo
El módulo de clientes NO se limita a consultar saldos o pagos; incluye una **bitácora de auditoría inmutable de modificaciones de condiciones financieras** realizadas por supervisores:

#### Estructura en 5 Secciones:
1. **Directorio de Clientes:** Búsqueda ágil por nombre, RFC, CURP o número de cuenta.
2. **Información Financiera:** Ingresos comprobados vs. declarados, gastos, deudas externas y ratio de capacidad de pago.
3. **Productos Financieros:** Cuentas de débito, planes de ahorro e historial de préstamos vigentes.
4. **Condiciones de Pago:** Formulario para que el supervisor modifique frecuencias, fechas límite, montos o tasas de interés previa justificación.
5. **Historial de Modificaciones:** Visor acumulativo cronológico de todos los cambios realizados al socio.

#### Campos Obligatorios del Historial de Modificaciones:
* **Cliente:** Nombre y folio del cliente modificado.
* **Modificación:** Qué dato o parámetro contractual cambió.
* **Valor Anterior:** Estado previo del dato (ej. `18%`, `Mensual`, `$5,000`).
* **Valor Nuevo:** Estado nuevo autorizado (ej. `15%`, `Quincenal`, `$4,200`).
* **Responsable:** Nombre y usuario del supervisor que efectuó el cambio.
* **Fecha y Hora:** Timestamp exacto de la modificación.
* **Motivo:** Justificación obligatoria del ajuste (ej. *"Ajuste por buen historial de pagos"*).

> [!IMPORTANT]
> **Regla de Persistencia del Historial:**  
> El historial debe ser estrictamente acumulativo. Ninguna modificación puede sobreescribir o borrar registros anteriores. En la base de datos se almacena en registros independientes auditados (`audit_logs` / `HISTORIAL_MODIFICACIONES`).

---

### 5.2. Módulo Reportes (`ModuloReportes.tsx`) — Desempeño y Productividad por Puesto
Permite al supervisor evaluar el rendimiento de la sucursal y comparar qué actividades realizó cada empleado durante un periodo.

#### Regla de Oro de Métricas:
**Las métricas deben estar diferenciadas estrictamente por puesto.** No se evalúa al personal de escritorio con los mismos indicadores que al personal de caja:

| Puesto | Indicadores Medidos |
| :--- | :--- |
| **Personal de Escritorio** | • Clientes nuevos registrados<br>• Clientes atendidos<br>• Productos financieros asignados (préstamos, cuentas, inversiones)<br>• Solicitudes o trámites gestionados<br>• Actualizaciones de expediente<br>• Personas externas atendidas |
| **Personal de Caja** | • Pagos de préstamos o deudas recibidos<br>• Número de clientes pagadores atendidos<br>• Monto total de dinero en efectivo recibido<br>• Número total de operaciones de caja ejecutadas<br>• Clientes atendidos<br>• Personas externas atendidas |

#### Estructura de la Pantalla en 4 Apartados:
1. **General:** Resumen global de la sucursal (clientes registrados, atenciones totales, personas externas, productos asignados, pagos recibidos y volumen transaccional).
2. **Escritorio:** Métricas consolidadas de colocación, trámites y altas.
3. **Caja:** Métricas de recaudación, arqueos y cobros recibidos.
4. **Personal:** Comparativa visual entre empleados y detalle individual desglosado (Fecha, Actividad, Cliente, Resultado: *Completado*, *Recibido*, etc.).

#### Filtros de Consulta Obligatorios:
* Filtro temporal: **Día**, **Semana**, **Mes** y **Rango personalizado**.
* Filtro funcional: **Tipo de personal** (Escritorio vs. Caja).
* Filtro individual: **Empleado específico**.

> [!NOTE]
> **Cálculo sobre Operaciones Reales:**  
> Los datos de los reportes se calculan a partir de operaciones reales registradas en el sistema con el usuario que atendió (`app_user_id`), puesto, fecha y resultado. Queda prohibida la captura manual de números de productividad.

---

## 6. Parámetros del Sistema (`parameters.ts`)

Centralizados en [`banco/server/src/config/parameters.ts`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/server/src/config/parameters.ts):

| Parámetro | Valor por Defecto | Descripción |
| :--- | :--- | :--- |
| `MONEDA_DEFAULT` | `"MXN"` | Moneda operativa oficial. |
| `INFLACION_REFERENCIA` | `0.05` (5.00%) | Tasa de referencia inflacionaria anual. |
| `DIAS_BASE_ANUAL` | `360` o `365` | Base de cálculo comercial para intereses. |
| `PUNTOS_POR_PESO_CANJE` | `100` | Equivalencia fija: 100 puntos = $1.00 MXN. |
| `MAX_INTENTOS_LOGIN` | `5` | Umbral antes del bloqueo preventivo. |
| `TIEMPO_BLOQUEO_MINUTOS` | `15` | Tiempo de bloqueo tras intentos fallidos. |
| `MIN_SEGMENTOS_RENDIMIENTO`| `5` | Mínimo de segmentos de ahorro. |
| `MAX_SEGMENTOS_RENDIMIENTO`| `7` | Máximo de segmentos de ahorro. |
| `DIAS_CARTERA_RECUPERABLE`| `60` | Días hábiles máximos para mora recuperable. |

---

## 7. Directrices Estrictas para Agentes de GitHub Copilot y LLMs

> [!WARNING]
> Esta sección previene las alucinaciones y errores comunes más frecuentes generados por agentes de GitHub Copilot (Education, Chat o Workspace):

1. **Inmutabilidad del Libro Mayor:**
   * **NUNCA** generes consultas con `UPDATE accounts SET current_balance = ...` directo.
   * Todo cambio en el saldo de una cuenta DEBE generarse insertando un registro en `financial_transactions`, el cual actualiza el libro contable con partida doble o trigger correspondiente.
   * **NUNCA** uses `DELETE` físico en movimientos financieros, auditorías o sesiones de caja.

2. **Aritmética Financiera y Tipos de Datos:**
   * **NUNCA** utilices tipos primitivos `number` ni operadores de punto flotante (`+`, `-`, `*`, `/` directos) para cálculos monetarios o tasas en el backend.
   * Utiliza siempre la clase `Decimal` de Prisma o bibliotecas de precisión arbitraria (`decimal.js`).
   * En JavaScript / TypeScript, los identificadores `BigInt` de MySQL (como `app_users.id`, `accounts.id`) provocan error en `JSON.stringify()`. Convierte siempre los `BigInt` a `string` (`id.toString()`) antes de enviarlos en respuestas `res.json()`.

3. **Mapeo de Base de Datos y Modelos Prisma:**
   * La base de datos oficial se llama **`cooperativa_financiera`**.
   * En [`prisma/schema.prisma`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/server/prisma/schema.prisma), las tablas están en **inglés técnico en minúsculas con guiones bajos**:
     * Usuarios: `prisma.app_users` *(no `prisma.usuario`)*
     * Cuentas: `prisma.accounts` *(no `prisma.cuenta`)*
     * Clientes: `prisma.customers`
     * Empleados: `prisma.employees`
     * Transacciones: `prisma.financial_transactions`
     * Auditoría: `prisma.audit_logs`
     * Sesiones de caja: `prisma.cashier_sessions`
     * Calendario hábil: `prisma.business_calendar`

4. **Trazabilidad y Contexto de Auditoría:**
   * Todo endpoint que realice una mutación en base de datos debe identificar el `app_user_id` del usuario autenticado y pasarlo al contexto de auditoría (`@app_user_id` o registro en `audit_logs`).

5. **Consistencia de Frontend y UI/UX:**
   * En `banco/web-interna`, los iconos se importan desde `lucide-react`.
   * Diseña pensando en **accesibilidad para socios mayores**: contraste tipográfico claro, botones con buen área táctil, estados de carga visibles y manejo de errores explicativo.
   * No recrees flujos de auto-registro en la web interna; respeta la sesión preconfigurada de supervisor (`supervisor@banuat.local` / `Banuat123!`) o las APIs de autenticación de personal.
