import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Search,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  X,
} from 'lucide-react';

import './ModuloHistorial.css';

type Operacion = {
  id: number;
  fecha: string;
  hora: string;
  modulo: string;
  operacion: string;
  descripcion: string;
  usuario: string;
  cliente: string;
  resultado: 'Completada' | 'Pendiente' | 'Rechazada';
  referencia: string;
};

const operacionesIniciales: Operacion[] = [
  {
    id: 1,
    fecha: '2026-10-29',
    hora: '10:35',
    modulo: 'Préstamos',
    operacion: 'Préstamo autorizado',
    descripcion: 'Se autorizó un préstamo personal por $25,000.',
    usuario: 'Carlos Ramírez',
    cliente: 'Juan Pérez',
    resultado: 'Completada',
    referencia: 'PRE-001',
  },
  {
    id: 2,
    fecha: '2026-10-29',
    hora: '11:10',
    modulo: 'Clientes',
    operacion: 'Modificación de tasa',
    descripcion: 'La tasa de interés cambió de 18% a 15%.',
    usuario: 'Carlos Ramírez',
    cliente: 'Juan Pérez',
    resultado: 'Completada',
    referencia: 'CLI-001',
  },
  {
    id: 3,
    fecha: '2026-10-28',
    hora: '09:20',
    modulo: 'Pagos',
    operacion: 'Pago registrado',
    descripcion: 'Se registró un abono de $1,500.',
    usuario: 'María López',
    cliente: 'María González',
    resultado: 'Completada',
    referencia: 'PAG-001',
  },
  {
    id: 4,
    fecha: '2026-10-28',
    hora: '12:45',
    modulo: 'Promociones',
    operacion: 'Promoción creada',
    descripcion: 'Se creó una promoción de temporada.',
    usuario: 'Carlos Ramírez',
    cliente: 'General',
    resultado: 'Completada',
    referencia: 'PRO-001',
  },
  {
    id: 5,
    fecha: '2026-10-27',
    hora: '14:30',
    modulo: 'Lealtad',
    operacion: 'Canje de puntos',
    descripcion: 'Se canjearon 500 puntos por un producto.',
    usuario: 'María López',
    cliente: 'Roberto Sánchez',
    resultado: 'Completada',
    referencia: 'LEA-001',
  },
  {
    id: 6,
    fecha: '2026-10-27',
    hora: '16:00',
    modulo: 'Préstamos',
    operacion: 'Solicitud pendiente',
    descripcion: 'La solicitud requiere revisión de capacidad de pago.',
    usuario: 'Carlos Ramírez',
    cliente: 'Roberto Sánchez',
    resultado: 'Pendiente',
    referencia: 'PRE-002',
  },
  {
    id: 7,
    fecha: '2026-10-26',
    hora: '11:15',
    modulo: 'Proveedores',
    operacion: 'Proveedor actualizado',
    descripcion: 'Se actualizaron los datos de contacto del proveedor.',
    usuario: 'Carlos Ramírez',
    cliente: 'Proveedor Comercial del Norte',
    resultado: 'Completada',
    referencia: 'PROV-001',
  },
  {
    id: 8,
    fecha: '2026-10-26',
    hora: '13:40',
    modulo: 'Préstamos',
    operacion: 'Solicitud rechazada',
    descripcion: 'La solicitud no cumplió los criterios de capacidad de pago.',
    usuario: 'Carlos Ramírez',
    cliente: 'Pedro Hernández',
    resultado: 'Rechazada',
    referencia: 'PRE-003',
  },
];

const modulos = [
  'Todos',
  'Préstamos',
  'Clientes',
  'Pagos',
  'Promociones',
  'Lealtad',
  'Catálogos',
  'Proveedores',
];

const resultados = ['Todos', 'Completada', 'Pendiente', 'Rechazada'];

export default function ModuloHistorial({
  onVolver,
}: {
  onVolver: () => void;
}) {
  const [operaciones] = useState<Operacion[]>(operacionesIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [modulo, setModulo] = useState('Todos');
  const [resultado, setResultado] = useState('Todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [operacionSeleccionada, setOperacionSeleccionada] =
    useState<Operacion | null>(null);

  const operacionesFiltradas = useMemo(() => {
    return operaciones.filter((item) => {
      const texto = [
        item.operacion,
        item.descripcion,
        item.usuario,
        item.cliente,
        item.referencia,
      ]
        .join(' ')
        .toLowerCase();

      const coincideBusqueda = texto.includes(busqueda.toLowerCase());
      const coincideModulo = modulo === 'Todos' || item.modulo === modulo;
      const coincideResultado =
        resultado === 'Todos' || item.resultado === resultado;

      const coincideFechaInicio =
        !fechaInicio || item.fecha >= fechaInicio;

      const coincideFechaFin = !fechaFin || item.fecha <= fechaFin;

      return (
        coincideBusqueda &&
        coincideModulo &&
        coincideResultado &&
        coincideFechaInicio &&
        coincideFechaFin
      );
    });
  }, [operaciones, busqueda, modulo, resultado, fechaInicio, fechaFin]);

  const completadas = operaciones.filter(
    (item) => item.resultado === 'Completada'
  ).length;

  const pendientes = operaciones.filter(
    (item) => item.resultado === 'Pendiente'
  ).length;

  const rechazadas = operaciones.filter(
    (item) => item.resultado === 'Rechazada'
  ).length;

  const limpiarFiltros = () => {
    setBusqueda('');
    setModulo('Todos');
    setResultado('Todos');
    setFechaInicio('');
    setFechaFin('');
  };

  const formatoFecha = (fecha: string) => {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <div className="mh-container">
      <header className="mh-header">
        <div>
          <button className="mh-back" onClick={onVolver}>
            <ArrowLeft size={17} />
            Volver al panel
          </button>

          <h1>Historial de operaciones</h1>
          <p>
            Consulta y supervisa las operaciones realizadas en los
            diferentes módulos de BANUAT.
          </p>
        </div>
      </header>

      {/* RESUMEN */}

      <section className="mh-stats">
        <div className="mh-stat-card">
          <div className="mh-stat-icon blue">
            <History size={21} />
          </div>
          <div>
            <span>Total de operaciones</span>
            <strong>{operaciones.length}</strong>
          </div>
        </div>

        <div className="mh-stat-card">
          <div className="mh-stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Completadas</span>
            <strong>{completadas}</strong>
          </div>
        </div>

        <div className="mh-stat-card">
          <div className="mh-stat-icon orange">
            <Clock size={21} />
          </div>
          <div>
            <span>Pendientes</span>
            <strong>{pendientes}</strong>
          </div>
        </div>

        <div className="mh-stat-card">
          <div className="mh-stat-icon red">
            <XCircle size={21} />
          </div>
          <div>
            <span>Rechazadas</span>
            <strong>{rechazadas}</strong>
          </div>
        </div>
      </section>

      {/* FILTROS */}

      <section className="mh-section">
        <div className="mh-section-heading">
          <div>
            <h2>Registro de operaciones</h2>
            <p>
              Busca y filtra los movimientos realizados en el sistema.
            </p>
          </div>
          <Filter size={21} />
        </div>

        <div className="mh-filters">
          <div className="mh-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar operación, cliente o usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            value={modulo}
            onChange={(e) => setModulo(e.target.value)}
          >
            {modulos.map((item) => (
              <option key={item} value={item}>
                {item === 'Todos' ? 'Todos los módulos' : item}
              </option>
            ))}
          </select>

          <select
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
          >
            {resultados.map((item) => (
              <option key={item} value={item}>
                {item === 'Todos' ? 'Todos los resultados' : item}
              </option>
            ))}
          </select>

          <label className="mh-date-filter">
            <span>Desde</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </label>

          <label className="mh-date-filter">
            <span>Hasta</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </label>

          <button className="mh-clear-button" onClick={limpiarFiltros}>
            <X size={15} />
            Limpiar
          </button>
        </div>

        {/* TABLA */}

        <div className="mh-results-info">
          <span>
            Se encontraron <strong>{operacionesFiltradas.length}</strong>{' '}
            operaciones
          </span>
        </div>

        <div className="mh-table-wrapper">
          <table className="mh-table">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Módulo</th>
                <th>Operación</th>
                <th>Cliente / Referencia</th>
                <th>Usuario</th>
                <th>Resultado</th>
                <th>Detalle</th>
              </tr>
            </thead>

            <tbody>
              {operacionesFiltradas.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{formatoFecha(item.fecha)}</strong>
                    <small>{item.hora}</small>
                  </td>

                  <td>
                    <span className="mh-module-tag">{item.modulo}</span>
                  </td>

                  <td>
                    <strong>{item.operacion}</strong>
                    <small>{item.descripcion}</small>
                  </td>

                  <td>
                    <strong>{item.cliente}</strong>
                    <small>{item.referencia}</small>
                  </td>

                  <td>{item.usuario}</td>

                  <td>
                    <span
                      className={`mh-result ${item.resultado.toLowerCase()}`}
                    >
                      {item.resultado}
                    </span>
                  </td>

                  <td>
                    <button
                      className="mh-detail-button"
                      onClick={() => setOperacionSeleccionada(item)}
                    >
                      <Eye size={16} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}

              {operacionesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={7} className="mh-empty">
                    No se encontraron operaciones con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* DETALLE DE OPERACIÓN */}

      {operacionSeleccionada && (
        <div className="mh-modal-overlay">
          <div className="mh-modal">
            <div className="mh-modal-header">
              <div>
                <span>Detalle de operación</span>
                <h2>{operacionSeleccionada.operacion}</h2>
              </div>

              <button
                className="mh-close"
                onClick={() => setOperacionSeleccionada(null)}
                aria-label="Cerrar detalle"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mh-modal-body">
              <div className="mh-detail-row">
                <span>Referencia</span>
                <strong>{operacionSeleccionada.referencia}</strong>
              </div>

              <div className="mh-detail-row">
                <span>Módulo</span>
                <strong>{operacionSeleccionada.modulo}</strong>
              </div>

              <div className="mh-detail-row">
                <span>Cliente o entidad</span>
                <strong>{operacionSeleccionada.cliente}</strong>
              </div>

              <div className="mh-detail-row">
                <span>Usuario responsable</span>
                <strong>{operacionSeleccionada.usuario}</strong>
              </div>

              <div className="mh-detail-row">
                <span>Fecha y hora</span>
                <strong>
                  {formatoFecha(operacionSeleccionada.fecha)} ·{' '}
                  {operacionSeleccionada.hora}
                </strong>
              </div>

              <div className="mh-detail-row">
                <span>Resultado</span>
                <span
                  className={`mh-result ${operacionSeleccionada.resultado.toLowerCase()}`}
                >
                  {operacionSeleccionada.resultado}
                </span>
              </div>

              <div className="mh-description">
                <span>Descripción de la operación</span>
                <p>{operacionSeleccionada.descripcion}</p>
              </div>
            </div>

            <button
              className="mh-modal-button"
              onClick={() => setOperacionSeleccionada(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}