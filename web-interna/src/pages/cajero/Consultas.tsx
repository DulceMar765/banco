
import { useState } from "react";
import {
  Search,
  UserRound,
  Wallet,
  CreditCard,
  Receipt,
  CircleUserRound,
  Info,
  ClipboardList,
} from "lucide-react";

import "./Consultas.css";

type SeccionConsulta = "datos" | "cuentas" | "prestamos" | "pagos";

export default function Consultas() {
  const [busqueda, setBusqueda] = useState("");
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionConsulta>("datos");

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
    switch (seccionActiva) {
      case "datos":
        return (
          <div className="cs-datos-grid">
            <div className="cs-dato">
              <span>Nombre completo</span>
              <strong>—</strong>
            </div>

            <div className="cs-dato">
              <span>Correo electrónico</span>
              <strong>—</strong>
            </div>

            <div className="cs-dato">
              <span>Teléfono</span>
              <strong>—</strong>
            </div>

            <div className="cs-dato">
              <span>Fecha de registro</span>
              <strong>—</strong>
            </div>

            <div className="cs-dato">
              <span>Identificación</span>
              <strong>—</strong>
            </div>

            <div className="cs-dato">
              <span>Estado del cliente</span>
              <strong>—</strong>
            </div>
          </div>
        );

      case "cuentas":
        return (
          <div className="cs-vacio">
            <Wallet size={31} />
            <h3>Información de cuentas</h3>
            <p>
              Aquí se mostrarán las cuentas registradas del cliente,
              su tipo, número y saldo disponible.
            </p>
            <span>Sin información para mostrar.</span>
          </div>
        );

      case "prestamos":
        return (
          <div className="cs-vacio">
            <CreditCard size={31} />
            <h3>Información de préstamos</h3>
            <p>
              Aquí se podrán consultar los préstamos del cliente,
              sus montos, saldos pendientes y estados.
            </p>
            <span>Sin información para mostrar.</span>
          </div>
        );

      case "pagos":
        return (
          <div className="cs-vacio">
            <Receipt size={31} />
            <h3>Historial de pagos</h3>
            <p>
              Aquí se mostrarán los pagos y abonos registrados,
              junto con sus fechas y montos.
            </p>
            <span>Sin información para mostrar.</span>
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
            placeholder="Ingresa nombre o número de cuenta"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span>
            Busca por nombre del titular o número de cuenta.
          </span>
        </div>

        <button
          type="button"
          className="cs-boton-buscar"
          disabled
        >
          <Search size={17} />
          Buscar
        </button>
      </section>

      <div className="cs-aviso">
        <Info size={18} />
        <p>
          La información de los clientes aparecerá aquí cuando se
          conecte el sistema de datos. Este módulo es únicamente
          de consulta.
        </p>
      </div>

      <section className="cs-panel">
        <div className="cs-panel-encabezado">
          <div className="cs-cliente-icono">
            <CircleUserRound size={25} />
          </div>

          <div className="cs-cliente-titulo">
            <h2>Información del cliente</h2>
            <p>
              {busqueda.trim()
                ? "Búsqueda pendiente de conexión"
                : "No se ha seleccionado ningún cliente"}
            </p>
          </div>

          <span className="cs-estado">
            Sin seleccionar
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
          {seccionActiva === "datos" && (
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
