
import { useMemo, useState, useEffect } from "react";
import {
  HandCoins,
  PiggyBank,
  TrendingUp,
  Wallet,
  Search,
  ArrowRight,
  Clock3,
  BadgePercent,
  ShieldCheck,
  BriefcaseBusiness,
  CircleDollarSign,
} from "lucide-react";

import "./Productos.css";

export type ProductoFinanciero = {
  id: number;
  nombre: string;
  categoria: "Préstamos" | "Inversiones" | "Ahorro";
  descripcion: string;
  montoMinimo: number;
  montoMaximo: number;
  tasa: string;
  plazo: string;
  beneficios: string[];
  destacado?: boolean;
};

type ProductosProps = {
  onCrearSolicitud: (producto: ProductoFinanciero) => void;
};

const categorias = [
  "Todos",
  "Préstamos",
  "Inversiones",
  "Ahorro",
] as const;

type Categoria = (typeof categorias)[number];

const iconos = {
  Préstamos: HandCoins,
  Inversiones: TrendingUp,
  Ahorro: PiggyBank,
};

const colores = {
  Préstamos: "prestamo",
  Inversiones: "inversion",
  Ahorro: "ahorro",
};

const formatoMoneda = (cantidad: number) => {
  if (cantidad === 0) return "Sin límite establecido";

  return cantidad.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
};

export default function Productos({
  onCrearSolicitud,
}: ProductosProps) {
  const [listaProductos, setListaProductos] = useState<ProductoFinanciero[]>([]);
  const [categoriaActiva, setCategoriaActiva] =
    useState<Categoria>("Todos");

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let activo = true;
    fetch('http://localhost:3001/api/escritorio/productos')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any[]) => {
        if (!activo || !Array.isArray(data)) return;
        setListaProductos(data);
      })
      .catch((err) => {
        console.warn('Backend desconectado para productos:', err);
      });
    return () => {
      activo = false;
    };
  }, []);

  const productosFiltrados = useMemo(() => {
    return listaProductos.filter((producto) => {
      const coincideCategoria =
        categoriaActiva === "Todos" ||
        producto.categoria === categoriaActiva;

      const coincideBusqueda =
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());

      return coincideCategoria && coincideBusqueda;
    });
  }, [listaProductos, categoriaActiva, busqueda]);

  const totalPrestamos = listaProductos.filter(
    (p) => p.categoria === "Préstamos"
  ).length;

  const totalInversiones = listaProductos.filter(
    (p) => p.categoria === "Inversiones"
  ).length;

  const totalAhorro = listaProductos.filter(
    (p) => p.categoria === "Ahorro"
  ).length;

  return (
    <section className="es-section prod-section">
      {/* ENCABEZADO */}
      <div className="es-page-heading">
        <div>
          <span className="es-eyebrow">CATÁLOGO FINANCIERO</span>
          <h1>Productos financieros</h1>
          <p>
            Consulta los productos disponibles y genera solicitudes
            para los clientes.
          </p>
        </div>

        <div className="prod-total">
          <div className="prod-total-icon">
            <BriefcaseBusiness size={20} />
          </div>
          <div>
            <strong>{listaProductos.length}</strong>
            <span>Productos disponibles</span>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="es-stats-three">
        <div className="es-stat-card">
          <div className="es-stat-icon prod-stat-orange">
            <HandCoins size={21} />
          </div>
          <div className="es-stat-content">
            <span>Préstamos</span>
            <strong>{totalPrestamos}</strong>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon prod-stat-green">
            <TrendingUp size={21} />
          </div>
          <div className="es-stat-content">
            <span>Inversiones</span>
            <strong>{totalInversiones}</strong>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon prod-stat-brown">
            <PiggyBank size={21} />
          </div>
          <div className="es-stat-content">
            <span>Ahorro</span>
            <strong>{totalAhorro}</strong>
          </div>
        </div>
      </div>

      {/* CATÁLOGO */}
      <div className="es-card prod-catalog">
        <div className="prod-catalog-heading">
          <div>
            <h2>Catálogo de productos</h2>
            <p>
              Selecciona un producto para consultar sus características
              o generar una solicitud.
            </p>
          </div>

          <span className="es-count">
            {productosFiltrados.length} resultados
          </span>
        </div>

        {/* BUSCADOR Y FILTROS */}
        <div className="prod-toolbar">
          <div className="prod-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="prod-filters">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                type="button"
                className={`prod-filter ${
                  categoriaActiva === categoria ? "active" : ""
                }`}
                onClick={() => setCategoriaActiva(categoria)}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>

        {/* TARJETAS DE PRODUCTOS */}
        {productosFiltrados.length > 0 ? (
          <div className="prod-grid">
            {productosFiltrados.map((producto) => {
              const Icono = iconos[producto.categoria];
              const color = colores[producto.categoria];

              return (
                <article className="prod-card" key={producto.id}>
                  <div className="prod-card-top">
                    <div className={`prod-icon ${color}`}>
                      <Icono size={23} />
                    </div>

                    {producto.destacado && (
                      <span className="prod-featured">
                        <ShieldCheck size={12} />
                        Destacado
                      </span>
                    )}
                  </div>

                  <div className="prod-card-info">
                    <span className={`prod-category ${color}`}>
                      {producto.categoria}
                    </span>

                    <h3>{producto.nombre}</h3>

                    <p>{producto.descripcion}</p>
                  </div>

                  <div className="prod-details">
                    <div className="prod-detail">
                      <div>
                        <Wallet size={15} />
                        <span>Monto mínimo</span>
                      </div>
                      <strong>
                        {formatoMoneda(producto.montoMinimo)}
                      </strong>
                    </div>

                    <div className="prod-detail">
                      <div>
                        <CircleDollarSign size={15} />
                        <span>Monto máximo</span>
                      </div>
                      <strong>
                        {formatoMoneda(producto.montoMaximo)}
                      </strong>
                    </div>

                    <div className="prod-detail">
                      <div>
                        <BadgePercent size={15} />
                        <span>Tasa de interés / rendimiento</span>
                      </div>
                      <strong>{producto.tasa}</strong>
                    </div>

                    <div className="prod-detail">
                      <div>
                        <Clock3 size={15} />
                        <span>Plazo</span>
                      </div>
                      <strong>{producto.plazo}</strong>
                    </div>
                  </div>

                  <div className="prod-benefits">
                    <span>Características</span>

                    {producto.beneficios.map((beneficio) => (
                      <div key={beneficio}>
                        <span className="prod-check">✓</span>
                        {beneficio}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="es-btn es-btn-primary prod-request-btn"
                    onClick={() => onCrearSolicitud(producto)}
                  >
                    Generar solicitud
                    <ArrowRight size={15} />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="es-empty-state">
            <div className="es-empty-icon">
              <Search size={25} />
            </div>
            <h3>No se encontraron productos</h3>
            <p>
              Intenta con otro nombre o selecciona una categoría diferente.
            </p>
            <button
              type="button"
              className="es-btn es-btn-secondary"
              onClick={() => {
                setBusqueda("");
                setCategoriaActiva("Todos");
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* INFORMACIÓN */}
      <div className="prod-notice">
        <div className="prod-notice-icon">
          <ShieldCheck size={19} />
        </div>
        <div>
          <strong>Proceso de autorización</strong>
          <p>
            Las solicitudes generadas desde este apartado serán enviadas
            al supervisor para su revisión y autorización. El ejecutivo
            no puede aprobar ni rechazar solicitudes.
          </p>
        </div>
      </div>
    </section>
  );
}
