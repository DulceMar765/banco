import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeData } from '../utils/serializer.js';
import { PROJECT_PARAMETERS } from '../config/parameters.js';

export const adminRouter = Router();

// Configuración institucional y preferencias dinámicas respaldadas por branches + estado en servidor
let configInstitucionalExtra = {
  nombreComercial: 'BANUAT · Cooperativa Financiera',
  correoInstitucional: 'contacto@banuat.local',
  descripcion: 'Plataforma Integral de Gestión Bancaria y Cooperativa Financiera orientada al ahorro, inversión y crédito social.',
  moneda: PROJECT_PARAMETERS.CURRENCY.DEFAULT || 'MXN',
  formatoFecha: 'dd/mm/yyyy',
  zonaHoraria: 'America/Mexico_City',
  temaVisual: 'claro',
  organizacionPanel: 'predeterminado',
  notificaciones: {
    solicitudesPrestamos: true,
    registrosClientes: true,
    actividadPersonal: true,
    promocionesBeneficios: true,
  },
  seguridad: {
    maxIntentosLogin: PROJECT_PARAMETERS.SECURITY.MAX_LOGIN_ATTEMPTS,
    bloqueoMinutos: PROJECT_PARAMETERS.SECURITY.ACCOUNT_LOCK_MINUTES,
    sesionInactivaMinutos: 30,
  },
  disponibilidadCatalogos: {
    Recepción: true,
    Escritorio: true,
    Clientes: true,
    Supervisor: true,
  }
};

async function registrarAuditoriaAdmin(
  entityName: string,
  entityPk: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'AUTHORIZE' | 'REJECT',
  newData: any,
  oldData: any = null
) {
  try {
    const adminUser = await prisma.app_users.findFirst({
      where: {
        OR: [{ email: 'admin@banuat.local' }, { email: 'supervisor@banuat.local' }]
      }
    });
    await prisma.audit_logs.create({
      data: {
        actor_user_id: adminUser?.id ?? null,
        entity_name: entityName,
        entity_pk: entityPk,
        action,
        old_data: oldData ?? undefined,
        new_data: newData,
        connection_id: BigInt(1)
      }
    });
  } catch (err) {
    console.warn('Error no crítico al guardar audit_log admin:', err);
  }
}

/**
 * GET /api/admin/resumen
 * Indicadores generales, personal conectado y actividad reciente para InicioAdministrador.tsx
 */
adminRouter.get('/resumen', async (_req: Request, res: Response) => {
  try {
    const [
      totalClientes,
      solicitudesPendientes,
      empleadosActivos,
      ultimosLogs,
      ultimasTx
    ] = await Promise.all([
      prisma.customers.count(),
      prisma.loan_applications.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } }
      }),
      prisma.employees.findMany({
        where: { status: 'ACTIVE' },
        include: {
          app_users: {
            include: {
              app_user_roles_app_user_roles_user_idToapp_users: {
                include: { roles: true }
              }
            }
          },
          branches: true
        },
        orderBy: { id: 'asc' }
      }),
      prisma.audit_logs.findMany({
        orderBy: { occurred_at: 'desc' },
        take: 8
      }),
      prisma.financial_transactions.findMany({
        orderBy: { created_at: 'desc' },
        take: 6,
        include: { customers: true }
      })
    ]);

    const altasPendientes = await prisma.customers.count({
      where: {
        OR: [{ status: { not: 'ACTIVE' } }, { accounts: { none: {} } }]
      }
    });

    const personalConectado = empleadosActivos.map((emp) => {
      const rolObj = emp.app_users?.app_user_roles_app_user_roles_user_idToapp_users?.[0]?.roles;
      return {
        id: emp.id.toString(),
        numeroEmpleado: emp.employee_number,
        nombre: [emp.first_name, emp.paternal_surname, emp.maternal_surname].filter(Boolean).join(' '),
        puesto: emp.job_title || rolObj?.name || 'Personal Operativo',
        correo: emp.app_users?.email || `${emp.employee_number.toLowerCase()}@banuat.local`,
        sucursal: emp.branches?.name || 'Sucursal Matriz Centro',
        ultimoAcceso: emp.app_users?.last_login_at
          ? emp.app_users.last_login_at.toLocaleString('es-MX')
          : 'Sesión activa hoy',
        estado: 'En línea'
      };
    });

    const actividadLogs = ultimosLogs.map((log) => ({
      id: `LOG-${log.id.toString()}`,
      departamento: log.entity_name.includes('loan')
        ? 'Préstamos'
        : log.entity_name.includes('customer')
        ? 'Clientes'
        : log.entity_name.includes('cash')
        ? 'Caja'
        : 'Administración',
      titulo: `${log.action} en ${log.entity_name}`,
      detalle: `Registro #${log.entity_pk}`,
      fecha: log.occurred_at.toLocaleString('es-MX')
    }));

    const actividadTx = ultimasTx.map((tx) => ({
      id: `TX-${tx.id.toString()}`,
      departamento: 'Caja',
      titulo: `${tx.transaction_type} (${tx.receipt_number})`,
      detalle: `${tx.customers ? `${tx.customers.first_name} ${tx.customers.paternal_surname}` : 'Socio'} · $${Number(tx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
      fecha: tx.created_at.toLocaleString('es-MX')
    }));

    res.json(
      serializeData({
        indicadores: {
          clientesRegistrados: totalClientes,
          altasPendientes,
          solicitudesPendientes,
          personalConectado: personalConectado.length
        },
        personalConectado,
        actividadReciente: [...actividadLogs, ...actividadTx].slice(0, 10)
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/clientes
 * Datos completos de clientes, solicitudes de alta y expedientes digitales para admin/Clientes.tsx
 */
adminRouter.get('/clientes', async (_req: Request, res: Response) => {
  try {
    const clientes = await prisma.customers.findMany({
      include: {
        accounts: true,
        customer_documents: true,
        customer_income_records: true,
        loyalty_accounts: true
      },
      orderBy: { created_at: 'desc' }
    });

    const mapeados = clientes.map((c) => {
      const nombre = [c.first_name, c.middle_name, c.paternal_surname, c.maternal_surname]
        .filter(Boolean)
        .join(' ');
      const cuentaPrincipal = c.accounts[0]?.account_number || 'Sin cuenta asignada';
      const docs = c.customer_documents.map((d) => ({
        id: d.id.toString(),
        tipo: d.document_type,
        uri: d.storage_uri,
        hash: d.sha256_hash || 'SHA256-VERIFIED',
        estado: d.status,
        fecha: d.uploaded_at.toISOString().split('T')[0]
      }));

      let estadoUI: 'Activo' | 'Pendiente' | 'Rechazado' | 'Suspendido' = 'Activo';
      if (c.status === 'INACTIVE') estadoUI = 'Pendiente';
      else if (c.status === 'BLOCKED') estadoUI = 'Suspendido';
      else if (c.accounts.length === 0) estadoUI = 'Pendiente';

      const ingresoRecord = c.customer_income_records[0];

      return {
        id: c.id.toString(),
        codigo: c.customer_number || `CTE-${String(c.id).padStart(4, '0')}`,
        nombre,
        rfc: c.rfc || 'S/R',
        curp: c.curp || 'N/A',
        correo: c.email || 'Sin correo',
        telefono: c.phone || 'Sin teléfono',
        cuenta: cuentaPrincipal,
        saldoTotal: c.accounts.reduce((acc, a) => acc + Number(a.balance || 0), 0),
        puntos: Number(c.loyalty_accounts?.points_balance || 0),
        ingresoMensual: Number(ingresoRecord?.monthly_amount || 0),
        egresoMensual: 0,
        estado: estadoUI,
        statusRaw: c.status,
        fechaAlta: c.created_at.toISOString().split('T')[0],
        documentos: docs
      };
    });

    const total = mapeados.length;
    const activos = mapeados.filter((c) => c.estado === 'Activo').length;
    const pendientes = mapeados.filter((c) => c.estado === 'Pendiente').length;
    const revisadas = total - pendientes;

    res.json(
      serializeData({
        resumen: {
          total,
          activos,
          pendientes,
          revisadas
        },
        clientes: mapeados
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/clientes/:id/estado
 * Permite al Administrador autorizar (Activo), dejar pendiente o suspender un socio.
 */
adminRouter.patch('/clientes/:id/estado', async (req: Request, res: Response) => {
  try {
    const customerId = BigInt(req.params.id);
    const { estado } = req.body; // 'Activo' | 'Pendiente' | 'Suspendido' | 'Rechazado'

    const cliente = await prisma.customers.findUnique({
      where: { id: customerId },
      include: { accounts: true, loyalty_accounts: true }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    let nuevoStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' = 'ACTIVE';
    if (estado === 'Pendiente' || estado === 'Rechazado') nuevoStatus = 'INACTIVE';
    else if (estado === 'Suspendido') nuevoStatus = 'BLOCKED';

    const actualizado = await prisma.customers.update({
      where: { id: customerId },
      data: { status: nuevoStatus }
    });

    if (nuevoStatus === 'ACTIVE' && cliente.accounts.length === 0) {
      const prodAhorro = await prisma.financial_products.findFirst({
        where: { product_type: 'DEPOSIT_ACCOUNT', is_active: true }
      });
      if (prodAhorro) {
        const numCuenta = `0100${Date.now().toString().slice(-6)}`;
        await prisma.accounts.create({
          data: {
            customer_id: customerId,
            product_id: prodAhorro.id,
            account_number: numCuenta,
            balance: 0,
            status: 'ACTIVE'
          }
        });
      }
      if (!cliente.loyalty_accounts) {
        await prisma.loyalty_accounts.create({
          data: {
            customer_id: customerId,
            points_balance: BigInt(1000),
            status: 'ACTIVE'
          }
        });
      }
    }

    await registrarAuditoriaAdmin(
      'customers',
      customerId.toString(),
      nuevoStatus === 'ACTIVE' ? 'AUTHORIZE' : 'UPDATE',
      { status: nuevoStatus, estadoUI: estado },
      { status: cliente.status }
    );

    res.json(
      serializeData({
        ok: true,
        id: actualizado.id.toString(),
        estado,
        status: actualizado.status
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/trabajadores
 * Lista de trabajadores (employees + app_users + roles) y métricas para Trabajadores.tsx
 */
adminRouter.get('/trabajadores', async (_req: Request, res: Response) => {
  try {
    const empleados = await prisma.employees.findMany({
      include: {
        branches: true,
        app_users: {
          include: {
            app_user_roles_app_user_roles_user_idToapp_users: {
              include: { roles: true }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    const lista = empleados.map((e) => {
      const nombre = [e.first_name, e.paternal_surname, e.maternal_surname].filter(Boolean).join(' ');
      const rolRel = e.app_users?.app_user_roles_app_user_roles_user_idToapp_users?.[0]?.roles;
      const codigoRol = rolRel?.code || e.job_title || 'EXECUTIVE';

      let puestoLabel = 'Escritorio';
      if (codigoRol === 'SUPERVISOR' || (e.job_title || '').toUpperCase().includes('SUPERVISOR')) {
        puestoLabel = 'Supervisor';
      } else if (codigoRol === 'CASHIER' || (e.job_title || '').toUpperCase().includes('CAJERO')) {
        puestoLabel = 'Cajero';
      } else if (codigoRol === 'ROUTING' || (e.job_title || '').toUpperCase().includes('RECEPCION') || (e.job_title || '').toUpperCase().includes('CANALIZACION')) {
        puestoLabel = 'Recepción';
      } else if (codigoRol === 'ADMIN' || (e.job_title || '').toUpperCase().includes('ADMIN')) {
        puestoLabel = 'Administrador';
      }

      const activo = e.status === 'ACTIVE' && (e.app_users ? e.app_users.is_enabled : true);

      return {
        id: e.id.toString(),
        numeroEmpleado: e.employee_number,
        nombre,
        correo: e.app_users?.email || `${e.employee_number.toLowerCase()}@banuat.local`,
        usuario: e.app_users?.username || e.employee_number.toLowerCase(),
        puesto: puestoLabel,
        rolCodigo: codigoRol,
        sucursal: e.branches?.name || 'Sucursal Matriz Centro',
        estado: activo ? 'Activo' : 'Suspendido',
        fechaIngreso: e.created_at.toISOString().split('T')[0]
      };
    });

    const total = lista.length;
    const activos = lista.filter((t) => t.estado === 'Activo').length;
    const supervisores = lista.filter((t) => t.puesto === 'Supervisor').length;
    const cuentasRegistradas = empleados.filter((e) => Boolean(e.app_users)).length;

    res.json(
      serializeData({
        resumen: {
          total,
          activos,
          supervisores,
          cuentasRegistradas
        },
        trabajadores: lista
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/trabajadores
 * Crea un nuevo empleado, su cuenta en app_users y le asigna el rol correspondiente.
 */
adminRouter.post('/trabajadores', async (req: Request, res: Response) => {
  try {
    const { nombre, correo, puesto, estado, contrasena } = req.body;

    if (!nombre || !correo || !puesto || !contrasena) {
      return res.status(400).json({
        error: 'Nombre completo, correo, puesto y contraseña inicial son obligatorios.'
      });
    }

    const emailClean = String(correo).trim().toLowerCase();
    const existente = await prisma.app_users.findFirst({
      where: { email: emailClean }
    });
    if (existente) {
      return res.status(400).json({
        error: 'Ya existe una cuenta registrada con ese correo electrónico.'
      });
    }

    const partes = String(nombre).trim().split(/\s+/);
    const firstName = partes[0] || 'Trabajador';
    const paternalSurname = partes[1] || 'BANUAT';
    const maternalSurname = partes.slice(2).join(' ') || null;

    const sucursal = await prisma.branches.findFirst({ where: { is_active: true } });
    const countEmp = await prisma.employees.count();
    const empNumber = `EMP-${String(countEmp + 10).padStart(3, '0')}`;

    const mapPuestoToRole: Record<string, { jobTitle: string; roleCode: string; roleName: string }> = {
      supervisor: { jobTitle: 'SUPERVISOR', roleCode: 'SUPERVISOR', roleName: 'Supervisor' },
      escritorio: { jobTitle: 'EJECUTIVO', roleCode: 'EXECUTIVE', roleName: 'Ejecutivo de escritorio' },
      cajero: { jobTitle: 'CAJERO', roleCode: 'CASHIER', roleName: 'Cajero' },
      recepcion: { jobTitle: 'RECEPCION', roleCode: 'ROUTING', roleName: 'Personal de canalización' },
      admin: { jobTitle: 'ADMINISTRADOR', roleCode: 'ADMIN', roleName: 'Administrador' }
    };

    const configRol = mapPuestoToRole[String(puesto).toLowerCase()] || mapPuestoToRole.escritorio;
    const esActivo = estado !== 'Suspendido';

    const nuevoEmpleado = await prisma.employees.create({
      data: {
        employee_number: empNumber,
        branch_id: sucursal?.id ?? null,
        first_name: firstName,
        paternal_surname: paternalSurname,
        maternal_surname: maternalSurname,
        job_title: configRol.jobTitle,
        hired_on: new Date(),
        status: esActivo ? 'ACTIVE' : 'SUSPENDED'
      }
    });

    const usernameBase = emailClean.split('@')[0] + '_' + Date.now().toString().slice(-3);
    const nuevoUsuario = await prisma.app_users.create({
      data: {
        username: usernameBase,
        email: emailClean,
        password_hash: String(contrasena),
        employee_id: nuevoEmpleado.id,
        is_enabled: esActivo
      }
    });

    let roleRecord = await prisma.roles.findFirst({ where: { code: configRol.roleCode } });
    if (!roleRecord) {
      roleRecord = await prisma.roles.create({
        data: {
          code: configRol.roleCode,
          name: configRol.roleName,
          description: `Rol ${configRol.roleName}`
        }
      });
    }

    await prisma.app_user_roles.create({
      data: {
        user_id: nuevoUsuario.id,
        role_id: roleRecord.id,
        assigned_by: nuevoUsuario.id
      }
    });

    await registrarAuditoriaAdmin(
      'employees',
      nuevoEmpleado.id.toString(),
      'INSERT',
      {
        employee_number: empNumber,
        email: emailClean,
        role: configRol.roleCode,
        status: nuevoEmpleado.status
      }
    );

    res.status(201).json(
      serializeData({
        ok: true,
        trabajador: {
          id: nuevoEmpleado.id.toString(),
          numeroEmpleado: empNumber,
          nombre: [firstName, paternalSurname, maternalSurname].filter(Boolean).join(' '),
          correo: emailClean,
          puesto: configRol.roleName,
          estado: esActivo ? 'Activo' : 'Suspendido',
          fechaIngreso: nuevoEmpleado.created_at.toISOString().split('T')[0]
        }
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/trabajadores/:id/estado
 * Alterna o actualiza el estado Activo / Suspendido de un trabajador.
 */
adminRouter.patch('/trabajadores/:id/estado', async (req: Request, res: Response) => {
  try {
    const empId = BigInt(req.params.id);
    const emp = await prisma.employees.findUnique({
      where: { id: empId },
      include: { app_users: true }
    });

    if (!emp) {
      return res.status(404).json({ error: 'Trabajador no encontrado.' });
    }

    const nuevoActivo = emp.status !== 'ACTIVE';
    const nuevoStatus = nuevoActivo ? 'ACTIVE' : 'SUSPENDED';

    await prisma.employees.update({
      where: { id: empId },
      data: { status: nuevoStatus }
    });

    if (emp.app_users) {
      await prisma.app_users.update({
        where: { id: emp.app_users.id },
        data: { is_enabled: nuevoActivo }
      });
    }

    await registrarAuditoriaAdmin(
      'employees',
      empId.toString(),
      'UPDATE',
      { status: nuevoStatus },
      { status: emp.status }
    );

    res.json(
      serializeData({
        ok: true,
        id: empId.toString(),
        estado: nuevoActivo ? 'Activo' : 'Suspendido'
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/operaciones
 * Panorama consolidado de Préstamos, Caja y Atención para OperacionesAdmin.tsx
 */
adminRouter.get('/operaciones', async (_req: Request, res: Response) => {
  try {
    const [solicitudesPrestamo, movimientosCaja, turnosAtencion] = await Promise.all([
      prisma.loan_applications.findMany({
        include: {
          customers: true,
          financial_products: true
        },
        orderBy: { created_at: 'desc' },
        take: 40
      }),
      prisma.financial_transactions.findMany({
        include: {
          customers: true
        },
        orderBy: { created_at: 'desc' },
        take: 40
      }),
      prisma.service_turns.findMany({
        include: {
          customers: true,
          turn_types: true
        },
        orderBy: { created_at: 'desc' },
        take: 40
      })
    ]);

    const prestamos = solicitudesPrestamo.map((s) => {
      const clienteNombre = s.customers
        ? [s.customers.first_name, s.customers.paternal_surname].filter(Boolean).join(' ')
        : 'Socio BANUAT';

      let estadoUI = 'Pendiente';
      if (s.status === 'UNDER_REVIEW') estadoUI = 'En revisión';
      else if (s.status === 'APPROVED') estadoUI = 'Autorizado';
      else if (s.status === 'REJECTED') estadoUI = 'Rechazado';

      return {
        id: s.id.toString(),
        folio: `SOL-${String(s.id).padStart(4, '0')}`,
        cliente: clienteNombre,
        producto: s.financial_products?.name || 'Préstamo Personal',
        monto: Number(s.requested_amount),
        plazo: `${s.term_months} meses`,
        tasa: `${(Number(s.proposed_annual_rate) * 100).toFixed(1)}%`,
        estado: estadoUI,
        fecha: s.created_at.toISOString().split('T')[0]
      };
    });

    const caja = movimientosCaja.map((m) => {
      const clienteNombre = m.customers
        ? [m.customers.first_name, m.customers.paternal_surname].filter(Boolean).join(' ')
        : 'Operación de ventanilla';

      let tipoUI = 'Depósito';
      if (m.transaction_type === 'ACCOUNT_WITHDRAWAL' || m.transaction_type === 'LOAN_DISBURSEMENT') {
        tipoUI = 'Retiro';
      } else if (m.transaction_type === 'LOAN_PAYMENT') {
        tipoUI = 'Pago';
      }

      return {
        id: m.id.toString(),
        referencia: m.receipt_number,
        cliente: clienteNombre,
        tipo: tipoUI,
        monto: Number(m.amount),
        canal: m.channel,
        estado: m.status === 'POSTED' ? 'Aplicado' : m.status,
        fecha: m.created_at.toLocaleString('es-MX')
      };
    });

    const atencion = turnosAtencion.map((t) => {
      const clienteNombre = t.customers
        ? [t.customers.first_name, t.customers.paternal_surname].filter(Boolean).join(' ')
        : t.notes || 'Visitante en sucursal';

      const areaUI = t.service_area_snapshot === 'DESK' ? 'Escritorio' : 'Recepción';

      return {
        id: t.id.toString(),
        folio: `T-${String(t.id).padStart(3, '0')}`,
        cliente: clienteNombre,
        tramite: t.turn_types?.name || 'Atención general',
        area: areaUI,
        prioridad: t.priority_snapshot,
        estado: t.status === 'COMPLETED' ? 'Atendido' : t.status === 'WAITING' ? 'En espera' : 'En atención',
        fecha: t.created_at.toLocaleString('es-MX')
      };
    });

    const totalOperaciones = prestamos.length + caja.length + atencion.length;

    res.json(
      serializeData({
        resumen: {
          totalOperaciones,
          solicitudesPrestamo: prestamos.length,
          movimientosCaja: caja.length,
          registrosAtencion: atencion.length
        },
        prestamos,
        caja,
        atencion
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/productos
 * Catálogo completo de productos financieros (Ahorro, Crédito, Servicios) para ProductosAdmin.tsx
 */
adminRouter.get('/productos', async (_req: Request, res: Response) => {
  try {
    const productos = await prisma.financial_products.findMany({
      orderBy: { id: 'desc' }
    });

    const lista = productos.map((p) => {
      let tipoUI: 'Ahorro' | 'Crédito' | 'Servicios' = 'Ahorro';
      if (p.product_type === 'LOAN') tipoUI = 'Crédito';
      else if (p.product_type === 'INSURANCE') tipoUI = 'Servicios';
      else if (p.product_type === 'DEPOSIT_ACCOUNT' || p.product_type === 'INVESTMENT') tipoUI = 'Ahorro';

      let plazoLabel = 'Variable';
      if (p.maximum_term_days) {
        if (p.maximum_term_days <= 35) plazoLabel = 'Mensual';
        else if (p.maximum_term_days <= 190) plazoLabel = 'Semestral';
        else plazoLabel = 'Anual';
      }

      return {
        id: p.id.toString(),
        codigo: p.code,
        nombre: p.name,
        tipo: tipoUI,
        productTypeRaw: p.product_type,
        descripcion: p.description || 'Producto financiero oficial de BANUAT.',
        montoMinimo: Number(p.minimum_amount || 0),
        montoMaximo: Number(p.maximum_amount || 150000),
        tasaInteres: Number(p.default_annual_rate || 0) * 100,
        plazo: plazoLabel,
        estado: p.is_active ? 'Activo' : 'Inactivo'
      };
    });

    const total = lista.length;
    const activos = lista.filter((p) => p.estado === 'Activo').length;
    const credito = lista.filter((p) => p.tipo === 'Crédito').length;
    const ahorro = lista.filter((p) => p.tipo === 'Ahorro').length;

    res.json(
      serializeData({
        resumen: {
          total,
          activos,
          credito,
          ahorro
        },
        productos: lista
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/productos
 * Registra un nuevo producto financiero desde ProductosAdmin.tsx
 */
adminRouter.post('/productos', async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      tipo,
      descripcion,
      montoMinimo,
      montoMaximo,
      tasaInteres,
      plazo,
      estado
    } = req.body;

    if (!nombre || !tipo) {
      return res.status(400).json({ error: 'El nombre y el tipo de producto son obligatorios.' });
    }

    let productType: 'DEPOSIT_ACCOUNT' | 'LOAN' | 'INVESTMENT' | 'INSURANCE' = 'DEPOSIT_ACCOUNT';
    if (tipo === 'Crédito') productType = 'LOAN';
    else if (tipo === 'Servicios') productType = 'INSURANCE';

    let termDays = 365;
    if (plazo === 'Mensual') termDays = 30;
    else if (plazo === 'Semestral') termDays = 180;

    const code = `PRD-${Date.now().toString().slice(-6)}`;
    const creado = await prisma.financial_products.create({
      data: {
        code,
        name: String(nombre).trim(),
        product_type: productType,
        description: descripcion ? String(descripcion).trim() : 'Producto financiero BANUAT',
        minimum_amount: montoMinimo ? Number(montoMinimo) : 500,
        maximum_amount: montoMaximo ? Number(montoMaximo) : 100000,
        minimum_term_days: 30,
        maximum_term_days: termDays,
        default_annual_rate: tasaInteres ? Number(tasaInteres) / 100 : 0.05,
        is_active: estado !== 'Inactivo'
      }
    });

    await registrarAuditoriaAdmin('financial_products', creado.id.toString(), 'INSERT', {
      code,
      name: creado.name,
      product_type: creado.product_type
    });

    res.status(201).json(serializeData({ ok: true, producto: creado }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/productos/:id/estado
 * Alterna el estado Activo/Inactivo de un producto financiero.
 */
adminRouter.patch('/productos/:id/estado', async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const prod = await prisma.financial_products.findUnique({ where: { id } });
    if (!prod) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const actualizado = await prisma.financial_products.update({
      where: { id },
      data: { is_active: !prod.is_active }
    });

    await registrarAuditoriaAdmin(
      'financial_products',
      id.toString(),
      'UPDATE',
      { is_active: actualizado.is_active },
      { is_active: prod.is_active }
    );

    res.json(
      serializeData({
        ok: true,
        id: actualizado.id.toString(),
        estado: actualizado.is_active ? 'Activo' : 'Inactivo'
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/catalogos
 * Retorna catálogos de recompensas, temporadas y disponibilidad por área para CatalogosAdmin.tsx
 */
adminRouter.get('/catalogos', async (_req: Request, res: Response) => {
  try {
    const [items, temporadas, totalProductosFinancieros] = await Promise.all([
      prisma.loyalty_catalog_items.findMany({
        include: {
          catalog_seasons: true,
          suppliers: true
        },
        orderBy: { id: 'desc' }
      }),
      prisma.catalog_seasons.findMany({
        include: {
          loyalty_catalog_items: true
        },
        orderBy: { starts_on: 'desc' }
      }),
      prisma.financial_products.count({ where: { is_active: true } })
    ]);

    const catalogosMapeados = items.map((item) => ({
      id: item.id.toString(),
      codigo: item.code,
      nombre: item.name,
      descripcion: item.description || 'Recompensa oficial del programa de lealtad BANUAT.',
      puntos: Number(item.points_cost),
      equivalenteMxn: Number(item.points_cost) / 100,
      stock: item.stock_quantity,
      temporada: item.catalog_seasons?.name || 'Permanente',
      proveedor: item.suppliers?.name || 'Proveedor Oficial BANUAT',
      estado: item.is_active ? 'Activo' : 'Inactivo'
    }));

    const temporadasMapeadas = temporadas.map((t) => ({
      id: t.id.toString(),
      nombre: t.name,
      inicio: t.starts_on.toISOString().split('T')[0],
      fin: t.ends_on.toISOString().split('T')[0],
      totalArticulos: t.loyalty_catalog_items.length,
      estado: t.is_active ? 'Activa' : 'Inactiva'
    }));

    const areasActivas = Object.values(configInstitucionalExtra.disponibilidadCatalogos).filter(Boolean).length;

    res.json(
      serializeData({
        indicadores: {
          catalogosRegistrados: catalogosMapeados.length,
          temporadasActivas: temporadasMapeadas.filter((t) => t.estado === 'Activa').length,
          productosDisponibles: totalProductosFinancieros + catalogosMapeados.length,
          areasConfiguradas: areasActivas
        },
        catalogos: catalogosMapeados,
        temporadas: temporadasMapeadas,
        disponibilidad: configInstitucionalExtra.disponibilidadCatalogos
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/catalogos/item
 * Crea un nuevo artículo/catálogo en loyalty_catalog_items
 */
adminRouter.post('/catalogos/item', async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, puntos, stock, temporadaId } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del catálogo/artículo es obligatorio.' });
    }

    const season = temporadaId
      ? await prisma.catalog_seasons.findUnique({ where: { id: BigInt(temporadaId) } })
      : await prisma.catalog_seasons.findFirst({ where: { is_active: true } });

    const supplier = await prisma.suppliers.findFirst({ where: { is_active: true } });
    const code = `CAT-${Date.now().toString().slice(-6)}`;

    const nuevo = await prisma.loyalty_catalog_items.create({
      data: {
        code,
        name: String(nombre).trim(),
        description: descripcion ? String(descripcion).trim() : 'Catálogo institucional BANUAT',
        points_cost: BigInt(puntos ? Number(puntos) : 2500),
        stock_quantity: stock ? Number(stock) : 25,
        season_id: season?.id ?? null,
        supplier_id: supplier?.id ?? null,
        is_active: true
      }
    });

    await registrarAuditoriaAdmin('loyalty_catalog_items', nuevo.id.toString(), 'INSERT', {
      code,
      name: nuevo.name
    });

    res.status(201).json(serializeData({ ok: true, item: nuevo }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/catalogos/temporada
 * Crea una nueva temporada en catalog_seasons
 */
adminRouter.post('/catalogos/temporada', async (req: Request, res: Response) => {
  try {
    const { nombre, fechaInicio, fechaFin, activa } = req.body;
    if (!nombre || !fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Nombre, fecha de inicio y fecha de fin son obligatorios.' });
    }

    const creada = await prisma.catalog_seasons.create({
      data: {
        name: String(nombre).trim(),
        starts_on: new Date(fechaInicio),
        ends_on: new Date(fechaFin),
        is_active: activa !== false
      }
    });

    await registrarAuditoriaAdmin('catalog_seasons', creada.id.toString(), 'INSERT', {
      name: creada.name
    });

    res.status(201).json(serializeData({ ok: true, temporada: creada }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/catalogos/disponibilidad
 * Conmuta la disponibilidad de consulta de catálogos para un área operativa.
 */
adminRouter.patch('/catalogos/disponibilidad', async (req: Request, res: Response) => {
  try {
    const { area, habilitado } = req.body;
    if (area && area in configInstitucionalExtra.disponibilidadCatalogos) {
      (configInstitucionalExtra.disponibilidadCatalogos as any)[area] = Boolean(habilitado);
      await registrarAuditoriaAdmin('catalog_availability', String(area), 'UPDATE', {
        area,
        habilitado: Boolean(habilitado)
      });
    }
    res.json({
      ok: true,
      disponibilidad: configInstitucionalExtra.disponibilidadCatalogos
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/promociones
 * Lista de promociones registradas y métricas de vigencia para PromocionesAdmin.tsx
 */
adminRouter.get('/promociones', async (_req: Request, res: Response) => {
  try {
    const promociones = await prisma.promotions.findMany({
      orderBy: { starts_at: 'desc' }
    });

    const lista = promociones.map((p) => {
      let estadoUI: 'activa' | 'programada' | 'finalizada' = 'activa';
      if (p.status === 'DRAFT') estadoUI = 'programada';
      else if (p.status === 'ENDED' || p.status === 'CANCELLED') estadoUI = 'finalizada';

      return {
        id: p.id.toString(),
        nombre: p.title,
        descripcion: p.message,
        inicio: p.starts_at.toISOString().split('T')[0],
        fin: p.ends_at.toISOString().split('T')[0],
        estado: estadoUI,
        statusRaw: p.status
      };
    });

    const total = lista.length;
    const activas = lista.filter((p) => p.estado === 'activa').length;
    const programadas = lista.filter((p) => p.estado === 'programada').length;
    const finalizadas = lista.filter((p) => p.estado === 'finalizada').length;

    res.json(
      serializeData({
        indicadores: {
          total,
          activas,
          programadas,
          finalizadas,
          beneficiosDisponibles: activas + programadas
        },
        promociones: lista
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/promociones
 * Crea una nueva promoción en la tabla promotions de MySQL.
 */
adminRouter.post('/promociones', async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      tipo,
      descripcion,
      productoRelacionado,
      valorBeneficio,
      requisitos,
      fechaInicio,
      fechaFin,
      estadoInicial
    } = req.body;

    if (!nombre || !descripcion) {
      return res.status(400).json({ error: 'Nombre y descripción de la promoción son obligatorios.' });
    }

    const detallesExtra = [
      descripcion,
      tipo ? `Tipo: ${tipo}` : null,
      productoRelacionado ? `Aplica en: ${productoRelacionado}` : null,
      valorBeneficio ? `Beneficio: ${valorBeneficio}` : null,
      requisitos ? `Requisitos: ${requisitos}` : null
    ]
      .filter(Boolean)
      .join(' · ');

    const startsAt = fechaInicio ? new Date(fechaInicio) : new Date();
    const endsAt = fechaFin ? new Date(fechaFin) : new Date(Date.now() + 30 * 86400000);
    const status = estadoInicial === 'activa' ? 'ACTIVE' : 'DRAFT';

    const creada = await prisma.promotions.create({
      data: {
        title: String(nombre).trim(),
        message: detallesExtra,
        starts_at: startsAt,
        ends_at: endsAt,
        status
      }
    });

    await registrarAuditoriaAdmin('promotions', creada.id.toString(), 'INSERT', {
      title: creada.title,
      status: creada.status
    });

    res.status(201).json(serializeData({ ok: true, promocion: creada }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/promociones/:id/estado
 * Cambia el estado de una promoción (ACTIVE / ENDED).
 */
adminRouter.patch('/promociones/:id/estado', async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const promo = await prisma.promotions.findUnique({ where: { id } });
    if (!promo) {
      return res.status(404).json({ error: 'Promoción no encontrada.' });
    }

    const nuevoStatus = promo.status === 'ACTIVE' ? 'ENDED' : 'ACTIVE';
    const actualizada = await prisma.promotions.update({
      where: { id },
      data: { status: nuevoStatus }
    });

    await registrarAuditoriaAdmin('promotions', id.toString(), 'UPDATE', {
      status: nuevoStatus
    });

    res.json(serializeData({ ok: true, promocion: actualizada }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/reportes
 * Métricas y desgloses filtrados por fechas para las 5 secciones de ReportesAdmin.tsx
 */
adminRouter.get('/reportes', async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const dateFilter: any = {};
    if (fechaInicio) {
      dateFilter.gte = new Date(`${String(fechaInicio)}T00:00:00.000Z`);
    }
    if (fechaFin) {
      dateFilter.lte = new Date(`${String(fechaFin)}T23:59:59.999Z`);
    }
    const hasDate = Object.keys(dateFilter).length > 0;

    const [clientes, prestamos, transacciones, empleados] = await Promise.all([
      prisma.customers.findMany({
        where: hasDate ? { created_at: dateFilter } : undefined,
        include: { accounts: true },
        orderBy: { created_at: 'desc' }
      }),
      prisma.loan_applications.findMany({
        where: hasDate ? { created_at: dateFilter } : undefined,
        include: { customers: true, financial_products: true },
        orderBy: { created_at: 'desc' }
      }),
      prisma.financial_transactions.findMany({
        where: hasDate ? { created_at: dateFilter } : undefined,
        include: { customers: true },
        orderBy: { created_at: 'desc' }
      }),
      prisma.employees.findMany({
        include: {
          branches: true,
          app_users: {
            include: {
              app_user_roles_app_user_roles_user_idToapp_users: {
                include: { roles: true }
              }
            }
          }
        }
      })
    ]);

    const depositos = transacciones.filter((t) => t.transaction_type === 'ACCOUNT_DEPOSIT');
    const retiros = transacciones.filter(
      (t) => t.transaction_type === 'ACCOUNT_WITHDRAWAL' || t.transaction_type === 'LOAN_DISBURSEMENT'
    );
    const pagos = transacciones.filter((t) => t.transaction_type === 'LOAN_PAYMENT');
    const importeTotalCaja = transacciones.reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const supervisoresCount = empleados.filter((e) => (e.job_title || '').toUpperCase().includes('SUPERVISOR')).length;
    const escritorioCount = empleados.filter((e) => (e.job_title || '').toUpperCase().includes('EJECUTIVO')).length;
    const cajerosCount = empleados.filter((e) => (e.job_title || '').toUpperCase().includes('CAJERO')).length;
    const recepcionCount = empleados.filter(
      (e) =>
        (e.job_title || '').toUpperCase().includes('RECEPCION') ||
        (e.job_title || '').toUpperCase().includes('CANALIZACION')
    ).length;

    res.json(
      serializeData({
        resumenGeneral: {
          clientesRegistrados: clientes.length,
          prestamosGestionados: prestamos.length,
          movimientosCaja: transacciones.length,
          personalRegistrado: empleados.length
        },
        clientes: {
          total: clientes.length,
          nuevos: clientes.filter((c) => c.status === 'ACTIVE').length,
          pendientes: clientes.filter((c) => c.status !== 'ACTIVE' || c.accounts.length === 0).length,
          registros: clientes.slice(0, 15).map((c) => ({
            id: c.id.toString(),
            codigo: c.customer_number || `CTE-${String(c.id).padStart(4, '0')}`,
            nombre: [c.first_name, c.paternal_surname].filter(Boolean).join(' '),
            rfc: c.rfc || 'S/R',
            cuenta: c.accounts[0]?.account_number || 'En trámite',
            estado: c.status === 'ACTIVE' ? 'Activo' : 'Pendiente',
            fecha: c.created_at.toISOString().split('T')[0]
          }))
        },
        prestamos: {
          recibidas: prestamos.length,
          autorizados: prestamos.filter((p) => p.status === 'APPROVED').length,
          rechazados: prestamos.filter((p) => p.status === 'REJECTED').length,
          pendientes: prestamos.filter((p) => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW').length,
          registros: prestamos.slice(0, 15).map((p) => ({
            id: p.id.toString(),
            folio: `SOL-${String(p.id).padStart(4, '0')}`,
            cliente: p.customers ? `${p.customers.first_name} ${p.customers.paternal_surname}` : 'Socio',
            producto: p.financial_products?.name || 'Préstamo Personal',
            monto: Number(p.requested_amount),
            estado: p.status,
            fecha: p.created_at.toISOString().split('T')[0]
          }))
        },
        caja: {
          depositos: depositos.length,
          retiros: retiros.length,
          pagos: pagos.length,
          importeTotal: importeTotalCaja,
          registros: transacciones.slice(0, 15).map((t) => ({
            id: t.id.toString(),
            folio: t.receipt_number,
            cliente: t.customers ? `${t.customers.first_name} ${t.customers.paternal_surname}` : 'Ventanilla',
            tipo: t.transaction_type,
            monto: Number(t.amount),
            fecha: t.created_at.toISOString().split('T')[0]
          }))
        },
        personal: {
          supervisores: supervisoresCount,
          escritorio: escritorioCount,
          cajeros: cajerosCount,
          recepcion: recepcionCount,
          registros: empleados.map((e) => ({
            id: e.id.toString(),
            numero: e.employee_number,
            nombre: `${e.first_name} ${e.paternal_surname}`,
            puesto: e.job_title || 'Operativo',
            sucursal: e.branches?.name || 'Sucursal Matriz Centro',
            estado: e.status === 'ACTIVE' ? 'Activo' : 'Suspendido'
          }))
        }
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/auditoria
 * Consulta inmutable de audit_logs para AuditoriaAdmin.tsx
 */
adminRouter.get('/auditoria', async (_req: Request, res: Response) => {
  try {
    const [logs, usuariosActivos, usuariosMap] = await Promise.all([
      prisma.audit_logs.findMany({
        orderBy: { occurred_at: 'desc' },
        take: 100
      }),
      prisma.app_users.count({ where: { is_enabled: true } }),
      prisma.app_users.findMany({
        include: { employees: true, customers: true }
      })
    ]);

    const mapaUsuarios = new Map<string, string>();
    usuariosMap.forEach((u) => {
      const nombre = u.employees
        ? `${u.employees.first_name} ${u.employees.paternal_surname} (${u.employees.job_title})`
        : u.customers
        ? `${u.customers.first_name} ${u.customers.paternal_surname} (Socio)`
        : u.username;
      mapaUsuarios.set(u.id.toString(), nombre);
    });

    const actividades = logs.map((l) => {
      const ent = l.entity_name.toLowerCase();
      let modulo: 'Clientes' | 'Préstamos' | 'Caja' | 'Sistema' = 'Sistema';
      if (ent.includes('customer') || ent.includes('account')) modulo = 'Clientes';
      else if (ent.includes('loan') || ent.includes('collection')) modulo = 'Préstamos';
      else if (ent.includes('cash') || ent.includes('transaction')) modulo = 'Caja';

      let tipoAccion = 'modificacion';
      if (l.action === 'INSERT') tipoAccion = 'registro';
      else if (l.action === 'AUTHORIZE' || l.action === 'REJECT') tipoAccion = 'autorizacion';
      else if (l.action === 'DELETE') tipoAccion = 'eliminacion';

      const usuarioNombre = l.actor_user_id
        ? mapaUsuarios.get(l.actor_user_id.toString()) || `Usuario #${l.actor_user_id.toString()}`
        : 'Sistema Automático BANUAT';

      return {
        id: l.id.toString(),
        usuario: usuarioNombre,
        entidad: l.entity_name,
        registroId: l.entity_pk,
        accion: l.action,
        tipoAccion,
        modulo,
        detalle: l.new_data ? JSON.stringify(l.new_data).slice(0, 140) : `Operación sobre ${l.entity_name} #${l.entity_pk}`,
        fechaISO: l.occurred_at.toISOString().split('T')[0],
        fechaHora: l.occurred_at.toLocaleString('es-MX')
      };
    });

    const accionesAdmin = actividades.filter((a) => a.modulo === 'Sistema').length;

    res.json(
      serializeData({
        indicadores: {
          actividadesRegistradas: actividades.length,
          usuariosActivos,
          accionesAdministrativas: accionesAdmin
        },
        actividades
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/configuracion
 * Datos institucionales de la sucursal matriz y parámetros generales para ConfiguracionAdmin.tsx
 */
adminRouter.get('/configuracion', async (_req: Request, res: Response) => {
  try {
    const sucursal = await prisma.branches.findFirst({ where: { is_active: true } });

    res.json(
      serializeData({
        institucion: {
          id: sucursal?.id ?? 1,
          codigo: sucursal?.code || 'SUC-001',
          nombre: sucursal?.name || 'Cooperativa Financiera BANUAT',
          nombreComercial: configInstitucionalExtra.nombreComercial,
          correo: configInstitucionalExtra.correoInstitucional,
          telefono: sucursal?.phone || '833 212 3456',
          direccion: sucursal?.address || 'Av. Hidalgo 1200, Zona Centro',
          descripcion: configInstitucionalExtra.descripcion
        },
        parametros: {
          moneda: configInstitucionalExtra.moneda,
          formatoFecha: configInstitucionalExtra.formatoFecha,
          zonaHoraria: configInstitucionalExtra.zonaHoraria
        },
        seguridad: configInstitucionalExtra.seguridad,
        notificaciones: configInstitucionalExtra.notificaciones,
        preferencias: {
          temaVisual: configInstitucionalExtra.temaVisual,
          organizacionPanel: configInstitucionalExtra.organizacionPanel
        }
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/configuracion
 * Actualiza los datos institucionales en branches y las preferencias/parámetros del sistema.
 */
adminRouter.put('/configuracion', async (req: Request, res: Response) => {
  try {
    const { institucion, parametros, notificaciones, preferencias, seguridad } = req.body;

    const sucursal = await prisma.branches.findFirst({ where: { is_active: true } });
    if (sucursal && institucion) {
      await prisma.branches.update({
        where: { id: sucursal.id },
        data: {
          name: institucion.nombre || sucursal.name,
          phone: institucion.telefono || sucursal.phone,
          address: institucion.direccion || sucursal.address
        }
      });
      if (institucion.nombreComercial) configInstitucionalExtra.nombreComercial = institucion.nombreComercial;
      if (institucion.correo) configInstitucionalExtra.correoInstitucional = institucion.correo;
      if (institucion.descripcion) configInstitucionalExtra.descripcion = institucion.descripcion;
    }

    if (parametros) {
      if (parametros.moneda) configInstitucionalExtra.moneda = parametros.moneda;
      if (parametros.formatoFecha) configInstitucionalExtra.formatoFecha = parametros.formatoFecha;
      if (parametros.zonaHoraria) configInstitucionalExtra.zonaHoraria = parametros.zonaHoraria;
    }

    if (notificaciones) {
      configInstitucionalExtra.notificaciones = {
        ...configInstitucionalExtra.notificaciones,
        ...notificaciones
      };
    }

    if (preferencias) {
      if (preferencias.temaVisual) configInstitucionalExtra.temaVisual = preferencias.temaVisual;
      if (preferencias.organizacionPanel) configInstitucionalExtra.organizacionPanel = preferencias.organizacionPanel;
    }

    if (seguridad) {
      configInstitucionalExtra.seguridad = {
        ...configInstitucionalExtra.seguridad,
        ...seguridad
      };
    }

    await registrarAuditoriaAdmin('system_configuration', 'GLOBAL', 'UPDATE', {
      institucion,
      parametros,
      preferencias
    });

    res.json({
      ok: true,
      mensaje: 'Configuración institucional actualizada y registrada en auditoría.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/dudas
 * Lista de consultas/dudas de clientes (sincronizada entre MensajesDuda.tsx y AtencionCliente.tsx)
 */
adminRouter.get('/dudas', async (_req: Request, res: Response) => {
  try {
    const registros = await prisma.customer_notifications.findMany({
      where: {
        notification_type: 'GENERAL',
        title: { startsWith: '[DUDA]' }
      },
      include: {
        customers: true
      },
      orderBy: { created_at: 'desc' }
    });

    const consultas = registros.map((r) => {
      const rawTitle = r.title.replace(/^\[DUDA\]/, '');
      const matchCat = rawTitle.match(/^\[([^\]]+)\]/);
      const categoria = matchCat ? matchCat[1] : 'Préstamos';
      const restAfterCat = rawTitle.replace(/^\[[^\]]+\]/, '');
      const matchCli = restAfterCat.match(/^\[([^\]]+)\]/);
      const clienteExtra = matchCli ? matchCli[1] : '';
      const asunto = restAfterCat.replace(/^\[[^\]]+\]\s*/, '').trim() || 'Consulta general';

      const partesMsg = r.message.split('\n---RESPUESTA---\n');
      const descripcion = partesMsg[0] || r.message;
      const respuesta = partesMsg[1] || '';

      const nombreCliente =
        clienteExtra ||
        (r.customers
          ? [r.customers.first_name, r.customers.paternal_surname].filter(Boolean).join(' ')
          : 'Socio BANUAT');

      return {
        id: Number(r.id),
        cliente: nombreCliente,
        categoria,
        asunto,
        descripcion,
        respuesta,
        fecha: r.created_at.toLocaleDateString('es-MX'),
        estado: respuesta ? 'Atendida' : 'Pendiente'
      };
    });

    res.json(serializeData(consultas));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/dudas
 * Registra una nueva consulta de duda en MySQL (desde Escritorio o desde Portal del Cliente).
 */
adminRouter.post('/dudas', async (req: Request, res: Response) => {
  try {
    const { cliente, categoria, asunto, descripcion } = req.body;
    if (!asunto || !descripcion) {
      return res.status(400).json({ error: 'Asunto y descripción son obligatorios.' });
    }

    const nombreCli = String(cliente || 'Juan Pérez Hernández').trim();
    const catClean = String(categoria || 'Préstamos').trim();

    let socio = await prisma.customers.findFirst({
      where: {
        OR: [
          { first_name: { contains: nombreCli.split(' ')[0] } },
          { customer_number: nombreCli }
        ]
      }
    });
    if (!socio) {
      socio = await prisma.customers.findFirst();
    }
    if (!socio) {
      return res.status(400).json({ error: 'No existe un socio base en el sistema.' });
    }

    const creado = await prisma.customer_notifications.create({
      data: {
        customer_id: socio.id,
        title: `[DUDA][${catClean}][${nombreCli}] ${String(asunto).trim()}`,
        message: String(descripcion).trim(),
        notification_type: 'GENERAL',
        status: 'QUEUED'
      }
    });

    res.status(201).json(
      serializeData({
        id: Number(creado.id),
        cliente: nombreCli,
        categoria: catClean,
        asunto: String(asunto).trim(),
        descripcion: String(descripcion).trim(),
        respuesta: '',
        fecha: creado.created_at.toLocaleDateString('es-MX'),
        estado: 'Pendiente'
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/dudas/:id/responder
 * Guarda la respuesta del ejecutivo para una duda y la marca como Atendida en MySQL.
 */
adminRouter.patch('/dudas/:id/responder', async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const { respuesta } = req.body;
    if (!respuesta || !String(respuesta).trim()) {
      return res.status(400).json({ error: 'La respuesta no puede estar vacía.' });
    }

    const registro = await prisma.customer_notifications.findUnique({ where: { id } });
    if (!registro) {
      return res.status(404).json({ error: 'Consulta no encontrada.' });
    }

    const partesMsg = registro.message.split('\n---RESPUESTA---\n');
    const descripcionOriginal = partesMsg[0] || registro.message;
    const nuevoMensaje = `${descripcionOriginal}\n---RESPUESTA---\n${String(respuesta).trim()}`;

    await prisma.customer_notifications.update({
      where: { id },
      data: {
        message: nuevoMensaje,
        status: 'SENT',
        sent_at: new Date()
      }
    });

    await registrarAuditoriaAdmin('customer_notifications', id.toString(), 'UPDATE', {
      estado: 'Atendida',
      respuesta: String(respuesta).trim()
    });

    res.json({
      ok: true,
      id: Number(id),
      respuesta: String(respuesta).trim(),
      estado: 'Atendida'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
