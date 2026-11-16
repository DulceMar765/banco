import { useState, useEffect } from "react";
import {
  BookOpen,
  CalendarDays,
  Package,
  Layers3,
  Search,
  Plus,
  FolderOpen,
  Clock,
  Settings2,
  Monitor,
  UserRound,
  Headset,
  BriefcaseBusiness,
  Info,
} from "lucide-react";

import { getApiUrl } from "../../services/auth";
import "./CatalogosAdmin.css";

type SeccionCatalogo = "Catálogos" | "Temporadas" | "Disponibilidad";

export default function CatalogosAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionCatalogo>("Catálogos");

  const [busqueda, setBusqueda] = useState("");

  const [indicadores, setIndicadores] = useState({
    catalogosRegistrados: 0,
    temporadasActivas: 0,
    productosDisponibles: 0,
    areasConfiguradas: 4,
  });
  const [catalogos, setCatalogos] = useState<any[]>([]);
  const [temporadas, setTemporadas] = useState<any[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<Record<string, boolean>>({
    Recepción: true,
    Escritorio: true,
    Clientes: true,
    Supervisor: true,
  });

  // Formulario de Nuevo Catálogo
  const [mostrarFormCat, setMostrarFormCat] = useState(false);
  const [nombreCat, setNombreCat] = useState("");
  const [descCat, setDescCat] = useState("");
  const [puntosCat, setPuntosCat] = useState("10000");
  const [stockCat, setStockCat] = useState("30");

  // Formulario de Nueva Temporada
  const [mostrarFormTemp, setMostrarFormTemp] = useState(false);
  const [nombreTemp, setNombreTemp] = useState("");
  const [inicioTemp, setInicioTemp] = useState("");
  const [finTemp, setFinTemp] = useState("");

  const cargarDatos = async () => {
    try {
      const res = await fetch(getApiUrl("/api/admin/catalogos"));
      const data = await res.json();
      if (data && data.indicadores) {
        setIndicadores(data.indicadores);
        setCatalogos(Array.isArray(data.catalogos) ? data.catalogos : []);
        setTemporadas(Array.isArray(data.temporadas) ? data.temporadas : []);
        if (data.disponibilidad) {
          setDisponibilidad(data.disponibilidad);
        }
      }
    } catch (err) {
      console.error("Error al cargar catálogos admin:", err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const secciones: {
    nombre: SeccionCatalogo;
    icono: typeof BookOpen;
  }[] = [
    { nombre: "Catálogos", icono: BookOpen },
    { nombre: "Temporadas", icono: CalendarDays },
    { nombre: "Disponibilidad", icono: Settings2 },
  ];

  const cambiarSeccion = (seccion: SeccionCatalogo) => {
    setSeccionActiva(seccion);
    setBusqueda("");
    setMostrarFormCat(false);
    setMostrarFormTemp(false);
  };

  const crearCatalogo = async () => {
    if (!nombreCat.trim()) return;
    try {
      const res = await fetch(getApiUrl("/api/admin/catalogos/item"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreCat.trim(),
          descripcion: descCat.trim(),
          puntos: Number(puntosCat) || 5000,
          stock: Number(stockCat) || 20,
        }),
      });
      if (res.ok) {
        setNombreCat("");
        setDescCat("");
        setMostrarFormCat(false);
        await cargarDatos();
      }
    } catch (err) {
      console.error("Error al crear catálogo:", err);
    }
  };

  const crearTemporada = async () => {
    if (!nombreTemp.trim() || !inicioTemp || !finTemp) return;
    try {
      const res = await fetch(getApiUrl("/api/admin/catalogos/temporada"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreTemp.trim(),
          fechaInicio: inicioTemp,
          fechaFin: finTemp,
          activa: true,
        }),
      });
      if (res.ok) {
        setNombreTemp("");
        setInicioTemp("");
        setFinTemp("");
        setMostrarFormTemp(false);
        await cargarDatos();
      }
    } catch (err) {
      console.error("Error al crear temporada:", err);
    }
  };

  const toggleDisponibilidadArea = async (area: string) => {
    const nuevoValor = !disponibilidad[area];
    try {
      const res = await fetch(getApiUrl("/api/admin/catalogos/disponibilidad"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, habilitado: nuevoValor }),
      });
      if (res.ok) {
        await cargarDatos();
      }
    } catch (err) {
      console.error("Error al actualizar disponibilidad:", err);
    }
  };

  const obtenerDescripcion = () => {
    switch (seccionActiva) {
      case "Catálogos":
        return "Organiza los catálogos de productos y servicios disponibles en BANUAT.";
      case "Temporadas":
        return "Administra los catálogos relacionados con temporadas y periodos especiales.";
      case "Disponibilidad":
        return "Define qué catálogos y opciones pueden consultar las distintas áreas.";
      default:
        return "";
    }
  };

  const catalogosFiltrados = catalogos.filter((c) => {
    const q = busqueda.toLowerCase();
    return (
      !q ||
      c.nombre.toLowerCase().includes(q) ||
      c.codigo.toLowerCase().includes(q) ||
      c.temporada.toLowerCase().includes(q)
    );
  });

  const renderizarContenido = () => {
    switch (seccionActiva) {
      case "Catálogos":
        return (
          <section className="caa-contenido">
            <div className="caa-panel-header">
              <div>
                <h3>Catálogos registrados</h3>
                <p>
                  Consulta y organiza los catálogos generales del sistema.
                </p>
              </div>

              <button
                className="caa-btn-principal"
                onClick={() => setMostrarFormCat(!mostrarFormCat)}
              >
                <Plus size={17} />
                Nuevo catálogo
              </button>
            </div>

            {mostrarFormCat && (
              <div
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid #e6ddd0",
                  background: "#fcfaf7",
                  marginBottom: "16px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                }}
              >
                <input
                  type="text"
                  placeholder="Nombre del artículo / catálogo *"
                  value={nombreCat}
                  onChange={(e) => setNombreCat(e.target.value)}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d6cfc7" }}
                />
                <input
                  type="text"
                  placeholder="Descripción breve"
                  value={descCat}
                  onChange={(e) => setDescCat(e.target.value)}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d6cfc7" }}
                />
                <input
                  type="number"
                  placeholder="Costo en puntos (100 pts = $1)"
                  value={puntosCat}
                  onChange={(e) => setPuntosCat(e.target.value)}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d6cfc7" }}
                />
                <input
                  type="number"
                  placeholder="Unidades disponibles"
                  value={stockCat}
                  onChange={(e) => setStockCat(e.target.value)}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d6cfc7" }}
                />
                <button
                  type="button"
                  className="caa-btn-principal"
                  onClick={crearCatalogo}
                >
                  Guardar en catálogo
                </button>
              </div>
            )}

            <div className="caa-filtros">
              <div className="caa-busqueda">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Buscar catálogo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {catalogosFiltrados.length === 0 ? (
              <div className="caa-empty">
                <div className="caa-empty-icon">
                  <FolderOpen size={30} />
                </div>
                <h4>No hay catálogos registrados</h4>
                <p>
                  Cuando se creen catálogos, aparecerán aquí para que puedas
                  administrarlos.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                {catalogosFiltrados.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid #ece5db",
                      background: "#ffffff",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "0.96rem", color: "#231f1b" }}>
                        {item.nombre} · <span style={{ color: "#9a6b3b" }}>{item.codigo}</span>
                      </strong>
                      <p style={{ margin: "3px 0 0", fontSize: "0.84rem", color: "#686057" }}>
                        {item.descripcion} · Temporada: <strong>{item.temporada}</strong> · Stock: {item.stock} uds.
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ display: "block", color: "#b45309", fontSize: "0.95rem" }}>
                        {Number(item.puntos).toLocaleString("es-MX")} pts
                      </strong>
                      <small style={{ color: "#686057" }}>
                        Equivale a ${Number(item.equivalenteMxn).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      case "Temporadas":
        return (
          <section className="caa-contenido">
            <div className="caa-panel-header">
              <div>
                <h3>Catálogos de temporada</h3>
                <p>
                  Administra las opciones que estarán disponibles durante
                  determinados periodos.
                </p>
              </div>

              <button
                className="caa-btn-principal"
                onClick={() => setMostrarFormTemp(!mostrarFormTemp)}
              >
                <Plus size={17} />
                Nueva temporada
              </button>
            </div>

            {mostrarFormTemp && (
              <div
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid #e6ddd0",
                  background: "#fcfaf7",
                  marginBottom: "16px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                }}
              >
                <input
                  type="text"
                  placeholder="Nombre de temporada *"
                  value={nombreTemp}
                  onChange={(e) => setNombreTemp(e.target.value)}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d6cfc7" }}
                />
                <input
                  type="date"
                  value={inicioTemp}
                  onChange={(e) => setInicioTemp(e.target.value)}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d6cfc7" }}
                />
                <input
                  type="date"
                  value={finTemp}
                  onChange={(e) => setFinTemp(e.target.value)}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d6cfc7" }}
                />
                <button
                  type="button"
                  className="caa-btn-principal"
                  onClick={crearTemporada}
                >
                  Guardar temporada
                </button>
              </div>
            )}

            <div className="caa-info">
              <div className="caa-info-icon">
                <Info size={19} />
              </div>
              <div>
                <strong>Administración de temporadas</strong>
                <p>
                  Cada temporada podrá tener un nombre, descripción, fecha de
                  inicio, fecha de finalización y catálogo asociado. El
                  administrador podrá determinar cuándo estará disponible.
                </p>
              </div>
            </div>

            {temporadas.length === 0 ? (
              <div className="caa-empty">
                <div className="caa-empty-icon">
                  <CalendarDays size={30} />
                </div>
                <h4>No hay temporadas configuradas</h4>
                <p>
                  Las temporadas que se registren aparecerán aquí junto con su
                  periodo y estado.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                {temporadas.map((temp) => (
                  <div
                    key={temp.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid #ece5db",
                      background: "#ffffff",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "0.96rem", color: "#231f1b" }}>
                        {temp.nombre}
                      </strong>
                      <p style={{ margin: "3px 0 0", fontSize: "0.84rem", color: "#686057" }}>
                        Vigencia: {temp.inicio} al {temp.fin} · Artículos vinculados: {temp.totalArticulos}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        backgroundColor: temp.estado === "Activa" ? "#dcfce7" : "#f3f4f6",
                        color: temp.estado === "Activa" ? "#15803d" : "#4b5563",
                      }}
                    >
                      {temp.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      case "Disponibilidad":
        return (
          <section className="caa-contenido">
            <div className="caa-panel-header">
              <div>
                <h3>Disponibilidad por área</h3>
                <p>
                  Configura qué opciones podrán consultar los trabajadores
                  según sus responsabilidades.
                </p>
              </div>
            </div>

            <div className="caa-areas">
              <article
                className="caa-area-card"
                style={{ cursor: "pointer" }}
                onClick={() => toggleDisponibilidadArea("Recepción")}
              >
                <div className="caa-area-icon">
                  <Headset size={22} />
                </div>
                <div className="caa-area-info">
                  <h4>Recepción</h4>
                  <p>
                    Consulta los servicios, requisitos y opciones disponibles
                    para orientar a los clientes.
                  </p>
                  <span style={{ color: disponibilidad["Recepción"] ? "#15803d" : "#b45309", fontWeight: 600 }}>
                    {disponibilidad["Recepción"] ? "Habilitado (Clic para cambiar)" : "Pausado (Clic para activar)"}
                  </span>
                </div>
              </article>

              <article
                className="caa-area-card"
                style={{ cursor: "pointer" }}
                onClick={() => toggleDisponibilidadArea("Escritorio")}
              >
                <div className="caa-area-icon">
                  <BriefcaseBusiness size={22} />
                </div>
                <div className="caa-area-info">
                  <h4>Escritorio</h4>
                  <p>
                    Consulta los productos, servicios y opciones necesarias
                    para registrar solicitudes y atender consultas.
                  </p>
                  <span style={{ color: disponibilidad["Escritorio"] ? "#15803d" : "#b45309", fontWeight: 600 }}>
                    {disponibilidad["Escritorio"] ? "Habilitado (Clic para cambiar)" : "Pausado (Clic para activar)"}
                  </span>
                </div>
              </article>

              <article
                className="caa-area-card"
                style={{ cursor: "pointer" }}
                onClick={() => toggleDisponibilidadArea("Clientes")}
              >
                <div className="caa-area-icon">
                  <UserRound size={22} />
                </div>
                <div className="caa-area-info">
                  <h4>Clientes</h4>
                  <p>
                    Consulta los catálogos y productos que podrán mostrarse
                    dentro del portal del cliente.
                  </p>
                  <span style={{ color: disponibilidad["Clientes"] ? "#15803d" : "#b45309", fontWeight: 600 }}>
                    {disponibilidad["Clientes"] ? "Habilitado (Clic para cambiar)" : "Pausado (Clic para activar)"}
                  </span>
                </div>
              </article>

              <article
                className="caa-area-card"
                style={{ cursor: "pointer" }}
                onClick={() => toggleDisponibilidadArea("Supervisor")}
              >
                <div className="caa-area-icon">
                  <Monitor size={22} />
                </div>
                <div className="caa-area-info">
                  <h4>Supervisor</h4>
                  <p>
                    Consulta los catálogos relacionados con la revisión y
                    supervisión de operaciones.
                  </p>
                  <span style={{ color: disponibilidad["Supervisor"] ? "#15803d" : "#b45309", fontWeight: 600 }}>
                    {disponibilidad["Supervisor"] ? "Habilitado (Clic para cambiar)" : "Pausado (Clic para activar)"}
                  </span>
                </div>
              </article>
            </div>

            <div className="caa-nota">
              <Info size={18} />
              <p>
                La disponibilidad por área permitirá controlar qué información
                puede consultar cada módulo. No modifica los permisos de acceso
                de los trabajadores.
              </p>
            </div>
          </section>
        );
    }
  };

  return (
    <div className="caa-page">
      <div className="caa-encabezado">
        <div>
          <span className="caa-superior">ADMINISTRACIÓN GENERAL</span>
          <h2>Catálogos</h2>
          <p>
            Organiza los catálogos, temporadas y opciones disponibles en el
            sistema.
          </p>
        </div>

        <div className="caa-encabezado-icon">
          <BookOpen size={27} />
        </div>
      </div>

      <div className="caa-indicadores">
        <article className="caa-indicador">
          <div className="caa-indicador-icon naranja">
            <BookOpen size={21} />
          </div>
          <div>
            <span>Catálogos registrados</span>
            <strong>{indicadores.catalogosRegistrados}</strong>
          </div>
        </article>

        <article className="caa-indicador">
          <div className="caa-indicador-icon verde">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Temporadas activas</span>
            <strong>{indicadores.temporadasActivas}</strong>
          </div>
        </article>

        <article className="caa-indicador">
          <div className="caa-indicador-icon morado">
            <Package size={21} />
          </div>
          <div>
            <span>Productos disponibles</span>
            <strong>{indicadores.productosDisponibles}</strong>
          </div>
        </article>

        <article className="caa-indicador">
          <div className="caa-indicador-icon azul">
            <Layers3 size={21} />
          </div>
          <div>
            <span>Áreas configuradas</span>
            <strong>{indicadores.areasConfiguradas}</strong>
          </div>
        </article>
      </div>

      <div className="caa-secciones">
        {secciones.map(({ nombre, icono: Icono }) => (
          <button
            key={nombre}
            className={`caa-tab ${
              seccionActiva === nombre ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion(nombre)}
          >
            <Icono size={18} />
            {nombre}
          </button>
        ))}
      </div>

      <div className="caa-descripcion">
        <div>
          <h3>{seccionActiva}</h3>
          <p>{obtenerDescripcion()}</p>
        </div>
        <div className="caa-descripcion-icon">
          {seccionActiva === "Catálogos" && <BookOpen size={22} />}
          {seccionActiva === "Temporadas" && <Clock size={22} />}
          {seccionActiva === "Disponibilidad" && <Settings2 size={22} />}
        </div>
      </div>

      {renderizarContenido()}
    </div>
  );
}
