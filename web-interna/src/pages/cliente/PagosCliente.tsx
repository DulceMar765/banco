import { useState, useEffect } from "react";
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
} from "lucide-react";

import { fetchSocio } from "../../services/auth";
import "./PagosCliente.css";

type FiltroPago = "Todos" | "Pendientes" | "Realizados" | "Vencidos";

export default function PagosCliente() {
  const [filtroActivo, setFiltroActivo] = useState<FiltroPago>("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [pagos, setPagos] = useState<any[]>([]);
  const [proximoPago, setProximoPago] = useState<any>(null);

  useEffect(() => {
    const cargarPagos = async () => {
      try {
        const resP = await fetchSocio("/api/socio/pagos");
        const dataP = await resP.json();
        
        const resM = await fetchSocio("/api/socio/movimientos");
        const dataM = await resM.json();

        const lista: any[] = [];

        if (Array.isArray(dataP) && dataP.length > 0) {
          const prox = dataP[0];
          setProximoPago(prox);

          dataP.forEach((p, idx) => {
            lista.push({
              id: `pend-${idx}`,
              concepto: `Cuota ${p.producto} (Cap: $${p.amortizacionCapital} + Int: $${p.interesesDevengados})`,
              referencia: p.folioPrestamo,
              fecha: p.proximaFechaPago,
              monto: `$${Number(p.cuotaMensual).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`,
              estado: "Pendiente",
              saldoRestante: p.saldoRestante,
            });
          });
        }

        if (Array.isArray(dataM)) {
          dataM
            .filter((m: any) => m.tipo === "LOAN_PAYMENT")
            .forEach((m: any) => {
              lista.push({
                id: `real-${m.id}`,
                concepto: m.tipoLabel || "Abono a préstamo",
                referencia: m.referencia,
                fecha: `${m.fecha} ${m.hora}`,
                monto: `$${Number(m.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`,
                estado: "Realizado",
              });
            });
        }

        setPagos(lista);
      } catch (err) {
        console.error("Error al cargar pagos:", err);
      }
    };

    cargarPagos();
  }, []);

  const filtros: FiltroPago[] = [
    "Todos",
    "Pendientes",
    "Realizados",
    "Vencidos",
  ];

  const totalPendiente = proximoPago ? Number(proximoPago.saldoRestante) : 0;
  const totalRealizados = pagos.filter((p) => p.estado === "Realizado").length;

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
            <strong>${totalPendiente.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong>
            <small>Saldo capital de préstamos</small>
          </div>
        </article>

        <article className="pac-tarjeta-resumen">
          <div className="pac-resumen-icono verde">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Pagos realizados</span>
            <strong>{totalRealizados}</strong>
            <small>{totalRealizados === 1 ? "1 abono registrado" : `${totalRealizados} abonos registrados`}</small>
          </div>
        </article>

        <article className="pac-tarjeta-resumen">
          <div className="pac-resumen-icono morado">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>Próximo vencimiento</span>
            <strong>{proximoPago ? proximoPago.proximaFechaPago : "Al corriente"}</strong>
            <small>Fecha límite de pago</small>
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
            {proximoPago
              ? `Préstamo ${proximoPago.folioPrestamo} · ${proximoPago.producto}`
              : "No tienes pagos próximos pendientes en tus contratos."}
          </p>
        </div>

        <div className="pac-proximo-detalle">
          <span>Importe</span>
          <strong>
            {proximoPago
              ? `$${Number(proximoPago.cuotaMensual).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`
              : "$0.00 MXN"}
          </strong>
          <small>
            {proximoPago
              ? `Fecha de vencimiento: ${proximoPago.proximaFechaPago}`
              : "Sin adeudo activo"}
          </small>
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

                  <td><code>{pago.referencia}</code></td>
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
                <ReceiptText size={28} />
              </div>

              <h3>Sin pagos disponibles</h3>

              <p>
                No se encontraron pagos con el filtro o término de búsqueda seleccionado.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
