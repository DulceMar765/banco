
import { useMemo, useState } from "react";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  UserRound,
  FileText,
  MessageSquareText,
  RefreshCw,
} from "lucide-react";

import "./Seguimiento.css";

type SolicitudSeguimiento = {
  id?: string | number;
  folio?: unknown;
  cliente?: unknown;
  producto?: unknown;
  monto?: unknown;
  plazo?: unknown;
  fecha?: unknown;
  fechaEnvio?: unknown;
  estado?: unknown;
  observaciones?: unknown;
  motivo?: unknown;
};

type EstadoSolicitud =
  | "pendiente"
  | "revision"
  | "autorizada"
  | "rechazada"
  | "correcciones";

type FiltroEstado = "todas" | EstadoSolicitud;

type SeguimientoProps = {
  solicitudes: SolicitudSeguimiento[];
  busqueda?: string;
};

const filtros: { id: FiltroEstado; nombre: string }[] = [
  { id: "todas", nombre: "Todas" },
  { id: "pendiente", nombre: "Pendientes" },
  { id: "revision", nombre: "En revisión" },
  { id: "autorizada", nombre: "Autorizadas" },
  { id: "rechazada", nombre: "Rechazadas" },
  { id: "correcciones", nombre: "Correcciones" },
];

const obtenerTexto = (valor: unknown, alternativo = "No disponible"): string => {
  if (typeof valor === "string" || typeof valor === "number") {
    return String(valor);
  }

  if (valor && typeof valor === "object") {
    const objeto = valor as Record<string, unknown>;

    if (typeof objeto.nombre === "string") return objeto.nombre;
    if (typeof objeto.nombreCompleto === "string") {
      return objeto.nombreCompleto;
    }
  }

  return alternativo;
};

const normalizarEstado = (estado: unknown): EstadoSolicitud => {
  const valor = obtenerTexto(estado, "pendiente")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

  if (
    ["autorizada", "autorizado", "aprobada", "aprobado"].includes(valor)
  ) {
    return "autorizada";
  }

  if (["rechazada", "rechazado"].includes(valor)) {
    return "rechazada";
  }

  if (
    [
      "revision",
      "en_revision",
      "en_proceso",
      "en_revision_supervisor",
    ].includes(valor)
  ) {
    return "revision";
  }

  if (
    [
      "correcciones",
      "correccion",
      "devuelta",
      "devuelto",
      "requiere_correccion",
    ].includes(valor)
  ) {
    return "correcciones";
  }

  return "pendiente";
};

const nombresEstado: Record<EstadoSolicitud, string> = {
  pendiente: "Pendiente",
  revision: "En revisión",
  autorizada: "Autorizada",
  rechazada: "Rechazada",
  correcciones: "Correcciones",
};

const formatoMoneda = (valor: unknown) => {
  const numero =
    typeof valor === "number"
      ? valor
      : Number(String(valor ?? "").replace(/[$,\s]/g, ""));

  if (!Number.isFinite(numero)) return "No especificado";

  return numero.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  });
};

const formatoFecha = (valor: unknown) => {
  const fecha = obtenerTexto(valor, "");

  if (!fecha) return "No especificada";

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) return fecha;

  return fechaValida.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Seguimiento({
  solicitudes,
  busqueda = "",
}: SeguimientoProps) {
  const [filtroActivo, setFiltroActivo] =
    useState<FiltroEstado>("todas");

  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<string | number | null>(null);

  const solicitudesPreparadas = useMemo(() => {
    return solicitudes.map((solicitud, index) => ({
      ...solicitud,
      clave: solicitud.id ?? `solicitud-${index}`,
      estadoNormalizado: normalizarEstado(solicitud.estado),
      nombreCliente: obtenerTexto(solicitud.cliente),
      nombreProducto: obtenerTexto(solicitud.producto),
      folioVisible: obtenerTexto(
        solicitud.folio,
        `SOL-${String(index + 1).padStart(4, "0")}`
      ),
      fechaVisible: formatoFecha(
        solicitud.fechaEnvio ?? solicitud.fecha
      ),
    }));
  }, [solicitudes]);

  const solicitudesFiltradas = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();

    return solicitudesPreparadas.filter((solicitud) => {
      const coincideEstado =
        filtroActivo === "todas" ||
        solicitud.estadoNormalizado === filtroActivo;

      const coincideBusqueda =
        !termino ||
        solicitud.folioVisible.toLowerCase().includes(termino) ||
        solicitud.nombreCliente.toLowerCase().includes(termino) ||
        solicitud.nombreProducto.toLowerCase().includes(termino);

      return coincideEstado && coincideBusqueda;
    });
  }, [solicitudesPreparadas, filtroActivo, busqueda]);

  const total = solicitudesPreparadas.length;

  const pendientes = solicitudesPreparadas.filter(
    (s) => s.estadoNormalizado === "pendiente"
  ).length;

  const enRevision = solicitudesPreparadas.filter(
    (s) => s.estadoNormalizado === "revision"
  ).length;

  const autorizadas = solicitudesPreparadas.filter(
    (s) => s.estadoNormalizado === "autorizada"
  ).length;

  const obtenerIconoEstado = (estado: EstadoSolicitud) => {
    switch (estado) {
      case "autorizada":
        return <CheckCircle2 size={13} />;
      case "rechazada":
        return <XCircle size={13} />;
      case "revision":
        return <Clock3 size={13} />;
      case "correcciones":
        return <RefreshCw size={13} />;
      default:
        return <AlertCircle size={13} />;
    }
  };

  return (
    <section className="es-section seg-section">
      {/* ENCABEZADO */}
      <div className="es-page-heading">
        <div>
          <span className="es-eyebrow">CONTROL DE SOLICITUDES</span>
          <h1>Seguimiento</h1>
          <p>
            Consulta el avance y resultado de las solicitudes
            enviadas al supervisor.
          </p>
        </div>

        <div className="seg-header-info">
          <div className="seg-header-icon">
            <ClipboardList size={21} />
          </div>
          <div>
            <strong>{total}</strong>
            <span>Solicitudes registradas</span>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="es-stats-grid seg-stats">
        <div className="es-stat-card">
          <div className="es-stat-icon seg-stat-orange">
            <ClipboardList size={21} />
          </div>
          <div className="es-stat-content">
            <span>Total de solicitudes</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon seg-stat-yellow">
            <AlertCircle size={21} />
          </div>
          <div className="es-stat-content">
            <span>Pendientes</span>
            <strong>{pendientes}</strong>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon seg-stat-blue">
            <Clock3 size={21} />
          </div>
          <div className="es-stat-content">
            <span>En revisión</span>
            <strong>{enRevision}</strong>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon seg-stat-green">
            <CheckCircle2 size={21} />
          </div>
          <div className="es-stat-content">
            <span>Autorizadas</span>
            <strong>{autorizadas}</strong>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="es-card es-table-card seg-table-card">
        <div className="es-table-heading">
          <div>
            <h2>Solicitudes enviadas</h2>
            <p>
              Revisa el estado de cada solicitud y sus observaciones.
            </p>
          </div>

          <span className="es-count">
            {solicitudesFiltradas.length} registros
          </span>
        </div>

        {/* FILTROS */}
        <div className="seg-filters">
          {filtros.map((filtro) => (
            <button
              key={filtro.id}
              type="button"
              className={`seg-filter ${
                filtroActivo === filtro.id ? "active" : ""
              }`}
              onClick={() => setFiltroActivo(filtro.id)}
            >
              {filtro.nombre}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        {solicitudesFiltradas.length > 0 ? (
          <div className="es-table-wrap">
            <table className="es-table seg-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Monto</th>
                  <th>Fecha de envío</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                </tr>
              </thead>

              <tbody>
                {solicitudesFiltradas.map((solicitud) => {
                  const expandida =
                    solicitudSeleccionada === solicitud.clave;

                  const observaciones = obtenerTexto(
                    solicitud.observaciones ?? solicitud.motivo,
                    "No se han registrado observaciones."
                  );

                  return (
                    <>
                      <tr key={solicitud.clave}>
                        <td>
                          <strong className="seg-folio">
                            {solicitud.folioVisible}
                          </strong>
                        </td>

                        <td>
                          <div className="seg-client-cell">
                            <div className="seg-client-avatar">
                              <UserRound size={15} />
                            </div>
                            <span>{solicitud.nombreCliente}</span>
                          </div>
                        </td>

                        <td>{solicitud.nombreProducto}</td>

                        <td className="seg-amount">
                          {formatoMoneda(solicitud.monto)}
                        </td>

                        <td>{solicitud.fechaVisible}</td>

                        <td>
                          <span
                            className={`es-status seg-status ${solicitud.estadoNormalizado}`}
                          >
                            {obtenerIconoEstado(
                              solicitud.estadoNormalizado
                            )}
                            {nombresEstado[solicitud.estadoNormalizado]}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="es-action-button"
                            title="Ver detalle"
                            onClick={() =>
                              setSolicitudSeleccionada(
                                expandida ? null : solicitud.clave
                              )
                            }
                          >
                            {expandida ? (
                              <ChevronUp size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                        </td>
                      </tr>

                      {expandida && (
                        <tr
                          key={`${solicitud.clave}-detalle`}
                          className="seg-detail-row"
                        >
                          <td colSpan={7}>
                            <div className="seg-detail-content">
                              <div className="seg-detail-heading">
                                <div className="seg-detail-icon">
                                  <FileText size={17} />
                                </div>
                                <div>
                                  <strong>
                                    Detalle de la solicitud
                                  </strong>
                                  <span>
                                    Folio {solicitud.folioVisible}
                                  </span>
                                </div>
                              </div>

                              <div className="seg-detail-grid">
                                <div>
                                  <span>Cliente</span>
                                  <strong>
                                    {solicitud.nombreCliente}
                                  </strong>
                                </div>

                                <div>
                                  <span>Producto solicitado</span>
                                  <strong>
                                    {solicitud.nombreProducto}
                                  </strong>
                                </div>

                                <div>
                                  <span>Monto solicitado</span>
                                  <strong>
                                    {formatoMoneda(solicitud.monto)}
                                  </strong>
                                </div>

                                <div>
                                  <span>Plazo</span>
                                  <strong>
                                    {obtenerTexto(solicitud.plazo)}
                                  </strong>
                                </div>

                                <div>
                                  <span>Fecha de envío</span>
                                  <strong>
                                    {solicitud.fechaVisible}
                                  </strong>
                                </div>

                                <div>
                                  <span>Estado actual</span>
                                  <strong>
                                    {nombresEstado[
                                      solicitud.estadoNormalizado
                                    ]}
                                  </strong>
                                </div>
                              </div>

                              <div className="seg-observations">
                                <div className="seg-observations-title">
                                  <MessageSquareText size={16} />
                                  <strong>
                                    Observaciones del supervisor
                                  </strong>
                                </div>

                                <p>{observaciones}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="es-empty-state">
            <div className="es-empty-icon">
              <ClipboardList size={25} />
            </div>

            <h3>No hay solicitudes para mostrar</h3>

            <p>
              No se encontraron solicitudes con el filtro o
              búsqueda seleccionados.
            </p>

            <button
              type="button"
              className="es-btn es-btn-secondary"
              onClick={() => setFiltroActivo("todas")}
            >
              Mostrar todas
              <ChevronDown size={14} />
            </button>
          </div>
        )}
      </div>

      {/* AVISO */}
      <div className="seg-notice">
        <div className="seg-notice-icon">
          <CalendarDays size={19} />
        </div>

        <div>
          <strong>Información de seguimiento</strong>
          <p>
            Las autorizaciones y rechazos son responsabilidad del
            supervisor. Desde este apartado únicamente puedes consultar
            los cambios de estado y las observaciones de cada solicitud.
          </p>
        </div>
      </div>
    </section>
  );
}
