
import { useState } from 'react'
import Login from './pages/login/Login'
import PanelSupervisor from './pages/supervisor/PanelSupervisor'
import type { Usuario } from './services/auth'
function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  if (!usuario) {
    return <Login onLoginSuccess={setUsuario} />
  }

  if (usuario.rol === 'supervisor') {
    return <PanelSupervisor />
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Bienvenido a BANUAT</h1>
      <p>Sesión iniciada como cliente: {usuario.correo}</p>
      <p>El panel del cliente se implementará después.</p>
      <button onClick={() => setUsuario(null)}>
        Cerrar sesión
      </button>
    </main>
  )
}

export default App
