
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
  CircleDollarSign,
  Activity,
} from "lucide-react";

import "./InicioCliente.css";

function InicioCliente() {
  return (
    <section className="inicio-cliente">

      {/* Bienvenida */}
      <div className="ic-welcome">
        <div>
          <span className="ic-eyebrow">BANUAT · ÁREA DE CLIENTES</span>
          <h1>Bienvenido a BANUAT</h1>
          <p>
            Consulta tus productos, revisa tus solicitudes
            y mantente al día con tu actividad financiera.
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

          <strong>—</strong>
          <small>Productos contratados</small>
        </div>

        <div className="ic-stat-card">
          <div className="ic-stat-top">
            <div className="ic-stat-icon ic-green">
              <FileText size={21} />
            </div>
            <span className="ic-stat-label">Solicitudes</span>
          </div>

          <strong>—</strong>
          <small>Solicitudes en proceso</small>
        </div>

        <div className="ic-stat-card">
          <div className="ic-stat-top">
            <div className="ic-stat-icon ic-purple">
              <CreditCard size={21} />
            </div>
            <span className="ic-stat-label">Pagos próximos</span>
          </div>

          <strong>—</strong>
          <small>Pagos pendientes</small>
        </div>

        <div className="ic-stat-card">
          <div className="ic-stat-top">
            <div className="ic-stat-icon ic-brown">
              <Bell size={21} />
            </div>
            <span className="ic-stat-label">Notificaciones</span>
          </div>

          <strong>—</strong>
          <small>Avisos disponibles</small>
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

              <span className="ic-product-value">—</span>
            </div>

            <div className="ic-product-item">
              <div className="ic-product-icon ic-green">
                <PiggyBank size={21} />
              </div>

              <div className="ic-product-info">
                <strong>Inversiones</strong>
                <span>Revisa tus inversiones.</span>
              </div>

              <span className="ic-product-value">—</span>
            </div>

            <div className="ic-product-item">
              <div className="ic-product-icon ic-purple">
                <CreditCard size={21} />
              </div>

              <div className="ic-product-info">
                <strong>Cuentas</strong>
                <span>Consulta tus cuentas registradas.</span>
              </div>

              <span className="ic-product-value">—</span>
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

          <div className="ic-empty-content">
            <div className="ic-empty-icon">
              <Clock3 size={25} />
            </div>

            <h3>Sin solicitudes disponibles</h3>

            <p>
              Cuando realices una solicitud de algún producto,
              podrás consultar aquí su estado.
            </p>
          </div>
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

            <div className="ic-notification-item">
              <div className="ic-notification-icon ic-orange">
                <Bell size={18} />
              </div>

              <div>
                <strong>Comunicados</strong>
                <p>Aquí aparecerán los avisos importantes.</p>
              </div>
            </div>

            <div className="ic-notification-item">
              <div className="ic-notification-icon ic-green">
                <CircleDollarSign size={18} />
              </div>

              <div>
                <strong>Información de pagos</strong>
                <p>Consulta avisos relacionados con tus pagos.</p>
              </div>
            </div>

            <div className="ic-notification-item">
              <div className="ic-notification-icon ic-purple">
                <FileText size={18} />
              </div>

              <div>
                <strong>Estado de solicitudes</strong>
                <p>Recibe actualizaciones sobre tus trámites.</p>
              </div>
            </div>

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
