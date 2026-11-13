
import { useMemo, useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  FileText,
  ClipboardList,
  CalendarDays,
  Clock3,
  CheckCircle2,
  Search,
  Eye,
} from "lucide-react";

import type { Cliente, Solicitud } from "./Escritorio";
import { fetchActividades } from "../../services/escritorio";

import "./Actividad.css";

const FECHA_RESUMEN = new Date().toLocaleDateString("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

type ActividadEjecutivo = {
  id: string;
  tipo: "atencion" | "registro" | "solicitud";
  descripcion: string;
  cliente: string;
  fecha: string;
  hora: string;
  detalle: string;
};

type ActividadProps = {
  clientes: Cliente[];
  solicitudes: Solicitud[];
};

const obtenerFechaLocal = () => {
  const fecha = new Date();

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
};

// Convierte una fecha de formato dd/mm/aaaa a aaaa-mm-dd.
const convertirFecha = (fecha: string) => {
  const partes = fecha.split(/[/-]/);

  if (partes.length !== 3) {
    return "";
  }

  const [dia, mes, anio] = partes;

  if (anio.length === 4) {
    return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  return "";
};

const formatoFecha = (fecha: string) => {
  if (!fecha) return "Sin fecha";

  const [anio, mes, dia] = fecha.split("-").map(Number);

  return new Date(anio, mes - 1, dia).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const configuracionTipo = {
  atencion: {
    etiqueta: "Atención",
    icono: Users,
    clase: "atencion",
  },
  registro: {
    etiqueta: "Registro",
    icono: UserPlus,
    clase: "registro",
  },
  solicitud: {
    etiqueta: "Solicitud",
    icono: FileText,
    clase: "solicitud",
  },
};

function Actividad({ clientes, solicitudes }: ActividadProps) {
  const [filtro, setFiltro] = useState("todas");
  const [actividadesBackend, setActividadesBackend] = useState<ActividadEjecutivo[]>([]);

  useEffect(() => {
    let activo = true;
    fetchActividades().then((items) => {
      if (activo && Array.isArray(items) && items.length > 0) {
        setActividadesBackend(items as ActividadEjecutivo[]);
      }
    });
    return () => {
      activo = false;
    };
  }, []);

  const [actividadSeleccionada, setActividadSeleccionada] =
    useState<ActividadEjecutivo | null>(null);

  const fechaHoy = obtenerFechaLocal();

  // Construye el historial usando los registros reales del backend o los registros existentes
  const actividades = useMemo<ActividadEjecutivo[]>(() => {
    if (actividadesBackend.length > 0) {
      return actividadesBackend;
    }
    const registrosClientes: ActividadEjecutivo[] = clientes.map(
      (cliente) => {
        const fechaRegistro = new Date(cliente.id);

        const fechaValida = !isNaN(fechaRegistro.getTime());

        return {
          id: `cliente-${cliente.id}`,
          tipo: "registro",
          descripcion: "Registro de nuevo cliente",
          cliente: cliente.nombre,
          fecha: fechaValida
            ? [
                fechaRegistro.getFullYear(),
                String(fechaRegistro.getMonth() + 1).padStart(2, "0"),
                String(fechaRegistro.getDate()).padStart(2, "0"),
              ].join("-")
            : "",
          hora: fechaValida
            ? fechaRegistro.toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--",
          detalle:
            "Se registró un nuevo cliente en el sistema. Estado actual: " +
            cliente.estado,
        };
      }
    );

    const registrosSolicitudes: ActividadEjecutivo[] = solicitudes.map(
      (solicitud) => ({
        id: `solicitud-${solicitud.id}`,
        tipo: "solicitud",
        descripcion: "Solicitud enviada",
        cliente: solicitud.cliente,
        fecha: convertirFecha(solicitud.fecha),
        hora: "--:--",
        detalle: `Producto: ${solicitud.producto}. Monto: ${solicitud.monto.toLocaleString(
          "es-MX",
          {
            style: "currency",
            currency: "MXN",
          }
        )}. Estado: ${solicitud.estado}.`,
      })
    );

    return [...registrosClientes, ...registrosSolicitudes].sort(
      (a, b) => {
        const fechaA = `${a.fecha} ${a.hora}`;
        const fechaB = `${b.fecha} ${b.hora}`;

        return fechaB.localeCompare(fechaA);
      }
    );
  }, [clientes, solicitudes, actividadesBackend]);

  // Estadísticas del día.
  const actividadesHoy = actividades.filter(
    (actividad) => actividad.fecha === fechaHoy
  );

  const totalAtenciones = actividadesHoy.filter(
    (actividad) => actividad.tipo === "atencion"
  ).length;

  const totalRegistros = actividadesHoy.filter(
    (actividad) => actividad.tipo === "registro"
  ).length;

  const totalSolicitudes = actividadesHoy.filter(
    (actividad) => actividad.tipo === "solicitud"
  ).length;

  // Filtros del historial.
  const actividadesFiltradas = useMemo(() => {
    return actividades.filter((actividad) => {
      return filtro === "todas" || actividad.tipo === filtro;
    });
  }, [actividades, filtro]);

  return (
    <section className="es-section act-section">

      {/* ENCABEZADO */}
      <div className="es-page-heading">
        <div>
          <span className="es-eyebrow">CONTROL DE OPERACIONES</span>
          <h1>Actividad diaria</h1>
          <p>
            Consulta el resumen de tus actividades y las operaciones
            que has realizado.
          </p>
        </div>
      </div>

      {/* FECHA */}
      <div className="act-date-banner">
        <div className="act-date-icon">
          <CalendarDays size={21} />
        </div>

        <div>
          <span>Resumen del día</span>
          <strong>
            {FECHA_RESUMEN}
          </strong>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="es-stats-grid es-stats-three act-stats">

        <article className="es-stat-card act-stat-card">
          <div className="act-stat-icon act-icon-green">
            <Users size={21} />
          </div>

          <span>Clientes atendidos</span>
          <strong>{totalAtenciones}</strong>
          <small>Atenciones registradas hoy</small>
        </article>

        <article className="es-stat-card act-stat-card">
          <div className="act-stat-icon act-icon-orange">
            <UserPlus size={21} />
          </div>

          <span>Nuevos clientes</span>
          <strong>{totalRegistros}</strong>
          <small>Registros realizados hoy</small>
        </article>

        <article className="es-stat-card act-stat-card">
          <div className="act-stat-icon act-icon-brown">
            <ClipboardList size={21} />
          </div>

          <span>Solicitudes enviadas</span>
          <strong>{totalSolicitudes}</strong>
          <small>Enviadas al supervisor hoy</small>
        </article>

      </div>

      {/* RESUMEN GENERAL */}
      <div className="act-summary-card">
        <div className="act-summary-heading">
          <div>
            <span className="es-eyebrow">RESUMEN GENERAL</span>
            <h2>Actividad registrada</h2>
          </div>

          <div className="act-total-badge">
            {actividadesHoy.length} actividades hoy
          </div>
        </div>

        <div className="act-progress-list">

          <div className="act-progress-item">
            <div className="act-progress-label">
              <span>Atención a clientes</span>
              <strong>{totalAtenciones}</strong>
            </div>

            <div className="act-progress-track">
              <div
                className="act-progress-fill act-fill-green"
                style={{
                  width: `${
                    actividadesHoy.length
                      ? (totalAtenciones / actividadesHoy.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="act-progress-item">
            <div className="act-progress-label">
              <span>Registro de clientes</span>
              <strong>{totalRegistros}</strong>
            </div>

            <div className="act-progress-track">
              <div
                className="act-progress-fill act-fill-orange"
                style={{
                  width: `${
                    actividadesHoy.length
                      ? (totalRegistros / actividadesHoy.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="act-progress-item">
            <div className="act-progress-label">
              <span>Solicitudes enviadas</span>
              <strong>{totalSolicitudes}</strong>
            </div>

            <div className="act-progress-track">
              <div
                className="act-progress-fill act-fill-brown"
                style={{
                  width: `${
                    actividadesHoy.length
                      ? (totalSolicitudes / actividadesHoy.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* HISTORIAL */}
      <div className="es-table-card act-history-card">

        <div className="es-table-heading act-history-heading">
          <div>
            <h2>Historial de actividades</h2>
            <p>
              Consulta los registros de clientes y solicitudes realizadas.
            </p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="act-filter-bar">
          <div className="act-filter-buttons">

            {[
              { id: "todas", label: "Todas" },
              { id: "atencion", label: "Atenciones" },
              { id: "registro", label: "Registros" },
              { id: "solicitud", label: "Solicitudes" },
            ].map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                className={`act-filter-button ${
                  filtro === opcion.id ? "active" : ""
                }`}
                onClick={() => setFiltro(opcion.id)}
              >
                {opcion.label}
              </button>
            ))}

          </div>

          <span className="act-results-count">
            {actividadesFiltradas.length} resultados
          </span>
        </div>

        {/* TABLA */}
        <div className="es-table-wrap">
          <table className="es-table act-table">

            <thead>
              <tr>
                <th>Actividad</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Detalle</th>
              </tr>
            </thead>

            <tbody>
              {actividadesFiltradas.map((actividad) => {
                const config = configuracionTipo[actividad.tipo];
                const Icono = config.icono;

                return (
                  <tr key={actividad.id}>
                    <td>
                      <div className="act-activity-name">
                        <span className={`act-row-icon ${config.clase}`}>
                          <Icono size={16} />
                        </span>

                        <strong>{actividad.descripcion}</strong>
                      </div>
                    </td>

                    <td>{actividad.cliente}</td>

                    <td>{formatoFecha(actividad.fecha)}</td>

                    <td>
                      <span className="act-time">
                        <Clock3 size={13} />
                        {actividad.hora}
                      </span>
                    </td>

                    <td>
                      <span className={`act-type-badge ${config.clase}`}>
                        {config.etiqueta}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="es-action-button"
                        title="Ver detalle"
                        onClick={() =>
                          setActividadSeleccionada(actividad)
                        }
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>

          {actividadesFiltradas.length === 0 && (
            <div className="es-empty-state">
              <Search size={30} />
              <strong>No se encontraron actividades</strong>
              <p>
                Todavía no hay registros disponibles para mostrar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE DETALLE */}
      {actividadSeleccionada && (
        <div
          className="act-modal-overlay"
          onClick={() => setActividadSeleccionada(null)}
        >
          <div
            className="act-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="act-modal-heading">
              <div>
                <span className="es-eyebrow">
                  DETALLE DE ACTIVIDAD
                </span>

                <h2>{actividadSeleccionada.descripcion}</h2>
              </div>

              <button
                type="button"
                className="act-modal-close"
                onClick={() => setActividadSeleccionada(null)}
              >
                ×
              </button>
            </div>

            <div className="act-detail-content">

              <div>
                <span>Cliente</span>
                <strong>{actividadSeleccionada.cliente}</strong>
              </div>

              <div>
                <span>Fecha</span>
                <strong>
                  {formatoFecha(actividadSeleccionada.fecha)}
                </strong>
              </div>

              <div>
                <span>Hora</span>
                <strong>{actividadSeleccionada.hora}</strong>
              </div>

              <div>
                <span>Tipo de actividad</span>
                <strong>
                  {configuracionTipo[actividadSeleccionada.tipo].etiqueta}
                </strong>
              </div>

              <div className="act-detail-description">
                <span>Descripción</span>
                <p>{actividadSeleccionada.detalle}</p>
              </div>

            </div>

            <button
              type="button"
              className="es-btn act-close-button"
              onClick={() => setActividadSeleccionada(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* NOTA INFORMATIVA */}
      <div className="act-info-note">
        <CheckCircle2 size={18} />

        <p>
          Este apartado muestra los registros de clientes y solicitudes
          generados por el ejecutivo. Las autorizaciones corresponden
          exclusivamente al supervisor.
        </p>
      </div>

    </section>
  );
}

export default Actividad;
