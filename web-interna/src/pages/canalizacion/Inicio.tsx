
import {
  Users,
  UserPlus,
  FileText,
  BriefcaseBusiness,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
 
} from "lucide-react";

import type {
  Cliente,
  Solicitud,
  Modulo,
} from "./Escritorio";

import "./Inicio.css";

type InicioProps = {
  clientes: Cliente[];
  solicitudes: Solicitud[];
  onNavigate: (modulo: Modulo) => void;
};

const solicitudesDemo: Solicitud[] = [
  {
    id: 1001,
    cliente: "María Fernanda López",
    producto: "Préstamo personal",
    monto: 25000,
    plazo: "24 meses",
    fecha: "06/11/2026",
    estado: "Enviada a supervisión",
  },
  {
    id: 1002,
    cliente: "Carlos Eduardo Pérez",
    producto: "Préstamo personal",
    monto: 15000,
    plazo: "12 meses",
    fecha: "05/11/2026",
    estado: "En revisión",
  },
  {
    id: 1003,
    cliente: "Ana Sofía Martínez",
    producto: "Cuenta de ahorro",
    monto: 5000,
    plazo: "Disponible",
    fecha: "04/11/2026",
    estado: "Documentos pendientes",
  },
];

const clientesDemo: Cliente[] = [
  {
    id: 1,
    nombre: "María Fernanda López",
    correo: "maria@email.com",
    telefono: "833 123 4567",
    cuenta: "BAN-0001",
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "Carlos Eduardo Pérez",
    correo: "carlos@email.com",
    telefono: "833 456 7890",
    cuenta: "BAN-0002",
    estado: "Activo",
  },
  {
    id: 3,
    nombre: "Ana Sofía Martínez",
    correo: "ana@email.com",
    telefono: "833 987 6543",
    cuenta: "BAN-0003",
    estado: "Pendiente de documentos",
  },
];

function formatearMoneda(cantidad: number) {
  return cantidad.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function obtenerFecha() {
  return new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Inicio({
  clientes,
  solicitudes,
  onNavigate,
}: InicioProps) {
  // Información de ejemplo mientras no existan registros.
  const listaClientes = clientes.length > 0 ? clientes : clientesDemo;

  const listaSolicitudes =
    solicitudes.length > 0 ? solicitudes : solicitudesDemo;

  const solicitudesPendientes = listaSolicitudes.filter(
    (solicitud) =>
      solicitud.estado.toLowerCase().includes("pendiente") ||
      solicitud.estado.toLowerCase().includes("revisión") ||
      solicitud.estado.toLowerCase().includes("supervisión")
  );

  const accesos = [
    {
      titulo: "Registrar cliente",
      descripcion: "Agregar un nuevo socio al sistema.",
      icono: UserPlus,
      color: "orange",
      modulo: "Registrar cliente" as Modulo,
    },
    {
      titulo: "Consultar clientes",
      descripcion: "Revisar información de los socios.",
      icono: Users,
      color: "green",
      modulo: "Clientes" as Modulo,
    },
    {
      titulo: "Nueva solicitud",
      descripcion: "Capturar una solicitud de servicio.",
      icono: FileText,
      color: "brown",
      modulo: "Solicitudes" as Modulo,
    },
    {
      titulo: "Ver productos",
      descripcion: "Consultar los productos disponibles.",
      icono: BriefcaseBusiness,
      color: "purple",
      modulo: "Productos" as Modulo,
    },
  ];

  return (
    <section className="es-section inicio">

      {/* Bienvenida */}
      <div className="inicio-welcome">
        <div>
          <span className="es-eyebrow">
            PANEL DE CONTROL
          </span>

          <h1>¡Bienvenido al escritorio!</h1>

          <p>
            Desde aquí puedes gestionar clientes, registrar solicitudes
            y dar seguimiento a las operaciones de BANUAT.
          </p>
        </div>

        <div className="inicio-welcome-date">
          <div className="inicio-date-icon">
            <Clock3 size={19} />
          </div>

          <div>
            <span>Fecha actual</span>
            <strong>{obtenerFecha()}</strong>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="inicio-stats es-stats-grid">

        <div className="es-stat-card">
          <div className="es-stat-icon inicio-icon-orange">
            <Users size={21} />
          </div>

          <div className="es-stat-content">
            <span>Clientes registrados</span>
            <strong>{listaClientes.length}</strong>
            <small>Socios en el sistema</small>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon inicio-icon-green">
            <FileText size={21} />
          </div>

          <div className="es-stat-content">
            <span>Solicitudes recibidas</span>
            <strong>{listaSolicitudes.length}</strong>
            <small>Registros de solicitudes</small>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon inicio-icon-brown">
            <Clock3 size={21} />
          </div>

          <div className="es-stat-content">
            <span>Pendientes de revisión</span>
            <strong>{solicitudesPendientes.length}</strong>
            <small>Requieren seguimiento</small>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon inicio-icon-purple">
            <CheckCircle2 size={21} />
          </div>

          <div className="es-stat-content">
            <span>Clientes activos</span>
            <strong>
              {listaClientes.filter(
                (cliente) => cliente.estado === "Activo"
              ).length}
            </strong>
            <small>Con registro activo</small>
          </div>
        </div>

      </div>

      {/* Accesos rápidos */}
      <div className="inicio-main-grid">

        <div className="es-card inicio-quick-card">
          <div className="es-card-heading">
            <div>
              <h2>Accesos rápidos</h2>
              <p>Selecciona una actividad para comenzar.</p>
            </div>

            <span className="inicio-heading-icon">
              <ArrowUpRight size={18} />
            </span>
          </div>

          <div className="inicio-quick-grid">
            {accesos.map((acceso) => {
              const Icono = acceso.icono;

              return (
                <button
                  key={acceso.titulo}
                  className="inicio-quick-item"
                  onClick={() => onNavigate(acceso.modulo)}
                >
                  <div className={`inicio-quick-icon ${acceso.color}`}>
                    <Icono size={21} />
                  </div>

                  <div className="inicio-quick-info">
                    <strong>{acceso.titulo}</strong>
                    <span>{acceso.descripcion}</span>
                  </div>

                  <ArrowUpRight
                    className="inicio-quick-arrow"
                    size={17}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Resumen */}
        <div className="es-card inicio-summary-card">
          <div className="es-card-heading">
            <div>
              <h2>Resumen general</h2>
              <p>Estado de la actividad actual.</p>
            </div>
          </div>

          <div className="inicio-summary-total">
            <span>Operaciones registradas</span>
            <strong>
              {listaClientes.length + listaSolicitudes.length}
            </strong>
          </div>

          <div className="inicio-summary-list">

            <div className="inicio-summary-row">
              <div className="inicio-summary-label">
                <span className="inicio-summary-dot green" />
                <span>Clientes</span>
              </div>

              <strong>{listaClientes.length}</strong>
            </div>

            <div className="inicio-summary-row">
              <div className="inicio-summary-label">
                <span className="inicio-summary-dot orange" />
                <span>Solicitudes</span>
              </div>

              <strong>{listaSolicitudes.length}</strong>
            </div>

            <div className="inicio-summary-row">
              <div className="inicio-summary-label">
                <span className="inicio-summary-dot brown" />
                <span>Pendientes</span>
              </div>

              <strong>{solicitudesPendientes.length}</strong>
            </div>

          </div>

          <div className="inicio-summary-notice">
            <AlertCircle size={17} />
            <span>
              Las solicitudes enviadas a supervisión deben recibir
              seguimiento desde el módulo correspondiente.
            </span>
          </div>
        </div>
      </div>

      {/* Solicitudes recientes */}
      <div className="es-card es-table-card inicio-recent-card">
        <div className="es-table-heading">
          <div>
            <h2>Solicitudes recientes</h2>
            <p>Últimos registros capturados en el sistema.</p>
          </div>

          <button
            className="es-btn es-btn-secondary"
            onClick={() => onNavigate("Solicitudes")}
          >
            Ver todas
            <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="es-table-wrap">
          <table className="es-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {listaSolicitudes.slice(0, 5).map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>
                    <div className="inicio-client-cell">
                      <div className="inicio-client-avatar">
                        {solicitud.cliente.charAt(0)}
                      </div>

                      <strong>{solicitud.cliente}</strong>
                    </div>
                  </td>

                  <td>{solicitud.producto}</td>

                  <td className="inicio-amount">
                    {formatearMoneda(solicitud.monto)}
                  </td>

                  <td>{solicitud.fecha}</td>

                  <td>
                    <span
                      className={`es-status ${
                        solicitud.estado.toLowerCase().includes("pendiente")
                          ? "inicio-status-pending"
                          : solicitud.estado.toLowerCase().includes("revisión")
                            ? "inicio-status-review"
                            : "inicio-status-sent"
                      }`}
                    >
                      {solicitud.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {listaSolicitudes.length === 0 && (
          <div className="es-empty-state">
            <div className="es-empty-icon">
              <FileText size={24} />
            </div>

            <h3>No hay solicitudes registradas</h3>
            <p>
              Cuando se capturen solicitudes, aparecerán en este apartado.
            </p>
          </div>
        )}
      </div>

    </section>
  );
}

export default Inicio;
