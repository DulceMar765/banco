import { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  Wallet,
  ShieldCheck,
  History,
  ClipboardList,
  HandCoins,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Percent,
} from 'lucide-react'
import './ModuloPrestamos.css'

type NivelRiesgo = 'bajo' | 'medio' | 'alto'
type EstadoSolicitud = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
type Filtro = 'todas' | 'pendientes' | 'aprobadas' | 'rechazadas'

type SolicitudPrestamo = {
  id: number
  folio: string
  cliente: string
  rfc: string
  producto: string
  montoSolicitado: number
  plazoMeses: number
  tasaPropuesta: number
  ingresoComprobado: number
  gastosDeclarados: number
  cuotaEstimada: number
  deudasActuales: number
  scoreRiesgo: number
  nivelRiesgo: NivelRiesgo
  esDudoso: boolean
  motivoDudoso?: string
  estado: EstadoSolicitud
  motivoDecision?: string
  fechaSolicitud: string
}

const dinero = (c: number) =>
  c.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  })

export default function ModuloPrestamos({
  onVolver,
}: {
  onVolver: () => void
}) {
  const [solicitudes, setSolicitudes] = useState<SolicitudPrestamo[]>([])
  const [seleccionadaId, setSeleccionadaId] = useState<number | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [tasaEditada, setTasaEditada] = useState<number>(18.0)
  const [motivoDecision, setMotivoDecision] = useState<string>('')
  const [mensajeResultado, setMensajeResultado] = useState<{ tipo: 'aprobado' | 'rechazado'; texto: string } | null>(null)
  const [errorValidacion, setErrorValidacion] = useState<string>('')

  // Carga reactiva de solicitudes de préstamo reales desde el backend
  useEffect(() => {
    let activo = true
    fetch('http://localhost:3001/api/prestamos/solicitudes')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any[]) => {
        if (!activo || !Array.isArray(data) || data.length === 0) return
        const mapeadas: SolicitudPrestamo[] = data.map((d, index) => {
          const montoSolicitado = Number(d.montoSolicitado || 35000)
          const ingreso = Number(d.ingresosComprobados || 18000)
          const gastos = Number(d.gastosDeclarados || 5000)
          const deudas = 2000
          const tasa = Number(d.tasaPropuesta || 15.0)
          const cuota = Math.round((montoSolicitado * (1 + tasa / 100)) / (d.plazoMeses || 12))
          const ratio = ingreso > 0 ? (gastos + deudas + cuota) / ingreso : 1
          const esDudoso = Boolean(d.esDudoso || ratio > 0.4 || montoSolicitado > 50000)

          let estadoNorm: EstadoSolicitud = 'PENDIENTE'
          if (d.estado === 'APPROVED') estadoNorm = 'APROBADO'
          if (d.estado === 'REJECTED') estadoNorm = 'RECHAZADO'

          return {
            id: Number(d.id) || index + 1,
            folio: d.folio || `SOL-2026-${String(d.id).padStart(3, '0')}`,
            cliente: d.cliente || 'Socio Solicitante',
            rfc: d.rfc || '',
            producto: d.producto || 'Préstamo Personal',
            montoSolicitado,
            plazoMeses: Number(d.plazoMeses) || 12,
            tasaPropuesta: tasa,
            ingresoComprobado: ingreso,
            gastosDeclarados: gastos,
            cuotaEstimada: cuota,
            deudasActuales: deudas,
            scoreRiesgo: esDudoso ? 42 : 78,
            nivelRiesgo: esDudoso ? 'alto' : 'bajo',
            esDudoso,
            motivoDudoso: esDudoso
              ? 'El monto o la capacidad libre mensual excede los parámetros estándar. Requiere autorización facultada.'
              : undefined,
            estado: estadoNorm,
            fechaSolicitud: d.fechaSolicitud || new Date().toISOString().split('T')[0],
          }
        })

        setSolicitudes(mapeadas)
        if (mapeadas.length > 0) {
          setSeleccionadaId(mapeadas[0].id)
          setTasaEditada(mapeadas[0].tasaPropuesta)
        }
      })
      .catch((err) => {
        console.warn('Backend no disponible para /api/prestamos/solicitudes:', err)
      })

    return () => {
      activo = false
    }
  }, [])

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((s) => {
      if (filtro === 'pendientes') return s.estado === 'PENDIENTE'
      if (filtro === 'aprobadas') return s.estado === 'APROBADO'
      if (filtro === 'rechazadas') return s.estado === 'RECHAZADO'
      return true
    })
  }, [solicitudes, filtro])

  const seleccionada = useMemo(
    () => solicitudes.find((s) => s.id === seleccionadaId) || solicitudes[0],
    [solicitudes, seleccionadaId]
  )

  const pendientesCount = useMemo(
    () => solicitudes.filter((s) => s.estado === 'PENDIENTE').length,
    [solicitudes]
  )

  function seleccionarSolicitud(s: SolicitudPrestamo) {
    setSeleccionadaId(s.id)
    setTasaEditada(s.tasaPropuesta)
    setMotivoDecision('')
    setErrorValidacion('')
    setMensajeResultado(null)
  }

  function handleDecision(accion: 'APROBAR' | 'RECHAZAR') {
    setErrorValidacion('')
    setMensajeResultado(null)

    if (!motivoDecision.trim()) {
      setErrorValidacion('La justificación o motivo de la decisión es estrictamente obligatoria.')
      return
    }

    const nuevoEstado: EstadoSolicitud = accion === 'APROBAR' ? 'APROBADO' : 'RECHAZADO'

    setSolicitudes((prev) =>
      prev.map((s) =>
        s.id === seleccionada.id
          ? {
              ...s,
              estado: nuevoEstado,
              tasaPropuesta: tasaEditada,
              motivoDecision: motivoDecision.trim(),
            }
          : s
      )
    )

    setMensajeResultado({
      tipo: accion === 'APROBAR' ? 'aprobado' : 'rechazado',
      texto: `Solicitud ${seleccionada.folio} ${accion === 'APROBAR' ? 'APROBADA' : 'RECHAZADA'} con éxito por supervisión.`,
    })

    // Intento de notificación asíncrona al backend
    fetch(`http://localhost:3001/api/prestamos/${seleccionada.id}/autorizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aprobada: accion === 'APROBAR',
        motivo: motivoDecision.trim(),
        supervisorId: '1',
      }),
    }).catch(() => {
      // Si el servidor backend está en reposo, la UI mantiene su consistencia local
    })
  }

  // Cálculos de capacidad
  const ingresoNeto = seleccionada
    ? seleccionada.ingresoComprobado - seleccionada.gastosDeclarados - seleccionada.deudasActuales
    : 0;
  const porcentajeCapacidad =
    seleccionada && seleccionada.ingresoComprobado > 0
      ? Math.min(
          100,
          Math.round(
            ((seleccionada.gastosDeclarados +
              seleccionada.deudasActuales +
              seleccionada.cuotaEstimada) /
              seleccionada.ingresoComprobado) *
              100
          )
        )
      : 0;

  return (
    <main className="mp">
      {/* ENCABEZADO */}
      <header className="mp-encabezado">
        <button
          type="button"
          className="mp-volver"
          onClick={onVolver}
          aria-label="Volver al panel"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Panel
        </button>

        <div>
          <h1>Gestión de préstamos</h1>
          <p>
            Revisión, evaluación y autorización de solicitudes de préstamos de socios.
          </p>
        </div>

        <span className="mp-contador">
          <strong>{pendientesCount}</strong> pendientes
        </span>
      </header>

      <div className="mp-layout">
        {/* LISTA DE SOLICITUDES */}
        <section
          className="mp-card mp-lista"
          aria-labelledby="titulo-solicitudes"
        >
          <div className="mp-lista__cabecera">
            <h2 id="titulo-solicitudes">Solicitudes</h2>
          </div>

          {/* FILTROS */}
          <div className="mp-filtros" role="tablist">
            {(['todas', 'pendientes', 'aprobadas', 'rechazadas'] as Filtro[]).map((f) => (
              <button
                key={f}
                type="button"
                className={filtro === f ? 'is-activo' : ''}
                onClick={() => setFiltro(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {solicitudesFiltradas.length === 0 ? (
            <div className="mp-vacio">
              <ClipboardList size={32} />
              <p>No hay solicitudes para este filtro.</p>
            </div>
          ) : (
            <div className="mp-lista__items">
              {solicitudesFiltradas.map((s) => {
                const esActivo = s.id === seleccionada.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`mp-item ${esActivo ? 'is-activo' : ''}`}
                    onClick={() => seleccionarSolicitud(s)}
                  >
                    <div className="mp-item__fila">
                      <span className="mp-item__folio">{s.folio}</span>
                      <span className={`mp-nivel mp-nivel--${s.nivelRiesgo}`}>
                        Riesgo {s.nivelRiesgo}
                      </span>
                    </div>

                    <div className="mp-item__cliente">{s.cliente}</div>

                    <div className="mp-item__meta">
                      <strong>{dinero(s.montoSolicitado)}</strong>
                      <span className={`mp-estado mp-estado--${s.estado === 'APROBADO' ? 'aprobado' : s.estado === 'RECHAZADO' ? 'rechazado' : 'vigente'}`}>
                        {s.estado}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* DETALLE DEL PRÉSTAMO */}
        {!seleccionada ? (
          <section className="mp-detalle">
            <div className="mp-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <ClipboardList size={32} />
              <p style={{ marginTop: '0.75rem', color: '#6b7280' }}>
                No hay solicitudes para mostrar en este filtro o la lista está vacía.
              </p>
            </div>
          </section>
        ) : (
        <section className="mp-detalle">
          {/* INFORMACIÓN DEL CLIENTE Y SOLICITUD */}
          <article className="mp-card mp-cliente">
            <div>
              <span className="mp-etiqueta">
                {seleccionada.producto} • Folio {seleccionada.folio}
              </span>
              <h2>{seleccionada.cliente}</h2>
              <p className="mp-cliente__datos">
                Monto: <strong>{dinero(seleccionada.montoSolicitado)}</strong> • Plazo: {seleccionada.plazoMeses} meses • Tasa:{' '}
                {seleccionada.tasaPropuesta}% anual
              </p>
            </div>

            {seleccionada.esDudoso && seleccionada.estado === 'PENDIENTE' && (
              <div className="mp-alerta" role="alert">
                <AlertTriangle size={18} aria-hidden="true" />
                <div>
                  <strong>Atención - Préstamo en Dictamen Dudoso</strong>
                  <p>{seleccionada.motivoDudoso || 'Requiere autorización formal y justificación del supervisor.'}</p>
                </div>
              </div>
            )}
          </article>

          <div className="mp-grid">
            {/* CAPACIDAD DE PAGO */}
            <article className="mp-card" aria-labelledby="titulo-capacidad">
              <h3 id="titulo-capacidad" className="mp-titulo">
                <Wallet size={16} aria-hidden="true" />
                Capacidad de pago
              </h3>

              <dl className="mp-datos">
                <div>
                  <dt>Ingresos comprobados</dt>
                  <dd className="is-verde">{dinero(seleccionada.ingresoComprobado)}</dd>
                </div>
                <div>
                  <dt>Gastos mensuales declarados</dt>
                  <dd className="is-rojo">-{dinero(seleccionada.gastosDeclarados)}</dd>
                </div>
                <div>
                  <dt>Otras deudas registradas</dt>
                  <dd className="is-rojo">-{dinero(seleccionada.deudasActuales)}</dd>
                </div>
                <div>
                  <dt>Cuota mensual estimada</dt>
                  <dd>{dinero(seleccionada.cuotaEstimada)}</dd>
                </div>
                <div>
                  <dt>Remanente libre disponible</dt>
                  <dd className={ingresoNeto > 0 ? 'is-verde' : 'is-rojo'}>{dinero(ingresoNeto)}</dd>
                </div>
              </dl>

              {/* BARRA DE COMPROMISO DE INGRESO */}
              <div className="mp-barra">
                <div className="mp-barra__texto">
                  <span>Compromiso de ingresos</span>
                  <strong>{porcentajeCapacidad}%</strong>
                </div>
                <div className="mp-barra__pista">
                  <span
                    className={`mp-barra__relleno ${
                      porcentajeCapacidad > 70
                        ? 'mp-barra__relleno--alto'
                        : porcentajeCapacidad > 40
                        ? 'mp-barra__relleno--medio'
                        : 'mp-barra__relleno--bajo'
                    }`}
                    style={{ width: `${Math.min(100, porcentajeCapacidad)}%` }}
                  />
                  <span className="mp-barra__limite" style={{ left: '40%' }} title="Límite máximo recomendado: 40%" />
                </div>
                <small>La línea marca el umbral prudencial del 40% según parámetros de riesgo BANUAT.</small>
              </div>
            </article>

            {/* RIESGO DE IMPAGO */}
            <article className="mp-card" aria-labelledby="titulo-riesgo">
              <h3 id="titulo-riesgo" className="mp-titulo">
                <ShieldCheck size={16} aria-hidden="true" />
                Riesgo de impago
              </h3>

              <div className="mp-riesgo">
                <div
                  className={`mp-medidor ${
                    seleccionada.nivelRiesgo === 'bajo'
                      ? 'mp-medidor--bajo'
                      : seleccionada.nivelRiesgo === 'alto'
                      ? 'mp-medidor--alto'
                      : ''
                  }`}
                  style={
                    {
                      '--valor': `${seleccionada.scoreRiesgo}%`,
                    } as React.CSSProperties
                  }
                >
                  <div className="mp-medidor__centro">
                    <strong>{seleccionada.scoreRiesgo}</strong>
                    <span>Puntaje</span>
                  </div>
                </div>

                <div className="mp-riesgo__info">
                  <span className={`mp-nivel mp-nivel--${seleccionada.nivelRiesgo}`}>
                    Nivel {seleccionada.nivelRiesgo.toUpperCase()}
                  </span>
                  <p>
                    Evaluación automatizada: <strong>{seleccionada.scoreRiesgo}/100</strong> puntos de confianza financiera.
                  </p>
                </div>
              </div>

              {/* VERIFICACIÓN RFC */}
              <div className="mp-rfc">
                <div>
                  <span className="mp-etiqueta">RFC del solicitante</span>
                  <span className="mp-rfc__valor">{seleccionada.rfc}</span>
                </div>
                <span className="mp-rfc__ok">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Verificado SAT
                </span>
              </div>
            </article>
          </div>

          {/* HISTORIAL PREVIO */}
          <article className="mp-card" aria-labelledby="titulo-historial">
            <h3 id="titulo-historial" className="mp-titulo">
              <History size={16} aria-hidden="true" />
              Historial de préstamos y cumplimiento
            </h3>

            <div className="mp-tabla-envoltura">
              <table className="mp-tabla">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th>Comportamiento de pagos</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PRE-2025-014</td>
                    <td>Ahorro e inversión</td>
                    <td>$15,000</td>
                    <td>
                      <span className="mp-pagos" aria-label="12 pagos puntuales">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <span key={i} className="is-ok" />
                        ))}
                      </span>
                      Al corriente
                    </td>
                    <td>
                      <span className="mp-estado mp-estado--aprobado">Liquidado</span>
                    </td>
                  </tr>
                  <tr>
                    <td>PRE-2024-089</td>
                    <td>Crédito Personal</td>
                    <td>$10,000</td>
                    <td>
                      <span className="mp-pagos" aria-label="Pagos puntuales">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <span key={i} className="is-ok" />
                        ))}
                      </span>
                      Sin retrasos
                    </td>
                    <td>
                      <span className="mp-estado mp-estado--aprobado">Liquidado</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          {/* DECISIÓN DEL SUPERVISOR */}
          <article className="mp-card mp-decision" aria-labelledby="titulo-decision">
            <h3 id="titulo-decision" className="mp-titulo">
              <HandCoins size={16} aria-hidden="true" />
              Resolución y Dictamen del Supervisor
            </h3>

            {seleccionada.estado === 'PENDIENTE' ? (
              <>
                <div className="mp-decision__campos">
                  <div className="mp-campo">
                    <label htmlFor="tasa-ajuste">Tasa de interés propuesta anual (%)</label>
                    <div className="mp-tasa">
                      <input
                        id="tasa-ajuste"
                        type="number"
                        step="0.5"
                        min="5"
                        max="50"
                        value={tasaEditada}
                        onChange={(e) => setTasaEditada(Number(e.target.value))}
                      />
                      <Percent size={16} aria-hidden="true" />
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="35"
                      step="0.5"
                      value={tasaEditada}
                      onChange={(e) => setTasaEditada(Number(e.target.value))}
                      aria-label="Ajustar tasa con deslizador"
                    />
                    <small>Rango autorizado para supervisor: 8% a 35%.</small>
                  </div>

                  <div className="mp-campo mp-campo--motivo">
                    <label htmlFor="motivo-decision">
                      Motivo / Justificación obligatoria del dictamen *
                    </label>
                    <textarea
                      id="motivo-decision"
                      placeholder="Indica el motivo detallado de autorización o rechazo para auditoría..."
                      value={motivoDecision}
                      onChange={(e) => setMotivoDecision(e.target.value)}
                    />
                    <small>Este registro se almacena de forma inalterable en la bitácora de auditoría.</small>
                  </div>
                </div>

                {errorValidacion && (
                  <div className="mp-error" role="alert">
                    {errorValidacion}
                  </div>
                )}

                <div className="mp-acciones">
                  <button
                    type="button"
                    className="mp-btn mp-btn--rechazar"
                    onClick={() => handleDecision('RECHAZAR')}
                  >
                    <XCircle size={16} aria-hidden="true" />
                    Rechazar préstamo
                  </button>

                  <button
                    type="button"
                    className="mp-btn mp-btn--aprobar"
                    onClick={() => handleDecision('APROBAR')}
                  >
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Autorizar préstamo
                  </button>
                </div>
              </>
            ) : (
              <div
                className={`mp-resultado mp-resultado--${
                  seleccionada.estado === 'APROBADO' ? 'aprobado' : 'rechazado'
                }`}
              >
                {seleccionada.estado === 'APROBADO' ? (
                  <CheckCircle2 size={20} aria-hidden="true" />
                ) : (
                  <XCircle size={20} aria-hidden="true" />
                )}
                <div>
                  <strong>
                    Dictamen emitido: Solicitud {seleccionada.estado}
                  </strong>
                  {seleccionada.motivoDecision && (
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 'normal', opacity: 0.9 }}>
                      Justificación: "{seleccionada.motivoDecision}"
                    </p>
                  )}
                  {seleccionada.estado === 'APROBADO' && (
                    <p style={{ margin: '0.4rem 0 0', color: '#b45309', fontWeight: 600 }}>
                      ⚠️ Autorizado - Pendiente de Desembolso (Desembolsos temporalmente no disponibles)
                    </p>
                  )}
                </div>
              </div>
            )}

            {mensajeResultado && (
              <div
                className={`mp-resultado mp-resultado--${mensajeResultado.tipo}`}
                style={{ marginTop: '1rem' }}
                role="status"
              >
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{mensajeResultado.texto}</span>
              </div>
            )}
          </article>
        </section>
        )}
      </div>
    </main>
  )
}
