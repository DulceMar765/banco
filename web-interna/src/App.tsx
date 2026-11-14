
import { useState } from 'react'
import Login from './pages/login/Login'
import PanelSupervisor from './pages/supervisor/PanelSupervisor'
import Escritorio from './pages/canalizacion/Escritorio'
import PanelCajero from './pages/cajero/PanelCajero'
import Recepcion from './pages/recepcion/Recepcion'
import Cliente from './pages/cliente/Cliente'
import type { Usuario } from './services/auth'

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  const handleLogout = () => {
    setUsuario(null)
  }

  if (!usuario) {
    return <Login onLoginSuccess={setUsuario} />
  }

  if (usuario.rol === 'supervisor') {
    return <PanelSupervisor onLogout={handleLogout} />
  }

  if (usuario.rol === 'ejecutivo') {
    return <Escritorio onLogout={handleLogout} />
  }

  if (usuario.rol === 'cajero') {
    return <PanelCajero onLogout={handleLogout} />
  }

  if (usuario.rol === 'recepcion' || usuario.rol === 'canalizacion') {
    return <Recepcion onLogout={handleLogout} />
  }

  if (usuario.rol === 'cliente') {
    return <Cliente onCerrarSesion={handleLogout} />
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Bienvenido a BANUAT</h1>
      <p>Sesión iniciada como: {usuario.correo}</p>
      <button onClick={() => setUsuario(null)}>
        Cerrar sesión
      </button>
    </main>
  )
}

export default App