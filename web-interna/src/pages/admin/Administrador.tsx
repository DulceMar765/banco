
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  ClipboardList,
  Package,
  BookOpen,
  Gift,
  FileBarChart,
  ShieldCheck,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Landmark,
} from "lucide-react";
import CatalogosAdmin from "./CatalogosAdmin";
import ProductosAdmin from "./ProductosAdmin";
import OperacionesAdmin from "./OperacionesAdmin";
import Trabajadores from "./Trabajadores";
import InicioAdministrador from "./InicioAdministrador";
import Clientes from "./Clientes";
import "./Administrador.css";
import PromocionesAdmin from "./PromocionesAdmin";
import AuditoriaAdmin from "./AuditoriaAdmin";
import ConfiguracionAdmin from "./ConfiguracionAdmin";

type ModuloAdministrador =
  | "Inicio"
  | "Clientes"
  | "Trabajadores"
  | "Operaciones"
  | "Productos"
  | "Catálogos"
  | "Promociones"
  | "Reportes"
  | "Auditoría"
  | "Configuración";

type AdministradorProps = {
  onLogout: () => void;
};

const menuAdministrador = [
  {
    id: "Inicio" as const,
    etiqueta: "Inicio",
    icono: LayoutDashboard,
  },
  {
    id: "Clientes" as const,
    etiqueta: "Clientes",
    icono: Users,
  },
  {
    id: "Trabajadores" as const,
    etiqueta: "Trabajadores",
    icono: UserCog,
  },
  {
    id: "Operaciones" as const,
    etiqueta: "Operaciones",
    icono: ClipboardList,
  },
  {
    id: "Productos" as const,
    etiqueta: "Productos",
    icono: Package,
  },
  {
    id: "Catálogos" as const,
    etiqueta: "Catálogos",
    icono: BookOpen,
  },
  {
    id: "Promociones" as const,
    etiqueta: "Promociones",
    icono: Gift,
  },
  {
    id: "Reportes" as const,
    etiqueta: "Reportes",
    icono: FileBarChart,
  },
  {
    id: "Auditoría" as const,
    etiqueta: "Auditoría",
    icono: ShieldCheck,
  },
  {
    id: "Configuración" as const,
    etiqueta: "Configuración",
    icono: Settings,
  },
];

function Administrador({ onLogout }: AdministradorProps) {
  const [moduloActivo, setModuloActivo] =
    useState<ModuloAdministrador>("Inicio");

  const [menuAbierto, setMenuAbierto] = useState(false);

  const seleccionarModulo = (modulo: ModuloAdministrador) => {
    setModuloActivo(modulo);
    setMenuAbierto(false);
  };

  const renderizarModulo = () => {
    switch (moduloActivo) {
      case "Inicio":
        return <InicioAdministrador />;
      case "Clientes":
        return <Clientes />;
      case "Trabajadores":
        return <Trabajadores />;
      case "Operaciones":
        return <OperacionesAdmin />;
      case "Productos":
        return <ProductosAdmin />;
      case "Catálogos":
        return <CatalogosAdmin />;
      case "Promociones":
         return <PromocionesAdmin />;
      case "Auditoría":
         return <AuditoriaAdmin />;
      case "Configuración":
         return <ConfiguracionAdmin />;
      default:
        return (
          <div className="ad-module-placeholder">
            <div className="ad-placeholder-icon">
              {(() => {
                const modulo = menuAdministrador.find(
                  (item) => item.id === moduloActivo
                );

                const Icono = modulo?.icono ?? LayoutDashboard;

                return <Icono size={30} />;
              })()}
            </div>

            <h2>{moduloActivo}</h2>

            <p>
              Este módulo estará disponible cuando se desarrolle
              su apartado correspondiente.
            </p>
          </div>
        );
    }
  };

  return (
    <section className="ad-layout">

      {/* MENÚ LATERAL */}
      <aside className={`ad-sidebar ${menuAbierto ? "ad-sidebar-open" : ""}`}>
        <div className="ad-sidebar-header">
          <div className="ad-brand">
            <div className="ad-brand-icon">
              <Landmark size={23} />
            </div>

            <div className="ad-brand-text">
              <strong>BANUAT</strong>
              <span>Administración</span>
            </div>
          </div>

          <button
            type="button"
            className="ad-mobile-close"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
          >
            <X size={21} />
          </button>
        </div>

        <div className="ad-sidebar-label">
          MENÚ PRINCIPAL
        </div>

        <nav className="ad-navigation">
          {menuAdministrador.map((item) => {
            const Icono = item.icono;
            const activo = moduloActivo === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`ad-nav-item ${activo ? "active" : ""}`}
                onClick={() => seleccionarModulo(item.id)}
              >
                <Icono size={19} />

                <span>{item.etiqueta}</span>

                {activo && (
                  <ChevronRight
                    size={16}
                    className="ad-nav-arrow"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="ad-sidebar-bottom">
          <div className="ad-admin-profile">
            <div className="ad-profile-avatar">
              <UserCog size={21} />
            </div>

            <div className="ad-profile-info">
              <strong>Administrador</strong>
              <span>Cuenta administrativa</span>
            </div>
          </div>

          <button
            type="button"
            className="ad-logout-button"
            onClick={onLogout}
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* FONDO PARA MENÚ MÓVIL */}
      {menuAbierto && (
        <div
          className="ad-sidebar-overlay"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="ad-main">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button
              type="button"
              className="ad-menu-toggle"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="ad-topbar-caption">
                BANUAT / ADMINISTRACIÓN
              </span>

              <h1>{moduloActivo}</h1>
            </div>
          </div>

          <div className="ad-topbar-actions">
            <span className="ad-role-label">
              Administrador
            </span>

            <button
              type="button"
              className="ad-notification-button"
              title="Notificaciones"
              aria-label="Notificaciones"
            >
              <Bell size={20} />
            </button>
          </div>
        </header>

        <div className="ad-content">
          {renderizarModulo()}
        </div>

        <footer className="ad-footer">
          <span>BANUAT · Sistema de administración</span>
          <span>Panel administrativo</span>
        </footer>
      </main>
    </section>
  );
}

export default Administrador;
