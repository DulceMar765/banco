import { useMemo, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  Search,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  CalendarDays,
  Wallet,
  Eye,
  X,
} from 'lucide-react'
import './ModuloCobranza.css'

type Clasificacion = 'Recuperable' | 'Vencida'

type Decision =
  | 'Pendiente'
  | 'Plazo concedido'
  | 'Venta autorizada'
  | 'No autorizada'

type Deuda = {
  id: number
  cliente: string
  rfc: string
  prestamo: string
  saldo: number
  fechaVencimiento: string
  ultimoPago: string
  diasHabilesAtraso: number
  clasificacion: Clasificacion
  susceptibleVenta: boolean | null
  decision: Decision
  fechaPlazo: string
  observaciones: string
}

type Movimiento = {
  id: number
  cliente: string
  prestamo: string
  decision: Decision
  fecha: string
  responsable: string
  motivo: string
}

type Props = {
  onVolver: () => void
}

const datosIniciales: Deuda[] = [
  {
    id: 1,
    cliente: 'Juan Pérez Hernández',
    rfc: 'PEHJ900512AB1',
    prestamo: 'PRE-2026-001',
    saldo: 18500,
    fechaVencimiento: '2026-08-28',
    ultimoPago: '2026-08-15',
    diasHabilesAtraso: 45,
    clasificacion: 'Vencida',
    susceptibleVenta: true,
    decision: 'Pendiente',
    fechaPlazo: '',
    observaciones: 'Sin respuesta a los últimos avisos de cobranza.',
  },
  {
    id: 2,
    cliente: 'María González López',
    rfc: 'GOLM950322CD2',
    prestamo: 'PRE-2026-002',
    saldo: 8200,
    fechaVencimiento: '2026-09-20',
    ultimoPago: '2026-09-10',
    diasHabilesAtraso: 24,
    clasificacion: 'Recuperable',
    susceptibleVenta: false,
    decision: 'Pendiente',
    fechaPlazo: '',
    observaciones: 'Cliente manifestó interés en regularizar sus pagos.',
  },
  {
    id: 3,
    cliente: 'Roberto Sánchez Díaz',
    rfc: 'SADR880714EF3',
    prestamo: 'PRE-2026-003',
    saldo: 32400,
    fechaVencimiento: '2026-07-15',
    ultimoPago: '2026-06-30',
    diasHabilesAtraso: 68,
    clasificacion: 'Vencida',
    susceptibleVenta: true,
    decision: 'Pendiente',
    fechaPlazo: '',
    observaciones: 'No se ha recibido respuesta del cliente.',
  },
  {
    id: 4,
    cliente: 'Laura Martínez Ruiz',
    rfc: 'MARL970809GH4',
    prestamo: 'PRE-2026-004',
    saldo: 5600,
    fechaVencimiento: '2026-09-25',
    ultimoPago: '2026-09-18',
    diasHabilesAtraso: 18,
    clasificacion: 'Recuperable',
    susceptibleVenta: false,
    decision: 'Plazo concedido',
    fechaPlazo: '2026-11-10',
    observaciones: 'Se acordó una fecha adicional para realizar el pago.',
  },
  {
    id: 5,
    cliente: 'Carlos Ramírez Torres',
    rfc: 'RATC920116JK5',
    prestamo: 'PRE-2026-005',
    saldo: 12700,
    fechaVencimiento: '2026-08-10',
    ultimoPago: '2026-07-22',
    diasHabilesAtraso: 52,
    clasificacion: 'Vencida',
    susceptibleVenta: false,
    decision: 'No autorizada',
    fechaPlazo: '',
    observaciones: 'Caso pendiente de revisión documental.',
  },
]

const moneda = (cantidad: number) =>
  cantidad.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })

const fechaActual = () => new Date().toLocaleDateString('es-MX')

export default function ModuloCobranza({ onVolver }: Props) {
  const [deudas, setDeudas] = useState<Deuda[]>(datosIniciales)
  const [historial, setHistorial] = useState<Movimiento[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroClasificacion, setFiltroClasificacion] = useState('Todas')
  const [filtroDecision, setFiltroDecision] = useState('Todas')
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<Deuda | null>(null)

  const [clasificacion, setClasificacion] =
    useState<Clasificacion>('Recuperable')
  const [decision, setDecision] = useState<Decision>('Pendiente')
  const [fechaPlazo, setFechaPlazo] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const [pestana, setPestana] = useState<'cartera' | 'historial'>('cartera')

  const deudasFiltradas = useMemo(() => {
    return deudas.filter((deuda) => {
      const texto = busqueda.toLowerCase()

      const coincideBusqueda =
        deuda.cliente.toLowerCase().includes(texto) ||
        deuda.rfc.toLowerCase().includes(texto) ||
        deuda.prestamo.toLowerCase().includes(texto)

      const coincideClasificacion =
        filtroClasificacion === 'Todas' ||
        deuda.clasificacion === filtroClasificacion

      const coincideDecision =
        filtroDecision === 'Todas' ||
        deuda.decision === filtroDecision

      return (
        coincideBusqueda &&
        coincideClasificacion &&
        coincideDecision
      )
    })
  }, [deudas, busqueda, filtroClasificacion, filtroDecision])

  const totalVencido = deudas
    .filter((deuda) => deuda.clasificacion === 'Vencida')
    .reduce((total, deuda) => total + deuda.saldo, 0)

  const totalRecuperable = deudas
    .filter((deuda) => deuda.clasificacion === 'Recuperable')
    .reduce((total, deuda) => total + deuda.saldo, 0)

  const totalSusceptible = deudas.filter(
    (deuda) =>
      deuda.clasificacion === 'Vencida' &&
      deuda.susceptibleVenta === true
  ).length

  function abrirGestion(deuda: Deuda) {
    setDeudaSeleccionada(deuda)
    setClasificacion(deuda.clasificacion)
    setDecision(deuda.decision)
    setFechaPlazo(deuda.fechaPlazo)
    setObservaciones(deuda.observaciones)
  }

  function guardarDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!deudaSeleccionada) return

    if (decision === 'Plazo concedido' && !fechaPlazo) {
      return
    }

    const esSusceptible =
      decision === 'Venta autorizada'
        ? true
        : decision === 'No autorizada'
          ? false
          : deudaSeleccionada.susceptibleVenta

    const deudaActualizada: Deuda = {
      ...deudaSeleccionada,
      clasificacion,
      decision,
      susceptibleVenta: esSusceptible,
      fechaPlazo: decision === 'Plazo concedido' ? fechaPlazo : '',
      observaciones,
    }

    setDeudas((actuales) =>
      actuales.map((deuda) =>
        deuda.id === deudaSeleccionada.id
          ? deudaActualizada
          : deuda
      )
    )

    setHistorial((actuales) => [
      {
        id: Date.now(),
        cliente: deudaSeleccionada.cliente,
        prestamo: deudaSeleccionada.prestamo,
        decision,
        fecha: fechaActual(),
        responsable: 'Supervisor',
        motivo: observaciones || 'Sin observaciones',
      },
      ...actuales,
    ])

    setDeudaSeleccionada(null)
  }

  function exportarReporte() {
    const carteraVencida = deudas.filter(
      (deuda) => deuda.clasificacion === 'Vencida'
    )

    const encabezados = [
      'Cliente',
      'RFC',
      'Número de préstamo',
      'Saldo pendiente',
      'Fecha de vencimiento',
      'Último pago',
      'Días hábiles de atraso',
      'Clasificación',
      'Susceptible de venta',
      'Decisión',
      'Observaciones',
    ]

    const filas = carteraVencida.map((deuda) => [
      deuda.cliente,
      deuda.rfc,
      deuda.prestamo,
      deuda.saldo,
      deuda.fechaVencimiento,
      deuda.ultimoPago,
      deuda.diasHabilesAtraso,
      deuda.clasificacion,
      deuda.susceptibleVenta === null
        ? 'Pendiente'
        : deuda.susceptibleVenta
          ? 'Sí'
          : 'No',
      deuda.decision,
      deuda.observaciones,
    ])

    const escapar = (valor: string | number) =>
      `"${String(valor).replace(/"/g, '""')}"`

    const contenido = [
      encabezados,
      ...filas,
    ]
      .map((fila) => fila.map(escapar).join(','))
      .join('\r\n')

    const archivo = new Blob(
      ['\uFEFF' + contenido],
      { type: 'text/csv;charset=utf-8;' }
    )

    const url = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = 'reporte_cartera_vencida.csv'
    enlace.click()

    URL.revokeObjectURL(url)
  }

  function cerrarGestion() {
    setDeudaSeleccionada(null)
  }

  return (
    <main className="mc-contenedor">
      <header className="mc-encabezado">
        <div className="mc-encabezado__izquierda">
          <button
            type="button"
            className="mc-volver"
            onClick={onVolver}
          >
            <ArrowLeft size={18} />
            Volver al panel
          </button>

          <span className="mc-etiqueta">MÓDULO DEL SUPERVISOR</span>

          <h1>Cobranza y recuperación</h1>

          <p>
            Clasifica la cartera, administra plazos de pago y
            determina las deudas susceptibles de venta.
          </p>
        </div>

        <button
          type="button"
          className="mc-btn mc-btn--excel"
          onClick={exportarReporte}
        >
          <FileSpreadsheet size={18} />
          Exportar cartera vencida
        </button>
      </header>

      <section className="mc-resumen">
        <article className="mc-resumen__tarjeta">
          <div className="mc-resumen__icono mc-icono--naranja">
            <Wallet size={21} />
          </div>
          <div>
            <span>Saldo de cartera vencida</span>
            <strong>{moneda(totalVencido)}</strong>
            <small>
              {deudas.filter((d) => d.clasificacion === 'Vencida').length}
              {' '}préstamos vencidos
            </small>
          </div>
        </article>

        <article className="mc-resumen__tarjeta">
          <div className="mc-resumen__icono mc-icono--verde">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Saldo recuperable</span>
            <strong>{moneda(totalRecuperable)}</strong>
            <small>Deudas en seguimiento</small>
          </div>
        </article>

        <article className="mc-resumen__tarjeta">
          <div className="mc-resumen__icono mc-icono--rojo">
            <AlertTriangle size={21} />
          </div>
          <div>
            <span>Susceptibles de venta</span>
            <strong>{totalSusceptible}</strong>
            <small>Deudas por evaluar o enviar</small>
          </div>
        </article>

        <article className="mc-resumen__tarjeta">
          <div className="mc-resumen__icono mc-icono--azul">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Decisiones registradas</span>
            <strong>{historial.length}</strong>
            <small>Movimientos en este módulo</small>
          </div>
        </article>
      </section>

      <nav className="mc-pestanas">
        <button
          type="button"
          className={pestana === 'cartera' ? 'activa' : ''}
          onClick={() => setPestana('cartera')}
        >
          Cartera de deudas
        </button>

        <button
          type="button"
          className={pestana === 'historial' ? 'activa' : ''}
          onClick={() => setPestana('historial')}
        >
          Historial de decisiones
        </button>
      </nav>

      {pestana === 'cartera' ? (
        <section className="mc-panel">
          <div className="mc-panel__encabezado">
            <div>
              <h2>Clasificación de cartera</h2>
              <p>
                Consulta los préstamos atrasados y administra su recuperación.
              </p>
            </div>
          </div>

          <div className="mc-filtros">
            <div className="mc-busqueda">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar cliente, RFC o préstamo..."
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
            </div>

            <select
              value={filtroClasificacion}
              onChange={(event) =>
                setFiltroClasificacion(event.target.value)
              }
            >
              <option value="Todas">Todas las carteras</option>
              <option value="Recuperable">Recuperable</option>
              <option value="Vencida">Vencida</option>
            </select>

            <select
              value={filtroDecision}
              onChange={(event) => setFiltroDecision(event.target.value)}
            >
              <option value="Todas">Todas las decisiones</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Plazo concedido">Plazo concedido</option>
              <option value="Venta autorizada">Venta autorizada</option>
              <option value="No autorizada">No autorizada</option>
            </select>
          </div>

          <div className="mc-tabla-contenedor">
            <table className="mc-tabla">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Préstamo</th>
                  <th>Saldo pendiente</th>
                  <th>Días hábiles</th>
                  <th>Clasificación</th>
                  <th>Venta</th>
                  <th>Decisión</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {deudasFiltradas.map((deuda) => (
                  <tr key={deuda.id}>
                    <td>
                      <strong>{deuda.cliente}</strong>
                      <small>{deuda.rfc}</small>
                    </td>

                    <td>{deuda.prestamo}</td>

                    <td className="mc-saldo">
                      {moneda(deuda.saldo)}
                    </td>

                    <td>
                      <span className="mc-dias">
                        {deuda.diasHabilesAtraso} días
                      </span>
                    </td>

                    <td>
                      <span
                        className={`mc-estado ${
                          deuda.clasificacion === 'Vencida'
                            ? 'mc-estado--vencida'
                            : 'mc-estado--recuperable'
                        }`}
                      >
                        {deuda.clasificacion}
                      </span>
                    </td>

                    <td>
                      {deuda.susceptibleVenta === null
                        ? 'Pendiente'
                        : deuda.susceptibleVenta
                          ? 'Sí'
                          : 'No'}
                    </td>

                    <td>
                      <span className="mc-decision">
                        {deuda.decision}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="mc-btn-accion"
                        onClick={() => abrirGestion(deuda)}
                      >
                        <Eye size={16} />
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}

                {deudasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={8} className="mc-vacio">
                      No se encontraron deudas con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="mc-nota">
            Los días hábiles mostrados son datos de demostración.
            La clasificación definitiva debe aplicar el calendario
            laboral y los plazos configurados por la institución.
          </p>
        </section>
      ) : (
        <section className="mc-panel">
          <div className="mc-panel__encabezado">
            <div>
              <h2>Historial de decisiones</h2>
              <p>Registro de las acciones realizadas por el supervisor.</p>
            </div>
          </div>

          {historial.length === 0 ? (
            <div className="mc-vacio mc-vacio--historial">
              <CalendarDays size={32} />
              <strong>Aún no hay decisiones registradas</strong>
              <span>
                Las decisiones que guardes desde la cartera aparecerán aquí.
              </span>
            </div>
          ) : (
            <div className="mc-tabla-contenedor">
              <table className="mc-tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Préstamo</th>
                    <th>Decisión</th>
                    <th>Responsable</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td>{movimiento.fecha}</td>
                      <td>{movimiento.cliente}</td>
                      <td>{movimiento.prestamo}</td>
                      <td>{movimiento.decision}</td>
                      <td>{movimiento.responsable}</td>
                      <td>{movimiento.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {deudaSeleccionada && (
        <div className="mc-modal-fondo" onClick={cerrarGestion}>
          <section
            className="mc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mc-modal-titulo"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mc-modal__encabezado">
              <div>
                <span>GESTIÓN DE COBRANZA</span>
                <h2 id="mc-modal-titulo">Decisión del supervisor</h2>
              </div>

              <button
                type="button"
                className="mc-modal__cerrar"
                onClick={cerrarGestion}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mc-cliente-resumen">
              <div>
                <strong>{deudaSeleccionada.cliente}</strong>
                <span>{deudaSeleccionada.rfc}</span>
                <span>{deudaSeleccionada.prestamo}</span>
              </div>

              <div className="mc-cliente-resumen__saldo">
                <small>Saldo pendiente</small>
                <strong>{moneda(deudaSeleccionada.saldo)}</strong>
              </div>
            </div>

            <div className="mc-datos-deuda">
              <div>
                <span>Días hábiles de atraso</span>
                <strong>{deudaSeleccionada.diasHabilesAtraso}</strong>
              </div>
              <div>
                <span>Último pago</span>
                <strong>{deudaSeleccionada.ultimoPago}</strong>
              </div>
              <div>
                <span>Vencimiento</span>
                <strong>{deudaSeleccionada.fechaVencimiento}</strong>
              </div>
            </div>

            <form className="mc-formulario" onSubmit={guardarDecision}>
              <div className="mc-campo">
                <label htmlFor="clasificacion">Clasificación de cartera</label>
                <select
                  id="clasificacion"
                  value={clasificacion}
                  onChange={(event) =>
                    setClasificacion(event.target.value as Clasificacion)
                  }
                >
                  <option value="Recuperable">Recuperable</option>
                  <option value="Vencida">Vencida</option>
                </select>
              </div>

              <div className="mc-campo">
                <label htmlFor="decision">Decisión del supervisor</label>
                <select
                  id="decision"
                  value={decision}
                  onChange={(event) =>
                    setDecision(event.target.value as Decision)
                  }
                >
                  <option value="Pendiente">Pendiente de decisión</option>
                  <option value="Plazo concedido">Conceder plazo adicional</option>
                  <option value="Venta autorizada">Autorizar venta de deuda</option>
                  <option value="No autorizada">No autorizar venta</option>
                </select>
              </div>

              {decision === 'Plazo concedido' && (
                <div className="mc-campo">
                  <label htmlFor="fechaPlazo">Nueva fecha límite de pago</label>
                  <input
                    id="fechaPlazo"
                    type="date"
                    value={fechaPlazo}
                    onChange={(event) => setFechaPlazo(event.target.value)}
                    required
                  />
                </div>
              )}

              <div className="mc-campo">
                <label htmlFor="observaciones">
                  Justificación u observaciones
                </label>
                <textarea
                  id="observaciones"
                  rows={3}
                  placeholder="Describe el motivo de la decisión..."
                  value={observaciones}
                  onChange={(event) => setObservaciones(event.target.value)}
                />
              </div>

              <div className="mc-modal__acciones">
                <button
                  type="button"
                  className="mc-btn mc-btn--cancelar"
                  onClick={cerrarGestion}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="mc-btn mc-btn--guardar"
                >
                  Guardar decisión
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}