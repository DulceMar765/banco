
import { useState } from "react";
import {
  ArrowUpFromLine,
  Search,
  UserRound,
  Wallet,
  Banknote,
  CircleDollarSign,
  Info,
  RotateCcw,
  ChevronRight,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

import "./Retiros.css";

export default function Retiros() {
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
    <div className="rt-container">

      {/* ENCABEZADO */}
      <div className="rt-encabezado">
        <div>
          <span className="rt-etiqueta">
            OPERACIONES / RETIROS
          </span>

          <h2>Nuevo retiro</h2>

          <p>
            Captura la información necesaria para realizar
            un retiro de efectivo.
          </p>
        </div>

        <div className="rt-encabezado-icono">
          <ArrowUpFromLine size={25} />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="rt-contenido">

        {/* FORMULARIO */}
        <section className="rt-card rt-formulario">

          <div className="rt-card-encabezado">
            <div className="rt-card-icono rt-icono-naranja">
              <Wallet size={21} />
            </div>

            <div>
              <h3>Información del retiro</h3>
              <p>Datos de la cuenta y cantidad solicitada</p>
            </div>
          </div>

          {/* DATOS DEL TITULAR */}
          <div className="rt-seccion">
            <div className="rt-seccion-titulo">
              <UserRound size={17} />
              <h4>Datos del titular</h4>
            </div>

            <div className="rt-campo">
              <label htmlFor="rt-cuenta">
                Número de cuenta
              </label>

              <div className="rt-input-contenedor">
                <CreditCard size={18} />

                <input
                  id="rt-cuenta"
                  type="text"
                  placeholder="Ingresa el número de cuenta"
                  value={numeroCuenta}
                  onChange={(e) => setNumeroCuenta(e.target.value)}
                />

                <button
                  type="button"
                  className="rt-buscar-btn"
                  aria-label="Buscar cuenta"
                  title="Buscar cuenta"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>

            <div className="rt-campo">
              <label htmlFor="rt-titular">
                Nombre del titular
              </label>

              <div className="rt-input-contenedor">
                <UserRound size={18} />

                <input
                  id="rt-titular"
                  type="text"
                  placeholder="Nombre del titular"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rt-separador" />

          {/* DETALLES DEL RETIRO */}
          <div className="rt-seccion">
            <div className="rt-seccion-titulo">
              <Banknote size={17} />
              <h4>Detalles del retiro</h4>
            </div>

            <div className="rt-campo">
              <label htmlFor="rt-monto">
                Monto a retirar
              </label>

              <div className="rt-monto-contenedor">
                <span>$</span>

                <input
                  id="rt-monto"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                />

                <span className="rt-moneda">MXN</span>
              </div>
            </div>

            <div className="rt-campo">
              <label htmlFor="rt-observaciones">
                Observaciones
                <span className="rt-opcional">Opcional</span>
              </label>

              <textarea
                id="rt-observaciones"
                rows={3}
                placeholder="Agrega alguna observación..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </div>

          {/* ACCIONES */}
          <div className="rt-acciones">
            <button
              type="button"
              className="rt-btn-secundario"
              onClick={limpiarCampos}
            >
              <RotateCcw size={17} />
              Limpiar campos
            </button>

            <button
              type="button"
              className="rt-btn-principal"
              disabled
            >
              Continuar
              <ChevronRight size={18} />
            </button>
          </div>

          <p className="rt-pendiente">
            La operación estará disponible cuando se conecte
            el proceso de retiros.
          </p>
        </section>

        {/* PANEL LATERAL */}
        <aside className="rt-lateral">

          <div className="rt-card rt-resumen">
            <div className="rt-resumen-icono">
              <CircleDollarSign size={25} />
            </div>

            <h3>Resumen del retiro</h3>

            <p>
              Aquí se mostrará un resumen de la información
              capturada.
            </p>

            <div className="rt-resumen-dato">
              <span>Cuenta de origen</span>
              <strong>{numeroCuenta || "—"}</strong>
            </div>

            <div className="rt-resumen-dato">
              <span>Titular</span>
              <strong>{titular || "—"}</strong>
            </div>

            <div className="rt-resumen-dato">
              <span>Monto</span>
              <strong className="rt-resumen-monto">
                {monto
                  ? `$${Number(monto).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} MXN`
                  : "—"}
              </strong>
            </div>
          </div>

          {/* AVISO */}
          <div className="rt-aviso">
            <div className="rt-aviso-icono">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h4>Verificación</h4>
              <p>
                Antes de entregar efectivo, verifica la identidad
                del titular y los datos de la cuenta conforme
                al procedimiento establecido.
              </p>
            </div>
          </div>

          {/* INFORMACIÓN */}
          <div className="rt-ayuda">
            <div className="rt-ayuda-icono">
              <Info size={20} />
            </div>

            <div>
              <h4>Retiros</h4>
              <p>
                En este apartado se gestionará la entrega
                de efectivo correspondiente a las cuentas.
              </p>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
