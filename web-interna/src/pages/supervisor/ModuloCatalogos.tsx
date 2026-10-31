
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  Eye,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import './ModuloCatalogos.css'

type EstadoCatalogo = 'Publicado' | 'En preparación' | 'Inactivo'

type Promocion = {
  id: number
  nombre: string
  descripcion: string
  beneficio: string
  vigencia: string
  seleccionada: boolean
}

type Catalogo = {
  id: number
  nombre: string
  descripcion: string
  temporada: string
  inicio: string
  fin: string
  estado: EstadoCatalogo
  portada: string
  promociones: Promocion[]
}

type ModuloCatalogosProps = {
  onVolver?: () => void
}

const promocionesIniciales: Promocion[] = [
  {
    id: 1,
    nombre: 'Tasa preferencial',
    descripcion: 'Tasa especial para clientes elegibles.',
    beneficio: '12 % de interés',
    vigencia: 'Hasta el 31/12/2026',
    seleccionada: false,
  },
  {
    id: 2,
    nombre: 'Puntos dobles',
    descripcion: 'Obtén puntos adicionales por tus pagos puntuales.',
    beneficio: 'Doble acumulación de puntos',
    vigencia: 'Hasta el 30/11/2026',
    seleccionada: false,
  },
  {
    id: 3,
    nombre: 'Beneficio por renovación',
    descripcion: 'Beneficio para clientes que renuevan su préstamo.',
    beneficio: 'Descuento en tasa',
    vigencia: 'Hasta el 31/12/2026',
    seleccionada: false,
  },
  {
    id: 4,
    nombre: 'Ahorro constante',
    descripcion: 'Incentivo para clientes con ahorro mensual.',
    beneficio: 'Puntos adicionales',
    vigencia: 'Vigencia permanente',
    seleccionada: false,
  },
  {
    id: 5,
    nombre: 'Cliente frecuente',
    descripcion: 'Reconocimiento por permanencia y buen historial.',
    beneficio: 'Beneficios de lealtad',
    vigencia: 'Hasta el 31/12/2026',
    seleccionada: false,
  },
]

const catalogosIniciales: Catalogo[] = [
  {
    id: 1,
    nombre: 'Promociones de Navidad 2026',
    descripcion: 'Beneficios especiales para nuestros clientes durante la temporada navideña.',
    temporada: 'Navidad',
    inicio: '2026-12-01',
    fin: '2026-12-31',
    estado: 'Publicado',
    portada: 'navidad',
    promociones: [
      { ...promocionesIniciales[0], seleccionada: true },
      { ...promocionesIniciales[1], seleccionada: true },
    ],
  },
  {
    id: 2,
    nombre: 'Regreso a clases',
    descripcion: 'Promociones y beneficios para apoyar a las familias.',
    temporada: 'Regreso a clases',
    inicio: '2026-08-01',
    fin: '2026-09-15',
    estado: 'Inactivo',
    portada: 'escuela',
    promociones: [
      { ...promocionesIniciales[3], seleccionada: true },
    ],
  },
  {
    id: 3,
    nombre: 'Campaña de verano',
    descripcion: 'Opciones especiales y beneficios de temporada.',
    temporada: 'Verano',
    inicio: '2026-07-01',
    fin: '2026-07-31',
    estado: 'En preparación',
    portada: 'verano',
    promociones: [
      { ...promocionesIniciales[2], seleccionada: true },
    ],
  },
]

const estadoClase = (estado: EstadoCatalogo) => {
  if (estado === 'Publicado') return 'mcatalogo-estado publicado'
  if (estado === 'Inactivo') return 'mcatalogo-estado inactivo'
  return 'mcatalogo-estado preparacion'
}

export default function ModuloCatalogos({ onVolver }: ModuloCatalogosProps) {
  const [catalogos, setCatalogos] = useState<Catalogo[]>(catalogosIniciales)
  const promociones = promocionesIniciales
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [catalogoSeleccionado, setCatalogoSeleccionado] = useState<number | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalDetalle, setModalDetalle] = useState(false)
  const [editando, setEditando] = useState<number | null>(null)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [temporada, setTemporada] = useState('Navidad')
  const [inicio, setInicio] = useState('')
  const [fin, setFin] = useState('')
  const [portada, setPortada] = useState('navidad')
  const [promocionesSeleccionadas, setPromocionesSeleccionadas] = useState<number[]>([])

  const catalogosFiltrados = useMemo(() => {
    return catalogos.filter((catalogo) => {
      const coincideBusqueda = `${catalogo.nombre} ${catalogo.temporada}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())

      const coincideEstado =
        filtroEstado === 'Todos' || catalogo.estado === filtroEstado

      return coincideBusqueda && coincideEstado
    })
  }, [catalogos, busqueda, filtroEstado])

  const catalogoActual = catalogos.find((item) => item.id === catalogoSeleccionado)

  const limpiarFormulario = () => {
    setNombre('')
    setDescripcion('')
    setTemporada('Navidad')
    setInicio('')
    setFin('')
    setPortada('navidad')
    setPromocionesSeleccionadas([])
    setEditando(null)
  }

  const abrirNuevo = () => {
    limpiarFormulario()
    setModalAbierto(true)
  }

  const abrirEdicion = (catalogo: Catalogo) => {
    setEditando(catalogo.id)
    setNombre(catalogo.nombre)
    setDescripcion(catalogo.descripcion)
    setTemporada(catalogo.temporada)
    setInicio(catalogo.inicio)
    setFin(catalogo.fin)
    setPortada(catalogo.portada)
    setPromocionesSeleccionadas(catalogo.promociones.map((p) => p.id))
    setModalAbierto(true)
  }

  const alternarPromocion = (id: number) => {
    setPromocionesSeleccionadas((actuales) =>
      actuales.includes(id)
        ? actuales.filter((item) => item !== id)
        : [...actuales, id]
    )
  }

  const guardarCatalogo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (fin < inicio) {
      alert('La fecha de finalización no puede ser anterior a la fecha de inicio.')
      return
    }

    const seleccionadas = promociones.filter((promo) =>
      promocionesSeleccionadas.includes(promo.id)
    )

    if (editando !== null) {
      setCatalogos((actuales) =>
        actuales.map((catalogo) =>
          catalogo.id === editando
            ? {
                ...catalogo,
                nombre,
                descripcion,
                temporada,
                inicio,
                fin,
                portada,
                promociones: seleccionadas,
              }
            : catalogo
        )
      )
    } else {
      const nuevo: Catalogo = {
        id: Date.now(),
        nombre,
        descripcion,
        temporada,
        inicio,
        fin,
        estado: 'En preparación',
        portada,
        promociones: seleccionadas,
      }

      setCatalogos((actuales) => [nuevo, ...actuales])
    }

    setModalAbierto(false)
    limpiarFormulario()
  }

  const cambiarEstado = (id: number, estado: EstadoCatalogo) => {
    setCatalogos((actuales) =>
      actuales.map((catalogo) =>
        catalogo.id === id ? { ...catalogo, estado } : catalogo
      )
    )
  }

  const eliminarCatalogo = (id: number) => {
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar este catálogo?'
    )

    if (!confirmar) return

    setCatalogos((actuales) => actuales.filter((item) => item.id !== id))

    if (catalogoSeleccionado === id) {
      setCatalogoSeleccionado(null)
      setModalDetalle(false)
    }
  }

  const totalPromociones = catalogos.reduce(
    (total, catalogo) => total + catalogo.promociones.length,
    0
  )

  const publicados = catalogos.filter(
    (catalogo) => catalogo.estado === 'Publicado'
  ).length

  const prepararPublicacion = (catalogo: Catalogo) => {
    if (catalogo.promociones.length === 0) {
      alert('Agrega al menos una promoción antes de publicar el catálogo.')
      return
    }

    cambiarEstado(catalogo.id, 'Publicado')
  }

  const abrirDetalle = (catalogo: Catalogo) => {
    setCatalogoSeleccionado(catalogo.id)
    setModalDetalle(true)
  }

  const imagenTemporada = (tipo: string) => {
    const imagenes: Record<string, string> = {
      navidad: 'navidad',
      escuela: 'escuela',
      verano: 'verano',
      primavera: 'primavera',
      general: 'general',
    }

    return imagenes[tipo] || 'general'
  }

  return (
    <main className="mcatalogo-contenedor">
      <header className="mcatalogo-encabezado">
        <div className="mcatalogo-encabezado__izquierda">
          <button
            type="button"
            className="mcatalogo-volver"
            onClick={onVolver}
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <span className="mcatalogo-etiqueta">GESTIÓN COMERCIAL</span>
            <h1>Catálogos</h1>
            <p>Organiza las promociones en campañas y temporadas.</p>
          </div>
        </div>

        <button
          type="button"
          className="mcatalogo-nuevo"
          onClick={abrirNuevo}
        >
          <Plus size={18} />
          Crear catálogo
        </button>
      </header>

      <section className="mcatalogo-indicadores">
        <article>
          <span className="mcatalogo-indicador-icono"><BookOpen size={21} /></span>
          <div>
            <small>Catálogos registrados</small>
            <strong>{catalogos.length}</strong>
          </div>
        </article>

        <article>
          <span className="mcatalogo-indicador-icono verde"><Send size={21} /></span>
          <div>
            <small>Catálogos publicados</small>
            <strong>{publicados}</strong>
          </div>
        </article>

        <article>
          <span className="mcatalogo-indicador-icono morado"><Megaphone size={21} /></span>
          <div>
            <small>Promociones organizadas</small>
            <strong>{totalPromociones}</strong>
          </div>
        </article>
      </section>

      <section className="mcatalogo-herramientas">
        <label className="mcatalogo-busqueda">
          <Search size={17} />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar catálogo o temporada..."
          />
        </label>

        <select
          className="mcatalogo-filtro"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Publicado">Publicados</option>
          <option value="En preparación">En preparación</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </section>

      <div className="mcatalogo-subtitulo">
        <div>
          <h2>Catálogos de temporada</h2>
          <p>Administra las campañas y sus promociones.</p>
        </div>
        <span>{catalogosFiltrados.length} catálogos</span>
      </div>

      <section className="mcatalogo-grid">
        {catalogosFiltrados.map((catalogo) => (
          <article className="mcatalogo-tarjeta" key={catalogo.id}>
            <div className={`mcatalogo-portada ${imagenTemporada(catalogo.portada)}`}>
              <div className="mcatalogo-portada__icono">
                {catalogo.portada === 'navidad' ? '✦' :
                  catalogo.portada === 'escuela' ? '✎' :
                    catalogo.portada === 'verano' ? '☀' :
                      catalogo.portada === 'primavera' ? '❀' : '◆'}
              </div>
              <span>{catalogo.temporada}</span>
              <strong>{catalogo.nombre}</strong>
            </div>

            <div className="mcatalogo-tarjeta__contenido">
              <div className="mcatalogo-tarjeta__estado">
                <span className={estadoClase(catalogo.estado)}>
                  {catalogo.estado}
                </span>
                <span className="mcatalogo-cantidad">
                  <Megaphone size={14} />
                  {catalogo.promociones.length} promociones
                </span>
              </div>

              <p>{catalogo.descripcion}</p>

              <div className="mcatalogo-fechas">
                <CalendarDays size={15} />
                <span>{catalogo.inicio ? new Date(`${catalogo.inicio}T12:00:00`).toLocaleDateString('es-MX') : 'Sin fecha'} – {catalogo.fin ? new Date(`${catalogo.fin}T12:00:00`).toLocaleDateString('es-MX') : 'Sin fecha'}</span>
              </div>

              <div className="mcatalogo-acciones">
                <button
                  type="button"
                  className="mcatalogo-accion secundaria"
                  onClick={() => abrirDetalle(catalogo)}
                >
                  <Eye size={15} />
                  Ver
                </button>

                <button
                  type="button"
                  className="mcatalogo-accion secundaria"
                  onClick={() => abrirEdicion(catalogo)}
                >
                  <Pencil size={15} />
                  Editar
                </button>

                {catalogo.estado !== 'Publicado' && (
                  <button
                    type="button"
                    className="mcatalogo-accion publicar"
                    onClick={() => prepararPublicacion(catalogo)}
                  >
                    <Send size={15} />
                    Publicar
                  </button>
                )}

                {catalogo.estado === 'Publicado' && (
                  <button
                    type="button"
                    className="mcatalogo-accion secundaria"
                    onClick={() => cambiarEstado(catalogo.id, 'Inactivo')}
                  >
                    <X size={15} />
                    Desactivar
                  </button>
                )}

                <button
                  type="button"
                  className="mcatalogo-eliminar"
                  onClick={() => eliminarCatalogo(catalogo.id)}
                  aria-label={`Eliminar ${catalogo.nombre}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}

        {catalogosFiltrados.length === 0 && (
          <div className="mcatalogo-vacio">
            <BookOpen size={35} />
            <strong>No hay catálogos para mostrar</strong>
            <span>Prueba con otro filtro o crea un catálogo nuevo.</span>
          </div>
        )}
      </section>

      {/* MODAL PARA CREAR O EDITAR */}
      {modalAbierto && (
        <div className="mcatalogo-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setModalAbierto(false)
        }}>
          <section className="mcatalogo-modal">
            <header className="mcatalogo-modal__cabecera">
              <div>
                <span>ADMINISTRACIÓN</span>
                <h2>{editando !== null ? 'Editar catálogo' : 'Crear catálogo'}</h2>
              </div>
              <button type="button" onClick={() => setModalAbierto(false)} aria-label="Cerrar">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={guardarCatalogo}>
              <label className="mcatalogo-campo">
                Nombre del catálogo
                <input
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Promociones de Navidad 2026"
                />
              </label>

              <label className="mcatalogo-campo">
                Descripción
                <textarea
                  required
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el objetivo del catálogo..."
                />
              </label>

              <div className="mcatalogo-campos-dobles">
                <label className="mcatalogo-campo">
                  Temporada
                  <select value={temporada} onChange={(e) => setTemporada(e.target.value)}>
                    <option>Navidad</option>
                    <option>Primavera</option>
                    <option>Verano</option>
                    <option>Regreso a clases</option>
                    <option>Fin de año</option>
                    <option>Buen Fin</option>
                    <option>Otra temporada</option>
                  </select>
                </label>

                <label className="mcatalogo-campo">
                  Diseño de portada
                  <select value={portada} onChange={(e) => setPortada(e.target.value)}>
                    <option value="navidad">Navidad</option>
                    <option value="primavera">Primavera</option>
                    <option value="verano">Verano</option>
                    <option value="escuela">Regreso a clases</option>
                    <option value="general">General</option>
                  </select>
                </label>
              </div>

              <div className="mcatalogo-campos-dobles">
                <label className="mcatalogo-campo">
                  Fecha de inicio
                  <input
                    type="date"
                    required
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                  />
                </label>

                <label className="mcatalogo-campo">
                  Fecha de finalización
                  <input
                    type="date"
                    required
                    min={inicio || undefined}
                    value={fin}
                    onChange={(e) => setFin(e.target.value)}
                  />
                </label>
              </div>

              <div className="mcatalogo-seleccion">
                <div className="mcatalogo-seleccion__titulo">
                  <div>
                    <strong>Promociones disponibles</strong>
                    <small>Selecciona las promociones que formarán parte del catálogo.</small>
                  </div>
                  <span>{promocionesSeleccionadas.length} seleccionadas</span>
                </div>

                {promociones.map((promo) => {
                  const seleccionada = promocionesSeleccionadas.includes(promo.id)

                  return (
                    <button
                      type="button"
                      key={promo.id}
                      className={`mcatalogo-promo-opcion ${seleccionada ? 'seleccionada' : ''}`}
                      onClick={() => alternarPromocion(promo.id)}
                    >
                      <span className="mcatalogo-checkbox">
                        {seleccionada && <Check size={14} />}
                      </span>
                      <span className="mcatalogo-promo-opcion__texto">
                        <strong>{promo.nombre}</strong>
                        <small>{promo.beneficio} · {promo.vigencia}</small>
                      </span>
                    </button>
                  )
                })}
              </div>

              <footer className="mcatalogo-modal__acciones">
                <button
                  type="button"
                  className="mcatalogo-cancelar"
                  onClick={() => {
                    setModalAbierto(false)
                    limpiarFormulario()
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="mcatalogo-guardar">
                  <Check size={17} />
                  {editando !== null ? 'Guardar cambios' : 'Crear catálogo'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {/* MODAL DE DETALLE */}
      {modalDetalle && catalogoActual && (
        <div className="mcatalogo-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setModalDetalle(false)
        }}>
          <section className="mcatalogo-modal mcatalogo-modal--detalle">
            <header className="mcatalogo-modal__cabecera">
              <div>
                <span>DETALLE DEL CATÁLOGO</span>
                <h2>{catalogoActual.nombre}</h2>
              </div>
              <button type="button" onClick={() => setModalDetalle(false)} aria-label="Cerrar">
                <X size={20} />
              </button>
            </header>

            <p className="mcatalogo-detalle-descripcion">
              {catalogoActual.descripcion}
            </p>

            <div className="mcatalogo-detalle-datos">
              <div>
                <small>Temporada</small>
                <strong>{catalogoActual.temporada}</strong>
              </div>
              <div>
                <small>Estado</small>
                <strong>{catalogoActual.estado}</strong>
              </div>
              <div>
                <small>Promociones</small>
                <strong>{catalogoActual.promociones.length}</strong>
              </div>
            </div>

            <h3 className="mcatalogo-detalle-titulo">Promociones incluidas</h3>

            <div className="mcatalogo-detalle-lista">
              {catalogoActual.promociones.length > 0 ? (
                catalogoActual.promociones.map((promo) => (
                  <article key={promo.id}>
                    <span><Megaphone size={17} /></span>
                    <div>
                      <strong>{promo.nombre}</strong>
                      <small>{promo.descripcion}</small>
                      <b>{promo.beneficio}</b>
                    </div>
                  </article>
                ))
              ) : (
                <p>Este catálogo todavía no contiene promociones.</p>
              )}
            </div>

            <footer className="mcatalogo-modal__acciones">
              <button
                type="button"
                className="mcatalogo-cancelar"
                onClick={() => setModalDetalle(false)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="mcatalogo-guardar"
                onClick={() => {
                  setModalDetalle(false)
                  abrirEdicion(catalogoActual)
                }}
              >
                <Pencil size={16} />
                Editar catálogo
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}
