
import { useState } from "react";
import {
  Ticket,
  Users,
  UserPlus,
  UserRound,
  ClipboardList,
  CheckCircle2,
  Info,
  Wallet,
  BriefcaseBusiness,
  ChevronDown,
  MapPin,
} from "lucide-react";

import "./TurnosRecepcion.css";

type TipoPersona = "cliente" | "nuevo";
type AreaAtencion = "caja" | "escritorio" | "";

export default function TurnosRecepcion() {
  const [tipoPersona, setTipoPersona] =
    useState<TipoPersona>("cliente");

  const [nombrePersona, setNombrePersona] =
    useState("");

  const [tramite, setTramite] = useState("");

  const [areaAtencion, setAreaAtencion] =
    useState<AreaAtencion>("");

  const seleccionarTipo = (tipo: TipoPersona) => {
    setTipoPersona(tipo);
    setTramite("");
    setAreaAtencion("");
  };

  const generarTurno = () => {
    if (
      !nombrePersona.trim() ||
      !tramite ||
      !areaAtencion
    ) {
      return;
    }

    // Aquí se conectará posteriormente la generación real del turno.
    // No se genera ni almacena información por ahora.
  };

  return (
    <div className="tr-container">

      {/* ENCABEZADO */}
      <div className="tr-heading">
        <div>
          <span className="tr-eyebrow">
            CONTROL DE ATENCIÓN
          </span>

          <h1>Asignación de turnos</h1>

          <p>
            Identifica a la persona, selecciona el trámite
            y determina el área donde recibirá atención.
          </p>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="tr-content-grid">

        {/* FORMULARIO */}
        <section className="tr-card tr-form-card">

          <div className="tr-card-heading">
            <div>
              <span className="tr-section-tag">
                NUEVA ASIGNACIÓN
              </span>

              <h3>Generar turno</h3>

              <p>
                Registra la información necesaria para orientar
                a la persona.
              </p>
            </div>

            <div className="tr-heading-icon">
              <Ticket size={23} />
            </div>
          </div>

          {/* TIPO DE PERSONA */}
          <label className="tr-label">
            Tipo de persona
          </label>

          <div className="tr-type-options">

            <button
              type="button"
              className={`tr-type-option ${
                tipoPersona === "cliente" ? "selected" : ""
              }`}
              onClick={() => seleccionarTipo("cliente")}
            >
              <div className="tr-type-icon orange">
                <Users size={24} />
              </div>

              <strong>Cliente</strong>

              <span>
                Ya pertenece a BANUAT.
              </span>

              {tipoPersona === "cliente" && (
                <div className="tr-selected-check">
                  <CheckCircle2 size={18} />
                </div>
              )}
            </button>

            <button
              type="button"
              className={`tr-type-option ${
                tipoPersona === "nuevo" ? "selected" : ""
              }`}
              onClick={() => seleccionarTipo("nuevo")}
            >
              <div className="tr-type-icon green">
                <UserPlus size={24} />
              </div>

              <strong>Nuevo cliente</strong>

              <span>
                Desea registrarse en BANUAT.
              </span>

              {tipoPersona === "nuevo" && (
                <div className="tr-selected-check">
                  <CheckCircle2 size={18} />
                </div>
              )}
            </button>

          </div>

          {/* NOMBRE */}
          <div className="tr-field">
            <label className="tr-label" htmlFor="tr-nombre">
              Nombre de la persona
            </label>

            <div className="tr-input-wrapper">
              <UserRound size={18} />

              <input
                id="tr-nombre"
                type="text"
                placeholder="Escribe el nombre..."
                value={nombrePersona}
                onChange={(e) =>
                  setNombrePersona(e.target.value)
                }
              />
            </div>
          </div>

          {/* TRÁMITE */}
          <div className="tr-field">
            <label className="tr-label" htmlFor="tr-tramite">
              Trámite solicitado
            </label>

            <div className="tr-input-wrapper">
              <ClipboardList size={18} />

              <select
                id="tr-tramite"
                value={tramite}
                onChange={(e) => {
                  setTramite(e.target.value);
                  setAreaAtencion("");
                }}
              >
                <option value="">
                  Selecciona un trámite
                </option>
              </select>

              <ChevronDown
                size={17}
                className="tr-select-arrow"
              />
            </div>

            <small className="tr-field-help">
              Los trámites estarán disponibles cuando el
              administrador configure el catálogo.
            </small>
          </div>

          {/* ÁREA DE ATENCIÓN */}
          <div className="tr-field">
            <label className="tr-label">
              Área de atención
            </label>

            <p className="tr-field-description">
              Selecciona el destino al que debe dirigirse
              la persona.
            </p>

            <div className="tr-area-options">

              <button
                type="button"
                className={`tr-area-option ${
                  areaAtencion === "caja" ? "selected" : ""
                }`}
                onClick={() => setAreaAtencion("caja")}
              >
                <div className="tr-area-icon orange">
                  <Wallet size={23} />
                </div>

                <div>
                  <strong>Caja</strong>
                  <span>Operaciones de caja</span>
                </div>

                {areaAtencion === "caja" && (
                  <CheckCircle2
                    size={19}
                    className="tr-area-check"
                  />
                )}
              </button>

              <button
                type="button"
                className={`tr-area-option ${
                  areaAtencion === "escritorio" ? "selected" : ""
                }`}
                onClick={() => setAreaAtencion("escritorio")}
              >
                <div className="tr-area-icon green">
                  <BriefcaseBusiness size={23} />
                </div>

                <div>
                  <strong>Escritorio</strong>
                  <span>Atención y trámites</span>
                </div>

                {areaAtencion === "escritorio" && (
                  <CheckCircle2
                    size={19}
                    className="tr-area-check"
                  />
                )}
              </button>

            </div>
          </div>

          {/* VISTA PREVIA */}
          <div className="tr-preview">
            <div className="tr-preview-info">
              <span>Vista previa de asignación</span>

              <strong>—</strong>

              <small>
                El número se asignará al generar el turno.
              </small>

              <div className="tr-preview-destination">
                <MapPin size={15} />

                <span>
                  {areaAtencion
                    ? `Destino: ${
                        areaAtencion === "caja"
                          ? "Caja"
                          : "Escritorio"
                      }`
                    : "Sin área seleccionada"}
                </span>
              </div>
            </div>

            <div className="tr-preview-icon">
              <Ticket size={27} />
            </div>
          </div>

          {/* BOTÓN */}
          <button
            type="button"
            className="tr-primary-button"
            onClick={generarTurno}
            disabled={
              !nombrePersona.trim() ||
              !tramite ||
              !areaAtencion
            }
          >
            <Ticket size={18} />
            Generar turno
          </button>

          {/* AVISO */}
          <div className="tr-form-notice">
            <Info size={17} />

            <span>
              El turno permitirá identificar el área donde
              la persona debe recibir atención.
            </span>
          </div>

        </section>

        {/* INFORMACIÓN LATERAL */}
        <section className="tr-card tr-information-card">

          <div className="tr-card-heading">
            <div>
              <span className="tr-section-tag">
                PROCEDIMIENTO
              </span>

              <h3>Proceso de recepción</h3>

              <p>
                Pasos para orientar a las personas.
              </p>
            </div>
          </div>

          <div className="tr-process-list">

            <div className="tr-process-item">
              <div className="tr-process-number">01</div>

              <div>
                <strong>Identificar a la persona</strong>

                <span>
                  Determinar si ya es cliente o desea
                  registrarse.
                </span>
              </div>
            </div>

            <div className="tr-process-item">
              <div className="tr-process-number">02</div>

              <div>
                <strong>Identificar el trámite</strong>

                <span>
                  Seleccionar el servicio que necesita
                  realizar la persona.
                </span>
              </div>
            </div>

            <div className="tr-process-item">
              <div className="tr-process-number">03</div>

              <div>
                <strong>Asignar el área</strong>

                <span>
                  Determinar si corresponde atención en
                  Caja o Escritorio.
                </span>
              </div>
            </div>

            <div className="tr-process-item">
              <div className="tr-process-number">04</div>

              <div>
                <strong>Entregar el turno</strong>

                <span>
                  Indicar el número de turno y dirigir a la
                  persona al área correspondiente.
                </span>
              </div>
            </div>

          </div>

          {/* RECORDATORIO */}
          <div className="tr-information-notice">
            <div className="tr-information-notice-icon">
              <ClipboardList size={20} />
            </div>

            <div>
              <strong>Revisión de documentos</strong>

              <p>
                Consulta los requisitos del trámite y verifica
                físicamente que la persona lleve los documentos.
                No necesitas acceder a sus archivos digitales.
              </p>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
