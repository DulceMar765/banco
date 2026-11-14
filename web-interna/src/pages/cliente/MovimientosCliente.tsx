import { useState, useEffect } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Search,
  CalendarDays,
  ReceiptText,
  Filter,
} from "lucide-react";

import { fetchSocio } from "../../services/auth";
import "./MovimientosCliente.css";

type TipoMovimiento = "Todos" | "Depósitos" | "Retiros" | "Pagos" | "Transferencias";

export default function MovimientosCliente() {
  const [filtroActivo, setFiltroActivo] = useState<TipoMovimiento>("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [movimientos, setMovimientos] = useState<any[]>([]);

  useEffect(() => {
    const cargarMovimientos = async () => {
      try {
        const res = await fetchSocio("/api/socio/movimientos");
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapeados = data.map((m: any) => {
            let catFiltro: TipoMovimiento = "Depósitos";
            if (m.tipo === "WITHDRAWAL") catFiltro = "Retiros";
            else if (m.tipo === "LOAN_PAYMENT") catFiltro = "Pagos";
            else if (m.tipo === "TRANSFER") catFiltro = "Transferencias";

            return {
              id: m.id,
              concepto: m.tipoLabel || m.tipo,
              descripcion: `Folio / Ref: ${m.referencia} · Cuenta: ${m.cuenta}`,
              fecha: `${m.fecha} ${m.hora}`,
              tipo: catFiltro,
              esEntrada: m.esEntrada,
              montoRaw: Number(m.monto),
              monto: `${m.esEntrada ? "+" : "-"}$${Number(m.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`,
              icono: m.esEntrada ? ArrowDownLeft : ArrowUpRight,
              clase: m.esEntrada ? "verde" : "morado",
              estado: "Aplicado",
            };
          });
          setMovimientos(mapeados);
        }
      } catch (err) {
        console.error("Error al cargar movimientos:", err);
      }
    };

    cargarMovimientos();
  }, []);

  const filtros: TipoMovimiento[] = [
    "Todos",
    "Depósitos",
    "Retiros",
    "Pagos",
    "Transferencias",
  ];

  const totalEntradas = movimientos
    .filter((m) => m.esEntrada)
    .reduce((acc, m) => acc + m.montoRaw, 0);

  const totalSalidas = movimientos
    .filter((m) => !m.esEntrada)
    .reduce((acc, m) => acc + m.montoRaw, 0);

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
            <strong>{movimientos.length}</strong>
            <small>Operaciones de tu cuenta</small>
          </div>
        </article>

        <article className="moc-tarjeta-resumen">
          <div className="moc-resumen-icono verde">
            <ArrowDownLeft size={21} />
          </div>
          <div>
            <span>Entradas de dinero</span>
            <strong>+${totalEntradas.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong>
            <small>Depósitos y otros ingresos</small>
          </div>
        </article>

        <article className="moc-tarjeta-resumen">
          <div className="moc-resumen-icono morado">
            <ArrowUpRight size={21} />
          </div>
          <div>
            <span>Salidas de dinero</span>
            <strong>-${totalSalidas.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong>
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
                      <strong className="moc-monto" style={{ color: movimiento.esEntrada ? "#16a34a" : "#dc2626" }}>
                        {movimiento.monto}
                      </strong>
                    </td>

                    <td>
                      <span className="moc-estado">
                        {movimiento.estado}
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
                  ? "Intenta con otro término o limpia los filtros."
                  : "Cuando realices depósitos, retiros o abonos, los verás registrados aquí."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
