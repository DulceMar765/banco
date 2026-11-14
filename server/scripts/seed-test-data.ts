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

  // 3b. Empleado Ejecutivo de Escritorio
  let execEmployee = await prisma.employees.findFirst({ where: { employee_number: 'EMP-002' } });
  if (!execEmployee) {
    execEmployee = await prisma.employees.create({
      data: {
        employee_number: 'EMP-002',
        first_name: 'Laura',
        paternal_surname: 'Mendoza',
        maternal_surname: 'Morales',
        job_title: 'EJECUTIVO',
        branch_id: branch.id,
        status: 'ACTIVE'
      }
    });
    console.log('✓ Empleado ejecutivo creado:', execEmployee.first_name);
  }

  let execUser = await prisma.app_users.findFirst({ where: { email: 'ejecutivo@banuat.local' } });
  if (!execUser) {
    execUser = await prisma.app_users.create({
      data: {
        username: 'ejecutivo',
        email: 'ejecutivo@banuat.local',
        password_hash: 'Ejecutivo123!',
        employee_id: execEmployee.id,
        is_enabled: true
      }
    });
    console.log('✓ Usuario ejecutivo creado:', execUser.email);

    const execRole = await prisma.roles.findFirst({ where: { code: 'EXECUTIVE' } });
    if (execRole) {
      await prisma.app_user_roles.create({
        data: {
          user_id: execUser.id,
          role_id: execRole.id,
          assigned_by: supervisorUser ? supervisorUser.id : execUser.id
        }
      });
      console.log('✓ Rol EXECUTIVE asignado.');
    }
  }

  // 3c. Empleado Cajero
  let cashierEmployee = await prisma.employees.findFirst({ where: { employee_number: 'EMP-003' } });
  if (!cashierEmployee) {
    cashierEmployee = await prisma.employees.create({
      data: {
        employee_number: 'EMP-003',
        first_name: 'Marcos',
        paternal_surname: 'Delgado',
        maternal_surname: 'Torres',
        job_title: 'CAJERO',
        branch_id: branch.id,
        status: 'ACTIVE'
      }
    });
    console.log('✓ Empleado cajero creado:', cashierEmployee.first_name);
  }

  let cashierUser = await prisma.app_users.findFirst({ where: { email: 'cajero@banuat.local' } });
  if (!cashierUser) {
    cashierUser = await prisma.app_users.create({
      data: {
        username: 'cajero',
        email: 'cajero@banuat.local',
        password_hash: 'Cajero123!',
        employee_id: cashierEmployee.id,
        is_enabled: true
      }
    });
    console.log('✓ Usuario cajero creado:', cashierUser.email);

    const cashierRole = await prisma.roles.findFirst({ where: { code: 'CASHIER' } });
    if (cashierRole) {
      await prisma.app_user_roles.create({
        data: {
          user_id: cashierUser.id,
          role_id: cashierRole.id,
          assigned_by: supervisorUser ? supervisorUser.id : cashierUser.id
        }
      });
      console.log('✓ Rol CASHIER asignado.');
    }
  }

  // 3d. Empleado Recepción / Canalización
  let routingEmployee = await prisma.employees.findFirst({ where: { employee_number: 'EMP-004' } });
  if (!routingEmployee) {
    routingEmployee = await prisma.employees.create({
      data: {
        employee_number: 'EMP-004',
        first_name: 'Sofía',
        paternal_surname: 'Navarro',
        maternal_surname: 'Reyes',
        job_title: 'CANALIZACION',
        branch_id: branch.id,
        status: 'ACTIVE'
      }
    });
    console.log('✓ Empleada recepción creada:', routingEmployee.first_name);
  }

  let routingUser = await prisma.app_users.findFirst({ where: { email: 'recepcion@banuat.local' } });
  if (!routingUser) {
    routingUser = await prisma.app_users.create({
      data: {
        username: 'recepcion',
        email: 'recepcion@banuat.local',
        password_hash: 'Recepcion123!',
        employee_id: routingEmployee.id,
        is_enabled: true
      }
    });
    console.log('✓ Usuario recepción creado:', routingUser.email);

    const routingRole = await prisma.roles.findFirst({ where: { code: 'ROUTING' } });
    if (routingRole) {
      await prisma.app_user_roles.create({
        data: {
          user_id: routingUser.id,
          role_id: routingRole.id,
          assigned_by: supervisorUser ? supervisorUser.id : routingUser.id
        }
      });
      console.log('✓ Rol ROUTING asignado.');
    }
  }

  // 3e. Empleados y usuarios adicionales para pruebas simultáneas del equipo
  // 3e.1. Cajero 2 (Elena Vázquez)
  let cashier2Emp = await prisma.employees.findFirst({ where: { employee_number: 'EMP-005' } });
  if (!cashier2Emp) {
    cashier2Emp = await prisma.employees.create({
      data: {
        employee_number: 'EMP-005',
        first_name: 'Elena',
        paternal_surname: 'Vázquez',
        maternal_surname: 'Ramos',
        job_title: 'CAJERO',
        branch_id: branch.id,
        status: 'ACTIVE'
      }
    });
  }

  let cashier2User = await prisma.app_users.findFirst({ where: { email: 'cajero2@banuat.local' } });
  if (!cashier2User) {
    cashier2User = await prisma.app_users.create({
      data: {
        username: 'cajero2',
        email: 'cajero2@banuat.local',
        password_hash: 'Cajero123!',
        employee_id: cashier2Emp.id,
        is_enabled: true
      }
    });
    const cRole = await prisma.roles.findFirst({ where: { code: 'CASHIER' } });
    if (cRole) {
      await prisma.app_user_roles.create({
        data: {
          user_id: cashier2User.id,
          role_id: cRole.id,
          assigned_by: supervisorUser ? supervisorUser.id : cashier2User.id
        }
      });
    }
    console.log('✓ Usuario cajero adicional creado: cajero2@banuat.local');
  }

  // 3e.2. Ejecutivo 2 (Roberto Salazar)
  let exec2Emp = await prisma.employees.findFirst({ where: { employee_number: 'EMP-006' } });
  if (!exec2Emp) {
    exec2Emp = await prisma.employees.create({
      data: {
        employee_number: 'EMP-006',
        first_name: 'Roberto',
        paternal_surname: 'Salazar',
        maternal_surname: 'Peña',
        job_title: 'EJECUTIVO',
        branch_id: branch.id,
        status: 'ACTIVE'
      }
    });
  }

  let exec2User = await prisma.app_users.findFirst({ where: { email: 'ejecutivo2@banuat.local' } });
  if (!exec2User) {
    exec2User = await prisma.app_users.create({
      data: {
        username: 'ejecutivo2',
        email: 'ejecutivo2@banuat.local',
        password_hash: 'Ejecutivo123!',
        employee_id: exec2Emp.id,
        is_enabled: true
      }
    });
    const eRole = await prisma.roles.findFirst({ where: { code: 'EXECUTIVE' } });
    if (eRole) {
      await prisma.app_user_roles.create({
        data: {
          user_id: exec2User.id,
          role_id: eRole.id,
          assigned_by: supervisorUser ? supervisorUser.id : exec2User.id
        }
      });
    }
    console.log('✓ Usuario ejecutivo adicional creado: ejecutivo2@banuat.local');
  }

  // 3e.3. Recepción 2 (Lucía Morales)
  let rout2Emp = await prisma.employees.findFirst({ where: { employee_number: 'EMP-007' } });
  if (!rout2Emp) {
    rout2Emp = await prisma.employees.create({
      data: {
        employee_number: 'EMP-007',
        first_name: 'Lucía',
        paternal_surname: 'Morales',
        maternal_surname: 'Cruz',
        job_title: 'CANALIZACION',
        branch_id: branch.id,
        status: 'ACTIVE'
      }
    });
  }

  let rout2User = await prisma.app_users.findFirst({ where: { email: 'recepcion2@banuat.local' } });
  if (!rout2User) {
    rout2User = await prisma.app_users.create({
      data: {
        username: 'recepcion2',
        email: 'recepcion2@banuat.local',
        password_hash: 'Recepcion123!',
        employee_id: rout2Emp.id,
        is_enabled: true
      }
    });
    const rRole = await prisma.roles.findFirst({ where: { code: 'ROUTING' } });
    if (rRole) {
      await prisma.app_user_roles.create({
        data: {
          user_id: rout2User.id,
          role_id: rRole.id,
          assigned_by: supervisorUser ? supervisorUser.id : rout2User.id
        }
      });
    }
    console.log('✓ Usuario recepción adicional creado: recepcion2@banuat.local');
  }

  // 3e. Catálogo de Tipos de Trámites y Turnos
  const tiposTurnos = [
    { code: 'TRAM-PRESTAMO', name: 'Solicitud de Préstamo Financiero', service_area: 'DESK' as const, priority: 10, requires_customer: true },
    { code: 'TRAM-APERTURA', name: 'Apertura de Cuenta de Ahorro', service_area: 'DESK' as const, priority: 8, requires_customer: false },
    { code: 'TRAM-CAJA', name: 'Operaciones de Caja (Depósitos / Retiros / Pagos)', service_area: 'CASHIER' as const, priority: 5, requires_customer: true },
    { code: 'TRAM-CONSULTA', name: 'Consultas Generales y Orientación', service_area: 'DESK' as const, priority: 3, requires_customer: false }
  ];

  for (const tt of tiposTurnos) {
    const existeTT = await prisma.turn_types.findUnique({ where: { code: tt.code } });
    if (!existeTT) {
      await prisma.turn_types.create({
        data: {
          code: tt.code,
          name: tt.name,
          service_area: tt.service_area,
          priority: tt.priority,
          requires_customer: tt.requires_customer,
          is_active: true
        }
      });
      console.log(`✓ Tipo de turno registrado: ${tt.name} (Prioridad ${tt.priority})`);
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

  let prodEmp = await prisma.financial_products.findFirst({ where: { code: 'PRE-EMP-01' } });
  if (!prodEmp) {
    prodEmp = await prisma.financial_products.create({
      data: {
        code: 'PRE-EMP-01',
        name: 'Préstamo Empresarial',
        product_type: 'LOAN',
        description: 'Apoyo financiero para impulsar pequeños negocios y actividades comerciales.',
        minimum_amount: 10000.0,
        maximum_amount: 150000.0,
        default_annual_rate: 0.14,
        is_active: true
      }
    });
    console.log('✓ Producto préstamo empresarial creado.');
  }

  let prodEmer = await prisma.financial_products.findFirst({ where: { code: 'PRE-EMER-01' } });
  if (!prodEmer) {
    prodEmer = await prisma.financial_products.create({
      data: {
        code: 'PRE-EMER-01',
        name: 'Préstamo de Emergencia',
        product_type: 'LOAN',
        description: 'Alternativa de financiamiento para atender imprevistos y urgencias.',
        minimum_amount: 3000.0,
        maximum_amount: 25000.0,
        default_annual_rate: 0.10,
        is_active: true
      }
    });
    console.log('✓ Producto préstamo de emergencia creado.');
  }

  let prodInv = await prisma.financial_products.findFirst({ where: { code: 'INV-CREC-01' } });
  if (!prodInv) {
    prodInv = await prisma.financial_products.create({
      data: {
        code: 'INV-CREC-01',
        name: 'Inversión Creciente',
        product_type: 'INVESTMENT',
        description: 'Producto diseñado para generar rendimientos a plazo fijo.',
        minimum_amount: 10000.0,
        maximum_amount: 200000.0,
        default_annual_rate: 0.08,
        is_active: true
      }
    });
    console.log('✓ Producto inversión creciente creado.');
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
        email: 'cliente@banuat.local',
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

  // 5c. Cliente adicional: María Gómez Treviño (con préstamo y ahorros para pruebas de socio)
  let customer3 = await prisma.customers.findFirst({ where: { rfc: 'GOTM920310XYZ' } });
  if (!customer3) {
    customer3 = await prisma.customers.create({
      data: {
        customer_number: 'CTE-2026-003',
        first_name: 'María',
        paternal_surname: 'Gómez',
        maternal_surname: 'Treviño',
        rfc: 'GOTM920310XYZ',
        curp: 'GOTM920310MTMRLA03',
        email: 'socio.maria@banuat.local',
        phone: '833 456 7890',
        address_line: 'Calle Olivo 405',
        neighborhood: 'Lomas de Rosales',
        municipality: 'Tampico',
        state_name: 'Tamaulipas',
        postal_code: '89100',
        status: 'ACTIVE'
      }
    });
    console.log('✓ Cliente María Gómez creada.');
  }

  if (customer3) {
    const incMaria = await prisma.customer_income_records.findFirst({ where: { customer_id: customer3.id } });
    if (!incMaria) {
      await prisma.customer_income_records.create({
        data: {
          customer_id: customer3.id,
          monthly_amount: 24000.0,
          is_declared: true,
          verified: true,
          income_source: 'Servicios Profesionales',
          valid_from: new Date('2025-01-01')
        }
      });
    }

    let ctaMaria = await prisma.accounts.findUnique({ where: { account_number: '0200881122' } });
    if (!ctaMaria) {
      ctaMaria = await prisma.accounts.create({
        data: {
          account_number: '0200881122',
          customer_id: customer3.id,
          product_id: prodCuenta.id,
          balance: 0.0,
          status: 'ACTIVE',
          created_by_user_id: supervisorUser.id
        }
      });
    }

    let loyaltyM = await prisma.loyalty_accounts.findUnique({ where: { customer_id: customer3.id } });
    if (!loyaltyM) {
      await prisma.loyalty_accounts.create({
        data: {
          customer_id: customer3.id,
          points_balance: BigInt(25000),
          status: 'ACTIVE'
        }
      });
    }

    let mariaUser = await prisma.app_users.findFirst({ where: { email: 'socio.maria@banuat.local' } });
    if (!mariaUser) {
      mariaUser = await prisma.app_users.create({
        data: {
          username: 'socio.maria',
          email: 'socio.maria@banuat.local',
          password_hash: 'Cliente123!',
          customer_id: customer3.id,
          is_enabled: true
        }
      });

      const custRole = await prisma.roles.findFirst({ where: { code: 'CUSTOMER' } });
      if (custRole) {
        await prisma.app_user_roles.create({
          data: {
            user_id: mariaUser.id,
            role_id: custRole.id,
            assigned_by: supervisorUser.id
          }
        });
      }
      console.log('✓ Usuario socio adicional creado: socio.maria@banuat.local');
    }

    let appMaria = await prisma.loan_applications.findFirst({ where: { customer_id: customer3.id } });
    if (!appMaria) {
      appMaria = await prisma.loan_applications.create({
        data: {
          customer_id: customer3.id,
          product_id: prodPrestamo.id,
          requested_amount: 35000.0,
          term_months: 18,
          proposed_annual_rate: 0.15,
          rfc_snapshot: 'GOTM920310XYZ',
          declared_monthly_income_snapshot: 24000.0,
          requires_supervisor_approval: false,
          status: 'APPROVED'
        }
      });
    }

    let loanMaria = await prisma.loans.findFirst({ where: { contract_number: 'PREST-2026-0002' } });
    if (!loanMaria && ctaMaria) {
      let txMaria = await prisma.financial_transactions.findUnique({ where: { receipt_number: 'REC-DISB-2026-0002' } });
      if (!txMaria) {
        txMaria = await prisma.financial_transactions.create({
          data: {
            receipt_number: 'REC-DISB-2026-0002',
            customer_id: customer3.id,
            transaction_type: 'LOAN_DISBURSEMENT',
            channel: 'SYSTEM',
            payment_method: 'ACCOUNT',
            amount: 35000.0,
            status: 'POSTED'
          }
        });
      }

      await prisma.$executeRawUnsafe('SET @loan_disbursement_complete = 1;');
      await prisma.loans.create({
        data: {
          loan_application_id: appMaria.id,
          disbursement_transaction_id: txMaria.id,
          deposit_account_id: ctaMaria.id,
          contract_number: 'PREST-2026-0002',
          principal_amount: 35000.0,
          annual_interest_rate: 0.15,
          term_months: 18,
          principal_balance: 31500.0,
          start_date: new Date('2026-10-01'),
          maturity_date: new Date('2028-04-01'),
          status: 'ACTIVE'
        }
      });
      await prisma.$executeRawUnsafe('SET @loan_disbursement_complete = 0;');
      console.log('✓ Préstamo activo PREST-2026-0002 asignado a María Gómez.');
    }

    const prestamoMaria = await prisma.loans.findFirst({ where: { contract_number: 'PREST-2026-0002' } });
    if (prestamoMaria) {
      let colCase = await prisma.collection_cases.findFirst({ where: { loan_id: prestamoMaria.id } });
      if (!colCase) {
        colCase = await prisma.collection_cases.create({
          data: {
            loan_id: loanMaria.id,
            classification: 'RECOVERABLE',
            sale_eligibility: 'REVIEW',
            business_days_overdue: 15,
            last_contact_at: new Date(),
            next_action_at: new Date('2026-11-25'),
            notes: 'Caso en gestión preventiva de cobranza.'
          }
        });
        console.log('✓ Caso de cobranza creado (ID:', colCase.id.toString(), ')');
      }
    }
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

  // 9. Usuario Cliente / Socio de Autoservicio
  if (customer1) {
    let clienteUser = await prisma.app_users.findFirst({ where: { email: 'cliente@banuat.local' } });
    if (!clienteUser) {
      clienteUser = await prisma.app_users.create({
        data: {
          username: 'cliente',
          email: 'cliente@banuat.local',
          password_hash: 'Cliente123!',
          customer_id: customer1.id,
          is_enabled: true
        }
      });
      console.log('✓ Usuario cliente de prueba creado:', clienteUser.email);

      const customerRole = await prisma.roles.findFirst({ where: { code: 'CUSTOMER' } });
      if (customerRole) {
        await prisma.app_user_roles.create({
          data: {
            user_id: clienteUser.id,
            role_id: customerRole.id,
            assigned_by: supervisorUser ? supervisorUser.id : clienteUser.id
          }
        });
        console.log('✓ Rol CUSTOMER asignado.');
      }
    }

    // Asegurar cuenta de lealtad con puntos de prueba (15,000 puntos = $150 MXN)
    let loyaltyAcc = await prisma.loyalty_accounts.findFirst({ where: { customer_id: customer1.id } });
    if (!loyaltyAcc) {
      loyaltyAcc = await prisma.loyalty_accounts.create({
        data: {
          customer_id: customer1.id,
          points_balance: BigInt(15000),
          status: 'ACTIVE'
        }
      });
      console.log('✓ Cuenta de lealtad creada con 15,000 puntos iniciales.');
    } else if (loyaltyAcc.points_balance === 0n) {
      await prisma.loyalty_accounts.update({
        where: { customer_id: customer1.id },
        data: { points_balance: BigInt(15000) }
      });
      console.log('✓ Saldo de puntos actualizado a 15,000 en cuenta de lealtad.');
    }

    // Notificación de bienvenida para el socio
    const notifExiste = await prisma.customer_notifications.findFirst({ where: { customer_id: customer1.id } });
    if (!notifExiste) {
      await prisma.customer_notifications.create({
        data: {
          customer_id: customer1.id,
          title: 'Bienvenido a BANUAT Digital',
          message: 'Tu cuenta de socio se encuentra activa. Cuentas con 15,000 puntos en tu programa de lealtad.',
          notification_type: 'ACCOUNT_ALERT',
          status: 'SENT'
        }
      });
      console.log('✓ Notificación de bienvenida creada para el socio.');
    }
  }

  // 10. Sesión de Caja Activa para pruebas
  if (cashierUser) {
    const sesionAbierta = await prisma.cashier_sessions.findFirst({
      where: { cashier_user_id: cashierUser.id, status: 'OPEN' }
    });
    if (!sesionAbierta) {
      await prisma.cashier_sessions.create({
        data: {
          branch_id: branch.id,
          cashier_user_id: cashierUser.id,
          opened_by_user_id: supervisorUser ? supervisorUser.id : cashierUser.id,
          opening_cash: 15000.0,
          status: 'OPEN',
          notes: 'Sesión matutina iniciada con fondo de $15,000.00 MXN'
        }
      });
      console.log('✓ Sesión de caja abierta creada para el cajero.');
    }
  }

  // 11. Turnos de muestra para hoy
  const turnosHoy = await prisma.service_turns.count();
  if (turnosHoy === 0 && customer1) {
    const ttCaja = await prisma.turn_types.findFirst({ where: { code: 'TRAM-CAJA' } });
    const ttPres = await prisma.turn_types.findFirst({ where: { code: 'TRAM-PRESTAMO' } });

    if (ttCaja) {
      await prisma.service_turns.create({
        data: {
          branch_id: branch.id,
          turn_type_id: ttCaja.id,
          customer_id: customer1.id,
          priority_snapshot: ttCaja.priority,
          service_area_snapshot: 'CASHIER',
          status: 'WAITING',
          notes: 'Turno C-01: Operación de depósito en efectivo para Juan Pérez'
        }
      });
    }

    if (ttPres && customer2) {
      await prisma.service_turns.create({
        data: {
          branch_id: branch.id,
          turn_type_id: ttPres.id,
          customer_id: customer2.id,
          priority_snapshot: ttPres.priority,
          service_area_snapshot: 'DESK',
          status: 'CALLED',
          notes: 'Turno E-01: Asesoría de crédito para Roberto Sánchez'
        }
      });
    }
    console.log('✓ Turnos de prueba generados en cola.');
  }

  console.log('🎉 Carga de datos de prueba finalizada exitosamente.');
}

seed()
  .catch((err) => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
