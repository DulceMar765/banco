
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  UserRound,
  Wallet,
  FileText,
  CreditCard,
  ArrowLeftRight,
  Gift,
  Bell,
  Headset,
  LogOut,
  Menu,
  X,
  Search,
  ChevronRight,
} from "lucide-react";

import InicioCliente from "./InicioCliente";
import PerfilCliente from "./PerfilCliente";
import ProductosCliente from "./ProductosCliente";
import MovimientosCliente from "./MovimientosCliente"
import PagosCliente from "./PagosCliente";
import BeneficiosCliente from "./BeneficiosCliente";
import NotificacionesCliente from "./NotificacionesCliente";
import AtencionCliente from "./AtencionCliente";

import { fetchSocio } from "../../services/auth";
import "./Cliente.css";



type ClienteProps = {
  onCerrarSesion: () => void;
};

const opciones = [
  { id: "inicio", nombre: "Inicio", icono: LayoutDashboard },
  { id: "perfil", nombre: "Mi perfil", icono: UserRound },
  { id: "productos", nombre: "Mis productos", icono: Wallet },
  { id: "pagos", nombre: "Mis pagos", icono: CreditCard },
  { id: "movimientos", nombre: "Movimientos", icono: ArrowLeftRight },
  { id: "beneficios", nombre: "Beneficios y promociones", icono: Gift },
  { id: "notificaciones", nombre: "Notificaciones", icono: Bell },
  { id: "atencion", nombre: "Atención al cliente", icono: Headset },
];

const titulos: Record<string, string> = {
  inicio: "Inicio",
  perfil: "Mi perfil",
  productos: "Mis productos",
  pagos: "Mis pagos",
  movimientos: "Movimientos",
  beneficios: "Beneficios y promociones",
  notificaciones: "Notificaciones",
  atencion: "Atención al cliente",
};

export default function Cliente({
  onCerrarSesion,
}: ClienteProps) {
  const [activo, setActivo] = useState("inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [nombreCliente, setNombreCliente] = useState("Juan Pérez");

  useEffect(() => {
    fetchSocio("/api/socio/resumen")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.nombre) {
          setNombreCliente(data.nombre);
        }
      })
      .catch((err) => console.error("Error al cargar nombre socio:", err));
  }, []);

  const renderContenido = () => {
    switch (activo) {
      case "inicio":
        return <InicioCliente />;

      case "perfil":
        return <PerfilCliente />;
      
      case "productos":
       return <ProductosCliente />;
    

      case "movimientos":
        return <MovimientosCliente />;
      
      case "pagos":
        return <PagosCliente/>;
    

      case "beneficios":
        return <BeneficiosCliente/>;
      
      case "notificaciones":
        return <NotificacionesCliente />;
      
      case "atencion":
        return <AtencionCliente />;

      default: {
        const Icono =
          opciones.find((opcion) => opcion.id === activo)?.icono ||
          FileText;

        return (
          <div className="cl-modulo-pendiente">
            <div className="cl-modulo-icono">
              <Icono size={30} />
            </div>

            <h2>{titulos[activo]}</h2>

            <p>
              Este apartado mostrará la información
              correspondiente a tu cuenta BANUAT.
            </p>
          </div>
        );
      }
    }
  };

  return (
    <div className="cl-app">

      {/* SIDEBAR */}
      <aside
        className={`cl-sidebar ${menuAbierto ? "abierto" : ""}`}
      >
        <div className="cl-logo">
          <div className="cl-logo-icono">
            B
          </div>

          <div>
            <h2>BANUAT</h2>
            <span>Cooperativa financiera</span>
          </div>

          <button
            className="cl-cerrar-menu"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cl-sidebar-titulo">
          MENÚ PRINCIPAL
        </div>

        <nav className="cl-navegacion">
          {opciones.map((opcion) => {
            const Icono = opcion.icono;

            return (
              <button
                key={opcion.id}
                className={`cl-nav-item ${
                  activo === opcion.id ? "activo" : ""
                }`}
                onClick={() => {
                  setActivo(opcion.id);
                  setMenuAbierto(false);
                }}
              >
                <Icono size={19} />

                <span>{opcion.nombre}</span>

                {activo === opcion.id && (
                  <ChevronRight size={16} />
                )}
              </button>
            );
          })}
        </nav>

        <div className="cl-sidebar-inferior">
          
          <button
            className="cl-cerrar-sesion"
            onClick={onCerrarSesion}
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="cl-main">

        <header className="cl-topbar">

          <button
            className="cl-menu-movil"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
          >
            <Menu size={23} />
          </button>

          <div className="cl-topbar-titulo">
            <span>BANUAT / Cliente</span>
            <h1>{titulos[activo]}</h1>
          </div>

          <div className="cl-topbar-acciones">

            <div className="cl-busqueda">
              <Search size={18} />

              <input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <button
              className="cl-notificacion"
              onClick={() => setActivo("notificaciones")}
              title="Notificaciones"
            >
              <Bell size={20} />
              <span />
            </button>

            <div className="cl-usuario">
              <div className="cl-avatar">
                <UserRound size={20} />
              </div>

              <div>
                <strong>{nombreCliente}</strong>
                <span>Socio BANUAT</span>
              </div>
            </div>

          </div>
        </header>

        <section className="cl-contenido">
          {renderContenido()}
        </section>

      </main>

      {/* OVERLAY DEL MENÚ MÓVIL */}
      {menuAbierto && (
        <div
          className="cl-overlay"
          onClick={() => setMenuAbierto(false)}
        />
      )}

    </div>
  );
}
