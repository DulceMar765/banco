import { useState, useEffect } from "react";
import { getApiUrl } from "../../services/auth";
import {
  Search,
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  CalendarDays,
  FileText,
  Filter,
  RotateCcw,
  Info,
} from "lucide-react";

import "./Historial.css";

type TipoMovimiento = "todos" | "deposito" | "retiro" | "pago";

export default function Historial() {
  const [busqueda, setBusqueda] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [resumen, setResumen] = useState<{
    operaciones: { total: number; depositos: number; retiros: number; pagos: number };
  }>({
    operaciones: { total: 0, depositos: 0, retiros: 0, pagos: 0 },
  });

  const cargarHistorial = async () => {
    try {
      const res = await fetch(getApiUrl("/api/caja/movimientos"));
      const data = await res.json();
      if (data.success && Array.isArray(data.movimientos)) {
        setMovimientos(data.movimientos);
      }
    } catch (err) {
      console.error("Error al cargar historial:", err);
    }

    try {
      const resR = await fetch(getApiUrl("/api/caja/resumen"));
      const dataR = await resR.json();
      if (dataR.success && dataR.resumen) {
        setResumen(dataR.resumen);
      }
    } catch (err) {
      console.error("Error al cargar resumen:", err);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const limpiarFiltros = () => {
    setBusqueda("");
    setTipoMovimiento("todos");
    setFechaInicio("");
    setFechaFin("");
  };

  const movimientosFiltrados = movimientos.filter((m) => {
    const texto = `${m.folio || ""} ${m.descripcion || ""} ${m.tipo || ""}`.toLowerCase();
    const coincideBusqueda = !busqueda.trim() || texto.includes(busqueda.toLowerCase());

    let coincideTipo = true;
    if (tipoMovimiento === "deposito") {
      coincideTipo = m.tipo.toLowerCase().includes("depósito") || m.tipo.toLowerCase().includes("deposito");
    } else if (tipoMovimiento === "retiro") {
      coincideTipo = m.tipo.toLowerCase().includes("retiro");
    } else if (tipoMovimiento === "pago") {
      coincideTipo = m.tipo.toLowerCase().includes("pago") || m.tipo.toLowerCase().includes("abono");
    }

    let coincideFecha = true;
    const mFecha = new Date(m.fecha);
    if (fechaInicio) {
      coincideFecha = coincideFecha && mFecha >= new Date(fechaInicio);
    }
    if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      coincideFecha = coincideFecha && mFecha <= fin;
    }

    return coincideBusqueda && coincideTipo && coincideFecha;
  });

  return (
    <div className="hi-container">
      {/* ENCABEZADO */}
      <div className="hi-header">
        <div>
          <span className="hi-section-label">CONSULTA DE OPERACIONES</span>
          <h1>Historial de movimientos</h1>
          <p>
            Consulta y revisa las operaciones realizadas en caja.
          </p>
        </div>

        <div className="hi-header-icon">
          <History size={25} />
        </div>
      </div>

      {/* RESUMEN */}
      <div className="hi-summary">
        <div className="hi-summary-card">
          <div className="hi-summary-icon hi-orange">
            <History size={21} />
          </div>
          <div>
            <span>Total de movimientos</span>
            <h2>{resumen.operaciones.total}</h2>
            <small>Registros disponibles</small>
          </div>
        </div>

        <div className="hi-summary-card">
          <div className="hi-summary-icon hi-green">
            <ArrowDownToLine size={21} />
          </div>
          <div>
            <span>Depósitos</span>
            <h2>{resumen.operaciones.depositos}</h2>
            <small>Operaciones registradas</small>
          </div>
        </div>

        <div className="hi-summary-card">
          <div className="hi-summary-icon hi-red">
            <ArrowUpFromLine size={21} />
          </div>
          <div>
            <span>Retiros</span>
            <h2>{resumen.operaciones.retiros}</h2>
            <small>Operaciones registradas</small>
          </div>
        </div>

        <div className="hi-summary-card">
          <div className="hi-summary-icon hi-brown">
            <CreditCard size={21} />
          </div>
          <div>
            <span>Pagos y abonos</span>
            <h2>{resumen.operaciones.pagos}</h2>
            <small>Operaciones registradas</small>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <section className="hi-filters">
        <div className="hi-filters-header">
          <div className="hi-filters-title">
            <Filter size={18} />
            <h2>Buscar movimientos</h2>
          </div>

          <button
            className="hi-clear-button"
            onClick={limpiarFiltros}
          >
            <RotateCcw size={15} />
            Limpiar filtros
          </button>
        </div>

        <div className="hi-filter-grid">
          <div className="hi-filter-field hi-search-field">
            <label htmlFor="hi-busqueda">
              Buscar operación
            </label>

            <div className="hi-input-wrapper">
              <Search size={17} />
              <input
                id="hi-busqueda"
                type="text"
                placeholder="Cuenta o referencia..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="hi-filter-field">
            <label htmlFor="hi-tipo">Tipo de movimiento</label>

            <select
              id="hi-tipo"
              value={tipoMovimiento}
              onChange={(e) =>
                setTipoMovimiento(e.target.value as TipoMovimiento)
              }
            >
              <option value="todos">Todos los movimientos</option>
              <option value="deposito">Depósitos</option>
              <option value="retiro">Retiros</option>
              <option value="pago">Pagos y abonos</option>
            </select>
          </div>

          <div className="hi-filter-field">
            <label htmlFor="hi-fecha-inicio">Fecha inicial</label>

            <div className="hi-input-wrapper">
              <CalendarDays size={16} />
              <input
                id="hi-fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
          </div>

          <div className="hi-filter-field">
            <label htmlFor="hi-fecha-fin">Fecha final</label>

            <div className="hi-input-wrapper">
              <CalendarDays size={16} />
              <input
                id="hi-fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TABLA */}
      <section className="hi-table-section">
        <div className="hi-table-header">
          <div>
            <h2>Registro de operaciones</h2>
            <p>Detalle de los movimientos realizados en caja.</p>
          </div>

          <div className="hi-record-count">
            <FileText size={16} />
            <span>{movimientosFiltrados.length} {movimientosFiltrados.length === 1 ? "registro" : "registros"}</span>
          </div>
        </div>

        <div className="hi-table-wrapper">
          <table className="hi-table">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Tipo de operación</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Detalle</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {movimientosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="hi-empty">
                      <div className="hi-empty-icon">
                        <History size={27} />
                      </div>

                      <h3>No hay movimientos disponibles</h3>

                      <p>
                        Cuando existan operaciones registradas con los filtros seleccionados,
                        podrás consultarlas desde este apartado.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                movimientosFiltrados.map((m: any) => (
                  <tr key={m.id}>
                    <td><code>{m.folio}</code></td>
                    <td><strong>{m.tipo}</strong></td>
                    <td style={{ color: m.direccion === "CREDIT" ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                      {m.direccion === "CREDIT" ? "+" : "-"}${Number(m.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                    </td>
                    <td>{new Date(m.fecha).toLocaleString("es-MX")}</td>
                    <td>{m.descripcion}</td>
                    <td>
                      <span style={{ fontSize: "0.8rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "#f3f4f6" }}>
                        {m.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* INFORMACIÓN */}
      <div className="hi-information">
        <Info size={18} />
        <p>
          El historial es únicamente de consulta. Los movimientos
          registrados no pueden modificarse ni eliminarse desde este módulo.
        </p>
      </div>
    </div>
  );
}
