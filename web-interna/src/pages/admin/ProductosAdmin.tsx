
import { useState } from "react";
import {
  Package,
  HandCoins,
  PiggyBank,
  Plus,
  Search,
  Filter,
  Settings2,
  Percent,
  CalendarDays,
  FileText,
  ShieldCheck,
  CircleDollarSign,
} from "lucide-react";

import "./ProductosAdmin.css";

type SeccionProductos =
  | "Productos"
  | "Registro"
  | "Condiciones";

function ProductosAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionProductos>("Productos");

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  const cambiarSeccion = (seccion: SeccionProductos) => {
    setSeccionActiva(seccion);
    setBusqueda("");
    setFiltroTipo("Todos");
  };

  return (
    <div className="pad-container">

      {/* ENCABEZADO */}
      <div className="pad-heading">
        <div>
          <span className="pad-eyebrow">
            ADMINISTRACIÓN FINANCIERA
          </span>

          <h2>Productos financieros</h2>

          <p>
            Administra los productos y servicios financieros
            disponibles en BANUAT.
          </p>
        </div>
      </div>

      {/* INDICADORES */}
      <section className="pad-stats">

        <article className="pad-stat-card">
          <div className="pad-stat-icon orange">
            <Package size={21} />
          </div>

          <div>
            <span>Total de productos</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="pad-stat-card">
          <div className="pad-stat-icon green">
            <ShieldCheck size={21} />
          </div>

          <div>
            <span>Productos activos</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="pad-stat-card">
          <div className="pad-stat-icon blue">
            <HandCoins size={21} />
          </div>

          <div>
            <span>Productos de crédito</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="pad-stat-card">
          <div className="pad-stat-icon brown">
            <PiggyBank size={21} />
          </div>

          <div>
            <span>Productos de ahorro</span>
            <strong>—</strong>
          </div>
        </article>

      </section>

      {/* SECCIÓN PRINCIPAL */}
      <section className="pad-section">

        {/* PESTAÑAS */}
        <div className="pad-tabs">

          <button
            type="button"
            className={seccionActiva === "Productos" ? "active" : ""}
            onClick={() => cambiarSeccion("Productos")}
          >
            <Package size={17} />
            Productos
          </button>

          <button
            type="button"
            className={seccionActiva === "Registro" ? "active" : ""}
            onClick={() => cambiarSeccion("Registro")}
          >
            <Plus size={17} />
            Registrar producto
          </button>

          <button
            type="button"
            className={seccionActiva === "Condiciones" ? "active" : ""}
            onClick={() => cambiarSeccion("Condiciones")}
          >
            <Settings2 size={17} />
            Condiciones
          </button>

        </div>

        <div className="pad-content">

          {/* PRODUCTOS */}
          {seccionActiva === "Productos" && (
            <>
              <div className="pad-content-heading">
                <div>
                  <h3>Catálogo de productos</h3>

                  <p>
                    Consulta y administra los productos financieros
                    de la cooperativa.
                  </p>
                </div>
              </div>

              <div className="pad-toolbar">

                <div className="pad-search">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="pad-filter">
                  <Filter size={17} />

                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <option value="Todos">Todos los tipos</option>
                    <option value="Ahorro">Ahorro</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Servicios">Servicios</option>
                  </select>
                </div>

              </div>

              <div className="pad-empty-state">
                <div className="pad-empty-icon orange">
                  <Package size={27} />
                </div>

                <h4>No hay productos registrados</h4>

                <p>
                  Cuando se agreguen productos financieros,
                  aparecerán aquí para su consulta y administración.
                </p>

                <button
                  type="button"
                  className="pad-primary-button"
                  onClick={() => cambiarSeccion("Registro")}
                >
                  <Plus size={16} />
                  Registrar producto
                </button>
              </div>
            </>
          )}

          {/* REGISTRO */}
          {seccionActiva === "Registro" && (
            <>
              <div className="pad-content-heading">
                <div>
                  <h3>Registrar producto</h3>

                  <p>
                    Define la información general del nuevo
                    producto financiero.
                  </p>
                </div>
              </div>

              <div className="pad-registration">

                <div className="pad-registration-notice">
                  <div className="pad-notice-icon">
                    <FileText size={19} />
                  </div>

                  <div>
                    <strong>Información del producto</strong>

                    <p>
                      Completa las características generales
                      y las condiciones que tendrá el producto.
                    </p>
                  </div>
                </div>

                <div className="pad-fields">

                  <div className="pad-field">
                    <label>Nombre del producto</label>

                    <input
                      type="text"
                      placeholder="Nombre del producto"
                    />
                  </div>

                  <div className="pad-field">
                    <label>Tipo de producto</label>

                    <select defaultValue="">
                      <option value="" disabled>
                        Seleccionar tipo
                      </option>

                      <option value="Ahorro">Ahorro</option>
                      <option value="Crédito">Crédito</option>
                      <option value="Servicios">Servicios</option>
                    </select>
                  </div>

                  <div className="pad-field pad-field-full">
                    <label>Descripción</label>

                    <textarea
                      placeholder="Describe las características del producto..."
                      rows={3}
                    />
                  </div>

                  <div className="pad-field">
                    <label>Monto mínimo</label>

                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="pad-field">
                    <label>Monto máximo</label>

                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="pad-field">
                    <label>Tasa de interés (%)</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="pad-field">
                    <label>Plazo</label>

                    <select defaultValue="">
                      <option value="" disabled>
                        Seleccionar plazo
                      </option>

                      <option value="Mensual">Mensual</option>
                      <option value="Semestral">Semestral</option>
                      <option value="Anual">Anual</option>
                      <option value="Variable">Variable</option>
                    </select>
                  </div>

                  <div className="pad-field">
                    <label>Estado del producto</label>

                    <select defaultValue="Activo">
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>

                </div>

                <div className="pad-registration-footer">
                  <p>
                    Los datos se guardarán cuando se conecte
                    el almacenamiento del sistema.
                  </p>

                  <button
                    type="button"
                    className="pad-primary-button"
                    disabled
                  >
                    <Plus size={16} />
                    Guardar producto
                  </button>
                </div>

              </div>
            </>
          )}

          {/* CONDICIONES */}
          {seccionActiva === "Condiciones" && (
            <>
              <div className="pad-content-heading">
                <div>
                  <h3>Condiciones de los productos</h3>

                  <p>
                    Consulta los parámetros que pueden definirse
                    para cada producto financiero.
                  </p>
                </div>
              </div>

              <div className="pad-conditions-grid">

                <article className="pad-condition-card">
                  <div className="pad-condition-icon orange">
                    <Percent size={21} />
                  </div>

                  <h4>Tasas de interés</h4>

                  <p>
                    Define las tasas aplicables a los productos
                    de crédito y ahorro.
                  </p>
                </article>

                <article className="pad-condition-card">
                  <div className="pad-condition-icon green">
                    <CircleDollarSign size={21} />
                  </div>

                  <h4>Montos permitidos</h4>

                  <p>
                    Establece los montos mínimos y máximos
                    para cada producto.
                  </p>
                </article>

                <article className="pad-condition-card">
                  <div className="pad-condition-icon blue">
                    <CalendarDays size={21} />
                  </div>

                  <h4>Plazos y periodos</h4>

                  <p>
                    Configura los plazos y periodos aplicables
                    a los productos financieros.
                  </p>
                </article>

                <article className="pad-condition-card">
                  <div className="pad-condition-icon brown">
                    <FileText size={21} />
                  </div>

                  <h4>Requisitos</h4>

                  <p>
                    Define los documentos y condiciones que
                    debe cumplir el cliente.
                  </p>
                </article>

              </div>

              <div className="pad-condition-note">
                <ShieldCheck size={18} />

                <p>
                  Las condiciones deberán configurarse por producto.
                  Los cambios deben respetar las políticas financieras
                  y las autorizaciones correspondientes de BANUAT.
                </p>
              </div>
            </>
          )}

        </div>
      </section>

      {/* INFORMACIÓN ADMINISTRATIVA */}
      <section className="pad-info">
        <div className="pad-info-icon">
          <ShieldCheck size={19} />
        </div>

        <div>
          <h4>Administración de productos</h4>

          <p>
            El administrador puede definir la oferta de productos
            de BANUAT. Las condiciones de cada producto deberán
            ser respetadas por los trabajadores al atender
            las solicitudes de los clientes.
          </p>
        </div>
      </section>

    </div>
  );
}

export default ProductosAdmin;
