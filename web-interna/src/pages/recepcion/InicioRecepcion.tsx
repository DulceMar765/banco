
import {
  Ticket,
  ClipboardList,
  History,
  ArrowRight,
  Users,
  UserRound,
  UserPlus,
  CalendarDays,
  Clock,
} from "lucide-react";

import "./InicioRecepcion.css";

type InicioRecepcionProps = {
  onCambiarSeccion?: (
    seccion: "turnos" | "requisitos" | "historial"
  ) => void;
};

export default function InicioRecepcion({
  onCambiarSeccion,
}: InicioRecepcionProps) {
  return (
    <div className="ir-container">

      {/* BIENVENIDA */}
      <section className="ir-welcome">
        <div className="ir-welcome-content">
          <span className="ir-eyebrow">
            ÁREA DE RECEPCIÓN
          </span>

          <h1>Bienvenido a recepción</h1>

          <p>
            Administra la asignación de turnos y orienta
            a las personas sobre los requisitos necesarios
            para realizar sus trámites en BANUAT.
          </p>
        </div>

        <div className="ir-date">
          <CalendarDays size={19} />

          <span>
            {new Date().toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="ir-stats">

        <div className="ir-stat-card">
          <div className="ir-stat-icon orange">
            <Ticket size={23} />
          </div>

          <div className="ir-stat-info">
            <span>Turnos asignados</span>
            <h2>—</h2>
            <small>Registro del día</small>
          </div>
        </div>

        <div className="ir-stat-card">
          <div className="ir-stat-icon brown">
            <UserRound size={23} />
          </div>

          <div className="ir-stat-info">
            <span>Clientes</span>
            <h2>—</h2>
            <small>Turnos asignados</small>
          </div>
        </div>

        <div className="ir-stat-card">
          <div className="ir-stat-icon green">
            <UserPlus size={23} />
          </div>

          <div className="ir-stat-info">
            <span>Nuevos clientes</span>
            <h2>—</h2>
            <small>Turnos asignados</small>
          </div>
        </div>

        <div className="ir-stat-card">
          <div className="ir-stat-icon gray">
            <Clock size={23} />
          </div>

          <div className="ir-stat-info">
            <span>Último turno</span>
            <h2>—</h2>
            <small>Sin información disponible</small>
          </div>
        </div>

      </section>

      {/* CONTENIDO PRINCIPAL */}
      <div className="ir-main-grid">

        {/* ACCESOS RÁPIDOS */}
        <section className="ir-card ir-actions-card">

          <div className="ir-card-heading">
            <div>
              <span className="ir-section-tag">
                HERRAMIENTAS
              </span>

              <h3>Accesos rápidos</h3>

              <p>
                Selecciona la actividad que deseas realizar.
              </p>
            </div>
          </div>

          <div className="ir-action-list">

            <button
              className="ir-action-item"
              onClick={() => onCambiarSeccion?.("turnos")}
            >
              <div className="ir-action-icon orange">
                <Ticket size={22} />
              </div>

              <div className="ir-action-info">
                <strong>Asignación de turnos</strong>
                <span>
                  Generar un turno para una persona.
                </span>
              </div>

              <ArrowRight size={19} />
            </button>

            <button
              className="ir-action-item"
              onClick={() => onCambiarSeccion?.("requisitos")}
            >
              <div className="ir-action-icon green">
                <ClipboardList size={22} />
              </div>

              <div className="ir-action-info">
                <strong>Requisitos de trámites</strong>
                <span>
                  Consultar los documentos necesarios.
                </span>
              </div>

              <ArrowRight size={19} />
            </button>

            <button
              className="ir-action-item"
              onClick={() => onCambiarSeccion?.("historial")}
            >
              <div className="ir-action-icon brown">
                <History size={22} />
              </div>

              <div className="ir-action-info">
                <strong>Historial de turnos</strong>
                <span>
                  Consultar los turnos registrados.
                </span>
              </div>

              <ArrowRight size={19} />
            </button>

          </div>
        </section>

        {/* FUNCIONES DE RECEPCIÓN */}
        <section className="ir-card ir-functions-card">

          <div className="ir-card-heading">
            <div>
              <span className="ir-section-tag">
                RESPONSABILIDADES
              </span>

              <h3>Funciones de recepción</h3>

              <p>
                Actividades principales del área.
              </p>
            </div>
          </div>

          <div className="ir-function-list">

            <div className="ir-function-item">
              <div className="ir-function-icon">
                <Users size={20} />
              </div>

              <div>
                <strong>Identificación de personas</strong>

                <span>
                  Distinguir entre clientes y nuevos clientes.
                </span>
              </div>
            </div>

            <div className="ir-function-item">
              <div className="ir-function-icon">
                <Ticket size={20} />
              </div>

              <div>
                <strong>Asignación de turnos</strong>

                <span>
                  Entregar el turno correspondiente.
                </span>
              </div>
            </div>

            <div className="ir-function-item">
              <div className="ir-function-icon">
                <ClipboardList size={20} />
              </div>

              <div>
                <strong>Orientación documental</strong>

                <span>
                  Informar qué documentos debe presentar
                  cada persona.
                </span>
              </div>
            </div>

          </div>

        </section>
      </div>

      {/* AVISO INFORMATIVO */}
      <section className="ir-notice">
        <div className="ir-notice-icon">
          <ClipboardList size={22} />
        </div>

        <div className="ir-notice-content">
          <strong>Orientación antes de la atención</strong>

          <p>
            Consulta los requisitos de cada trámite y verifica
            físicamente que la persona lleve la documentación
            necesaria antes de dirigirla al área correspondiente.
          </p>
        </div>
      </section>

    </div>
  );
}
