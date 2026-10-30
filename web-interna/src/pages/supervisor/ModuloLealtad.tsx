
import { useState } from 'react'
import {
  ArrowLeft,
  Award,
  Gift,
  Coins,
  Percent,
  Plus,
  Trash2,
  ShoppingBag,
  CalendarDays,
  Users,
  Settings,
  CheckCircle,
  Clock,
  Star,
} from 'lucide-react'

import './ModuloLealtad.css'

type Cliente = {
  id: number
  nombre: string
  puntos: number
  ahorroMensual: number
  estadoDeuda: string
  elegible: boolean
}

type Producto = {
  id: number
  nombre: string
  temporada: string
  proveedor: string
  puntos: number
  estado: 'Disponible' | 'Agotado'
}

type Movimiento = {
  id: number
  cliente: string
  concepto: string
  puntos: number
  fecha: string
}

type Props = {
  onVolver: () => void
}

const EQUIVALENCIA = 100

export default function ModuloLealtad({ onVolver }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])

  const [puntosAhorro, setPuntosAhorro] = useState(50)
  const [puntosProducto, setPuntosProducto] = useState(20)
  const [ajusteInteres, setAjusteInteres] = useState(0)

  const [mostrarCliente, setMostrarCliente] = useState(false)
  const [mostrarProducto, setMostrarProducto] = useState(false)

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    ahorroMensual: '',
    estadoDeuda: 'Al corriente',
  })

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    temporada: 'Navidad',
    proveedor: '',
    puntos: '',
  })

  const [mensaje, setMensaje] = useState('')

  const totalPuntos = clientes.reduce(
    (total, cliente) => total + cliente.puntos,
    0
  )

  const valorPuntos = totalPuntos / EQUIVALENCIA

  const clientesElegibles = clientes.filter(
    (cliente) => cliente.elegible
  ).length

  const agregarCliente = () => {
    if (!nuevoCliente.nombre.trim() || !nuevoCliente.ahorroMensual) {
      setMensaje('Completa el nombre y el ahorro mensual.')
      return
    }

    const ahorro = Number(nuevoCliente.ahorroMensual)

    if (ahorro <= 0 || !Number.isFinite(ahorro)) {
      setMensaje('El ahorro mensual debe ser mayor que cero.')
      return
    }

    const cliente: Cliente = {
      id: Date.now(),
      nombre: nuevoCliente.nombre.trim(),
      puntos: 0,
      ahorroMensual: ahorro,
      estadoDeuda: nuevoCliente.estadoDeuda,
      elegible: nuevoCliente.estadoDeuda === 'Sin deuda',
    }

    setClientes((actuales) => [...actuales, cliente])
    setNuevoCliente({
      nombre: '',
      ahorroMensual: '',
      estadoDeuda: 'Al corriente',
    })
    setMostrarCliente(false)
    setMensaje('Cliente agregado correctamente.')
  }

  const agregarProducto = () => {
    if (
      !nuevoProducto.nombre.trim() ||
      !nuevoProducto.proveedor.trim() ||
      !nuevoProducto.puntos
    ) {
      setMensaje('Completa todos los datos del producto.')
      return
    }

    const puntos = Number(nuevoProducto.puntos)

    if (puntos <= 0 || !Number.isFinite(puntos)) {
      setMensaje('Los puntos deben ser mayores que cero.')
      return
    }

    const producto: Producto = {
      id: Date.now(),
      nombre: nuevoProducto.nombre.trim(),
      temporada: nuevoProducto.temporada,
      proveedor: nuevoProducto.proveedor.trim(),
      puntos,
      estado: 'Disponible',
    }

    setProductos((actuales) => [...actuales, producto])
    setNuevoProducto({
      nombre: '',
      temporada: 'Navidad',
      proveedor: '',
      puntos: '',
    })
    setMostrarProducto(false)
    setMensaje('Producto agregado correctamente.')
  }

  const acumularPuntos = (clienteId: number, concepto: string) => {
    const cantidad =
      concepto === 'Ahorro mensual' ? puntosAhorro : puntosProducto

    setClientes((actuales) =>
      actuales.map((cliente) =>
        cliente.id === clienteId
          ? { ...cliente, puntos: cliente.puntos + cantidad }
          : cliente
      )
    )

    const cliente = clientes.find((c) => c.id === clienteId)

    if (cliente) {
      setMovimientos((actuales) => [
        {
          id: Date.now(),
          cliente: cliente.nombre,
          concepto,
          puntos: cantidad,
          fecha: new Date().toLocaleDateString('es-MX'),
        },
        ...actuales,
      ])
    }

    setMensaje(`${cantidad} puntos acumulados correctamente.`)
  }

  const actualizarEstadoDeuda = (
    clienteId: number,
    estado: string
  ) => {
    setClientes((actuales) =>
      actuales.map((cliente) => {
        if (cliente.id !== clienteId) return cliente

        return {
          ...cliente,
          estadoDeuda: estado,
          elegible: estado === 'Sin deuda',
        }
      })
    )
  }

  const eliminarProducto = (id: number) => {
    setProductos((actuales) =>
      actuales.filter((producto) => producto.id !== id)
    )
  }

  const eliminarCliente = (id: number) => {
    setClientes((actuales) =>
      actuales.filter((cliente) => cliente.id !== id)
    )
  }

  const canjearProducto = (clienteId: number, productoId: number) => {
    const cliente = clientes.find((c) => c.id === clienteId)
    const producto = productos.find((p) => p.id === productoId)

    if (!cliente || !producto) return

    if (producto.estado !== 'Disponible') {
      setMensaje('Este producto no está disponible.')
      return
    }

    if (cliente.puntos < producto.puntos) {
      setMensaje('El cliente no tiene suficientes puntos.')
      return
    }

    setClientes((actuales) =>
      actuales.map((c) =>
        c.id === clienteId
          ? { ...c, puntos: c.puntos - producto.puntos }
          : c
      )
    )

    setMovimientos((actuales) => [
      {
        id: Date.now(),
        cliente: cliente.nombre,
        concepto: `Canje: ${producto.nombre}`,
        puntos: -producto.puntos,
        fecha: new Date().toLocaleDateString('es-MX'),
      },
      ...actuales,
    ])

    setMensaje('Canje realizado correctamente.')
  }

  const aplicarBeneficioInteres = (clienteId: number) => {
    const cliente = clientes.find((c) => c.id === clienteId)

    if (!cliente || cliente.puntos < 100) {
      setMensaje('Se necesitan al menos 100 puntos para solicitar el beneficio.')
      return
    }

    if (!cliente.elegible) {
      setMensaje('El cliente debe estar sin deuda para solicitar este beneficio.')
      return
    }

    setClientes((actuales) =>
      actuales.map((c) =>
        c.id === clienteId
          ? { ...c, puntos: c.puntos - 100 }
          : c
      )
    )

    setMovimientos((actuales) => [
      {
        id: Date.now(),
        cliente: cliente.nombre,
        concepto: 'Canje por beneficio de interés',
        puntos: -100,
        fecha: new Date().toLocaleDateString('es-MX'),
      },
      ...actuales,
    ])

    setMensaje(
      `Beneficio solicitado. Ajuste configurado: ${ajusteInteres}%`
    )
  }

  return (
    <main className="ml-contenedor">

      {/* ENCABEZADO */}
      <header className="ml-encabezado">
        <div>
          <button
            type="button"
            className="ml-volver"
            onClick={onVolver}
          >
            <ArrowLeft size={17} />
            Volver al panel
          </button>

          <span className="ml-etiqueta">ADMINISTRACIÓN DE BENEFICIOS</span>

          <h1>Lealtad y puntos</h1>

          <p>
            Administra la acumulación de puntos, los beneficios
            de clientes y los catálogos de recompensas.
          </p>
        </div>

        <div className="ml-encabezado-icono">
          <Award size={34} />
        </div>
      </header>

      {/* MENSAJE */}
      {mensaje && (
        <div className="ml-mensaje">
          <CheckCircle size={17} />
          <span>{mensaje}</span>
          <button
            type="button"
            onClick={() => setMensaje('')}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {/* INDICADORES */}
      <section className="ml-indicadores">

        <article className="ml-indicador">
          <div className="ml-indicador-icono ml-icono-verde">
            <Users size={21} />
          </div>
          <span>Clientes registrados</span>
          <strong>{clientes.length}</strong>
          <small>Clientes en el programa</small>
        </article>

        <article className="ml-indicador">
          <div className="ml-indicador-icono ml-icono-dorado">
            <Coins size={21} />
          </div>
          <span>Puntos acumulados</span>
          <strong>{totalPuntos.toLocaleString('es-MX')}</strong>
          <small>Saldo total de puntos</small>
        </article>

        <article className="ml-indicador">
          <div className="ml-indicador-icono ml-icono-azul">
            <Gift size={21} />
          </div>
          <span>Valor equivalente</span>
          <strong>
            ${valorPuntos.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
            })}
          </strong>
          <small>100 puntos = $1</small>
        </article>

        <article className="ml-indicador">
          <div className="ml-indicador-icono ml-icono-morado">
            <Star size={21} />
          </div>
          <span>Clientes elegibles</span>
          <strong>{clientesElegibles}</strong>
          <small>Sin deuda registrada</small>
        </article>

      </section>

      {/* CONFIGURACIÓN DE PUNTOS */}
      <section className="ml-panel">
        <div className="ml-panel-titulo">
          <div>
            <span className="ml-etiqueta">RF-28 Y RF-29</span>
            <h2>Configuración de puntos</h2>
            <p>Define las reglas de acumulación y el ajuste de interés.</p>
          </div>
          <Settings size={23} />
        </div>

        <div className="ml-config-grid">

          <div className="ml-config-item">
            <label htmlFor="puntosAhorro">
              Puntos por ahorro mensual
            </label>
            <div className="ml-input-sufijo">
              <input
                id="puntosAhorro"
                type="number"
                min="0"
                value={puntosAhorro}
                onChange={(e) => setPuntosAhorro(Math.max(0, Number(e.target.value)))}
              />
              <span>puntos</span>
            </div>
            <small>Se otorgan por mantener ahorro constante.</small>
          </div>

          <div className="ml-config-item">
            <label htmlFor="puntosProducto">
              Puntos por uso de productos
            </label>
            <div className="ml-input-sufijo">
              <input
                id="puntosProducto"
                type="number"
                min="0"
                value={puntosProducto}
                onChange={(e) => setPuntosProducto(Math.max(0, Number(e.target.value)))}
              />
              <span>puntos</span>
            </div>
            <small>Se otorgan por utilizar productos financieros.</small>
          </div>

          <div className="ml-config-item">
            <label htmlFor="ajusteInteres">
              Ajuste de tasa de interés
            </label>
            <div className="ml-input-sufijo">
              <input
                id="ajusteInteres"
                type="number"
                step="0.1"
                value={ajusteInteres}
                onChange={(e) => setAjusteInteres(Number(e.target.value))}
              />
              <span>%</span>
            </div>
            <small>
              Positivo o negativo, según la política de beneficios.
            </small>
          </div>

          <div className="ml-equivalencia">
            <Coins size={24} />
            <div>
              <span>Equivalencia fija</span>
              <strong>100 puntos = $1.00</strong>
              <small>No editable · RF-29</small>
            </div>
          </div>

        </div>
      </section>

      {/* CLIENTES */}
      <section className="ml-panel">
        <div className="ml-panel-titulo">
          <div>
            <span className="ml-etiqueta">RF-28 Y RF-30</span>
            <h2>Clientes y beneficios</h2>
            <p>Consulta los puntos y administra los beneficios disponibles.</p>
          </div>

          <button
            type="button"
            className="ml-boton-principal"
            onClick={() => setMostrarCliente(!mostrarCliente)}
          >
            <Plus size={17} />
            Agregar cliente
          </button>
        </div>

        {mostrarCliente && (
          <div className="ml-formulario">
            <h3>Registrar cliente</h3>

            <div className="ml-form-grid">
              <label>
                Nombre del cliente
                <input
                  value={nuevoCliente.nombre}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Nombre completo"
                />
              </label>

              <label>
                Ahorro mensual
                <input
                  type="number"
                  min="1"
                  value={nuevoCliente.ahorroMensual}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      ahorroMensual: e.target.value,
                    })
                  }
                  placeholder="Ej. 1500"
                />
              </label>

              <label>
                Estado de deuda
                <select
                  value={nuevoCliente.estadoDeuda}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      estadoDeuda: e.target.value,
                    })
                  }
                >
                  <option>Al corriente</option>
                  <option>Deuda próxima a finalizar</option>
                  <option>Con deuda pendiente</option>
                  <option>Sin deuda</option>
                </select>
              </label>
            </div>

            <div className="ml-form-acciones">
              <button
                type="button"
                className="ml-boton-secundario"
                onClick={() => setMostrarCliente(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ml-boton-principal"
                onClick={agregarCliente}
              >
                Guardar cliente
              </button>
            </div>
          </div>
        )}

        {clientes.length === 0 ? (
          <div className="ml-vacio">
            <Users size={35} />
            <h3>No hay clientes registrados</h3>
            <p>
              Agrega clientes para comenzar a administrar sus puntos
              y beneficios.
            </p>
          </div>
        ) : (
          <div className="ml-tabla-contenedor">
            <table className="ml-tabla">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Puntos</th>
                  <th>Ahorro mensual</th>
                  <th>Estado de deuda</th>
                  <th>Beneficio</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td><strong>{cliente.nombre}</strong></td>
                    <td>{cliente.puntos}</td>
                    <td>
                      ${cliente.ahorroMensual.toLocaleString('es-MX')}
                    </td>
                    <td>
                      <select
                        className="ml-estado-select"
                        value={cliente.estadoDeuda}
                        onChange={(e) =>
                          actualizarEstadoDeuda(cliente.id, e.target.value)
                        }
                      >
                        <option>Al corriente</option>
                        <option>Deuda próxima a finalizar</option>
                        <option>Con deuda pendiente</option>
                        <option>Sin deuda</option>
                      </select>
                    </td>
                    <td>
                      <span className={cliente.elegible ? 'ml-estado ml-estado--activo' : 'ml-estado ml-estado--pendiente'}>
                        {cliente.elegible ? 'Elegible' : 'En revisión'}
                      </span>
                    </td>
                    <td>
                      <div className="ml-acciones-tabla">
                        <button
                          type="button"
                          title="Acumular puntos por ahorro"
                          onClick={() => acumularPuntos(cliente.id, 'Ahorro mensual')}
                        >
                          <Coins size={16} />
                        </button>

                        <button
                          type="button"
                          title="Acumular puntos por producto"
                          onClick={() => acumularPuntos(cliente.id, 'Uso de productos')}
                        >
                          <Plus size={16} />
                        </button>

                        <button
                          type="button"
                          title="Canjear por beneficio de interés"
                          onClick={() => aplicarBeneficioInteres(cliente.id)}
                        >
                          <Percent size={16} />
                        </button>

                        <button
                          type="button"
                          title="Eliminar cliente"
                          onClick={() => eliminarCliente(cliente.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* CATÁLOGO */}
      <section className="ml-panel">
        <div className="ml-panel-titulo">
          <div>
            <span className="ml-etiqueta">RF-30 Y RF-31</span>
            <h2>Catálogo de recompensas</h2>
            <p>Administra productos, temporadas y proveedores.</p>
          </div>

          <button
            type="button"
            className="ml-boton-principal"
            onClick={() => setMostrarProducto(!mostrarProducto)}
          >
            <Plus size={17} />
            Agregar producto
          </button>
        </div>

        {mostrarProducto && (
          <div className="ml-formulario">
            <h3>Nuevo producto de catálogo</h3>

            <div className="ml-form-grid">
              <label>
                Nombre del producto
                <input
                  value={nuevoProducto.nombre}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Nombre del producto"
                />
              </label>

              <label>
                Temporada
                <select
                  value={nuevoProducto.temporada}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      temporada: e.target.value,
                    })
                  }
                >
                  <option>Navidad</option>
                  <option>Verano</option>
                  <option>Regreso a clases</option>
                  <option>Día de las madres</option>
                  <option>Temporada especial</option>
                </select>
              </label>

              <label>
                Proveedor
                <input
                  value={nuevoProducto.proveedor}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      proveedor: e.target.value,
                    })
                  }
                  placeholder="Nombre del proveedor"
                />
              </label>

              <label>
                Costo en puntos
                <input
                  type="number"
                  min="1"
                  value={nuevoProducto.puntos}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      puntos: e.target.value,
                    })
                  }
                  placeholder="Ej. 500"
                />
              </label>
            </div>

            <div className="ml-form-acciones">
              <button
                type="button"
                className="ml-boton-secundario"
                onClick={() => setMostrarProducto(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ml-boton-principal"
                onClick={agregarProducto}
              >
                Guardar producto
              </button>
            </div>
          </div>
        )}

        {productos.length === 0 ? (
          <div className="ml-vacio">
            <ShoppingBag size={35} />
            <h3>El catálogo está vacío</h3>
            <p>
              Agrega productos y asigna puntos para que los clientes
              puedan canjearlos.
            </p>
          </div>
        ) : (
          <div className="ml-productos">
            {productos.map((producto) => (
              <article className="ml-producto" key={producto.id}>
                <div className="ml-producto-icono">
                  <Gift size={25} />
                </div>

                <div className="ml-producto-info">
                  <span className="ml-temporada">
                    <CalendarDays size={13} />
                    {producto.temporada}
                  </span>

                  <h3>{producto.nombre}</h3>
                  <p>Proveedor: {producto.proveedor}</p>

                  <strong>{producto.puntos} puntos</strong>
                </div>

                <div className="ml-producto-acciones">
                  <span className="ml-estado ml-estado--activo">
                    Disponible
                  </span>

                  <button
                    type="button"
                    className="ml-boton-eliminar"
                    onClick={() => eliminarProducto(producto.id)}
                    aria-label={`Eliminar ${producto.nombre}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CANJES */}
      <section className="ml-panel">
        <div className="ml-panel-titulo">
          <div>
            <span className="ml-etiqueta">RF-30</span>
            <h2>Canje de puntos</h2>
            <p>Canjea puntos por productos disponibles del catálogo.</p>
          </div>
          <Gift size={23} />
        </div>

        {clientes.length === 0 || productos.length === 0 ? (
          <div className="ml-vacio">
            <Gift size={32} />
            <p>Necesitas registrar clientes y productos para realizar canjes.</p>
          </div>
        ) : (
          <div className="ml-canje-lista">
            {clientes.map((cliente) => (
              <article className="ml-canje-cliente" key={cliente.id}>
                <div>
                  <strong>{cliente.nombre}</strong>
                  <span>{cliente.puntos} puntos disponibles</span>
                </div>

                <div className="ml-canje-acciones">
                  {productos
                    .filter((p) => p.estado === 'Disponible')
                    .map((producto) => (
                      <button
                        key={producto.id}
                        type="button"
                        className="ml-boton-secundario"
                        disabled={cliente.puntos < producto.puntos}
                        onClick={() => canjearProducto(cliente.id, producto.id)}
                      >
                        Canjear {producto.nombre}
                      </button>
                    ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* HISTORIAL */}
      <section className="ml-panel">
        <div className="ml-panel-titulo">
          <div>
            <span className="ml-etiqueta">MOVIMIENTOS</span>
            <h2>Historial de puntos</h2>
            <p>Consulta las acumulaciones y canjes realizados.</p>
          </div>
          <Clock size={23} />
        </div>

        {movimientos.length === 0 ? (
          <div className="ml-vacio">
            <Clock size={32} />
            <p>No hay movimientos registrados.</p>
          </div>
        ) : (
          <div className="ml-tabla-contenedor">
            <table className="ml-tabla">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Concepto</th>
                  <th>Fecha</th>
                  <th>Puntos</th>
                </tr>
              </thead>

              <tbody>
                {movimientos.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td>{movimiento.cliente}</td>
                    <td>{movimiento.concepto}</td>
                    <td>{movimiento.fecha}</td>
                    <td className={movimiento.puntos > 0 ? 'ml-puntos-positivos' : 'ml-puntos-negativos'}>
                      {movimiento.puntos > 0 ? '+' : ''}
                      {movimiento.puntos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* NOTA */}
      <div className="ml-nota">
        <CheckCircle size={17} />
        <p>
          La equivalencia de puntos es fija: 100 puntos equivalen a $1.00.
          Los ajustes de interés y las reglas de acumulación son configurables.
          La elegibilidad mostrada es una referencia administrativa.
        </p>
      </div>

    </main>
  )
}
