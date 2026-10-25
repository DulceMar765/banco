# Backend BancoMex / Cooperativa Financiera (Express + TypeScript + Prisma + MySQL)

Este módulo gestiona la conexión con MySQL, la arquitectura de base de datos relacional y la sincronización automática de modelos para todo el equipo.

---

## 🚀 Guía Rápida para el Equipo de Desarrollo

Cualquier desarrollador que clone este repositorio puede dejar su base de datos local lista y sincronizada con **un solo comando**:

### 1. Configurar credenciales en `.env`
Copia `.env.example` a `.env` (si no existe) y ajusta tu usuario y contraseña de MySQL:

```env
DATABASE_URL="mysql://root:TU_PASSWORD@localhost:3306/cooperativa_financiera"
```

### 2. Instalar dependencias e inicializar la Base de Datos

En la carpeta `banco/server`:

```bash
npm install
npm run db:init
```

#### ¿Qué hace `npm run db:init`?
1. Ejecuta el archivo [`cooperativa_financiera_mysql.sql`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/server/cooperativa_financiera_mysql.sql) (crea la base de datos `cooperativa_financiera`, todas las tablas, vistas, catálogos, triggers y procedimientos almacenados en tu MySQL local).
2. Ejecuta `npx prisma db pull` (lee la base de datos y genera automáticamente los modelos en [`schema.prisma`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/server/prisma/schema.prisma)).
3. Ejecuta `npx prisma generate` (compila las definiciones y tipos de TypeScript de forma 100% tipada).

---

## 🗄️ Visualizar y Gestionar la Base de Datos con Interfaz Gráfica

Prisma incluye un administrador web interactivo:

```bash
npx prisma studio
```
Se abrirá en `http://localhost:5555` para consultar o editar registros visualmente.

---

## 🔄 Futuras Migraciones de Base de Datos

Si en el futuro alguien del equipo necesita modificar una tabla o agregar un campo nuevo:
1. Edita el archivo [`prisma/schema.prisma`](file:///c:/Users/CESAR/Desktop/Clem%20Dumpster/BancoMex-CdS/banco/server/prisma/schema.prisma).
2. Ejecuta:
   ```bash
   npx prisma migrate dev --name descripcion_del_cambio
   ```
Prisma generará el archivo de migración en `prisma/migrations/`, aplicará el cambio en MySQL y versionará la migración en Git para que todos los demás compañeros reciban el cambio automáticamente con `npx prisma migrate dev`.

---

## 🌐 Iniciar el Servidor Backend

```bash
npm run dev
```

El servidor estará escuchando en `http://localhost:3001`.
- **Healthcheck:** [http://localhost:3001/api/health](http://localhost:3001/api/health)
