import { useState, useEffect } from "react";
import {
  Gift,
  Tag,
  CalendarDays,
  Percent,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
} from "lucide-react";

import { getApiUrl } from "../../services/auth";
import "./PromocionesAdmin.css";

type SeccionPromociones =
  | "Promociones"
  | "Crear promoción"
  | "Vigencia";

type PromocionItem = {
  id: string;
  nombre: string;
  descripcion: string;
  inicio: string;
  fin: string;
  estado: "activa" | "programada" | "finalizada";
};

export default function PromocionesAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionPromociones>("Promociones");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [indicadores, setIndicadores] = useState({
    total: 0,
    activas: 0,
    programadas: 0,
    finalizadas: 0,
    beneficiosDisponibles: 0,
  });
  const [promociones, setPromociones] = useState<PromocionItem[]>([]);

  // Estados del formulario de Crear promoción
  const [nombreForm, setNombreForm] = useState("");
  const [tipoForm, setTipoForm] = useState("");
  const [descForm, setDescForm] = useState("");
  const [productoForm, setProductoForm] = useState("");
  const [valorForm, setValorForm] = useState("");
  const [requisitosForm, setRequisitosForm] = useState("");
  const [inicioForm, setInicioForm] = useState("");
  const [finForm, setFinForm] = useState("");
  const [estadoForm, setEstadoForm] = useState("activa");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const cargarPromociones = async () => {
    try {
      const res = await fetch(getApiUrl("/api/admin/promociones"));
      const data = await res.json();
      if (data && data.indicadores) {
        setIndicadores(data.indicadores);
        setPromociones(Array.isArray(data.promociones) ? data.promociones : []);
      }
    } catch (err) {
      console.error("Error al cargar promociones admin:", err);
    }
  };

  useEffect(() => {
    cargarPromociones();
  }, []);

  const secciones: {
    nombre: SeccionPromociones;
    icono: typeof Gift;
  }[] = [
    { nombre: "Promociones", icono: Gift },
    { nombre: "Crear promoción", icono: Plus },
    { nombre: "Vigencia", icono: CalendarDays },
  ];

  const cambiarSeccion = (seccion: SeccionPromociones) => {
    setSeccionActiva(seccion);
    setBusqueda("");
    setMensaje(null);
  };

  const handleGuardarPromocion = async () => {
    if (!nombreForm.trim() || !descForm.trim()) {
      setMensaje({
        tipo: "error",
        texto: "Por favor completa el nombre y la descripción de la promoción.",
      });
      return;
    }

    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetch(getApiUrl("/api/admin/promociones"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreForm.trim(),
          tipo: tipoForm,
          descripcion: descForm.trim(),
          productoRelacionado: productoForm,
          valorBeneficio: valorForm,
          requisitos: requisitosForm.trim(),
          fechaInicio: inicioForm,
          fechaFin: finForm,
          estadoInicial: estadoForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensaje({ tipo: "error", texto: data.error || "Error al guardar promoción." });
      } else {
        setMensaje({
          tipo: "ok",
          texto: `Promoción "${nombreForm}" registrada exitosamente.`,
        });
        setNombreForm("");
        setTipoForm("");
        setDescForm("");
        setProductoForm("");
        setValorForm("");
        setRequisitosForm("");
        setInicioForm("");
        setFinForm("");
        await cargarPromociones();
      }
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión con el servidor." });
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstadoPromo = async (id: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/promociones/${id}/estado`), {
        method: "PATCH",
      });
      if (res.ok) {
        await cargarPromociones();
      }
    } catch (err) {
      console.error("Error al cambiar estado de promoción:", err);
    }
  };

  const obtenerDescripcion = () => {
    switch (seccionActiva) {
      case "Promociones":
        return "Consulta y administra las promociones disponibles en BANUAT.";

      case "Crear promoción":
        return "Define los beneficios y condiciones de una nueva promoción.";

      case "Vigencia":
        return "Consulta los periodos de aplicación de las promociones.";

      default:
        return "";
    }
  };

  const promocionesFiltradas = promociones.filter((p) => {
    const q = busqueda.toLowerCase();
    const coincideTexto =
      !q ||
      p.nombre.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q);
    const coincideEstado =
      filtroEstado === "todos" || p.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  const renderizarContenido = () => {
    switch (seccionActiva) {
      case "Promociones":
        return (
          <section className="pra-contenido">
            <div className="pra-panel-header">
              <div>
                <h3>Promociones registradas</h3>
                <p>
                  Administra los beneficios y promociones de los productos
                  financieros.
                </p>
              </div>

              <button
                className="pra-btn-principal"
                onClick={() => cambiarSeccion("Crear promoción")}
              >
                <Plus size={17} />
                Nueva promoción
              </button>
            </div>

            <div className="pra-filtros">
              <div className="pra-busqueda">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Buscar promoción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="pra-filtro-estado">
                <span>Estado:</span>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="activa">Activas</option>
                  <option value="programada">Programadas</option>
                  <option value="finalizada">Finalizadas</option>
                </select>
              </div>
            </div>

            {promocionesFiltradas.length === 0 ? (
              <div className="pra-empty">
                <div className="pra-empty-icon">
                  <Gift size={30} />
                </div>
                <h4>No hay promociones registradas</h4>
                <p>
                  Las promociones que registres aparecerán aquí para que puedas
                  consultar y administrar sus condiciones.
                </p>

                <button
                  className="pra-btn-secundario"
                  onClick={() => cambiarSeccion("Crear promoción")}
                >
                  <Plus size={16} />
                  Crear primera promoción
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                {promocionesFiltradas.map((promo) => (
                  <div
                    key={promo.id}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid #ece5db",
                      background: "#ffffff",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "0.96rem", color: "#231f1b" }}>
                        {promo.nombre}
                      </strong>
                      <p style={{ margin: "3px 0 0", fontSize: "0.84rem", color: "#686057" }}>
                        {promo.descripcion}
                      </p>
                      <small style={{ color: "#8c8277" }}>
                        Vigencia: {promo.inicio} al {promo.fin}
                      </small>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          backgroundColor:
                            promo.estado === "activa"
                              ? "#dcfce7"
                              : promo.estado === "programada"
                              ? "#dbeafe"
                              : "#f3f4f6",
                          color:
                            promo.estado === "activa"
                              ? "#15803d"
                              : promo.estado === "programada"
                              ? "#1d4ed8"
                              : "#4b5563",
                        }}
                      >
                        {promo.estado}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleEstadoPromo(promo.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #d6cfc7",
                          background: "#faf8f5",
                          color: "#4a433c",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        {promo.estado === "activa" ? "Finalizar" : "Activar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      case "Crear promoción":
        return (
          <section className="pra-contenido">
            <div className="pra-panel-header">
              <div>
                <h3>Registrar promoción</h3>
                <p>
                  Configura los datos generales y beneficios de la promoción.
                </p>
              </div>
            </div>

            {mensaje && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  marginBottom: "14px",
                  backgroundColor: mensaje.tipo === "ok" ? "#dcfce7" : "#fee2e2",
                  color: mensaje.tipo === "ok" ? "#166534" : "#991b1b",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                }}
              >
                {mensaje.texto}
              </div>
            )}

            <div className="pra-formulario">
              <div className="pra-form-seccion">
                <div className="pra-form-titulo">
                  <Tag size={19} />
                  <div>
                    <h4>Información general</h4>
                    <p>Datos para identificar la promoción.</p>
                  </div>
                </div>

                <div className="pra-form-grid">
                  <div className="pra-campo">
                    <label>Nombre de la promoción</label>
                    <input
                      type="text"
                      placeholder="Ej. Beneficio de temporada"
                      value={nombreForm}
                      onChange={(e) => setNombreForm(e.target.value)}
                    />
                  </div>

                  <div className="pra-campo">
                    <label>Tipo de promoción</label>
                    <select
                      value={tipoForm}
                      onChange={(e) => setTipoForm(e.target.value)}
                    >
                      <option value="" disabled>
                        Seleccionar tipo
                      </option>
                      <option value="tasa">Reducción de tasa</option>
                      <option value="descuento">Descuento</option>
                      <option value="puntos">Puntos adicionales</option>
                      <option value="producto">Beneficio en producto</option>
                      <option value="otro">Otro beneficio</option>
                    </select>
                  </div>

                  <div className="pra-campo pra-campo-completo">
                    <label>Descripción</label>
                    <textarea
                      rows={3}
                      placeholder="Describe en qué consiste la promoción..."
                      value={descForm}
                      onChange={(e) => setDescForm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pra-form-seccion">
                <div className="pra-form-titulo">
                  <Sparkles size={19} />
                  <div>
                    <h4>Beneficio y condiciones</h4>
                    <p>
                      Establece qué recibirá el cliente y bajo qué condiciones.
                    </p>
                  </div>
                </div>

                <div className="pra-form-grid">
                  <div className="pra-campo">
                    <label>Producto relacionado</label>
                    <select
                      value={productoForm}
                      onChange={(e) => setProductoForm(e.target.value)}
                    >
                      <option value="" disabled>
                        Seleccionar producto
                      </option>
                      <option value="credito">Producto de crédito</option>
                      <option value="ahorro">Producto de ahorro</option>
                      <option value="servicio">Servicio</option>
                      <option value="general">Todos los productos</option>
                    </select>
                  </div>

                  <div className="pra-campo">
                    <label>Valor del beneficio</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ingresar valor"
                      value={valorForm}
                      onChange={(e) => setValorForm(e.target.value)}
                    />
                  </div>

                  <div className="pra-campo pra-campo-completo">
                    <label>Requisitos para participar</label>
                    <textarea
                      rows={3}
                      placeholder="Describe los requisitos que deberá cumplir el cliente..."
                      value={requisitosForm}
                      onChange={(e) => setRequisitosForm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pra-form-seccion">
                <div className="pra-form-titulo">
                  <CalendarDays size={19} />
                  <div>
                    <h4>Periodo de aplicación</h4>
                    <p>
                      Define cuándo comenzará y cuándo finalizará la promoción.
                    </p>
                  </div>
                </div>

                <div className="pra-form-grid">
                  <div className="pra-campo">
                    <label>Fecha de inicio</label>
                    <input
                      type="date"
                      value={inicioForm}
                      onChange={(e) => setInicioForm(e.target.value)}
                    />
                  </div>

                  <div className="pra-campo">
                    <label>Fecha de finalización</label>
                    <input
                      type="date"
                      value={finForm}
                      onChange={(e) => setFinForm(e.target.value)}
                    />
                  </div>

                  <div className="pra-campo pra-campo-completo">
                    <label>Estado inicial</label>
                    <select
                      value={estadoForm}
                      onChange={(e) => setEstadoForm(e.target.value)}
                    >
                      <option value="programada">Programada</option>
                      <option value="activa">Activa</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pra-form-acciones">
                <button
                  type="button"
                  className="pra-btn-cancelar"
                  onClick={() => cambiarSeccion("Promociones")}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="pra-btn-principal"
                  disabled={guardando}
                  onClick={handleGuardarPromocion}
                >
                  <Plus size={17} />
                  {guardando ? "Guardando..." : "Guardar promoción"}
                </button>
              </div>
            </div>
          </section>
        );

      case "Vigencia":
        return (
          <section className="pra-contenido">
            <div className="pra-panel-header">
              <div>
                <h3>Vigencia de promociones</h3>
                <p>
                  Consulta los periodos de aplicación y el estado de cada
                  promoción.
                </p>
              </div>
            </div>

            <div className="pra-vigencia-resumen">
              <article>
                <div className="pra-vigencia-icon verde">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span>Activas</span>
                  <strong>{indicadores.activas}</strong>
                </div>
              </article>

              <article>
                <div className="pra-vigencia-icon azul">
                  <Clock size={20} />
                </div>
                <div>
                  <span>Programadas</span>
                  <strong>{indicadores.programadas}</strong>
                </div>
              </article>

              <article>
                <div className="pra-vigencia-icon gris">
                  <XCircle size={20} />
                </div>
                <div>
                  <span>Finalizadas</span>
                  <strong>{indicadores.finalizadas}</strong>
                </div>
              </article>
            </div>

            {promociones.length === 0 ? (
              <div className="pra-empty">
                <div className="pra-empty-icon">
                  <CalendarDays size={30} />
                </div>
                <h4>No hay periodos registrados</h4>
                <p>
                  Cuando existan promociones, podrás consultar aquí sus fechas
                  de inicio, finalización y estado.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                {promociones.map((promo) => (
                  <div
                    key={promo.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "13px 16px",
                      borderRadius: "12px",
                      border: "1px solid #ece5db",
                      background: "#ffffff",
                    }}
                  >
                    <div>
                      <strong>{promo.nombre}</strong>
                      <div style={{ fontSize: "0.82rem", color: "#686057", marginTop: "2px" }}>
                        Inicio: {promo.inicio} · Fin: {promo.fin}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        textTransform: "capitalize",
                        backgroundColor: promo.estado === "activa" ? "#dcfce7" : "#dbeafe",
                        color: promo.estado === "activa" ? "#15803d" : "#1d4ed8",
                      }}
                    >
                      {promo.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
    }
  };

  return (
    <div className="pra-page">
      <div className="pra-encabezado">
        <div>
          <span className="pra-superior">ADMINISTRACIÓN GENERAL</span>
          <h2>Promociones</h2>
          <p>
            Gestiona beneficios, descuentos y promociones para los clientes
            de BANUAT.
          </p>
        </div>

        <div className="pra-encabezado-icon">
          <Gift size={27} />
        </div>
      </div>

      <div className="pra-indicadores">
        <article className="pra-indicador">
          <div className="pra-indicador-icon naranja">
            <Gift size={21} />
          </div>
          <div>
            <span>Total promociones</span>
            <strong>{indicadores.total}</strong>
          </div>
        </article>

        <article className="pra-indicador">
          <div className="pra-indicador-icon verde">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Promociones activas</span>
            <strong>{indicadores.activas}</strong>
          </div>
        </article>

        <article className="pra-indicador">
          <div className="pra-indicador-icon azul">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Programadas</span>
            <strong>{indicadores.programadas}</strong>
          </div>
        </article>

        <article className="pra-indicador">
          <div className="pra-indicador-icon morado">
            <Percent size={21} />
          </div>
          <div>
            <span>Beneficios disponibles</span>
            <strong>{indicadores.beneficiosDisponibles}</strong>
          </div>
        </article>
      </div>

      <div className="pra-secciones">
        {secciones.map(({ nombre, icono: Icono }) => (
          <button
            key={nombre}
            className={`pra-tab ${
              seccionActiva === nombre ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion(nombre)}
          >
            <Icono size={18} />
            {nombre}
          </button>
        ))}
      </div>

      <div className="pra-descripcion">
        <div>
          <h3>{seccionActiva}</h3>
          <p>{obtenerDescripcion()}</p>
        </div>

        <div className="pra-descripcion-icon">
          {seccionActiva === "Promociones" && <Gift size={22} />}
          {seccionActiva === "Crear promoción" && <Plus size={22} />}
          {seccionActiva === "Vigencia" && <Clock size={22} />}
        </div>
      </div>

      {renderizarContenido()}

      <div className="pra-nota">
        <Info size={18} />
        <p>
          Las promociones podrán comunicarse a los clientes y mostrarse en sus
          respectivos módulos una vez que estén registradas y habilitadas.
          Su configuración no modifica automáticamente las condiciones de los
          productos financieros.
        </p>
      </div>
    </div>
  );
}
