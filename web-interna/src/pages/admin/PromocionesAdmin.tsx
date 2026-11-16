import { useState } from "react";
import {
  Gift,
  Tag,
  CalendarDays,
  Percent,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
} from "lucide-react";

import "./PromocionesAdmin.css";

type SeccionPromociones =
  | "Promociones"
  | "Crear promoción"
  | "Vigencia";

export default function PromocionesAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionPromociones>("Promociones");

  const [busqueda, setBusqueda] = useState("");

  const secciones: {
    nombre: SeccionPromociones;
    icono: typeof Gift;
  }[] = [
    { nombre: "Promociones", icono: Gift },
    { nombre: "Crear promoción", icono: Plus },
    { nombre: "Vigencia", icono: CalendarDays },
  ];

  const cambiarSeccion = (seccion: SeccionPromociones) => {
    setSeccionActiva(seccion);
    setBusqueda("");
  };

  const obtenerDescripcion = () => {
    switch (seccionActiva) {
      case "Promociones":
        return "Consulta y administra las promociones disponibles en BANUAT.";

      case "Crear promoción":
        return "Define los beneficios y condiciones de una nueva promoción.";

      case "Vigencia":
        return "Consulta los periodos de aplicación de las promociones.";

      default:
        return "";
    }
  };

  const renderizarContenido = () => {
    switch (seccionActiva) {
      case "Promociones":
        return (
          <section className="pra-contenido">
            <div className="pra-panel-header">
              <div>
                <h3>Promociones registradas</h3>
                <p>
                  Administra los beneficios y promociones de los productos
                  financieros.
                </p>
              </div>

              <button
                className="pra-btn-principal"
                onClick={() => cambiarSeccion("Crear promoción")}
              >
                <Plus size={17} />
                Nueva promoción
              </button>
            </div>

            <div className="pra-filtros">
              <div className="pra-busqueda">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Buscar promoción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="pra-filtro-estado">
                <span>Estado:</span>
                <select defaultValue="todos">
                  <option value="todos">Todos</option>
                  <option value="activa">Activas</option>
                  <option value="programada">Programadas</option>
                  <option value="finalizada">Finalizadas</option>
                </select>
              </div>
            </div>

            <div className="pra-empty">
              <div className="pra-empty-icon">
                <Gift size={30} />
              </div>
              <h4>No hay promociones registradas</h4>
              <p>
                Las promociones que registres aparecerán aquí para que puedas
                consultar y administrar sus condiciones.
              </p>

              <button
                className="pra-btn-secundario"
                onClick={() => cambiarSeccion("Crear promoción")}
              >
                <Plus size={16} />
                Crear primera promoción
              </button>
            </div>
          </section>
        );

      case "Crear promoción":
        return (
          <section className="pra-contenido">
            <div className="pra-panel-header">
              <div>
                <h3>Registrar promoción</h3>
                <p>
                  Configura los datos generales y beneficios de la promoción.
                </p>
              </div>
            </div>

            <div className="pra-formulario">
              <div className="pra-form-seccion">
                <div className="pra-form-titulo">
                  <Tag size={19} />
                  <div>
                    <h4>Información general</h4>
                    <p>Datos para identificar la promoción.</p>
                  </div>
                </div>

                <div className="pra-form-grid">
                  <div className="pra-campo">
                    <label>Nombre de la promoción</label>
                    <input
                      type="text"
                      placeholder="Ej. Beneficio de temporada"
                    />
                  </div>

                  <div className="pra-campo">
                    <label>Tipo de promoción</label>
                    <select defaultValue="">
                      <option value="" disabled>
                        Seleccionar tipo
                      </option>
                      <option value="tasa">Reducción de tasa</option>
                      <option value="descuento">Descuento</option>
                      <option value="puntos">Puntos adicionales</option>
                      <option value="producto">Beneficio en producto</option>
                      <option value="otro">Otro beneficio</option>
                    </select>
                  </div>

                  <div className="pra-campo pra-campo-completo">
                    <label>Descripción</label>
                    <textarea
                      rows={3}
                      placeholder="Describe en qué consiste la promoción..."
                    />
                  </div>
                </div>
              </div>

              <div className="pra-form-seccion">
                <div className="pra-form-titulo">
                  <Sparkles size={19} />
                  <div>
                    <h4>Beneficio y condiciones</h4>
                    <p>
                      Establece qué recibirá el cliente y bajo qué condiciones.
                    </p>
                  </div>
                </div>

                <div className="pra-form-grid">
                  <div className="pra-campo">
                    <label>Producto relacionado</label>
                    <select defaultValue="">
                      <option value="" disabled>
                        Seleccionar producto
                      </option>
                      <option value="credito">Producto de crédito</option>
                      <option value="ahorro">Producto de ahorro</option>
                      <option value="servicio">Servicio</option>
                      <option value="general">Todos los productos</option>
                    </select>
                  </div>

                  <div className="pra-campo">
                    <label>Valor del beneficio</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ingresar valor"
                    />
                  </div>

                  <div className="pra-campo pra-campo-completo">
                    <label>Requisitos para participar</label>
                    <textarea
                      rows={3}
                      placeholder="Describe los requisitos que deberá cumplir el cliente..."
                    />
                  </div>
                </div>
              </div>

              <div className="pra-form-seccion">
                <div className="pra-form-titulo">
                  <CalendarDays size={19} />
                  <div>
                    <h4>Periodo de aplicación</h4>
                    <p>
                      Define cuándo comenzará y cuándo finalizará la promoción.
                    </p>
                  </div>
                </div>

                <div className="pra-form-grid">
                  <div className="pra-campo">
                    <label>Fecha de inicio</label>
                    <input type="date" />
                  </div>

                  <div className="pra-campo">
                    <label>Fecha de finalización</label>
                    <input type="date" />
                  </div>

                  <div className="pra-campo pra-campo-completo">
                    <label>Estado inicial</label>
                    <select defaultValue="programada">
                      <option value="programada">Programada</option>
                      <option value="activa">Activa</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pra-form-acciones">
                <button
                  className="pra-btn-cancelar"
                  onClick={() => cambiarSeccion("Promociones")}
                >
                  Cancelar
                </button>

                <button className="pra-btn-principal" disabled>
                  <Plus size={17} />
                  Guardar promoción
                </button>
              </div>
            </div>
          </section>
        );

      case "Vigencia":
        return (
          <section className="pra-contenido">
            <div className="pra-panel-header">
              <div>
                <h3>Vigencia de promociones</h3>
                <p>
                  Consulta los periodos de aplicación y el estado de cada
                  promoción.
                </p>
              </div>
            </div>

            <div className="pra-vigencia-resumen">
              <article>
                <div className="pra-vigencia-icon verde">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span>Activas</span>
                  <strong>—</strong>
                </div>
              </article>

              <article>
                <div className="pra-vigencia-icon azul">
                  <Clock size={20} />
                </div>
                <div>
                  <span>Programadas</span>
                  <strong>—</strong>
                </div>
              </article>

              <article>
                <div className="pra-vigencia-icon gris">
                  <XCircle size={20} />
                </div>
                <div>
                  <span>Finalizadas</span>
                  <strong>—</strong>
                </div>
              </article>
            </div>

            <div className="pra-empty">
              <div className="pra-empty-icon">
                <CalendarDays size={30} />
              </div>
              <h4>No hay periodos registrados</h4>
              <p>
                Cuando existan promociones, podrás consultar aquí sus fechas
                de inicio, finalización y estado.
              </p>
            </div>
          </section>
        );
    }
  };

  return (
    <div className="pra-page">
      <div className="pra-encabezado">
        <div>
          <span className="pra-superior">ADMINISTRACIÓN GENERAL</span>
          <h2>Promociones</h2>
          <p>
            Gestiona beneficios, descuentos y promociones para los clientes
            de BANUAT.
          </p>
        </div>

        <div className="pra-encabezado-icon">
          <Gift size={27} />
        </div>
      </div>

      <div className="pra-indicadores">
        <article className="pra-indicador">
          <div className="pra-indicador-icon naranja">
            <Gift size={21} />
          </div>
          <div>
            <span>Total promociones</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="pra-indicador">
          <div className="pra-indicador-icon verde">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Promociones activas</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="pra-indicador">
          <div className="pra-indicador-icon azul">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Programadas</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="pra-indicador">
          <div className="pra-indicador-icon morado">
            <Percent size={21} />
          </div>
          <div>
            <span>Beneficios disponibles</span>
            <strong>—</strong>
          </div>
        </article>
      </div>

      <div className="pra-secciones">
        {secciones.map(({ nombre, icono: Icono }) => (
          <button
            key={nombre}
            className={`pra-tab ${
              seccionActiva === nombre ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion(nombre)}
          >
            <Icono size={18} />
            {nombre}
          </button>
        ))}
      </div>

      <div className="pra-descripcion">
        <div>
          <h3>{seccionActiva}</h3>
          <p>{obtenerDescripcion()}</p>
        </div>

        <div className="pra-descripcion-icon">
          {seccionActiva === "Promociones" && <Gift size={22} />}
          {seccionActiva === "Crear promoción" && <Plus size={22} />}
          {seccionActiva === "Vigencia" && <Clock size={22} />}
        </div>
      </div>

      {renderizarContenido()}

      <div className="pra-nota">
        <Info size={18} />
        <p>
          Las promociones podrán comunicarse a los clientes y mostrarse en sus
          respectivos módulos una vez que estén registradas y habilitadas.
          Su configuración no modifica automáticamente las condiciones de los
          productos financieros.
        </p>
      </div>
    </div>
  );
}