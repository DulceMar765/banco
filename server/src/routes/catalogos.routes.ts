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
      promociones: []
    }));

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

/**
 * GET /api/catalogos/beneficios
 * Apartado institucional basado exclusivamente en promociones vigentes.
 */
catalogosRouter.get('/beneficios', async (_req: Request, res: Response) => {
  try {
    const ahora = new Date();
    const beneficios = await prisma.promotions.findMany({
      where: {
        status: 'ACTIVE',
        starts_at: { lte: ahora },
        ends_at: { gte: ahora }
      },
      orderBy: { starts_at: 'asc' }
    });

    res.json(serializeData(beneficios.map((beneficio) => ({
      id: beneficio.id.toString(),
      titulo: beneficio.title,
      descripcion: beneficio.message,
      vigenciaDesde: beneficio.starts_at,
      vigenciaHasta: beneficio.ends_at
    }))));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
