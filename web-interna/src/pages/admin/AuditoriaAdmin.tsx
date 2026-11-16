
import { useState } from "react";
import {
  ClipboardList,
  Search,
  UserRound,
  Users,
  HandCoins,
  Wallet,
  Settings,
  FileText,
  CalendarDays,
  ShieldCheck,
  Info,
} from "lucide-react";

import "./AuditoriaAdmin.css";

type SeccionAuditoria =
  | "Todas las actividades"
  | "Clientes"
  | "Préstamos"
  | "Caja"
  | "Sistema";

export default function AuditoriaAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionAuditoria>("Todas las actividades");

  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipoAccion, setTipoAccion] = useState("todas");

  const secciones: {
    nombre: SeccionAuditoria;
    icono: typeof ClipboardList;
  }[] = [
    { nombre: "Todas las actividades", icono: ClipboardList },
    { nombre: "Clientes", icono: Users },
    { nombre: "Préstamos", icono: HandCoins },
    { nombre: "Caja", icono: Wallet },
    { nombre: "Sistema", icono: Settings },
  ];

  const obtenerDescripcion = () => {
    switch (seccionActiva) {
      case "Todas las actividades":
        return "Consulta el historial general de acciones realizadas en BANUAT.";
      case "Clientes":
        return "Consulta las acciones relacionadas con registros y expedientes de clientes.";
      case "Préstamos":
        return "Consulta las revisiones y decisiones relacionadas con solicitudes de préstamos.";
      case "Caja":
        return "Consulta las acciones relacionadas con depósitos, retiros y pagos.";
      case "Sistema":
        return "Consulta los cambios administrativos y de configuración del sistema.";
      default:
        return "";
    }
  };

  const cambiarSeccion = (seccion: SeccionAuditoria) => {
    setSeccionActiva(seccion);
  };

  const renderizarEstadoVacio = () => (
    <div className="aua-empty">
      <div className="aua-empty-icon">
        <ClipboardList size={30} />
      </div>
      <h4>Sin actividades registradas</h4>
      <p>
        Cuando existan acciones registradas en el sistema,
        aparecerán aquí para su consulta.
      </p>
    </div>
  );

  const renderizarContenido = () => {
    switch (seccionActiva) {
      case "Todas las actividades":
        return (
          <div className="aua-panel">
            <div className="aua-panel-header">
              <div>
                <h3>Historial general</h3>
                <p>Registro de actividades de todos los módulos.</p>
              </div>
              <ClipboardList size={21} />
            </div>
            {renderizarEstadoVacio()}
          </div>
        );

      case "Clientes":
        return (
          <div className="aua-panel">
            <div className="aua-panel-header">
              <div>
                <h3>Actividad de clientes</h3>
                <p>
                  Registros, modificaciones y revisiones de expedientes.
                </p>
              </div>
              <Users size={21} />
            </div>
            {renderizarEstadoVacio()}
          </div>
        );

      case "Préstamos":
        return (
          <div className="aua-panel">
            <div className="aua-panel-header">
              <div>
                <h3>Actividad de préstamos</h3>
                <p>
                  Revisiones, autorizaciones y rechazos de solicitudes.
                </p>
              </div>
              <HandCoins size={21} />
            </div>
            {renderizarEstadoVacio()}
          </div>
        );

      case "Caja":
        return (
          <div className="aua-panel">
            <div className="aua-panel-header">
              <div>
                <h3>Actividad de caja</h3>
                <p>
                  Registro de operaciones realizadas por los cajeros.
                </p>
              </div>
              <Wallet size={21} />
            </div>
            {renderizarEstadoVacio()}
          </div>
        );

      case "Sistema":
        return (
          <div className="aua-panel">
            <div className="aua-panel-header">
              <div>
                <h3>Actividad administrativa</h3>
                <p>
                  Cambios de configuración y administración de cuentas.
                </p>
              </div>
              <Settings size={21} />
            </div>
            {renderizarEstadoVacio()}
          </div>
        );
    }
  };

  return (
    <div className="aua-page">
      <div className="aua-encabezado">
        <div>
          <span className="aua-superior">
            ADMINISTRACIÓN GENERAL
          </span>
          <h2>Auditoría</h2>
          <p>
            Consulta las actividades y acciones realizadas dentro
            del sistema BANUAT.
          </p>
        </div>

        <div className="aua-encabezado-icon">
          <ShieldCheck size={27} />
        </div>
      </div>

      <div className="aua-indicadores">
        <article className="aua-indicador">
          <div className="aua-indicador-icon naranja">
            <ClipboardList size={21} />
          </div>
          <div>
            <span>Actividades registradas</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="aua-indicador">
          <div className="aua-indicador-icon verde">
            <UserRound size={21} />
          </div>
          <div>
            <span>Usuarios activos</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="aua-indicador">
          <div className="aua-indicador-icon azul">
            <FileText size={21} />
          </div>
          <div>
            <span>Acciones administrativas</span>
            <strong>—</strong>
          </div>
        </article>
      </div>

      <div className="aua-filtros">
        <div className="aua-filtro-campo">
          <label>Buscar actividad o usuario</label>
          <div className="aua-input-icon">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="aua-filtro-campo">
          <label>Fecha inicial</label>
          <div className="aua-input-icon">
            <CalendarDays size={16} />
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
        </div>

        <div className="aua-filtro-campo">
          <label>Fecha final</label>
          <div className="aua-input-icon">
            <CalendarDays size={16} />
            <input
              type="date"
              min={fechaInicio || undefined}
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
        </div>

        <div className="aua-filtro-campo">
          <label>Tipo de acción</label>
          <select
            value={tipoAccion}
            onChange={(e) => setTipoAccion(e.target.value)}
          >
            <option value="todas">Todas las acciones</option>
            <option value="registro">Registros</option>
            <option value="modificacion">Modificaciones</option>
            <option value="autorizacion">Autorizaciones</option>
            <option value="eliminacion">Eliminaciones</option>
            <option value="acceso">Accesos al sistema</option>
          </select>
        </div>
      </div>

      <div className="aua-secciones">
        {secciones.map(({ nombre, icono: Icono }) => (
          <button
            key={nombre}
            className={`aua-tab ${
              seccionActiva === nombre ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion(nombre)}
          >
            <Icono size={17} />
            {nombre}
          </button>
        ))}
      </div>

      <div className="aua-descripcion">
        <div>
          <h3>{seccionActiva}</h3>
          <p>{obtenerDescripcion()}</p>
        </div>
        <div className="aua-descripcion-icon">
          <ClipboardList size={22} />
        </div>
      </div>

      {renderizarContenido()}

      <div className="aua-nota">
        <Info size={18} />
        <p>
          La auditoría es un módulo de consulta. Los registros de
          actividad deberán conservar el usuario responsable,
          la acción realizada, el módulo y la fecha y hora.
          El historial no deberá poder modificarse desde esta sección.
        </p>
      </div>
    </div>
  );
}
