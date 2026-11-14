import { useState, useEffect } from "react";
import {
  Wallet,
  CreditCard,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Bell,
  PiggyBank,
  HandCoins,
  Clock3,
  Activity,
} from "lucide-react";

import { fetchSocio } from "../../services/auth";
import "./InicioCliente.css";

function InicioCliente() {
  const [resumen, setResumen] = useState<any>(null);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);

  useEffect(() => {
    const cargarInicio = async () => {
      try {
        const resR = await fetchSocio("/api/socio/resumen");
        const dataR = await resR.json();
        if (dataR && !dataR.error) {
          setResumen(dataR);
        }
      } catch (err) {
        console.error("Error al cargar resumen de socio:", err);
      }

      try {
        const resM = await fetchSocio("/api/socio/movimientos");
        const dataM = await resM.json();
        if (Array.isArray(dataM)) {
          setMovimientos(dataM);
        }
      } catch (err) {
        console.error("Error al cargar movimientos:", err);
      }

      try {
        const resN = await fetchSocio("/api/socio/notificaciones");
        const dataN = await resN.json();
        if (Array.isArray(dataN)) {
          setNotificaciones(dataN);
        }
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
      }
    };

    cargarInicio();
  }, []);

  const totalProductos = (resumen?.cuentaPrincipal ? 1 : 0) + (resumen?.prestamosActivos || 0);

  return (
    <section className="inicio-cliente">

      {/* Bienvenida */}
      <div className="ic-welcome">
        <div>
          <span className="ic-eyebrow">BANUAT · ÁREA DE CLIENTES</span>
          <h1>Bienvenido{resumen?.nombre ? `, ${resumen.nombre}` : " a BANUAT"}</h1>
          <p>
            {resumen?.numeroSocio
              ? `Socio ${resumen.numeroSocio} · Consulta tus productos, ahorros y beneficios de la cooperativa.`
              : "Consulta tus productos, revisa tus solicitudes y mantente al día con tu actividad financiera."}
          </p>
        </div>

        <div className="ic-welcome-icon">
          <Wallet size={34} />
        </div>
      </div>

      {/* Resumen general */}
      <div className="ic-section-heading">
        <div>
          <h2>Resumen general</h2>
          <p>Información de tu cuenta y actividad.</p>
        </div>
      </div>

      <div className="ic-stats-grid">

        <div className="ic-stat-card">
          <div className="ic-stat-top">
            <div className="ic-stat-icon ic-orange">
              <Wallet size={21} />
            </div>
            <span className="ic-stat-label">Mis productos</span>
          </div>

          <strong>{totalProductos}</strong>
          <small>{totalProductos === 1 ? "1 producto contratado" : `${totalProductos} productos contratados`}</small>
        </div>

        <div className="ic-stat-card">
          <div className="ic-stat-top">
            <div className="ic-stat-icon ic-green">
              <FileText size={21} />
            </div>
            <span className="ic-stat-label">Puntos de lealtad</span>
          </div>

          <strong>{resumen?.puntos ? Number(resumen.puntos.saldo).toLocaleString("es-MX") : "0"} pts</strong>
          <small>{resumen?.puntos ? `Valor: $${Number(resumen.puntos.equivalenciaMxn).toFixed(2)} MXN` : "100 pts = $1 MXN"}</small>
        </div>

        <div className="ic-stat-card">
          <div className="ic-stat-top">
            <div className="ic-stat-icon ic-purple">
              <CreditCard size={21} />
            </div>
            <span className="ic-stat-label">Pagos próximos</span>
          </div>

          <strong>{resumen?.prestamosActivos > 0 ? "1 pendiente" : "Al corriente"}</strong>
          <small>{resumen?.deudaTotal > 0 ? `Saldo: $${Number(resumen.deudaTotal).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN` : "Sin cuotas vencidas"}</small>
        </div>

        <div className="ic-stat-card">
          <div className="ic-stat-top">
            <div className="ic-stat-icon ic-brown">
              <Bell size={21} />
            </div>
            <span className="ic-stat-label">Notificaciones</span>
          </div>

          <strong>{notificaciones.length}</strong>
          <small>{notificaciones.length === 1 ? "1 aviso disponible" : `${notificaciones.length} avisos disponibles`}</small>
        </div>

      </div>

      {/* Productos y solicitudes */}
      <div className="ic-main-grid">

        <div className="ic-card ic-products-card">
          <div className="ic-card-heading">
            <div>
              <h2>Mis productos</h2>
              <p>Resumen de tus productos financieros.</p>
            </div>

            <Wallet size={20} />
          </div>

          <div className="ic-product-list">

            <div className="ic-product-item">
              <div className="ic-product-icon ic-orange">
                <HandCoins size={21} />
              </div>

              <div className="ic-product-info">
                <strong>Préstamos</strong>
                <span>Consulta tus préstamos activos.</span>
              </div>

              <span className="ic-product-value">
                {resumen?.prestamosActivos > 0 ? `${resumen.prestamosActivos} activo(s)` : "Sin préstamos"}
              </span>
            </div>

            <div className="ic-product-item">
              <div className="ic-product-icon ic-green">
                <PiggyBank size={21} />
              </div>

              <div className="ic-product-info">
                <strong>Rendimiento mensual</strong>
                <span>Devengo diario estimado de intereses.</span>
              </div>

              <span className="ic-product-value" style={{ color: "#16a34a" }}>
                {resumen?.rendimientoEstimadoMes ? `+$${Number(resumen.rendimientoEstimadoMes).toFixed(2)} MXN` : "—"}
              </span>
            </div>

            <div className="ic-product-item">
              <div className="ic-product-icon ic-purple">
                <CreditCard size={21} />
              </div>

              <div className="ic-product-info">
                <strong>Cuenta de Ahorro</strong>
                <span>{resumen?.cuentaPrincipal ? resumen.cuentaPrincipal.numero : "Cuenta oficial BANUAT"}</span>
              </div>

              <span className="ic-product-value" style={{ fontWeight: 700 }}>
                {resumen?.cuentaPrincipal ? `$${Number(resumen.cuentaPrincipal.saldo).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN` : "—"}
              </span>
            </div>

          </div>
        </div>

        <div className="ic-card ic-requests-card">
          <div className="ic-card-heading">
            <div>
              <h2>Mis solicitudes</h2>
              <p>Seguimiento de tus trámites.</p>
            </div>

            <FileText size={20} />
          </div>

          {resumen?.prestamosActivos > 0 ? (
            <div className="ic-product-list">
              <div className="ic-product-item">
                <div className="ic-product-icon ic-orange">
                  <Clock3 size={21} />
                </div>
                <div className="ic-product-info">
                  <strong>Préstamo autorizado</strong>
                  <span>Contrato en cumplimiento de cuotas</span>
                </div>
                <span className="ic-product-value" style={{ color: "#16a34a" }}>Activo</span>
              </div>
            </div>
          ) : (
            <div className="ic-empty-content">
              <div className="ic-empty-icon">
                <Clock3 size={25} />
              </div>

              <h3>Sin solicitudes pendientes</h3>

              <p>
                Cuando realices una solicitud de algún producto con tu ejecutivo,
                podrás consultar aquí su estado y resolución.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Actividad y notificaciones */}
      <div className="ic-bottom-grid">

        <div className="ic-card ic-activity-card">
          <div className="ic-card-heading">
            <div>
              <h2>Actividad reciente</h2>
              <p>Consulta tus últimos movimientos.</p>
            </div>

            <Activity size={20} />
          </div>

          {movimientos.length === 0 ? (
            <div className="ic-empty-content">
              <div className="ic-empty-icon">
                <TrendingUp size={25} />
              </div>

              <h3>Sin movimientos registrados</h3>

              <p>
                Tus operaciones y movimientos aparecerán
                en este apartado.
              </p>
            </div>
          ) : (
            <div className="ic-product-list">
              {movimientos.slice(0, 3).map((m: any) => (
                <div key={m.id} className="ic-product-item">
                  <div className={`ic-product-icon ${m.esEntrada ? "ic-green" : "ic-orange"}`}>
                    <TrendingUp size={20} />
                  </div>
                  <div className="ic-product-info">
                    <strong>{m.tipoLabel || m.tipo}</strong>
                    <span>{m.fecha} · Ref: {m.referencia}</span>
                  </div>
                  <span className="ic-product-value" style={{ color: m.esEntrada ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                    {m.esEntrada ? "+" : "-"}${Number(m.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

        <div className="ic-card ic-notifications-card">
          <div className="ic-card-heading">
            <div>
              <h2>Notificaciones</h2>
              <p>Avisos y comunicados de BANUAT.</p>
            </div>

            <Bell size={20} />
          </div>

          <div className="ic-notification-list">
            {notificaciones.length === 0 ? (
              <div className="ic-notification-item">
                <div className="ic-notification-icon ic-orange">
                  <Bell size={18} />
                </div>
                <div>
                  <strong>Sin notificaciones</strong>
                  <p>No tienes mensajes pendientes en tu bandeja.</p>
                </div>
              </div>
            ) : (
              notificaciones.slice(0, 3).map((n: any) => (
                <div key={n.id} className="ic-notification-item">
                  <div className="ic-notification-icon ic-orange">
                    <Bell size={18} />
                  </div>
                  <div>
                    <strong>{n.titulo}</strong>
                    <p>{n.mensaje}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Información inferior */}
      <div className="ic-footer-note">
        <div className="ic-footer-icon">
          <ArrowUpRight size={19} />
        </div>

        <div>
          <strong>Tu información financiera en un solo lugar</strong>
          <p>
            Consulta tus productos y mantente informado
            sobre la actividad de tu cuenta.
          </p>
        </div>
      </div>

    </section>
  );
}

export default InicioCliente;
