import { useState } from "react";
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

  const limpiarCampos = () => {
    setFondoInicial("");
    setEfectivoContado("");
    setObservaciones("");
  };

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
          <span className="cc-status-dot"></span>
          <span>Sin iniciar</span>
        </div>
      </div>

      {/* RESUMEN */}
      <div className="cc-summary">
        <div className="cc-summary-card">
          <div className="cc-summary-icon cc-orange">
            <Wallet size={21} />
          </div>
          <div>
            <span>Saldo disponible</span>
            <h2>—</h2>
            <small>Información no disponible</small>
          </div>
        </div>

        <div className="cc-summary-card">
          <div className="cc-summary-icon cc-green">
            <ArrowDownToLine size={21} />
          </div>
          <div>
            <span>Total de entradas</span>
            <h2>—</h2>
            <small>Movimientos de entrada</small>
          </div>
        </div>

        <div className="cc-summary-card">
          <div className="cc-summary-icon cc-red">
            <ArrowUpFromLine size={21} />
          </div>
          <div>
            <span>Total de salidas</span>
            <h2>—</h2>
            <small>Movimientos de salida</small>
          </div>
        </div>

        <div className="cc-summary-card">
          <div className="cc-summary-icon cc-brown">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Estado de jornada</span>
            <h2 className="cc-summary-status">Sin iniciar</h2>
            <small>La caja aún no tiene apertura</small>
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

          <button className="cc-button cc-button-orange" disabled>
            <LockKeyhole size={17} />
            Registrar apertura
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

          <button className="cc-button cc-button-green" disabled>
            <ClipboardCheck size={17} />
            Realizar cierre
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
            </tbody>
          </table>
        </div>
      </section>

      {/* ACCIONES */}
      <div className="cc-footer">
        <div className="cc-footer-info">
          <Info size={17} />
          <span>
            Este módulo es de consulta y diseño. Las operaciones todavía no
            están conectadas a un sistema de registro.
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