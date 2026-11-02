import { prisma } from '../src/lib/prisma.js';

async function check() {
  const tables = [
    'app_users',
    'branches',
    'customers',
    'financial_products',
    'accounts',
    'loans',
    'loan_applications',
    'collection_cases',
    'audit_logs',
    'roles',
    'turn_types'
  ] as const;

  console.log('--- CONTEO DE TABLAS EN cooperativa_financiera ---');
  for (const t of tables) {
    try {
      const c = await (prisma as any)[t].count();
      console.log(`${t}: ${c} registros`);
    } catch (err: any) {
      console.log(`${t}: ERROR -> ${err.message}`);
    }
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

