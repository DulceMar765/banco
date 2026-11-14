import { useState, useEffect } from "react";
import {
  Gift,
  Star,
  Trophy,
  Sparkles,
  Percent,
  Coins,
  ArrowRight,
  CircleHelp,
  TicketPercent,
  HandCoins,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { fetchSocio } from "../../services/auth";
import "./BeneficiosCliente.css";

type CategoriaBeneficio =
  | "Todos"
  | "Puntos"
  | "Descuentos"
  | "Promociones";

export default function BeneficiosCliente() {
  const [categoriaActiva, setCategoriaActiva] =
    useState<CategoriaBeneficio>("Todos");

  const [datosBeneficios, setDatosBeneficios] = useState<{
    puntosActuales: number;
    valorEnEfectivoMxn: number;
    reglaConversion: string;
    segmentosRendimiento: any[];
    beneficiosCooperativa: string[];
  }>({
    puntosActuales: 15000,
    valorEnEfectivoMxn: 150,
    reglaConversion: "100 puntos = $1.00 MXN",
    segmentosRendimiento: [],
    beneficiosCooperativa: [],
  });

  useEffect(() => {
    const cargarBeneficios = async () => {
      try {
        const res = await fetchSocio("/api/socio/beneficios");
        const data = await res.json();
        if (data && !data.error) {
          setDatosBeneficios(data);
        }
      } catch (err) {
        console.error("Error al cargar beneficios:", err);
      }
    };

    cargarBeneficios();
  }, []);

  const categorias: CategoriaBeneficio[] = [
    "Todos",
    "Puntos",
    "Descuentos",
    "Promociones",
  ];

  const beneficios = [
    {
      id: 1,
      titulo: "Devengo Diario de Rendimientos",
      descripcion: "Intereses calculados diariamente sobre tu saldo promedio y abonados el día de corte.",
      categoria: "Puntos" as CategoriaBeneficio,
      icono: TrendingUp,
      clase: "verde",
    },
    {
      id: 2,
      titulo: "Puntos por Ahorro Mensual",
      descripcion: "Acumulación garantizada de puntos por aportaciones y depósitos de ahorro.",
      categoria: "Puntos" as CategoriaBeneficio,
      icono: Coins,
      clase: "naranja",
    },
    {
      id: 3,
      titulo: "Puntos por Abonos a Préstamos",
      descripcion: "Generas puntos extra automáticos con cada cuota y abono de capital cubierto puntualmente.",
      categoria: "Puntos" as CategoriaBeneficio,
      icono: HandCoins,
      clase: "naranja",
    },
    {
      id: 4,
      titulo: "Reducción de Tasa de Interés",
      descripcion: "Canjea tus puntos acumulados para disminuir la tasa de interés ordinaria en tu próximo préstamo.",
      categoria: "Descuentos" as CategoriaBeneficio,
      icono: TicketPercent,
      clase: "morado",
    },
    {
      id: 5,
      titulo: "Seguro Cooperativo de Ahorro",
      descripcion: "Protección integral para tus depósitos y respaldo patrimonial familiar.",
      categoria: "Promociones" as CategoriaBeneficio,
      icono: ShieldCheck,
      clase: "verde",
    },
    {
      id: 6,
      titulo: "Catálogo de Recompensas de Temporada",
      descripcion: "Canje directo de puntos por artículos, electrónicos y certificados con proveedores asociados.",
      categoria: "Promociones" as CategoriaBeneficio,
      icono: ShoppingBag,
      clase: "morado",
    },
  ];

  const beneficiosFiltrados = beneficios.filter(
    (beneficio) =>
      categoriaActiva === "Todos" ||
      beneficio.categoria === categoriaActiva
  );

  return (
    <section className="beneficios-cliente">

      {/* ENCABEZADO */}
      <div className="bec-encabezado">
        <div>
          <span className="bec-etiqueta">EXPERIENCIA BANUAT</span>
          <h1>Beneficios y promociones</h1>
          <p>
            Descubre los beneficios y recompensas disponibles para ti.
          </p>
        </div>

        <div className="bec-encabezado-icono">
          <Gift size={28} />
        </div>
      </div>

      {/* TARJETA DE PUNTOS */}
      <div className="bec-puntos">
        <div className="bec-puntos-contenido">
          <div className="bec-puntos-titulo">
            <div className="bec-puntos-icono">
              <Star size={22} />
            </div>

            <span>PROGRAMA DE LEALTAD</span>
          </div>

          <h2>Mis puntos BANUAT</h2>

          <p>
            Equivalencia oficial inalterable: 100 puntos = $1.00 MXN.
          </p>

          <div className="bec-puntos-total">
            <strong>{Number(datosBeneficios.puntosActuales).toLocaleString("es-MX")}</strong>
            <span>puntos disponibles (${Number(datosBeneficios.valorEnEfectivoMxn).toFixed(2)} MXN)</span>
          </div>

          <div className="bec-puntos-nota">
            <Sparkles size={16} />
            <span>Todos los socios con cuenta BANUAT participan activamente en el programa.</span>
          </div>
        </div>

        <div className="bec-puntos-decoracion">
          <div className="bec-circulo bec-circulo-uno"></div>
          <div className="bec-circulo bec-circulo-dos"></div>
          <Trophy size={95} strokeWidth={1.1} />
        </div>
      </div>

      {/* RESUMEN DE BENEFICIOS */}
      <div className="bec-resumen">
        <article className="bec-resumen-card">
          <div className="bec-resumen-icono naranja">
            <Coins size={22} />
          </div>

          <div>
            <span>Puntos acumulados</span>
            <strong>{Number(datosBeneficios.puntosActuales).toLocaleString("es-MX")}</strong>
            <small>Valor: ${Number(datosBeneficios.valorEnEfectivoMxn).toFixed(2)} MXN</small>
          </div>
        </article>

        <article className="bec-resumen-card">
          <div className="bec-resumen-icono verde">
            <TicketPercent size={22} />
          </div>

          <div>
            <span>Beneficios disponibles</span>
            <strong>{beneficios.length}</strong>
            <small>Ventajas cooperativas</small>
          </div>
        </article>

        <article className="bec-resumen-card">
          <div className="bec-resumen-icono morado">
            <Gift size={22} />
          </div>

          <div>
            <span>Promociones activas</span>
            <strong>3</strong>
            <small>Ofertas BANUAT vigentes</small>
          </div>
        </article>
      </div>

      {/* FORMAS DE UTILIZAR PUNTOS */}
      <div className="bec-seccion">
        <div className="bec-seccion-encabezado">
          <div>
            <h2>¿Cómo utilizar tus puntos?</h2>
            <p>Conoce las opciones contempladas en el programa de lealtad.</p>
          </div>
        </div>

        <div className="bec-usos-grid">
          <article className="bec-uso-card">
            <div className="bec-uso-icono naranja">
              <HandCoins size={24} />
            </div>

            <div>
              <h3>Reducción de intereses</h3>
              <p>
                Utiliza tus puntos para reducir puntos porcentuales de la tasa en créditos y préstamos personales.
              </p>
            </div>

            <span className="bec-uso-flecha">
              <ArrowRight size={17} />
            </span>
          </article>

          <article className="bec-uso-card">
            <div className="bec-uso-icono verde">
              <ShoppingBag size={24} />
            </div>

            <div>
              <h3>Canje de productos</h3>
              <p>
                Canjea tus puntos por artículos del catálogo oficial o abónalos directamente como saldo en tu cuenta.
              </p>
            </div>

            <span className="bec-uso-flecha">
              <ArrowRight size={17} />
            </span>
          </article>
        </div>
      </div>

      {/* BENEFICIOS Y PROMOCIONES */}
      <div className="bec-seccion">
        <div className="bec-seccion-encabezado">
          <div>
            <h2>Beneficios disponibles</h2>
            <p>Consulta las opciones y promociones de BANUAT.</p>
          </div>

          <div className="bec-categoria-icono">
            <Percent size={21} />
          </div>
        </div>

        <div className="bec-filtros">
          {categorias.map((categoria) => (
            <button
              key={categoria}
              type="button"
              className={
                categoriaActiva === categoria ? "activo" : ""
              }
              onClick={() => setCategoriaActiva(categoria)}
            >
              {categoria}
            </button>
          ))}
        </div>

        <div className="bec-beneficios-grid">
          {beneficiosFiltrados.map((beneficio) => {
            const Icono = beneficio.icono;

            return (
              <article
                className="bec-beneficio-card"
                key={beneficio.id}
              >
                <div className={`bec-beneficio-icono ${beneficio.clase}`}>
                  <Icono size={25} />
                </div>

                <span className="bec-beneficio-categoria">
                  {beneficio.categoria}
                </span>

                <h3>{beneficio.titulo}</h3>

                <p>{beneficio.descripcion}</p>

                <button type="button" className="bec-beneficio-link">
                  Consultar beneficio
                  <ArrowRight size={16} />
                </button>
              </article>
            );
          })}
        </div>
      </div>

      {/* INFORMACION */}
      <div className="bec-informacion">
        <div className="bec-informacion-icono">
          <CircleHelp size={22} />
        </div>

        <div>
          <strong>Información del programa de beneficios</strong>
          <p>
            Los puntos, promociones y beneficios están protegidos por el marco normativo de BANUAT.
            El saldo de puntos no caduca mientras mantengas activa tu cuenta de ahorro.
          </p>
        </div>
      </div>

    </section>
  );
}
