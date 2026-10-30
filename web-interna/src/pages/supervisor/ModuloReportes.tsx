
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Download,
  FileText,
  HandCoins,
  PackageCheck,
  Search,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import './ModuloReportes.css'

type Seccion = 'general' | 'escritorio' | 'caja' | 'comparacion'
type Puesto = 'Escritorio' | 'Caja'

type Operacion = {
  id: number
  empleado: string
  puesto: Puesto
  actividad: string
  cliente: string
  tipoPersona: 'Cliente' | 'Externo'
  fecha: string
  resultado: 'Completado' | 'Pendiente' | 'Rechazado'
  importe: number
}

type ModuloReportesProps = {
  onVolver?: () => void
}

const operacionesIniciales: Operacion[] = [
  { id: 1, empleado: 'Ana Torres', puesto: 'Escritorio', actividad: 'Registro de cliente', cliente: 'Juan Pérez', tipoPersona: 'Cliente', fecha: '2026-10-29', resultado: 'Completado', importe: 0 },
  { id: 2, empleado: 'Ana Torres', puesto: 'Escritorio', actividad: 'Asignación de producto', cliente: 'María López', tipoPersona: 'Cliente', fecha: '2026-10-29', resultado: 'Completado', importe: 0 },
  { id: 3, empleado: 'Ana Torres', puesto: 'Escritorio', actividad: 'Atención', cliente: 'Roberto Sánchez', tipoPersona: 'Cliente', fecha: '2026-10-28', resultado: 'Completado', importe: 0 },
  { id: 4, empleado: 'Ana Torres', puesto: 'Escritorio', actividad: 'Atención externa', cliente: 'Persona externa', tipoPersona: 'Externo', fecha: '2026-10-28', resultado: 'Completado', importe: 0 },
  { id: 5, empleado: 'Luis Pérez', puesto: 'Escritorio', actividad: 'Registro de cliente', cliente: 'Carlos Méndez', tipoPersona: 'Cliente', fecha: '2026-10-29', resultado: 'Completado', importe: 0 },
  { id: 6, empleado: 'Luis Pérez', puesto: 'Escritorio', actividad: 'Asignación de producto', cliente: 'Laura Gómez', tipoPersona: 'Cliente', fecha: '2026-10-27', resultado: 'Completado', importe: 0 },
  { id: 7, empleado: 'Luis Pérez', puesto: 'Escritorio', actividad: 'Actualización de datos', cliente: 'Pedro Ruiz', tipoPersona: 'Cliente', fecha: '2026-10-26', resultado: 'Completado', importe: 0 },
  { id: 8, empleado: 'María Ruiz', puesto: 'Escritorio', actividad: 'Registro de cliente', cliente: 'Sofía Díaz', tipoPersona: 'Cliente', fecha: '2026-10-25', resultado: 'Completado', importe: 0 },
  { id: 9, empleado: 'María Ruiz', puesto: 'Escritorio', actividad: 'Asignación de producto', cliente: 'Miguel Flores', tipoPersona: 'Cliente', fecha: '2026-10-24', resultado: 'Completado', importe: 0 },
  { id: 10, empleado: 'María Ruiz', puesto: 'Escritorio', actividad: 'Atención externa', cliente: 'Persona externa', tipoPersona: 'Externo', fecha: '2026-10-23', resultado: 'Completado', importe: 0 },

  { id: 11, empleado: 'Pedro López', puesto: 'Caja', actividad: 'Pago de deuda', cliente: 'Juan Pérez', tipoPersona: 'Cliente', fecha: '2026-10-29', resultado: 'Completado', importe: 1500 },
  { id: 12, empleado: 'Pedro López', puesto: 'Caja', actividad: 'Abono de préstamo', cliente: 'María López', tipoPersona: 'Cliente', fecha: '2026-10-29', resultado: 'Completado', importe: 850 },
  { id: 13, empleado: 'Pedro López', puesto: 'Caja', actividad: 'Pago de deuda', cliente: 'Roberto Sánchez', tipoPersona: 'Cliente', fecha: '2026-10-28', resultado: 'Completado', importe: 1200 },
  { id: 14, empleado: 'Pedro López', puesto: 'Caja', actividad: 'Atención externa', cliente: 'Persona externa', tipoPersona: 'Externo', fecha: '2026-10-27', resultado: 'Completado', importe: 0 },
  { id: 15, empleado: 'Laura Díaz', puesto: 'Caja', actividad: 'Pago de préstamo', cliente: 'Carlos Méndez', tipoPersona: 'Cliente', fecha: '2026-10-29', resultado: 'Completado', importe: 2000 },
  { id: 16, empleado: 'Laura Díaz', puesto: 'Caja', actividad: 'Abono de deuda', cliente: 'Laura Gómez', tipoPersona: 'Cliente', fecha: '2026-10-28', resultado: 'Completado', importe: 750 },
  { id: 17, empleado: 'Laura Díaz', puesto: 'Caja', actividad: 'Pago de deuda', cliente: 'Pedro Ruiz', tipoPersona: 'Cliente', fecha: '2026-10-26', resultado: 'Completado', importe: 950 },
  { id: 18, empleado: 'Laura Díaz', puesto: 'Caja', actividad: 'Atención externa', cliente: 'Persona externa', tipoPersona: 'Externo', fecha: '2026-10-25', resultado: 'Completado', importe: 0 },
  { id: 19, empleado: 'Pedro López', puesto: 'Caja', actividad: 'Pago de deuda', cliente: 'Sofía Díaz', tipoPersona: 'Cliente', fecha: '2026-10-24', resultado: 'Pendiente', importe: 600 },
]

const dinero = (cantidad: number) =>
  cantidad.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  })

const fechaBonita = (fecha: string) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export default function ModuloReportes({ onVolver }: ModuloReportesProps) {
  const [seccion, setSeccion] = useState<Seccion>('general')
  const [periodo, setPeriodo] = useState('mes')
  const [empleado, setEmpleado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  const operaciones = operacionesIniciales

  const empleados = useMemo(
    () => [...new Set(operaciones.map((op) => op.empleado))].sort(),
    [operaciones]
  )

  const operacionesFiltradas = useMemo(() => {
    return operaciones.filter((op) => {
      const coincideEmpleado = empleado === 'todos' || op.empleado === empleado
      const coincideBusqueda =
        `${op.empleado} ${op.actividad} ${op.cliente}`
          .toLowerCase()
          .includes(busqueda.toLowerCase())

      let coincidePeriodo = true
      if (periodo === 'hoy') coincidePeriodo = op.fecha === '2026-10-29'
      if (periodo === 'semana') coincidePeriodo = op.fecha >= '2026-10-23'
      if (periodo === 'mes') coincidePeriodo = op.fecha.startsWith('2026-10')

      const coincideSeccion =
        seccion === 'general' || seccion === 'comparacion'
          ? true
          : op.puesto === (seccion === 'escritorio' ? 'Escritorio' : 'Caja')

      return coincideEmpleado && coincideBusqueda && coincidePeriodo && coincideSeccion
    })
  }, [operaciones, empleado, busqueda, periodo, seccion])

  const completadas = operacionesFiltradas.filter(
    (op) => op.resultado === 'Completado'
  )
  const clientesAtendidos = new Set(
    completadas.filter((op) => op.tipoPersona === 'Cliente').map((op) => op.cliente)
  ).size
  const externosAtendidos = new Set(
    completadas.filter((op) => op.tipoPersona === 'Externo').map((op) => op.empleado + op.fecha + op.id)
  ).size
  const clientesNuevos = completadas.filter(
    (op) => op.actividad === 'Registro de cliente'
  ).length
  const productosAsignados = completadas.filter(
    (op) => op.actividad === 'Asignación de producto'
  ).length
  const pagos = completadas.filter(
    (op) => op.puesto === 'Caja' && op.actividad.toLowerCase().includes('pago') ||
      op.puesto === 'Caja' && op.actividad.toLowerCase().includes('abono')
  )
  const totalRecibido = pagos.reduce((total, op) => total + op.importe, 0)
  const pendientes = operacionesFiltradas.filter(
    (op) => op.resultado === 'Pendiente'
  ).length
  const rechazadas = operacionesFiltradas.filter(
    (op) => op.resultado === 'Rechazado'
  ).length

  const empleadosResumen = empleados
    .filter((nombre) => empleado === 'todos' || empleado === nombre)
    .map((nombre) => {
      const registros = operacionesFiltradas.filter(
        (op) => op.empleado === nombre && op.resultado === 'Completado'
      )
      const esCaja = registros.some((op) => op.puesto === 'Caja')
      const nuevos = registros.filter((op) => op.actividad === 'Registro de cliente').length
      const asignaciones = registros.filter((op) => op.actividad === 'Asignación de producto').length
      const pagosEmpleado = registros.filter(
        (op) => op.puesto === 'Caja' && /pago|abono/i.test(op.actividad)
      )
      const importe = pagosEmpleado.reduce((total, op) => total + op.importe, 0)
      const externos = registros.filter((op) => op.tipoPersona === 'Externo').length
      const atenciones = registros.filter(
        (op) => op.actividad.toLowerCase().includes('atención')
      ).length + pagosEmpleado.length

      return {
        nombre,
        puesto: esCaja ? 'Caja' : 'Escritorio',
        nuevos,
        asignaciones,
        pagos: pagosEmpleado.length,
        importe,
        externos,
        atenciones,
        total: registros.length,
      }
    })

  const maxActividad = Math.max(
    1,
    ...empleadosResumen.map((item) => item.total)
  )

  const tituloSeccion: Record<Seccion, string> = {
    general: 'Reporte general',
    escritorio: 'Personal de escritorio',
    caja: 'Personal de caja',
    comparacion: 'Comparación del personal',
  }

  const descargarCSV = () => {
    const encabezados = [
      'Fecha',
      'Empleado',
      'Puesto',
      'Actividad',
      'Cliente o persona',
      'Tipo de persona',
      'Resultado',
      'Importe',
    ]

    const filas = operacionesFiltradas.map((op) => [
      op.fecha,
      op.empleado,
      op.puesto,
      op.actividad,
      op.cliente,
      op.tipoPersona,
      op.resultado,
      op.importe,
    ])

    const contenido = [encabezados, ...filas]
      .map((fila) => fila.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const archivo = new Blob(['\uFEFF' + contenido], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = 'reporte-banuat.csv'
    enlace.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="mr-contenedor">
      <header className="mr-encabezado">
        <div className="mr-encabezado__izquierda">
          <button
            type="button"
            className="mr-volver"
            onClick={onVolver}
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <span className="mr-etiqueta">SUPERVISIÓN</span>
            <h1>Reportes</h1>
            <p>Rendimiento, atenciones y operaciones del personal.</p>
          </div>
        </div>

        <button type="button" className="mr-exportar" onClick={descargarCSV}>
          <Download size={17} />
          Exportar CSV
        </button>
      </header>

      <section className="mr-filtros">
        <label className="mr-filtro">
          <CalendarDays size={17} />
          <span>Periodo</span>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="todo">Todo el registro</option>
          </select>
        </label>

        <label className="mr-filtro">
          <Users size={17} />
          <span>Empleado</span>
          <select value={empleado} onChange={(e) => setEmpleado(e.target.value)}>
            <option value="todos">Todo el personal</option>
            {empleados.map((nombre) => (
              <option key={nombre} value={nombre}>{nombre}</option>
            ))}
          </select>
        </label>

        <label className="mr-busqueda">
          <Search size={17} />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar empleado, cliente u operación..."
          />
        </label>
      </section>

      <nav className="mr-pestanas" aria-label="Secciones de reportes">
        {([
          ['general', 'General'],
          ['escritorio', 'Escritorio'],
          ['caja', 'Caja'],
          ['comparacion', 'Comparación'],
        ] as [Seccion, string][]).map(([id, nombre]) => (
          <button
            type="button"
            key={id}
            className={seccion === id ? 'mr-pestana activa' : 'mr-pestana'}
            onClick={() => setSeccion(id)}
          >
            {nombre}
          </button>
        ))}
      </nav>

      <div className="mr-titulo-seccion">
        <div>
          <h2>{tituloSeccion[seccion]}</h2>
          <p>Información correspondiente al periodo seleccionado.</p>
        </div>
        <span className="mr-registros">
          {operacionesFiltradas.length} operaciones
        </span>
      </div>

      <section className="mr-indicadores">
        <article className="mr-indicador">
          <span className="mr-indicador__icono azul"><Users size={21} /></span>
          <div>
            <span>Clientes atendidos</span>
            <strong>{clientesAtendidos}</strong>
            <small>Clientes únicos con operación completada</small>
          </div>
        </article>

        <article className="mr-indicador">
          <span className="mr-indicador__icono verde"><UserPlus size={21} /></span>
          <div>
            <span>Clientes nuevos</span>
            <strong>{clientesNuevos}</strong>
            <small>Registros completados</small>
          </div>
        </article>

        <article className="mr-indicador">
          <span className="mr-indicador__icono morado"><PackageCheck size={21} /></span>
          <div>
            <span>Productos asignados</span>
            <strong>{productosAsignados}</strong>
            <small>Asignaciones completadas</small>
          </div>
        </article>

        <article className="mr-indicador">
          <span className="mr-indicador__icono naranja"><Wallet size={21} /></span>
          <div>
            <span>Dinero recibido</span>
            <strong>{dinero(totalRecibido)}</strong>
            <small>{pagos.length} pagos o abonos completados</small>
          </div>
        </article>
      </section>

      <section className="mr-resumen-secundario">
        <div>
          <span>Personas externas atendidas</span>
          <strong>{externosAtendidos}</strong>
        </div>
        <div>
          <span>Operaciones completadas</span>
          <strong>{completadas.length}</strong>
        </div>
        <div>
          <span>Pendientes</span>
          <strong>{pendientes}</strong>
        </div>
        <div>
          <span>Rechazadas</span>
          <strong>{rechazadas}</strong>
        </div>
      </section>

      {seccion === 'general' && (
        <section className="mr-panel">
          <div className="mr-panel__cabecera">
            <div>
              <h3>Actividad por tipo de personal</h3>
              <p>Operaciones completadas por área.</p>
            </div>
            <BarChart3 size={21} />
          </div>

          <div className="mr-comparacion-areas">
            {(['Escritorio', 'Caja'] as Puesto[]).map((puesto) => {
              const cantidad = completadas.filter((op) => op.puesto === puesto).length
              const porcentaje = completadas.length
                ? Math.round((cantidad / completadas.length) * 100)
                : 0

              return (
                <div className="mr-area" key={puesto}>
                  <div className="mr-area__datos">
                    <strong>{puesto}</strong>
                    <span>{cantidad} operaciones · {porcentaje}%</span>
                  </div>
                  <div className="mr-barra">
                    <span
                      className={puesto === 'Caja' ? 'caja' : 'escritorio'}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {seccion === 'escritorio' && (
        <section className="mr-panel">
          <div className="mr-panel__cabecera">
            <div>
              <h3>Actividades de escritorio</h3>
              <p>Registros, asignaciones y atención al público.</p>
            </div>
            <UserPlus size={21} />
          </div>

          <div className="mr-tarjetas-actividad">
            <div><UserPlus size={19} /><span>Clientes nuevos</span><strong>{clientesNuevos}</strong></div>
            <div><PackageCheck size={19} /><span>Productos asignados</span><strong>{productosAsignados}</strong></div>
            <div><Users size={19} /><span>Atenciones externas</span><strong>{completadas.filter((op) => op.puesto === 'Escritorio' && op.tipoPersona === 'Externo').length}</strong></div>
          </div>
        </section>
      )}

      {seccion === 'caja' && (
        <section className="mr-panel">
          <div className="mr-panel__cabecera">
            <div>
              <h3>Actividades de caja</h3>
              <p>Pagos, abonos e importe recibido.</p>
            </div>
            <HandCoins size={21} />
          </div>

          <div className="mr-tarjetas-actividad">
            <div><Wallet size={19} /><span>Pagos y abonos</span><strong>{pagos.length}</strong></div>
            <div><TrendingUp size={19} /><span>Total recibido</span><strong>{dinero(totalRecibido)}</strong></div>
            <div><Users size={19} /><span>Atenciones externas</span><strong>{completadas.filter((op) => op.puesto === 'Caja' && op.tipoPersona === 'Externo').length}</strong></div>
          </div>
        </section>
      )}

      {seccion === 'comparacion' && (
        <section className="mr-panel">
          <div className="mr-panel__cabecera">
            <div>
              <h3>Productividad por empleado</h3>
              <p>Comparación de operaciones completadas. Se muestran indicadores propios de cada puesto.</p>
            </div>
            <TrendingUp size={21} />
          </div>

          <div className="mr-ranking">
            {empleadosResumen
              .sort((a, b) => b.total - a.total)
              .map((item) => (
                <div className="mr-ranking__fila" key={item.nombre}>
                  <div className="mr-ranking__persona">
                    <span className="mr-avatar">{item.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                    <div>
                      <strong>{item.nombre}</strong>
                      <small>{item.puesto}</small>
                    </div>
                  </div>
                  <div className="mr-ranking__barra">
                    <span style={{ width: `${(item.total / maxActividad) * 100}%` }} />
                  </div>
                  <strong className="mr-ranking__total">{item.total}</strong>
                </div>
              ))}
          </div>

          <div className="mr-tabla-contenedor">
            <table className="mr-tabla">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Puesto</th>
                  <th>Nuevos</th>
                  <th>Asignaciones</th>
                  <th>Pagos</th>
                  <th>Importe</th>
                  <th>Atenciones</th>
                </tr>
              </thead>
              <tbody>
                {empleadosResumen.map((item) => (
                  <tr key={item.nombre}>
                    <td><strong>{item.nombre}</strong></td>
                    <td>{item.puesto}</td>
                    <td>{item.nuevos}</td>
                    <td>{item.asignaciones}</td>
                    <td>{item.pagos}</td>
                    <td>{dinero(item.importe)}</td>
                    <td>{item.atenciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mr-panel mr-panel--tabla">
        <div className="mr-panel__cabecera">
          <div>
            <h3>Detalle de operaciones</h3>
            <p>Consulta qué hizo cada empleado y cuándo.</p>
          </div>
          <FileText size={21} />
        </div>

        <div className="mr-tabla-contenedor">
          <table className="mr-tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Puesto</th>
                <th>Actividad</th>
                <th>Cliente / persona</th>
                <th>Resultado</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {operacionesFiltradas.map((op) => (
                <tr key={op.id}>
                  <td>{fechaBonita(op.fecha)}</td>
                  <td><strong>{op.empleado}</strong></td>
                  <td>{op.puesto}</td>
                  <td>{op.actividad}</td>
                  <td>
                    {op.cliente}
                    <small className="mr-tipo-persona">{op.tipoPersona}</small>
                  </td>
                  <td>
                    <span className={`mr-estado ${op.resultado.toLowerCase()}`}>
                      {op.resultado}
                    </span>
                  </td>
                  <td>{op.importe ? dinero(op.importe) : '—'}</td>
                </tr>
              ))}

              {operacionesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={7} className="mr-sin-resultados">
                    No se encontraron operaciones con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mr-nota">
        <strong>Nota:</strong> este reporte utiliza datos demostrativos.
        Las cifras no representan operaciones reales. Para obtener resultados
        reales será necesario conectar los módulos con el historial de operaciones
        y la base de datos.
      </p>
    </main>
  )
}
