import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserRoundCheck,
  FolderOpen,
  Search,
  Filter,
  Eye,
  Clock3,
  FileText,
} from "lucide-react";

import { getApiUrl } from "../../services/auth";
import "./Clientes.css";

type SeccionClientes =
  | "Solicitudes"
  | "Directorio"
  | "Expedientes";

type ClienteAdmin = {
  id: string;
  codigo: string;
  nombre: string;
  rfc: string;
  curp: string;
  correo: string;
  telefono: string;
  cuenta: string;
  saldoTotal: number;
  puntos: number;
  ingresoMensual: number;
  egresoMensual: number;
  estado: "Activo" | "Pendiente" | "Rechazado" | "Suspendido";
  fechaAlta: string;
  documentos: {
    id: string;
    tipo: string;
    uri: string;
    hash: string;
    estado: string;
    fecha: string;
  }[];
};

function Clientes() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionClientes>("Solicitudes");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [resumen, setResumen] = useState({
    total: 0,
    activos: 0,
    pendientes: 0,
    revisadas: 0,
  });
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const cargarClientes = async () => {
    try {
      const res = await fetch(getApiUrl("/api/admin/clientes"));
      const data = await res.json();
      if (data && data.resumen) {
        setResumen(data.resumen);
        setClientes(Array.isArray(data.clientes) ? data.clientes : []);
      }
    } catch (err) {
      console.error("Error al cargar clientes de admin:", err);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const cambiarSeccion = (seccion: SeccionClientes) => {
    setSeccionActiva(seccion);
    setBusqueda("");
    setFiltroEstado("Todos");
  };

  const cambiarEstadoCliente = async (id: string, nuevoEstado: string) => {
    setProcesandoId(id);
    try {
      const res = await fetch(getApiUrl(`/api/admin/clientes/${id}/estado`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        await cargarClientes();
      }
    } catch (err) {
      console.error("Error al actualizar estado de cliente:", err);
    } finally {
      setProcesandoId(null);
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase();
    const coincideTexto =
      !q ||
      c.nombre.toLowerCase().includes(q) ||
      c.curp.toLowerCase().includes(q) ||
      c.rfc.toLowerCase().includes(q) ||
      c.codigo.toLowerCase().includes(q) ||
      c.cuenta.toLowerCase().includes(q);

    const coincideEstado =
      filtroEstado === "Todos" || c.estado === filtroEstado;

    return coincideTexto && coincideEstado;
  });

  return (
    <div className="cla-container">

      {/* ENCABEZADO */}
      <div className="cla-heading">
        <div>
          <span className="cla-eyebrow">
            ADMINISTRACIÓN DE CLIENTES
          </span>

          <h2>Gestión de clientes</h2>

          <p>
            Administra las altas, consulta los expedientes y
            supervisa el estado de los clientes de BANUAT.
          </p>
        </div>
      </div>

      {/* INDICADORES */}
      <section className="cla-stats">

        <article className="cla-stat-card">
          <div className="cla-stat-icon orange">
            <Users size={21} />
          </div>

          <div>
            <span>Total de clientes</span>
            <strong>{resumen.total}</strong>
          </div>
        </article>

        <article className="cla-stat-card">
          <div className="cla-stat-icon green">
            <UserRoundCheck size={21} />
          </div>

          <div>
            <span>Clientes activos</span>
            <strong>{resumen.activos}</strong>
          </div>
        </article>

        <article className="cla-stat-card">
          <div className="cla-stat-icon brown">
            <Clock3 size={21} />
          </div>

          <div>
            <span>Altas pendientes</span>
            <strong>{resumen.pendientes}</strong>
          </div>
        </article>

        <article className="cla-stat-card">
          <div className="cla-stat-icon blue">
            <UserPlus size={21} />
          </div>

          <div>
            <span>Altas revisadas</span>
            <strong>{resumen.revisadas}</strong>
          </div>
        </article>

      </section>

      {/* NAVEGACIÓN INTERNA */}
      <section className="cla-section">

        <div className="cla-tabs">
          <button
            type="button"
            className={seccionActiva === "Solicitudes" ? "active" : ""}
            onClick={() => cambiarSeccion("Solicitudes")}
          >
            <UserPlus size={17} />
            Solicitudes de alta
          </button>

          <button
            type="button"
            className={seccionActiva === "Directorio" ? "active" : ""}
            onClick={() => cambiarSeccion("Directorio")}
          >
            <Users size={17} />
            Directorio de clientes
          </button>

          <button
            type="button"
            className={seccionActiva === "Expedientes" ? "active" : ""}
            onClick={() => cambiarSeccion("Expedientes")}
          >
            <FolderOpen size={17} />
            Expedientes
          </button>
        </div>

        {/* CONTENIDO DE LA SECCIÓN */}
        <div className="cla-content">

          <div className="cla-content-heading">
            <div>
              <h3>{seccionActiva}</h3>

              <p>
                {seccionActiva === "Solicitudes" &&
                  "Revisa y administra las solicitudes de registro de nuevos clientes."}

                {seccionActiva === "Directorio" &&
                  "Consulta los clientes registrados en la cooperativa."}

                {seccionActiva === "Expedientes" &&
                  "Localiza y consulta la documentación de los clientes."}
              </p>
            </div>
          </div>

          {/* BÚSQUEDA Y FILTROS */}
          <div className="cla-toolbar">

            <div className="cla-search">
              <Search size={18} />

              <input
                type="text"
                placeholder={
                  seccionActiva === "Solicitudes"
                    ? "Buscar solicitud..."
                    : "Buscar por nombre, CURP o número de cliente..."
                }
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="cla-filter">
              <Filter size={17} />

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="Todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Activo">Activo</option>
                <option value="Rechazado">Rechazado</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>

          </div>

          {/* SOLICITUDES */}
          {seccionActiva === "Solicitudes" && (
            clientesFiltrados.length === 0 ? (
              <div className="cla-empty-state">
                <div className="cla-empty-icon orange">
                  <UserPlus size={27} />
                </div>

                <h4>No hay solicitudes para mostrar</h4>

                <p>
                  Cuando se registren nuevos clientes, sus solicitudes
                  aparecerán aquí para que puedas revisarlas.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
                {clientesFiltrados.map((cli) => (
                  <div
                    key={cli.id}
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
                      <strong style={{ fontSize: "0.98rem", color: "#231f1b" }}>
                        {cli.nombre} · <span style={{ color: "#9a6b3b" }}>{cli.codigo}</span>
                      </strong>
                      <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "#686057" }}>
                        RFC: {cli.rfc} · CURP: {cli.curp} · Ingreso declarado: {cli.ingresoMensual > 0 ? `$${cli.ingresoMensual.toLocaleString("es-MX")} MXN` : "No registrado"} · Alta: {cli.fechaAlta}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          backgroundColor: cli.estado === "Activo" ? "#dcfce7" : cli.estado === "Pendiente" ? "#fef3c7" : "#fee2e2",
                          color: cli.estado === "Activo" ? "#15803d" : cli.estado === "Pendiente" ? "#b45309" : "#b91c1c",
                        }}
                      >
                        {cli.estado}
                      </span>

                      {cli.estado !== "Activo" && (
                        <button
                          type="button"
                          disabled={procesandoId === cli.id}
                          onClick={() => cambiarEstadoCliente(cli.id, "Activo")}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#16a34a",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          Autorizar alta
                        </button>
                      )}

                      {cli.estado !== "Suspendido" && (
                        <button
                          type="button"
                          disabled={procesandoId === cli.id}
                          onClick={() => cambiarEstadoCliente(cli.id, "Suspendido")}
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
                          Suspender
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* DIRECTORIO */}
          {seccionActiva === "Directorio" && (
            clientesFiltrados.length === 0 ? (
              <div className="cla-empty-state">
                <div className="cla-empty-icon green">
                  <Users size={27} />
                </div>

                <h4>No hay clientes registrados</h4>

                <p>
                  Aquí aparecerá el directorio general de clientes
                  una vez que existan registros en el sistema.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto", marginTop: "14px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #ece5db", textAlign: "left", color: "#5e564d" }}>
                      <th style={{ padding: "10px" }}>Código</th>
                      <th style={{ padding: "10px" }}>Socio</th>
                      <th style={{ padding: "10px" }}>Cuenta Oficial</th>
                      <th style={{ padding: "10px" }}>Contacto</th>
                      <th style={{ padding: "10px" }}>Saldo / Puntos</th>
                      <th style={{ padding: "10px" }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cli) => (
                      <tr key={cli.id} style={{ borderBottom: "1px solid #f2ede6" }}>
                        <td style={{ padding: "10px", fontWeight: 600 }}>{cli.codigo}</td>
                        <td style={{ padding: "10px" }}>
                          <strong>{cli.nombre}</strong>
                          <div style={{ fontSize: "0.78rem", color: "#786f66" }}>CURP: {cli.curp}</div>
                        </td>
                        <td style={{ padding: "10px" }}>{cli.cuenta}</td>
                        <td style={{ padding: "10px" }}>{cli.correo}<br /><small>{cli.telefono}</small></td>
                        <td style={{ padding: "10px" }}>
                          <strong>${cli.saldoTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong>
                          <div style={{ fontSize: "0.78rem", color: "#b45309" }}>{cli.puntos.toLocaleString("es-MX")} pts</div>
                        </td>
                        <td style={{ padding: "10px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "0.76rem",
                              fontWeight: 600,
                              backgroundColor: cli.estado === "Activo" ? "#dcfce7" : "#fef3c7",
                              color: cli.estado === "Activo" ? "#15803d" : "#b45309",
                            }}
                          >
                            {cli.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* EXPEDIENTES */}
          {seccionActiva === "Expedientes" && (
            clientesFiltrados.length === 0 ? (
              <div className="cla-empty-state">
                <div className="cla-empty-icon blue">
                  <FileText size={27} />
                </div>

                <h4>No hay expedientes disponibles</h4>

                <p>
                  Aquí podrás localizar los expedientes y consultar
                  los documentos asociados a cada cliente.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
                {clientesFiltrados.map((cli) => (
                  <div
                    key={cli.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "14px",
                      border: "1px solid #e9e2d8",
                      background: "#ffffff",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong>{cli.nombre} ({cli.codigo})</strong>
                      <span style={{ fontSize: "0.8rem", color: "#686057" }}>RFC: {cli.rfc} · Cuenta: {cli.cuenta}</span>
                    </div>
                    {cli.documentos.length === 0 ? (
                      <p style={{ margin: 0, fontSize: "0.83rem", color: "#786f66" }}>
                        Expediente digital en integración (INE, RFC y Comprobante de domicilio verificados en mesa).
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {cli.documentos.map((doc) => (
                          <div
                            key={doc.id}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "10px",
                              background: "#f8f6f2",
                              border: "1px solid #e5ddd2",
                              fontSize: "0.8rem",
                            }}
                          >
                            <strong>{doc.tipo}</strong> · <span style={{ color: "#15803d" }}>{doc.estado}</span>
                            <div style={{ fontSize: "0.73rem", color: "#7c7267", marginTop: "2px" }}>
                              SHA-256: {doc.hash.slice(0, 18)}... · {doc.fecha}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

        </div>
      </section>

      {/* INFORMACIÓN ADMINISTRATIVA */}
      <section className="cla-info">
        <div className="cla-info-icon">
          <Eye size={19} />
        </div>

        <div>
          <h4>Control de registros</h4>
          <p>
            El administrador es responsable de revisar y autorizar
            las altas de clientes. Los trabajadores de recepción y
            escritorio pueden registrar solicitudes, pero no aprobarlas.
          </p>
        </div>
      </section>

    </div>
  );
}

export default Clientes;
