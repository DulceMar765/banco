import { useState } from "react";
import { getApiUrl } from "../../services/auth";
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
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import "./Depositos.css";

export default function Depositos() {
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [titular, setTitular] = useState("");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const buscarCuenta = async () => {
    if (!numeroCuenta.trim()) {
      setMensaje({ tipo: "error", texto: "Ingresa un número de cuenta para buscar." });
      return;
    }
    setBuscando(true);
    setMensaje(null);
    try {
      const res = await fetch(getApiUrl(`/api/caja/consulta-cuenta/${encodeURIComponent(numeroCuenta.trim())}`));
      const data = await res.json();
      if (!res.ok || !data.success || !data.cliente) {
        setTitular("");
        setMensaje({ tipo: "error", texto: data.message || "No se encontró ninguna cuenta con ese número." });
      } else {
        setTitular(data.cliente.nombre);
        setNumeroCuenta(data.cuenta.numero);
        setMensaje({ tipo: "ok", texto: `Cuenta verificada: ${data.cliente.nombre} (${data.cuenta.tipo})` });
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: "Error al consultar la cuenta en el servidor." });
    } finally {
      setBuscando(false);
    }
  };

  const handleDeposito = async () => {
    const montoNum = Number(monto);
    if (!numeroCuenta.trim()) {
      setMensaje({ tipo: "error", texto: "Indica el número de cuenta de destino." });
      return;
    }
    if (!montoNum || montoNum <= 0) {
      setMensaje({ tipo: "error", texto: "Ingresa un monto válido mayor a $0.00 MXN." });
      return;
    }

    setProcesando(true);
    setMensaje(null);
    try {
      const res = await fetch(getApiUrl("/api/caja/deposito"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroCuenta: numeroCuenta.trim(),
          monto: montoNum,
          notas: observaciones.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMensaje({ tipo: "error", texto: data.message || "Error al procesar el depósito." });
      } else {
        setMensaje({
          tipo: "ok",
          texto: `¡Depósito completado con éxito! Folio: ${data.folio} | Saldo final: $${Number(data.saldoFinal).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`,
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
    setMonto("");
    setObservaciones("");
    setMensaje(null);
  };

  const puedeContinuar = Boolean(numeroCuenta.trim() && Number(monto) > 0 && !procesando);

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
                  placeholder="Ingresa el número de cuenta (ej. CTA26000000001)"
                  value={numeroCuenta}
                  onChange={(e) => setNumeroCuenta(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      buscarCuenta();
                    }
                  }}
                />

                <button
                  type="button"
                  className="dp-buscar-btn"
                  aria-label="Buscar cuenta"
                  title="Buscar cuenta"
                  disabled={buscando}
                  onClick={buscarCuenta}
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
              disabled={!puedeContinuar}
              onClick={handleDeposito}
            >
              {procesando ? "Procesando..." : "Continuar"}
              <ChevronRight size={18} />
            </button>
          </div>

          <p className="dp-pendiente">
            Las operaciones se asientan de forma atómica en el libro mayor contable de BANUAT.
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
