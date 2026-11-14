import { useState, useEffect } from "react";
import { getApiUrl } from "../../services/auth";
import {
  Wallet,
  Banknote,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  Clock3,
  Info,
  RotateCcw,
  LockKeyhole,
  FileText,
} from "lucide-react";

import "./ControlCaja.css";

export default function ControlCaja() {
  const [fondoInicial, setFondoInicial] = useState("");
  const [efectivoContado, setEfectivoContado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [resumen, setResumen] = useState<{
    cajero: string;
    caja: string;
    estadoCaja: string;
    fondoInicial: number;
    totalEntradas: number;
    totalSalidas: number;
    saldoEfectivo: number;
  }>({
    cajero: "Marcos Delgado",
    caja: "Caja 01 - Principal",
    estadoCaja: "ABIERTA",
    fondoInicial: 15000,
    totalEntradas: 0,
    totalSalidas: 0,
    saldoEfectivo: 15000,
  });

  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const cargarDatos = async () => {
    try {
      const res = await fetch(getApiUrl("/api/caja/resumen"));
      const data = await res.json();
      if (data.success && data.resumen) {
        setResumen(data.resumen);
      }
    } catch (err) {
      console.error("Error al cargar resumen:", err);
    }

    try {
      const resMov = await fetch(getApiUrl("/api/caja/movimientos"));
      const dataMov = await resMov.json();
      if (dataMov.success && Array.isArray(dataMov.movimientos)) {
        setMovimientos(dataMov.movimientos);
      }
    } catch (err) {
      console.error("Error al cargar movimientos:", err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarCampos = () => {
    setFondoInicial("");
    setEfectivoContado("");
    setObservaciones("");
    setMensaje(null);
  };

  const handleApertura = async () => {
    const fondo = Number(fondoInicial);
    if (!fondo || fondo <= 0) {
      setMensaje({ tipo: "error", texto: "Ingresa un fondo inicial válido." });
      return;
    }
    setCargando(true);
    setMensaje(null);
    try {
      const res = await fetch(getApiUrl("/api/caja/apertura"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fondoInicial: fondo }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMensaje({ tipo: "error", texto: data.message || "Error al registrar apertura de caja." });
      } else {
        setMensaje({ tipo: "ok", texto: `Apertura exitosa. Folio de sesión: ${data.sesion?.session_number || "REGISTRADA"}` });
        setFondoInicial("");
        cargarDatos();
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: "Error de red al conectar con el servidor." });
    } finally {
      setCargando(false);
    }
  };

  const handleCierre = async () => {
    const contado = Number(efectivoContado);
    if (isNaN(contado) || contado < 0) {
      setMensaje({ tipo: "error", texto: "Ingresa el efectivo contado físicamente en caja." });
      return;
    }
    setCargando(true);
    setMensaje(null);
    try {
      const res = await fetch(getApiUrl("/api/caja/cierre"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ efectivoContado: contado, notas: observaciones }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMensaje({ tipo: "error", texto: data.message || "Error al realizar cierre de caja." });
      } else {
        const difTexto = data.cierre?.diferencia !== undefined ? ` (Diferencia: $${Number(data.cierre.diferencia).toFixed(2)})` : "";
        setMensaje({ tipo: "ok", texto: `Cierre de caja completado con éxito.${difTexto}` });
        setEfectivoContado("");
        setObservaciones("");
        cargarDatos();
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: "Error de red al conectar con el servidor." });
    } finally {
      setCargando(false);
    }
  };

  const esAbierta = resumen.estadoCaja === "ABIERTA";

  return (
    <div className="cc-container">
      {/* ENCABEZADO */}
      <div className="cc-header">
        <div>
          <span className="cc-section-label">OPERACIONES DE CAJA</span>
          <h1>Control de caja</h1>
          <p>
            Consulta el estado de caja y revisa la información de apertura y
            cierre de jornada.
          </p>
        </div>

        <div className="cc-status">
          <span className="cc-status-dot" style={{ backgroundColor: esAbierta ? "#16a34a" : "#dc2626" }}></span>
          <span>{esAbierta ? "Jornada activa" : "Caja cerrada"}</span>
        </div>
      </div>

      {mensaje && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          backgroundColor: mensaje.tipo === "ok" ? "#dcfce7" : "#fee2e2",
          color: mensaje.tipo === "ok" ? "#166534" : "#991b1b",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <Info size={18} />
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* RESUMEN */}
      <div className="cc-summary">
        <div className="cc-summary-card">
          <div className="cc-summary-icon cc-orange">
            <Wallet size={21} />
          </div>
          <div>
            <span>Saldo disponible</span>
            <h2>${Number(resumen.saldoEfectivo).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <small>Fondo inicial: ${Number(resumen.fondoInicial).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</small>
          </div>
        </div>

        <div className="cc-summary-card">
          <div className="cc-summary-icon cc-green">
            <ArrowDownToLine size={21} />
          </div>
          <div>
            <span>Total de entradas</span>
            <h2>${Number(resumen.totalEntradas).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <small>Depósitos y abonos</small>
          </div>
        </div>

        <div className="cc-summary-card">
          <div className="cc-summary-icon cc-red">
            <ArrowUpFromLine size={21} />
          </div>
          <div>
            <span>Total de salidas</span>
            <h2>${Number(resumen.totalSalidas).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <small>Retiros entregados</small>
          </div>
        </div>

        <div className="cc-summary-card">
          <div className="cc-summary-icon cc-brown">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Estado de jornada</span>
            <h2 className="cc-summary-status">{resumen.estadoCaja}</h2>
            <small>{esAbierta ? "Sesión activa en sistema" : "Sin sesión abierta"}</small>
          </div>
        </div>
      </div>

      {/* APERTURA Y CIERRE */}
      <div className="cc-panels">
        {/* APERTURA */}
        <section className="cc-panel">
          <div className="cc-panel-header">
            <div className="cc-panel-icon cc-orange">
              <LockKeyhole size={20} />
            </div>

            <div>
              <h2>Apertura de caja</h2>
              <p>Información inicial de la jornada</p>
            </div>
          </div>

          <div className="cc-field">
            <label htmlFor="cc-fondo">Fondo inicial de caja</label>
            <div className="cc-input-money">
              <span>$</span>
              <input
                id="cc-fondo"
                type="number"
                min="0"
                placeholder="0.00"
                value={fondoInicial}
                disabled={esAbierta || cargando}
                onChange={(e) => setFondoInicial(e.target.value)}
              />
              <small>MXN</small>
            </div>
            <span className="cc-field-help">
              Cantidad de efectivo con la que inicia la jornada.
            </span>
          </div>

          <div className="cc-info-box">
            <Info size={17} />
            <p>
              El fondo inicial representa el efectivo disponible al comenzar
              las operaciones de caja.
            </p>
          </div>

          <button
            className="cc-button cc-button-orange"
            disabled={esAbierta || cargando || !fondoInicial || Number(fondoInicial) <= 0}
            onClick={handleApertura}
          >
            <LockKeyhole size={17} />
            {cargando ? "Registrando..." : "Registrar apertura"}
          </button>
        </section>

        {/* CIERRE */}
        <section className="cc-panel">
          <div className="cc-panel-header">
            <div className="cc-panel-icon cc-green">
              <ClipboardCheck size={20} />
            </div>

            <div>
              <h2>Cierre de caja</h2>
              <p>Revisión del efectivo al finalizar la jornada</p>
            </div>
          </div>

          <div className="cc-field">
            <label htmlFor="cc-efectivo">Efectivo contado</label>
            <div className="cc-input-money">
              <span>$</span>
              <input
                id="cc-efectivo"
                type="number"
                min="0"
                placeholder="0.00"
                value={efectivoContado}
                disabled={!esAbierta || cargando}
                onChange={(e) => setEfectivoContado(e.target.value)}
              />
              <small>MXN</small>
            </div>
            <span className="cc-field-help">
              Cantidad de efectivo que se encuentra físicamente en caja.
            </span>
          </div>

          <div className="cc-field">
            <label htmlFor="cc-observaciones">Observaciones</label>
            <textarea
              id="cc-observaciones"
              placeholder="Escribe alguna observación sobre el cierre..."
              rows={3}
              value={observaciones}
              disabled={!esAbierta || cargando}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          <div className="cc-info-box">
            <Info size={17} />
            <p>
              Antes de finalizar la jornada, se debe comparar el efectivo
              contado con el saldo que indique el sistema.
            </p>
          </div>

          <button
            className="cc-button cc-button-green"
            disabled={!esAbierta || cargando || efectivoContado === ""}
            onClick={handleCierre}
          >
            <ClipboardCheck size={17} />
            {cargando ? "Procesando..." : "Realizar cierre"}
          </button>
        </section>
      </div>

      {/* MOVIMIENTOS */}
      <section className="cc-movements">
        <div className="cc-movements-header">
          <div>
            <h2>Movimientos de caja</h2>
            <p>Entradas y salidas registradas durante la jornada.</p>
          </div>

          <div className="cc-movements-icon">
            <FileText size={20} />
          </div>
        </div>

        <div className="cc-table-wrapper">
          <table className="cc-table">
            <thead>
              <tr>
                <th>Tipo de movimiento</th>
                <th>Descripción</th>
                <th>Referencia</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="cc-empty">
                      <div className="cc-empty-icon">
                        <Banknote size={25} />
                      </div>
                      <h3>Sin movimientos para mostrar</h3>
                      <p>
                        Aquí aparecerán las entradas y salidas de efectivo
                        cuando existan registros disponibles.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                movimientos.map((m: any) => (
                  <tr key={m.id}>
                    <td><strong>{m.tipo}</strong></td>
                    <td>{m.descripcion}</td>
                    <td><code>{m.folio}</code></td>
                    <td style={{ color: "#16a34a", fontWeight: 600 }}>
                      {m.direccion === "CREDIT" ? `$${Number(m.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td style={{ color: "#dc2626", fontWeight: 600 }}>
                      {m.direccion === "DEBIT" ? `$${Number(m.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td>{new Date(m.fecha).toLocaleString("es-MX")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ACCIONES */}
      <div className="cc-footer">
        <div className="cc-footer-info">
          <Info size={17} />
          <span>
            Las operaciones se registran con firma digital y folio fiscal en el sistema central de BANUAT.
          </span>
        </div>

        <button className="cc-button cc-button-light" onClick={limpiarCampos}>
          <RotateCcw size={16} />
          Limpiar campos
        </button>
      </div>
    </div>
  );
}
