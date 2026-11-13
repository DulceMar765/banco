
import { useState, useEffect } from 'react'

import {
  Bell,
  BookOpen,
  ChevronDown,
  FileBarChart,
  Gift,
  HandCoins,
  History,
  LayoutDashboard,
  Mail,
  Megaphone,
  Search,
  Wallet,
  Users,
  LogOut,
  type LucideIcon,
} from 'lucide-react'

import ModuloPrestamos from './ModuloPrestamos'
import ModuloPromociones from './ModuloPromociones'
import ModuloLealtad from './ModuloLealtad'
import ModuloClientes from './ModuloClientes'
import ModuloHistorial from './ModuloHistorial'
import ModuloReportes from './ModuloReportes'
import ModuloCatalogos from './ModuloCatalogos'
import ModuloProductos from './ModuloProductos'
import ModuloCobranza from './ModuloCobranza'

import './PanelSupervisor.css'

type Modulo = {
  id: string
  nombre: string
  descripcion: string
  icono: LucideIcon
  pendientes: number
}

const MODULOS: Modulo[] = [
  {
    id: 'prestamos',
    nombre: 'Préstamos',
    descripcion: 'Revisar y autorizar solicitudes de riesgo.',
    icono: HandCoins,
    pendientes: 0,
  },
  {
    id: 'clientes',
    nombre: 'Clientes',
    descripcion: 'Consultar historial de pagos y capacidad de pago.',
    icono: Users,
    pendientes: 0,
  },
  {
    id: 'promociones',
    nombre: 'Promociones',
    descripcion: 'Crear, programar y supervisar ofertas.',
    icono: Megaphone,
    pendientes: 0,
  },
  {
    id: 'lealtad',
    nombre: 'Lealtad',
    descripcion: 'Administrar puntos, canjes y beneficios.',
    icono: Gift,
    pendientes: 0,
  },
  {
    id: 'catalogos',
    nombre: 'Catálogos',
    descripcion: 'Gestionar productos por temporada.',
    icono: BookOpen,
    pendientes: 0,
  },
  {
    id: 'productos',
    nombre: 'Productos financieros',
    descripcion: 'Crear cuentas y establecer sus condiciones.',
    icono: Wallet,
    pendientes: 0,
  },
  {
    id: 'cobranza',
    nombre: 'Cobranza',
    descripcion: 'Clasificar, recuperar y gestionar la venta de cartera vencida.',
    icono: HandCoins,
    pendientes: 0,
  },
  {
    id: 'historial',
    nombre: 'Historial',
    descripcion: 'Consultar las operaciones realizadas.',
    icono: History,
    pendientes: 0,
  },
  {
    id: 'reportes',
    nombre: 'Reportes',
    descripcion: 'Generar informes mensuales y estadísticas.',
    icono: FileBarChart,
    pendientes: 0,
  },
]

type PanelSupervisorProps = {
  onLogout?: () => void
}

export default function PanelSupervisor({ onLogout }: PanelSupervisorProps = {}) {
  const [activo, setActivo] = useState('inicio')
  const [prestamosPendientes, setPrestamosPendientes] = useState<any[]>([])

  useEffect(() => {
    let activo = true
    fetch('http://localhost:3001/api/prestamos/solicitudes')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any[]) => {
        if (!activo || !Array.isArray(data)) return
        setPrestamosPendientes(
          data.filter(
            (d) =>
              d.estado === 'SUBMITTED' ||
              d.estado === 'UNDER_REVIEW' ||
              d.estado === 'PENDIENTE'
          )
        )
      })
      .catch(() => {})

    return () => {
      activo = false
    }
  }, [activo])

  return (
    <div className="sp-fondo">
      <div className="sp-app">

        {/* MENÚ LATERAL */}
        <aside className="sp-sidebar" aria-label="Navegación principal">

          <div className="sp-sidebar__marca" aria-hidden="true">
            B
          </div>

          <nav className="sp-sidebar__nav">

            <button
              type="button"
              className={`sp-sidebar__item ${
                activo === 'inicio' ? 'is-activo' : ''
              }`}
              aria-label="Inicio"
              aria-current={activo === 'inicio' ? 'page' : undefined}
              onClick={() => setActivo('inicio')}
            >
              <LayoutDashboard size={20} />
            </button>

            {MODULOS.map(({ id, nombre, icono: Icono }) => (
              <button
                key={id}
                type="button"
                className={`sp-sidebar__item ${
                  activo === id ? 'is-activo' : ''
                }`}
                aria-label={nombre}
                title={nombre}
                aria-current={activo === id ? 'page' : undefined}
                onClick={() => setActivo(id)}
              >
                <Icono size={20} />
              </button>
            ))}

            {onLogout && (
              <button
                type="button"
                className="sp-sidebar__item"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                onClick={onLogout}
                style={{ marginTop: 'auto', color: '#ef4444' }}
              >
                <LogOut size={20} />
              </button>
            )}

          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <div className="sp-contenido">

          {/* BARRA SUPERIOR */}
          <header className="sp-topbar">

            <label className="sp-buscar">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Buscar</span>
              <input
                type="search"
                placeholder="Buscar cliente, préstamo o reporte"
              />
            </label>

            <div className="sp-topbar__acciones">

              <button
                type="button"
                className="sp-icono-btn"
                aria-label="Mensajes"
              >
                <Mail size={18} />
              </button>

              <button
                type="button"
                className="sp-icono-btn sp-icono-btn--alerta"
                aria-label="Notificaciones"
              >
                <Bell size={18} />
              </button>

              <div className="sp-usuario">
                <span className="sp-usuario__avatar" aria-hidden="true">
                  CR
                </span>

                <span className="sp-usuario__nombre">
                  Carlos Ramírez
                </span>

                <ChevronDown size={16} aria-hidden="true" />
              </div>

              {onLogout && (
                <button
                  type="button"
                  className="sp-icono-btn sp-logout-btn"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  onClick={onLogout}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                    marginLeft: '8px',
                  }}
                >
                  <LogOut size={16} />
                  <span>Salir</span>
                </button>
              )}

            </div>
          </header>

          {/* MÓDULO DE PRÉSTAMOS */}
          {activo === 'prestamos' ? (
            <ModuloPrestamos
              onVolver={() => setActivo('inicio')}
            />

          ) : activo === 'promociones' ? (

            /* MÓDULO DE PROMOCIONES */
            <ModuloPromociones
              onVolver={() => setActivo('inicio')}
            />

          ) : activo === 'lealtad' ? (
            <ModuloLealtad
              onVolver={() => setActivo('inicio')}
            />

          ) : activo === 'clientes' ? (
            <ModuloClientes
              onVolver={() => setActivo('inicio')}
            />

          ) : activo === 'historial' ? (
            <ModuloHistorial
              onVolver={() => setActivo('inicio')}
            />

          ) : activo === 'reportes' ? (
            <ModuloReportes
              onVolver={() => setActivo('inicio')}
            />

          ) : activo === 'catalogos' ? (
            <ModuloCatalogos
              onVolver={() => setActivo('inicio')}
            />

          ) : activo === 'productos' ? (
            <ModuloProductos
              onVolver={() => setActivo('inicio')}
            />

          ) : activo === 'cobranza' ? (
            /* MÓDULO DE COBRANZA */
            <ModuloCobranza
              onVolver={() => setActivo('inicio')}
            />

          ) : activo === 'inicio' ? (

            /* PÁGINA PRINCIPAL */
            <main className="sp-grid">

              {/* RESUMEN */}
              <section
                className="sp-card sp-resumen"
                aria-labelledby="titulo-resumen"
              >
                <div className="sp-card__cabecera">
                  <h2 id="titulo-resumen">
                    Solicitudes de préstamo
                  </h2>

                  <span className="sp-chip">
                    Resumen <ChevronDown size={14} aria-hidden="true" />
                  </span>
                </div>

                {prestamosPendientes.length > 0 ? (
                  <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#555' }}>
                        Tienes <strong>{prestamosPendientes.length}</strong> solicitud(es) de préstamo pendientes de revisión o dudosas.
                      </span>
                      <button
                        type="button"
                        onClick={() => setActivo('prestamos')}
                        style={{
                          padding: '6px 14px',
                          background: '#1d4ed8',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Revisar bandeja
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {prestamosPendientes.slice(0, 3).map((sol) => (
                        <div
                          key={sol.id}
                          onClick={() => setActivo('prestamos')}
                          style={{
                            padding: '10px 14px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: '13px', color: '#1e293b' }}>{sol.cliente}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {sol.producto} · {sol.folio}
                            </div>
                          </div>
                          <span style={{ fontWeight: 700, color: '#0f766e', fontSize: '13px' }}>
                            ${Number(sol.montoSolicitado).toLocaleString('es-MX')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="sp-vacio">
                    <HandCoins size={30} />
                    <p>No hay solicitudes pendientes.</p>
                    <small>
                      Cuando el personal de escritorio registre solicitudes de préstamo,
                      aparecerán aquí para tu revisión inmediata.
                    </small>
                  </div>
                )}
              </section>

              {/* PERFIL DEL SUPERVISOR */}
              <section
                className="sp-card sp-perfil"
                aria-label="Perfil del supervisor"
              >
                <div>
                  <span className="sp-perfil__saludo">
                    Bienvenido
                  </span>

                  <h2 className="sp-perfil__nombre">
                    Carlos Ramírez
                  </h2>

                  <span className="sp-perfil__rol">
                    Supervisor general
                  </span>
                </div>
              </section>

              {/* REPORTES */}
              <section
                className="sp-card sp-reportes"
                aria-labelledby="titulo-reportes"
              >
                <div className="sp-card__cabecera">
                  <h2 id="titulo-reportes">
                    Reportes de operación
                  </h2>

                  <span className="sp-chip">
                    Mensual <ChevronDown size={14} aria-hidden="true" />
                  </span>
                </div>

                <div className="sp-vacio">
                  <FileBarChart size={30} />

                  <p>No hay reportes disponibles.</p>

                  <small>
                    Los indicadores y estadísticas se mostrarán
                    cuando existan operaciones registradas.
                  </small>
                </div>
              </section>

              {/* ACTIVIDAD */}
              <section
                className="sp-card sp-actividad"
                aria-labelledby="titulo-actividad"
              >
                <div className="sp-card__cabecera">
                  <h2 id="titulo-actividad">
                    Actividad de hoy
                  </h2>
                </div>

                <div className="sp-vacio">
                  <History size={30} />

                  <p>No hay actividad registrada.</p>

                  <small>
                    Cuando el sistema registre préstamos,
                    promociones, movimientos y operaciones,
                    aparecerán aquí.
                  </small>
                </div>
              </section>

              {/* MÓDULOS */}
              <section
                className="sp-card sp-modulos"
                aria-labelledby="titulo-modulos"
              >
                <div className="sp-card__cabecera">
                  <h2 id="titulo-modulos">
                    Módulos
                  </h2>

                  <span className="sp-card__sub">
                    Función principal
                  </span>
                </div>

                <ul className="sp-modulos__lista">
                  {MODULOS.map(
                    ({ id, nombre, descripcion, icono: Icono, pendientes }) => (
                      <li key={id}>
                        <button
                          type="button"
                          className={`sp-modulo ${
                            activo === id ? 'is-activo' : ''
                          }`}
                          onClick={() => setActivo(id)}
                        >
                          <span
                            className="sp-modulo__icono"
                            aria-hidden="true"
                          >
                            <Icono size={20} />
                          </span>

                          <span className="sp-modulo__texto">
                            <strong>{nombre}</strong>
                            <span>{descripcion}</span>
                          </span>

                          {((id === 'prestamos' ? prestamosPendientes.length : pendientes) > 0) && (
                            <span
                              className="sp-modulo__badge"
                              aria-label={`${id === 'prestamos' ? prestamosPendientes.length : pendientes} pendientes`}
                            >
                              {id === 'prestamos' ? prestamosPendientes.length : pendientes}
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </section>

            </main>

          ) : (

            /* RESTO DE LOS MÓDULOS */
            <main className="sp-grid">
              <section
                className="sp-card"
                style={{ padding: '2rem' }}
              >
                <h2>
                  {MODULOS.find((m) => m.id === activo)?.nombre}
                </h2>

                <p>
                  {MODULOS.find((m) => m.id === activo)?.descripcion}
                </p>

                <div className="sp-vacio">
                  <p>
                    Este módulo todavía no tiene información registrada.
                  </p>

                  <small>
                    Aquí se mostrarán las funciones y registros
                    correspondientes cuando se desarrolle el módulo.
                  </small>
                </div>

                <button
                  type="button"
                  onClick={() => setActivo('inicio')}
                >
                  Volver al inicio
                </button>
              </section>
            </main>
          )}

        </div>
      </div>
    </div>
  )
}
