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
    await inscribirClientesConCuenta();
    await procesarPuntosPendientes();

    const [sociosConPuntos, puntos, canjesDelMes] = await Promise.all([
      prisma.loyalty_accounts.count({ where: { status: 'ACTIVE' } }),
      prisma.loyalty_accounts.aggregate({ _sum: { points_balance: true } }),
      prisma.loyalty_redemptions.count({
        where: {
          requested_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);
    const puntosEnCirculacion = puntos._sum.points_balance ?? BigInt(0);

    res.json({
      equivalencia: {
        puntos: PROJECT_PARAMETERS.LOYALTY.POINTS_PER_PESO_REDEMPTION,
        pesosMxn: 1,
        descripcion: '100 puntos = $1.00 MXN (Regla fija central del sistema no editable)'
      },
      metricas: {
        sociosConPuntos,
        puntosEnCirculacion,
        valorEquivalenteMxn: Number(puntosEnCirculacion) / PROJECT_PARAMETERS.LOYALTY.POINTS_PER_PESO_REDEMPTION,
        canjesDelMes,
        puntosPorAhorro: PROJECT_PARAMETERS.LOYALTY.POINTS_FOR_CONSECUTIVE_SAVINGS,
        puntosPorAbono: PROJECT_PARAMETERS.LOYALTY.POINTS_PER_LOAN_PAYMENT
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

lealtadRouter.get('/clientes', async (_req: Request, res: Response) => {
  try {
    await inscribirClientesConCuenta();
    const clientes = await prisma.customers.findMany({
      where: { accounts: { some: { status: 'ACTIVE' } } },
      include: { loyalty_accounts: true },
      orderBy: { created_at: 'desc' }
    });

    res.json(serializeData(clientes.map((cliente) => ({
      id: cliente.id.toString(),
      nombre: [cliente.first_name, cliente.middle_name, cliente.paternal_surname, cliente.maternal_surname]
        .filter(Boolean)
        .join(' '),
      puntos: cliente.loyalty_accounts?.points_balance ?? BigInt(0),
      estado: cliente.loyalty_accounts?.status || 'ACTIVE'
    }))));
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

    res.json(serializeData(resultado));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/lealtad/canjear
 * Registra un canje y descuenta puntos/stock en una sola transacción.
 */
lealtadRouter.post('/canjear', async (req: Request, res: Response) => {
  try {
    const customerId = String(req.body.customerId || '');
    const catalogItemId = String(req.body.catalogItemId || '');
    const quantity = Number(req.body.quantity || 1);

    if (!/^\d+$/.test(customerId) || !/^\d+$/.test(catalogItemId) || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Cliente, producto y cantidad válidos son obligatorios.' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const [cuentaPuntos, producto] = await Promise.all([
        tx.loyalty_accounts.findUnique({ where: { customer_id: BigInt(customerId) } }),
        tx.loyalty_catalog_items.findUnique({ where: { id: BigInt(catalogItemId) } })
      ]);

      if (!cuentaPuntos || cuentaPuntos.status !== 'ACTIVE') {
        throw new Error('El cliente no está inscrito en el programa de lealtad.');
      }
      if (!producto || !producto.is_active) {
        throw new Error('El producto no está disponible.');
      }
      if (producto.stock_quantity < quantity) {
        throw new Error('No hay existencias suficientes para este producto.');
      }

      const puntosTotales = producto.points_cost * BigInt(quantity);
      if (cuentaPuntos.points_balance < puntosTotales) {
        throw new Error('El cliente no tiene suficientes puntos.');
      }
      const puntosRestantes = cuentaPuntos.points_balance - puntosTotales;

      const redencion = await tx.loyalty_redemptions.create({
        data: {
          customer_id: BigInt(customerId),
          catalog_item_id: BigInt(catalogItemId),
          quantity,
          points_redeemed: puntosTotales,
          status: 'APPROVED'
        }
      });

      return {
        redencionId: redencion.id.toString(),
        puntosRestantes: puntosRestantes.toString(),
        stockRestante: producto.stock_quantity - quantity
      };
    });

    res.status(201).json(serializeData({ ok: true, ...resultado }));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Inscribe de forma idempotente a cualquier cliente que ya tenga una cuenta.
 * La inscripción no depende de saldo ni de movimientos.
 */
async function inscribirClientesConCuenta() {
  const cuentas = await prisma.accounts.findMany({
    where: { status: 'ACTIVE' },
    select: { customer_id: true },
    distinct: ['customer_id']
  });

  if (cuentas.length === 0) return;

  await prisma.$transaction(
    cuentas.map((cuenta) =>
      prisma.loyalty_accounts.upsert({
        where: { customer_id: cuenta.customer_id },
        create: {
          customer_id: cuenta.customer_id,
          points_balance: BigInt(0),
          status: 'ACTIVE'
        },
        update: {}
      })
    )
  );
}

async function procesarPuntosPendientes() {
  const operaciones = await prisma.financial_transactions.findMany({
    where: {
      status: 'POSTED',
      transaction_type: {
        in: ['ACCOUNT_DEPOSIT', 'INVESTMENT_CONTRIBUTION', 'LOAN_PAYMENT']
      },
      loyalty_movements: { none: {} }
    },
    select: {
      id: true,
      customer_id: true,
      receipt_number: true,
      transaction_type: true,
      processed_by_user_id: true
    },
    orderBy: { created_at: 'asc' }
  });

  let procesadas = 0;
  await prisma.$transaction(async (tx) => {
    for (const operacion of operaciones) {
      const yaProcesada = await tx.loyalty_movements.findFirst({
        where: { related_transaction_id: operacion.id },
        select: { id: true }
      });
      if (yaProcesada) continue;

      const puntos = operacion.transaction_type === 'LOAN_PAYMENT'
        ? PROJECT_PARAMETERS.LOYALTY.POINTS_PER_LOAN_PAYMENT
        : PROJECT_PARAMETERS.LOYALTY.POINTS_FOR_CONSECUTIVE_SAVINGS;

      await tx.loyalty_accounts.upsert({
        where: { customer_id: operacion.customer_id },
        create: {
          customer_id: operacion.customer_id,
          points_balance: BigInt(puntos),
          status: 'ACTIVE'
        },
        update: {
          points_balance: { increment: BigInt(puntos) },
          status: 'ACTIVE'
        }
      });

      await tx.loyalty_movements.create({
        data: {
          customer_id: operacion.customer_id,
          points_delta: BigInt(puntos),
          movement_type: 'EARN',
          description: `${operacion.transaction_type === 'LOAN_PAYMENT' ? 'Puntos por abono' : 'Puntos por ahorro'} · Folio ${operacion.receipt_number}`,
          related_transaction_id: operacion.id,
          created_by_user_id: operacion.processed_by_user_id
        }
      });
      procesadas += 1;
    }
  });
  return procesadas;
}

/**
 * POST /api/lealtad/procesar
 * Acredita puntos por cada depósito/ahorro o abono de préstamo publicado.
 * La relación con receipt_number hace el proceso idempotente.
 */
lealtadRouter.post('/procesar', async (_req: Request, res: Response) => {
  try {
    await inscribirClientesConCuenta();
    const procesadas = await procesarPuntosPendientes();
    res.json({ procesadas });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
