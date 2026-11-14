import { useState } from "react";
import { getApiUrl } from "../../services/auth";
import {
  Search,
  UserRound,
  Wallet,
  CreditCard,
  Receipt,
  CircleUserRound,
  Info,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import "./Consultas.css";

type SeccionConsulta = "datos" | "cuentas" | "prestamos" | "pagos";

export default function Consultas() {
  const [busqueda, setBusqueda] = useState("");
  const [seccionActiva, setSeccionActiva] = useState<SeccionConsulta>("datos");
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const [cliente, setCliente] = useState<{
    id: string;
    codigo: string;
    nombre: string;
    email: string;
    telefono: string;
    identificacion: string;
    fechaRegistro: string;
    estado: string;
  } | null>(null);

  const [cuenta, setCuenta] = useState<{
    id: string;
    numero: string;
    tipo: string;
    saldo: number;
    estado: string;
  } | null>(null);

  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);

  const handleBuscar = async () => {
    if (!busqueda.trim()) {
      setMensaje({ tipo: "error", texto: "Ingresa el nombre del cliente o su número de cuenta." });
      return;
    }

    setBuscando(true);
    setMensaje(null);

    try {
      const res = await fetch(getApiUrl(`/api/caja/consulta-cuenta/${encodeURIComponent(busqueda.trim())}`));
      const data = await res.json();
      if (!res.ok || !data.success || !data.cliente) {
        setCliente(null);
        setCuenta(null);
        setPrestamos([]);
        setPagos([]);
        setMensaje({ tipo: "error", texto: data.message || "No se encontró ningún cliente con ese criterio." });
      } else {
        setCliente(data.cliente);
        setCuenta(data.cuenta);
        setPrestamos(Array.isArray(data.prestamos) ? data.prestamos : []);
        setPagos(Array.isArray(data.pagos) ? data.pagos : []);
        setMensaje({ tipo: "ok", texto: `Expediente localizado: ${data.cliente.nombre} (${data.cliente.codigo})` });
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: "Error al consultar la base de datos." });
    } finally {
      setBuscando(false);
    }
  };

  const secciones = [
    {
      id: "datos" as const,
      nombre: "Datos del cliente",
      icono: UserRound,
    },
    {
      id: "cuentas" as const,
      nombre: "Cuentas",
      icono: Wallet,
    },
    {
      id: "prestamos" as const,
      nombre: "Préstamos",
      icono: CreditCard,
    },
    {
      id: "pagos" as const,
      nombre: "Pagos",
      icono: Receipt,
    },
  ];

  const renderContenido = () => {
    if (!cliente) {
      return (
        <div className="cs-vacio">
          <Info size={31} />
          <h3>Sin cliente seleccionado</h3>
          <p>Realiza una búsqueda por nombre o número de cuenta para ver su información detallada.</p>
          <span>Sin información para mostrar.</span>
        </div>
      );
    }

    switch (seccionActiva) {
      case "datos":
        return (
          <div className="cs-datos-grid">
            <div className="cs-dato">
              <span>Nombre completo</span>
              <strong>{cliente.nombre}</strong>
            </div>

            <div className="cs-dato">
              <span>Código de socio</span>
              <strong>{cliente.codigo}</strong>
            </div>

            <div className="cs-dato">
              <span>Correo electrónico</span>
              <strong>{cliente.email}</strong>
            </div>

            <div className="cs-dato">
              <span>Teléfono</span>
              <strong>{cliente.telefono}</strong>
            </div>

            <div className="cs-dato">
              <span>Fecha de registro</span>
              <strong>{new Date(cliente.fechaRegistro).toLocaleDateString("es-MX")}</strong>
            </div>

            <div className="cs-dato">
              <span>Identificación</span>
              <strong>{cliente.identificacion}</strong>
            </div>

            <div className="cs-dato">
              <span>Estado del cliente</span>
              <strong>{cliente.estado}</strong>
            </div>
          </div>
        );

      case "cuentas":
        if (!cuenta) {
          return (
            <div className="cs-vacio">
              <Wallet size={31} />
              <h3>Información de cuentas</h3>
              <p>Este cliente no tiene cuentas activas asociadas.</p>
              <span>Sin información para mostrar.</span>
            </div>
          );
        }
        return (
          <div className="cs-datos-grid">
            <div className="cs-dato">
              <span>Número de cuenta</span>
              <strong>{cuenta.numero}</strong>
            </div>
            <div className="cs-dato">
              <span>Tipo de cuenta</span>
              <strong>{cuenta.tipo === "SAVINGS" ? "Cuenta de Ahorro Tradicional" : cuenta.tipo}</strong>
            </div>
            <div className="cs-dato">
              <span>Saldo disponible</span>
              <strong style={{ color: "#16a34a" }}>${Number(cuenta.saldo).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN</strong>
            </div>
            <div className="cs-dato">
              <span>Estado de cuenta</span>
              <strong>{cuenta.estado}</strong>
            </div>
          </div>
        );

      case "prestamos":
        if (prestamos.length === 0) {
          return (
            <div className="cs-vacio">
              <CreditCard size={31} />
              <h3>Información de préstamos</h3>
              <p>El socio no registra contratos de préstamos activos en este momento.</p>
              <span>Sin información para mostrar.</span>
            </div>
          );
        }
        return (
          <div className="cs-datos-grid">
            {prestamos.map((p) => (
              <div key={p.id} className="cs-dato">
                <span>Contrato: <strong>{p.contract_number}</strong></span>
                <span>Saldo pendiente: <strong style={{ color: "#b45309" }}>${Number(p.principal_balance).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong></span>
                <span>Estado: <strong>{p.status}</strong></span>
              </div>
            ))}
          </div>
        );

      case "pagos":
        if (pagos.length === 0) {
          return (
            <div className="cs-vacio">
              <Receipt size={31} />
              <h3>Historial de pagos</h3>
              <p>No se registran abonos o transacciones recientes para este socio.</p>
              <span>Sin información para mostrar.</span>
            </div>
          );
        }
        return (
          <div className="cs-datos-grid">
            {pagos.map((pg) => (
              <div key={pg.id} className="cs-dato">
                <span>Folio: <code>{pg.transaction_number}</code></span>
                <span>Monto: <strong>${Number(pg.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong></span>
                <span>Fecha: <strong>{new Date(pg.transaction_time).toLocaleString("es-MX")}</strong></span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="cs-contenedor">
      <div className="cs-encabezado">
        <div>
          <span className="cs-etiqueta">ATENCIÓN AL CLIENTE</span>
          <h1>Consultas</h1>
          <p>
            Consulta la información de clientes, cuentas y préstamos.
          </p>
        </div>

        <div className="cs-encabezado-icono">
          <ClipboardList size={27} />
        </div>
      </div>

      <section className="cs-buscador">
        <div className="cs-buscador-icono">
          <Search size={21} />
        </div>

        <div className="cs-buscador-campo">
          <label htmlFor="cs-busqueda">Buscar cliente</label>
          <input
            id="cs-busqueda"
            type="text"
            placeholder="Ingresa nombre o número de cuenta (ej. Juan o CTA26000000001)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleBuscar();
              }
            }}
          />
          <span>
            Busca por nombre del titular o número de cuenta oficial.
          </span>
        </div>

        <button
          type="button"
          className="cs-boton-buscar"
          disabled={buscando || !busqueda.trim()}
          onClick={handleBuscar}
        >
          <Search size={17} />
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </section>

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

      <div className="cs-aviso">
        <Info size={18} />
        <p>
          Los datos del socio provienen directamente del repositorio central. Este módulo es de consulta en ventanilla y caja.
        </p>
      </div>

      <section className="cs-panel">
        <div className="cs-panel-encabezado">
          <div className="cs-cliente-icono">
            <CircleUserRound size={25} />
          </div>

          <div className="cs-cliente-titulo">
            <h2>{cliente ? cliente.nombre : "Información del cliente"}</h2>
            <p>
              {cliente
                ? `Socio ${cliente.codigo} · ${cliente.email}`
                : "No se ha seleccionado ningún cliente"}
            </p>
          </div>

          <span className="cs-estado">
            {cliente ? cliente.estado : "Sin seleccionar"}
          </span>
        </div>

        <div className="cs-separador" />

        <div className="cs-pestanas">
          {secciones.map((seccion) => {
            const Icono = seccion.icono;

            return (
              <button
                type="button"
                key={seccion.id}
                className={
                  seccionActiva === seccion.id
                    ? "cs-pestana activa"
                    : "cs-pestana"
                }
                onClick={() => setSeccionActiva(seccion.id)}
              >
                <Icono size={17} />
                {seccion.nombre}
              </button>
            );
          })}
        </div>

        <div className="cs-contenido">
          {seccionActiva === "datos" && cliente && (
            <div className="cs-subtitulo">
              <UserRound size={18} />
              <h3>Datos generales</h3>
            </div>
          )}

          {renderContenido()}
        </div>
      </section>

      <div className="cs-pie">
        <div className="cs-pie-icono">
          <Info size={19} />
        </div>

        <div>
          <strong>Consulta de información</strong>
          <p>
            Los datos de este apartado son de solo lectura.
            Las operaciones financieras se realizan desde sus
            módulos correspondientes.
          </p>
        </div>
      </div>
    </div>
  );
}
