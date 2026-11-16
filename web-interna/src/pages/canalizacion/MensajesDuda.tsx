
import { useState } from "react";
import {
  MessageCircleQuestion,
  Plus,
  Search,
  UserRound,
  Clock,
  CheckCircle2,
  MessageSquareText,
  X,
  Send,
} from "lucide-react";

import "./MensajesDuda.css";

type EstadoConsulta = "Pendiente" | "Atendida";

type Consulta = {
  id: number;
  cliente: string;
  categoria: string;
  asunto: string;
  descripcion: string;
  respuesta: string;
  fecha: string;
  estado: EstadoConsulta;
};

const categorias = [
  "Préstamos",
  "Cuentas",
  "Pagos",
  "Retiros y depósitos",
  "Productos financieros",
  "Beneficios y promociones",
  "Requisitos",
  "Otros",
];

export default function MensajesDuda() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("Todas");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [consultaSeleccionada, setConsultaSeleccionada] =
    useState<number | null>(null);

  const [nombreCliente, setNombreCliente] = useState("");
  const [categoria, setCategoria] = useState("Préstamos");
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [respuesta, setRespuesta] = useState("");

  const pendientes = consultas.filter(
    (consulta) => consulta.estado === "Pendiente"
  ).length;

  const atendidas = consultas.filter(
    (consulta) => consulta.estado === "Atendida"
  ).length;

  const consultasFiltradas = consultas.filter((consulta) => {
    const termino = busqueda.toLowerCase();

    const coincideBusqueda =
      consulta.cliente.toLowerCase().includes(termino) ||
      consulta.asunto.toLowerCase().includes(termino) ||
      consulta.categoria.toLowerCase().includes(termino);

    const coincideEstado =
      filtro === "Todas" || consulta.estado === filtro;

    return coincideBusqueda && coincideEstado;
  });

  const registrarConsulta = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nuevaConsulta: Consulta = {
      id: Date.now(),
      cliente: nombreCliente.trim(),
      categoria,
      asunto: asunto.trim(),
      descripcion: descripcion.trim(),
      respuesta: "",
      fecha: new Date().toLocaleDateString("es-MX"),
      estado: "Pendiente",
    };

    setConsultas((actuales) => [nuevaConsulta, ...actuales]);

    setNombreCliente("");
    setCategoria("Préstamos");
    setAsunto("");
    setDescripcion("");
    setModalAbierto(false);
  };

  const guardarRespuesta = (id: number) => {
    if (!respuesta.trim()) return;

    setConsultas((actuales) =>
      actuales.map((consulta) =>
        consulta.id === id
          ? {
              ...consulta,
              respuesta: respuesta.trim(),
              estado: "Atendida",
            }
          : consulta
      )
    );

    setRespuesta("");
    setConsultaSeleccionada(null);
  };

  return (
    <div className="md-container">

      {/* Encabezado */}
      <div className="md-header">
        <div>
          <span className="md-eyebrow">ATENCIÓN AL CLIENTE</span>
          <h1>Mensajes de duda</h1>
          <p>
            Registra y da seguimiento a las consultas de los clientes.
          </p>
        </div>

        <button
          className="md-primary-button"
          onClick={() => setModalAbierto(true)}
        >
          <Plus size={18} />
          Nueva consulta
        </button>
      </div>

      {/* Estadísticas */}
      <div className="md-stats">
        <div className="md-stat-card">
          <div className="md-stat-icon md-icon-blue">
            <MessageCircleQuestion size={21} />
          </div>
          <div>
            <span>Total de consultas</span>
            <strong>{consultas.length}</strong>
          </div>
        </div>

        <div className="md-stat-card">
          <div className="md-stat-icon md-icon-orange">
            <Clock size={21} />
          </div>
          <div>
            <span>Pendientes</span>
            <strong>{pendientes}</strong>
          </div>
        </div>

        <div className="md-stat-card">
          <div className="md-stat-icon md-icon-green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Atendidas</span>
            <strong>{atendidas}</strong>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="md-content-card">
        <div className="md-section-header">
          <div>
            <h2>Historial de consultas</h2>
            <p>
              Consulta las dudas registradas y su estado de atención.
            </p>
          </div>
        </div>

        <div className="md-toolbar">
          <div className="md-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente, asunto o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="Todas">Todas las consultas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Atendida">Atendidas</option>
          </select>
        </div>

        <div className="md-list">
          {consultasFiltradas.length > 0 ? (
            consultasFiltradas.map((consulta) => (
              <div className="md-consulta" key={consulta.id}>
                <div className="md-consulta-top">
                  <div className="md-consulta-user">
                    <div className="md-user-avatar">
                      <UserRound size={20} />
                    </div>

                    <div>
                      <strong>{consulta.cliente}</strong>
                      <span>{consulta.fecha}</span>
                    </div>
                  </div>

                  <span
                    className={`md-status ${
                      consulta.estado === "Atendida"
                        ? "md-status-done"
                        : "md-status-pending"
                    }`}
                  >
                    {consulta.estado === "Atendida" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                    {consulta.estado}
                  </span>
                </div>

                <div className="md-consulta-body">
                  <span className="md-category">
                    {consulta.categoria}
                  </span>

                  <h3>{consulta.asunto}</h3>
                  <p>{consulta.descripcion}</p>
                </div>

                {consulta.estado === "Atendida" ? (
                  <div className="md-answer">
                    <div className="md-answer-title">
                      <MessageSquareText size={17} />
                      <strong>Respuesta proporcionada</strong>
                    </div>
                    <p>{consulta.respuesta}</p>
                  </div>
                ) : (
                  <div className="md-consulta-actions">
                    {consultaSeleccionada === consulta.id ? (
                      <div className="md-response-box">
                        <label>Respuesta para el cliente</label>
                        <textarea
                          value={respuesta}
                          onChange={(e) => setRespuesta(e.target.value)}
                          placeholder="Escribe la respuesta proporcionada al cliente..."
                          rows={3}
                        />

                        <div className="md-response-actions">
                          <button
                            className="md-cancel-button"
                            onClick={() => {
                              setConsultaSeleccionada(null);
                              setRespuesta("");
                            }}
                          >
                            Cancelar
                          </button>

                          <button
                            className="md-primary-button"
                            onClick={() => guardarRespuesta(consulta.id)}
                            disabled={!respuesta.trim()}
                          >
                            <Send size={16} />
                            Guardar respuesta
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="md-answer-button"
                        onClick={() => {
                          setConsultaSeleccionada(consulta.id);
                          setRespuesta("");
                        }}
                      >
                        <MessageSquareText size={16} />
                        Registrar respuesta
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="md-empty">
              <MessageCircleQuestion size={35} />
              <strong>
                {busqueda || filtro !== "Todas"
                  ? "No se encontraron consultas"
                  : "Aún no hay consultas registradas"}
              </strong>
              <p>
                {busqueda || filtro !== "Todas"
                  ? "Intenta cambiar los criterios de búsqueda."
                  : "Cuando registres una duda de un cliente, aparecerá aquí."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de nueva consulta */}
      {modalAbierto && (
        <div
          className="md-modal-overlay"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="md-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md-modal-header">
              <div>
                <h2>Nueva consulta</h2>
                <p>Registra la duda que presenta el cliente.</p>
              </div>

              <button
                className="md-close-button"
                onClick={() => setModalAbierto(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={registrarConsulta}>
              <div className="md-form-group">
                <label>Nombre del cliente</label>
                <input
                  type="text"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Nombre completo del cliente"
                  required
                />
              </div>

              <div className="md-form-group">
                <label>Categoría de la consulta</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  {categorias.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md-form-group">
                <label>Asunto</label>
                <input
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Escribe el asunto de la consulta"
                  required
                />
              </div>

              <div className="md-form-group">
                <label>Descripción de la duda</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe la pregunta del cliente..."
                  rows={4}
                  required
                />
              </div>

              <div className="md-modal-footer">
                <button
                  type="button"
                  className="md-cancel-button"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="md-primary-button"
                >
                  <Plus size={17} />
                  Registrar consulta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

