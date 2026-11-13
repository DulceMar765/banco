import { useMemo, useState } from "react";
import {
  FileText,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Eye,
  X,
  PlusCircle,
  HandCoins,
  Calculator,
  ShieldAlert,
} from "lucide-react";

import type { Cliente, Solicitud } from "./Escritorio";

import "./Solicitudes.css";

type SolicitudesProps = {
  clientes: Cliente[];
  solicitudes: Solicitud[];
  busqueda: string;
  productoInicial?: string;
  clienteInicial?: Cliente | null;
  abrirModalDirecto?: boolean;
  onRegistrar: (
    datos: Omit<Solicitud, "id" | "fecha" | "estado">
  ) => void;
};

type FiltroEstado =
  | "Todas"
  | "Pendientes"
  | "En revisión"
  | "Aprobadas"
  | "Rechazadas"
  | "Con correcciones";

function normalizarEstado(estadoRaw: string): "Pendientes" | "En revisión" | "Aprobadas" | "Rechazadas" | "Con correcciones" {
  const e = (estadoRaw || "").toLowerCase().trim();
  if (e.includes("aprob") || e === "activo" || e === "active") return "Aprobadas";
  if (e.includes("rechaz")) return "Rechazadas";
  if (e.includes("correcc") || e.includes("devuelt")) return "Con correcciones";
  if (e.includes("revis")) return "En revisión";
  return "Pendientes";
}

const PRODUCTOS_CATALOGO = [
  { nombre: "Préstamo Personal Tradicional", tasa: 0.15, min: 3000, max: 150000 },
  { nombre: "Préstamo Empresarial", tasa: 0.12, min: 10000, max: 500000 },
  { nombre: "Préstamo de Emergencia", tasa: 0.18, min: 1000, max: 30000 },
  { nombre: "Inversión a Plazo Fijo", tasa: 0.08, min: 5000, max: 1000000 },
  { nombre: "Ahorro Programado", tasa: 0.05, min: 500, max: 200000 },
];

function Solicitudes({
  clientes,
  solicitudes,
  busqueda,
  productoInicial,
  clienteInicial,
  abrirModalDirecto = false,
  onRegistrar,
}: SolicitudesProps) {
  const [tipoVista, setTipoVista] = useState<"credito" | "expedientes">("credito");
  const [filtroActivo, setFiltroActivo] = useState<FiltroEstado>("Todas");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);

  // Modal para nueva solicitud financiera cerrado por defecto (solo abre si abrirModalDirecto es true)
  const [modalAbierto, setModalAbierto] = useState<boolean>(Boolean(abrirModalDirecto));
  const [socioSeleccionadoId, setSocioSeleccionadoId] = useState<string>(
    clienteInicial?.id ? String(clienteInicial.id) : (clientes.length > 0 ? String(clientes[0].id) : "")
  );
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>(
    productoInicial || "Préstamo Personal Tradicional"
  );
  const [montoSolicitado, setMontoSolicitado] = useState<number>(25000);
  const [plazoMeses, setPlazoMeses] = useState<number>(12);
  const [motivoSolicitud, setMotivoSolicitud] = useState<string>("Financiamiento para proyectos personales.");
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const filtros: {
    nombre: FiltroEstado;
    icono: typeof FileText;
  }[] = [
    { nombre: "Todas", icono: FileText },
    { nombre: "Pendientes", icono: Clock3 },
    { nombre: "En revisión", icono: AlertCircle },
    { nombre: "Aprobadas", icono: CheckCircle2 },
    { nombre: "Rechazadas", icono: XCircle },
    { nombre: "Con correcciones", icono: AlertCircle },
  ];

  // Socio activo para la solicitud
  const socioParaSolicitud = useMemo(() => {
    return clientes.find((c) => String(c.id) === socioSeleccionadoId) || clientes[0];
  }, [clientes, socioSeleccionadoId]);

  // Cálculo financiero dinámico en vivo
  const evaluacionFinanciera = useMemo(() => {
    const prod = PRODUCTOS_CATALOGO.find((p) => p.nombre === productoSeleccionado) || PRODUCTOS_CATALOGO[0];
    const tasaAnual = prod.tasa;
    const ingresoMensual = socioParaSolicitud?.ingreso && socioParaSolicitud.ingreso > 0
      ? Number(socioParaSolicitud.ingreso)
      : 15000;

    // Fórmula estándar de cuota fija: (Monto * (1 + (tasa * plazo/12))) / plazo
    const interesTotal = montoSolicitado * tasaAnual * (plazoMeses / 12);
    const cuotaMensual = (montoSolicitado + interesTotal) / plazoMeses;
    const ratioEndeudamiento = (cuotaMensual / ingresoMensual) * 100;
    const requiereSupervision = ratioEndeudamiento > 40 || montoSolicitado > 50000;

    return {
      tasaAnual,
      ingresoMensual,
      cuotaMensual: Number(cuotaMensual.toFixed(2)),
      interesTotal: Number(interesTotal.toFixed(2)),
      ratioEndeudamiento: Number(ratioEndeudamiento.toFixed(1)),
      requiereSupervision,
    };
  }, [productoSeleccionado, montoSolicitado, plazoMeses, socioParaSolicitud]);

  // Contadores para expedientes
  const contadoresExpedientes = useMemo(() => {
    let pendientes = 0;
    let enRevision = 0;
    let aprobadas = 0;
    let rechazadas = 0;
    let conCorrecciones = 0;

    clientes.forEach((c) => {
      const normalizado = normalizarEstado(c.estado);
      if (normalizado === "Pendientes") pendientes++;
      else if (normalizado === "En revisión") enRevision++;
      else if (normalizado === "Aprobadas") aprobadas++;
      else if (normalizado === "Rechazadas") rechazadas++;
      else if (normalizado === "Con correcciones") conCorrecciones++;
    });

    return {
      total: clientes.length,
      pendientes,
      enRevision,
      aprobadas,
      rechazadas,
      conCorrecciones,
    };
  }, [clientes]);

  // Filtrado de expedientes de clientes
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const normalizado = normalizarEstado(c.estado);
      const coincideFiltro = filtroActivo === "Todas" || normalizado === filtroActivo;

      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.cuenta.toLowerCase().includes(q) ||
        (c.rfc && c.rfc.toLowerCase().includes(q)) ||
        (c.curp && c.curp.toLowerCase().includes(q)) ||
        (c.correo && c.correo.toLowerCase().includes(q));

      return coincideFiltro && coincideBusqueda;
    });
  }, [clientes, filtroActivo, busqueda]);

  // Filtrado de solicitudes de crédito
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((s) => {
      const normalizado = normalizarEstado(s.estado);
      const coincideFiltro = filtroActivo === "Todas" || normalizado === filtroActivo;

      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        !q ||
        s.cliente.toLowerCase().includes(q) ||
        s.producto.toLowerCase().includes(q) ||
        String(s.monto).includes(q) ||
        (s.motivo && s.motivo.toLowerCase().includes(q));

      return coincideFiltro && coincideBusqueda;
    });
  }, [solicitudes, filtroActivo, busqueda]);

  const manejarEnvioSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    if (!socioParaSolicitud) {
      setErrorValidacion("Debes seleccionar un cliente válido.");
      return;
    }

    if (montoSolicitado <= 0) {
      setErrorValidacion("El monto solicitado debe ser mayor a cero.");
      return;
    }

    onRegistrar({
      cliente: socioParaSolicitud.nombre,
      producto: productoSeleccionado,
      monto: montoSolicitado,
      plazo: `${plazoMeses} meses`,
      motivo: motivoSolicitud,
      ingresos: evaluacionFinanciera.ingresoMensual,
    });

    setMensajeExito(
      `¡Solicitud enviada a supervisión con éxito! Folio generado y expediente vinculado a ${socioParaSolicitud.nombre}.`
    );
    setModalAbierto(false);
    setTipoVista("credito");

    setTimeout(() => {
      setMensajeExito(null);
    }, 6000);
  };

  return (
    <section className="es-section solicitudes-clientes">
      {/* Encabezado y Acciones Principales */}
      <div className="es-page-heading solicitudes-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <span className="es-eyebrow">CONTROL DE TRÁMITES Y PRODUCTOS</span>
          <h1>Solicitudes de Escritorio</h1>
          <p>
            Genera solicitudes de financiamiento con validación de capacidad de pago y audita el estado de expedientes enviados a supervisión.
          </p>
        </div>

        <button
          type="button"
          className="es-btn es-btn-primary"
          onClick={() => setModalAbierto(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "14px" }}
        >
          <PlusCircle size={18} />
          Nueva Solicitud Financiera
        </button>
      </div>

      {mensajeExito && (
        <div
          role="status"
          style={{
            background: "#dcfce7",
            border: "1px solid #22c55e",
            color: "#15803d",
            padding: "12px 18px",
            borderRadius: "10px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <CheckCircle2 size={18} />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Switcher de Tipo de Vista */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid #e5e7eb", paddingBottom: "10px" }}>
        <button
          type="button"
          onClick={() => setTipoVista("credito")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "13.5px",
            background: tipoVista === "credito" ? "#d66b20" : "#f3f4f6",
            color: tipoVista === "credito" ? "#fff" : "#4b5563",
            transition: "all 0.2s"
          }}
        >
          <HandCoins size={16} />
          Solicitudes de Crédito y Financiamiento ({solicitudes.length})
        </button>

        <button
          type="button"
          onClick={() => setTipoVista("expedientes")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "13.5px",
            background: tipoVista === "expedientes" ? "#d66b20" : "#f3f4f6",
            color: tipoVista === "expedientes" ? "#fff" : "#4b5563",
            transition: "all 0.2s"
          }}
        >
          <Users size={16} />
          Expedientes de Nuevos Socios ({clientes.length})
        </button>
      </div>

      {/* Resumen de estados con contadores reales */}
      <div className="solicitudes-resumen">
        <div className="solicitud-resumen-card">
          <div className="solicitud-resumen-icon orange">
            <FileText size={19} />
          </div>
          <div>
            <span>{tipoVista === "credito" ? "Solicitudes de crédito" : "Total expedientes"}</span>
            <strong>{tipoVista === "credito" ? solicitudes.length : contadoresExpedientes.total}</strong>
          </div>
        </div>

        <div className="solicitud-resumen-card">
          <div className="solicitud-resumen-icon yellow">
            <Clock3 size={19} />
          </div>
          <div>
            <span>Pendientes</span>
            <strong>
              {tipoVista === "credito"
                ? solicitudes.filter((s) => s.estado.toLowerCase().includes("pendiente")).length
                : contadoresExpedientes.pendientes}
            </strong>
          </div>
        </div>

        <div className="solicitud-resumen-card">
          <div className="solicitud-resumen-icon blue">
            <AlertCircle size={19} />
          </div>
          <div>
            <span>En revisión (Supervisión)</span>
            <strong>
              {tipoVista === "credito"
                ? solicitudes.filter((s) => s.estado.toLowerCase().includes("revis")).length
                : contadoresExpedientes.enRevision}
            </strong>
          </div>
        </div>

        <div className="solicitud-resumen-card">
          <div className="solicitud-resumen-icon green">
            <CheckCircle2 size={19} />
          </div>
          <div>
            <span>Aprobadas / Activas</span>
            <strong>
              {tipoVista === "credito"
                ? solicitudes.filter((s) => s.estado.toLowerCase().includes("aprob")).length
                : contadoresExpedientes.aprobadas}
            </strong>
          </div>
        </div>
      </div>

      {/* Contenido principal según pestaña seleccionada */}
      {tipoVista === "credito" ? (
        <div className="es-table-card solicitudes-table-card">
          <div className="solicitudes-table-header">
            <div>
              <h2>Solicitudes de Crédito Generadas</h2>
              <p>Trámites de financiamiento originados y canalizados al supervisor.</p>
            </div>

            <span className="solicitudes-total">
              <HandCoins size={15} />
              {solicitudesFiltradas.length} Solicitudes
            </span>
          </div>

          {/* Filtros */}
          <div className="solicitudes-filtros">
            {filtros.map((filtro) => {
              const Icono = filtro.icono;
              return (
                <button
                  type="button"
                  key={filtro.nombre}
                  className={`solicitudes-filtro ${
                    filtroActivo === filtro.nombre ? "activo" : ""
                  }`}
                  onClick={() => setFiltroActivo(filtro.nombre)}
                >
                  <Icono size={14} />
                  {filtro.nombre}
                </button>
              );
            })}
          </div>

          {/* Tabla de Solicitudes de Crédito */}
          <div className="es-table-wrap">
            <table className="es-table solicitudes-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Monto Solicitado</th>
                  <th>Plazo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {solicitudesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="es-empty-state solicitudes-empty">
                        <div className="es-empty-icon">
                          <HandCoins size={25} />
                        </div>
                        <h3>No hay solicitudes de crédito registradas</h3>
                        <p>
                          {busqueda
                            ? `No se encontraron coincidencias para "${busqueda}".`
                            : "Usa el botón '+ Nueva Solicitud Financiera' para originar el primer crédito."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  solicitudesFiltradas.map((solicitud) => {
                    const esDudoso =
                      solicitud.monto > 50000 ||
                      solicitud.estado.toLowerCase().includes("revis");

                    return (
                      <tr key={solicitud.id}>
                        <td>
                          <strong style={{ color: "#d66b20", fontSize: "12.5px" }}>
                            SOL-{String(solicitud.id).padStart(4, "0")}
                          </strong>
                        </td>
                        <td>
                          <strong style={{ color: "#222" }}>{solicitud.cliente}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "#444" }}>
                            {solicitud.producto}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#166534", fontSize: "13px" }}>
                            {Number(solicitud.monto).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                              maximumFractionDigits: 0,
                            })}
                          </strong>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "#666" }}>
                            {solicitud.plazo}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "#666" }}>
                            {solicitud.fecha}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              background:
                                solicitud.estado.toLowerCase().includes("aprob")
                                  ? "#e6f4ea"
                                  : solicitud.estado.toLowerCase().includes("rechaz")
                                  ? "#fce8e6"
                                  : esDudoso
                                  ? "#fef3c7"
                                  : "#e8f0fe",
                              color:
                                solicitud.estado.toLowerCase().includes("aprob")
                                  ? "#137333"
                                  : solicitud.estado.toLowerCase().includes("rechaz")
                                  ? "#c5221f"
                                  : esDudoso
                                  ? "#b45309"
                                  : "#1a73e8",
                            }}
                          >
                            {esDudoso && <ShieldAlert size={12} />}
                            {solicitud.estado}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setSolicitudSeleccionada(solicitud)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "6px 12px",
                              background: "#fff",
                              border: "1px solid #d9d9d9",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#444",
                              cursor: "pointer",
                            }}
                          >
                            <Eye size={14} />
                            Detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="es-table-card solicitudes-table-card">
          <div className="solicitudes-table-header">
            <div>
              <h2>Expedientes de Nuevos Socios</h2>
              <p>Seguimiento de las solicitudes de registro y cotejo de documentos.</p>
            </div>

            <span className="solicitudes-total">
              <Users size={15} />
              {clientesFiltrados.length} Registros
            </span>
          </div>

          {/* Filtros */}
          <div className="solicitudes-filtros">
            {filtros.map((filtro) => {
              const Icono = filtro.icono;
              return (
                <button
                  type="button"
                  key={filtro.nombre}
                  className={`solicitudes-filtro ${
                    filtroActivo === filtro.nombre ? "activo" : ""
                  }`}
                  onClick={() => setFiltroActivo(filtro.nombre)}
                >
                  <Icono size={14} />
                  {filtro.nombre}
                </button>
              );
            })}
          </div>

          {/* Tabla de Expedientes de Clientes */}
          <div className="es-table-wrap">
            <table className="es-table solicitudes-table">
              <thead>
                <tr>
                  <th>Folio / Cuenta</th>
                  <th>Nombre del socio</th>
                  <th>RFC / CURP</th>
                  <th>Ingreso reportado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="es-empty-state solicitudes-empty">
                        <div className="es-empty-icon">
                          <FileText size={25} />
                        </div>
                        <h3>No hay expedientes para mostrar</h3>
                        <p>
                          {busqueda
                            ? `No se encontraron coincidencias para "${busqueda}".`
                            : "No hay solicitudes con el filtro seleccionado."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <strong style={{ color: "#d66b20", fontSize: "12.5px" }}>
                          {cliente.cuenta || `CTE-${String(cliente.id).padStart(4, "0")}`}
                        </strong>
                      </td>
                      <td>
                        <div>
                          <strong style={{ color: "#222" }}>{cliente.nombre}</strong>
                          {cliente.correo && (
                            <div style={{ fontSize: "11px", color: "#888" }}>
                              {cliente.correo}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "#444" }}>
                          {cliente.rfc || "Sin RFC"}
                        </span>
                        {cliente.curp && (
                          <div style={{ fontSize: "10.5px", color: "#888" }}>
                            {cliente.curp}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "#292929" }}>
                          {cliente.ingreso
                            ? Number(cliente.ingreso).toLocaleString("es-MX", {
                                style: "currency",
                                currency: "MXN",
                                maximumFractionDigits: 0,
                              })
                            : "$0"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            background:
                              cliente.estado === "Activo" || cliente.estado === "Aprobada"
                                ? "#e6f4ea"
                                : cliente.estado?.includes("Rechazad")
                                ? "#fce8e6"
                                : cliente.estado?.includes("revis")
                                ? "#e8f0fe"
                                : "#fef7e0",
                            color:
                              cliente.estado === "Activo" || cliente.estado === "Aprobada"
                                ? "#137333"
                                : cliente.estado?.includes("Rechazad")
                                ? "#c5221f"
                                : cliente.estado?.includes("revis")
                                ? "#1a73e8"
                                : "#b06000",
                          }}
                        >
                          {cliente.estado || "Pendiente"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setClienteSeleccionado(cliente)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            background: "#fff",
                            border: "1px solid #d9d9d9",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#444",
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={14} />
                          Ficha
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Nueva Solicitud Financiera */}
      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#d66b20", letterSpacing: "0.5px" }}>
                  ORIGINACIÓN DE PRODUCTO
                </span>
                <h2 style={{ margin: "2px 0 0", fontSize: "18px", color: "#111" }}>
                  Nueva Solicitud Financiera
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={manejarEnvioSolicitud} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {errorValidacion && (
                <div style={{ background: "#fee2e2", border: "1px solid #ef4444", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>
                  ⚠️ {errorValidacion}
                </div>
              )}

              {/* Selector de Socio */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Socio solicitante *
                </label>
                <select
                  value={socioSeleccionadoId}
                  onChange={(e) => setSocioSeleccionadoId(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13.5px" }}
                >
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} · {c.cuenta || `ID: ${c.id}`} · Ingreso: ${c.ingreso || 0}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Producto */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Producto Financiero *
                </label>
                <select
                  value={productoSeleccionado}
                  onChange={(e) => setProductoSeleccionado(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13.5px" }}
                >
                  {PRODUCTOS_CATALOGO.map((p) => (
                    <option key={p.nombre} value={p.nombre}>
                      {p.nombre} (Tasa: {p.tasa * 100}% anual, Límites: ${p.min.toLocaleString()} - ${p.max.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Monto y Plazo en 2 columnas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Monto Solicitado ($ MXN) *
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={montoSolicitado}
                    onChange={(e) => setMontoSolicitado(Number(e.target.value))}
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13.5px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Plazo (Meses) *
                  </label>
                  <select
                    value={plazoMeses}
                    onChange={(e) => setPlazoMeses(Number(e.target.value))}
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13.5px", boxSizing: "border-box" }}
                  >
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses</option>
                    <option value={18}>18 meses</option>
                    <option value={24}>24 meses</option>
                    <option value={36}>36 meses</option>
                  </select>
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Destino / Justificación del crédito
                </label>
                <textarea
                  rows={2}
                  value={motivoSolicitud}
                  onChange={(e) => setMotivoSolicitud(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              {/* PANEL DE EVALUACIÓN CREDITICIA EN VIVO */}
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1f2937", fontWeight: 700, fontSize: "13px" }}>
                  <Calculator size={16} />
                  <span>Simulación y Capacidad de Pago en Vivo</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12.5px" }}>
                  <div>
                    <span style={{ color: "#6b7280" }}>Ingreso socio mensual:</span>
                    <strong style={{ display: "block", color: "#111" }}>
                      ${evaluacionFinanciera.ingresoMensual.toLocaleString("es-MX")}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "#6b7280" }}>Cuota mensual estimada:</span>
                    <strong style={{ display: "block", color: "#166534" }}>
                      ${evaluacionFinanciera.cuotaMensual.toLocaleString("es-MX")} / mes
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "#6b7280" }}>Tasa anual estimada:</span>
                    <strong style={{ display: "block", color: "#111" }}>
                      {evaluacionFinanciera.tasaAnual * 100}%
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "#6b7280" }}>Ratio de endeudamiento:</span>
                    <strong
                      style={{
                        display: "block",
                        color: evaluacionFinanciera.ratioEndeudamiento > 40 ? "#dc2626" : "#166534",
                      }}
                    >
                      {evaluacionFinanciera.ratioEndeudamiento}% {evaluacionFinanciera.ratioEndeudamiento > 40 ? "(Crítico > 40%)" : "(≤ 40% Seguro)"}
                    </strong>
                  </div>
                </div>

                {/* Semáforo visual de supervisión */}
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: evaluacionFinanciera.requiereSupervision ? "#fef3c7" : "#dcfce7",
                    border: evaluacionFinanciera.requiereSupervision ? "1px solid #f59e0b" : "1px solid #86efac",
                    color: evaluacionFinanciera.requiereSupervision ? "#92400e" : "#166534",
                  }}
                >
                  {evaluacionFinanciera.requiereSupervision ? (
                    <>
                      <ShieldAlert size={16} />
                      <span>
                        ⚠️ <strong>Derivación Forzosa a Supervisión:</strong> Supera umbrales reglamentarios (monto &gt; $50,000 o ratio &gt; 40%). Requerirá dictamen y justificación del Supervisor.
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>
                        ✅ <strong>Capacidad de pago aprobable:</strong> El ratio está dentro del límite reglamentario (≤ 40%) y el monto no supera $50,000.
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    background: "#d66b20",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <HandCoins size={16} />
                  Enviar Solicitud a Supervisión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ficha Detalle Cliente */}
      {clienteSeleccionado && (
        <div
          role="dialog"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "17px", color: "#222" }}>
                Expediente: {clienteSeleccionado.cuenta || "En registro"}
              </h2>
              <button
                type="button"
                onClick={() => setClienteSeleccionado(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div>
                <strong style={{ color: "#555" }}>Nombre completo:</strong>{" "}
                <span style={{ fontWeight: 600, color: "#111" }}>{clienteSeleccionado.nombre}</span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>RFC:</strong>{" "}
                <span>{clienteSeleccionado.rfc || "No registrado"}</span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>CURP:</strong>{" "}
                <span>{clienteSeleccionado.curp || "No registrada"}</span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Correo:</strong>{" "}
                <span>{clienteSeleccionado.correo || "Sin correo"}</span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Teléfono:</strong>{" "}
                <span>{clienteSeleccionado.telefono || "Sin teléfono"}</span>
              </div>
              {clienteSeleccionado.direccion && (
                <div>
                  <strong style={{ color: "#555" }}>Domicilio:</strong>{" "}
                  <span>{clienteSeleccionado.direccion}</span>
                </div>
              )}
              <div>
                <strong style={{ color: "#555" }}>Ingresos mensuales:</strong>{" "}
                <span style={{ fontWeight: 700, color: "#166534" }}>
                  {clienteSeleccionado.ingreso
                    ? Number(clienteSeleccionado.ingreso).toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      })
                    : "$0.00"}
                </span>{" "}
                ({clienteSeleccionado.tipoIngreso || "Declarado"})
              </div>
              <div>
                <strong style={{ color: "#555" }}>Estado de autorización:</strong>{" "}
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontWeight: 700,
                    fontSize: "11px",
                    background: "#e8f0fe",
                    color: "#1a73e8",
                  }}
                >
                  {clienteSeleccionado.estado}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px" }}>
              <button
                type="button"
                onClick={() => setClienteSeleccionado(null)}
                style={{
                  padding: "8px 18px",
                  background: "#d66b20",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cerrar ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle de Solicitud de Crédito */}
      {solicitudSeleccionada && (
        <div
          role="dialog"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "17px", color: "#222" }}>
                Solicitud: SOL-{String(solicitudSeleccionada.id).padStart(4, "0")}
              </h2>
              <button
                type="button"
                onClick={() => setSolicitudSeleccionada(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div>
                <strong style={{ color: "#555" }}>Cliente:</strong>{" "}
                <span style={{ fontWeight: 600, color: "#111" }}>{solicitudSeleccionada.cliente}</span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Producto:</strong>{" "}
                <span>{solicitudSeleccionada.producto}</span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Monto solicitado:</strong>{" "}
                <span style={{ fontWeight: 700, color: "#166534" }}>
                  ${Number(solicitudSeleccionada.monto).toLocaleString("es-MX")}
                </span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Plazo:</strong>{" "}
                <span>{solicitudSeleccionada.plazo}</span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Fecha de registro:</strong>{" "}
                <span>{solicitudSeleccionada.fecha}</span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Estado:</strong>{" "}
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontWeight: 700,
                    fontSize: "11px",
                    background: "#e8f0fe",
                    color: "#1a73e8",
                  }}
                >
                  {solicitudSeleccionada.estado}
                </span>
              </div>
              {solicitudSeleccionada.motivo && (
                <div>
                  <strong style={{ color: "#555" }}>Motivo / Justificación:</strong>{" "}
                  <span>{solicitudSeleccionada.motivo}</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px" }}>
              <button
                type="button"
                onClick={() => setSolicitudSeleccionada(null)}
                style={{
                  padding: "8px 18px",
                  background: "#d66b20",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información del proceso */}
      <div className="solicitudes-nota">
        <div className="solicitudes-nota-icon">
          <AlertCircle size={19} />
        </div>
        <div>
          <strong>Proceso de autorización en sucursal</strong>
          <p>
            Al originar una solicitud financiera o dar de alta a un socio, el expediente se remite inmediatamente a la bandeja del Supervisor para su cotejo, análisis de riesgo y dictamen. El ejecutivo no puede autorizar créditos propios.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Solicitudes;
