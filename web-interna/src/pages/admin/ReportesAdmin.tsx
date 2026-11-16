import { useState, useEffect } from "react";
import {
  FileBarChart,
  Users,
  HandCoins,
  Wallet,
  BriefcaseBusiness,
  CalendarDays,
  Search,
  TrendingUp,
  ClipboardList,
  CircleDollarSign,
  Info,
  BarChart3,
} from "lucide-react";

import { getApiUrl } from "../../services/auth";
import "./ReportesAdmin.css";

type SeccionReporte =
  | "Resumen general"
  | "Clientes"
  | "Préstamos"
  | "Caja"
  | "Personal";

export default function ReportesAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionReporte>("Resumen general");

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipoReporte, setTipoReporte] = useState("todos");

  const [datos, setDatos] = useState<any>({
    resumenGeneral: {
      clientesRegistrados: 0,
      prestamosGestionados: 0,
      movimientosCaja: 0,
      personalRegistrado: 0,
    },
    clientes: { total: 0, nuevos: 0, pendientes: 0, registros: [] },
    prestamos: { recibidas: 0, autorizados: 0, rechazados: 0, pendientes: 0, registros: [] },
    caja: { depositos: 0, retiros: 0, pagos: 0, importeTotal: 0, registros: [] },
    personal: { supervisores: 0, escritorio: 0, cajeros: 0, recepcion: 0, registros: [] },
  });

  const cargarReportes = async (inicio = fechaInicio, fin = fechaFin) => {
    try {
      const params = new URLSearchParams();
      if (inicio) params.set("fechaInicio", inicio);
      if (fin) params.set("fechaFin", fin);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(getApiUrl(`/api/admin/reportes${qs}`));
      const data = await res.json();
      if (data && data.resumenGeneral) {
        setDatos(data);
      }
    } catch (err) {
      console.error("Error al cargar reportes admin:", err);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const secciones: {
    nombre: SeccionReporte;
    icono: typeof FileBarChart;
  }[] = [
    { nombre: "Resumen general", icono: BarChart3 },
    { nombre: "Clientes", icono: Users },
    { nombre: "Préstamos", icono: HandCoins },
    { nombre: "Caja", icono: Wallet },
    { nombre: "Personal", icono: BriefcaseBusiness },
  ];

  const cambiarSeccion = (seccion: SeccionReporte) => {
    setSeccionActiva(seccion);
  };

  const obtenerDescripcion = () => {
    switch (seccionActiva) {
      case "Resumen general":
        return "Consulta los indicadores generales y el comportamiento de las operaciones.";
      case "Clientes":
        return "Consulta los registros, altas y movimientos relacionados con clientes.";
      case "Préstamos":
        return "Revisa las solicitudes y el comportamiento de los préstamos.";
      case "Caja":
        return "Consulta los movimientos financieros registrados en caja.";
      case "Personal":
        return "Consulta la actividad operativa de los trabajadores.";
      default:
        return "";
    }
  };

  const renderizarEstadoVacio = (
    titulo: string,
    descripcion: string
  ) => (
    <div className="rea-empty">
      <div className="rea-empty-icon">
        <FileBarChart size={30} />
      </div>
      <h4>{titulo}</h4>
      <p>{descripcion}</p>
    </div>
  );

  const renderizarContenido = () => {
    switch (seccionActiva) {
      case "Resumen general":
        return (
          <>
            <div className="rea-indicadores">
              <article className="rea-indicador">
                <div className="rea-indicador-icon naranja">
                  <Users size={21} />
                </div>
                <div>
                  <span>Clientes registrados</span>
                  <strong>{datos.resumenGeneral.clientesRegistrados}</strong>
                </div>
              </article>

              <article className="rea-indicador">
                <div className="rea-indicador-icon verde">
                  <HandCoins size={21} />
                </div>
                <div>
                  <span>Préstamos gestionados</span>
                  <strong>{datos.resumenGeneral.prestamosGestionados}</strong>
                </div>
              </article>

              <article className="rea-indicador">
                <div className="rea-indicador-icon azul">
                  <Wallet size={21} />
                </div>
                <div>
                  <span>Movimientos de caja</span>
                  <strong>{datos.resumenGeneral.movimientosCaja}</strong>
                </div>
              </article>

              <article className="rea-indicador">
                <div className="rea-indicador-icon morado">
                  <BriefcaseBusiness size={21} />
                </div>
                <div>
                  <span>Personal registrado</span>
                  <strong>{datos.resumenGeneral.personalRegistrado}</strong>
                </div>
              </article>
            </div>

            <div className="rea-panel">
              <div className="rea-panel-header">
                <div>
                  <h3>Actividad general</h3>
                  <p>
                    Comportamiento de las operaciones durante el periodo
                    seleccionado.
                  </p>
                </div>
                <TrendingUp size={21} />
              </div>

              {datos.caja.registros.length === 0 ? (
                renderizarEstadoVacio(
                  "Sin información disponible",
                  "Cuando existan operaciones registradas, aquí se mostrará su comportamiento general."
                )
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                  {datos.caja.registros.slice(0, 5).map((r: any) => (
                    <div
                      key={r.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #ece5db",
                        background: "#fcfbf9",
                      }}
                    >
                      <span>
                        <strong>{r.folio}</strong> · {r.tipo} ({r.cliente})
                      </span>
                      <strong>
                        ${Number(r.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN · <small>{r.fecha}</small>
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rea-panel-grid">
              <article className="rea-panel">
                <div className="rea-panel-header">
                  <h3>Resumen de clientes</h3>
                  <Users size={19} />
                </div>
                {datos.clientes.registros.length === 0 ? (
                  renderizarEstadoVacio(
                    "Sin registros",
                    "No hay información de clientes para mostrar."
                  )
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {datos.clientes.registros.slice(0, 5).map((c: any) => (
                      <div
                        key={c.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.86rem",
                          padding: "8px 10px",
                          borderBottom: "1px solid #f0ebe3",
                        }}
                      >
                        <span><strong>{c.nombre}</strong> ({c.codigo})</span>
                        <span>{c.cuenta} · {c.estado}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="rea-panel">
                <div className="rea-panel-header">
                  <h3>Resumen de préstamos</h3>
                  <HandCoins size={19} />
                </div>
                {datos.prestamos.registros.length === 0 ? (
                  renderizarEstadoVacio(
                    "Sin registros",
                    "No hay información de préstamos para mostrar."
                  )
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {datos.prestamos.registros.slice(0, 5).map((p: any) => (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.86rem",
                          padding: "8px 10px",
                          borderBottom: "1px solid #f0ebe3",
                        }}
                      >
                        <span><strong>{p.folio}</strong> · {p.cliente}</span>
                        <span>${Number(p.monto).toLocaleString("es-MX")} MXN ({p.estado})</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>
          </>
        );

      case "Clientes":
        return (
          <div className="rea-panel">
            <div className="rea-panel-header">
              <div>
                <h3>Reporte de clientes</h3>
                <p>
                  Consulta las altas, registros y estado de los clientes.
                </p>
              </div>
              <Users size={21} />
            </div>

            <div className="rea-subindicadores">
              <article>
                <span>Total de clientes</span>
                <strong>{datos.clientes.total}</strong>
              </article>
              <article>
                <span>Nuevos registros</span>
                <strong>{datos.clientes.nuevos}</strong>
              </article>
              <article>
                <span>Altas pendientes</span>
                <strong>{datos.clientes.pendientes}</strong>
              </article>
            </div>

            {datos.clientes.registros.length === 0 ? (
              renderizarEstadoVacio(
                "No hay registros de clientes",
                "Los datos de altas y registros aparecerán cuando estén disponibles."
              )
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {datos.clientes.registros.map((c: any) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid #ece5db",
                      background: "#ffffff",
                    }}
                  >
                    <span><strong>{c.nombre}</strong> ({c.codigo}) · RFC: {c.rfc}</span>
                    <span>Cuenta: {c.cuenta} · <strong>{c.estado}</strong> ({c.fecha})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "Préstamos":
        return (
          <div className="rea-panel">
            <div className="rea-panel-header">
              <div>
                <h3>Reporte de préstamos</h3>
                <p>
                  Consulta las solicitudes y su resultado de autorización.
                </p>
              </div>
              <HandCoins size={21} />
            </div>

            <div className="rea-subindicadores">
              <article>
                <span>Solicitudes recibidas</span>
                <strong>{datos.prestamos.recibidas}</strong>
              </article>
              <article>
                <span>Autorizados</span>
                <strong>{datos.prestamos.autorizados}</strong>
              </article>
              <article>
                <span>Rechazados</span>
                <strong>{datos.prestamos.rechazados}</strong>
              </article>
              <article>
                <span>Pendientes</span>
                <strong>{datos.prestamos.pendientes}</strong>
              </article>
            </div>

            {datos.prestamos.registros.length === 0 ? (
              renderizarEstadoVacio(
                "No hay información de préstamos",
                "Los reportes de solicitudes y autorizaciones aparecerán aquí."
              )
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {datos.prestamos.registros.map((p: any) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid #ece5db",
                      background: "#ffffff",
                    }}
                  >
                    <span><strong>{p.folio}</strong> · {p.cliente} ({p.producto})</span>
                    <span><strong>${Number(p.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong> · {p.estado} ({p.fecha})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "Caja":
        return (
          <div className="rea-panel">
            <div className="rea-panel-header">
              <div>
                <h3>Reporte de caja</h3>
                <p>
                  Consulta los depósitos, retiros y pagos registrados.
                </p>
              </div>
              <CircleDollarSign size={21} />
            </div>

            <div className="rea-subindicadores">
              <article>
                <span>Depósitos</span>
                <strong>{datos.caja.depositos}</strong>
              </article>
              <article>
                <span>Retiros</span>
                <strong>{datos.caja.retiros}</strong>
              </article>
              <article>
                <span>Pagos</span>
                <strong>{datos.caja.pagos}</strong>
              </article>
              <article>
                <span>Importe total</span>
                <strong>${Number(datos.caja.importeTotal).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong>
              </article>
            </div>

            {datos.caja.registros.length === 0 ? (
              renderizarEstadoVacio(
                "No hay movimientos de caja",
                "Los movimientos registrados por caja aparecerán en este reporte."
              )
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {datos.caja.registros.map((t: any) => (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid #ece5db",
                      background: "#ffffff",
                    }}
                  >
                    <span><strong>{t.folio}</strong> · {t.tipo} · Titular: {t.cliente}</span>
                    <span><strong>${Number(t.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong> ({t.fecha})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "Personal":
        return (
          <div className="rea-panel">
            <div className="rea-panel-header">
              <div>
                <h3>Reporte de personal</h3>
                <p>
                  Consulta la actividad y distribución del personal por área.
                </p>
              </div>
              <BriefcaseBusiness size={21} />
            </div>

            <div className="rea-subindicadores">
              <article>
                <span>Supervisores</span>
                <strong>{datos.personal.supervisores}</strong>
              </article>
              <article>
                <span>Escritorio</span>
                <strong>{datos.personal.escritorio}</strong>
              </article>
              <article>
                <span>Cajeros</span>
                <strong>{datos.personal.cajeros}</strong>
              </article>
              <article>
                <span>Recepción</span>
                <strong>{datos.personal.recepcion}</strong>
              </article>
            </div>

            {datos.personal.registros.length === 0 ? (
              renderizarEstadoVacio(
                "Sin actividad registrada",
                "Los registros de actividad del personal aparecerán aquí."
              )
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {datos.personal.registros.map((e: any) => (
                  <div
                    key={e.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid #ece5db",
                      background: "#ffffff",
                    }}
                  >
                    <span><strong>{e.nombre}</strong> ({e.numero}) · Puesto: {e.puesto}</span>
                    <span>{e.sucursal} · <strong>{e.estado}</strong></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="rea-page">
      <div className="rea-encabezado">
        <div>
          <span className="rea-superior">
            ADMINISTRACIÓN GENERAL
          </span>
          <h2>Reportes</h2>
          <p>
            Consulta información y reportes generales de las operaciones
            de BANUAT.
          </p>
        </div>

        <div className="rea-encabezado-icon">
          <FileBarChart size={27} />
        </div>
      </div>

      <div className="rea-filtros">
        <div className="rea-filtro-campo">
          <label>Fecha inicial</label>
          <div className="rea-input-icon">
            <CalendarDays size={16} />
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
        </div>

        <div className="rea-filtro-campo">
          <label>Fecha final</label>
          <div className="rea-input-icon">
            <CalendarDays size={16} />
            <input
              type="date"
              value={fechaFin}
              min={fechaInicio || undefined}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
        </div>

        <div className="rea-filtro-campo">
          <label>Tipo de reporte</label>
          <select
            value={tipoReporte}
            onChange={(e) => setTipoReporte(e.target.value)}
          >
            <option value="todos">Todos los reportes</option>
            <option value="clientes">Clientes</option>
            <option value="prestamos">Préstamos</option>
            <option value="caja">Caja</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        <button
          className="rea-btn-filtrar"
          onClick={() => {
            const seccionesPorTipo: Record<string, SeccionReporte> = {
              todos: "Resumen general",
              clientes: "Clientes",
              prestamos: "Préstamos",
              caja: "Caja",
              personal: "Personal",
            };

            cambiarSeccion(seccionesPorTipo[tipoReporte]);
            cargarReportes(fechaInicio, fechaFin);
          }}
        >
          <Search size={16} />
          Consultar
        </button>
      </div>

      <div className="rea-secciones">
        {secciones.map(({ nombre, icono: Icono }) => (
          <button
            key={nombre}
            className={`rea-tab ${
              seccionActiva === nombre ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion(nombre)}
          >
            <Icono size={17} />
            {nombre}
          </button>
        ))}
      </div>

      <div className="rea-descripcion">
        <div>
          <h3>{seccionActiva}</h3>
          <p>{obtenerDescripcion()}</p>
        </div>
        <div className="rea-descripcion-icon">
          <ClipboardList size={22} />
        </div>
      </div>

      {renderizarContenido()}

      <div className="rea-nota">
        <Info size={18} />
        <p>
          Los reportes mostrarán información obtenida de los registros
          del sistema. La exportación y generación de documentos se
          habilitarán cuando se conecten las fuentes de información.
        </p>
      </div>
    </div>
  );
}
