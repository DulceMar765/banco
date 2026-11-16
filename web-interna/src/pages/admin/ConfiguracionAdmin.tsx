import { useState, useEffect } from "react";
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

import { getApiUrl } from "../../services/auth";
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

  const [institucion, setInstitucion] = useState({
    nombre: "Sucursal Matriz Centro",
    nombreComercial: "BANUAT · Cooperativa Financiera",
    correo: "contacto@banuat.local",
    telefono: "833 212 3456",
    direccion: "Av. Hidalgo 1200, Zona Centro",
    descripcion: "Plataforma Integral de Gestión Bancaria y Cooperativa Financiera orientada al ahorro, inversión y crédito social.",
  });

  const [parametros, setParametros] = useState({
    moneda: "MXN",
    formatoFecha: "dd/mm/yyyy",
    zonaHoraria: "America/Mexico_City",
  });

  const [seguridad, setSeguridad] = useState({
    maxIntentosLogin: 5,
    bloqueoMinutos: 15,
    sesionInactivaMinutos: 30,
  });

  const [notificaciones, setNotificaciones] = useState({
    solicitudesPrestamos: true,
    registrosClientes: true,
    actividadPersonal: true,
    promocionesBeneficios: true,
  });

  const [preferencias, setPreferencias] = useState({
    temaVisual: "claro",
    organizacionPanel: "predeterminado",
  });

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    fetch(getApiUrl("/api/admin/configuracion"))
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.institucion) setInstitucion(data.institucion);
          if (data.parametros) setParametros(data.parametros);
          if (data.seguridad) setSeguridad(data.seguridad);
          if (data.notificaciones) setNotificaciones(data.notificaciones);
          if (data.preferencias) setPreferencias(data.preferencias);
        }
      })
      .catch((err) => console.error("Error al cargar configuración admin:", err));
  }, []);

  const guardarConfiguracion = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetch(getApiUrl("/api/admin/configuracion"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institucion,
          parametros,
          seguridad,
          notificaciones,
          preferencias,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.mensaje || "Cambios guardados y registrados en auditoría.");
      }
    } catch (err) {
      console.error("Error al guardar configuración:", err);
    } finally {
      setGuardando(false);
    }
  };

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
            value={institucion.nombre}
            onChange={(e) => setInstitucion({ ...institucion, nombre: e.target.value })}
          />
        </div>

        <div className="coa-campo">
          <label>Nombre comercial</label>
          <input
            type="text"
            placeholder="Nombre comercial"
            value={institucion.nombreComercial}
            onChange={(e) => setInstitucion({ ...institucion, nombreComercial: e.target.value })}
          />
        </div>

        <div className="coa-campo">
          <label>Correo institucional</label>
          <div className="coa-input-icon">
            <Mail size={16} />
            <input
              type="email"
              placeholder="Correo institucional"
              value={institucion.correo}
              onChange={(e) => setInstitucion({ ...institucion, correo: e.target.value })}
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
              value={institucion.telefono}
              onChange={(e) => setInstitucion({ ...institucion, telefono: e.target.value })}
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
              value={institucion.direccion}
              onChange={(e) => setInstitucion({ ...institucion, direccion: e.target.value })}
            />
          </div>
        </div>

        <div className="coa-campo coa-campo-completo">
          <label>Descripción institucional</label>
          <textarea
            placeholder="Descripción de la cooperativa..."
            rows={4}
            value={institucion.descripcion}
            onChange={(e) => setInstitucion({ ...institucion, descripcion: e.target.value })}
          />
        </div>
      </div>

      <div className="coa-panel-footer">
        <button
          type="button"
          className="coa-btn-guardar"
          disabled={guardando}
          onClick={guardarConfiguracion}
        >
          <Save size={16} />
          {guardando ? "Guardando..." : "Guardar cambios"}
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
          <select
            value={parametros.moneda}
            onChange={(e) => setParametros({ ...parametros, moneda: e.target.value })}
          >
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
          <select
            value={parametros.formatoFecha}
            onChange={(e) => setParametros({ ...parametros, formatoFecha: e.target.value })}
          >
            <option value="dd/mm/yyyy">DD/MM/AAAA</option>
            <option value="yyyy-mm-dd">AAAA-MM-DD</option>
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
          <select
            value={parametros.zonaHoraria}
            onChange={(e) => setParametros({ ...parametros, zonaHoraria: e.target.value })}
          >
            <option value="America/Mexico_City">
              México (centro)
            </option>
          </select>
        </div>
      </div>

      <div className="coa-panel-footer">
        <button
          type="button"
          className="coa-btn-guardar"
          disabled={guardando}
          onClick={guardarConfiguracion}
        >
          <Save size={16} />
          {guardando ? "Guardando..." : "Guardar cambios"}
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
            <strong>Política de contraseñas y bloqueo preventivo</strong>
            <p>
              Bloqueo temporal de {seguridad.bloqueoMinutos} minutos tras {seguridad.maxIntentosLogin} intentos fallidos consecutivos (RF-01 a RF-05).
            </p>
          </div>
          <span className="coa-estado-pendiente" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>
            Activo ({seguridad.maxIntentosLogin} intentos / {seguridad.bloqueoMinutos} min)
          </span>
        </article>

        <article className="coa-seguridad-item">
          <div className="coa-opcion-icon">
            <LockKeyhole size={19} />
          </div>
          <div>
            <strong>Control de sesiones</strong>
            <p>
              Tiempo máximo de inactividad permitido antes de cerrar una sesión ({seguridad.sesionInactivaMinutos} minutos).
            </p>
          </div>
          <span className="coa-estado-pendiente" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>
            Activo ({seguridad.sesionInactivaMinutos} min)
          </span>
        </article>

        <article className="coa-seguridad-item">
          <div className="coa-opcion-icon">
            <ShieldCheck size={19} />
          </div>
          <div>
            <strong>Permisos por rol (RBAC) y Hash SHA-256</strong>
            <p>
              Matriz estricta de roles (Admin, Supervisor, Ejecutivo, Cajero, Recepción, Socio) y verificación criptográfica de expedientes.
            </p>
          </div>
          <span className="coa-estado-pendiente" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>
            Verificado
          </span>
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
        <article
          className="coa-notificacion"
          style={{ cursor: "pointer" }}
          onClick={() =>
            setNotificaciones({
              ...notificaciones,
              solicitudesPrestamos: !notificaciones.solicitudesPrestamos,
            })
          }
        >
          <div>
            <strong>Solicitudes de préstamos</strong>
            <p>
              Avisos cuando se registren nuevas solicitudes
              pendientes de revisión.
            </p>
          </div>
          <span
            className="coa-estado-pendiente"
            style={{
              backgroundColor: notificaciones.solicitudesPrestamos ? "#dcfce7" : "#f3f4f6",
              color: notificaciones.solicitudesPrestamos ? "#15803d" : "#4b5563",
            }}
          >
            {notificaciones.solicitudesPrestamos ? "Habilitado" : "Pausado"}
          </span>
        </article>

        <article
          className="coa-notificacion"
          style={{ cursor: "pointer" }}
          onClick={() =>
            setNotificaciones({
              ...notificaciones,
              registrosClientes: !notificaciones.registrosClientes,
            })
          }
        >
          <div>
            <strong>Registros de nuevos clientes</strong>
            <p>
              Avisos cuando existan solicitudes de alta de clientes.
            </p>
          </div>
          <span
            className="coa-estado-pendiente"
            style={{
              backgroundColor: notificaciones.registrosClientes ? "#dcfce7" : "#f3f4f6",
              color: notificaciones.registrosClientes ? "#15803d" : "#4b5563",
            }}
          >
            {notificaciones.registrosClientes ? "Habilitado" : "Pausado"}
          </span>
        </article>

        <article
          className="coa-notificacion"
          style={{ cursor: "pointer" }}
          onClick={() =>
            setNotificaciones({
              ...notificaciones,
              actividadPersonal: !notificaciones.actividadPersonal,
            })
          }
        >
          <div>
            <strong>Actividad del personal</strong>
            <p>
              Avisos sobre eventos administrativos y operativos.
            </p>
          </div>
          <span
            className="coa-estado-pendiente"
            style={{
              backgroundColor: notificaciones.actividadPersonal ? "#dcfce7" : "#f3f4f6",
              color: notificaciones.actividadPersonal ? "#15803d" : "#4b5563",
            }}
          >
            {notificaciones.actividadPersonal ? "Habilitado" : "Pausado"}
          </span>
        </article>

        <article
          className="coa-notificacion"
          style={{ cursor: "pointer" }}
          onClick={() =>
            setNotificaciones({
              ...notificaciones,
              promocionesBeneficios: !notificaciones.promocionesBeneficios,
            })
          }
        >
          <div>
            <strong>Promociones y beneficios</strong>
            <p>
              Avisos relacionados con promociones y beneficios
              disponibles para los clientes.
            </p>
          </div>
          <span
            className="coa-estado-pendiente"
            style={{
              backgroundColor: notificaciones.promocionesBeneficios ? "#dcfce7" : "#f3f4f6",
              color: notificaciones.promocionesBeneficios ? "#15803d" : "#4b5563",
            }}
          >
            {notificaciones.promocionesBeneficios ? "Habilitado" : "Pausado"}
          </span>
        </article>
      </div>

      <div className="coa-panel-footer">
        <button
          type="button"
          className="coa-btn-guardar"
          disabled={guardando}
          onClick={guardarConfiguracion}
        >
          <Save size={16} />
          {guardando ? "Guardando..." : "Guardar preferencias"}
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
          <select
            value={preferencias.temaVisual}
            onChange={(e) => setPreferencias({ ...preferencias, temaVisual: e.target.value })}
          >
            <option value="claro">Claro</option>
            <option value="institucional">Institucional Cálido</option>
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
          <select
            value={preferencias.organizacionPanel}
            onChange={(e) => setPreferencias({ ...preferencias, organizacionPanel: e.target.value })}
          >
            <option value="predeterminado">
              Predeterminado (1920x1080 / 1366x768)
            </option>
            <option value="compacto">Compacto</option>
          </select>
        </div>
      </div>

      <div className="coa-panel-footer">
        <button
          type="button"
          className="coa-btn-guardar"
          disabled={guardando}
          onClick={guardarConfiguracion}
        >
          <Save size={16} />
          {guardando ? "Guardando..." : "Guardar preferencias"}
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
            {mensaje
              ? mensaje
              : "Los parámetros institucionales se sincronizan directamente con la base de datos y el registro de auditoría."}
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
              onClick={() => {
                setSeccionActiva(nombre);
                setMensaje(null);
              }}
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
