import { prisma } from '../src/lib/prisma.js';

async function seed() {
  console.log('🌱 Iniciando carga de datos de prueba en cooperativa_financiera...');

  // 1. Sucursal
  let branch = await prisma.branches.findFirst({ where: { code: 'SUC-001' } });
  if (!branch) {
    branch = await prisma.branches.create({
      data: {
        code: 'SUC-001',
        name: 'Sucursal Matriz Centro',
        address: 'Av. Hidalgo 1200, Zona Centro',
        phone: '833 212 3456',
        is_active: true
      }
    });
    console.log('✓ Sucursal creada:', branch.name);
  }

  // 2. Empleado Supervisor
  let employee = await prisma.employees.findFirst({ where: { employee_number: 'EMP-001' } });
  if (!employee) {
    employee = await prisma.employees.create({
      data: {
        employee_number: 'EMP-001',
        first_name: 'Carlos',
        paternal_surname: 'Ramírez',
        maternal_surname: 'Gutiérrez',
        job_title: 'SUPERVISOR',
        branch_id: branch.id,
        status: 'ACTIVE'
      }
    });
    console.log('✓ Empleado supervisor creado:', employee.first_name);
  }

  // 3. Usuario de Aplicación (Supervisor)
  let supervisorUser = await prisma.app_users.findFirst({ where: { email: 'supervisor@banuat.local' } });
  if (!supervisorUser) {
    supervisorUser = await prisma.app_users.create({
      data: {
        username: 'supervisor',
        email: 'supervisor@banuat.local',
        password_hash: 'Banuat123!',
        employee_id: employee.id,
        is_enabled: true
      }
    });
    console.log('✓ Usuario supervisor creado:', supervisorUser.email);

    // Asignar rol SUPERVISOR
    const supervisorRole = await prisma.roles.findFirst({ where: { code: 'SUPERVISOR' } });
    if (supervisorRole) {
      await prisma.app_user_roles.create({
        data: {
          user_id: supervisorUser.id,
          role_id: supervisorRole.id,
          assigned_by: supervisorUser.id
        }
      });
      console.log('✓ Rol SUPERVISOR asignado.');
    }
  }

  // 4. Productos Financieros
  let prodCuenta = await prisma.financial_products.findFirst({ where: { code: 'CTA-AHORRO-01' } });
  if (!prodCuenta) {
    prodCuenta = await prisma.financial_products.create({
      data: {
        code: 'CTA-AHORRO-01',
        name: 'Cuenta de Ahorro Básica',
        product_type: 'DEPOSIT_ACCOUNT',
        description: 'Cuenta para administrar y guardar dinero de manera segura.',
        minimum_amount: 500.0,
        default_annual_rate: 0.025,
        is_active: true
      }
    });
    console.log('✓ Producto cuenta de ahorro creado.');
  }

  let prodPrestamo = await prisma.financial_products.findFirst({ where: { code: 'PRE-TRAD-01' } });
  if (!prodPrestamo) {
    prodPrestamo = await prisma.financial_products.create({
      data: {
        code: 'PRE-TRAD-01',
        name: 'Préstamo Personal Tradicional',
        product_type: 'LOAN',
        description: 'Crédito personal de tasa fija para socios activos.',
        minimum_amount: 5000.0,
        maximum_amount: 150000.0,
        default_annual_rate: 0.15,
        is_active: true
      }
    });
    console.log('✓ Producto préstamo tradicional creado.');
  }

  // 5. Clientes de prueba
  let customer1 = await prisma.customers.findFirst({ where: { rfc: 'PEJU900515ABC' } });
  if (!customer1) {
    customer1 = await prisma.customers.create({
      data: {
        customer_number: 'CTE-2026-001',
        first_name: 'Juan',
        paternal_surname: 'Pérez',
        maternal_surname: 'Hernández',
        rfc: 'PEJU900515ABC',
        curp: 'PEHJ900515HTMRLN01',
        email: 'juan.perez@email.com',
        phone: '833 123 4567',
        status: 'ACTIVE'
      }
    });
    console.log('✓ Cliente Juan Pérez creado.');

    // Registro de ingresos
    await prisma.customer_income_records.create({
      data: {
        customer_id: customer1.id,
        monthly_amount: 18000.0,
        is_declared: true,
        verified: true,
        income_source: 'Nómina Industrial',
        valid_from: new Date('2025-01-01')
      }
    });

    // Cuenta de débito (por regla de trigger bancario, debe abrir con saldo 0)
    await prisma.accounts.create({
      data: {
        account_number: '0100982341',
        customer_id: customer1.id,
        product_id: prodCuenta.id,
        balance: 0.0,
        status: 'ACTIVE',
        created_by_user_id: supervisorUser.id
      }
    });
  }

  let customer2 = await prisma.customers.findFirst({ where: { rfc: 'SADR880714EF3' } });
  if (!customer2) {
    customer2 = await prisma.customers.create({
      data: {
        customer_number: 'CTE-2026-002',
        first_name: 'Roberto',
        paternal_surname: 'Sánchez',
        maternal_surname: 'Díaz',
        rfc: 'SADR880714EF3',
        curp: 'SADR880714HTMRLN02',
        email: 'roberto.sanchez@email.com',
        phone: '833 987 6543',
        status: 'ACTIVE'
      }
    });
    console.log('✓ Cliente Roberto Sánchez creado.');

    await prisma.customer_income_records.create({
      data: {
        customer_id: customer2.id,
        monthly_amount: 12000.0,
        is_declared: true,
        verified: false,
        income_source: 'Comercio Independiente',
        valid_from: new Date('2025-01-01')
      }
    });
  }

  // 6. Solicitud de Préstamo de prueba
  let loanApp = await prisma.loan_applications.findFirst({ where: { customer_id: customer2.id } });
  if (!loanApp) {
    loanApp = await prisma.loan_applications.create({
      data: {
        customer_id: customer2.id,
        product_id: prodPrestamo.id,
        requested_amount: 80000.0,
        term_months: 36,
        proposed_annual_rate: 0.18,
        rfc_snapshot: 'SADR880714EF3',
        declared_monthly_income_snapshot: 12000.0,
        requires_supervisor_approval: true,
        status: 'UNDER_REVIEW'
      }
    });
    console.log('✓ Solicitud de préstamo dudoso creada (ID:', loanApp.id.toString(), ')');
  }

  // 7. Temporada de catálogo
  let season = await prisma.catalog_seasons.findFirst({ where: { name: 'Invierno 2026' } });
  if (!season) {
    season = await prisma.catalog_seasons.create({
      data: {
        name: 'Invierno 2026',
        starts_on: new Date('2026-11-01'),
        ends_on: new Date('2027-01-31'),
        is_active: true
      }
    });
    console.log('✓ Temporada de catálogo creada.');
  }

  // 8. Proveedor y producto de lealtad
  let supplier = await prisma.suppliers.findFirst({ where: { tax_id: 'EHO950812AB1' } });
  if (!supplier) {
    supplier = await prisma.suppliers.create({
      data: {
        name: 'ElectroHogar S.A. de C.V.',
        tax_id: 'EHO950812AB1',
        contact_name: 'Marcos Varela',
        email: 'contacto@electrohogar.com',
        phone: '555 432 1098',
        is_active: true
      }
    });
    console.log('✓ Proveedor creado.');

    await prisma.loyalty_catalog_items.create({
      data: {
        code: 'CAT-LIC-001',
        name: 'Licuadora de 10 Velocidades',
        description: 'Vaso de vidrio templado de alta resistencia.',
        points_cost: BigInt(45000),
        stock_quantity: 25,
        is_active: true,
        season_id: season.id,
        supplier_id: supplier.id
      }
    });
    console.log('✓ Recompensa de catálogo creada.');
  }

  console.log('🎉 Carga de datos de prueba finalizada exitosamente.');
}

seed()
  .catch((err) => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
