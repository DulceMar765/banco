
import {
  Users,
  UserRoundCheck,
  ClipboardList,
  Activity,
  UserCog,
  UserPlus,
  FileSearch,
  Wallet,
  ArrowRight,
  Clock3,
  CircleCheck,
} from "lucide-react";

import "./InicioAdministrador.css";

function InicioAdministrador() {
  const indicadores = [
    {
      titulo: "Clientes registrados",
      valor: "—",
      descripcion: "Total de clientes",
      icono: Users,
      color: "orange",
    },
    {
      titulo: "Altas pendientes",
      valor: "—",
      descripcion: "Por revisar",
      icono: UserRoundCheck,
      color: "green",
    },
    {
      titulo: "Solicitudes pendientes",
      valor: "—",
      descripcion: "En revisión",
      icono: ClipboardList,
      color: "brown",
    },
    {
      titulo: "Personal conectado",
      valor: "—",
      descripcion: "Sesiones activas",
      icono: Activity,
      color: "blue",
    },
  ];

  const etapas = [
    {
      numero: "01",
      titulo: "Registro de clientes",
      descripcion: "Recepción y escritorio",
      icono: UserPlus,
      color: "orange",
    },
    {
      numero: "02",
      titulo: "Solicitud",
      descripcion: "Registro en escritorio",
      icono: ClipboardList,
      color: "blue",
    },
    {
      numero: "03",
      titulo: "Revisión",
      descripcion: "Autorización del supervisor",
      icono: FileSearch,
      color: "green",
    },
    {
      numero: "04",
      titulo: "Operaciones",
      descripcion: "Atención en caja",
      icono: Wallet,
      color: "brown",
    },
  ];

  return (
    <div className="iad-container">

      {/* ENCABEZADO */}
      <div className="iad-heading">
        <div>
          <span className="iad-eyebrow">
            RESUMEN GENERAL
          </span>

          <h2>Panel de administración</h2>

          <p>
            Supervisa el funcionamiento general de BANUAT
            desde un solo lugar.
          </p>
        </div>

        <div className="iad-date">
          <Clock3 size={17} />
          <span>Resumen administrativo</span>
        </div>
      </div>

      {/* INDICADORES */}
      <section className="iad-stats">
        {indicadores.map((indicador) => {
          const Icono = indicador.icono;

          return (
            <article
              className="iad-stat-card"
              key={indicador.titulo}
            >
              <div className="iad-stat-top">
                <div className={`iad-stat-icon ${indicador.color}`}>
                  <Icono size={21} />
                </div>
              </div>

              <div className="iad-stat-value">
                {indicador.valor}
              </div>

              <h3>{indicador.titulo}</h3>

              <span className="iad-stat-description">
                {indicador.descripcion}
              </span>
            </article>
          );
        })}
      </section>

      {/* FLUJO DE TRABAJO */}
      <section className="iad-section">
        <div className="iad-section-heading">
          <div>
            <h3>Flujo de trabajo</h3>
            <p>
              Etapas principales de las operaciones de BANUAT.
            </p>
          </div>

          <span className="iad-section-tag">
            <Activity size={14} />
            Proceso general
          </span>
        </div>

        <div className="iad-workflow">
          {etapas.map((etapa, index) => {
            const Icono = etapa.icono;

            return (
              <div className="iad-workflow-group" key={etapa.numero}>
                <article className="iad-workflow-card">
                  <div className="iad-workflow-top">
                    <span className="iad-workflow-number">
                      {etapa.numero}
                    </span>

                    <div className={`iad-workflow-icon ${etapa.color}`}>
                      <Icono size={22} />
                    </div>
                  </div>

                  <h4>{etapa.titulo}</h4>

                  <p>{etapa.descripcion}</p>
                </article>

                {index < etapas.length - 1 && (
                  <div className="iad-workflow-arrow">
                    <ArrowRight size={19} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="iad-workflow-note">
          <CircleCheck size={17} />
          <span>
            Este esquema representa el proceso general de trabajo,
            no operaciones registradas.
          </span>
        </div>
      </section>

      {/* PARTE INFERIOR */}
      <div className="iad-bottom-grid">

        {/* PERSONAL CONECTADO */}
        <section className="iad-section iad-connected">
          <div className="iad-section-heading">
            <div>
              <h3>Personal conectado</h3>
              <p>Trabajadores con sesión activa.</p>
            </div>

            <div className="iad-heading-icon green">
              <UserCog size={19} />
            </div>
          </div>

          <div className="iad-empty-state">
            <div className="iad-empty-icon">
              <Users size={25} />
            </div>

            <h4>Sin información disponible</h4>

            <p>
              Aquí aparecerán los trabajadores que tengan
              una sesión activa en el sistema.
            </p>
          </div>
        </section>

        {/* ACTIVIDAD RECIENTE */}
        <section className="iad-section iad-activity">
          <div className="iad-section-heading">
            <div>
              <h3>Actividad reciente</h3>
              <p>Movimientos de los departamentos.</p>
            </div>

            <div className="iad-heading-icon orange">
              <Activity size={19} />
            </div>
          </div>

          <div className="iad-empty-state">
            <div className="iad-empty-icon">
              <ClipboardList size={25} />
            </div>

            <h4>Sin movimientos registrados</h4>

            <p>
              Aquí se mostrarán las actividades realizadas
              por los diferentes departamentos.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

export default InicioAdministrador;
