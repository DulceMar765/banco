
import { useState } from "react";
import {
  Building2,
  Settings,
  ShieldCheck,
  Bell,
  SlidersHorizontal,
  Save,
  Info,
  Mail,
  Phone,
  Globe,
  LockKeyhole,
  Clock,
  Palette,
  CalendarDays,
  KeyRound,
} from "lucide-react";

import "./ConfiguracionAdmin.css";

type SeccionConfiguracion =
  | "Datos institucionales"
  | "Parámetros generales"
  | "Seguridad"
  | "Notificaciones"
  | "Preferencias";

export default function ConfiguracionAdmin() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionConfiguracion>("Datos institucionales");

  const secciones: {
    nombre: SeccionConfiguracion;
    icono: typeof Building2;
  }[] = [
    { nombre: "Datos institucionales", icono: Building2 },
    { nombre: "Parámetros generales", icono: Settings },
    { nombre: "Seguridad", icono: ShieldCheck },
    { nombre: "Notificaciones", icono: Bell },
    { nombre: "Preferencias", icono: SlidersHorizontal },
  ];

  const obtenerDescripcion = () => {
    switch (seccionActiva) {
      case "Datos institucionales":
        return "Consulta y administra la información general de BANUAT.";
      case "Parámetros generales":
        return "Configura los parámetros generales utilizados por el sistema.";
      case "Seguridad":
        return "Consulta las opciones relacionadas con el acceso y protección de las cuentas.";
      case "Notificaciones":
        return "Administra las preferencias de avisos y notificaciones del sistema.";
      case "Preferencias":
        return "Configura las opciones generales de visualización.";
      default:
        return "";
    }
  };

  const renderizarDatosInstitucionales = () => (
    <div className="coa-panel">
      <div className="coa-panel-header">
        <div>
          <h3>Información institucional</h3>
          <p>Datos generales de la cooperativa.</p>
        </div>
        <Building2 size={21} />
      </div>

      <div className="coa-form-grid">
        <div className="coa-campo">
          <label>Nombre de la institución</label>
          <input
            type="text"
            placeholder="Nombre de BANUAT"
            disabled
          />
        </div>

        <div className="coa-campo">
          <label>Nombre comercial</label>
          <input
            type="text"
            placeholder="Nombre comercial"
            disabled
          />
        </div>

        <div className="coa-campo">
          <label>Correo institucional</label>
          <div className="coa-input-icon">
            <Mail size={16} />
            <input
              type="email"
              placeholder="Correo institucional"
              disabled
            />
          </div>
        </div>

        <div className="coa-campo">
          <label>Teléfono de contacto</label>
          <div className="coa-input-icon">
            <Phone size={16} />
            <input
              type="tel"
              placeholder="Teléfono de contacto"
              disabled
            />
          </div>
        </div>

        <div className="coa-campo coa-campo-completo">
          <label>Dirección institucional</label>
          <div className="coa-input-icon">
            <Globe size={16} />
            <input
              type="text"
              placeholder="Dirección de la institución"
              disabled
            />
          </div>
        </div>

        <div className="coa-campo coa-campo-completo">
          <label>Descripción institucional</label>
          <textarea
            placeholder="Descripción de la cooperativa..."
            rows={4}
            disabled
          />
        </div>
      </div>

      <div className="coa-panel-footer">
        <button className="coa-btn-guardar" disabled>
          <Save size={16} />
          Guardar cambios
        </button>
      </div>
    </div>
  );

  const renderizarParametros = () => (
    <div className="coa-panel">
      <div className="coa-panel-header">
        <div>
          <h3>Parámetros generales</h3>
          <p>Opciones que determinan el funcionamiento general.</p>
        </div>
        <Settings size={21} />
      </div>

      <div className="coa-opciones">
        <div className="coa-opcion">
          <div className="coa-opcion-icon">
            <Globe size={19} />
          </div>
          <div className="coa-opcion-info">
            <strong>Moneda del sistema</strong>
            <span>Moneda utilizada para mostrar importes y operaciones.</span>
          </div>
          <select disabled defaultValue="MXN">
            <option value="MXN">Peso mexicano (MXN)</option>
          </select>
        </div>

        <div className="coa-opcion">
          <div className="coa-opcion-icon">
            <CalendarDays size={19} />
          </div>
          <div className="coa-opcion-info">
            <strong>Formato de fecha</strong>
            <span>Formato para presentar las fechas del sistema.</span>
          </div>
          <select disabled defaultValue="dd/mm/yyyy">
            <option value="dd/mm/yyyy">DD/MM/AAAA</option>
          </select>
        </div>

        <div className="coa-opcion">
          <div className="coa-opcion-icon">
            <Clock size={19} />
          </div>
          <div className="coa-opcion-info">
            <strong>Zona horaria</strong>
            <span>Zona horaria utilizada para los registros.</span>
          </div>
          <select disabled defaultValue="America/Mexico_City">
            <option value="America/Mexico_City">
              México (centro)
            </option>
          </select>
        </div>
      </div>

      <div className="coa-panel-footer">
        <button className="coa-btn-guardar" disabled>
          <Save size={16} />
          Guardar cambios
        </button>
      </div>
    </div>
  );

  const renderizarSeguridad = () => (
    <div className="coa-panel">
      <div className="coa-panel-header">
        <div>
          <h3>Seguridad y acceso</h3>
          <p>Políticas generales para proteger las cuentas.</p>
        </div>
        <ShieldCheck size={21} />
      </div>

      <div className="coa-seguridad-lista">
        <article className="coa-seguridad-item">
          <div className="coa-opcion-icon">
            <KeyRound size={19} />
          </div>
          <div>
            <strong>Política de contraseñas</strong>
            <p>
              Establece los requisitos mínimos para las contraseñas
              de los usuarios.
            </p>
          </div>
          <span className="coa-estado-pendiente">Por configurar</span>
        </article>

        <article className="coa-seguridad-item">
          <div className="coa-opcion-icon">
            <LockKeyhole size={19} />
          </div>
          <div>
            <strong>Control de sesiones</strong>
            <p>
              Define el tiempo de inactividad permitido antes de
              cerrar una sesión.
            </p>
          </div>
          <span className="coa-estado-pendiente">Por configurar</span>
        </article>

        <article className="coa-seguridad-item">
          <div className="coa-opcion-icon">
            <ShieldCheck size={19} />
          </div>
          <div>
            <strong>Permisos por rol</strong>
            <p>
              Consulta los permisos asignados a administradores,
              supervisores y demás trabajadores.
            </p>
          </div>
          <span className="coa-estado-pendiente">Por configurar</span>
        </article>
      </div>
    </div>
  );

  const renderizarNotificaciones = () => (
    <div className="coa-panel">
      <div className="coa-panel-header">
        <div>
          <h3>Notificaciones del sistema</h3>
          <p>Preferencias de comunicación y avisos internos.</p>
        </div>
        <Bell size={21} />
      </div>

      <div className="coa-notificaciones-lista">
        <article className="coa-notificacion">
          <div>
            <strong>Solicitudes de préstamos</strong>
            <p>
              Avisos cuando se registren nuevas solicitudes
              pendientes de revisión.
            </p>
          </div>
          <span className="coa-estado-pendiente">Por configurar</span>
        </article>

        <article className="coa-notificacion">
          <div>
            <strong>Registros de nuevos clientes</strong>
            <p>
              Avisos cuando existan solicitudes de alta de clientes.
            </p>
          </div>
          <span className="coa-estado-pendiente">Por configurar</span>
        </article>

        <article className="coa-notificacion">
          <div>
            <strong>Actividad del personal</strong>
            <p>
              Avisos sobre eventos administrativos y operativos.
            </p>
          </div>
          <span className="coa-estado-pendiente">Por configurar</span>
        </article>

        <article className="coa-notificacion">
          <div>
            <strong>Promociones y beneficios</strong>
            <p>
              Avisos relacionados con promociones y beneficios
              disponibles para los clientes.
            </p>
          </div>
          <span className="coa-estado-pendiente">Por configurar</span>
        </article>
      </div>

      <div className="coa-panel-footer">
        <button className="coa-btn-guardar" disabled>
          <Save size={16} />
          Guardar preferencias
        </button>
      </div>
    </div>
  );

  const renderizarPreferencias = () => (
    <div className="coa-panel">
      <div className="coa-panel-header">
        <div>
          <h3>Preferencias de visualización</h3>
          <p>Opciones de presentación de la interfaz.</p>
        </div>
        <Palette size={21} />
      </div>

      <div className="coa-opciones">
        <div className="coa-opcion">
          <div className="coa-opcion-icon">
            <Palette size={19} />
          </div>
          <div className="coa-opcion-info">
            <strong>Tema visual</strong>
            <span>Define la apariencia general del sistema.</span>
          </div>
          <select disabled defaultValue="claro">
            <option value="claro">Claro</option>
          </select>
        </div>

        <div className="coa-opcion">
          <div className="coa-opcion-icon">
            <SlidersHorizontal size={19} />
          </div>
          <div className="coa-opcion-info">
            <strong>Panel de administración</strong>
            <span>Organización de los elementos del panel.</span>
          </div>
          <select disabled defaultValue="predeterminado">
            <option value="predeterminado">
              Predeterminado
            </option>
          </select>
        </div>
      </div>

      <div className="coa-panel-footer">
        <button className="coa-btn-guardar" disabled>
          <Save size={16} />
          Guardar preferencias
        </button>
      </div>
    </div>
  );

  const renderizarContenido = () => {
    switch (seccionActiva) {
      case "Datos institucionales":
        return renderizarDatosInstitucionales();

      case "Parámetros generales":
        return renderizarParametros();

      case "Seguridad":
        return renderizarSeguridad();

      case "Notificaciones":
        return renderizarNotificaciones();

      case "Preferencias":
        return renderizarPreferencias();
    }
  };

  return (
    <div className="coa-page">
      <div className="coa-encabezado">
        <div>
          <span className="coa-superior">
            ADMINISTRACIÓN GENERAL
          </span>
          <h2>Configuración</h2>
          <p>
            Administra las opciones generales y preferencias
            del sistema BANUAT.
          </p>
        </div>

        <div className="coa-encabezado-icon">
          <Settings size={27} />
        </div>
      </div>

      <div className="coa-resumen">
        <div className="coa-resumen-icon">
          <Info size={21} />
        </div>
        <div>
          <strong>Configuración del sistema</strong>
          <p>
            Las opciones se encuentran preparadas para su
            implementación. Los cambios todavía no se guardan.
          </p>
        </div>
      </div>

      <div className="coa-contenido">
        <aside className="coa-sidebar">
          <span className="coa-sidebar-titulo">CONFIGURACIÓN</span>

          {secciones.map(({ nombre, icono: Icono }) => (
            <button
              key={nombre}
              className={`coa-menu-item ${
                seccionActiva === nombre ? "activo" : ""
              }`}
              onClick={() => setSeccionActiva(nombre)}
            >
              <Icono size={18} />
              <span>{nombre}</span>
            </button>
          ))}
        </aside>

        <main className="coa-main">
          <div className="coa-seccion-header">
            <div>
              <h3>{seccionActiva}</h3>
              <p>{obtenerDescripcion()}</p>
            </div>
          </div>

          {renderizarContenido()}
        </main>
      </div>

      <div className="coa-nota">
        <Info size={18} />
        <p>
          Los cambios de configuración deberán estar disponibles
          únicamente para usuarios autorizados. Las modificaciones
          importantes deberán quedar registradas en el módulo de
          auditoría.
        </p>
      </div>
    </div>
  );
}
