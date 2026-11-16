import { useState, useEffect } from "react";
import {
  Activity,
  ClipboardList,
  HandCoins,
  Wallet,
  Users,
  Search,
  Filter,
  FileText,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Clock3,
  Building2,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import { getApiUrl } from "../../services/auth";
import "./OperacionesAdmin.css";

type SeccionOperaciones =
  | "Resumen"
  | "Préstamos"
  | "Caja"
  | "Atención";

function OperacionesAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionOperaciones>("Resumen");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [resumen, setResumen] = useState({
    totalOperaciones: 0,
    solicitudesPrestamo: 0,
    movimientosCaja: 0,
    registrosAtencion: 0,
  });
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [caja, setCaja] = useState<any[]>([]);
  const [atencion, setAtencion] = useState<any[]>([]);

  useEffect(() => {
    fetch(getApiUrl("/api/admin/operaciones"))
      .then((res) => res.json())
      .then((data) => {
        if (data && data.resumen) {
          setResumen(data.resumen);
          setPrestamos(Array.isArray(data.prestamos) ? data.prestamos : []);
          setCaja(Array.isArray(data.caja) ? data.caja : []);
          setAtencion(Array.isArray(data.atencion) ? data.atencion : []);
        }
      })
      .catch((err) => console.error("Error al cargar operaciones admin:", err));
  }, []);

  const cambiarSeccion = (seccion: SeccionOperaciones) => {
    setSeccionActiva(seccion);
    setBusqueda("");
    setFiltroEstado("Todos");
  };

  const obtenerDescripcion = () => {
    switch (seccionActiva) {
      case "Préstamos":
        return "Consulta las solicitudes de préstamo y sus estados de autorización.";

      case "Caja":
        return "Supervisa los depósitos, retiros y pagos registrados por caja.";

      case "Atención":
        return "Consulta los registros de atención realizados por recepción y escritorio.";

      default:
        return "Consulta el panorama general de las operaciones de BANUAT.";
    }
  };

  const prestamosFiltrados = prestamos.filter((p) => {
    const q = busqueda.toLowerCase();
    const coincideTexto =
      !q ||
      p.cliente.toLowerCase().includes(q) ||
      p.folio.toLowerCase().includes(q) ||
      p.producto.toLowerCase().includes(q);
    const coincideEstado = filtroEstado === "Todos" || p.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  const cajaFiltrada = caja.filter((c) => {
    const q = busqueda.toLowerCase();
    const coincideTexto =
      !q ||
      c.cliente.toLowerCase().includes(q) ||
      c.referencia.toLowerCase().includes(q);
    const coincideEstado = filtroEstado === "Todos" || c.tipo === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  const atencionFiltrada = atencion.filter((a) => {
    const q = busqueda.toLowerCase();
    const coincideTexto =
      !q ||
      a.cliente.toLowerCase().includes(q) ||
      a.folio.toLowerCase().includes(q) ||
      a.tramite.toLowerCase().includes(q);
    const coincideArea = filtroEstado === "Todos" || a.area === filtroEstado;
    return coincideTexto && coincideArea;
  });

  const actividadConsolidada = [
    ...prestamos.slice(0, 3).map((p) => ({
      id: `P-${p.id}`,
      area: "Préstamos",
      titulo: `${p.folio} · ${p.producto} ($${Number(p.monto).toLocaleString("es-MX")} MXN)`,
      subtitulo: `Socio: ${p.cliente} · Estado: ${p.estado}`,
      fecha: p.fecha,
    })),
    ...caja.slice(0, 3).map((c) => ({
      id: `C-${c.id}`,
      area: "Caja",
      titulo: `${c.referencia} · ${c.tipo} ($${Number(c.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN)`,
      subtitulo: `Titular: ${c.cliente} · ${c.estado}`,
      fecha: c.fecha,
    })),
    ...atencion.slice(0, 3).map((a) => ({
      id: `A-${a.id}`,
      area: a.area,
      titulo: `${a.folio} · ${a.tramite}`,
      subtitulo: `${a.cliente} · Prioridad ${a.prioridad} · ${a.estado}`,
      fecha: a.fecha,
    })),
  ];

  return (
    <div className="opa-container">

      {/* ENCABEZADO */}
      <div className="opa-heading">
        <div>
          <span className="opa-eyebrow">
            CONTROL ADMINISTRATIVO
          </span>

          <h2>Operaciones</h2>

          <p>
            Consulta y supervisa los movimientos realizados
            en las diferentes áreas de BANUAT.
          </p>
        </div>
      </div>

      {/* INDICADORES */}
      <section className="opa-stats">

        <article className="opa-stat-card">
          <div className="opa-stat-icon orange">
            <Activity size={21} />
          </div>

          <div>
            <span>Operaciones registradas</span>
            <strong>{resumen.totalOperaciones}</strong>
          </div>
        </article>

        <article className="opa-stat-card">
          <div className="opa-stat-icon green">
            <HandCoins size={21} />
          </div>

          <div>
            <span>Solicitudes de préstamo</span>
            <strong>{resumen.solicitudesPrestamo}</strong>
          </div>
        </article>

        <article className="opa-stat-card">
          <div className="opa-stat-icon blue">
            <Wallet size={21} />
          </div>

          <div>
            <span>Movimientos de caja</span>
            <strong>{resumen.movimientosCaja}</strong>
          </div>
        </article>

        <article className="opa-stat-card">
          <div className="opa-stat-icon brown">
            <Users size={21} />
          </div>

          <div>
            <span>Registros de atención</span>
            <strong>{resumen.registrosAtencion}</strong>
          </div>
        </article>

      </section>

      {/* CONTENIDO PRINCIPAL */}
      <section className="opa-section">

        {/* PESTAÑAS */}
        <div className="opa-tabs">

          <button
            type="button"
            className={seccionActiva === "Resumen" ? "active" : ""}
            onClick={() => cambiarSeccion("Resumen")}
          >
            <Activity size={17} />
            Resumen
          </button>

          <button
            type="button"
            className={seccionActiva === "Préstamos" ? "active" : ""}
            onClick={() => cambiarSeccion("Préstamos")}
          >
            <HandCoins size={17} />
            Préstamos
          </button>

          <button
            type="button"
            className={seccionActiva === "Caja" ? "active" : ""}
            onClick={() => cambiarSeccion("Caja")}
          >
            <Wallet size={17} />
            Caja
          </button>

          <button
            type="button"
            className={seccionActiva === "Atención" ? "active" : ""}
            onClick={() => cambiarSeccion("Atención")}
          >
            <Users size={17} />
            Atención
          </button>

        </div>

        <div className="opa-content">

          <div className="opa-content-heading">
            <div>
              <h3>{seccionActiva}</h3>
              <p>{obtenerDescripcion()}</p>
            </div>
          </div>

          {/* RESUMEN */}
          {seccionActiva === "Resumen" && (
            <>
              <div className="opa-overview-grid">

                <article className="opa-overview-card">
                  <div className="opa-overview-top">
                    <div className="opa-overview-icon orange">
                      <HandCoins size={20} />
                    </div>
                    <span>Área de préstamos</span>
                  </div>

                  <h4>Solicitudes</h4>

                  <p>
                    Consulta las solicitudes enviadas,
                    revisadas, autorizadas o rechazadas.
                  </p>

                  <button
                    type="button"
                    onClick={() => cambiarSeccion("Préstamos")}
                  >
                    Consultar préstamos
                    <ArrowDownToLine size={15} />
                  </button>
                </article>

                <article className="opa-overview-card">
                  <div className="opa-overview-top">
                    <div className="opa-overview-icon green">
                      <Wallet size={20} />
                    </div>
                    <span>Área de caja</span>
                  </div>

                  <h4>Movimientos financieros</h4>

                  <p>
                    Consulta los depósitos, retiros y pagos
                    registrados por los cajeros.
                  </p>

                  <button
                    type="button"
                    onClick={() => cambiarSeccion("Caja")}
                  >
                    Consultar movimientos
                    <ArrowDownToLine size={15} />
                  </button>
                </article>

                <article className="opa-overview-card">
                  <div className="opa-overview-icon blue">
                    <Users size={20} />
                  </div>

                  <div className="opa-overview-top">
                    <span>Área de atención</span>
                  </div>

                  <h4>Atención a clientes</h4>

                  <p>
                    Consulta los registros de recepción,
                    turnos y actividades de escritorio.
                  </p>

                  <button
                    type="button"
                    onClick={() => cambiarSeccion("Atención")}
                  >
                    Consultar atención
                    <ArrowDownToLine size={15} />
                  </button>
                </article>

              </div>

              <div className="opa-recent">
                <div className="opa-recent-heading">
                  <div>
                    <h4>Actividad reciente</h4>
                    <p>
                      Últimas operaciones registradas en el sistema.
                    </p>
                  </div>

                  <Clock3 size={19} />
                </div>

                {actividadConsolidada.length === 0 ? (
                  <div className="opa-empty-state">
                    <div className="opa-empty-icon">
                      <ClipboardList size={26} />
                    </div>

                    <h4>No hay actividad registrada</h4>

                    <p>
                      Cuando se realicen operaciones en los distintos
                      departamentos, sus registros aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                    {actividadConsolidada.map((act) => (
                      <div
                        key={act.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 15px",
                          borderRadius: "12px",
                          border: "1px solid #ece5db",
                          background: "#ffffff",
                        }}
                      >
                        <div>
                          <strong style={{ display: "block", fontSize: "0.92rem", color: "#231f1b" }}>
                            [{act.area}] {act.titulo}
                          </strong>
                          <span style={{ fontSize: "0.82rem", color: "#686057" }}>{act.subtitulo}</span>
                        </div>
                        <small style={{ color: "#8c8277" }}>{act.fecha}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* PRÉSTAMOS */}
          {seccionActiva === "Préstamos" && (
            <>
              <div className="opa-toolbar">

                <div className="opa-search">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Buscar por cliente o número de solicitud..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="opa-filter">
                  <Filter size={17} />

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todos">Todos los estados</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En revisión">En revisión</option>
                    <option value="Autorizado">Autorizado</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>
                </div>

              </div>

              {prestamosFiltrados.length === 0 ? (
                <div className="opa-empty-state">
                  <div className="opa-empty-icon orange">
                    <HandCoins size={26} />
                  </div>

                  <h4>No hay solicitudes para mostrar</h4>

                  <p>
                    Aquí aparecerán las solicitudes de préstamo
                    y su estado dentro del proceso de autorización.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                  {prestamosFiltrados.map((p) => (
                    <div
                      key={p.id}
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
                        <strong style={{ fontSize: "0.95rem" }}>
                          {p.folio} · {p.cliente}
                        </strong>
                        <p style={{ margin: "3px 0 0", fontSize: "0.84rem", color: "#686057" }}>
                          {p.producto} · Monto: <strong>${Number(p.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong> · Plazo: {p.plazo} · Tasa: {p.tasa} · Fecha: {p.fecha}
                        </p>
                      </div>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          backgroundColor: p.estado === "Autorizado" ? "#dcfce7" : p.estado === "Rechazado" ? "#fee2e2" : "#fef3c7",
                          color: p.estado === "Autorizado" ? "#15803d" : p.estado === "Rechazado" ? "#b91c1c" : "#b45309",
                        }}
                      >
                        {p.estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* CAJA */}
          {seccionActiva === "Caja" && (
            <>
              <div className="opa-toolbar">

                <div className="opa-search">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Buscar por cliente o referencia..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="opa-filter">
                  <Filter size={17} />

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todos">Todos los movimientos</option>
                    <option value="Depósito">Depósitos</option>
                    <option value="Retiro">Retiros</option>
                    <option value="Pago">Pagos</option>
                  </select>
                </div>

              </div>

              <div className="opa-movement-types">

                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setFiltroEstado(filtroEstado === "Depósito" ? "Todos" : "Depósito")}
                >
                  <ArrowDownToLine size={19} />
                  <span>Depósitos</span>
                </div>

                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setFiltroEstado(filtroEstado === "Retiro" ? "Todos" : "Retiro")}
                >
                  <ArrowUpFromLine size={19} />
                  <span>Retiros</span>
                </div>

                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setFiltroEstado(filtroEstado === "Pago" ? "Todos" : "Pago")}
                >
                  <CreditCard size={19} />
                  <span>Pagos</span>
                </div>

              </div>

              {cajaFiltrada.length === 0 ? (
                <div className="opa-empty-state">
                  <div className="opa-empty-icon green">
                    <Wallet size={26} />
                  </div>

                  <h4>No hay movimientos registrados</h4>

                  <p>
                    Aquí aparecerá el historial de depósitos,
                    retiros y pagos realizados por el área de caja.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                  {cajaFiltrada.map((c) => (
                    <div
                      key={c.id}
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
                        <strong style={{ fontSize: "0.95rem" }}>
                          {c.referencia} · {c.tipo}
                        </strong>
                        <p style={{ margin: "3px 0 0", fontSize: "0.84rem", color: "#686057" }}>
                          Titular: {c.cliente} · Canal: {c.canal} · Fecha: {c.fecha}
                        </p>
                      </div>
                      <strong
                        style={{
                          color: c.tipo === "Retiro" ? "#dc2626" : "#15803d",
                          fontSize: "0.95rem",
                        }}
                      >
                        {c.tipo === "Retiro" ? "-" : "+"}${Number(c.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ATENCIÓN */}
          {seccionActiva === "Atención" && (
            <>
              <div className="opa-toolbar">

                <div className="opa-search">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Buscar por cliente o trabajador..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="opa-filter">
                  <Filter size={17} />

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todos">Todas las áreas</option>
                    <option value="Recepción">Recepción</option>
                    <option value="Escritorio">Escritorio</option>
                  </select>
                </div>

              </div>

              <div className="opa-attention-types">

                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setFiltroEstado(filtroEstado === "Recepción" ? "Todos" : "Recepción")}
                >
                  <Building2 size={19} />
                  <span>Recepción</span>
                </div>

                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setFiltroEstado(filtroEstado === "Escritorio" ? "Todos" : "Escritorio")}
                >
                  <UserRound size={19} />
                  <span>Escritorio</span>
                </div>

              </div>

              {atencionFiltrada.length === 0 ? (
                <div className="opa-empty-state">
                  <div className="opa-empty-icon blue">
                    <FileText size={26} />
                  </div>

                  <h4>No hay registros de atención</h4>

                  <p>
                    Aquí aparecerán los registros de clientes atendidos,
                    turnos y solicitudes capturadas por el personal.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                  {atencionFiltrada.map((a) => (
                    <div
                      key={a.id}
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
                        <strong style={{ fontSize: "0.95rem" }}>
                          {a.folio} · {a.tramite} ({a.area})
                        </strong>
                        <p style={{ margin: "3px 0 0", fontSize: "0.84rem", color: "#686057" }}>
                          {a.cliente} · Prioridad ponderada: {a.prioridad} · {a.fecha}
                        </p>
                      </div>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          backgroundColor: "#f3f4f6",
                          color: "#374151",
                        }}
                      >
                        {a.estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </section>

      {/* INFORMACIÓN ADMINISTRATIVA */}
      <section className="opa-info">
        <div className="opa-info-icon">
          <ShieldCheck size={19} />
        </div>

        <div>
          <h4>Supervisión de operaciones</h4>

          <p>
            Este módulo permite al administrador consultar la
            actividad de los departamentos. Las operaciones
            financieras y las autorizaciones se realizan desde
            los módulos correspondientes a cada puesto.
          </p>
        </div>
      </section>

    </div>
  );
}

export default OperacionesAdmin;
