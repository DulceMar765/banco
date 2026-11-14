export type Rol = 'cliente' | 'supervisor' | 'canalizacion' | 'ejecutivo' | 'cajero' | 'recepcion';

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
    else if (rolRaw === 'CANALIZACION' || rolRaw === 'ROUTING' || rolRaw === 'RECEPCION') rolNormalizado = 'recepcion';
    else if (rolRaw === 'CLIENTE' || rolRaw === 'CUSTOMER' || rolRaw === 'SOCIO') rolNormalizado = 'cliente';
    else if (rolRaw === 'CAJERO' || rolRaw === 'CASHIER') rolNormalizado = 'cajero';
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
    if (
      (email === 'canalizacion@banuat.local' && contrasena === 'Canalizacion123!') ||
      (email === 'recepcion@banuat.local' && contrasena === 'Recepcion123!') ||
      (email === 'recepcion2@banuat.local' && contrasena === 'Recepcion123!')
    ) {
      const u: Usuario = { correo: email, rol: 'recepcion', nombre: email.includes('2') ? 'Lucía Morales' : 'Sofía Navarro' };
      localStorage.setItem(CLAVE_SESION, JSON.stringify(u));
      return { ok: true, usuario: u };
    }
    if (
      (email === 'cajero@banuat.local' && contrasena === 'Cajero123!') ||
      (email === 'cajero2@banuat.local' && contrasena === 'Cajero123!')
    ) {
      const u: Usuario = { correo: email, rol: 'cajero', nombre: email.includes('2') ? 'Elena Vázquez' : 'Marcos Delgado' };
      localStorage.setItem(CLAVE_SESION, JSON.stringify(u));
      return { ok: true, usuario: u };
    }
    if (
      (email === 'ejecutivo@banuat.local' && contrasena === 'Ejecutivo123!') ||
      (email === 'ejecutivo2@banuat.local' && contrasena === 'Ejecutivo123!')
    ) {
      const u: Usuario = { correo: email, rol: 'ejecutivo', nombre: email.includes('2') ? 'Roberto Salazar' : 'Laura Mendoza' };
      localStorage.setItem(CLAVE_SESION, JSON.stringify(u));
      return { ok: true, usuario: u };
    }
    if (
      (email === 'cliente@banuat.local' && contrasena === 'Cliente123!') ||
      (email === 'socio.maria@banuat.local' && contrasena === 'Cliente123!')
    ) {
      const u: Usuario = { correo: email, rol: 'cliente', nombre: email.includes('maria') ? 'María Gómez' : 'Juan Pérez' };
      localStorage.setItem(CLAVE_SESION, JSON.stringify(u));
      return { ok: true, usuario: u };
    }
    return {
      ok: false,
      error: 'No fue posible conectar con el servidor de autenticación.'
    };
  }
}

export function getSesionActual(): Usuario | null {
  try {
    const raw = localStorage.getItem(CLAVE_SESION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const BASE_API_HOST = 'http://localhost:3001';

export function getApiUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${BASE_API_HOST}${clean}`;
}

export function fetchSocio(url: string, init?: RequestInit): Promise<Response> {
  const sesion = getSesionActual();
  const headers = new Headers(init?.headers || {});
  if (sesion?.correo) {
    headers.set('x-customer-email', sesion.correo);
  }
  return fetch(getApiUrl(url), { ...init, headers });
}
