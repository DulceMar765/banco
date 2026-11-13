# BANUAT · Plataforma Integral de Gestión Bancaria para Cooperativa Financiera

Plataforma integral de gestión bancaria (ahorro, inversión, préstamos, atención en sucursal y cobranza) con trazabilidad contable estricta y auditoría inmutable.

---

## 🏛️ Arquitectura del Repositorio

- **`banco/server/`:** Backend API en **Node.js + Express + TypeScript + Prisma ORM + MySQL 8.0 / MariaDB 10.4+**.
- **`banco/web-interna/`:** Frontend de operación de sucursal en **React 19 + TypeScript + Vite + Lucide Icons**.
- **`banco/docs/`:** Documentación técnica de validación de requerimientos.

---

## 🚀 Inicio Rápido (Guía de Sincronización para el Equipo)

Cualquier integrante del equipo puede clonar el repositorio y tener el sistema 100% operativo siguiendo estos pasos:

### 1. Configurar la Base de Datos (MySQL o XAMPP / MariaDB)

1. En `banco/server`, copia `.env.example` a `.env`:
   ```bash
   cd banco/server
   cp .env.example .env
   ```
2. Ajusta tu cadena de conexión en `.env`. La base de datos oficial se llama **`cooperativa_financiera`**:
   - **XAMPP / MariaDB (sin contraseña):**
     ```env
     DATABASE_URL="mysql://root:@localhost:3306/cooperativa_financiera"
     ```
   - **MySQL Server (con contraseña):**
     ```env
     DATABASE_URL="mysql://root:TU_PASSWORD@localhost:3306/cooperativa_financiera"
     ```

### 2. Instalar Dependencias e Inicializar Base de Datos

En `banco/server`:
```bash
npm install
npm run db:init      # Crea la BD cooperativa_financiera, 56 tablas, SPs y genera Prisma
npm run seed:test    # Carga datos de prueba (empleados, socios, préstamos, catálogos)
```

En `banco/web-interna`:
```bash
npm install
```

---

## 💻 Ejecución del Sistema en Desarrollo

Abre **dos terminales**:

### Terminal 1 — Backend (API puerto 3001)
```bash
cd banco/server
npm run dev
```
- Healthcheck: [http://localhost:3001/api/health](http://localhost:3001/api/health)

### Terminal 2 — Frontend (Web Interna puerto 5173)
```bash
cd banco/web-interna
npm run dev
```
- Aplicación: [http://localhost:5173](http://localhost:5173)

---

## 👥 Credenciales de Acceso por Rol

| Rol | Correo / Identificador | Contraseña | Módulos y Flujos Disponibles |
| :--- | :--- | :--- | :--- |
| **Supervisor** | `supervisor@banuat.local` | `Banuat123!` | Administración de Clientes, Bandeja de Préstamos dudosos, Reportes por puesto, Cobranza, Lealtad, Catálogos. |
| **Ejecutivo** | `ejecutivo@banuat.local` | `Ejecutivo123!` | Flujo cronológico de 7 módulos de atención al socio en escritorio. |
| **Canalización** | `canalizacion@banuat.local` | `Canalizacion123!` | Recepción en puerta, asignación de turnos y prioridades. |

---

## 📋 Flujo Cronológico del Rol Ejecutivo (`Escritorio.tsx`)

El rol de **Ejecutivo de Escritorio** opera bajo un flujo de trabajo estructurado en **7 pasos cronológicos**:

```mermaid
flowchart LR
    M1["1. Inicio - Escritorio\n(Panel principal)"] --> M2["2. Registrar cliente\n(Captura del socio)"]
    M2 --> M3["3. Clientes\n(Directorio oficial)"]
    M3 --> M4["4. Solicitudes\n(Revisión supervisor)"]
    M4 --> M5["5. Productos\n(Préstamos/Ahorro/Inv)"]
    M5 --> M6["6. Seguimiento\n(Respuestas supervisor)"]
    M6 --> M7["7. Actividad\n(Historial con timestamp)"]
```

1. **Inicio – Escritorio:** Pantalla principal al iniciar sesión con métricas consolidadas, clientes en espera y accesos directos.
2. **Registrar cliente:** Captura obligatoria de datos generales (Nombre, Correo, Teléfono, RFC, CURP único de 18 caracteres, Domicilio, Ingreso mensual y Egresos). Al terminar, envía la ficha al supervisor para revisión y autorización.
3. **Clientes:** Directorio general de socios registrados, datos de contacto, número de cuenta asignado (`BAN-XXXX` / `ACC-XXXX`) y estado de autorización.
4. **Solicitudes:** Consulta del estado de autorización de registros de clientes enviados al supervisor (`Pendientes`, `En revisión`, `Aprobadas`, `Rechazadas`, `Con correcciones`).
5. **Productos:** Catálogo de productos financieros disponibles divididos en **Préstamos**, **Inversiones** y **Ahorro**. Permite generar y pre-evaluar solicitudes para socios (validando ratio de endeudamiento $\le 40\%$).
6. **Seguimiento:** Monitoreo del resultado de solicitudes de productos financieros enviadas al supervisor, junto con sus notas de riesgo, observaciones u objeciones.
7. **Actividad:** Bitácora inmutable de auditoría con las operaciones realizadas por el ejecutivo con fecha y hora.

---

## 🧪 Pruebas y Control de Calidad

Para asegurar que cualquier cambio mantenga la estabilidad del proyecto en todas las máquinas:

### Pruebas Backend (con el servidor corriendo en `npm run dev`)
```bash
cd banco/server
npm run test:all           # Ejecuta todas las suites: requerimientos + escritorio + casos de uso
```
Suites individuales:
- `npm run test:requerimientos` (Validaciones generales de requerimientos y bitácora)
- `npm run test:escritorio` (Endpoints de escritorio y métricas)
- `npm run test:casos-escritorio` (15 casos de uso de resiliencia y validaciones)

### Pruebas Frontend
```bash
cd banco/web-interna
npm run test:frontend      # Compilación TypeScript (tsc -b) + Vite build + Oxlint
```

---

## 🛡️ Reglas de Compatibilidad entre Entornos

1. **Motores de BD:** El código SQL y las consultas deben ser 100% compatibles tanto con **MySQL 8.0** como con **MariaDB 10.4+ (XAMPP)**:
   - Utilizar collation `utf8mb4_unicode_ci`.
   - Evitar funciones exclusivas no portables como `JSON_TABLE()` (usar `JSON_EXTRACT` en su lugar).
2. **Nombre de BD:** Obligatoriamente `cooperativa_financiera`.
3. **Inmutabilidad:** Jamás ejecutar `UPDATE accounts SET current_balance = ...` de forma directa; todo movimiento debe generarse mediante `financial_transactions`.
4. **Tipos de Datos:** Manejar precisión decimal arbitraria con `Decimal` en montos y tasas; serializar identificadores `BigInt` a `string` antes de retornar JSON en Express.
