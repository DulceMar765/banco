
import { useState } from "react";
import {
  CreditCard,
  CalendarDays,
  CircleDollarSign,
  ReceiptText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  FileText,
  CircleHelp,
} from "lucide-react";

import "./PagosCliente.css";

type FiltroPago = "Todos" | "Pendientes" | "Realizados" | "Vencidos";

export default function PagosCliente() {
  const [filtroActivo, setFiltroActivo] =
    useState<FiltroPago>("Todos");

  const [busqueda, setBusqueda] = useState("");

  const filtros: FiltroPago[] = [
    "Todos",
    "Pendientes",
    "Realizados",
    "Vencidos",
  ];

  const pagos: {
    id: number;
    concepto: string;
    referencia: string;
    fecha: string;
    monto: string;
    estado: "Pendiente" | "Realizado" | "Vencido";
  }[] = [];

  const pagosFiltrados = pagos.filter((pago) => {
    const coincideBusqueda =
      pago.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
      pago.referencia.toLowerCase().includes(busqueda.toLowerCase());

    const coincideFiltro =
      filtroActivo === "Todos" ||
      (filtroActivo === "Pendientes" && pago.estado === "Pendiente") ||
      (filtroActivo === "Realizados" && pago.estado === "Realizado") ||
      (filtroActivo === "Vencidos" && pago.estado === "Vencido");

    return coincideBusqueda && coincideFiltro;
  });

  return (
    <section className="pagos-cliente">
      <div className="pac-encabezado">
        <div>
          <span className="pac-etiqueta">MI CUENTA</span>
          <h1>Mis pagos</h1>
          <p>
            Consulta tus pagos, fechas de vencimiento y operaciones realizadas.
          </p>
        </div>

        <div className="pac-icono-encabezado">
          <CreditCard size={27} />
        </div>
      </div>

      {/* RESUMEN */}

      <div className="pac-resumen">
        <article className="pac-tarjeta-resumen">
          <div className="pac-resumen-icono naranja">
            <CircleDollarSign size={22} />
          </div>

          <div>
            <span>Total pendiente</span>
            <strong>—</strong>
            <small>Pagos por realizar</small>
          </div>
        </article>

        <article className="pac-tarjeta-resumen">
          <div className="pac-resumen-icono verde">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Pagos realizados</span>
            <strong>—</strong>
            <small>Operaciones registradas</small>
          </div>
        </article>

        <article className="pac-tarjeta-resumen">
          <div className="pac-resumen-icono morado">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>Próximo vencimiento</span>
            <strong>—</strong>
            <small>Fecha de pago</small>
          </div>
        </article>
      </div>

      {/* PROXIMO PAGO */}

      <div className="pac-proximo-pago">
        <div className="pac-proximo-icono">
          <Clock size={25} />
        </div>

        <div className="pac-proximo-contenido">
          <span>SEGUIMIENTO DE PAGOS</span>
          <h2>Tu próximo pago</h2>
          <p>
            Aquí podrás consultar el importe y la fecha de tu siguiente pago.
          </p>
        </div>

        <div className="pac-proximo-detalle">
          <span>Importe</span>
          <strong>—</strong>
          <small>Fecha de vencimiento: —</small>
        </div>
      </div>

      {/* HISTORIAL */}

      <div className="pac-panel">
        <div className="pac-panel-encabezado">
          <div>
            <h2>Historial de pagos</h2>
            <p>Consulta el estado de tus pagos registrados.</p>
          </div>

          <div className="pac-panel-icono">
            <ReceiptText size={20} />
          </div>
        </div>

        <div className="pac-herramientas">
          <div className="pac-busqueda">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por concepto o referencia..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="pac-filtro-titulo">
            <Filter size={17} />
            <span>Filtrar:</span>
          </div>

          <div className="pac-filtros">
            {filtros.map((filtro) => (
              <button
                key={filtro}
                type="button"
                className={filtroActivo === filtro ? "activo" : ""}
                onClick={() => setFiltroActivo(filtro)}
              >
                {filtro}
              </button>
            ))}
          </div>
        </div>

        <div className="pac-tabla-contenedor">
          <table className="pac-tabla">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Referencia</th>
                <th>Fecha</th>
                <th>Importe</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id}>
                  <td>
                    <div className="pac-concepto">
                      <div className="pac-concepto-icono">
                        <FileText size={18} />
                      </div>

                      <strong>{pago.concepto}</strong>
                    </div>
                  </td>

                  <td>{pago.referencia}</td>
                  <td>{pago.fecha}</td>

                  <td>
                    <strong className="pac-monto">
                      {pago.monto}
                    </strong>
                  </td>

                  <td>
                    <span
                      className={`pac-estado ${pago.estado.toLowerCase()}`}
                    >
                      {pago.estado === "Realizado" && (
                        <CheckCircle2 size={13} />
                      )}

                      {pago.estado === "Pendiente" && (
                        <Clock size={13} />
                      )}

                      {pago.estado === "Vencido" && (
                        <AlertCircle size={13} />
                      )}

                      {pago.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagosFiltrados.length === 0 && (
            <div className="pac-vacio">
              <div className="pac-vacio-icono">
                <ReceiptText size={29} />
              </div>

              <h3>
                {busqueda
                  ? "No se encontraron pagos"
                  : "No hay pagos registrados"}
              </h3>

              <p>
                {busqueda
                  ? "Intenta realizar otra búsqueda."
                  : "Cuando tengas pagos asociados a tus productos, podrás consultar aquí sus detalles."}
              </p>
            </div>
          )}
        </div>

        <div className="pac-pie-tabla">
          <span>
            Mostrando {pagosFiltrados.length} pagos
          </span>

          <span>Información de tu cuenta</span>
        </div>
      </div>

      {/* INFORMACION */}

      <div className="pac-informacion">
        <div className="pac-informacion-icono">
          <CircleHelp size={22} />
        </div>

        <div>
          <strong>Información sobre tus pagos</strong>
          <p>
            En este apartado podrás consultar los pagos relacionados
            con tus préstamos, identificar los pendientes y revisar
            las operaciones que ya fueron registradas.
          </p>
        </div>
      </div>
    </section>
  );
}
