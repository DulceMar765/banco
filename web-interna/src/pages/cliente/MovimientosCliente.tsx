
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Search,
  CalendarDays,
  Wallet,
  ReceiptText,
  Filter,
  CircleHelp,
} from "lucide-react";

import "./MovimientosCliente.css";

type TipoMovimiento = "Todos" | "Depósitos" | "Retiros" | "Pagos" | "Transferencias";

export default function MovimientosCliente() {
  const [filtroActivo, setFiltroActivo] =
    useState<TipoMovimiento>("Todos");

  const [busqueda, setBusqueda] = useState("");

  const filtros: TipoMovimiento[] = [
    "Todos",
    "Depósitos",
    "Retiros",
    "Pagos",
    "Transferencias",
  ];

  const movimientos: {
    id: number;
    concepto: string;
    descripcion: string;
    fecha: string;
    tipo: string;
    monto: string;
    icono: typeof Wallet;
    clase: string;
  }[] = [];

  const movimientosFiltrados = movimientos.filter((movimiento) => {
    const coincideBusqueda =
      movimiento.concepto
        .toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      movimiento.descripcion
        .toLowerCase()
        .includes(busqueda.toLowerCase());

    const coincideFiltro =
      filtroActivo === "Todos" ||
      movimiento.tipo === filtroActivo;

    return coincideBusqueda && coincideFiltro;
  });

  return (
    <section className="movimientos-cliente">
      <div className="moc-encabezado">
        <div>
          <span className="moc-etiqueta">MI CUENTA</span>
          <h1>Mis movimientos</h1>
          <p>
            Consulta las operaciones y movimientos de tu cuenta BANUAT.
          </p>
        </div>

        <div className="moc-icono-encabezado">
          <ArrowLeftRight size={27} />
        </div>
      </div>

      <div className="moc-resumen">
        <article className="moc-tarjeta-resumen">
          <div className="moc-resumen-icono naranja">
            <ReceiptText size={21} />
          </div>
          <div>
            <span>Movimientos registrados</span>
            <strong>—</strong>
            <small>Operaciones de tu cuenta</small>
          </div>
        </article>

        <article className="moc-tarjeta-resumen">
          <div className="moc-resumen-icono verde">
            <ArrowDownLeft size={21} />
          </div>
          <div>
            <span>Entradas de dinero</span>
            <strong>—</strong>
            <small>Depósitos y otros ingresos</small>
          </div>
        </article>

        <article className="moc-tarjeta-resumen">
          <div className="moc-resumen-icono morado">
            <ArrowUpRight size={21} />
          </div>
          <div>
            <span>Salidas de dinero</span>
            <strong>—</strong>
            <small>Retiros y pagos realizados</small>
          </div>
        </article>
      </div>

      <div className="moc-panel">
        <div className="moc-panel-encabezado">
          <div>
            <h2>Historial de operaciones</h2>
            <p>Revisa el detalle de tus movimientos.</p>
          </div>

          <div className="moc-periodo">
            <CalendarDays size={17} />
            <span>Historial completo</span>
          </div>
        </div>

        <div className="moc-herramientas">
          <div className="moc-busqueda">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar movimiento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="moc-filtro-titulo">
            <Filter size={17} />
            <span>Filtrar:</span>
          </div>

          <div className="moc-filtros">
            {filtros.map((filtro) => (
              <button
                key={filtro}
                className={
                  filtroActivo === filtro ? "activo" : ""
                }
                onClick={() => setFiltroActivo(filtro)}
                type="button"
              >
                {filtro}
              </button>
            ))}
          </div>
        </div>

        <div className="moc-tabla-contenedor">
          <table className="moc-tabla">
            <thead>
              <tr>
                <th>Movimiento</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {movimientosFiltrados.map((movimiento) => {
                const Icono = movimiento.icono;

                return (
                  <tr key={movimiento.id}>
                    <td>
                      <div className="moc-concepto">
                        <div className={`moc-mov-icono ${movimiento.clase}`}>
                          <Icono size={19} />
                        </div>
                        <div>
                          <strong>{movimiento.concepto}</strong>
                          <span>{movimiento.descripcion}</span>
                        </div>
                      </div>
                    </td>

                    <td>{movimiento.fecha}</td>

                    <td>
                      <span className="moc-tipo">
                        {movimiento.tipo}
                      </span>
                    </td>

                    <td>
                      <strong className="moc-monto">
                        {movimiento.monto}
                      </strong>
                    </td>

                    <td>
                      <span className="moc-estado">
                        —
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {movimientosFiltrados.length === 0 && (
            <div className="moc-vacio">
              <div className="moc-vacio-icono">
                <ArrowLeftRight size={29} />
              </div>

              <h3>
                {busqueda
                  ? "No se encontraron movimientos"
                  : "Aún no tienes movimientos"}
              </h3>

              <p>
                {busqueda
                  ? "Intenta buscar con otro concepto."
                  : "Cuando realices operaciones en BANUAT, podrás consultar aquí su información."}
              </p>
            </div>
          )}
        </div>

        <div className="moc-pie-tabla">
          <span>
            Mostrando {movimientosFiltrados.length} movimientos
          </span>
          <span>Historial de cuenta</span>
        </div>
      </div>

      <div className="moc-informacion">
        <div className="moc-informacion-icono">
          <CircleHelp size={22} />
        </div>

        <div>
          <strong>Información sobre tus movimientos</strong>
          <p>
            En este apartado podrás consultar las operaciones
            realizadas en tu cuenta, revisar sus detalles y conocer
            el estado de cada movimiento.
          </p>
        </div>
      </div>
    </section>
  );
}
