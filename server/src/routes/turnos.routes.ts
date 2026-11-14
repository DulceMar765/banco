import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeData } from '../utils/serializer.js';

export const turnosRouter = Router();

/**
 * GET /api/turnos/catalogo-tramites
 * Devuelve el catálogo de trámites y tipos de turnos activos con su prioridad y área asignada
 */
turnosRouter.get('/catalogo-tramites', async (_req: Request, res: Response) => {
  try {
    const tramites = await prisma.turn_types.findMany({
      where: { is_active: true },
      orderBy: { priority: 'desc' }
    });

    const resultado = tramites.map((t) => ({
      id: t.id,
      codigo: t.code,
      nombre: t.name,
      area: t.service_area === 'CASHIER' ? 'caja' : 'escritorio',
      areaLabel: t.service_area === 'CASHIER' ? 'Caja' : 'Escritorio',
      prioridad: t.priority,
      requiereCliente: t.requires_customer
    }));

    res.json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar catálogo de trámites: ' + error.message });
  }
});

/**
 * GET /api/turnos
 * Devuelve la lista de turnos generados para el día actual o con filtro por fecha
 */
turnosRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { fecha, busqueda } = req.query;

    const turnos = await prisma.service_turns.findMany({
      include: {
        turn_types: true,
        customers: true,
        app_users: true
      },
      orderBy: [
        { priority_snapshot: 'desc' },
        { created_at: 'asc' }
      ]
    });

    const formateados = turnos.map((t) => {
      const prefijo = t.service_area_snapshot === 'CASHIER' ? 'C' : 'E';
      const codigoTurno = `${prefijo}-${String(t.id).padStart(2, '0')}`;
      const nombrePersona = t.customers
        ? `${t.customers.first_name} ${t.customers.paternal_surname}`
        : t.notes?.replace(/^Turno (?:[A-Z]-\d+: )?(?:para )?/, '').replace(/\s*\([^)]*\)$/, '') || 'Visitante';

      const fechaObj = new Date(t.created_at);
      const fechaStr = fechaObj.toISOString().slice(0, 10);
      const horaStr = fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

      return {
        id: t.id.toString(),
        turno: codigoTurno,
        persona: nombrePersona,
        tipoPersona: t.customer_id ? 'Cliente' : 'Nuevo cliente',
        tramite: t.turn_types?.name || 'Trámite General',
        fecha: fechaStr,
        hora: horaStr,
        area: t.service_area_snapshot === 'CASHIER' ? 'Caja' : 'Escritorio',
        areaCodigo: t.service_area_snapshot,
        estado: t.status,
        prioridad: t.priority_snapshot
      };
    });

    // Filtros en memoria si se especificaron
    let filtrados = formateados;
    if (fecha) {
      filtrados = filtrados.filter((t) => t.fecha === String(fecha));
    }
    if (busqueda) {
      const termino = String(busqueda).toLowerCase();
      filtrados = filtrados.filter((t) =>
        t.turno.toLowerCase().includes(termino) ||
        t.persona.toLowerCase().includes(termino) ||
        t.tramite.toLowerCase().includes(termino)
      );
    }

    res.json(serializeData(filtrados));
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar historial de turnos: ' + error.message });
  }
});

/**
 * GET /api/turnos/resumen
 * Métricas consolidadas del panel de recepción
 */
turnosRouter.get('/resumen', async (_req: Request, res: Response) => {
  try {
    const todos = await prisma.service_turns.findMany();
    const hoy = new Date().toISOString().slice(0, 10);

    const turnosHoy = todos.filter((t) => t.created_at.toISOString().slice(0, 10) === hoy);
    const enEspera = turnosHoy.filter((t) => t.status === 'WAITING').length;
    const llamados = turnosHoy.filter((t) => t.status === 'CALLED' || t.status === 'IN_SERVICE').length;
    const atendidos = turnosHoy.filter((t) => t.status === 'COMPLETED').length;

    res.json({
      turnosHoy: turnosHoy.length,
      enEspera,
      llamados,
      atendidos,
      tiempoPromedio: '8 min'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener resumen de turnos: ' + error.message });
  }
});

/**
 * POST /api/turnos
 * Genera un nuevo turno dinámicamente con prioridad y canalización a área
 */
turnosRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { nombrePersona, tipoPersona, tramiteId, areaAtencion } = req.body;

    if (!nombrePersona || !tramiteId || !areaAtencion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para generar el turno.' });
    }

    // Buscar tipo de trámite
    const turnType = await prisma.turn_types.findUnique({
      where: { id: Number(tramiteId) }
    });

    if (!turnType) {
      return res.status(404).json({ error: 'Tipo de trámite no encontrado.' });
    }

    // Obtener sucursal matriz
    const branch = await prisma.branches.findFirst();
    const branchId = branch?.id || 1;

    // Buscar si el cliente ya existe en el sistema
    let customerId: bigint | null = null;
    if (tipoPersona === 'cliente') {
      const posibleCliente = await prisma.customers.findFirst({
        where: {
          OR: [
            { first_name: { contains: nombrePersona } },
            { paternal_surname: { contains: nombrePersona } },
            { email: { contains: nombrePersona } }
          ]
        }
      });
      if (posibleCliente) {
        customerId = posibleCliente.id;
      }
    }

    const areaEnum = areaAtencion === 'caja' ? 'CASHIER' : 'DESK';

    const nuevoTurno = await prisma.service_turns.create({
      data: {
        branch_id: branchId,
        customer_id: customerId,
        turn_type_id: turnType.id,
        priority_snapshot: turnType.priority,
        service_area_snapshot: areaEnum,
        status: 'WAITING',
        notes: `Turno para ${nombrePersona} (${tipoPersona === 'cliente' ? 'Cliente' : 'Nuevo'})`
      }
    });

    const prefijo = areaEnum === 'CASHIER' ? 'C' : 'E';
    const codigoTurno = `${prefijo}-${String(nuevoTurno.id).padStart(2, '0')}`;

    res.status(201).json(
      serializeData({
        ok: true,
        id: nuevoTurno.id.toString(),
        turno: codigoTurno,
        persona: nombrePersona,
        tramite: turnType.name,
        area: areaEnum === 'CASHIER' ? 'Caja' : 'Escritorio',
        prioridad: turnType.priority,
        mensaje: `Turno ${codigoTurno} asignado exitosamente.`
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: 'Error al registrar turno: ' + error.message });
  }
});
