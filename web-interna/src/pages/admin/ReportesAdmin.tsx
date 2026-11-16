
import { useState } from "react";
import {
  FileBarChart,
  Users,
  HandCoins,
  Wallet,
  BriefcaseBusiness,
  CalendarDays,
  Search,
  Download,
  TrendingUp,
  ClipboardList,
  CircleDollarSign,
  Info,
  BarChart3,
} from "lucide-react";

import "./ReportesAdmin.css";

type SeccionReporte =
  | "Resumen general"
  | "Clientes"
  | "Préstamos"
  | "Caja"
  | "Personal";

export default function ReportesAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionReporte>("Resumen general");

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipoReporte, setTipoReporte] = useState("todos");

  const secciones: {
    nombre: SeccionReporte;
    icono: typeof FileBarChart;
  }[] = [
    { nombre: "Resumen general", icono: BarChart3 },
    { nombre: "Clientes", icono: Users },
    { nombre: "Préstamos", icono: HandCoins },
    { nombre: "Caja", icono: Wallet },
    { nombre: "Personal", icono: BriefcaseBusiness },
  ];

  const cambiarSeccion = (seccion: SeccionReporte) => {
    setSeccionActiva(seccion);
  };

  const obtenerDescripcion = () => {
    switch (seccionActiva) {
      case "Resumen general":
        return "Consulta los indicadores generales y el comportamiento de las operaciones.";
      case "Clientes":
        return "Consulta los registros, altas y movimientos relacionados con clientes.";
      case "Préstamos":
        return "Revisa las solicitudes y el comportamiento de los préstamos.";
      case "Caja":
        return "Consulta los movimientos financieros registrados en caja.";
      case "Personal":
        return "Consulta la actividad operativa de los trabajadores.";
      default:
        return "";
    }
  };

  const renderizarEstadoVacio = (
    titulo: string,
    descripcion: string
  ) => (
    <div className="rea-empty">
      <div className="rea-empty-icon">
        <FileBarChart size={30} />
      </div>
      <h4>{titulo}</h4>
      <p>{descripcion}</p>
    </div>
  );

  const renderizarContenido = () => {
    switch (seccionActiva) {
      case "Resumen general":
        return (
          <>
            <div className="rea-indicadores">
              <article className="rea-indicador">
                <div className="rea-indicador-icon naranja">
                  <Users size={21} />
                </div>
                <div>
                  <span>Clientes registrados</span>
                  <strong>—</strong>
                </div>
              </article>

              <article className="rea-indicador">
                <div className="rea-indicador-icon verde">
                  <HandCoins size={21} />
                </div>
                <div>
                  <span>Préstamos gestionados</span>
                  <strong>—</strong>
                </div>
              </article>

              <article className="rea-indicador">
                <div className="rea-indicador-icon azul">
                  <Wallet size={21} />
                </div>
                <div>
                  <span>Movimientos de caja</span>
                  <strong>—</strong>
                </div>
              </article>

              <article className="rea-indicador">
                <div className="rea-indicador-icon morado">
                  <BriefcaseBusiness size={21} />
                </div>
                <div>
                  <span>Personal registrado</span>
                  <strong>—</strong>
                </div>
              </article>
            </div>

            <div className="rea-panel">
              <div className="rea-panel-header">
                <div>
                  <h3>Actividad general</h3>
                  <p>
                    Comportamiento de las operaciones durante el periodo
                    seleccionado.
                  </p>
                </div>
                <TrendingUp size={21} />
              </div>

              {renderizarEstadoVacio(
                "Sin información disponible",
                "Cuando existan operaciones registradas, aquí se mostrará su comportamiento general."
              )}
            </div>

            <div className="rea-panel-grid">
              <article className="rea-panel">
                <div className="rea-panel-header">
                  <h3>Resumen de clientes</h3>
                  <Users size={19} />
                </div>
                {renderizarEstadoVacio(
                  "Sin registros",
                  "No hay información de clientes para mostrar."
                )}
              </article>

              <article className="rea-panel">
                <div className="rea-panel-header">
                  <h3>Resumen de préstamos</h3>
                  <HandCoins size={19} />
                </div>
                {renderizarEstadoVacio(
                  "Sin registros",
                  "No hay información de préstamos para mostrar."
                )}
              </article>
            </div>
          </>
        );

      case "Clientes":
        return (
          <div className="rea-panel">
            <div className="rea-panel-header">
              <div>
                <h3>Reporte de clientes</h3>
                <p>
                  Consulta las altas, registros y estado de los clientes.
                </p>
              </div>
              <Users size={21} />
            </div>

            <div className="rea-subindicadores">
              <article>
                <span>Total de clientes</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Nuevos registros</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Altas pendientes</span>
                <strong>—</strong>
              </article>
            </div>

            {renderizarEstadoVacio(
              "No hay registros de clientes",
              "Los datos de altas y registros aparecerán cuando estén disponibles."
            )}
          </div>
        );

      case "Préstamos":
        return (
          <div className="rea-panel">
            <div className="rea-panel-header">
              <div>
                <h3>Reporte de préstamos</h3>
                <p>
                  Consulta las solicitudes y su resultado de autorización.
                </p>
              </div>
              <HandCoins size={21} />
            </div>

            <div className="rea-subindicadores">
              <article>
                <span>Solicitudes recibidas</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Autorizados</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Rechazados</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Pendientes</span>
                <strong>—</strong>
              </article>
            </div>

            {renderizarEstadoVacio(
              "No hay información de préstamos",
              "Los reportes de solicitudes y autorizaciones aparecerán aquí."
            )}
          </div>
        );

      case "Caja":
        return (
          <div className="rea-panel">
            <div className="rea-panel-header">
              <div>
                <h3>Reporte de caja</h3>
                <p>
                  Consulta los depósitos, retiros y pagos registrados.
                </p>
              </div>
              <CircleDollarSign size={21} />
            </div>

            <div className="rea-subindicadores">
              <article>
                <span>Depósitos</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Retiros</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Pagos</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Importe total</span>
                <strong>—</strong>
              </article>
            </div>

            {renderizarEstadoVacio(
              "No hay movimientos de caja",
              "Los movimientos registrados por caja aparecerán en este reporte."
            )}
          </div>
        );

      case "Personal":
        return (
          <div className="rea-panel">
            <div className="rea-panel-header">
              <div>
                <h3>Reporte de personal</h3>
                <p>
                  Consulta la actividad y distribución del personal por área.
                </p>
              </div>
              <BriefcaseBusiness size={21} />
            </div>

            <div className="rea-subindicadores">
              <article>
                <span>Supervisores</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Escritorio</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Cajeros</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Recepción</span>
                <strong>—</strong>
              </article>
            </div>

            {renderizarEstadoVacio(
              "Sin actividad registrada",
              "Los registros de actividad del personal aparecerán aquí."
            )}
          </div>
        );
    }
  };

  return (
    <div className="rea-page">
      <div className="rea-encabezado">
        <div>
          <span className="rea-superior">
            ADMINISTRACIÓN GENERAL
          </span>
          <h2>Reportes</h2>
          <p>
            Consulta información y reportes generales de las operaciones
            de BANUAT.
          </p>
        </div>

        <div className="rea-encabezado-icon">
          <FileBarChart size={27} />
        </div>
      </div>

      <div className="rea-filtros">
        <div className="rea-filtro-campo">
          <label>Fecha inicial</label>
          <div className="rea-input-icon">
            <CalendarDays size={16} />
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
        </div>

        <div className="rea-filtro-campo">
          <label>Fecha final</label>
          <div className="rea-input-icon">
            <CalendarDays size={16} />
            <input
              type="date"
              value={fechaFin}
              min={fechaInicio || undefined}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
        </div>

        <div className="rea-filtro-campo">
          <label>Tipo de reporte</label>
          <select
            value={tipoReporte}
            onChange={(e) => setTipoReporte(e.target.value)}
          >
            <option value="todos">Todos los reportes</option>
            <option value="clientes">Clientes</option>
            <option value="prestamos">Préstamos</option>
            <option value="caja">Caja</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        <button
          className="rea-btn-filtrar"
          onClick={() => {
            const seccionesPorTipo: Record<string, SeccionReporte> = {
              todos: "Resumen general",
              clientes: "Clientes",
              prestamos: "Préstamos",
              caja: "Caja",
              personal: "Personal",
            };

            cambiarSeccion(seccionesPorTipo[tipoReporte]);
          }}
        >
          <Search size={16} />
          Consultar
        </button>
      </div>

      <div className="rea-secciones">
        {secciones.map(({ nombre, icono: Icono }) => (
          <button
            key={nombre}
            className={`rea-tab ${
              seccionActiva === nombre ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion(nombre)}
          >
            <Icono size={17} />
            {nombre}
          </button>
        ))}
      </div>

      <div className="rea-descripcion">
        <div>
          <h3>{seccionActiva}</h3>
          <p>{obtenerDescripcion()}</p>
        </div>
        <div className="rea-descripcion-icon">
          <ClipboardList size={22} />
        </div>
      </div>

      {renderizarContenido()}

      <div className="rea-nota">
        <Info size={18} />
        <p>
          Los reportes mostrarán información obtenida de los registros
          del sistema. La exportación y generación de documentos se
          habilitarán cuando se conecten las fuentes de información.
        </p>
      </div>
    </div>
  );
}
