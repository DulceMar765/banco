
import { useState, type FormEvent } from 'react'
import {
  iniciarSesion,
  type Usuario,
} from '../../services/auth'
import './Login.css'

type Props = {
  onLoginSuccess: (usuario: Usuario) => void
}

export default function Login({ onLoginSuccess }: Props) {
  const [mensaje, setMensaje] = useState('')

  function manejarEnvio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMensaje('')

    const formulario = event.currentTarget
    const datos = new FormData(formulario)

    const correo = String(datos.get('correo') || '')
    const contrasena = String(datos.get('contrasena') || '')

    const usuario = iniciarSesion(correo, contrasena)

    if (!usuario) {
      setMensaje('Correo o contraseña incorrectos.')
      return
    }

    onLoginSuccess(usuario)
  }

  return (
    <main className="login-page">
      <span
        className="login-deco login-deco--naranja"
        aria-hidden="true"
      />

      <span
        className="login-deco login-deco--verde"
        aria-hidden="true"
      />

      <span
        className="login-deco login-deco--anillo"
        aria-hidden="true"
      />

      <div className="login-card">
        <section
          className="login-bienvenida"
          aria-labelledby="titulo-bienvenida"
        >
          <img
            src="/banuat-logo.png"
            alt="BANUAT Banco"
            className="login-logo"
          />

          <h1
            id="titulo-bienvenida"
            className="login-bienvenida__titulo"
          >
            Bienvenido
          </h1>

          <p className="login-bienvenida__texto">
            Accede a tu banca de forma segura
          </p>

          <div className="login-ilustracion">
            <span
              className="login-ilustracion__circulo"
              aria-hidden="true"
            />

            <span
              className="login-ilustracion__triangulo"
              aria-hidden="true"
            />

            <img
              src="/login-ilustracion.png"
              alt=""
              className="login-ilustracion__img"
            />
          </div>

          <div className="login-bienvenida__acciones">
            <button
              type="button"
              className="login-btn login-btn--contorno is-activo"
              aria-pressed="true"
            >
              Iniciar sesión
            </button>
          </div>
        </section>

        <section
          className="login-formulario"
          aria-labelledby="titulo-formulario"
        >
          <span
            className="login-formulario__punto"
            aria-hidden="true"
          />

          <span
            className="login-formulario__hojas"
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>

          <h2
            id="titulo-formulario"
            className="login-formulario__titulo"
          >
            Iniciar sesión
          </h2>

          <p className="login-formulario__subtitulo">
            Ingresa tus datos para continuar
          </p>

          <form
            className="login-form"
            onSubmit={manejarEnvio}
          >
            <div className="login-campo">
              <label htmlFor="correo">
                Correo electrónico
              </label>

              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>

            <div className="login-campo">
              <label htmlFor="contrasena">
                Contraseña
              </label>

              <input
                id="contrasena"
                name="contrasena"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>

            <a
              href="#"
              className="login-enlace login-enlace--olvido"
              onClick={(event) => event.preventDefault()}
            >
              ¿Olvidaste tu contraseña?
            </a>

            <div
              className="login-alerta"
              aria-live="polite"
            >
              {mensaje}
            </div>

            <button
              type="submit"
              className="login-btn login-btn--naranja"
            >
              Entrar
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
