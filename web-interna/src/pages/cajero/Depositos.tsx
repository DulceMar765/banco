
import { useState } from "react";
import {
  ArrowDownToLine,
  Search,
  UserRound,
  Wallet,
  Banknote,
  FileText,
  CircleDollarSign,
  Info,
  RotateCcw,
  ChevronRight,
  CreditCard,
} from "lucide-react";

import "./Depositos.css";

export default function Depositos() {
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [titular, setTitular] = useState("");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const limpiarCampos = () => {
    setNumeroCuenta("");
    setTitular("");
    setMonto("");
    setObservaciones("");
  };

  return (
    <div className="dp-container">

      {/* ENCABEZADO */}
      <div className="dp-encabezado">
        <div>
          <span className="dp-etiqueta">
            OPERACIONES / DEPÓSITOS
          </span>

          <h2>Nuevo depósito</h2>

          <p>
            Captura la información necesaria para realizar
            un depósito en efectivo.
          </p>
        </div>

        <div className="dp-encabezado-icono">
          <ArrowDownToLine size={25} />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="dp-contenido">

        {/* FORMULARIO */}
        <section className="dp-card dp-formulario">

          <div className="dp-card-encabezado">
            <div className="dp-card-icono dp-icono-verde">
              <Wallet size={21} />
            </div>

            <div>
              <h3>Información del depósito</h3>
              <p>Datos de la cuenta y cantidad a depositar</p>
            </div>
          </div>

          <div className="dp-seccion">
            <div className="dp-seccion-titulo">
              <UserRound size={17} />
              <h4>Datos del titular</h4>
            </div>

            <div className="dp-campo">
              <label htmlFor="dp-cuenta">
                Número de cuenta
              </label>

              <div className="dp-input-contenedor">
                <CreditCard size={18} />

                <input
                  id="dp-cuenta"
                  type="text"
                  placeholder="Ingresa el número de cuenta"
                  value={numeroCuenta}
                  onChange={(e) => setNumeroCuenta(e.target.value)}
                />

                <button
                  type="button"
                  className="dp-buscar-btn"
                  aria-label="Buscar cuenta"
                  title="Buscar cuenta"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>

            <div className="dp-campo">
              <label htmlFor="dp-titular">
                Nombre del titular
              </label>

              <div className="dp-input-contenedor">
                <UserRound size={18} />

                <input
                  id="dp-titular"
                  type="text"
                  placeholder="Nombre del titular"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="dp-separador" />

          <div className="dp-seccion">
            <div className="dp-seccion-titulo">
              <Banknote size={17} />
              <h4>Detalles del depósito</h4>
            </div>

            <div className="dp-campo">
              <label htmlFor="dp-monto">
                Monto a depositar
              </label>

              <div className="dp-monto-contenedor">
                <span>$</span>

                <input
                  id="dp-monto"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                />

                <span className="dp-moneda">MXN</span>
              </div>
            </div>

            <div className="dp-campo">
              <label htmlFor="dp-observaciones">
                Observaciones
                <span className="dp-opcional">Opcional</span>
              </label>

              <textarea
                id="dp-observaciones"
                rows={3}
                placeholder="Agrega alguna observación..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </div>

          {/* ACCIONES */}
          <div className="dp-acciones">
            <button
              type="button"
              className="dp-btn-secundario"
              onClick={limpiarCampos}
            >
              <RotateCcw size={17} />
              Limpiar campos
            </button>

            <button
              type="button"
              className="dp-btn-principal"
              disabled
            >
              Continuar
              <ChevronRight size={18} />
            </button>
          </div>

          <p className="dp-pendiente">
            La operación estará disponible cuando se conecte
            el proceso de depósitos.
          </p>
        </section>

        {/* PANEL INFORMATIVO */}
        <aside className="dp-lateral">

          <div className="dp-card dp-resumen">
            <div className="dp-resumen-icono">
              <CircleDollarSign size={25} />
            </div>

            <h3>Resumen del depósito</h3>

            <p>
              Aquí se mostrará un resumen de la información
              capturada.
            </p>

            <div className="dp-resumen-dato">
              <span>Cuenta de destino</span>
              <strong>
                {numeroCuenta || "—"}
              </strong>
            </div>

            <div className="dp-resumen-dato">
              <span>Titular</span>
              <strong>
                {titular || "—"}
              </strong>
            </div>

            <div className="dp-resumen-dato">
              <span>Monto</span>
              <strong className="dp-resumen-monto">
                {monto
                  ? `$${Number(monto).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} MXN`
                  : "—"}
              </strong>
            </div>
          </div>

          <div className="dp-aviso">
            <div className="dp-aviso-icono">
              <Info size={19} />
            </div>

            <div>
              <h4>Importante</h4>
              <p>
                Verifica los datos de la cuenta y el efectivo
                recibido antes de completar cualquier operación.
              </p>
            </div>
          </div>

          <div className="dp-ayuda">
            <div className="dp-ayuda-icono">
              <FileText size={20} />
            </div>

            <div>
              <h4>Depósitos</h4>
              <p>
                En este apartado se gestionará la recepción
                de efectivo para las cuentas correspondientes.
              </p>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
