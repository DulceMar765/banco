
import { useState } from "react";
import {
  Activity,
  ClipboardList,
  HandCoins,
  Wallet,
  Users,
  Search,
  Filter,
  FileText,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Clock3,
  Building2,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import "./OperacionesAdmin.css";

type SeccionOperaciones =
  | "Resumen"
  | "Préstamos"
  | "Caja"
  | "Atención";

function OperacionesAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionOperaciones>("Resumen");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const cambiarSeccion = (seccion: SeccionOperaciones) => {
    setSeccionActiva(seccion);
    setBusqueda("");
    setFiltroEstado("Todos");
  };

  const obtenerDescripcion = () => {
    switch (seccionActiva) {
      case "Préstamos":
        return "Consulta las solicitudes de préstamo y sus estados de autorización.";

      case "Caja":
        return "Supervisa los depósitos, retiros y pagos registrados por caja.";

      case "Atención":
        return "Consulta los registros de atención realizados por recepción y escritorio.";

      default:
        return "Consulta el panorama general de las operaciones de BANUAT.";
    }
  };

  return (
    <div className="opa-container">

      {/* ENCABEZADO */}
      <div className="opa-heading">
        <div>
          <span className="opa-eyebrow">
            CONTROL ADMINISTRATIVO
          </span>

          <h2>Operaciones</h2>

          <p>
            Consulta y supervisa los movimientos realizados
            en las diferentes áreas de BANUAT.
          </p>
        </div>
      </div>

      {/* INDICADORES */}
      <section className="opa-stats">

        <article className="opa-stat-card">
          <div className="opa-stat-icon orange">
            <Activity size={21} />
          </div>

          <div>
            <span>Operaciones registradas</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="opa-stat-card">
          <div className="opa-stat-icon green">
            <HandCoins size={21} />
          </div>

          <div>
            <span>Solicitudes de préstamo</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="opa-stat-card">
          <div className="opa-stat-icon blue">
            <Wallet size={21} />
          </div>

          <div>
            <span>Movimientos de caja</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="opa-stat-card">
          <div className="opa-stat-icon brown">
            <Users size={21} />
          </div>

          <div>
            <span>Registros de atención</span>
            <strong>—</strong>
          </div>
        </article>

      </section>

      {/* CONTENIDO PRINCIPAL */}
      <section className="opa-section">

        {/* PESTAÑAS */}
        <div className="opa-tabs">

          <button
            type="button"
            className={seccionActiva === "Resumen" ? "active" : ""}
            onClick={() => cambiarSeccion("Resumen")}
          >
            <Activity size={17} />
            Resumen
          </button>

          <button
            type="button"
            className={seccionActiva === "Préstamos" ? "active" : ""}
            onClick={() => cambiarSeccion("Préstamos")}
          >
            <HandCoins size={17} />
            Préstamos
          </button>

          <button
            type="button"
            className={seccionActiva === "Caja" ? "active" : ""}
            onClick={() => cambiarSeccion("Caja")}
          >
            <Wallet size={17} />
            Caja
          </button>

          <button
            type="button"
            className={seccionActiva === "Atención" ? "active" : ""}
            onClick={() => cambiarSeccion("Atención")}
          >
            <Users size={17} />
            Atención
          </button>

        </div>

        <div className="opa-content">

          <div className="opa-content-heading">
            <div>
              <h3>{seccionActiva}</h3>
              <p>{obtenerDescripcion()}</p>
            </div>
          </div>

          {/* RESUMEN */}
          {seccionActiva === "Resumen" && (
            <>
              <div className="opa-overview-grid">

                <article className="opa-overview-card">
                  <div className="opa-overview-top">
                    <div className="opa-overview-icon orange">
                      <HandCoins size={20} />
                    </div>
                    <span>Área de préstamos</span>
                  </div>

                  <h4>Solicitudes</h4>

                  <p>
                    Consulta las solicitudes enviadas,
                    revisadas, autorizadas o rechazadas.
                  </p>

                  <button
                    type="button"
                    onClick={() => cambiarSeccion("Préstamos")}
                  >
                    Consultar préstamos
                    <ArrowDownToLine size={15} />
                  </button>
                </article>

                <article className="opa-overview-card">
                  <div className="opa-overview-top">
                    <div className="opa-overview-icon green">
                      <Wallet size={20} />
                    </div>
                    <span>Área de caja</span>
                  </div>

                  <h4>Movimientos financieros</h4>

                  <p>
                    Consulta los depósitos, retiros y pagos
                    registrados por los cajeros.
                  </p>

                  <button
                    type="button"
                    onClick={() => cambiarSeccion("Caja")}
                  >
                    Consultar movimientos
                    <ArrowDownToLine size={15} />
                  </button>
                </article>

                <article className="opa-overview-card">
                  <div className="opa-overview-icon blue">
                    <Users size={20} />
                  </div>

                  <div className="opa-overview-top">
                    <span>Área de atención</span>
                  </div>

                  <h4>Atención a clientes</h4>

                  <p>
                    Consulta los registros de recepción,
                    turnos y actividades de escritorio.
                  </p>

                  <button
                    type="button"
                    onClick={() => cambiarSeccion("Atención")}
                  >
                    Consultar atención
                    <ArrowDownToLine size={15} />
                  </button>
                </article>

              </div>

              <div className="opa-recent">
                <div className="opa-recent-heading">
                  <div>
                    <h4>Actividad reciente</h4>
                    <p>
                      Últimas operaciones registradas en el sistema.
                    </p>
                  </div>

                  <Clock3 size={19} />
                </div>

                <div className="opa-empty-state">
                  <div className="opa-empty-icon">
                    <ClipboardList size={26} />
                  </div>

                  <h4>No hay actividad registrada</h4>

                  <p>
                    Cuando se realicen operaciones en los distintos
                    departamentos, sus registros aparecerán aquí.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* PRÉSTAMOS */}
          {seccionActiva === "Préstamos" && (
            <>
              <div className="opa-toolbar">

                <div className="opa-search">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Buscar por cliente o número de solicitud..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="opa-filter">
                  <Filter size={17} />

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todos">Todos los estados</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En revisión">En revisión</option>
                    <option value="Autorizado">Autorizado</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>
                </div>

              </div>

              <div className="opa-empty-state">
                <div className="opa-empty-icon orange">
                  <HandCoins size={26} />
                </div>

                <h4>No hay solicitudes para mostrar</h4>

                <p>
                  Aquí aparecerán las solicitudes de préstamo
                  y su estado dentro del proceso de autorización.
                </p>
              </div>
            </>
          )}

          {/* CAJA */}
          {seccionActiva === "Caja" && (
            <>
              <div className="opa-toolbar">

                <div className="opa-search">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Buscar por cliente o referencia..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="opa-filter">
                  <Filter size={17} />

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todos">Todos los movimientos</option>
                    <option value="Depósito">Depósitos</option>
                    <option value="Retiro">Retiros</option>
                    <option value="Pago">Pagos</option>
                  </select>
                </div>

              </div>

              <div className="opa-movement-types">

                <div>
                  <ArrowDownToLine size={19} />
                  <span>Depósitos</span>
                </div>

                <div>
                  <ArrowUpFromLine size={19} />
                  <span>Retiros</span>
                </div>

                <div>
                  <CreditCard size={19} />
                  <span>Pagos</span>
                </div>

              </div>

              <div className="opa-empty-state">
                <div className="opa-empty-icon green">
                  <Wallet size={26} />
                </div>

                <h4>No hay movimientos registrados</h4>

                <p>
                  Aquí aparecerá el historial de depósitos,
                  retiros y pagos realizados por el área de caja.
                </p>
              </div>
            </>
          )}

          {/* ATENCIÓN */}
          {seccionActiva === "Atención" && (
            <>
              <div className="opa-toolbar">

                <div className="opa-search">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Buscar por cliente o trabajador..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="opa-filter">
                  <Filter size={17} />

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todos">Todas las áreas</option>
                    <option value="Recepción">Recepción</option>
                    <option value="Escritorio">Escritorio</option>
                  </select>
                </div>

              </div>

              <div className="opa-attention-types">

                <div>
                  <Building2 size={19} />
                  <span>Recepción</span>
                </div>

                <div>
                  <UserRound size={19} />
                  <span>Escritorio</span>
                </div>

              </div>

              <div className="opa-empty-state">
                <div className="opa-empty-icon blue">
                  <FileText size={26} />
                </div>

                <h4>No hay registros de atención</h4>

                <p>
                  Aquí aparecerán los registros de clientes atendidos,
                  turnos y solicitudes capturadas por el personal.
                </p>
              </div>
            </>
          )}

        </div>
      </section>

      {/* INFORMACIÓN ADMINISTRATIVA */}
      <section className="opa-info">
        <div className="opa-info-icon">
          <ShieldCheck size={19} />
        </div>

        <div>
          <h4>Supervisión de operaciones</h4>

          <p>
            Este módulo permite al administrador consultar la
            actividad de los departamentos. Las operaciones
            financieras y las autorizaciones se realizan desde
            los módulos correspondientes a cada puesto.
          </p>
        </div>
      </section>

    </div>
  );
}

export default OperacionesAdmin;
