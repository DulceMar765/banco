import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeData } from '../utils/serializer.js';

export const catalogosRouter = Router();

/**
 * GET /api/catalogos/temporadas
 * Retorna las temporadas de catálogo con sus promociones activas (ModuloCatalogos.tsx).
 */
catalogosRouter.get('/temporadas', async (_req: Request, res: Response) => {
  try {
    const temporadas = await prisma.catalog_seasons.findMany({
      orderBy: { starts_on: 'desc' }
    });

    const resultado = temporadas.map((t) => ({
      id: t.id.toString(),
      nombre: t.name,
      descripcion: `Catálogo de temporada vigente ${t.name}`,
      temporada: t.name,
      inicio: t.starts_on.toISOString().split('T')[0],
      fin: t.ends_on.toISOString().split('T')[0],
      estado: t.is_active ? 'Publicado' : 'Inactivo',
      promociones: [
        {
          id: 1,
          nombre: 'Tasa preferencial',
          descripcion: 'Tasa especial para clientes elegibles.',
          beneficio: '12 % de interés',
          vigencia: 'Hasta fin de temporada',
          seleccionada: true
        },
        {
          id: 2,
          nombre: 'Puntos dobles',
          descripcion: 'Obtén puntos adicionales por tus pagos puntuales.',
          beneficio: 'Doble acumulación de puntos',
          vigencia: 'Hasta fin de temporada',
          seleccionada: false
        }
      ]
    }));

    if (resultado.length === 0) {
      return res.json([
        {
          id: '1',
          nombre: 'Catálogo de Invierno 2026',
          descripcion: 'Promociones y beneficios especiales para la temporada invernal.',
          temporada: 'Invierno 2026',
          inicio: '2026-11-01',
          fin: '2027-01-31',
          estado: 'Publicado',
          promociones: [
            {
              id: 1,
              nombre: 'Tasa preferencial',
              descripcion: 'Tasa especial para clientes con historial puntual.',
              beneficio: '12 % de interés anual',
              vigencia: 'Hasta el 31/12/2026',
              seleccionada: true
            },
            {
              id: 2,
              nombre: 'Puntos dobles por ahorro',
              descripcion: 'Doble acumulación de puntos por ahorro consecutivo.',
              beneficio: '2x Puntos de lealtad',
              vigencia: 'Hasta el 31/01/2027',
              seleccionada: true
            }
          ]
        }
      ]);
    }

    res.json(serializeData(resultado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/catalogos/sucursales
 * Retorna las sucursales bancarias registradas.
 */
catalogosRouter.get('/sucursales', async (_req: Request, res: Response) => {
  try {
    const sucursales = await prisma.branches.findMany({
      where: { is_active: true }
    });
    res.json(serializeData(sucursales));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/catalogos/turnos
 * Tipos de turnos y prioridades de atención (RF-06 a RF-08).
 */
catalogosRouter.get('/turnos', async (_req: Request, res: Response) => {
  try {
    const turnos = await prisma.turn_types.findMany();
    res.json(serializeData(turnos));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
