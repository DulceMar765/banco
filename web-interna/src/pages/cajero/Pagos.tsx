import { useState } from "react";
import { getApiUrl } from "../../services/auth";
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
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import "./Pagos.css";

export default function Pagos() {
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [titular, setTitular] = useState("");
  const [referenciaPrestamo, setReferenciaPrestamo] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("pago");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const buscarCuentaOPrestamo = async () => {
    const termino = numeroCuenta.trim() || referenciaPrestamo.trim();
    if (!termino) {
      setMensaje({ tipo: "error", texto: "Ingresa un número de cuenta o referencia para buscar." });
      return;
    }

    setBuscando(true);
    setMensaje(null);
    try {
      const res = await fetch(getApiUrl(`/api/caja/consulta-cuenta/${encodeURIComponent(termino)}`));
      const data = await res.json();
      if (!res.ok || !data.success || !data.cliente) {
        setTitular("");
        setMensaje({ tipo: "error", texto: data.message || "No se encontró el registro indicado." });
      } else {
        setTitular(data.cliente.nombre);
        setNumeroCuenta(data.cuenta.numero);
        if (Array.isArray(data.prestamos) && data.prestamos.length > 0) {
          const p = data.prestamos[0];
          setReferenciaPrestamo(p.contract_number);
          setMensaje({
            tipo: "ok",
            texto: `Cliente: ${data.cliente.nombre} | Préstamo detectado: ${p.contract_number} (Saldo pendiente: $${Number(p.principal_balance).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN)`,
          });
        } else {
          setMensaje({
            tipo: "ok",
            texto: `Cliente: ${data.cliente.nombre} | Sin préstamos activos en esta cuenta.`,
          });
        }
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: "Error al consultar en el servidor." });
    } finally {
      setBuscando(false);
    }
  };

  const handlePago = async () => {
    const montoNum = Number(monto);
    if (!referenciaPrestamo.trim()) {
      setMensaje({ tipo: "error", texto: "Ingresa la referencia o contrato del préstamo a pagar." });
      return;
    }
    if (!montoNum || montoNum <= 0) {
      setMensaje({ tipo: "error", texto: "Ingresa un monto válido mayor a $0.00 MXN." });
      return;
    }

    setProcesando(true);
    setMensaje(null);
    try {
      const res = await fetch(getApiUrl("/api/caja/pago-prestamo"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenciaPrestamo: referenciaPrestamo.trim(),
          monto: montoNum,
          notas: observaciones.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMensaje({ tipo: "error", texto: data.message || "Error al registrar el pago." });
      } else {
        setMensaje({
          tipo: "ok",
          texto: `¡Pago registrado exitosamente! Folio: ${data.folio} | Nuevo saldo de préstamo: $${Number(data.saldoRestante).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN | Puntos de lealtad otorgados: +${data.puntosGanados} pts.`,
        });
        setMonto("");
        setObservaciones("");
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: "Error al conectar con el servidor." });
    } finally {
      setProcesando(false);
    }
  };

  const limpiarCampos = () => {
    setNumeroCuenta("");
    setTitular("");
    setReferenciaPrestamo("");
    setTipoMovimiento("pago");
    setMonto("");
    setObservaciones("");
    setMensaje(null);
  };

  const formatoMonto = monto
    ? Number(monto).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
      })
    : "$0.00";

  const puedeContinuar = Boolean(referenciaPrestamo.trim() && Number(monto) > 0 && !procesando);

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
          {mensaje.tipo === "ok" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{mensaje.texto}</span>
        </div>
      )}

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
                  placeholder="Ingresa el número de cuenta (ej. CTA26000000001)"
                  value={numeroCuenta}
                  onChange={(e) => setNumeroCuenta(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      buscarCuentaOPrestamo();
                    }
                  }}
                />

                <button
                  type="button"
                  className="pg-boton-buscar"
                  title="Buscar cuenta"
                  aria-label="Buscar cuenta"
                  disabled={buscando}
                  onClick={buscarCuentaOPrestamo}
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
                  placeholder="Ingresa la referencia (ej. PREST-2026-0001)"
                  value={referenciaPrestamo}
                  onChange={(e) => setReferenciaPrestamo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      buscarCuentaOPrestamo();
                    }
                  }}
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
              disabled={!puedeContinuar}
              onClick={handlePago}
            >
              {procesando ? "Registrando..." : "Continuar"}
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
                Los abonos a préstamos generan puntos de lealtad automáticos conforme a la regla BANUAT (100 pts = $1 MXN).
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
