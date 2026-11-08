
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
  CalendarDays,
} from "lucide-react";

import type { Cliente } from "./Escritorio";

import "./Clientes.css";

type ClientesProps = {
  clientes: Cliente[];
  busqueda: string;
  onRegistrar: () => void;
};

const clientesDemo: Cliente[] = [
  {
    id: 1,
    nombre: "María Fernanda López",
    correo: "maria.lopez@email.com",
    telefono: "833 123 4567",
    cuenta: "BAN-0001",
    estado: "Activo",
    rfc: "LOMF950315AB1",
    curp: "LOMF950315MTSXXX01",
    direccion: "Col. Centro, Tampico, Tamaulipas",
    ingreso: 18000,
    tipoIngreso: "Declarado",
  },
  {
    id: 2,
    nombre: "Carlos Eduardo Pérez",
    correo: "carlos.perez@email.com",
    telefono: "833 456 7890",
    cuenta: "BAN-0002",
    estado: "Activo",
    rfc: "PECE900720CD2",
    curp: "PECE900720HTSXXX02",
    direccion: "Col. Universidad, Tampico, Tamaulipas",
    ingreso: 22000,
    tipoIngreso: "Declarado",
  },
  {
    id: 3,
    nombre: "Ana Sofía Martínez",
    correo: "ana.martinez@email.com",
    telefono: "833 987 6543",
    cuenta: "BAN-0003",
    estado: "Pendiente de documentos",
    rfc: "MASA980412EF3",
    curp: "MASA980412MTSXXX03",
    direccion: "Col. Laguna de la Puerta, Tampico, Tamaulipas",
    ingreso: 14500,
    tipoIngreso: "Comprobable",
  },
  {
    id: 4,
    nombre: "Roberto Sánchez García",
    correo: "roberto.sanchez@email.com",
    telefono: "833 222 3344",
    cuenta: "BAN-0004",
    estado: "En revisión",
    rfc: "SAGR870908GH4",
    curp: "SAGR870908HTSXXX04",
    direccion: "Col. Petrolera, Tampico, Tamaulipas",
    ingreso: 25000,
    tipoIngreso: "Declarado",
  },
];

function moneda(cantidad?: number) {
  if (cantidad === undefined) return "No registrado";

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
}: ClientesProps) {
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);

  const listaClientes = useMemo(() => {
    const todos = [...clientesDemo, ...clientes];

    const termino = busqueda.toLowerCase().trim();

    if (!termino) return todos;

    return todos.filter((cliente) =>
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

  const activos = listaClientes.filter(
    (cliente) => cliente.estado === "Activo"
  ).length;

  const pendientes = listaClientes.filter(
    (cliente) =>
      cliente.estado.toLowerCase().includes("pendiente") ||
      cliente.estado.toLowerCase().includes("revisión")
  ).length;

  const estadoClase = (estado: string) => {
    const valor = estado.toLowerCase();

    if (valor.includes("activo")) return "clientes-estado-activo";
    if (valor.includes("pendiente")) return "clientes-estado-pendiente";

    return "clientes-estado-revision";
  };

  // Vista individual del cliente
  if (clienteSeleccionado) {
    const cliente = clienteSeleccionado;

    return (
      <section className="es-section clientes">

        <div className="clientes-detail-heading">
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

        <div className="clientes-profile-card">
          <div className="clientes-profile-avatar">
            {cliente.nombre.charAt(0)}
          </div>

          <div className="clientes-profile-info">
            <span className="es-eyebrow">EXPEDIENTE DEL CLIENTE</span>
            <h1>{cliente.nombre}</h1>
            <p>{cliente.cuenta}</p>
          </div>
        </div>

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

          <div className="es-card clientes-financial-card">
            <div className="es-card-heading">
              <div>
                <h2>Información financiera</h2>
                <p>Datos económicos proporcionados.</p>
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
              <div className="clientes-document-item" key={documento}>
                <div className="clientes-document-icon">
                  <FileText size={18} />
                </div>

                <span>{documento}</span>

                <small>
                  {cliente.estado === "Activo"
                    ? "Registrado"
                    : "Por verificar"}
                </small>
              </div>
            ))}
          </div>
        </div>

      </section>
    );
  }

  return (
    <section className="es-section clientes">

      {/* Encabezado */}
      <div className="es-page-heading">
        <div>
          <span className="es-eyebrow">GESTIÓN DE SOCIOS</span>
          <h1>Clientes</h1>
          <p>
            Consulta y administra la información de los clientes
            registrados en BANUAT.
          </p>
        </div>

        <button className="es-btn es-btn-primary" onClick={onRegistrar}>
          <UserPlus size={17} />
          Registrar cliente
        </button>
      </div>

      {/* Estadísticas */}
      <div className="es-stats-grid clientes-stats">

        <div className="es-stat-card">
          <div className="es-stat-icon clientes-stat-orange">
            <Users size={21} />
          </div>

          <div className="es-stat-content">
            <span>Total de clientes</span>
            <strong>{listaClientes.length}</strong>
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
            <CalendarDays size={21} />
          </div>

          <div className="es-stat-content">
            <span>Registros de ejemplo</span>
            <strong>{clientesDemo.length}</strong>
            <small>Datos demostrativos</small>
          </div>
        </div>

      </div>

      {/* Directorio */}
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
          <span>Utiliza el buscador superior para filtrar clientes.</span>
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
                    <span className={`es-status ${estadoClase(cliente.estado)}`}>
                      {cliente.estado}
                    </span>
                  </td>

                  <td>
                    <button
                      className="es-action-button"
                      title="Ver expediente"
                      onClick={() => setClienteSeleccionado(cliente)}
                    >
                      <Eye size={16} />
                    </button>
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

            <h3>No se encontraron clientes</h3>

            <p>
              Intenta con otro nombre, correo o número de cuenta.
            </p>
          </div>
        )}

      </div>

    </section>
  );
}

export default Clientes;
