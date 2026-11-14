
import { useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  ArrowLeft,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  FileText,
  UserRound,
  Wallet,
  HandCoins,
} from "lucide-react";

import type { Cliente } from "./Escritorio";

import "./Clientes.css";

type ClientesProps = {
  clientes: Cliente[];
  busqueda: string;
  onRegistrar: () => void;
  onIniciarSolicitud?: (cliente: Cliente) => void;
};

function moneda(cantidad?: number) {
  if (cantidad === undefined) return "—";

  return cantidad.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function Clientes({
  clientes,
  busqueda,
  onRegistrar,
  onIniciarSolicitud,
}: ClientesProps) {
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);

  // =========================================
  // FILTRAR CLIENTES
  // =========================================

  const listaClientes = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();

    if (!termino) return clientes;

    return clientes.filter((cliente) =>
      [
        cliente.nombre,
        cliente.correo,
        cliente.telefono,
        cliente.cuenta,
        cliente.rfc,
      ]
        .filter(Boolean)
        .some((dato) => dato!.toLowerCase().includes(termino))
    );
  }, [clientes, busqueda]);

  // =========================================
  // ESTADÍSTICAS
  // =========================================

  const activos = clientes.filter(
    (cliente) => cliente.estado === "Activo"
  ).length;

  const pendientes = clientes.filter(
    (cliente) => {
      const estado = cliente.estado.toLowerCase();

      return (
        estado.includes("pendiente") ||
        estado.includes("revisión")
      );
    }
  ).length;

  const cuentasVinculadas = clientes.filter(
    (cliente) => Boolean(cliente.cuenta)
  ).length;

  // =========================================
  // CLASE DEL ESTADO
  // =========================================

  const estadoClase = (estado: string) => {
    const valor = estado.toLowerCase();

    if (valor.includes("activo")) return "clientes-estado-activo";
    if (valor.includes("pendiente")) return "clientes-estado-pendiente";

    return "clientes-estado-revision";
  };

  // =========================================
  // EXPEDIENTE INDIVIDUAL DEL CLIENTE
  // =========================================

  if (clienteSeleccionado) {
    const cliente = clienteSeleccionado;

    return (
      <section className="es-section clientes">

        <div
          className="clientes-detail-heading"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
              className="es-btn es-btn-secondary"
              onClick={() => setClienteSeleccionado(null)}
            >
              <ArrowLeft size={16} />
              Volver a clientes
            </button>

            <span className={`es-status ${estadoClase(cliente.estado)}`}>
              {cliente.estado}
            </span>
          </div>

          {onIniciarSolicitud && (
            <button
              className="es-btn es-btn-primary"
              onClick={() => onIniciarSolicitud(cliente)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FileText size={16} />
              Solicitar Producto / Crédito
            </button>
          )}
        </div>

        {/* PERFIL DEL CLIENTE */}

        <div className="clientes-profile-card">
          <div className="clientes-profile-avatar">
            {cliente.nombre.charAt(0)}
          </div>

          <div className="clientes-profile-info">
            <span className="es-eyebrow">
              EXPEDIENTE DEL CLIENTE
            </span>

            <h1>{cliente.nombre}</h1>

            <p>{cliente.cuenta}</p>
          </div>
        </div>

        {/* INFORMACIÓN GENERAL */}

        <div className="clientes-detail-grid">

          <div className="es-card clientes-information-card">

            <div className="es-card-heading">
              <div>
                <h2>Información personal</h2>
                <p>Datos generales del socio.</p>
              </div>

              <UserRound size={19} />
            </div>

            <div className="clientes-information-list">

              <div className="clientes-information-item">
                <Mail size={17} />

                <div>
                  <span>Correo electrónico</span>
                  <strong>{cliente.correo}</strong>
                </div>
              </div>

              <div className="clientes-information-item">
                <Phone size={17} />

                <div>
                  <span>Teléfono</span>
                  <strong>{cliente.telefono}</strong>
                </div>
              </div>

              <div className="clientes-information-item">
                <CreditCard size={17} />

                <div>
                  <span>RFC</span>
                  <strong>{cliente.rfc || "No registrado"}</strong>
                </div>
              </div>

              <div className="clientes-information-item">
                <FileText size={17} />

                <div>
                  <span>CURP</span>
                  <strong>{cliente.curp || "No registrado"}</strong>
                </div>
              </div>

              <div className="clientes-information-item">
                <MapPin size={17} />

                <div>
                  <span>Dirección</span>
                  <strong>{cliente.direccion || "No registrada"}</strong>
                </div>
              </div>

            </div>
          </div>

          {/* INFORMACIÓN FINANCIERA */}

          <div className="es-card clientes-financial-card">

            <div className="es-card-heading">
              <div>
                <h2>Información financiera</h2>
                <p>Datos económicos del cliente.</p>
              </div>

              <CreditCard size={19} />
            </div>

            <div className="clientes-income-box">
              <span>Ingreso mensual registrado</span>
              <strong>{moneda(cliente.ingreso)}</strong>
            </div>

            <div className="clientes-financial-row">
              <span>Tipo de ingreso</span>
              <strong>{cliente.tipoIngreso || "No registrado"}</strong>
            </div>

            <div className="clientes-financial-row">
              <span>Estado del cliente</span>
              <strong>{cliente.estado}</strong>
            </div>

            <div className="clientes-financial-row">
              <span>Número de cuenta</span>
              <strong>{cliente.cuenta}</strong>
            </div>

          </div>

        </div>

        {/* CUENTAS BANCARIAS */}

        <div className="es-card clientes-products-card">

          <div className="es-card-heading">
            <div>
              <h2>Cuentas bancarias</h2>
              <p>Consulta las cuentas registradas del socio.</p>
            </div>

            <Wallet size={19} />
          </div>

          <div className="clientes-empty-products">
            <div className="clientes-empty-products-icon">
              <CreditCard size={23} />
            </div>

            <h3>Sin cuentas adicionales para mostrar</h3>

            <p>
              Las cuentas bancarias asociadas al cliente aparecerán aquí.
            </p>
          </div>

        </div>

        {/* PRODUCTOS CONTRATADOS */}

        <div className="es-card clientes-products-card">

          <div className="es-card-heading">
            <div>
              <h2>Productos contratados</h2>
              <p>Productos y servicios financieros del socio.</p>
            </div>

            <HandCoins size={19} />
          </div>

          <div className="clientes-empty-products">
            <div className="clientes-empty-products-icon">
              <HandCoins size={23} />
            </div>

            <h3>Sin productos para mostrar</h3>

            <p>
              Los préstamos, inversiones y otros productos contratados
              aparecerán aquí.
            </p>
          </div>

        </div>

        {/* DOCUMENTACIÓN */}

        <div className="es-card clientes-documents-card">

          <div className="es-card-heading">
            <div>
              <h2>Documentación del cliente</h2>
              <p>Estado de los documentos del expediente.</p>
            </div>

            <FileText size={19} />
          </div>

          <div className="clientes-document-list">

            {[
              "Identificación oficial",
              "Comprobante de domicilio",
              "RFC",
              "Constancia de situación fiscal",
            ].map((documento) => (

              <div
                className="clientes-document-item"
                key={documento}
              >
                <div className="clientes-document-icon">
                  <FileText size={18} />
                </div>

                <span>{documento}</span>

                <small>Por verificar</small>
              </div>

            ))}

          </div>
        </div>

      </section>
    );
  }

  // =========================================
  // DIRECTORIO DE CLIENTES
  // =========================================

  return (
    <section className="es-section clientes">

      <div className="es-page-heading">

        <div>
          <span className="es-eyebrow">
            GESTIÓN DE SOCIOS
          </span>

          <h1>Clientes</h1>

          <p>
            Consulta y administra la información de los clientes
            registrados en BANUAT.
          </p>
        </div>

        <button
          className="es-btn es-btn-primary"
          onClick={onRegistrar}
        >
          <UserPlus size={17} />
          Registrar cliente
        </button>

      </div>

      {/* ESTADÍSTICAS */}

      <div className="es-stats-grid clientes-stats">

        <div className="es-stat-card">
          <div className="es-stat-icon clientes-stat-orange">
            <Users size={21} />
          </div>

          <div className="es-stat-content">
            <span>Total de clientes</span>
            <strong>{clientes.length}</strong>
            <small>Socios registrados</small>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon clientes-stat-green">
            <UserRound size={21} />
          </div>

          <div className="es-stat-content">
            <span>Clientes activos</span>
            <strong>{activos}</strong>
            <small>Con registro activo</small>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon clientes-stat-brown">
            <FileText size={21} />
          </div>

          <div className="es-stat-content">
            <span>Pendientes de revisión</span>
            <strong>{pendientes}</strong>
            <small>Requieren atención</small>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon clientes-stat-purple">
            <CreditCard size={21} />
          </div>

          <div className="es-stat-content">
            <span>Cuentas vinculadas</span>
            <strong>{cuentasVinculadas}</strong>
            <small>Cuentas registradas</small>
          </div>
        </div>

      </div>

      {/* DIRECTORIO */}

      <div className="es-card es-table-card clientes-directory">

        <div className="es-table-heading">

          <div>
            <h2>Directorio de clientes</h2>
            <p>Listado general de socios registrados.</p>
          </div>

          <span className="es-count">
            {listaClientes.length} clientes
          </span>

        </div>

        <div className="clientes-search-mobile">
          <Search size={17} />

          <span>
            Utiliza el buscador superior para filtrar clientes.
          </span>
        </div>

        <div className="es-table-wrap">

          <table className="es-table">

            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Cuenta</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {listaClientes.map((cliente) => (

                <tr key={cliente.id}>

                  <td>
                    <div className="clientes-table-person">

                      <div className="clientes-table-avatar">
                        {cliente.nombre.charAt(0)}
                      </div>

                      <strong>{cliente.nombre}</strong>

                    </div>
                  </td>

                  <td>{cliente.correo}</td>

                  <td>{cliente.telefono}</td>

                  <td>{cliente.cuenta}</td>

                  <td>
                    <span
                      className={`es-status ${estadoClase(cliente.estado)}`}
                    >
                      {cliente.estado}
                    </span>
                  </td>

                  <td style={{ whiteSpace: "nowrap" }}>
                    <button
                      className="es-action-button"
                      title="Ver expediente"
                      onClick={() => setClienteSeleccionado(cliente)}
                    >
                      <Eye size={16} />
                    </button>

                    {onIniciarSolicitud && (
                      <button
                        className="es-action-button"
                        style={{
                          color: "#d97706",
                          marginLeft: "6px",
                        }}
                        title="Nueva solicitud financiera para este socio"
                        onClick={() => onIniciarSolicitud(cliente)}
                      >
                        <FileText size={16} />
                      </button>
                    )}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {listaClientes.length === 0 && (

          <div className="es-empty-state">

            <div className="es-empty-icon">
              <Users size={24} />
            </div>

            <h3>Sin clientes registrados</h3>

            <p>
              Los clientes registrados aparecerán aquí.
            </p>

          </div>

        )}

      </div>

    </section>
  );
}

export default Clientes;
