
import { useState } from 'react'
import {
  ArrowLeft,
  Megaphone,
  Plus,
  CalendarDays,
  Gift,
  Percent,
  TrendingUp,
  PiggyBank,
  Tag,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'

import './ModuloPromociones.css'

type Promocion = {
  id: number
  nombre: string
  tipo: string
  condicion: string
  beneficio: string
  fechaInicio: string
  fechaFin: string
  estado: 'Programada' | 'Activa' | 'Finalizada'
}

export default function ModuloPromociones({
  onVolver,
}: {
  onVolver: () => void
}) {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('Ahorro')
  const [condicion, setCondicion] = useState('')
  const [beneficio, setBeneficio] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  const activas = promociones.filter(p => p.estado === 'Activa').length
  const programadas = promociones.filter(p => p.estado === 'Programada').length
  const finalizadas = promociones.filter(p => p.estado === 'Finalizada').length

  const crearPromocion = () => {
    if (
      !nombre.trim() ||
      !condicion.trim() ||
      !beneficio.trim() ||
      !fechaInicio ||
      !fechaFin
    ) {
      alert('Completa todos los campos de la promoción.')
      return
    }

    if (fechaFin < fechaInicio) {
      alert('La fecha de finalización no puede ser anterior al inicio.')
      return
    }

    const hoy = new Date().toISOString().slice(0, 10)

    const nueva: Promocion = {
      id: Date.now(),
      nombre,
      tipo,
      condicion,
      beneficio,
      fechaInicio,
      fechaFin,
      estado:
        fechaInicio > hoy
          ? 'Programada'
          : fechaFin < hoy
            ? 'Finalizada'
            : 'Activa',
    }

    setPromociones(prev => [...prev, nueva])

    setNombre('')
    setTipo('Ahorro')
    setCondicion('')
    setBeneficio('')
    setFechaInicio('')
    setFechaFin('')
    setMostrarFormulario(false)
  }

  const eliminarPromocion = (id: number) => {
    setPromociones(prev => prev.filter(p => p.id !== id))
  }

  return (
    <main className="mp">
      <header className="mp-encabezado">
        <button
          type="button"
          className="mp-volver"
          onClick={onVolver}
        >
          <ArrowLeft size={16} /> Panel
        </button>

        <div>
          <h1>Gestión de promociones</h1>
          <p>
            Crea, programa y supervisa ofertas y beneficios para los clientes.
          </p>
        </div>

        <button
          type="button"
          className="promo-boton-crear"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <Plus size={17} />
          Nueva promoción
        </button>
      </header>

      {/* Resumen de promociones */}
      <section className="promo-resumen">
        <article className="mp-card promo-indicador">
          <div className="promo-indicador__icono">
            <Megaphone />
          </div>
          <div>
            <span>Total de promociones</span>
            <strong>{promociones.length}</strong>
          </div>
        </article>

        <article className="mp-card promo-indicador">
          <div className="promo-indicador__icono">
            <CheckCircle />
          </div>
          <div>
            <span>Activas</span>
            <strong>{activas}</strong>
          </div>
        </article>

        <article className="mp-card promo-indicador">
          <div className="promo-indicador__icono">
            <CalendarDays />
          </div>
          <div>
            <span>Programadas</span>
            <strong>{programadas}</strong>
          </div>
        </article>

        <article className="mp-card promo-indicador">
          <div className="promo-indicador__icono">
            <Clock />
          </div>
          <div>
            <span>Finalizadas</span>
            <strong>{finalizadas}</strong>
          </div>
        </article>
      </section>

      {/* Crear promoción */}
      {mostrarFormulario && (
        <section className="mp-card promo-formulario">
          <h2>
            <Plus size={19} /> Crear nueva promoción
          </h2>

          <div className="promo-campos">
            <label>
              Nombre de la promoción
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Ahorra y gana"
              />
            </label>

            <label>
              Tipo de promoción
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
              >
                <option value="Ahorro">Ahorro</option>
                <option value="Inversión">Inversión</option>
                <option value="Préstamo">Préstamo</option>
                <option value="Producto">Producto</option>
                <option value="Temporada">Temporada</option>
              </select>
            </label>

            <label className="promo-campo-completo">
              Condiciones para participar
              <textarea
                value={condicion}
                onChange={e => setCondicion(e.target.value)}
                placeholder="Describe qué debe cumplir el cliente..."
                rows={3}
              />
            </label>

            <label className="promo-campo-completo">
              Beneficio o recompensa
              <input
                value={beneficio}
                onChange={e => setBeneficio(e.target.value)}
                placeholder="Ej. Bicicleta o 10% de descuento en intereses"
              />
            </label>

            <label>
              Fecha de inicio
              <input
                type="date"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
              />
            </label>

            <label>
              Fecha de finalización
              <input
                type="date"
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
              />
            </label>
          </div>

          <div className="promo-acciones">
            <button
              type="button"
              className="promo-boton-cancelar"
              onClick={() => setMostrarFormulario(false)}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="promo-boton-crear"
              onClick={crearPromocion}
            >
              Crear promoción
            </button>
          </div>
        </section>
      )}

      {/* Listado */}
      <section className="mp-card promo-listado">
        <div className="mp-lista__cabecera">
          <div>
            <h2>Promociones registradas</h2>
            <p>Consulta y supervisa las ofertas creadas.</p>
          </div>
        </div>

        {promociones.length === 0 ? (
          <div className="mp-vacio">
            <Gift size={34} />
            <p>No hay promociones registradas.</p>
            <small>
              Cuando crees una promoción, aparecerá aquí con sus condiciones,
              beneficios y periodo de vigencia.
            </small>
          </div>
        ) : (
          <div className="promo-lista">
            {promociones.map(p => (
              <article className="promo-item" key={p.id}>
                <div className="promo-item__icono">
                  {p.tipo === 'Ahorro' ? <PiggyBank /> :
                   p.tipo === 'Inversión' ? <TrendingUp /> :
                   p.tipo === 'Préstamo' ? <Percent /> :
                   p.tipo === 'Producto' ? <Tag /> : <Gift />}
                </div>

                <div className="promo-item__contenido">
                  <div className="promo-item__titulo">
                    <h3>{p.nombre}</h3>
                    <span className={`promo-estado promo-estado--${p.estado.toLowerCase()}`}>
                      {p.estado}
                    </span>
                  </div>

                  <p><strong>Tipo:</strong> {p.tipo}</p>
                  <p><strong>Condiciones:</strong> {p.condicion}</p>
                  <p><strong>Beneficio:</strong> {p.beneficio}</p>
                  <p>
                    <strong>Vigencia:</strong> {p.fechaInicio} al {p.fechaFin}
                  </p>
                </div>

                <button
                  type="button"
                  className="promo-boton-eliminar"
                  onClick={() => eliminarPromocion(p.id)}
                  title="Eliminar promoción"
                >
                  <XCircle size={18} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Supervisión */}
      <section className="mp-card promo-supervision">
        <h2>
          <ClipboardList size={19} /> Supervisión de promociones
        </h2>
        <div className="mp-vacio">
          <p>Sin información de participación.</p>
          <small>
            Aquí se podrán consultar los clientes participantes, beneficios
            entregados, productos promocionados y resultados de cada campaña
            cuando se conecte el sistema con la base de datos.
          </small>
        </div>
      </section>
    </main>
  )
}
