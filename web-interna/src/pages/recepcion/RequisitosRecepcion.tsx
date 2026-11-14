
import { useState } from "react";
import {
  ClipboardList,
  Search,
  FileText,
  FolderOpen,
  Info,
  Eye,
  ShieldCheck,
} from "lucide-react";

import "./RequisitosRecepcion.css";

const RequisitosRecepcion = () => {
  const [busqueda, setBusqueda] = useState("");

  return (
    <div className="rr-container">
      {/* ENCABEZADO */}
      <div className="rr-header">
        <div>
          <span className="rr-eyebrow">
            <ClipboardList size={15} />
            CONSULTA DE INFORMACIÓN
          </span>

          <h1>Requisitos de trámites</h1>

          <p>
            Consulta los documentos necesarios para cada trámite y orienta
            correctamente a las personas que visitan la sucursal.
          </p>
        </div>

        <div className="rr-header-icon">
          <ClipboardList size={30} />
        </div>
      </div>

      {/* AVISO */}
      <div className="rr-notice">
        <div className="rr-notice-icon">
          <Info size={21} />
        </div>

        <div>
          <h3>Información de consulta</h3>
          <p>
            Los requisitos son configurados por el administrador.
            Desde recepción únicamente puedes consultarlos y verificar
            físicamente que la persona cuente con los documentos.
          </p>
        </div>
      </div>

      {/* BÚSQUEDA */}
      <section className="rr-search-section">
        <div className="rr-section-heading">
          <div>
            <h2>Catálogo de requisitos</h2>
            <p>Busca un trámite para consultar sus documentos.</p>
          </div>
        </div>

        <div className="rr-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Buscar trámite..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </section>

      {/* CONTENIDO */}
      <section className="rr-content">
        <div className="rr-content-header">
          <div className="rr-content-title">
            <FolderOpen size={21} />
            <h2>Trámites disponibles</h2>
          </div>

          <span className="rr-readonly">
            <ShieldCheck size={14} />
            Solo lectura
          </span>
        </div>

        <div className="rr-empty">
          <div className="rr-empty-icon">
            <FileText size={34} />
          </div>

          <h3>No hay requisitos disponibles</h3>

          <p>
            Cuando el administrador configure los trámites y sus
            documentos requeridos, podrás consultarlos desde esta sección.
          </p>
        </div>
      </section>

      {/* INFORMACIÓN INFERIOR */}
      <section className="rr-guidelines">
        <div className="rr-guidelines-icon">
          <Eye size={22} />
        </div>

        <div>
          <h3>Función de recepción</h3>
          <p>
            Tu función es informar a la persona sobre los documentos
            necesarios y comprobar visualmente que los lleve consigo.
            No debes cargar, modificar ni consultar archivos digitales.
          </p>
        </div>
      </section>
    </div>
  );
};

export default RequisitosRecepcion;
