
export type Rol = 'cliente' | 'supervisor'

export type Usuario = {
  correo: string
  contrasena: string
  rol: Rol
}

const CLAVE = 'banuat_usuarios'

const SUPERVISOR = {
  correo: 'supervisor@banuat.local',
  contrasena: 'Banuat123!',
  rol: 'supervisor' as const,
}

function obtenerUsuarios(): Usuario[] {
  try {
    const usuarios = JSON.parse(
      localStorage.getItem(CLAVE) || '[]',
    ) as Usuario[]

    if (!usuarios.some(u => u.correo === SUPERVISOR.correo)) {
      usuarios.push(SUPERVISOR)
      localStorage.setItem(CLAVE, JSON.stringify(usuarios))
    }

    return usuarios
  } catch {
    localStorage.setItem(CLAVE, JSON.stringify([SUPERVISOR]))
    return [SUPERVISOR]
  }
}

export function registrarUsuario(
  correo: string,
  contrasena: string,
): string | null {
  const email = correo.trim().toLowerCase()
  const usuarios = obtenerUsuarios()

  if (usuarios.some(u => u.correo.toLowerCase() === email)) {
    return 'Este correo ya está registrado.'
  }

  usuarios.push({
    correo: email,
    contrasena,
    rol: 'cliente',
  })

  localStorage.setItem(CLAVE, JSON.stringify(usuarios))
  return null
}

export function iniciarSesion(
  correo: string,
  contrasena: string,
): Usuario | null {
  const email = correo.trim().toLowerCase()

  return obtenerUsuarios().find(
    u => u.correo.toLowerCase() === email &&
         u.contrasena === contrasena,
  ) ?? null
}
