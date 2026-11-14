
import { useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  ClipboardList,
  History,
  Menu,
  X,
  UserRound,
  LogOut,
  ChevronRight,
} from "lucide-react";

import InicioRecepcion from "./InicioRecepcion";
import TurnosRecepcion from "./TurnosRecepcion";
import RequisitosRecepcion from "./RequisitosRecepcion";
import HistorialTurnos from "./HistorialTurnos";
import "./Recepcion.css";

type Seccion =
  | "inicio"
  | "turnos"
  | "requisitos"
  | "historial";

type RecepcionProps = {
  onLogout: () => void;
};

const menu = [
  {
    id: "inicio",
    nombre: "Inicio",
    icono: LayoutDashboard,
  },
  {
    id: "turnos",
    nombre: "Asignación de turnos",
    icono: Ticket,
  },
  {
    id: "requisitos",
    nombre: "Requisitos de trámites",
    icono: ClipboardList,
  },
  {
    id: "historial",
    nombre: "Historial de turnos",
    icono: History,
  },
] as const;

export default function Recepcion({
  onLogout,
}: RecepcionProps) {
  const [seccion, setSeccion] =
    useState<Seccion>("inicio");

  const [menuAbierto, setMenuAbierto] =
    useState(false);

  const tituloSeccion = menu.find(
    (item) => item.id === seccion
  )?.nombre;

  const cambiarSeccion = (nuevaSeccion: Seccion) => {
    setSeccion(nuevaSeccion);
    setMenuAbierto(false);
  };

  const renderizarModulo = () => {
    switch (seccion) {
      case "inicio":
        return <InicioRecepcion />;

      case "turnos":
        return <TurnosRecepcion />;

      case "requisitos":
        return <RequisitosRecepcion />;

      case "historial":
        return <HistorialTurnos />;

      default:
        return <InicioRecepcion />;
    }
  };

  return (
    <div className="rc-app">
      <div className="rc-layout">

        {/* SIDEBAR */}
        <aside
          className={`rc-sidebar ${
            menuAbierto ? "rc-sidebar-open" : ""
          }`}
        >
          <div className="rc-brand">
            <div className="rc-brand-icon">
              <UserRound size={25} />
            </div>

            <div className="rc-brand-text">
              <h2>BANUAT</h2>
              <span>Área de recepción</span>
            </div>

            <button
              className="rc-close-menu"
              onClick={() => setMenuAbierto(false)}
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          <div className="rc-sidebar-label">
            MENÚ PRINCIPAL
          </div>

          <nav className="rc-navigation">
            {menu.map((item) => {
              const Icon = item.icono;

              return (
                <button
                  key={item.id}
                  className={`rc-nav-item ${
                    seccion === item.id ? "active" : ""
                  }`}
                  onClick={() =>
                    cambiarSeccion(item.id)
                  }
                >
                  <Icon size={19} />

                  <span>{item.nombre}</span>

                  {seccion === item.id && (
                    <ChevronRight
                      size={16}
                      className="rc-nav-arrow"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* USUARIO Y CIERRE DE SESIÓN */}
          <div className="rc-sidebar-bottom">
            <div className="rc-user-card">
              <div className="rc-user-avatar">
                <UserRound size={21} />
              </div>

              <div className="rc-user-info">
                <strong>Recepción</strong>
                <span>Personal</span>
              </div>
            </div>

            <button
              className="rc-logout"
              onClick={onLogout}
            >
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* FONDO DEL MENÚ MÓVIL */}
        {menuAbierto && (
          <div
            className="rc-overlay"
            onClick={() => setMenuAbierto(false)}
          />
        )}

        {/* CONTENIDO PRINCIPAL */}
        <main className="rc-main">

          {/* TOPBAR */}
          <header className="rc-topbar">
            <div className="rc-topbar-left">
              <button
                className="rc-menu-button"
                onClick={() => setMenuAbierto(true)}
                aria-label="Abrir menú"
              >
                <Menu size={22} />
              </button>

              <div className="rc-breadcrumb">
                <span>Recepción</span>
                <ChevronRight size={15} />
                <strong>{tituloSeccion}</strong>
              </div>
            </div>

            <div className="rc-topbar-right">
              <div className="rc-top-user">
                <div className="rc-top-avatar">
                  <UserRound size={19} />
                </div>

                <div className="rc-top-user-info">
                  <strong>Recepción</strong>
                  <span>Personal</span>
                </div>
              </div>
            </div>
          </header>

          {/* MÓDULOS */}
          <div className="rc-content">
            {renderizarModulo()}

            <footer className="rc-footer">
              <span>BANUAT © 2026</span>
              <span>
                Panel de recepción · Sistema interno
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
