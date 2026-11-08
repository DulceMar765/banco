import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';
import './utils/serializer.js'; // Activa el parche global de BigInt para JSON

// Rutas modulares del backend
import { authRouter } from './routes/auth.routes.js';
import { clientesRouter } from './routes/clientes.routes.js';
import { cobranzaRouter } from './routes/cobranza.routes.js';
import { reportesRouter } from './routes/reportes.routes.js';
import { productosRouter } from './routes/productos.routes.js';
import { catalogosRouter } from './routes/catalogos.routes.js';
import { prestamosRouter } from './routes/prestamos.routes.js';
import { lealtadRouter } from './routes/lealtad.routes.js';
import { escritorioRouter } from './routes/escritorio.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint de verificación de estado y conexión a la base de datos MySQL
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      message: 'Conexión a MySQL exitosa mediante Prisma',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Fallo al conectar con MySQL',
      error: error.message
    });
  }
});

// Endpoint base para usuarios
app.get('/api/usuarios', async (_req: Request, res: Response) => {
  try {
    const usuarios = await prisma.app_users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        is_enabled: true,
        created_at: true,
      }
    });
    res.json(usuarios);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Registro de rutas acopladas a los módulos del sistema BANUAT
app.use('/api/auth', authRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/cobranza', cobranzaRouter);
app.use('/api/reportes', reportesRouter);
app.use('/api/productos', productosRouter);
app.use('/api/catalogos', catalogosRouter);
app.use('/api/prestamos', prestamosRouter);
app.use('/api/lealtad', lealtadRouter);
app.use('/api/escritorio', escritorioRouter);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`🔌 Conexión configurada con MySQL (cooperativa_financiera).`);
  console.log(`📡 Rutas activas: /api/auth, /api/clientes, /api/cobranza, /api/reportes, /api/productos, /api/catalogos, /api/prestamos, /api/lealtad, /api/escritorio`);
});
