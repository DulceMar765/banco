
import {
  Wallet,
  HandCoins,
  CreditCard,
  FileText,
  CalendarDays,
  CircleDollarSign,
  ChevronRight,
} from "lucide-react";

import "./ProductosCliente.css";

export default function ProductosCliente() {
  return (
    <section className="productos-cliente">

      {/* ENCABEZADO */}
      <div className="prc-page-heading">
        <div>
          <span className="prc-eyebrow">
            INFORMACIÓN FINANCIERA
          </span>

          <h1>Mis productos</h1>

          <p>
            Consulta los productos financieros asociados a tu cuenta BANUAT.
          </p>
        </div>

        <div className="prc-heading-icon">
          <Wallet size={27} />
        </div>
      </div>

      {/* RESUMEN */}
      <div className="prc-summary-grid">

        <div className="prc-summary-card">
          <div className="prc-summary-icon prc-orange">
            <Wallet size={21} />
          </div>

          <div>
            <span>Productos asociados</span>
            <strong>—</strong>
            <small>Información de tu cuenta</small>
          </div>
        </div>

        <div className="prc-summary-card">
          <div className="prc-summary-icon prc-green">
            <HandCoins size={21} />
          </div>

          <div>
            <span>Préstamos</span>
            <strong>—</strong>
            <small>Productos de financiamiento</small>
          </div>
        </div>

        <div className="prc-summary-card">
          <div className="prc-summary-icon prc-purple">
            <CircleDollarSign size={21} />
          </div>

          <div>
            <span>Saldo asociado</span>
            <strong>—</strong>
            <small>Información disponible de tus productos</small>
          </div>
        </div>

      </div>

      {/* PRÉSTAMOS */}
      <div className="prc-section-heading">
        <div>
          <h2>Mis préstamos</h2>
          <p>
            Consulta los préstamos vinculados a tu cuenta.
          </p>
        </div>

        <HandCoins size={21} />
      </div>

      <div className="prc-products-card">

        <div className="prc-card-header">
          <div className="prc-card-header-icon">
            <HandCoins size={22} />
          </div>

          <div>
            <h3>Productos de financiamiento</h3>
            <span>Información de tus préstamos</span>
          </div>
        </div>

        <div className="prc-empty-state">
          <div className="prc-empty-icon">
            <FileText size={27} />
          </div>

          <h3>Información de préstamos</h3>

          <p>
            Aquí aparecerán los préstamos asociados a tu cuenta,
            junto con sus datos y detalles correspondientes.
          </p>
        </div>

      </div>

      {/* OTROS PRODUCTOS */}
      <div className="prc-section-heading">
        <div>
          <h2>Otros productos asociados</h2>
          <p>
            Consulta otros productos financieros vinculados a tu cuenta.
          </p>
        </div>

        <CreditCard size={21} />
      </div>

      <div className="prc-products-card">

        <div className="prc-card-header">
          <div className="prc-card-header-icon prc-green">
            <CreditCard size={22} />
          </div>

          <div>
            <h3>Productos BANUAT</h3>
            <span>Información de productos asociados</span>
          </div>
        </div>

        <div className="prc-empty-state">
          <div className="prc-empty-icon">
            <Wallet size={27} />
          </div>

          <h3>Información de productos</h3>

          <p>
            En este apartado se mostrarán los demás productos
            que estén asociados a tu cuenta.
          </p>
        </div>

      </div>

      {/* INFORMACIÓN ADICIONAL */}
      <div className="prc-information">
        <div className="prc-information-icon">
          <CalendarDays size={21} />
        </div>

        <div>
          <strong>Información de tus productos</strong>

          <p>
            Los datos de tus productos financieros estarán
            disponibles para su consulta desde este apartado.
          </p>
        </div>

        <ChevronRight size={19} />
      </div>

    </section>
  );
}
