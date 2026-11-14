
import { useState } from "react";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  HandCoins,
  Search,
  Wallet,
  ClipboardList,
  History,
  Menu,
  X,
  LogOut,
  ChevronRight,
  CircleDollarSign,
  Receipt,
  Clock3,
  Banknote,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import Depositos from "./Depositos";
import Retiros from "./Retiros";
import Pagos from "./Pagos";
import Consultas from "./Consultas";
import ControlCaja from "./ControlCaja";
import Historial from "./Historial";
import "./PanelCajero.css";


type ModuloCajero =
  | "inicio"
  | "depositos"
  | "retiros"
  | "pagos"
  | "consultas"
  | "caja"
  | "historial";

type PanelCajeroProps = {
  onLogout: () => void;
};

const modulos = [
  {
    id: "inicio" as ModuloCajero,
    nombre: "Inicio",
    descripcion: "Resumen general de caja",
    icono: LayoutDashboard,
  },
  {
    id: "depositos" as ModuloCajero,
    nombre: "Depósitos",
    descripcion: "Recepción de dinero",
    icono: ArrowDownToLine,
  },
  {
    id: "retiros" as ModuloCajero,
    nombre: "Retiros",
    descripcion: "Entrega de efectivo",
    icono: ArrowUpFromLine,
  },
  {
    id: "pagos" as ModuloCajero,
    nombre: "Pagos y abonos",
    descripcion: "Cobros de préstamos y créditos",
    icono: HandCoins,
  },
  {
    id: "consultas" as ModuloCajero,
    nombre: "Consultas",
    descripcion: "Información de clientes",
    icono: Search,
  },
  {
    id: "caja" as ModuloCajero,
    nombre: "Control de caja",
    descripcion: "Entradas y salidas de efectivo",
    icono: Wallet,
  },
  {
    id: "historial" as ModuloCajero,
    nombre: "Historial",
    descripcion: "Operaciones realizadas",
    icono: History,
  },
];

export default function PanelCajero({
  onLogout,
}: PanelCajeroProps) {
  const [moduloActivo, setModuloActivo] =
    useState<ModuloCajero>("inicio");

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const seleccionarModulo = (modulo: ModuloCajero) => {
    setModuloActivo(modulo);
    setMenuAbierto(false);
  };

  const moduloSeleccionado = modulos.find(
    (modulo) => modulo.id === moduloActivo
  );

  return (
    <div className="cj-fondo">
      <div className="cj-app">

        {/* BARRA LATERAL */}
        <aside className={`cj-sidebar ${menuAbierto ? "is-abierto" : ""}`}>

          <div className="cj-sidebar__marca">
            B
          </div>

          <div className="cj-sidebar__titulo">
            <strong>BANUAT</strong>
            <span>Área de caja</span>
          </div>

          <nav className="cj-sidebar__nav">
            <span className="cj-sidebar__etiqueta">
              OPERACIONES
            </span>

            {modulos.map((modulo) => {
              const Icono = modulo.icono;

              return (
                <button
                  key={modulo.id}
                  type="button"
                  className={`cj-sidebar__item ${
                    moduloActivo === modulo.id ? "is-activo" : ""
                  }`}
                  onClick={() => seleccionarModulo(modulo.id)}
                  title={modulo.nombre}
                >
                  <Icono size={19} strokeWidth={1.8} />
                  <span>{modulo.nombre}</span>
                </button>
              );
            })}
          </nav>

          <div className="cj-sidebar__inferior">
            <div className="cj-sidebar__estado">
              <span className="cj-sidebar__punto" />
              <div>
                <strong>Área de caja</strong>
                <small>Panel de operaciones</small>
              </div>
            </div>

            <button
              type="button"
              className="cj-sidebar__item cj-sidebar__salir"
              onClick={onLogout}
            >
              <LogOut size={19} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="cj-contenido">

          {/* TOPBAR */}
          <header className="cj-topbar">

            <button
              type="button"
              className="cj-menu-movil"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Abrir menú"
            >
              {menuAbierto ? <X size={21} /> : <Menu size={21} />}
            </button>

            <div className="cj-topbar__busqueda">
              <Search size={18} />

              <input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="cj-topbar__acciones">
              <div className="cj-usuario">
                <div className="cj-usuario__avatar">
                  <Wallet size={19} />
                </div>

                <div className="cj-usuario__datos">
                  <strong>Personal de caja</strong>
                  <span>Área de operaciones</span>
                </div>
              </div>
            </div>
          </header>

          {/* ENCABEZADO */}
          <section className="cj-encabezado">
            <div>
              <span className="cj-encabezado__etiqueta">
                BANUAT / CAJERO
              </span>

              <h1>
                {moduloSeleccionado?.nombre || "Inicio"}
              </h1>

              <p>
                {moduloSeleccionado?.descripcion ||
                  "Administra las operaciones de caja."}
              </p>
            </div>

            <div className="cj-fecha">
              <Clock3 size={16} />
              <span>Panel de operaciones</span>
            </div>
          </section>

          {/* INICIO */}
          {moduloActivo === "inicio" && (
            <>
              {/* RESUMEN */}
              <section className="cj-resumen">

                <div className="cj-card cj-card--resumen">
                  <div className="cj-card__cabecera">
                    <div>
                      <span className="cj-card__sub">
                        Operaciones de caja
                      </span>
                      <h2>Resumen general</h2>
                    </div>

                    <div className="cj-icono cj-icono--verde">
                      <ClipboardList size={21} />
                    </div>
                  </div>

                  <div className="cj-estadisticas">

                    <div className="cj-stat">
                      <div className="cj-stat__icono">
                        <Receipt size={19} />
                      </div>
                      <div>
                        <strong>—</strong>
                        <span>Operaciones</span>
                      </div>
                    </div>

                    <div className="cj-stat">
                      <div className="cj-stat__icono">
                        <ArrowDownToLine size={19} />
                      </div>
                      <div>
                        <strong>—</strong>
                        <span>Depósitos</span>
                      </div>
                    </div>

                    <div className="cj-stat">
                      <div className="cj-stat__icono">
                        <ArrowUpFromLine size={19} />
                      </div>
                      <div>
                        <strong>—</strong>
                        <span>Retiros</span>
                      </div>
                    </div>

                    <div className="cj-stat">
                      <div className="cj-stat__icono">
                        <HandCoins size={19} />
                      </div>
                      <div>
                        <strong>—</strong>
                        <span>Pagos y abonos</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* PERFIL DE CAJA */}
                <div className="cj-card cj-perfil">
                  <div className="cj-perfil__icono">
                    <Wallet size={25} />
                  </div>

                  <span className="cj-perfil__estado">
                    <span />
                    Información de caja
                  </span>

                  <h2>Caja asignada</h2>
                  <p>Información del puesto de trabajo</p>

                  <div className="cj-perfil__dato">
                    <span>Usuario</span>
                    <strong>—</strong>
                  </div>

                  <div className="cj-perfil__dato">
                    <span>Estado</span>
                    <strong>—</strong>
                  </div>
                </div>
              </section>

              {/* RESUMEN DE DINERO */}
              <section className="cj-dinero">

                <div className="cj-card cj-dinero__tarjeta">
                  <div className="cj-dinero__cabecera">
                    <span>Entradas de efectivo</span>
                    <div className="cj-icono cj-icono--verde">
                      <TrendingUp size={20} />
                    </div>
                  </div>

                  <strong>—</strong>
                  <small>Depósitos y pagos recibidos</small>
                </div>

                <div className="cj-card cj-dinero__tarjeta">
                  <div className="cj-dinero__cabecera">
                    <span>Salidas de efectivo</span>
                    <div className="cj-icono cj-icono--naranja">
                      <TrendingDown size={20} />
                    </div>
                  </div>

                  <strong>—</strong>
                  <small>Retiros realizados</small>
                </div>

                <div className="cj-card cj-dinero__tarjeta cj-dinero__destacada">
                  <div className="cj-dinero__cabecera">
                    <span>Efectivo disponible</span>
                    <div className="cj-icono cj-icono--cafe">
                      <Banknote size={20} />
                    </div>
                  </div>

                  <strong>—</strong>
                  <small>Saldo disponible en caja</small>
                </div>

              </section>

              {/* ACTIVIDAD Y ACCESOS */}
              <section className="cj-principal">

                <div className="cj-card cj-actividad">
                  <div className="cj-card__cabecera">
                    <div>
                      <h2>Actividad reciente</h2>
                      <span className="cj-card__sub">
                        Registro de operaciones
                      </span>
                    </div>

                    <button
                      type="button"
                      className="cj-ver-mas"
                      onClick={() => seleccionarModulo("historial")}
                    >
                      Ver historial
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="cj-tabla-contenedor">
                    <table className="cj-tabla">
                      <thead>
                        <tr>
                          <th>Hora</th>
                          <th>Operación</th>
                          <th>Descripción</th>
                          <th>Monto</th>
                          <th>Estado</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td colSpan={5} className="cj-tabla-vacia">
                            No hay operaciones para mostrar.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="cj-card cj-seguridad">
                  <div className="cj-card__cabecera">
                    <h2>Control de caja</h2>
                    <ShieldCheck size={21} />
                  </div>

                  <div className="cj-seguridad__icono">
                    <CircleDollarSign size={31} />
                  </div>

                  <h3>Control de operaciones</h3>

                  <p>
                    Consulta las entradas y salidas de efectivo
                    correspondientes a tu jornada.
                  </p>

                  <button
                    type="button"
                    className="cj-boton"
                    onClick={() => seleccionarModulo("caja")}
                  >
                    Consultar caja
                    <ChevronRight size={17} />
                  </button>
                </div>

              </section>

              {/* ACCESOS RÁPIDOS */}
              <section className="cj-card cj-accesos">
                <div className="cj-card__cabecera">
                  <div>
                    <h2>Accesos rápidos</h2>
                    <span className="cj-card__sub">
                      Operaciones disponibles
                    </span>
                  </div>
                </div>

                <div className="cj-accesos__lista">
                  {modulos
                    .filter((modulo) =>
                      ["depositos", "retiros", "pagos", "consultas"].includes(
                        modulo.id
                      )
                    )
                    .map((modulo) => {
                      const Icono = modulo.icono;

                      return (
                        <button
                          type="button"
                          key={modulo.id}
                          className="cj-acceso"
                          onClick={() => seleccionarModulo(modulo.id)}
                        >
                          <div className="cj-acceso__icono">
                            <Icono size={21} />
                          </div>

                          <div>
                            <strong>{modulo.nombre}</strong>
                            <span>{modulo.descripcion}</span>
                          </div>

                          <ChevronRight size={17} />
                        </button>
                      );
                    })}
                </div>
              </section>
            </>
          )}

          {/* MÓDULO DE DEPÓSITOS */}
          {moduloActivo === "depositos" && <Depositos />}

          {/* MÓDULO DE RETIROS */}
          {moduloActivo === "retiros" && <Retiros />}
          {moduloActivo === "pagos" && <Pagos />}
          {moduloActivo === "consultas" && <Consultas />}
          {moduloActivo === "caja" && <ControlCaja />}
          {moduloActivo === "historial" && <Historial />}


          {/* VISTAS DE LOS DEMÁS MÓDULOS */}
          {moduloActivo !== "inicio" &&
            moduloActivo !== "depositos" && 
            moduloActivo !== "retiros" &&
             moduloActivo !== "pagos" &&
             moduloActivo !== "consultas" &&
             moduloActivo !== "caja" &&
             moduloActivo !== "historial" && (
              <section className="cj-card cj-modulo-vacio">
                <div className="cj-modulo-vacio__icono">
                  {moduloSeleccionado &&
                    (() => {
                      const Icono = moduloSeleccionado.icono;
                      return <Icono size={32} />;
                    })()}
                </div>

                <h2>{moduloSeleccionado?.nombre}</h2>

                <p>{moduloSeleccionado?.descripcion}</p>

                <span>
                  Este espacio está preparado para el contenido del módulo.
                </span>
              </section>
            )}

          {/* PIE */}
          <footer className="cj-footer">
            <span>BANUAT · Sistema de gestión financiera</span>
            <span>Panel de cajero</span>
          </footer>

        </main>
      </div>
    </div>
  );
}
