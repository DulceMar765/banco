
import {
  useState,
} from "react";

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
} from "lucide-react";

import "./BeneficiosCliente.css";

type CategoriaBeneficio =
  | "Todos"
  | "Puntos"
  | "Descuentos"
  | "Promociones";

export default function BeneficiosCliente() {
  const [categoriaActiva, setCategoriaActiva] =
    useState<CategoriaBeneficio>("Todos");

  const categorias: CategoriaBeneficio[] = [
    "Todos",
    "Puntos",
    "Descuentos",
    "Promociones",
  ];

  const beneficios: {
    id: number;
    titulo: string;
    descripcion: string;
    categoria: CategoriaBeneficio;
    icono: typeof Gift;
    clase: string;
  }[] = [];

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
            Consulta los puntos acumulados y conoce cómo puedes utilizarlos.
          </p>

          <div className="bec-puntos-total">
            <strong>—</strong>
            <span>puntos disponibles</span>
          </div>

          <div className="bec-puntos-nota">
            <Sparkles size={16} />
            <span>Los puntos estarán disponibles según las condiciones del programa.</span>
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
            <strong>—</strong>
            <small>Programa de lealtad</small>
          </div>
        </article>

        <article className="bec-resumen-card">
          <div className="bec-resumen-icono verde">
            <TicketPercent size={22} />
          </div>

          <div>
            <span>Beneficios disponibles</span>
            <strong>—</strong>
            <small>Opciones para consultar</small>
          </div>
        </article>

        <article className="bec-resumen-card">
          <div className="bec-resumen-icono morado">
            <Gift size={22} />
          </div>

          <div>
            <span>Promociones activas</span>
            <strong>—</strong>
            <small>Ofertas BANUAT</small>
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
                Consulta si puedes utilizar tus puntos para obtener
                una reducción en los intereses de un préstamo.
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
                Conoce los productos disponibles para canjear
                mediante el programa de puntos.
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

          {beneficiosFiltrados.length === 0 && (
            <div className="bec-vacio">
              <div className="bec-vacio-icono">
                <Gift size={29} />
              </div>

              <h3>No hay beneficios disponibles</h3>

              <p>
                Cuando existan beneficios o promociones para tu cuenta,
                podrás consultarlos en este apartado.
              </p>
            </div>
          )}
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
            Los puntos, promociones y beneficios estarán sujetos
            a las condiciones establecidas por BANUAT. Consulta
            los detalles antes de utilizar o canjear una recompensa.
          </p>
        </div>
      </div>

    </section>
  );
}
