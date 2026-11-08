
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  BriefcaseBusiness,
  ClipboardList,
  History,
  Bell,
  MessageSquare,
  Menu,
  X,
  Search,
} from "lucide-react";

import Inicio from "./Inicio";
import Clientes from "./Clientes";
import RegistrarCliente from "./RegistrarCliente";
import Solicitudes from "./Solicitudes";
import Productos, { type ProductoFinanciero } from "./Productos";
import Seguimiento from "./Seguimiento";
import Actividad from "./Actividad";

import "./Escritorio.css";

export type Modulo =
  | "Inicio"
  | "Clientes"
  | "Registrar cliente"
  | "Solicitudes"
  | "Productos"
  | "Seguimiento"
  | "Actividad";

export type Cliente = {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  cuenta: string;
  estado: string;
  rfc?: string;
  curp?: string;
  direccion?: string;
  ingreso?: number;
  tipoIngreso?: string;
  documentos?: {
    ine?: string;
    domicilio?: string;
    rfc?: string;
    fiscal?: string;
  };
};

export type Solicitud = {
  id: number;
  cliente: string;
  producto: string;
  monto: number;
  plazo: string;
  fecha: string;
  estado: string;
  ingresos?: number;
  motivo?: string;
};

const menuPrincipal = [
  {
    nombre: "Inicio" as Modulo,
    icono: LayoutDashboard,
  },
  {
    nombre: "Clientes" as Modulo,
    icono: Users,
  },
  {
    nombre: "Registrar cliente" as Modulo,
    icono: UserPlus,
  },
  {
    nombre: "Solicitudes" as Modulo,
    icono: FileText,
  },
  {
    nombre: "Productos" as Modulo,
    icono: BriefcaseBusiness,
  },
  {
    nombre: "Seguimiento" as Modulo,
    icono: ClipboardList,
  },
  {
    nombre: "Actividad" as Modulo,
    icono: History,
  },
];

function Escritorio() {
  const [moduloActual, setModuloActual] = useState<Modulo>("Inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  const [productoInicial, setProductoInicial] = useState(
    "Préstamo personal"
  );

  const cambiarModulo = (modulo: Modulo) => {
    setModuloActual(modulo);
    setBusqueda("");
    setMenuAbierto(false);
  };

  const registrarCliente = (
    datos: Omit<Cliente, "id" | "cuenta" | "estado">
  ) => {
    const nuevoCliente: Cliente = {
      ...datos,
      id: Date.now(),
      cuenta: `PEND-${String(clientes.length + 1).padStart(4, "0")}`,
      estado: "Pendiente de documentos",
    };

    setClientes((actuales) => [...actuales, nuevoCliente]);
    cambiarModulo("Clientes");
  };

  const registrarSolicitud = (
    datos: Omit<Solicitud, "id" | "fecha" | "estado">
  ) => {
    const nuevaSolicitud: Solicitud = {
      ...datos,
      id: Date.now(),
      fecha: new Date().toLocaleDateString("es-MX"),
      estado: "Enviada a supervisión",
    };

    setSolicitudes((actuales) => [...actuales, nuevaSolicitud]);
    cambiarModulo("Solicitudes");
  };

  // Recibe el producto seleccionado desde el catálogo.
  const abrirSolicitud = (producto: ProductoFinanciero) => {
    setProductoInicial(producto.nombre);
    cambiarModulo("Solicitudes");
  };

  const renderizarModulo = () => {
    switch (moduloActual) {
      case "Inicio":
        return (
          <Inicio
            clientes={clientes}
            solicitudes={solicitudes}
            onNavigate={cambiarModulo}
          />
        );

      case "Clientes":
        return (
          <Clientes
            clientes={clientes}
            busqueda={busqueda}
            onRegistrar={() => cambiarModulo("Registrar cliente")}
          />
        );

      case "Registrar cliente":
        return (
          <RegistrarCliente
            onRegistrar={registrarCliente}
            onCancelar={() => cambiarModulo("Clientes")}
          />
        );

      case "Solicitudes":
        return (
          <Solicitudes
            clientes={clientes}
            solicitudes={solicitudes}
            busqueda={busqueda}
            productoInicial={productoInicial}
            onRegistrar={registrarSolicitud}
          />
        );

      case "Productos":
        return (
          <Productos
            onCrearSolicitud={abrirSolicitud}
          />
        );

      case "Seguimiento":
        return (
          <Seguimiento
            solicitudes={solicitudes}
            busqueda={busqueda}
          />
        );

      case "Actividad":
        return (
          <Actividad
            clientes={clientes}
            solicitudes={solicitudes}
          />
        );

      default:
        return null;
    }
  };

  const mostrarBusqueda =
    moduloActual === "Clientes" ||
    moduloActual === "Solicitudes" ||
    moduloActual === "Seguimiento";

  return (
    <div className="escritorio">
      <div className="escritorio-shell">

        {/* Menú lateral */}
        <aside className={`es-sidebar ${menuAbierto ? "es-sidebar-open" : ""}`}>
          <div className="es-sidebar-header">
            <div className="es-logo">
              <div className="es-logo-icon">
                <BriefcaseBusiness size={22} />
              </div>

              <div className="es-logo-text">
                <strong>BANUAT</strong>
                <span>ESCRITORIO</span>
              </div>
            </div>

            <button
              className="es-close-menu"
              onClick={() => setMenuAbierto(false)}
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          <div className="es-sidebar-label">
            MENÚ PRINCIPAL
          </div>

          <nav className="es-navigation">
            {menuPrincipal.map((item) => {
              const Icono = item.icono;
              const activo = moduloActual === item.nombre;

              return (
                <button
                  key={item.nombre}
                  className={`es-nav-item ${activo ? "active" : ""}`}
                  onClick={() => cambiarModulo(item.nombre)}
                >
                  <Icono size={19} strokeWidth={1.9} />
                  <span>{item.nombre}</span>
                </button>
              );
            })}
          </nav>

          <div className="es-sidebar-bottom">
            <div className="es-sidebar-help">
              <div className="es-help-icon">
                <MessageSquare size={19} />
              </div>

              <div>
                <strong>¿Necesitas ayuda?</strong>
                <span>Contacta con soporte</span>
              </div>
            </div>

            <div className="es-sidebar-version">
              <span className="es-version-dot" />
              BANUAT · Sistema interno
            </div>
          </div>
        </aside>

        {/* Fondo para cerrar el menú en móvil */}
        {menuAbierto && (
          <button
            className="es-sidebar-overlay"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
          />
        )}

        {/* Contenido principal */}
        <main className="es-main">
          <header className="es-topbar">
            <div className="es-top-left">
              <button
                className="es-menu-button"
                onClick={() => setMenuAbierto(true)}
                aria-label="Abrir menú"
              >
                <Menu size={21} />
              </button>

              <div className="es-breadcrumb">
                <span>Escritorio</span>
                <span className="es-breadcrumb-separator">/</span>
                <strong>{moduloActual}</strong>
              </div>
            </div>

            <div className="es-top-actions">
              {mostrarBusqueda && (
                <div className="es-search">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
              )}

              <button
                className="es-icon-button"
                title="Mensajes"
                aria-label="Mensajes"
              >
                <MessageSquare size={19} />
              </button>

              <button
                className="es-icon-button es-notification"
                title="Notificaciones"
                aria-label="Notificaciones"
              >
                <Bell size={19} />
                <span />
              </button>

              <div className="es-profile">
                <div className="es-avatar">E</div>

                <div className="es-profile-info">
                  <strong>Ejecutivo</strong>
                  <span>Escritorio</span>
                </div>
              </div>
            </div>
          </header>

          <div className="es-content">
            {renderizarModulo()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Escritorio;
