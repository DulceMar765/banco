
import { useState } from "react";
import {
  Wallet,
  Search,
  UserRound,
  Banknote,
  FileText,
  CircleDollarSign,
  Info,
  RotateCcw,
  ChevronRight,
  CreditCard,
  Receipt,
  HandCoins,
} from "lucide-react";

import "./Pagos.css";

export default function Pagos() {
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [titular, setTitular] = useState("");
  const [referenciaPrestamo, setReferenciaPrestamo] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("pago");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const limpiarCampos = () => {
    setNumeroCuenta("");
    setTitular("");
    setReferenciaPrestamo("");
    setTipoMovimiento("pago");
    setMonto("");
    setObservaciones("");
  };

  const formatoMonto = monto
    ? Number(monto).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
      })
    : "$0.00";

  return (
    <div className="pg-contenedor">
      <div className="pg-encabezado">
        <div>
          <span className="pg-etiqueta">OPERACIONES DE CAJA</span>
          <h1>Pagos y abonos</h1>
          <p>
            Captura la información del pago o abono correspondiente al
            préstamo del cliente.
          </p>
        </div>

        <div className="pg-encabezado-icono">
          <HandCoins size={27} />
        </div>
      </div>

      <div className="pg-contenido">
        <section className="pg-tarjeta pg-formulario">
          <div className="pg-tarjeta-encabezado">
            <div className="pg-icono-seccion">
              <Receipt size={20} />
            </div>

            <div>
              <h2>Información de la operación</h2>
              <p>Ingresa los datos solicitados</p>
            </div>
          </div>

          <div className="pg-seccion">
            <h3>
              <UserRound size={17} />
              Datos del cliente
            </h3>

            <div className="pg-campo">
              <label htmlFor="pg-cuenta">Número de cuenta</label>

              <div className="pg-input-con-icono">
                <Wallet size={18} />

                <input
                  id="pg-cuenta"
                  type="text"
                  placeholder="Ingresa el número de cuenta"
                  value={numeroCuenta}
                  onChange={(e) => setNumeroCuenta(e.target.value)}
                />

                <button
                  type="button"
                  className="pg-boton-buscar"
                  title="Buscar cuenta"
                  aria-label="Buscar cuenta"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>

            <div className="pg-campo">
              <label htmlFor="pg-titular">Nombre del titular</label>

              <div className="pg-input-con-icono">
                <UserRound size={18} />

                <input
                  id="pg-titular"
                  type="text"
                  placeholder="Nombre completo del cliente"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pg-separador" />

          <div className="pg-seccion">
            <h3>
              <FileText size={17} />
              Datos del préstamo
            </h3>

            <div className="pg-campo">
              <label htmlFor="pg-referencia">
                Número o referencia del préstamo
              </label>

              <div className="pg-input-con-icono">
                <CreditCard size={18} />

                <input
                  id="pg-referencia"
                  type="text"
                  placeholder="Ingresa la referencia del préstamo"
                  value={referenciaPrestamo}
                  onChange={(e) => setReferenciaPrestamo(e.target.value)}
                />
              </div>
            </div>

            <div className="pg-campo">
              <label htmlFor="pg-tipo">Tipo de movimiento</label>

              <select
                id="pg-tipo"
                value={tipoMovimiento}
                onChange={(e) => setTipoMovimiento(e.target.value)}
              >
                <option value="pago">Pago de préstamo</option>
                <option value="abono">Abono a préstamo</option>
              </select>
            </div>
          </div>

          <div className="pg-separador" />

          <div className="pg-seccion">
            <h3>
              <Banknote size={17} />
              Información del pago
            </h3>

            <div className="pg-campo">
              <label htmlFor="pg-monto">Monto</label>

              <div className="pg-input-con-icono">
                <CircleDollarSign size={18} />

                <input
                  id="pg-monto"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                />
              </div>
            </div>

            <div className="pg-campo">
              <label htmlFor="pg-observaciones">
                Observaciones <span>(opcional)</span>
              </label>

              <textarea
                id="pg-observaciones"
                rows={3}
                placeholder="Agrega alguna observación sobre la operación..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </div>

          <div className="pg-acciones">
            <button
              type="button"
              className="pg-boton-limpiar"
              onClick={limpiarCampos}
            >
              <RotateCcw size={17} />
              Limpiar campos
            </button>

            <button
              type="button"
              className="pg-boton-continuar"
              disabled
            >
              Continuar
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        <aside className="pg-lateral">
          <div className="pg-tarjeta pg-resumen">
            <div className="pg-resumen-encabezado">
              <div className="pg-icono-resumen">
                <Receipt size={20} />
              </div>
              <h2>Resumen del movimiento</h2>
            </div>

            <div className="pg-resumen-tipo">
              <span>Tipo de movimiento</span>
              <strong>
                {tipoMovimiento === "pago"
                  ? "Pago de préstamo"
                  : "Abono a préstamo"}
              </strong>
            </div>

            <div className="pg-resumen-datos">
              <div>
                <span>Cuenta</span>
                <strong>{numeroCuenta || "—"}</strong>
              </div>

              <div>
                <span>Titular</span>
                <strong>{titular || "—"}</strong>
              </div>

              <div>
                <span>Referencia del préstamo</span>
                <strong>{referenciaPrestamo || "—"}</strong>
              </div>
            </div>

            <div className="pg-resumen-total">
              <span>Monto capturado</span>
              <strong>{formatoMonto}</strong>
            </div>

            <div className="pg-resumen-nota">
              <Info size={17} />
              <p>
                Este resumen es únicamente informativo. No representa un
                pago realizado ni modifica el saldo del préstamo.
              </p>
            </div>
          </div>

          <div className="pg-tarjeta pg-aviso">
            <div className="pg-aviso-icono">
              <Info size={20} />
            </div>

            <div>
              <h3>Antes de continuar</h3>
              <p>
                Verifica la identidad del cliente, la cuenta y la referencia
                del préstamo antes de procesar cualquier pago o abono.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
