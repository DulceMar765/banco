
import { useState, useEffect } from "react";
import {
  MessageCircle,
  CalendarDays,
  Clock,
  Send,
  Search,
  Plus,
  Headset,
  FileText,
  CheckCircle2,
  ChevronRight,
  X,
  MapPin,
  MessagesSquare,
  CalendarCheck,
} from "lucide-react";

import "./AtencionCliente.css";

type Pestaña = "mensajes" | "citas" | "historial";

type Consulta = {
  id: number;
  asunto: string;
  categoria: string;
  mensaje: string;
  fecha: string;
  estado: "Pendiente" | "En atención" | "Resuelta";
};

type Cita = {
  id: number;
  motivo: string;
  fecha: string;
  hora: string;
  estado: "Pendiente" | "Confirmada" | "Atendida" | "Cancelada";
};

function AtencionCliente() {
  const [pestana, setPestana] = useState<Pestaña>("mensajes");

  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);

  useEffect(() => {
    setConsultas([
      {
        id: 1,
        asunto: "Atención Institucional BANUAT",
        categoria: "Ahorro e Inversión",
        mensaje: "Estimado socio, ponemos a su disposición nuestros canales de atención en sucursal y turnos digitales con prioridad ponderada.",
        fecha: new Date().toLocaleDateString("es-MX"),
        estado: "Resuelta",
      },
    ]);
  }, []);

  const [mostrarConsulta, setMostrarConsulta] = useState(false);
  const [mostrarCita, setMostrarCita] = useState(false);

  const [busqueda, setBusqueda] = useState("");

  const [asunto, setAsunto] = useState("");
  const [categoria, setCategoria] = useState("Préstamos");
  const [mensaje, setMensaje] = useState("");

  const [motivoCita, setMotivoCita] = useState("");
  const [fechaCita, setFechaCita] = useState("");
  const [horaCita, setHoraCita] = useState("");

  const registrarConsulta = () => {
    if (!asunto.trim() || !mensaje.trim()) return;

    const nuevaConsulta: Consulta = {
      id: Date.now(),
      asunto,
      categoria,
      mensaje,
      fecha: new Date().toLocaleDateString("es-MX"),
      estado: "Pendiente",
    };

    setConsultas((actuales) => [nuevaConsulta, ...actuales]);

    setAsunto("");
    setMensaje("");
    setCategoria("Préstamos");
    setMostrarConsulta(false);
  };

  const registrarCita = () => {
    if (!motivoCita || !fechaCita || !horaCita) return;

    const nuevaCita: Cita = {
      id: Date.now(),
      motivo: motivoCita,
      fecha: fechaCita,
      hora: horaCita,
      estado: "Pendiente",
    };

    setCitas((actuales) => [nuevaCita, ...actuales]);

    setMotivoCita("");
    setFechaCita("");
    setHoraCita("");
    setMostrarCita(false);
  };

  const consultasFiltradas = consultas.filter((consulta) =>
    `${consulta.asunto} ${consulta.categoria}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const citasFiltradas = citas.filter((cita) =>
    cita.motivo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalAtenciones = consultas.length + citas.length;

  const pendientes =
    consultas.filter((c) => c.estado === "Pendiente").length +
    citas.filter((c) => c.estado === "Pendiente").length;

  const resueltas = consultas.filter(
    (c) => c.estado === "Resuelta"
  ).length;

  return (
    <section className="atc-contenedor">

      {/* ENCABEZADO */}
      <div className="atc-encabezado">
        <div>
          <span className="atc-etiqueta">BANUAT / SERVICIO</span>
          <h1>Atención al cliente</h1>
          <p>
            Estamos aquí para ayudarte. Consulta tus dudas o solicita
            atención personalizada.
          </p>
        </div>

        <div className="atc-icono-encabezado">
          <Headset size={32} />
        </div>
      </div>

      {/* RESUMEN */}
      <div className="atc-resumen">

        <div className="atc-tarjeta-resumen">
          <div className="atc-resumen-icono naranja">
            <MessagesSquare size={21} />
          </div>
          <div>
            <span>Atenciones registradas</span>
            <strong>{totalAtenciones}</strong>
          </div>
        </div>

        <div className="atc-tarjeta-resumen">
          <div className="atc-resumen-icono amarillo">
            <Clock size={21} />
          </div>
          <div>
            <span>Pendientes</span>
            <strong>{pendientes}</strong>
          </div>
        </div>

        <div className="atc-tarjeta-resumen">
          <div className="atc-resumen-icono verde">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Consultas resueltas</span>
            <strong>{resueltas}</strong>
          </div>
        </div>

      </div>

      {/* PESTAÑAS */}
      <div className="atc-pestanas">

        <button
          className={pestana === "mensajes" ? "activa" : ""}
          onClick={() => {
            setPestana("mensajes");
            setBusqueda("");
          }}
        >
          <MessageCircle size={18} />
          Mensajes
        </button>

        <button
          className={pestana === "citas" ? "activa" : ""}
          onClick={() => {
            setPestana("citas");
            setBusqueda("");
          }}
        >
          <CalendarDays size={18} />
          Mis citas
        </button>

        <button
          className={pestana === "historial" ? "activa" : ""}
          onClick={() => {
            setPestana("historial");
            setBusqueda("");
          }}
        >
          <FileText size={18} />
          Historial
        </button>

      </div>

      {/* CONTENIDO */}
      <div className="atc-contenido">

        {/* MENSAJES */}
        {pestana === "mensajes" && (
          <>
            <div className="atc-seccion-encabezado">
              <div>
                <h2>Mis consultas</h2>
                <p>
                  Envía tus dudas y recibe atención del personal BANUAT.
                </p>
              </div>

              <button
                className="atc-boton-principal"
                onClick={() => setMostrarConsulta(true)}
              >
                <Plus size={18} />
                Nueva consulta
              </button>
            </div>

            <div className="atc-busqueda">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar consulta..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {consultasFiltradas.length > 0 ? (
              <div className="atc-lista">
                {consultasFiltradas.map((consulta) => (
                  <div className="atc-item" key={consulta.id}>
                    <div className="atc-item-icono">
                      <MessageCircle size={21} />
                    </div>

                    <div className="atc-item-info">
                      <div className="atc-item-titulo">
                        <h3>{consulta.asunto}</h3>
                        <span
                          className={`atc-estado ${consulta.estado
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {consulta.estado}
                        </span>
                      </div>

                      <p>{consulta.mensaje}</p>

                      <div className="atc-item-detalles">
                        <span>{consulta.categoria}</span>
                        <span>{consulta.fecha}</span>
                      </div>
                    </div>

                    <ChevronRight size={19} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="atc-vacio">
                <div className="atc-vacio-icono">
                  <MessageCircle size={32} />
                </div>
                <h3>No tienes consultas registradas</h3>
                <p>
                  Cuando envíes una consulta, podrás revisar aquí su
                  estado y seguimiento.
                </p>
                <button
                  className="atc-boton-secundario"
                  onClick={() => setMostrarConsulta(true)}
                >
                  <Plus size={17} />
                  Crear consulta
                </button>
              </div>
            )}
          </>
        )}

        {/* CITAS */}
        {pestana === "citas" && (
          <>
            <div className="atc-seccion-encabezado">
              <div>
                <h2>Mis citas</h2>
                <p>
                  Solicita una visita presencial a nuestras instalaciones.
                </p>
              </div>

              <button
                className="atc-boton-principal"
                onClick={() => setMostrarCita(true)}
              >
                <Plus size={18} />
                Solicitar cita
              </button>
            </div>

            <div className="atc-aviso-citas">
              <CalendarCheck size={22} />
              <div>
                <strong>Atención presencial</strong>
                <p>
                  Tu solicitud quedará pendiente hasta que el personal
                  confirme la cita.
                </p>
              </div>
            </div>

            {citasFiltradas.length > 0 ? (
              <div className="atc-lista">
                {citasFiltradas.map((cita) => (
                  <div className="atc-cita-item" key={cita.id}>
                    <div className="atc-fecha-cita">
                      <CalendarDays size={23} />
                    </div>

                    <div className="atc-cita-info">
                      <h3>{cita.motivo}</h3>
                      <p>
                        <CalendarDays size={15} />
                        {cita.fecha}
                        <Clock size={15} />
                        {cita.hora}
                      </p>
                    </div>

                    <span
                      className={`atc-estado ${cita.estado.toLowerCase()}`}
                    >
                      {cita.estado}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="atc-vacio">
                <div className="atc-vacio-icono">
                  <CalendarDays size={32} />
                </div>
                <h3>No tienes citas programadas</h3>
                <p>
                  Solicita una cita si necesitas acudir personalmente
                  a la cooperativa.
                </p>
                <button
                  className="atc-boton-secundario"
                  onClick={() => setMostrarCita(true)}
                >
                  <Plus size={17} />
                  Solicitar cita
                </button>
              </div>
            )}
          </>
        )}

        {/* HISTORIAL */}
        {pestana === "historial" && (
          <>
            <div className="atc-seccion-encabezado">
              <div>
                <h2>Historial de atención</h2>
                <p>
                  Consulta tus solicitudes y visitas registradas.
                </p>
              </div>
            </div>

            <div className="atc-busqueda">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar en tu historial..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {consultas.length + citas.length > 0 ? (
              <div className="atc-lista">

                {consultas
                  .filter((c) =>
                    `${c.asunto} ${c.categoria}`
                      .toLowerCase()
                      .includes(busqueda.toLowerCase())
                  )
                  .map((consulta) => (
                    <div className="atc-item" key={`consulta-${consulta.id}`}>
                      <div className="atc-item-icono">
                        <MessageCircle size={21} />
                      </div>
                      <div className="atc-item-info">
                        <div className="atc-item-titulo">
                          <h3>{consulta.asunto}</h3>
                          <span className={`atc-estado ${consulta.estado
                            .toLowerCase()
                            .replace(" ", "-")}`}>
                            {consulta.estado}
                          </span>
                        </div>
                        <p>Atención por mensaje · {consulta.categoria}</p>
                        <div className="atc-item-detalles">
                          <span>{consulta.fecha}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                {citas
                  .filter((c) =>
                    c.motivo.toLowerCase().includes(busqueda.toLowerCase())
                  )
                  .map((cita) => (
                    <div className="atc-item" key={`cita-${cita.id}`}>
                      <div className="atc-item-icono">
                        <CalendarDays size={21} />
                      </div>
                      <div className="atc-item-info">
                        <div className="atc-item-titulo">
                          <h3>{cita.motivo}</h3>
                          <span className={`atc-estado ${cita.estado.toLowerCase()}`}>
                            {cita.estado}
                          </span>
                        </div>
                        <p>Atención presencial · {cita.fecha} · {cita.hora}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="atc-vacio">
                <div className="atc-vacio-icono">
                  <FileText size={32} />
                </div>
                <h3>Tu historial está vacío</h3>
                <p>
                  Aquí aparecerán tus consultas y citas anteriores.
                </p>
              </div>
            )}
          </>
        )}

      </div>

      {/* MODAL NUEVA CONSULTA */}
      {mostrarConsulta && (
        <div className="atc-modal-fondo">
          <div className="atc-modal">
            <div className="atc-modal-encabezado">
              <div>
                <span>NUEVA SOLICITUD</span>
                <h2>Enviar consulta</h2>
              </div>
              <button onClick={() => setMostrarConsulta(false)}>
                <X size={21} />
              </button>
            </div>

            <div className="atc-formulario">
              <label>Motivo de consulta</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option>Préstamos</option>
                <option>Pagos</option>
                <option>Cuenta</option>
                <option>Productos financieros</option>
                <option>Beneficios y promociones</option>
                <option>Documentación</option>
                <option>Otro</option>
              </select>

              <label>Asunto</label>
              <input
                type="text"
                placeholder="Escribe el asunto de tu consulta"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
              />

              <label>Describe tu duda</label>
              <textarea
                placeholder="Escribe aquí tu consulta..."
                rows={5}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />

              <div className="atc-modal-acciones">
                <button
                  className="atc-boton-cancelar"
                  onClick={() => setMostrarConsulta(false)}
                >
                  Cancelar
                </button>
                <button
                  className="atc-boton-principal"
                  onClick={registrarConsulta}
                  disabled={!asunto.trim() || !mensaje.trim()}
                >
                  <Send size={17} />
                  Enviar consulta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA CITA */}
      {mostrarCita && (
        <div className="atc-modal-fondo">
          <div className="atc-modal">
            <div className="atc-modal-encabezado">
              <div>
                <span>ATENCIÓN PRESENCIAL</span>
                <h2>Solicitar una cita</h2>
              </div>
              <button onClick={() => setMostrarCita(false)}>
                <X size={21} />
              </button>
            </div>

            <div className="atc-formulario">
              <label>Motivo de la visita</label>
              <select
                value={motivoCita}
                onChange={(e) => setMotivoCita(e.target.value)}
              >
                <option value="">Selecciona un motivo</option>
                <option>Información sobre préstamos</option>
                <option>Asesoría financiera</option>
                <option>Información sobre productos</option>
                <option>Actualización de datos</option>
                <option>Entrega de documentación</option>
                <option>Otro</option>
              </select>

              <label>Fecha solicitada</label>
              <input
                type="date"
                value={fechaCita}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFechaCita(e.target.value)}
              />

              <label>Horario solicitado</label>
              <input
                type="time"
                value={horaCita}
                onChange={(e) => setHoraCita(e.target.value)}
              />

              <div className="atc-aviso-formulario">
                <MapPin size={17} />
                <span>
                  La cita estará sujeta a confirmación por parte del personal.
                </span>
              </div>

              <div className="atc-modal-acciones">
                <button
                  className="atc-boton-cancelar"
                  onClick={() => setMostrarCita(false)}
                >
                  Cancelar
                </button>
                <button
                  className="atc-boton-principal"
                  onClick={registrarCita}
                  disabled={!motivoCita || !fechaCita || !horaCita}
                >
                  <CalendarCheck size={17} />
                  Solicitar cita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

export default AtencionCliente;
