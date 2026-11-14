
import { useState } from "react";
import {
  Bell,
  Search,
  CheckCheck,
  Clock,
  CreditCard,
  HandCoins,
  Gift,
  UserRound,
  FileText,
  Info,
  CheckCircle2,
  Circle,
  Trash2,
  CircleHelp,
} from "lucide-react";

import "./NotificacionesCliente.css";

type EstadoFiltro = "Todas" | "No leídas" | "Leídas";

type Notificacion = {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  categoria: string;
  leida: boolean;
  icono: typeof Bell;
  clase: string;
};

export default function NotificacionesCliente() {
  const [filtroActivo, setFiltroActivo] =
    useState<EstadoFiltro>("Todas");

  const [busqueda, setBusqueda] = useState("");

  const [notificaciones, setNotificaciones] =
    useState<Notificacion[]>([]);

  const filtros: EstadoFiltro[] = [
    "Todas",
    "No leídas",
    "Leídas",
  ];

  const notificacionesFiltradas = notificaciones.filter(
    (notificacion) => {
      const coincideBusqueda =
        notificacion.titulo
          .toLowerCase()
          .includes(busqueda.toLowerCase()) ||
        notificacion.descripcion
          .toLowerCase()
          .includes(busqueda.toLowerCase());

      const coincideFiltro =
        filtroActivo === "Todas" ||
        (filtroActivo === "No leídas" && !notificacion.leida) ||
        (filtroActivo === "Leídas" && notificacion.leida);

      return coincideBusqueda && coincideFiltro;
    }
  );

  const noLeidas = notificaciones.filter(
    (notificacion) => !notificacion.leida
  ).length;

  const marcarComoLeida = (id: number) => {
    setNotificaciones((actuales) =>
      actuales.map((notificacion) =>
        notificacion.id === id
          ? { ...notificacion, leida: true }
          : notificacion
      )
    );
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones((actuales) =>
      actuales.map((notificacion) => ({
        ...notificacion,
        leida: true,
      }))
    );
  };

  const eliminarNotificacion = (id: number) => {
    setNotificaciones((actuales) =>
      actuales.filter((notificacion) => notificacion.id !== id)
    );
  };

  return (
    <section className="notificaciones-cliente">

      {/* ENCABEZADO */}

      <div className="noc-encabezado">
        <div>
          <span className="noc-etiqueta">MI CUENTA</span>
          <h1>Notificaciones</h1>
          <p>
            Mantente al tanto de las novedades y avisos de BANUAT.
          </p>
        </div>

        <div className="noc-encabezado-icono">
          <Bell size={27} />
          {noLeidas > 0 && (
            <span className="noc-insignia">{noLeidas}</span>
          )}
        </div>
      </div>

      {/* RESUMEN */}

      <div className="noc-resumen">
        <article className="noc-resumen-card">
          <div className="noc-resumen-icono naranja">
            <Bell size={21} />
          </div>

          <div>
            <span>Total de notificaciones</span>
            <strong>{notificaciones.length}</strong>
            <small>Avisos recibidos</small>
          </div>
        </article>

        <article className="noc-resumen-card">
          <div className="noc-resumen-icono rojo">
            <Circle size={21} />
          </div>

          <div>
            <span>No leídas</span>
            <strong>{noLeidas}</strong>
            <small>Pendientes de revisar</small>
          </div>
        </article>

        <article className="noc-resumen-card">
          <div className="noc-resumen-icono verde">
            <CheckCheck size={21} />
          </div>

          <div>
            <span>Leídas</span>
            <strong>{notificaciones.length - noLeidas}</strong>
            <small>Notificaciones revisadas</small>
          </div>
        </article>
      </div>

      {/* PANEL PRINCIPAL */}

      <div className="noc-panel">

        <div className="noc-panel-encabezado">
          <div>
            <h2>Centro de notificaciones</h2>
            <p>Consulta los avisos relacionados con tu cuenta.</p>
          </div>

          <button
            type="button"
            className="noc-marcar-todas"
            onClick={marcarTodasComoLeidas}
            disabled={noLeidas === 0}
          >
            <CheckCheck size={16} />
            Marcar todas como leídas
          </button>
        </div>

        {/* BUSQUEDA Y FILTROS */}

        <div className="noc-herramientas">
          <div className="noc-busqueda">
            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar notificación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="noc-filtros">
            {filtros.map((filtro) => (
              <button
                key={filtro}
                type="button"
                className={filtroActivo === filtro ? "activo" : ""}
                onClick={() => setFiltroActivo(filtro)}
              >
                {filtro}

                {filtro === "No leídas" && noLeidas > 0 && (
                  <span className="noc-filtro-contador">
                    {noLeidas}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA */}

        <div className="noc-lista">
          {notificacionesFiltradas.map((notificacion) => {
            const Icono = notificacion.icono;

            return (
              <article
                key={notificacion.id}
                className={`noc-notificacion ${
                  notificacion.leida ? "leida" : "no-leida"
                }`}
              >
                <div className={`noc-notificacion-icono ${notificacion.clase}`}>
                  <Icono size={21} />
                </div>

                <div className="noc-notificacion-contenido">
                  <div className="noc-notificacion-titulo">
                    <h3>{notificacion.titulo}</h3>

                    {!notificacion.leida && (
                      <span className="noc-punto-no-leido"></span>
                    )}
                  </div>

                  <p>{notificacion.descripcion}</p>

                  <div className="noc-notificacion-meta">
                    <span>{notificacion.categoria}</span>
                    <span>
                      <Clock size={13} />
                      {notificacion.fecha}
                    </span>
                  </div>
                </div>

                <div className="noc-notificacion-acciones">
                  {!notificacion.leida && (
                    <button
                      type="button"
                      title="Marcar como leída"
                      onClick={() => marcarComoLeida(notificacion.id)}
                    >
                      <CheckCircle2 size={17} />
                    </button>
                  )}

                  <button
                    type="button"
                    title="Eliminar notificación"
                    onClick={() =>
                      eliminarNotificacion(notificacion.id)
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            );
          })}

          {notificacionesFiltradas.length === 0 && (
            <div className="noc-vacio">
              <div className="noc-vacio-icono">
                <Bell size={30} />
              </div>

              <h3>
                {busqueda
                  ? "No se encontraron notificaciones"
                  : filtroActivo === "No leídas"
                    ? "No tienes notificaciones pendientes"
                    : filtroActivo === "Leídas"
                      ? "No tienes notificaciones leídas"
                      : "No tienes notificaciones"}
              </h3>

              <p>
                {busqueda
                  ? "Prueba con otro término de búsqueda."
                  : "Cuando BANUAT envíe avisos relacionados con tu cuenta, aparecerán aquí."}
              </p>
            </div>
          )}
        </div>

        <div className="noc-pie">
          <span>
            Mostrando {notificacionesFiltradas.length} notificaciones
          </span>

          <span>Centro de avisos BANUAT</span>
        </div>
      </div>

      {/* TIPOS DE NOTIFICACIONES */}

      <div className="noc-tipos">
        <div className="noc-tipos-encabezado">
          <h2>Tipos de notificaciones</h2>
          <p>Estos son algunos de los avisos que podrás recibir.</p>
        </div>

        <div className="noc-tipos-grid">
          <article>
            <div className="noc-tipo-icono naranja">
              <HandCoins size={21} />
            </div>
            <div>
              <strong>Préstamos</strong>
              <span>Solicitudes y actualizaciones.</span>
            </div>
          </article>

          <article>
            <div className="noc-tipo-icono verde">
              <CreditCard size={21} />
            </div>
            <div>
              <strong>Pagos</strong>
              <span>Avisos de pagos y vencimientos.</span>
            </div>
          </article>

          <article>
            <div className="noc-tipo-icono morado">
              <Gift size={21} />
            </div>
            <div>
              <strong>Promociones</strong>
              <span>Beneficios y ofertas disponibles.</span>
            </div>
          </article>

          <article>
            <div className="noc-tipo-icono azul">
              <UserRound size={21} />
            </div>
            <div>
              <strong>Cuenta</strong>
              <span>Información y actualizaciones.</span>
            </div>
          </article>

          <article>
            <div className="noc-tipo-icono gris">
              <FileText size={21} />
            </div>
            <div>
              <strong>Documentos</strong>
              <span>Avisos sobre documentación.</span>
            </div>
          </article>

          <article>
            <div className="noc-tipo-icono amarillo">
              <Info size={21} />
            </div>
            <div>
              <strong>Información general</strong>
              <span>Comunicados de BANUAT.</span>
            </div>
          </article>
        </div>
      </div>

      {/* INFORMACION */}

      <div className="noc-informacion">
        <div className="noc-informacion-icono">
          <CircleHelp size={22} />
        </div>

        <div>
          <strong>Información sobre tus notificaciones</strong>
          <p>
            Este apartado reúne los avisos relacionados con tus productos,
            pagos, solicitudes y beneficios. Revisa periódicamente
            las notificaciones para mantenerte informado.
          </p>
        </div>
      </div>

    </section>
  );
}
