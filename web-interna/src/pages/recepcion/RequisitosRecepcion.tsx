import { useState, useEffect } from "react";
import { getApiUrl } from "../../services/auth";
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

type TramiteRequisitos = {
  codigo: string;
  nombre: string;
  area: string;
  prioridad: number;
  documentos: string[];
};

const tramitesOficiales: TramiteRequisitos[] = [
  {
    codigo: "TRAM-PRESTAMO",
    nombre: "Solicitud y Trámite de Préstamo",
    area: "Escritorio / Ejecutivo",
    prioridad: 10,
    documentos: [
      "Identificación oficial vigente (INE / Pasaporte)",
      "Comprobante de domicilio reciente (no mayor a 3 meses)",
      "Comprobante de ingresos comprobables o declaración de ingresos",
      "CURP oficial único de 18 caracteres",
      "Cédula de Identificación Fiscal (RFC)",
    ],
  },
  {
    codigo: "TRAM-APERTURA",
    nombre: "Apertura de Cuenta y Registro de Socio",
    area: "Escritorio / Ejecutivo",
    prioridad: 8,
    documentos: [
      "Identificación oficial con fotografía (INE / Pasaporte)",
      "Comprobante de domicilio (agua, luz o telefonía fija)",
      "CURP oficial de 18 caracteres",
      "RFC con homoclave",
      "Aportación inicial (Opcional, no condiciona los puntos de confianza)",
    ],
  },
  {
    codigo: "TRAM-CAJA",
    nombre: "Operaciones de Ventanilla y Caja",
    area: "Caja",
    prioridad: 5,
    documentos: [
      "Número de cuenta bancaria oficial o contrato de préstamo",
      "Identificación oficial del socio titular",
      "Efectivo contado para depósitos o abonos",
    ],
  },
  {
    codigo: "TRAM-CONSULTA",
    nombre: "Consultas, Orientación y Actualización",
    area: "Ventanilla / Escritorio",
    prioridad: 3,
    documentos: [
      "Identificación oficial con fotografía",
      "Número de socio o número de cuenta para localización de expediente",
    ],
  },
];

const RequisitosRecepcion = () => {
  const [busqueda, setBusqueda] = useState("");
  const [tramites, setTramites] = useState<TramiteRequisitos[]>(tramitesOficiales);

  useEffect(() => {
    // Si la API de catálogo de trámites está disponible, sincronizar
    fetch(getApiUrl("/api/turnos/catalogo-tramites"))
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.catalogo)) {
          const actualizados = data.catalogo.map((t: any) => {
            const encontrado = tramitesOficiales.find((o) => o.codigo === t.codigo);
            return {
              codigo: t.codigo,
              nombre: t.nombre,
              area: t.areaDestino || "Sucursal",
              prioridad: t.prioridad,
              documentos: encontrado ? encontrado.documentos : ["Identificación oficial vigente", "Documentos de respaldo"],
            };
          });
          setTramites(actualizados);
        }
      })
      .catch((err) => console.error("Error sincronizando catálogo:", err));
  }, []);

  const tramitesFiltrados = tramites.filter((t) =>
    `${t.nombre} ${t.codigo} ${t.area}`.toLowerCase().includes(busqueda.toLowerCase())
  );

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

        {tramitesFiltrados.length === 0 ? (
          <div className="rr-empty">
            <div className="rr-empty-icon">
              <FileText size={34} />
            </div>

            <h3>No hay requisitos disponibles</h3>

            <p>
              No se encontraron trámites que coincidan con el término de búsqueda.
            </p>
          </div>
        ) : (
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {tramitesFiltrados.map((t) => (
              <div
                key={t.codigo}
                style={{
                  padding: "16px 20px",
                  backgroundColor: "#fafafa",
                  border: "1px solid #ededed",
                  borderRadius: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div>
                    <strong style={{ fontSize: "16px", color: "#382b23" }}>{t.nombre}</strong>
                    <span style={{ fontSize: "12px", color: "#888", display: "block" }}>
                      Área: <strong>{t.area}</strong> · Prioridad: {t.prioridad}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", padding: "4px 10px", backgroundColor: "#fff0e5", color: "#e87519", borderRadius: "12px", fontWeight: 700 }}>
                    {t.codigo}
                  </span>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#555" }}>Documentación física requerida:</span>
                  <ul style={{ margin: "6px 0 0 18px", padding: 0, fontSize: "13px", color: "#666", lineHeight: "1.7" }}>
                    {t.documentos.map((doc, i) => (
                      <li key={i} style={{ listStyleType: "disc" }}>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
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
