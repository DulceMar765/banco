import { useState, useEffect } from "react";
import {
  Package,
  HandCoins,
  PiggyBank,
  Plus,
  Search,
  Filter,
  Settings2,
  Percent,
  CalendarDays,
  FileText,
  ShieldCheck,
  CircleDollarSign,
} from "lucide-react";

import { getApiUrl } from "../../services/auth";
import "./ProductosAdmin.css";

type SeccionProductos =
  | "Productos"
  | "Registro"
  | "Condiciones";

type ProductoItem = {
  id: string;
  codigo: string;
  nombre: string;
  tipo: "Ahorro" | "Crédito" | "Servicios";
  descripcion: string;
  montoMinimo: number;
  montoMaximo: number;
  tasaInteres: number;
  plazo: string;
  estado: "Activo" | "Inactivo";
};

function ProductosAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionProductos>("Productos");

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  const [resumen, setResumen] = useState({
    total: 0,
    activos: 0,
    credito: 0,
    ahorro: 0,
  });
  const [productos, setProductos] = useState<ProductoItem[]>([]);

  // Estados del formulario de registro de producto
  const [nombreForm, setNombreForm] = useState("");
  const [tipoForm, setTipoForm] = useState("");
  const [descripcionForm, setDescripcionForm] = useState("");
  const [montoMinForm, setMontoMinForm] = useState("");
  const [montoMaxForm, setMontoMaxForm] = useState("");
  const [tasaForm, setTasaForm] = useState("");
  const [plazoForm, setPlazoForm] = useState("");
  const [estadoForm, setEstadoForm] = useState("Activo");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const cargarProductos = async () => {
    try {
      const res = await fetch(getApiUrl("/api/admin/productos"));
      const data = await res.json();
      if (data && data.resumen) {
        setResumen(data.resumen);
        setProductos(Array.isArray(data.productos) ? data.productos : []);
      }
    } catch (err) {
      console.error("Error al cargar productos admin:", err);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const cambiarSeccion = (seccion: SeccionProductos) => {
    setSeccionActiva(seccion);
    setBusqueda("");
    setFiltroTipo("Todos");
    setMensaje(null);
  };

  const handleGuardarProducto = async () => {
    if (!nombreForm.trim() || !tipoForm) {
      setMensaje({
        tipo: "error",
        texto: "Por favor completa el nombre y selecciona el tipo de producto.",
      });
      return;
    }

    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetch(getApiUrl("/api/admin/productos"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreForm.trim(),
          tipo: tipoForm,
          descripcion: descripcionForm.trim(),
          montoMinimo: montoMinForm ? Number(montoMinForm) : 500,
          montoMaximo: montoMaxForm ? Number(montoMaxForm) : 100000,
          tasaInteres: tasaForm ? Number(tasaForm) : 5.0,
          plazo: plazoForm || "Anual",
          estado: estadoForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensaje({ tipo: "error", texto: data.error || "Error al guardar producto." });
      } else {
        setMensaje({
          tipo: "ok",
          texto: `Producto "${nombreForm}" guardado exitosamente en el catálogo de BANUAT.`,
        });
        setNombreForm("");
        setTipoForm("");
        setDescripcionForm("");
        setMontoMinForm("");
        setMontoMaxForm("");
        setTasaForm("");
        setPlazoForm("");
        setEstadoForm("Activo");
        await cargarProductos();
      }
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión con el servidor." });
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstadoProducto = async (id: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/productos/${id}/estado`), {
        method: "PATCH",
      });
      if (res.ok) {
        await cargarProductos();
      }
    } catch (err) {
      console.error("Error al alternar estado de producto:", err);
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const q = busqueda.toLowerCase();
    const coincideTexto =
      !q ||
      p.nombre.toLowerCase().includes(q) ||
      p.codigo.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q);
    const coincideTipo = filtroTipo === "Todos" || p.tipo === filtroTipo;
    return coincideTexto && coincideTipo;
  });

  return (
    <div className="pad-container">

      {/* ENCABEZADO */}
      <div className="pad-heading">
        <div>
          <span className="pad-eyebrow">
            ADMINISTRACIÓN FINANCIERA
          </span>

          <h2>Productos financieros</h2>

          <p>
            Administra los productos y servicios financieros
            disponibles en BANUAT.
          </p>
        </div>
      </div>

      {/* INDICADORES */}
      <section className="pad-stats">

        <article className="pad-stat-card">
          <div className="pad-stat-icon orange">
            <Package size={21} />
          </div>

          <div>
            <span>Total de productos</span>
            <strong>{resumen.total}</strong>
          </div>
        </article>

        <article className="pad-stat-card">
          <div className="pad-stat-icon green">
            <ShieldCheck size={21} />
          </div>

          <div>
            <span>Productos activos</span>
            <strong>{resumen.activos}</strong>
          </div>
        </article>

        <article className="pad-stat-card">
          <div className="pad-stat-icon blue">
            <HandCoins size={21} />
          </div>

          <div>
            <span>Productos de crédito</span>
            <strong>{resumen.credito}</strong>
          </div>
        </article>

        <article className="pad-stat-card">
          <div className="pad-stat-icon brown">
            <PiggyBank size={21} />
          </div>

          <div>
            <span>Productos de ahorro</span>
            <strong>{resumen.ahorro}</strong>
          </div>
        </article>

      </section>

      {/* SECCIÓN PRINCIPAL */}
      <section className="pad-section">

        {/* PESTAÑAS */}
        <div className="pad-tabs">

          <button
            type="button"
            className={seccionActiva === "Productos" ? "active" : ""}
            onClick={() => cambiarSeccion("Productos")}
          >
            <Package size={17} />
            Productos
          </button>

          <button
            type="button"
            className={seccionActiva === "Registro" ? "active" : ""}
            onClick={() => cambiarSeccion("Registro")}
          >
            <Plus size={17} />
            Registrar producto
          </button>

          <button
            type="button"
            className={seccionActiva === "Condiciones" ? "active" : ""}
            onClick={() => cambiarSeccion("Condiciones")}
          >
            <Settings2 size={17} />
            Condiciones
          </button>

        </div>

        <div className="pad-content">

          {/* PRODUCTOS */}
          {seccionActiva === "Productos" && (
            <>
              <div className="pad-content-heading">
                <div>
                  <h3>Catálogo de productos</h3>

                  <p>
                    Consulta y administra los productos financieros
                    de la cooperativa.
                  </p>
                </div>
              </div>

              <div className="pad-toolbar">

                <div className="pad-search">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="pad-filter">
                  <Filter size={17} />

                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <option value="Todos">Todos los tipos</option>
                    <option value="Ahorro">Ahorro</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Servicios">Servicios</option>
                  </select>
                </div>

              </div>

              {productosFiltrados.length === 0 ? (
                <div className="pad-empty-state">
                  <div className="pad-empty-icon orange">
                    <Package size={27} />
                  </div>

                  <h4>No hay productos registrados</h4>

                  <p>
                    Cuando se agreguen productos financieros,
                    aparecerán aquí para su consulta y administración.
                  </p>

                  <button
                    type="button"
                    className="pad-primary-button"
                    onClick={() => cambiarSeccion("Registro")}
                  >
                    <Plus size={16} />
                    Registrar producto
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                  {productosFiltrados.map((prod) => (
                    <div
                      key={prod.id}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        padding: "14px 16px",
                        borderRadius: "14px",
                        border: "1px solid #e9e2d8",
                        background: "#ffffff",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "0.96rem", color: "#231f1b" }}>
                          {prod.nombre} · <span style={{ color: "#9a6b3b" }}>{prod.codigo}</span>
                        </strong>
                        <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "#686057" }}>
                          Tipo: <strong>{prod.tipo}</strong> · Tasa: {prod.tasaInteres.toFixed(2)}% anual · Monto: ${prod.montoMinimo.toLocaleString("es-MX")} – ${prod.montoMaximo.toLocaleString("es-MX")} MXN · Plazo: {prod.plazo}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            backgroundColor: prod.estado === "Activo" ? "#dcfce7" : "#f3f4f6",
                            color: prod.estado === "Activo" ? "#15803d" : "#4b5563",
                          }}
                        >
                          {prod.estado}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleEstadoProducto(prod.id)}
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
                          {prod.estado === "Activo" ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* REGISTRO */}
          {seccionActiva === "Registro" && (
            <>
              <div className="pad-content-heading">
                <div>
                  <h3>Registrar producto</h3>

                  <p>
                    Define la información general del nuevo
                    producto financiero.
                  </p>
                </div>
              </div>

              <div className="pad-registration">

                <div className="pad-registration-notice">
                  <div className="pad-notice-icon">
                    <FileText size={19} />
                  </div>

                  <div>
                    <strong>Información del producto</strong>

                    <p>
                      Completa las características generales
                      y las condiciones que tendrá el producto.
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

                <div className="pad-fields">

                  <div className="pad-field">
                    <label>Nombre del producto</label>

                    <input
                      type="text"
                      placeholder="Nombre del producto"
                      value={nombreForm}
                      onChange={(e) => setNombreForm(e.target.value)}
                    />
                  </div>

                  <div className="pad-field">
                    <label>Tipo de producto</label>

                    <select
                      value={tipoForm}
                      onChange={(e) => setTipoForm(e.target.value)}
                    >
                      <option value="" disabled>
                        Seleccionar tipo
                      </option>

                      <option value="Ahorro">Ahorro</option>
                      <option value="Crédito">Crédito</option>
                      <option value="Servicios">Servicios</option>
                    </select>
                  </div>

                  <div className="pad-field pad-field-full">
                    <label>Descripción</label>

                    <textarea
                      placeholder="Describe las características del producto..."
                      rows={3}
                      value={descripcionForm}
                      onChange={(e) => setDescripcionForm(e.target.value)}
                    />
                  </div>

                  <div className="pad-field">
                    <label>Monto mínimo</label>

                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={montoMinForm}
                      onChange={(e) => setMontoMinForm(e.target.value)}
                    />
                  </div>

                  <div className="pad-field">
                    <label>Monto máximo</label>

                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={montoMaxForm}
                      onChange={(e) => setMontoMaxForm(e.target.value)}
                    />
                  </div>

                  <div className="pad-field">
                    <label>Tasa de interés (%)</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={tasaForm}
                      onChange={(e) => setTasaForm(e.target.value)}
                    />
                  </div>

                  <div className="pad-field">
                    <label>Plazo</label>

                    <select
                      value={plazoForm}
                      onChange={(e) => setPlazoForm(e.target.value)}
                    >
                      <option value="" disabled>
                        Seleccionar plazo
                      </option>

                      <option value="Mensual">Mensual</option>
                      <option value="Semestral">Semestral</option>
                      <option value="Anual">Anual</option>
                      <option value="Variable">Variable</option>
                    </select>
                  </div>

                  <div className="pad-field">
                    <label>Estado del producto</label>

                    <select
                      value={estadoForm}
                      onChange={(e) => setEstadoForm(e.target.value)}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>

                </div>

                <div className="pad-registration-footer">
                  <p>
                    El producto quedará almacenado en MySQL y disponible para originación.
                  </p>

                  <button
                    type="button"
                    className="pad-primary-button"
                    disabled={guardando}
                    onClick={handleGuardarProducto}
                  >
                    <Plus size={16} />
                    {guardando ? "Guardando..." : "Guardar producto"}
                  </button>
                </div>

              </div>
            </>
          )}

          {/* CONDICIONES */}
          {seccionActiva === "Condiciones" && (
            <>
              <div className="pad-content-heading">
                <div>
                  <h3>Condiciones de los productos</h3>

                  <p>
                    Consulta los parámetros que pueden definirse
                    para cada producto financiero.
                  </p>
                </div>
              </div>

              <div className="pad-conditions-grid">

                <article className="pad-condition-card">
                  <div className="pad-condition-icon orange">
                    <Percent size={21} />
                  </div>

                  <h4>Tasas de interés</h4>

                  <p>
                    Define las tasas aplicables a los productos
                    de crédito y ahorro (referencia inflacionaria 5.0% anual).
                  </p>
                </article>

                <article className="pad-condition-card">
                  <div className="pad-condition-icon green">
                    <CircleDollarSign size={21} />
                  </div>

                  <h4>Montos permitidos</h4>

                  <p>
                    Establece los montos mínimos y máximos
                    para cada producto (solicitudes &gt; $50,000 pasan a Supervisión).
                  </p>
                </article>

                <article className="pad-condition-card">
                  <div className="pad-condition-icon blue">
                    <CalendarDays size={21} />
                  </div>

                  <h4>Plazos y periodos</h4>

                  <p>
                    Configura los plazos y periodos aplicables
                    a los productos financieros (360 / 365 días base).
                  </p>
                </article>

                <article className="pad-condition-card">
                  <div className="pad-condition-icon brown">
                    <FileText size={21} />
                  </div>

                  <h4>Requisitos</h4>

                  <p>
                    Define los documentos y condiciones que
                    debe cumplir el cliente (ratio de endeudamiento ≤ 40%).
                  </p>
                </article>

              </div>

              <div className="pad-condition-note">
                <ShieldCheck size={18} />

                <p>
                  Las condiciones deberán configurarse por producto.
                  Los cambios deben respetar las políticas financieras
                  y las autorizaciones correspondientes de BANUAT.
                </p>
              </div>
            </>
          )}

        </div>
      </section>

      {/* INFORMACIÓN ADMINISTRATIVA */}
      <section className="pad-info">
        <div className="pad-info-icon">
          <ShieldCheck size={19} />
        </div>

        <div>
          <h4>Administración de productos</h4>

          <p>
            El administrador puede definir la oferta de productos
            de BANUAT. Las condiciones de cada producto deberán
            ser respetadas por los trabajadores al atender
            las solicitudes de los clientes.
          </p>
        </div>
      </section>

    </div>
  );
}

export default ProductosAdmin;
