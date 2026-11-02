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

    if (resultado.length === 0) {
      return res.json([
        {
          id: '1',
          nombre: 'Cuenta de Ahorro Básica',
          tipo: 'Ahorro',
          descripcion: 'Cuenta para administrar y guardar dinero de manera segura.',
          tasaInteres: 2.5,
          montoMinimo: 500,
          plazoMeses: 0,
          comision: 0,
          requisitos: 'Identificación oficial y comprobante de domicilio.',
          estado: 'Activo'
        },
        {
          id: '2',
          nombre: 'Ahorro Creciente',
          tipo: 'Ahorro',
          descripcion: 'Cuenta de ahorro con rendimiento por mantener saldo.',
          tasaInteres: 4.2,
          montoMinimo: 1500,
          plazoMeses: 0,
          comision: 25,
          requisitos: 'Identificación oficial, comprobante de domicilio y depósito inicial.',
          estado: 'Activo'
        },
        {
          id: '3',
          nombre: 'Inversión Plazo Fijo',
          tipo: 'Inversión',
          descripcion: 'Producto de inversión con rendimiento a un plazo establecido.',
          tasaInteres: 8.5,
          montoMinimo: 10000,
          plazoMeses: 12,
          comision: 0,
          requisitos: 'Identificación oficial, comprobante fiscal y cuenta de depósito activa.',
          estado: 'Activo'
        },
        {
          id: '4',
          nombre: 'Convocatoria Productiva Otoño 2026',
          tipo: 'Inversión',
          descripcion: 'Convocatoria especial con beneficios fijos y tasa preferencial de retorno.',
          tasaInteres: 10.2,
          montoMinimo: 25000,
          plazoMeses: 18,
          comision: 0,
          requisitos: 'Constancia de situación fiscal, proyecto productivo y comprobantes de ingreso.',
          estado: 'Activo'
        }
      ]);
    }

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

    res.json(serializeData(actualizado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
