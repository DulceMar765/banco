
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  UserRound,
  FileText,
  MapPin,
  Wallet,
  Upload,
  UserPlus,
  X,
} from "lucide-react";

import type { Cliente } from "./Escritorio";

import "./RegistrarCliente.css";

type RegistrarClienteProps = {
  onRegistrar: (
    datos: Omit<Cliente, "id" | "cuenta" | "estado">
  ) => void;
  onCancelar: () => void;
};

type Documentos = {
  ine?: string;
  domicilio?: string;
  rfc?: string;
  fiscal?: string;
};

function RegistrarCliente({
  onRegistrar,
  onCancelar,
}: RegistrarClienteProps) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rfc, setRfc] = useState("");
  const [curp, setCurp] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ingreso, setIngreso] = useState("");
  const [tipoIngreso, setTipoIngreso] = useState("");
  const [documentos, setDocumentos] = useState<Documentos>({});

  const actualizarDocumento = (
    campo: keyof Documentos,
    evento: ChangeEvent<HTMLInputElement>
  ) => {
    const archivo = evento.target.files?.[0];

    setDocumentos((actuales) => ({
      ...actuales,
      [campo]: archivo?.name || undefined,
    }));
  };

  const quitarDocumento = (campo: keyof Documentos) => {
    setDocumentos((actuales) => ({
      ...actuales,
      [campo]: undefined,
    }));
  };

  const manejarRegistro = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    onRegistrar({
      nombre: nombre.trim(),
      correo: correo.trim(),
      telefono: telefono.trim(),
      rfc: rfc.trim(),
      curp: curp.trim(),
      direccion: direccion.trim(),
      ingreso: ingreso ? Number(ingreso) : undefined,
      tipoIngreso,
      documentos,
    });
  };

  const camposDocumentos: {
    campo: keyof Documentos;
    titulo: string;
    descripcion: string;
  }[] = [
    {
      campo: "ine",
      titulo: "Identificación oficial",
      descripcion: "INE o identificación vigente",
    },
    {
      campo: "domicilio",
      titulo: "Comprobante de domicilio",
      descripcion: "Recibo de luz, agua o teléfono",
    },
    {
      campo: "rfc",
      titulo: "Documento RFC",
      descripcion: "Documento de registro fiscal",
    },
    {
      campo: "fiscal",
      titulo: "Constancia de situación fiscal",
      descripcion: "Constancia fiscal del cliente",
    },
  ];

  return (
    <section className="es-section registrar-cliente">

      <div className="registrar-heading">
        <button
          type="button"
          className="es-btn es-btn-secondary"
          onClick={onCancelar}
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <div>
          <span className="registrar-eyebrow">
            GESTIÓN DE CLIENTES
          </span>
          <h1>Registrar cliente</h1>
          <p>
            Captura la información necesaria para dar de alta a un nuevo socio.
          </p>
        </div>
      </div>

      <form
        className="registrar-form"
        onSubmit={manejarRegistro}
      >

        {/* Información personal */}
        <div className="es-card registrar-card">
          <div className="registrar-card-heading">
            <div className="registrar-icon">
              <UserRound size={19} />
            </div>

            <div>
              <h2>Información personal</h2>
              <p>Datos generales de identificación y contacto.</p>
            </div>
          </div>

          <div className="registrar-fields">
            <div className="registrar-field registrar-field-full">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre y apellidos"
                required
              />
            </div>

            <div className="registrar-field">
              <label htmlFor="correo">Correo electrónico</label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="registrar-field">
              <label htmlFor="telefono">Número telefónico</label>
              <input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Número de contacto"
                required
              />
            </div>

            <div className="registrar-field">
              <label htmlFor="rfc">RFC</label>
              <input
                id="rfc"
                type="text"
                value={rfc}
                onChange={(e) => setRfc(e.target.value.toUpperCase())}
                placeholder="RFC del cliente"
              />
            </div>

            <div className="registrar-field">
              <label htmlFor="curp">CURP</label>
              <input
                id="curp"
                type="text"
                value={curp}
                onChange={(e) => setCurp(e.target.value.toUpperCase())}
                placeholder="CURP del cliente"
              />
            </div>
          </div>
        </div>

        {/* Domicilio */}
        <div className="es-card registrar-card">
          <div className="registrar-card-heading">
            <div className="registrar-icon">
              <MapPin size={19} />
            </div>

            <div>
              <h2>Domicilio</h2>
              <p>Información de residencia del cliente.</p>
            </div>
          </div>

          <div className="registrar-fields">
            <div className="registrar-field registrar-field-full">
              <label htmlFor="direccion">Dirección completa</label>
              <textarea
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle, número, colonia, municipio y estado"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Información económica */}
        <div className="es-card registrar-card">
          <div className="registrar-card-heading">
            <div className="registrar-icon green">
              <Wallet size={19} />
            </div>

            <div>
              <h2>Información económica</h2>
              <p>Datos relacionados con los ingresos del cliente.</p>
            </div>
          </div>

          <div className="registrar-fields">
            <div className="registrar-field">
              <label htmlFor="ingreso">Ingreso mensual</label>
              <input
                id="ingreso"
                type="number"
                min="0"
                value={ingreso}
                onChange={(e) => setIngreso(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="registrar-field">
              <label htmlFor="tipoIngreso">Tipo de ingreso</label>
              <select
                id="tipoIngreso"
                value={tipoIngreso}
                onChange={(e) => setTipoIngreso(e.target.value)}
              >
                <option value="">Seleccionar tipo de ingreso</option>
                <option value="Nómina">Nómina</option>
                <option value="Negocio propio">Negocio propio</option>
                <option value="Actividad independiente">Actividad independiente</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documentación */}
        <div className="es-card registrar-card">
          <div className="registrar-card-heading">
            <div className="registrar-icon">
              <FileText size={19} />
            </div>

            <div>
              <h2>Documentación</h2>
              <p>Archivos necesarios para integrar el expediente.</p>
            </div>
          </div>

          <div className="registrar-documents">
            {camposDocumentos.map((documento) => (
              <div
                className="registrar-document"
                key={documento.campo}
              >
                <div className="registrar-document-info">
                  <div className="registrar-document-icon">
                    <FileText size={18} />
                  </div>

                  <div>
                    <strong>{documento.titulo}</strong>
                    <span>{documento.descripcion}</span>

                    {documentos[documento.campo] && (
                      <small className="registrar-file-name">
                        {documentos[documento.campo]}
                      </small>
                    )}
                  </div>
                </div>

                <div className="registrar-document-actions">
                  <label className="registrar-upload">
                    <Upload size={15} />
                    {documentos[documento.campo] ? "Cambiar" : "Adjuntar"}

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        actualizarDocumento(documento.campo, e)
                      }
                    />
                  </label>

                  {documentos[documento.campo] && (
                    <button
                      type="button"
                      className="registrar-remove-file"
                      onClick={() => quitarDocumento(documento.campo)}
                      aria-label="Quitar documento"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="registrar-actions">
          <button
            type="button"
            className="es-btn es-btn-secondary"
            onClick={onCancelar}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="es-btn es-btn-primary"
          >
            <UserPlus size={17} />
            Registrar cliente
          </button>
        </div>

      </form>
    </section>
  );
}

export default RegistrarCliente;
