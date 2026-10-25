import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint de verificación de estado y conexión a la base de datos MySQL
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Prueba simple de conexión ejecutando SELECT 1 en MySQL
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

// Endpoint de ejemplo: listar usuarios
app.get('/api/usuarios', async (_req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        createdAt: true,
        cuentas: {
          select: {
            id: true,
            numeroCuenta: true,
            tipoCuenta: true,
            saldo: true,
            moneda: true
          }
        }
      }
    });
    res.json(usuarios);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de ejemplo: crear usuario
app.post('/api/usuarios', async (req: Request, res: Response) => {
  try {
    const { email, password, nombre, apellido, documento, telefono, rol } = req.body;
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email,
        password, // En producción se recomienda hashear con bcrypt
        nombre,
        apellido,
        documento,
        telefono,
        rol: rol || 'CLIENTE'
      }
    });
    res.status(201).json(nuevoUsuario);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`🔌 Conexión configurada con MySQL en Prisma.`);
});
