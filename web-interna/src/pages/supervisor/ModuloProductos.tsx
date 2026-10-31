import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  CircleDollarSign,
  Edit,
  Eye,
  Plus,
  Power,
  Search,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import './ModuloProductos.css'

type TipoProducto = 'Ahorro' | 'Inversión' | 'Otro'
type EstadoProducto = 'Activo' | 'Inactivo'

type Producto = {
  id: number
  nombre: string
  tipo: TipoProducto
  descripcion: string
  tasaInteres: number
  montoMinimo: number
  plazoMeses: number
  comision: number
  requisitos: string
  estado: EstadoProducto
}

type Props = {
  onVolver: () => void
}

const PRODUCTOS_INICIALES: Producto[] = [
  {
    id: 1,
    nombre: 'Cuenta de Ahorro Básica',
    tipo: 'Ahorro',
    descripcion: 'Cuenta para administrar y guardar dinero de manera segura.',
    tasaInteres: 2.5,
    montoMinimo: 500,
    plazoMeses: 0,
    comision: 0,
    requisitos: 'Identificación oficial y comprobante de domicilio.',
    estado: 'Activo',
  },
  {
    id: 2,
    nombre: 'Ahorro Creciente',
    tipo: 'Ahorro',
    descripcion: 'Cuenta de ahorro con rendimiento por mantener saldo.',
    tasaInteres: 4.2,
    montoMinimo: 1500,
    plazoMeses: 0,
    comision: 25,
    requisitos: 'Identificación oficial, comprobante de domicilio y depósito inicial.',
    estado: 'Activo',
  },
  {
    id: 3,
    nombre: 'Inversión Plazo Fijo',
    tipo: 'Inversión',
    descripcion: 'Producto de inversión con rendimiento a un plazo establecido.',
    tasaInteres: 8.5,
    montoMinimo: 10000,
    plazoMeses: 12,
    comision: 0,
    requisitos: 'Identificación oficial y cuenta bancaria registrada.',
    estado: 'Activo',
  },
  {
    id: 4,
    nombre: 'Inversión Flexible',
    tipo: 'Inversión',
    descripcion: 'Alternativa de inversión con diferentes opciones de plazo.',
    tasaInteres: 6.8,
    montoMinimo: 5000,
    plazoMeses: 6,
    comision: 50,
    requisitos: 'Identificación oficial y comprobante de domicilio.',
    estado: 'Inactivo',
  },
]

const moneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

const FORMULARIO_VACIO = {
  nombre: '',
  tipo: 'Ahorro' as TipoProducto,
  descripcion: '',
  tasaInteres: '',
  montoMinimo: '',
  plazoMeses: '0',
  comision: '0',
  requisitos: '',
}

export default function ModuloProductos({ onVolver }: Props) {
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_INICIALES)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditar, setProductoEditar] = useState<number | null>(null)
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null)

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideBusqueda =
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busqueda.toLowerCase())

      const coincideTipo =
        filtroTipo === 'Todos' || producto.tipo === filtroTipo

      const coincideEstado =
        filtroEstado === 'Todos' || producto.estado === filtroEstado

      return coincideBusqueda && coincideTipo && coincideEstado
    })
  }, [productos, busqueda, filtroTipo, filtroEstado])

  const totalActivos = productos.filter(
    (producto) => producto.estado === 'Activo',
  ).length

  const totalAhorro = productos.filter(
    (producto) => producto.tipo === 'Ahorro',
  ).length

  const totalInversion = productos.filter(
    (producto) => producto.tipo === 'Inversión',
  ).length

  function abrirNuevoProducto() {
    setProductoEditar(null)
    setFormulario(FORMULARIO_VACIO)
    setModalAbierto(true)
  }

  function abrirEdicion(producto: Producto) {
    setProductoEditar(producto.id)
    setFormulario({
      nombre: producto.nombre,
      tipo: producto.tipo,
      descripcion: producto.descripcion,
      tasaInteres: String(producto.tasaInteres),
      montoMinimo: String(producto.montoMinimo),
      plazoMeses: String(producto.plazoMeses),
      comision: String(producto.comision),
      requisitos: producto.requisitos,
    })
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setProductoEditar(null)
    setFormulario(FORMULARIO_VACIO)
  }

  function guardarProducto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nuevoProducto: Producto = {
      id: productoEditar ?? Date.now(),
      nombre: formulario.nombre.trim(),
      tipo: formulario.tipo,
      descripcion: formulario.descripcion.trim(),
      tasaInteres: Number(formulario.tasaInteres),
      montoMinimo: Number(formulario.montoMinimo),
      plazoMeses: Number(formulario.plazoMeses),
      comision: Number(formulario.comision),
      requisitos: formulario.requisitos.trim(),
      estado: 'Activo',
    }

    if (productoEditar !== null) {
      setProductos((actuales) =>
        actuales.map((producto) =>
          producto.id === productoEditar
            ? { ...nuevoProducto, estado: producto.estado }
            : producto,
        ),
      )
    } else {
      setProductos((actuales) => [...actuales, nuevoProducto])
    }

    cerrarModal()
  }

  function cambiarEstado(id: number) {
    setProductos((actuales) =>
      actuales.map((producto) =>
        producto.id === id
          ? {
              ...producto,
              estado: producto.estado === 'Activo' ? 'Inactivo' : 'Activo',
            }
          : producto,
      ),
    )
  }

  return (
    <section className="mpf-modulo">
      {/* ENCABEZADO */}
      <header className="mpf-encabezado">
        <div className="mpf-encabezado__izquierda">
          <button
            type="button"
            className="mpf-volver"
            onClick={onVolver}
            aria-label="Volver al panel"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <span className="mpf-superior">ADMINISTRACIÓN</span>
            <h1>Productos financieros</h1>
            <p>
              Crea y administra las cuentas de ahorro, inversión y otros
              productos de BANUAT.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mpf-btn-principal"
          onClick={abrirNuevoProducto}
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      </header>

      {/* INDICADORES */}
      <div className="mpf-indicadores">
        <article className="mpf-indicador">
          <div className="mpf-indicador__icono mpf-icono--azul">
            <Banknote size={22} />
          </div>
          <div>
            <span>Productos registrados</span>
            <strong>{productos.length}</strong>
            <small>Productos en el catálogo</small>
          </div>
        </article>

        <article className="mpf-indicador">
          <div className="mpf-indicador__icono mpf-icono--verde">
            <BadgeCheck size={22} />
          </div>
          <div>
            <span>Productos activos</span>
            <strong>{totalActivos}</strong>
            <small>Disponibles para clientes</small>
          </div>
        </article>

        <article className="mpf-indicador">
          <div className="mpf-indicador__icono mpf-icono--morado">
            <Wallet size={22} />
          </div>
          <div>
            <span>Cuentas de ahorro</span>
            <strong>{totalAhorro}</strong>
            <small>Productos de ahorro</small>
          </div>
        </article>

        <article className="mpf-indicador">
          <div className="mpf-indicador__icono mpf-icono--naranja">
            <TrendingUp size={22} />
          </div>
          <div>
            <span>Inversiones</span>
            <strong>{totalInversion}</strong>
            <small>Productos de inversión</small>
          </div>
        </article>
      </div>

      {/* LISTADO */}
      <div className="mpf-contenedor">
        <div className="mpf-listado__encabezado">
          <div>
            <h2>Catálogo de productos</h2>
            <p>Consulta, modifica y controla los productos financieros.</p>
          </div>
          <span className="mpf-contador">
            {productosFiltrados.length} resultados
          </span>
        </div>

        {/* FILTROS */}
        <div className="mpf-filtros">
          <label className="mpf-busqueda">
            <Search size={18} />
            <input
              type="search"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </label>

          <select
            value={filtroTipo}
            onChange={(event) => setFiltroTipo(event.target.value)}
            aria-label="Filtrar por tipo"
          >
            <option value="Todos">Todos los tipos</option>
            <option value="Ahorro">Ahorro</option>
            <option value="Inversión">Inversión</option>
            <option value="Otro">Otros</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(event) => setFiltroEstado(event.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>

        {/* TARJETAS */}
        {productosFiltrados.length > 0 ? (
          <div className="mpf-grid">
            {productosFiltrados.map((producto) => (
              <article className="mpf-producto" key={producto.id}>
                <div className="mpf-producto__superior">
                  <div
                    className={`mpf-producto__icono ${
                      producto.tipo === 'Inversión'
                        ? 'mpf-producto__icono--inversion'
                        : producto.tipo === 'Ahorro'
                          ? 'mpf-producto__icono--ahorro'
                          : 'mpf-producto__icono--otro'
                    }`}
                  >
                    {producto.tipo === 'Inversión' ? (
                      <TrendingUp size={23} />
                    ) : producto.tipo === 'Ahorro' ? (
                      <Wallet size={23} />
                    ) : (
                      <CircleDollarSign size={23} />
                    )}
                  </div>

                  <span
                    className={`mpf-estado ${
                      producto.estado === 'Activo'
                        ? 'mpf-estado--activo'
                        : 'mpf-estado--inactivo'
                    }`}
                  >
                    {producto.estado}
                  </span>
                </div>

                <span className="mpf-tipo">{producto.tipo}</span>
                <h3>{producto.nombre}</h3>
                <p className="mpf-descripcion">{producto.descripcion}</p>

                <div className="mpf-datos">
                  <div>
                    <span>Tasa de interés</span>
                    <strong>{producto.tasaInteres}%</strong>
                  </div>
                  <div>
                    <span>Monto mínimo</span>
                    <strong>{moneda.format(producto.montoMinimo)}</strong>
                  </div>
                  <div>
                    <span>Plazo</span>
                    <strong>
                      {producto.plazoMeses === 0
                        ? 'Flexible'
                        : `${producto.plazoMeses} meses`}
                    </strong>
                  </div>
                  <div>
                    <span>Comisión</span>
                    <strong>{moneda.format(producto.comision)}</strong>
                  </div>
                </div>

                <div className="mpf-producto__acciones">
                  <button
                    type="button"
                    className="mpf-accion mpf-accion--ver"
                    onClick={() => setProductoDetalle(producto)}
                  >
                    <Eye size={16} />
                    Detalles
                  </button>

                  <button
                    type="button"
                    className="mpf-accion mpf-accion--editar"
                    onClick={() => abrirEdicion(producto)}
                  >
                    <Edit size={16} />
                    Editar
                  </button>

                  <button
                    type="button"
                    className={`mpf-accion ${
                      producto.estado === 'Activo'
                        ? 'mpf-accion--desactivar'
                        : 'mpf-accion--activar'
                    }`}
                    onClick={() => cambiarEstado(producto.id)}
                    title={
                      producto.estado === 'Activo'
                        ? 'Desactivar producto'
                        : 'Activar producto'
                    }
                  >
                    <Power size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mpf-vacio">
            <Search size={30} />
            <h3>No se encontraron productos</h3>
            <p>Intenta cambiar los filtros o registra un producto nuevo.</p>
          </div>
        )}
      </div>

      {/* MODAL DE REGISTRO Y EDICIÓN */}
      {modalAbierto && (
        <div className="mpf-overlay" onClick={cerrarModal}>
          <section
            className="mpf-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mpf-modal-titulo"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mpf-modal__encabezado">
              <div>
                <span>GESTIÓN DE PRODUCTOS</span>
                <h2 id="mpf-modal-titulo">
                  {productoEditar !== null
                    ? 'Editar producto'
                    : 'Registrar producto'}
                </h2>
                <p>
                  Configura las características del producto financiero.
                </p>
              </div>

              <button
                type="button"
                className="mpf-cerrar"
                onClick={cerrarModal}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <form className="mpf-formulario" onSubmit={guardarProducto}>
              <label>
                Nombre del producto
                <input
                  type="text"
                  placeholder="Ej. Cuenta de ahorro joven"
                  value={formulario.nombre}
                  onChange={(event) =>
                    setFormulario({
                      ...formulario,
                      nombre: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Tipo de producto
                <select
                  value={formulario.tipo}
                  onChange={(event) =>
                    setFormulario({
                      ...formulario,
                      tipo: event.target.value as TipoProducto,
                    })
                  }
                >
                  <option value="Ahorro">Cuenta de ahorro</option>
                  <option value="Inversión">Cuenta de inversión</option>
                  <option value="Otro">Otro producto</option>
                </select>
              </label>

              <label className="mpf-campo-completo">
                Descripción
                <textarea
                  placeholder="Describe brevemente el producto y sus beneficios."
                  value={formulario.descripcion}
                  onChange={(event) =>
                    setFormulario({
                      ...formulario,
                      descripcion: event.target.value,
                    })
                  }
                  rows={3}
                  required
                />
              </label>

              <div className="mpf-campos-dos">
                <label>
                  Tasa de interés (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Ej. 5.5"
                    value={formulario.tasaInteres}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        tasaInteres: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Monto mínimo ($)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej. 1000"
                    value={formulario.montoMinimo}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        montoMinimo: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Plazo (meses)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0 = flexible"
                    value={formulario.plazoMeses}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        plazoMeses: event.target.value,
                      })
                    }
                    required
                  />
                  <small>Utiliza 0 si el plazo es flexible.</small>
                </label>

                <label>
                  Comisión ($)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej. 0"
                    value={formulario.comision}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        comision: event.target.value,
                      })
                    }
                    required
                  />
                </label>
              </div>

              <label className="mpf-campo-completo">
                Requisitos
                <textarea
                  placeholder="Indica los documentos o condiciones necesarios."
                  value={formulario.requisitos}
                  onChange={(event) =>
                    setFormulario({
                      ...formulario,
                      requisitos: event.target.value,
                    })
                  }
                  rows={3}
                  required
                />
              </label>

              <div className="mpf-formulario__acciones">
                <button
                  type="button"
                  className="mpf-btn-secundario"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button type="submit" className="mpf-btn-principal">
                  <BadgeCheck size={17} />
                  {productoEditar !== null
                    ? 'Guardar cambios'
                    : 'Registrar producto'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      {productoDetalle && (
        <div
          className="mpf-overlay"
          onClick={() => setProductoDetalle(null)}
        >
          <section
            className="mpf-modal mpf-modal--detalle"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mpf-detalle-titulo"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mpf-modal__encabezado">
              <div>
                <span>INFORMACIÓN DEL PRODUCTO</span>
                <h2 id="mpf-detalle-titulo">{productoDetalle.nombre}</h2>
                <p>{productoDetalle.descripcion}</p>
              </div>

              <button
                type="button"
                className="mpf-cerrar"
                onClick={() => setProductoDetalle(null)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mpf-detalle__datos">
              <div>
                <span>Tipo</span>
                <strong>{productoDetalle.tipo}</strong>
              </div>
              <div>
                <span>Estado</span>
                <strong>{productoDetalle.estado}</strong>
              </div>
              <div>
                <span>Tasa de interés</span>
                <strong>{productoDetalle.tasaInteres}%</strong>
              </div>
              <div>
                <span>Monto mínimo</span>
                <strong>{moneda.format(productoDetalle.montoMinimo)}</strong>
              </div>
              <div>
                <span>Plazo</span>
                <strong>
                  {productoDetalle.plazoMeses === 0
                    ? 'Flexible'
                    : `${productoDetalle.plazoMeses} meses`}
                </strong>
              </div>
              <div>
                <span>Comisión</span>
                <strong>{moneda.format(productoDetalle.comision)}</strong>
              </div>
              <div className="mpf-detalle__requisitos">
                <span>Requisitos</span>
                <p>{productoDetalle.requisitos}</p>
              </div>
            </div>

            <div className="mpf-formulario__acciones">
              <button
                type="button"
                className="mpf-btn-secundario"
                onClick={() => setProductoDetalle(null)}
              >
                Cerrar
              </button>

              <button
                type="button"
                className="mpf-btn-principal"
                onClick={() => {
                  abrirEdicion(productoDetalle)
                  setProductoDetalle(null)
                }}
              >
                <Edit size={17} />
                Editar producto
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}