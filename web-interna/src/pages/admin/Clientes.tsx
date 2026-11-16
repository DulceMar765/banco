
import { useState } from "react";
import {
  Users,
  UserPlus,
  UserRoundCheck,
  FolderOpen,
  Search,
  Filter,
  Eye,
  Clock3,
  FileText,
} from "lucide-react";

import "./Clientes.css";

type SeccionClientes =
  | "Solicitudes"
  | "Directorio"
  | "Expedientes";

function Clientes() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionClientes>("Solicitudes");

  const [busqueda, setBusqueda] = useState("");

  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const cambiarSeccion = (seccion: SeccionClientes) => {
    setSeccionActiva(seccion);
    setBusqueda("");
    setFiltroEstado("Todos");
  };

  return (
    <div className="cla-container">

      {/* ENCABEZADO */}
      <div className="cla-heading">
        <div>
          <span className="cla-eyebrow">
            ADMINISTRACIÓN DE CLIENTES
          </span>

          <h2>Gestión de clientes</h2>

          <p>
            Administra las altas, consulta los expedientes y
            supervisa el estado de los clientes de BANUAT.
          </p>
        </div>
      </div>

      {/* INDICADORES */}
      <section className="cla-stats">

        <article className="cla-stat-card">
          <div className="cla-stat-icon orange">
            <Users size={21} />
          </div>

          <div>
            <span>Total de clientes</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="cla-stat-card">
          <div className="cla-stat-icon green">
            <UserRoundCheck size={21} />
          </div>

          <div>
            <span>Clientes activos</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="cla-stat-card">
          <div className="cla-stat-icon brown">
            <Clock3 size={21} />
          </div>

          <div>
            <span>Altas pendientes</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="cla-stat-card">
          <div className="cla-stat-icon blue">
            <UserPlus size={21} />
          </div>

          <div>
            <span>Altas revisadas</span>
            <strong>—</strong>
          </div>
        </article>

      </section>

      {/* NAVEGACIÓN INTERNA */}
      <section className="cla-section">

        <div className="cla-tabs">
          <button
            type="button"
            className={seccionActiva === "Solicitudes" ? "active" : ""}
            onClick={() => cambiarSeccion("Solicitudes")}
          >
            <UserPlus size={17} />
            Solicitudes de alta
          </button>

          <button
            type="button"
            className={seccionActiva === "Directorio" ? "active" : ""}
            onClick={() => cambiarSeccion("Directorio")}
          >
            <Users size={17} />
            Directorio de clientes
          </button>

          <button
            type="button"
            className={seccionActiva === "Expedientes" ? "active" : ""}
            onClick={() => cambiarSeccion("Expedientes")}
          >
            <FolderOpen size={17} />
            Expedientes
          </button>
        </div>

        {/* CONTENIDO DE LA SECCIÓN */}
        <div className="cla-content">

          <div className="cla-content-heading">
            <div>
              <h3>{seccionActiva}</h3>

              <p>
                {seccionActiva === "Solicitudes" &&
                  "Revisa y administra las solicitudes de registro de nuevos clientes."}

                {seccionActiva === "Directorio" &&
                  "Consulta los clientes registrados en la cooperativa."}

                {seccionActiva === "Expedientes" &&
                  "Localiza y consulta la documentación de los clientes."}
              </p>
            </div>
          </div>

          {/* BÚSQUEDA Y FILTROS */}
          <div className="cla-toolbar">

            <div className="cla-search">
              <Search size={18} />

              <input
                type="text"
                placeholder={
                  seccionActiva === "Solicitudes"
                    ? "Buscar solicitud..."
                    : "Buscar por nombre, CURP o número de cliente..."
                }
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="cla-filter">
              <Filter size={17} />

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="Todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Activo">Activo</option>
                <option value="Rechazado">Rechazado</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>

          </div>

          {/* SOLICITUDES */}
          {seccionActiva === "Solicitudes" && (
            <div className="cla-empty-state">
              <div className="cla-empty-icon orange">
                <UserPlus size={27} />
              </div>

              <h4>No hay solicitudes para mostrar</h4>

              <p>
                Cuando se registren nuevos clientes, sus solicitudes
                aparecerán aquí para que puedas revisarlas.
              </p>
            </div>
          )}

          {/* DIRECTORIO */}
          {seccionActiva === "Directorio" && (
            <div className="cla-empty-state">
              <div className="cla-empty-icon green">
                <Users size={27} />
              </div>

              <h4>No hay clientes registrados</h4>

              <p>
                Aquí aparecerá el directorio general de clientes
                una vez que existan registros en el sistema.
              </p>
            </div>
          )}

          {/* EXPEDIENTES */}
          {seccionActiva === "Expedientes" && (
            <div className="cla-empty-state">
              <div className="cla-empty-icon blue">
                <FileText size={27} />
              </div>

              <h4>No hay expedientes disponibles</h4>

              <p>
                Aquí podrás localizar los expedientes y consultar
                los documentos asociados a cada cliente.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* INFORMACIÓN ADMINISTRATIVA */}
      <section className="cla-info">
        <div className="cla-info-icon">
          <Eye size={19} />
        </div>

        <div>
          <h4>Control de registros</h4>
          <p>
            El administrador es responsable de revisar y autorizar
            las altas de clientes. Los trabajadores de recepción y
            escritorio pueden registrar solicitudes, pero no aprobarlas.
          </p>
        </div>
      </section>

    </div>
  );
}

export default Clientes;
