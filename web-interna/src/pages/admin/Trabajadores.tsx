import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCog,
  ShieldCheck,
  Search,
  Filter,
  BriefcaseBusiness,
  ClipboardList,
  Wallet,
  Headset,
  Eye,
  LockKeyhole,
} from "lucide-react";

import { getApiUrl } from "../../services/auth";
import "./Trabajadores.css";

type SeccionTrabajadores =
  | "Directorio"
  | "Registro"
  | "Roles";

type TrabajadorItem = {
  id: string;
  numeroEmpleado: string;
  nombre: string;
  correo: string;
  usuario: string;
  puesto: string;
  rolCodigo: string;
  sucursal: string;
  estado: "Activo" | "Suspendido";
  fechaIngreso: string;
};

function Trabajadores() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionTrabajadores>("Directorio");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [resumen, setResumen] = useState({
    total: 0,
    activos: 0,
    supervisores: 0,
    cuentasRegistradas: 0,
  });
  const [trabajadores, setTrabajadores] = useState<TrabajadorItem[]>([]);

  // Campos del formulario de registro
  const [nombreForm, setNombreForm] = useState("");
  const [correoForm, setCorreoForm] = useState("");
  const [puestoForm, setPuestoForm] = useState("");
  const [estadoForm, setEstadoForm] = useState("Activo");
  const [contrasenaForm, setContrasenaForm] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const cargarTrabajadores = async () => {
    try {
      const res = await fetch(getApiUrl("/api/admin/trabajadores"));
      const data = await res.json();
      if (data && data.resumen) {
        setResumen(data.resumen);
        setTrabajadores(Array.isArray(data.trabajadores) ? data.trabajadores : []);
      }
    } catch (err) {
      console.error("Error al cargar trabajadores:", err);
    }
  };

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const cambiarSeccion = (seccion: SeccionTrabajadores) => {
    setSeccionActiva(seccion);
    setBusqueda("");
    setFiltroEstado("Todos");
    setMensaje(null);
  };

  const handleCrearTrabajador = async () => {
    if (!nombreForm.trim() || !correoForm.trim() || !puestoForm || !contrasenaForm.trim()) {
      setMensaje({
        tipo: "error",
        texto: "Por favor completa nombre, correo, puesto y contraseña inicial.",
      });
      return;
    }

    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetch(getApiUrl("/api/admin/trabajadores"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreForm.trim(),
          correo: correoForm.trim(),
          puesto: puestoForm,
          estado: estadoForm,
          contrasena: contrasenaForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensaje({ tipo: "error", texto: data.error || "No se pudo registrar el trabajador." });
      } else {
        setMensaje({
          tipo: "ok",
          texto: `Cuenta creada exitosamente para ${data.trabajador?.nombre} (${data.trabajador?.correo}).`,
        });
        setNombreForm("");
        setCorreoForm("");
        setPuestoForm("");
        setEstadoForm("Activo");
        setContrasenaForm("");
        await cargarTrabajadores();
      }
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión con el servidor." });
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstadoTrabajador = async (id: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/trabajadores/${id}/estado`), {
        method: "PATCH",
      });
      if (res.ok) {
        await cargarTrabajadores();
      }
    } catch (err) {
      console.error("Error al cambiar estado del trabajador:", err);
    }
  };

  const trabajadoresFiltrados = trabajadores.filter((t) => {
    const q = busqueda.toLowerCase();
    const coincideTexto =
      !q ||
      t.nombre.toLowerCase().includes(q) ||
      t.correo.toLowerCase().includes(q) ||
      t.puesto.toLowerCase().includes(q) ||
      t.numeroEmpleado.toLowerCase().includes(q);

    const coincideEstado =
      filtroEstado === "Todos" || t.estado === filtroEstado;

    return coincideTexto && coincideEstado;
  });

  return (
    <div className="tra-container">

      {/* ENCABEZADO */}
      <div className="tra-heading">
        <div>
          <span className="tra-eyebrow">
            ADMINISTRACIÓN DE PERSONAL
          </span>

          <h2>Gestión de trabajadores</h2>

          <p>
            Administra las cuentas, los puestos y los permisos
            del personal de BANUAT.
          </p>
        </div>
      </div>

      {/* INDICADORES */}
      <section className="tra-stats">

        <article className="tra-stat-card">
          <div className="tra-stat-icon orange">
            <Users size={21} />
          </div>

          <div>
            <span>Total de trabajadores</span>
            <strong>{resumen.total}</strong>
          </div>
        </article>

        <article className="tra-stat-card">
          <div className="tra-stat-icon green">
            <UserCog size={21} />
          </div>

          <div>
            <span>Personal activo</span>
            <strong>{resumen.activos}</strong>
          </div>
        </article>

        <article className="tra-stat-card">
          <div className="tra-stat-icon brown">
            <ShieldCheck size={21} />
          </div>

          <div>
            <span>Supervisores</span>
            <strong>{resumen.supervisores}</strong>
          </div>
        </article>

        <article className="tra-stat-card">
          <div className="tra-stat-icon blue">
            <UserPlus size={21} />
          </div>

          <div>
            <span>Cuentas registradas</span>
            <strong>{resumen.cuentasRegistradas}</strong>
          </div>
        </article>

      </section>

      {/* SECCIÓN PRINCIPAL */}
      <section className="tra-section">

        {/* PESTAÑAS */}
        <div className="tra-tabs">

          <button
            type="button"
            className={seccionActiva === "Directorio" ? "active" : ""}
            onClick={() => cambiarSeccion("Directorio")}
          >
            <Users size={17} />
            Directorio
          </button>

          <button
            type="button"
            className={seccionActiva === "Registro" ? "active" : ""}
            onClick={() => cambiarSeccion("Registro")}
          >
            <UserPlus size={17} />
            Registrar trabajador
          </button>

          <button
            type="button"
            className={seccionActiva === "Roles" ? "active" : ""}
            onClick={() => cambiarSeccion("Roles")}
          >
            <ShieldCheck size={17} />
            Roles y permisos
          </button>

        </div>

        <div className="tra-content">

          {/* DIRECTORIO */}
          {seccionActiva === "Directorio" && (
            <>
              <div className="tra-content-heading">
                <div>
                  <h3>Directorio de trabajadores</h3>
                  <p>
                    Consulta y administra las cuentas del personal.
                  </p>
                </div>
              </div>

              <div className="tra-toolbar">

                <div className="tra-search">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Buscar por nombre, correo o puesto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="tra-filter">
                  <Filter size={17} />

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todos">Todos los estados</option>
                    <option value="Activo">Activo</option>
                    <option value="Suspendido">Suspendido</option>
                  </select>
                </div>

              </div>

              {trabajadoresFiltrados.length === 0 ? (
                <div className="tra-empty-state">
                  <div className="tra-empty-icon orange">
                    <Users size={27} />
                  </div>

                  <h4>No hay trabajadores registrados</h4>

                  <p>
                    Cuando se creen las cuentas del personal,
                    aparecerán aquí para consultar y administrar
                    su información.
                  </p>

                  <button
                    type="button"
                    className="tra-primary-button"
                    onClick={() => cambiarSeccion("Registro")}
                  >
                    <UserPlus size={16} />
                    Registrar trabajador
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                  {trabajadoresFiltrados.map((trab) => (
                    <div
                      key={trab.id}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        padding: "14px 16px",
                        borderRadius: "14px",
                        border: "1px solid #e9e2d8",
                        background: "#ffffff",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "0.96rem", color: "#231f1b" }}>
                          {trab.nombre} · <span style={{ color: "#9a6b3b" }}>{trab.numeroEmpleado}</span>
                        </strong>
                        <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "#686057" }}>
                          Puesto: <strong>{trab.puesto}</strong> · Correo: {trab.correo} · Sucursal: {trab.sucursal}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            backgroundColor: trab.estado === "Activo" ? "#dcfce7" : "#fee2e2",
                            color: trab.estado === "Activo" ? "#15803d" : "#b91c1c",
                          }}
                        >
                          {trab.estado}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleEstadoTrabajador(trab.id)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid #d6cfc7",
                            background: "#faf8f5",
                            color: "#4a433c",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          {trab.estado === "Activo" ? "Suspender" : "Reactivar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* REGISTRO */}
          {seccionActiva === "Registro" && (
            <>
              <div className="tra-content-heading">
                <div>
                  <h3>Registrar trabajador</h3>
                  <p>
                    Información necesaria para crear una cuenta
                    del personal de BANUAT.
                  </p>
                </div>
              </div>

              <div className="tra-registration">

                <div className="tra-registration-notice">
                  <div className="tra-notice-icon">
                    <LockKeyhole size={19} />
                  </div>

                  <div>
                    <strong>Registro de personal</strong>
                    <p>
                      El administrador podrá crear las cuentas
                      de los trabajadores y asignarles un rol.
                    </p>
                  </div>
                </div>

                {mensaje && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "10px",
                      marginBottom: "14px",
                      backgroundColor: mensaje.tipo === "ok" ? "#dcfce7" : "#fee2e2",
                      color: mensaje.tipo === "ok" ? "#166534" : "#991b1b",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                    }}
                  >
                    {mensaje.texto}
                  </div>
                )}

                <div className="tra-fields">

                  <div className="tra-field">
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      placeholder="Nombre y apellidos"
                      value={nombreForm}
                      onChange={(e) => setNombreForm(e.target.value)}
                    />
                  </div>

                  <div className="tra-field">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      placeholder="correo@banuat.local"
                      value={correoForm}
                      onChange={(e) => setCorreoForm(e.target.value)}
                    />
                  </div>

                  <div className="tra-field">
                    <label>Puesto de trabajo</label>
                    <select
                      value={puestoForm}
                      onChange={(e) => setPuestoForm(e.target.value)}
                    >
                      <option value="" disabled>
                        Seleccionar puesto
                      </option>
                      <option value="supervisor">Supervisor</option>
                      <option value="escritorio">Escritorio</option>
                      <option value="cajero">Cajero</option>
                      <option value="recepcion">Recepción</option>
                    </select>
                  </div>

                  <div className="tra-field">
                    <label>Estado de la cuenta</label>
                    <select
                      value={estadoForm}
                      onChange={(e) => setEstadoForm(e.target.value)}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Suspendido">Suspendido</option>
                    </select>
                  </div>

                  <div className="tra-field tra-field-full">
                    <label>Contraseña inicial</label>
                    <input
                      type="password"
                      placeholder="Establecer contraseña inicial"
                      value={contrasenaForm}
                      onChange={(e) => setContrasenaForm(e.target.value)}
                    />
                  </div>

                </div>

                <div className="tra-registration-footer">
                  <p>
                    Al guardar, el trabajador quedará habilitado en MySQL con su rol asignado.
                  </p>

                  <button
                    type="button"
                    className="tra-primary-button"
                    disabled={guardando}
                    onClick={handleCrearTrabajador}
                  >
                    <UserPlus size={16} />
                    {guardando ? "Creando cuenta..." : "Crear cuenta"}
                  </button>
                </div>

              </div>
            </>
          )}

          {/* ROLES Y PERMISOS */}
          {seccionActiva === "Roles" && (
            <>
              <div className="tra-content-heading">
                <div>
                  <h3>Roles y permisos</h3>
                  <p>
                    Consulta las responsabilidades de cada puesto
                    dentro de la cooperativa.
                  </p>
                </div>
              </div>

              <div className="tra-roles-grid">

                <article className="tra-role-card">
                  <div className="tra-role-top">
                    <div className="tra-role-icon orange">
                      <ShieldCheck size={21} />
                    </div>
                    <span className="tra-role-label">Supervisión</span>
                  </div>

                  <h4>Supervisor</h4>

                  <p>
                    Revisa y autoriza las solicitudes de préstamos,
                    supervisa operaciones y verifica documentación.
                  </p>

                  <div className="tra-role-permissions">
                    <span><Eye size={14} /> Revisar solicitudes</span>
                    <span><ShieldCheck size={14} /> Autorizar préstamos</span>
                    <span><ClipboardList size={14} /> Supervisar operaciones</span>
                  </div>
                </article>

                <article className="tra-role-card">
                  <div className="tra-role-top">
                    <div className="tra-role-icon blue">
                      <BriefcaseBusiness size={21} />
                    </div>
                    <span className="tra-role-label">Atención</span>
                  </div>

                  <h4>Escritorio</h4>

                  <p>
                    Registra clientes, captura solicitudes y
                    documentos, y consulta información para
                    atender dudas.
                  </p>

                  <div className="tra-role-permissions">
                    <span><UserPlus size={14} /> Registrar clientes</span>
                    <span><ClipboardList size={14} /> Crear solicitudes</span>
                    <span><Eye size={14} /> Consultar información</span>
                  </div>
                </article>

                <article className="tra-role-card">
                  <div className="tra-role-top">
                    <div className="tra-role-icon green">
                      <Wallet size={21} />
                    </div>
                    <span className="tra-role-label">Operaciones</span>
                  </div>

                  <h4>Cajero</h4>

                  <p>
                    Realiza depósitos, retiros y pagos,
                    administra el control de caja y consulta
                    el historial de movimientos.
                  </p>

                  <div className="tra-role-permissions">
                    <span><Wallet size={14} /> Depósitos y retiros</span>
                    <span><ClipboardList size={14} /> Registrar pagos</span>
                    <span><Eye size={14} /> Consultar movimientos</span>
                  </div>
                </article>

                <article className="tra-role-card">
                  <div className="tra-role-top">
                    <div className="tra-role-icon brown">
                      <Headset size={21} />
                    </div>
                    <span className="tra-role-label">Recepción</span>
                  </div>

                  <h4>Recepcionista</h4>

                  <p>
                    Atiende a los visitantes, administra turnos
                    y proporciona información sobre los requisitos
                    de los servicios.
                  </p>

                  <div className="tra-role-permissions">
                    <span><Users size={14} /> Atención de clientes</span>
                    <span><ClipboardList size={14} /> Gestionar turnos</span>
                    <span><Eye size={14} /> Consultar requisitos</span>
                  </div>
                </article>

              </div>

              <div className="tra-permissions-note">
                <LockKeyhole size={17} />
                <p>
                  Los permisos se asignan según el puesto del trabajador.
                  Las autorizaciones administrativas permanecen
                  restringidas al administrador y al supervisor
                  de acuerdo con sus responsabilidades.
                </p>
              </div>
            </>
          )}

        </div>
      </section>

      {/* NOTA ADMINISTRATIVA */}
      <section className="tra-info">
        <div className="tra-info-icon">
          <ShieldCheck size={19} />
        </div>

        <div>
          <h4>Administración de accesos</h4>
          <p>
            El administrador es responsable de crear las cuentas
            del personal y asignar los roles correspondientes.
            Cada trabajador tendrá acceso únicamente a las
            funciones de su puesto.
          </p>
        </div>
      </section>

    </div>
  );
}

export default Trabajadores;
