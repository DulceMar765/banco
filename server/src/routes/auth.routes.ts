import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { PROJECT_PARAMETERS } from '../config/parameters.js';
import { serializeData } from '../utils/serializer.js';

export const authRouter = Router();

// Registro en memoria de intentos fallidos y bloqueos preventivos
const intentosFallidos = new Map<string, { intentos: number; bloqueadoHasta?: number }>();

/**
 * POST /api/auth/login
 * Soporta login por correo electrónico institucional o número de cuenta.
 * Aplica política de bloqueo de 15 minutos tras 5 intentos fallidos (RF-01 a RF-05).
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { identificador, correo, password, contrasena } = req.body;
    const credencial = (identificador || correo || '').trim().toLowerCase();
    const clave = password || contrasena || '';

    if (!credencial || !clave) {
      return res.status(400).json({ error: 'Credenciales incompletas.' });
    }

    const ahora = Date.now();
    const estadoIntentos = intentosFallidos.get(credencial);

    // Verificar si la cuenta está temporalmente bloqueada
    if (estadoIntentos?.bloqueadoHasta && ahora < estadoIntentos.bloqueadoHasta) {
      const minutosRestantes = Math.ceil((estadoIntentos.bloqueadoHasta - ahora) / (60 * 1000));
      return res.status(429).json({
        error: `Cuenta bloqueada temporalmente por seguridad. Intenta en ${minutosRestantes} minutos.`
      });
    }

    // Casos especiales: credenciales institucionales de prueba definidas en el sistema
    if (credencial === 'supervisor@banuat.local' && clave === 'Banuat123!') {
      intentosFallidos.delete(credencial);
      return res.json({
        id: '1',
        usuario: 'supervisor',
        correo: 'supervisor@banuat.local',
        nombre: 'Carlos Ramírez',
        rol: 'SUPERVISOR',
        puesto: 'Supervisor de Sucursal'
      });
    }

    if (
      (credencial === 'ejecutivo@banuat.local' && clave === 'Ejecutivo123!') ||
      (credencial === 'canalizacion@banuat.local' && clave === 'Canalizacion123!')
    ) {
      intentosFallidos.delete(credencial);
      const esCanalizacion = credencial.startsWith('canalizacion');
      return res.json({
        id: esCanalizacion ? '3' : '2',
        usuario: esCanalizacion ? 'canalizacion' : 'ejecutivo',
        correo: credencial,
        nombre: esCanalizacion ? 'Pedro Gómez' : 'Laura Mendoza',
        rol: esCanalizacion ? 'CANALIZACION' : 'EJECUTIVO',
        puesto: esCanalizacion ? 'Personal de Canalización' : 'Ejecutivo de Escritorio'
      });
    }

    // Buscar en app_users por email o username
    let user = await prisma.app_users.findFirst({
      where: {
        OR: [
          { email: credencial },
          { username: credencial }
        ]
      },
      include: {
        employees: true,
        customers: true,
        app_user_roles_app_user_roles_user_idToapp_users: {
          include: {
            roles: true
          }
        }
      }
    });

    // Si no se encuentra por email/username, buscar por número de cuenta oficial
    if (!user) {
      const account = await prisma.accounts.findUnique({
        where: { account_number: credencial },
        include: {
          customers: {
            include: {
              app_users: {
                include: {
                  employees: true,
                  customers: true,
                  app_user_roles_app_user_roles_user_idToapp_users: {
                    include: {
                      roles: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      if (account?.customers?.app_users) {
        user = account.customers.app_users as any;
      }
    }

    // Validar existencia y estado activo
    if (!user || !user.is_enabled) {
      const estado = registrarFallo(credencial);
      if (estado.intentos >= PROJECT_PARAMETERS.SECURITY.MAX_LOGIN_ATTEMPTS) {
        return res.status(429).json({
          error: `Cuenta bloqueada temporalmente por seguridad. Intenta en ${PROJECT_PARAMETERS.SECURITY.ACCOUNT_LOCK_MINUTES} minutos.`
        });
      }
      return res.status(401).json({ error: 'Credenciales inválidas o cuenta deshabilitada.' });
    }

    // Validación de contraseña
    const passwordValida = user.password_hash === clave;
    if (!passwordValida) {
      const estado = registrarFallo(credencial);
      if (estado.intentos >= PROJECT_PARAMETERS.SECURITY.MAX_LOGIN_ATTEMPTS) {
        return res.status(429).json({
          error: `Cuenta bloqueada temporalmente por seguridad. Intenta en ${PROJECT_PARAMETERS.SECURITY.ACCOUNT_LOCK_MINUTES} minutos.`
        });
      }
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Login exitoso: limpiar registro de fallos
    intentosFallidos.delete(credencial);

    // Actualizar última fecha de inicio de sesión
    await prisma.app_users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    const roles = user.app_user_roles_app_user_roles_user_idToapp_users.map(
      (ur) => ur.roles.name
    );
    const rolPrincipal = roles[0] || (user.employee_id ? 'EMPLEADO' : 'CLIENTE');

    const nombreCompleto = user.employees
      ? `${user.employees.first_name} ${user.employees.paternal_surname}`
      : user.customers
      ? `${user.customers.first_name} ${user.customers.paternal_surname}`
      : user.username;

    res.json(
      serializeData({
        id: user.id.toString(),
        usuario: user.username,
        correo: user.email,
        nombre: nombreCompleto,
        rol: rolPrincipal,
        roles,
        employee_id: user.employee_id?.toString() || null,
        customer_id: user.customer_id?.toString() || null
      })
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function registrarFallo(credencial: string) {
  const actual = intentosFallidos.get(credencial) || { intentos: 0 };
  actual.intentos += 1;

  if (actual.intentos >= PROJECT_PARAMETERS.SECURITY.MAX_LOGIN_ATTEMPTS) {
    actual.bloqueadoHasta = Date.now() + PROJECT_PARAMETERS.SECURITY.ACCOUNT_LOCK_MINUTES * 60 * 1000;
  }

  intentosFallidos.set(credencial, actual);
  return actual;
}
