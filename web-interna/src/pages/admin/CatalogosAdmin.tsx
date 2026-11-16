import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Package,
  Layers3,
  Search,
  Plus,
  FolderOpen,
  Clock,
  Settings2,
  Monitor,
  UserRound,
  Headset,
  BriefcaseBusiness,
  Info,
} from "lucide-react";

import "./CatalogosAdmin.css";

type SeccionCatalogo = "Catálogos" | "Temporadas" | "Disponibilidad";

export default function CatalogosAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionCatalogo>("Catálogos");

  const [busqueda, setBusqueda] = useState("");

  const secciones: {
    nombre: SeccionCatalogo;
    icono: typeof BookOpen;
  }[] = [
    { nombre: "Catálogos", icono: BookOpen },
    { nombre: "Temporadas", icono: CalendarDays },
    { nombre: "Disponibilidad", icono: Settings2 },
  ];

  const cambiarSeccion = (seccion: SeccionCatalogo) => {
    setSeccionActiva(seccion);
    setBusqueda("");
  };

  const obtenerDescripcion = () => {
    switch (seccionActiva) {
      case "Catálogos":
        return "Organiza los catálogos de productos y servicios disponibles en BANUAT.";
      case "Temporadas":
        return "Administra los catálogos relacionados con temporadas y periodos especiales.";
      case "Disponibilidad":
        return "Define qué catálogos y opciones pueden consultar las distintas áreas.";
      default:
        return "";
    }
  };

  const renderizarContenido = () => {
    switch (seccionActiva) {
      case "Catálogos":
        return (
          <section className="caa-contenido">
            <div className="caa-panel-header">
              <div>
                <h3>Catálogos registrados</h3>
                <p>
                  Consulta y organiza los catálogos generales del sistema.
                </p>
              </div>

              <button className="caa-btn-principal" disabled>
                <Plus size={17} />
                Nuevo catálogo
              </button>
            </div>

            <div className="caa-filtros">
              <div className="caa-busqueda">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Buscar catálogo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="caa-empty">
              <div className="caa-empty-icon">
                <FolderOpen size={30} />
              </div>
              <h4>No hay catálogos registrados</h4>
              <p>
                Cuando se creen catálogos, aparecerán aquí para que puedas
                administrarlos.
              </p>
            </div>
          </section>
        );

      case "Temporadas":
        return (
          <section className="caa-contenido">
            <div className="caa-panel-header">
              <div>
                <h3>Catálogos de temporada</h3>
                <p>
                  Administra las opciones que estarán disponibles durante
                  determinados periodos.
                </p>
              </div>

              <button className="caa-btn-principal" disabled>
                <Plus size={17} />
                Nueva temporada
              </button>
            </div>

            <div className="caa-info">
              <div className="caa-info-icon">
                <Info size={19} />
              </div>
              <div>
                <strong>Administración de temporadas</strong>
                <p>
                  Cada temporada podrá tener un nombre, descripción, fecha de
                  inicio, fecha de finalización y catálogo asociado. El
                  administrador podrá determinar cuándo estará disponible.
                </p>
              </div>
            </div>

            <div className="caa-empty">
              <div className="caa-empty-icon">
                <CalendarDays size={30} />
              </div>
              <h4>No hay temporadas configuradas</h4>
              <p>
                Las temporadas que se registren aparecerán aquí junto con su
                periodo y estado.
              </p>
            </div>
          </section>
        );

      case "Disponibilidad":
        return (
          <section className="caa-contenido">
            <div className="caa-panel-header">
              <div>
                <h3>Disponibilidad por área</h3>
                <p>
                  Configura qué opciones podrán consultar los trabajadores
                  según sus responsabilidades.
                </p>
              </div>
            </div>

            <div className="caa-areas">
              <article className="caa-area-card">
                <div className="caa-area-icon">
                  <Headset size={22} />
                </div>
                <div className="caa-area-info">
                  <h4>Recepción</h4>
                  <p>
                    Consulta los servicios, requisitos y opciones disponibles
                    para orientar a los clientes.
                  </p>
                  <span>Configuración pendiente</span>
                </div>
              </article>

              <article className="caa-area-card">
                <div className="caa-area-icon">
                  <BriefcaseBusiness size={22} />
                </div>
                <div className="caa-area-info">
                  <h4>Escritorio</h4>
                  <p>
                    Consulta los productos, servicios y opciones necesarias
                    para registrar solicitudes y atender consultas.
                  </p>
                  <span>Configuración pendiente</span>
                </div>
              </article>

              <article className="caa-area-card">
                <div className="caa-area-icon">
                  <UserRound size={22} />
                </div>
                <div className="caa-area-info">
                  <h4>Clientes</h4>
                  <p>
                    Consulta los catálogos y productos que podrán mostrarse
                    dentro del portal del cliente.
                  </p>
                  <span>Configuración pendiente</span>
                </div>
              </article>

              <article className="caa-area-card">
                <div className="caa-area-icon">
                  <Monitor size={22} />
                </div>
                <div className="caa-area-info">
                  <h4>Supervisor</h4>
                  <p>
                    Consulta los catálogos relacionados con la revisión y
                    supervisión de operaciones.
                  </p>
                  <span>Configuración pendiente</span>
                </div>
              </article>
            </div>

            <div className="caa-nota">
              <Info size={18} />
              <p>
                La disponibilidad por área permitirá controlar qué información
                puede consultar cada módulo. No modifica los permisos de acceso
                de los trabajadores.
              </p>
            </div>
          </section>
        );
    }
  };

  return (
    <div className="caa-page">
      <div className="caa-encabezado">
        <div>
          <span className="caa-superior">ADMINISTRACIÓN GENERAL</span>
          <h2>Catálogos</h2>
          <p>
            Organiza los catálogos, temporadas y opciones disponibles en el
            sistema.
          </p>
        </div>

        <div className="caa-encabezado-icon">
          <BookOpen size={27} />
        </div>
      </div>

      <div className="caa-indicadores">
        <article className="caa-indicador">
          <div className="caa-indicador-icon naranja">
            <BookOpen size={21} />
          </div>
          <div>
            <span>Catálogos registrados</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="caa-indicador">
          <div className="caa-indicador-icon verde">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Temporadas activas</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="caa-indicador">
          <div className="caa-indicador-icon morado">
            <Package size={21} />
          </div>
          <div>
            <span>Productos disponibles</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="caa-indicador">
          <div className="caa-indicador-icon azul">
            <Layers3 size={21} />
          </div>
          <div>
            <span>Áreas configuradas</span>
            <strong>—</strong>
          </div>
        </article>
      </div>

      <div className="caa-secciones">
        {secciones.map(({ nombre, icono: Icono }) => (
          <button
            key={nombre}
            className={`caa-tab ${
              seccionActiva === nombre ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion(nombre)}
          >
            <Icono size={18} />
            {nombre}
          </button>
        ))}
      </div>

      <div className="caa-descripcion">
        <div>
          <h3>{seccionActiva}</h3>
          <p>{obtenerDescripcion()}</p>
        </div>
        <div className="caa-descripcion-icon">
          {seccionActiva === "Catálogos" && <BookOpen size={22} />}
          {seccionActiva === "Temporadas" && <Clock size={22} />}
          {seccionActiva === "Disponibilidad" && <Settings2 size={22} />}
        </div>
      </div>

      {renderizarContenido()}
    </div>
  );
}