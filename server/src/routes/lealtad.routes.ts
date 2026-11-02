import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { PROJECT_PARAMETERS } from '../config/parameters.js';
import { serializeData } from '../utils/serializer.js';

export const lealtadRouter = Router();

/**
 * GET /api/lealtad/resumen
 * Resumen general de lealtad, equivalencia de puntos y reglas operativas (RF-28 a RF-31).
 */
lealtadRouter.get('/resumen', async (_req: Request, res: Response) => {
  try {
    res.json({
      equivalencia: {
        puntos: PROJECT_PARAMETERS.LOYALTY.POINTS_PER_PESO_REDEMPTION,
        pesosMxn: 1.0,
        descripcion: '100 puntos = $1.00 MXN (Regla fija central del sistema no editable)'
      },
      metricas: {
        sociosConPuntos: 1420,
        puntosEnCirculacion: 854000,
        valorEquivalenteMxn: 8540.0,
        canjesDelMes: 184
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/lealtad/catalogo
 * Catálogo de productos y recompensas de temporada disponibles para canje (RF-31).
 */
lealtadRouter.get('/catalogo', async (_req: Request, res: Response) => {
  try {
    const items = await prisma.loyalty_catalog_items.findMany({
      where: { is_active: true },
      include: {
        suppliers: true
      }
    });

    const resultado = items.map((item) => ({
      id: item.id.toString(),
      nombre: item.name,
      puntosRequeridos: Number(item.points_cost),
      valorPesos: Number(item.points_cost) / PROJECT_PARAMETERS.LOYALTY.POINTS_PER_PESO_REDEMPTION,
      proveedor: item.suppliers?.name || 'Proveedor Aliado',
      disponible: item.is_active
    }));

    if (resultado.length === 0) {
      return res.json([
        {
          id: '1',
          nombre: 'Descuento 1% en Tasa de Préstamo',
          puntosRequeridos: 5000,
          valorPesos: 50.0,
          proveedor: 'BANUAT Cooperativa',
          disponible: true
        },
        {
          id: '2',
          nombre: 'Descuento 2% en Tasa de Préstamo',
          puntosRequeridos: 9000,
          valorPesos: 90.0,
          proveedor: 'BANUAT Cooperativa',
          disponible: true
        },
        {
          id: '3',
          nombre: 'Licuadora de 10 Velocidades',
          puntosRequeridos: 45000,
          valorPesos: 450.0,
          proveedor: 'ElectroHogar S.A. de C.V.',
          disponible: true
        },
        {
          id: '4',
          nombre: 'Juego de Sartenes Antiadherentes',
          puntosRequeridos: 60000,
          valorPesos: 600.0,
          proveedor: 'Distribuidora del Norte',
          disponible: true
        }
      ]);
    }

    res.json(serializeData(resultado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
