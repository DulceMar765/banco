import { useState } from "react";
import { getApiUrl } from "../../services/auth";
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
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import "./Retiros.css";

export default function Retiros() {
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [titular, setTitular] = useState("");
  const [saldoDisponible, setSaldoDisponible] = useState<number | null>(null);
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
        setSaldoDisponible(null);
        setMensaje({ tipo: "error", texto: data.message || "No se encontró ninguna cuenta con ese número." });
      } else {
        setTitular(data.cliente.nombre);
        setNumeroCuenta(data.cuenta.numero);
        setSaldoDisponible(Number(data.cuenta.saldo));
        setMensaje({
          tipo: "ok",
          texto: `Cuenta verificada: ${data.cliente.nombre} | Saldo disponible: $${Number(data.cuenta.saldo).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`,
        });
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: "Error al consultar la cuenta en el servidor." });
    } finally {
      setBuscando(false);
    }
  };

  const handleRetiro = async () => {
    const montoNum = Number(monto);
    if (!numeroCuenta.trim()) {
      setMensaje({ tipo: "error", texto: "Indica el número de cuenta de origen." });
      return;
    }
    if (!montoNum || montoNum <= 0) {
      setMensaje({ tipo: "error", texto: "Ingresa un monto válido mayor a $0.00 MXN." });
      return;
    }
    if (saldoDisponible !== null && montoNum > saldoDisponible) {
      setMensaje({
        tipo: "error",
        texto: `Saldo insuficiente. Saldo disponible en cuenta: $${saldoDisponible.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN.`,
      });
      return;
    }

    setProcesando(true);
    setMensaje(null);
    try {
      const res = await fetch(getApiUrl("/api/caja/retiro"), {
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
        setMensaje({ tipo: "error", texto: data.message || "Error al procesar el retiro." });
      } else {
        setMensaje({
          tipo: "ok",
          texto: `¡Retiro entregado con éxito! Folio: ${data.folio} | Nuevo saldo en cuenta: $${Number(data.saldoFinal).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`,
        });
        setSaldoDisponible(Number(data.saldoFinal));
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
    setSaldoDisponible(null);
    setMonto("");
    setObservaciones("");
    setMensaje(null);
  };

  const puedeContinuar = Boolean(numeroCuenta.trim() && Number(monto) > 0 && !procesando);

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
                  className="rt-buscar-btn"
                  aria-label="Buscar cuenta"
                  title="Buscar cuenta"
                  disabled={buscando}
                  onClick={buscarCuenta}
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
              disabled={!puedeContinuar}
              onClick={handleRetiro}
            >
              {procesando ? "Procesando..." : "Continuar"}
              <ChevronRight size={18} />
            </button>
          </div>

          <p className="rt-pendiente">
            El sistema valida estrictamente la no existencia de sobregiros antes de autorizar la entrega de efectivo.
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

            {saldoDisponible !== null && (
              <div className="rt-resumen-dato">
                <span>Saldo disponible</span>
                <strong style={{ color: "#16a34a" }}>
                  ${saldoDisponible.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                </strong>
              </div>
            )}

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
