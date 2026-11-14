
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  ShieldCheck,
  CalendarDays,
  Fingerprint,
  Contact,
  LockKeyhole,
  BadgeCheck,
  BriefcaseBusiness,
} from "lucide-react";

import "./PerfilCliente.css";

function PerfilCliente() {
  return (
    <section className="mi-cuenta">

      {/* ENCABEZADO */}
      <div className="mc-page-heading">
        <div>
          <span className="mc-eyebrow">INFORMACIÓN PERSONAL</span>
          <h1>Mi cuenta</h1>
          <p>
            Consulta tu información personal y los datos
            registrados en BANUAT.
          </p>
        </div>

        <div className="mc-heading-icon">
          <UserRound size={27} />
        </div>
      </div>

      {/* PERFIL */}
      <div className="mc-profile-card">
        <div className="mc-profile-avatar">
          <UserRound size={34} />
        </div>

        <div className="mc-profile-info">
          <span>PERFIL DEL SOCIO</span>
          <h2>Mi información</h2>
          <p>Cliente BANUAT</p>
        </div>

        <div className="mc-profile-status">
          <BadgeCheck size={16} />
          <span>Estado: —</span>
        </div>
      </div>

      {/* INFORMACIÓN PERSONAL */}
      <div className="mc-section-heading">
        <div>
          <h2>Información personal</h2>
          <p>Datos generales del titular de la cuenta.</p>
        </div>
        <UserRound size={20} />
      </div>

      <div className="mc-information-grid">

        <div className="mc-information-card">
          <div className="mc-field-icon mc-orange">
            <UserRound size={19} />
          </div>
          <div>
            <span>Nombre completo</span>
            <strong>—</strong>
          </div>
        </div>

        <div className="mc-information-card">
          <div className="mc-field-icon mc-green">
            <Fingerprint size={19} />
          </div>
          <div>
            <span>CURP</span>
            <strong>—</strong>
          </div>
        </div>

        <div className="mc-information-card">
          <div className="mc-field-icon mc-purple">
            <FileText size={19} />
          </div>
          <div>
            <span>RFC</span>
            <strong>—</strong>
          </div>
        </div>

        <div className="mc-information-card">
          <div className="mc-field-icon mc-brown">
            <CalendarDays size={19} />
          </div>
          <div>
            <span>Fecha de nacimiento</span>
            <strong>—</strong>
          </div>
        </div>

      </div>

      {/* CONTACTO */}
      <div className="mc-section-heading">
        <div>
          <h2>Información de contacto</h2>
          <p>Medios de contacto y domicilio registrado.</p>
        </div>
        <Contact size={20} />
      </div>

      <div className="mc-card">

        <div className="mc-contact-grid">

          <div className="mc-contact-item">
            <div className="mc-field-icon mc-orange">
              <Mail size={19} />
            </div>

            <div>
              <span>Correo electrónico</span>
              <strong>—</strong>
            </div>
          </div>

          <div className="mc-contact-item">
            <div className="mc-field-icon mc-green">
              <Phone size={19} />
            </div>

            <div>
              <span>Teléfono</span>
              <strong>—</strong>
            </div>
          </div>

          <div className="mc-contact-item mc-address-item">
            <div className="mc-field-icon mc-purple">
              <MapPin size={19} />
            </div>

            <div>
              <span>Domicilio</span>
              <strong>—</strong>
            </div>
          </div>

        </div>

      </div>

      {/* DATOS DE CUENTA */}
      <div className="mc-section-heading">
        <div>
          <h2>Datos de mi cuenta</h2>
          <p>Información de identificación dentro de BANUAT.</p>
        </div>
        <CreditCard size={20} />
      </div>

      <div className="mc-account-card">

        <div className="mc-account-header">
          <div className="mc-account-icon">
            <CreditCard size={23} />
          </div>

          <div>
            <span>CUENTA BANUAT</span>
            <h3>Datos de identificación</h3>
          </div>
        </div>

        <div className="mc-account-grid">

          <div>
            <span>Número de cuenta</span>
            <strong>—</strong>
          </div>

          <div>
            <span>Número de socio</span>
            <strong>—</strong>
          </div>

          <div>
            <span>Tipo de cuenta</span>
            <strong>—</strong>
          </div>

          <div>
            <span>Fecha de registro</span>
            <strong>—</strong>
          </div>

        </div>

      </div>

      {/* SEGURIDAD */}
      <div className="mc-section-heading">
        <div>
          <h2>Seguridad de mi cuenta</h2>
          <p>Información relacionada con el acceso a tu cuenta.</p>
        </div>
        <ShieldCheck size={20} />
      </div>

      <div className="mc-security-card">

        <div className="mc-security-item">
          <div className="mc-field-icon mc-green">
            <LockKeyhole size={20} />
          </div>

          <div>
            <strong>Contraseña</strong>
            <span>Información protegida</span>
          </div>

          <div className="mc-security-status">
            <ShieldCheck size={15} />
            <span>Protegida</span>
          </div>
        </div>

        <div className="mc-security-item">
          <div className="mc-field-icon mc-orange">
            <Mail size={20} />
          </div>

          <div>
            <strong>Correo asociado</strong>
            <span>—</span>
          </div>
        </div>

      </div>

      {/* DOCUMENTACIÓN */}
      <div className="mc-section-heading">
        <div>
          <h2>Mi documentación</h2>
          <p>Documentos asociados a tu expediente.</p>
        </div>
        <FileText size={20} />
      </div>

      <div className="mc-card">

        <div className="mc-document-list">

          <div className="mc-document-item">
            <div className="mc-document-icon">
              <FileText size={19} />
            </div>

            <div>
              <strong>Identificación oficial</strong>
              <span>Documento del titular</span>
            </div>

            <small>—</small>
          </div>

          <div className="mc-document-item">
            <div className="mc-document-icon">
              <MapPin size={19} />
            </div>

            <div>
              <strong>Comprobante de domicilio</strong>
              <span>Documento de residencia</span>
            </div>

            <small>—</small>
          </div>

          <div className="mc-document-item">
            <div className="mc-document-icon">
              <BriefcaseBusiness size={19} />
            </div>

            <div>
              <strong>Constancia de situación fiscal</strong>
              <span>Información fiscal del titular</span>
            </div>

            <small>—</small>
          </div>

        </div>

      </div>

    </section>
  );
}

export default PerfilCliente;
