import { useState, useEffect } from "react";
import {
  Wallet,
  HandCoins,
  CreditCard,
  FileText,
  CalendarDays,
  CircleDollarSign,
  ChevronRight,
} from "lucide-react";

import { fetchSocio } from "../../services/auth";
import "./ProductosCliente.css";

export default function ProductosCliente() {
  const [productos, setProductos] = useState<{ cuentas: any[]; prestamos: any[] }>({
    cuentas: [],
    prestamos: [],
  });

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetchSocio("/api/socio/productos");
        const data = await res.json();
        if (data && !data.error) {
          setProductos({
            cuentas: Array.isArray(data.cuentas) ? data.cuentas : [],
            prestamos: Array.isArray(data.prestamos) ? data.prestamos : [],
          });
        }
      } catch (err) {
        console.error("Error al cargar productos:", err);
      }
    };

    cargarProductos();
  }, []);

  const totalProductos = productos.cuentas.length + productos.prestamos.length;
  const saldoTotalCuentas = productos.cuentas.reduce((acc, c) => acc + (Number(c.saldo) || 0), 0);

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
            <strong>{totalProductos}</strong>
            <small>{totalProductos === 1 ? "1 producto activo" : `${totalProductos} productos activos`}</small>
          </div>
        </div>

        <div className="prc-summary-card">
          <div className="prc-summary-icon prc-green">
            <HandCoins size={21} />
          </div>

          <div>
            <span>Préstamos</span>
            <strong>{productos.prestamos.length}</strong>
            <small>Productos de financiamiento</small>
          </div>
        </div>

        <div className="prc-summary-card">
          <div className="prc-summary-icon prc-purple">
            <CircleDollarSign size={21} />
          </div>

          <div>
            <span>Saldo en ahorro</span>
            <strong>${saldoTotalCuentas.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN</strong>
            <small>Disponible en tus cuentas</small>
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

        {productos.prestamos.length === 0 ? (
          <div className="prc-empty-state">
            <div className="prc-empty-icon">
              <FileText size={27} />
            </div>

            <h3>Información de préstamos</h3>

            <p>
              Actualmente no cuentas con contratos de préstamo activos.
              Acércate con tu ejecutivo de sucursal para originar una solicitud.
            </p>
          </div>
        ) : (
          <div style={{ padding: "16px 24px" }}>
            {productos.prestamos.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div>
                  <strong style={{ fontSize: "16px", color: "#4b2e1f", display: "block" }}>
                    {p.nombre}
                  </strong>
                  <span style={{ fontSize: "13px", color: "#777" }}>
                    Contrato: <code>{p.numero}</code> · Plazo: {p.plazoMeses} meses · Tasa: {p.tasa}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "12px", color: "#888", display: "block" }}>Saldo pendiente</span>
                  <strong style={{ fontSize: "18px", color: "#b45309" }}>
                    ${Number(p.saldoPendiente).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}

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

        {productos.cuentas.length === 0 ? (
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
        ) : (
          <div style={{ padding: "16px 24px" }}>
            {productos.cuentas.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div>
                  <strong style={{ fontSize: "16px", color: "#4b2e1f", display: "block" }}>
                    {c.nombre}
                  </strong>
                  <span style={{ fontSize: "13px", color: "#777" }}>
                    Cuenta: <code>{c.numero}</code> · Rendimiento: {c.tasa}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "12px", color: "#888", display: "block" }}>Saldo disponible</span>
                  <strong style={{ fontSize: "18px", color: "#16a34a" }}>
                    ${Number(c.saldo).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* INFORMACIÓN ADICIONAL */}
      <div className="prc-information">
        <div className="prc-information-icon">
          <CalendarDays size={21} />
        </div>

        <div>
          <strong>Información de tus productos</strong>

          <p>
            Los saldos y rendimientos se actualizan de forma instantánea conforme a los movimientos de la cooperativa.
          </p>
        </div>

        <ChevronRight size={19} />
      </div>

    </section>
  );
}
