
import { useState } from "react";
import {
  FileText,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
} from "lucide-react";

import type { Cliente, Solicitud } from "./Escritorio";

import "./Solicitudes.css";

type SolicitudesProps = {
  clientes: Cliente[];
  solicitudes: Solicitud[];
  busqueda: string;
  productoInicial: string;
  onRegistrar: (
    datos: Omit<Solicitud, "id" | "fecha" | "estado">
  ) => void;
};

type FiltroEstado =
  | "Todas"
  | "Pendientes"
  | "En revisión"
  | "Aprobadas"
  | "Rechazadas"
  | "Con correcciones";

function Solicitudes({
  clientes,
  solicitudes,
  busqueda,
  productoInicial,
  onRegistrar,
}: SolicitudesProps) {
  const [filtroActivo, setFiltroActivo] =
    useState<FiltroEstado>("Todas");

  // Este módulo corresponde a las solicitudes de registro de clientes.
  // Los datos de productos se mostrarán en su apartado correspondiente.
  void clientes;
  void solicitudes;
  void busqueda;
  void productoInicial;
  void onRegistrar;

  const filtros: {
    nombre: FiltroEstado;
    icono: typeof FileText;
  }[] = [
    { nombre: "Todas", icono: FileText },
    { nombre: "Pendientes", icono: Clock3 },
    { nombre: "En revisión", icono: AlertCircle },
    { nombre: "Aprobadas", icono: CheckCircle2 },
    { nombre: "Rechazadas", icono: XCircle },
    { nombre: "Con correcciones", icono: AlertCircle },
  ];

  return (
    <section className="es-section solicitudes-clientes">

      {/* Encabezado */}
      <div className="es-page-heading solicitudes-heading">
        <div>
          <span className="es-eyebrow">
            GESTIÓN DE CLIENTES
          </span>

          <h1>Solicitudes de clientes</h1>

          <p>
            Consulta los registros de nuevos clientes enviados al supervisor
            para su revisión y autorización.
          </p>
        </div>
      </div>

      {/* Resumen de estados */}
      <div className="solicitudes-resumen">

        <div className="solicitud-resumen-card">
          <div className="solicitud-resumen-icon orange">
            <FileText size={19} />
          </div>

          <div>
            <span>Total de solicitudes</span>
            <strong>—</strong>
          </div>
        </div>

        <div className="solicitud-resumen-card">
          <div className="solicitud-resumen-icon yellow">
            <Clock3 size={19} />
          </div>

          <div>
            <span>Pendientes</span>
            <strong>—</strong>
          </div>
        </div>

        <div className="solicitud-resumen-card">
          <div className="solicitud-resumen-icon blue">
            <AlertCircle size={19} />
          </div>

          <div>
            <span>En revisión</span>
            <strong>—</strong>
          </div>
        </div>

        <div className="solicitud-resumen-card">
          <div className="solicitud-resumen-icon green">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Aprobadas</span>
            <strong>—</strong>
          </div>
        </div>

      </div>

      {/* Contenido principal */}
      <div className="es-table-card solicitudes-table-card">

        <div className="solicitudes-table-header">
          <div>
            <h2>Registros enviados</h2>
            <p>
              Seguimiento de las solicitudes de nuevos clientes.
            </p>
          </div>

          <span className="solicitudes-total">
            <Users size={15} />
            Registros
          </span>
        </div>

        {/* Filtros */}
        <div className="solicitudes-filtros">
          {filtros.map((filtro) => {
            const Icono = filtro.icono;

            return (
              <button
                type="button"
                key={filtro.nombre}
                className={`solicitudes-filtro ${
                  filtroActivo === filtro.nombre ? "activo" : ""
                }`}
                onClick={() => setFiltroActivo(filtro.nombre)}
              >
                <Icono size={14} />
                {filtro.nombre}
              </button>
            );
          })}
        </div>

        {/* Tabla */}
        <div className="es-table-wrap">
          <table className="es-table solicitudes-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Nombre del cliente</th>
                <th>Fecha de envío</th>
                <th>Documentación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan={6}>
                  <div className="es-empty-state solicitudes-empty">
                    <div className="es-empty-icon">
                      <FileText size={25} />
                    </div>

                    <h3>No hay solicitudes para mostrar</h3>

                    <p>
                      Las solicitudes de nuevos clientes que envíes al
                      supervisor aparecerán en este apartado.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Información del proceso */}
      <div className="solicitudes-nota">
        <div className="solicitudes-nota-icon">
          <AlertCircle size={19} />
        </div>

        <div>
          <strong>Proceso de autorización</strong>
          <p>
            Cuando envíes el registro de un nuevo cliente, el supervisor
            recibirá la solicitud para revisar sus datos y documentos.
            Desde aquí podrás consultar el resultado de esa revisión.
          </p>
        </div>
      </div>

    </section>
  );
}

export default Solicitudes;
