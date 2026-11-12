import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeData } from '../utils/serializer.js';

export const productosRouter = Router();

/**
 * GET /api/productos
 * Catálogo de productos financieros (cuentas, ahorros, inversiones y convocatorias especiales).
 */
productosRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const productos = await prisma.financial_products.findMany({
      include: {
        product_requirements: true
      },
      orderBy: { created_at: 'desc' }
    });

    const resultado = productos.map((p) => {
      let tipo: 'Ahorro' | 'Inversión' | 'Otro' = 'Otro';
      if (p.product_type === 'DEPOSIT_ACCOUNT') {
        tipo = 'Ahorro';
      } else if (p.product_type === 'INVESTMENT') {
        tipo = 'Inversión';
      }

      const tasaInteres = p.default_annual_rate ? Number(p.default_annual_rate) * 100 : 4.5;
      const montoMinimo = p.minimum_amount ? Number(p.minimum_amount) : 500;

      const requisitos = p.product_requirements.map((r) => r.requirement_name).join(', ') ||
        'Identificación oficial y comprobante de domicilio.';

      return {
        id: p.id.toString(),
        codigo: p.code,
        nombre: p.name,
        tipo,
        descripcion: p.description || 'Producto financiero de la cooperativa.',
        tasaInteres,
        montoMinimo,
        plazoMeses: p.minimum_term_days ? Math.round(p.minimum_term_days / 30) : 0,
        comision: 0,
        requisitos,
        estado: p.is_active ? 'Activo' : 'Inactivo'
      };
    });

    res.json(serializeData(resultado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/productos
 * Crea un nuevo producto financiero o convocatoria especial.
 */
productosRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { nombre, tipo, descripcion, tasaInteres, montoMinimo } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del producto es obligatorio.' });
    }

    const codigoGenerado = `PRD-${Date.now().toString().slice(-6)}`;
    const productType = tipo === 'Inversión' ? 'INVESTMENT' : 'DEPOSIT_ACCOUNT';

    const nuevo = await prisma.financial_products.create({
      data: {
        code: codigoGenerado,
        name: nombre,
        product_type: productType,
        description: descripcion || '',
        minimum_amount: montoMinimo ? Number(montoMinimo) : 500,
        default_annual_rate: tasaInteres ? Number(tasaInteres) / 100 : 0.045,
        is_active: true
      }
    });

    res.status(201).json(serializeData(nuevo));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/productos/:id/estado
 * Alterna el estado activo / inactivo de un producto financiero.
 */
productosRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const prod = await prisma.financial_products.findUnique({ where: { id } });

    if (!prod) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const actualizado = await prisma.financial_products.update({
      where: { id },
      data: { is_active: !prod.is_active }
    });

    productosRouter.patch('/:id', async (req: Request, res: Response) => {
      try {
        const id = BigInt(req.params.id);
        const { nombre, tipo, descripcion, tasaInteres, montoMinimo } = req.body;
        if (!nombre) {
          return res.status(400).json({ error: 'El nombre del producto es obligatorio.' });
        }

        const actualizado = await prisma.financial_products.update({
          where: { id },
          data: {
            name: nombre,
            product_type: tipo === 'Inversión' ? 'INVESTMENT' : 'DEPOSIT_ACCOUNT',
            description: descripcion || '',
            minimum_amount: montoMinimo === undefined ? undefined : montoMinimo,
            default_annual_rate: tasaInteres === undefined ? undefined : Number(tasaInteres) / 100,
          },
        });

        res.json(serializeData(actualizado));
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    res.json(serializeData(actualizado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
