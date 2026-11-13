export type Rol = 'cliente' | 'supervisor' | 'canalizacion' | 'ejecutivo';

export type Usuario = {
  correo: string;
  contrasena?: string;
  rol: Rol;
  nombre?: string;
  token?: string;
  id?: string;
};

const CLAVE_SESION = 'banuat_sesion';

export async function iniciarSesion(
  correo: string,
  contrasena: string
): Promise<{ ok: boolean; usuario?: Usuario; error?: string; status?: number }> {
  const email = correo.trim().toLowerCase();

  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: email, contrasena })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 429) {
        return {
          ok: false,
          status: 429,
          error: data.error || 'Cuenta bloqueada temporalmente por seguridad. Intenta en 15 minutos.'
        };
      }
      return {
        ok: false,
        status: res.status,
        error: data.error || 'Correo o contraseña incorrectos.'
      };
    }

    let rolNormalizado: Rol = 'ejecutivo';
    const rolRaw = String(data.rol || '').toUpperCase();
    if (rolRaw === 'SUPERVISOR') rolNormalizado = 'supervisor';
    else if (rolRaw === 'CANALIZACION') rolNormalizado = 'canalizacion';
    else if (rolRaw === 'CLIENTE') rolNormalizado = 'cliente';
    else if (rolRaw === 'EJECUTIVO' || rolRaw === 'EXECUTIVE') rolNormalizado = 'ejecutivo';

    const usuario: Usuario = {
      id: data.id ? String(data.id) : undefined,
      correo: data.correo || email,
      rol: rolNormalizado,
      nombre: data.nombre || 'Personal BANUAT'
    };

    localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));

    return {
      ok: true,
      status: 200,
      usuario
    };
  } catch (error) {
    console.warn('Backend no disponible para login, intentando autenticación local de contingencia:', error);
    if (email === 'supervisor@banuat.local' && contrasena === 'Banuat123!') {
      const u: Usuario = { correo: email, rol: 'supervisor', nombre: 'Carlos Ramírez' };
      localStorage.setItem(CLAVE_SESION, JSON.stringify(u));
      return { ok: true, usuario: u };
    }
    if (email === 'ejecutivo@banuat.local' && contrasena === 'Ejecutivo123!') {
      const u: Usuario = { correo: email, rol: 'ejecutivo', nombre: 'Laura Mendoza' };
      localStorage.setItem(CLAVE_SESION, JSON.stringify(u));
      return { ok: true, usuario: u };
    }
    if (email === 'canalizacion@banuat.local' && contrasena === 'Canalizacion123!') {
      const u: Usuario = { correo: email, rol: 'canalizacion', nombre: 'Pedro Gómez' };
      localStorage.setItem(CLAVE_SESION, JSON.stringify(u));
      return { ok: true, usuario: u };
    }
    return {
      ok: false,
      error: 'No fue posible conectar con el servidor de autenticación.'
    };
  }
}
