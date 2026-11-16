
import { useState } from "react";
import {
  Users,
  UserPlus,
  UserCog,
  ShieldCheck,
  Search,
  Filter,
  UserRound,
  BriefcaseBusiness,
  ClipboardList,
  Wallet,
  Headset,
  Eye,
  LockKeyhole,
} from "lucide-react";

import "./Trabajadores.css";

type SeccionTrabajadores =
  | "Directorio"
  | "Registro"
  | "Roles";

function Trabajadores() {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionTrabajadores>("Directorio");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const cambiarSeccion = (seccion: SeccionTrabajadores) => {
    setSeccionActiva(seccion);
    setBusqueda("");
    setFiltroEstado("Todos");
  };

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
            <strong>—</strong>
          </div>
        </article>

        <article className="tra-stat-card">
          <div className="tra-stat-icon green">
            <UserCog size={21} />
          </div>

          <div>
            <span>Personal activo</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="tra-stat-card">
          <div className="tra-stat-icon brown">
            <ShieldCheck size={21} />
          </div>

          <div>
            <span>Supervisores</span>
            <strong>—</strong>
          </div>
        </article>

        <article className="tra-stat-card">
          <div className="tra-stat-icon blue">
            <UserPlus size={21} />
          </div>

          <div>
            <span>Cuentas registradas</span>
            <strong>—</strong>
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

                <div className="tra-fields">

                  <div className="tra-field">
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      placeholder="Nombre y apellidos"
                    />
                  </div>

                  <div className="tra-field">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      placeholder="correo@banuat.com"
                    />
                  </div>

                  <div className="tra-field">
                    <label>Puesto de trabajo</label>
                    <select defaultValue="">
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
                    <select defaultValue="Activo">
                      <option value="Activo">Activo</option>
                      <option value="Suspendido">Suspendido</option>
                    </select>
                  </div>

                  <div className="tra-field tra-field-full">
                    <label>Contraseña inicial</label>
                    <input
                      type="password"
                      placeholder="Establecer contraseña inicial"
                    />
                  </div>

                </div>

                <div className="tra-registration-footer">
                  <p>
                    El registro y la creación de credenciales
                    estarán disponibles al conectar el sistema
                    de almacenamiento.
                  </p>

                  <button
                    type="button"
                    className="tra-primary-button"
                    disabled
                  >
                    <UserPlus size={16} />
                    Crear cuenta
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
