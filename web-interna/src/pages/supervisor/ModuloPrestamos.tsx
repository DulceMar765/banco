
import {
  ArrowLeft,
  Wallet,
  ShieldCheck,
  FileSearch,
  History,
  ClipboardList,
  HandCoins,
} from 'lucide-react'

import './ModuloPrestamos.css'

export default function ModuloPrestamos({
  onVolver,
}: {
  onVolver: () => void
}) {

  return (
    <main className="mp">

      {/* ENCABEZADO */}
      <header className="mp-encabezado">

        <button
          type="button"
          className="mp-volver"
          onClick={onVolver}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Panel
        </button>

        <div>
          <h1>Gestión de préstamos</h1>
          <p>
            Revisión, evaluación y autorización de solicitudes de préstamos.
          </p>
        </div>

        <span className="mp-contador">
          <strong>0</strong> pendientes
        </span>

      </header>

      <div className="mp-layout">

        {/* LISTA DE SOLICITUDES */}
        <section
          className="mp-card mp-lista"
          aria-labelledby="titulo-solicitudes"
        >

          <div className="mp-lista__cabecera">
            <h2 id="titulo-solicitudes">
              Solicitudes
            </h2>
          </div>

          <div className="mp-vacio">
            <ClipboardList size={32} />
            <p>No hay solicitudes registradas.</p>
            <small>
              Cuando se registren solicitudes de préstamos,
              aparecerán en esta sección.
            </small>
          </div>

        </section>

        {/* DETALLE DEL PRÉSTAMO */}
        <section className="mp-detalle">

          {/* INFORMACIÓN DEL CLIENTE */}
          <article className="mp-card mp-cliente">

            <div>
              <span className="mp-etiqueta">
                Información del cliente
              </span>

              <h2>
                Selecciona una solicitud
              </h2>

              <p className="mp-cliente__datos">
                Aquí se mostrará la información del préstamo seleccionado.
              </p>
            </div>

          </article>

          <div className="mp-grid">

            {/* CAPACIDAD DE PAGO */}
            <article
              className="mp-card"
              aria-labelledby="titulo-capacidad"
            >

              <h3 id="titulo-capacidad" className="mp-titulo">
                <Wallet size={16} aria-hidden="true" />
                Capacidad de pago
              </h3>

              <div className="mp-vacio">
                <p>Sin información disponible.</p>
                <small>
                  Aquí se mostrarán los ingresos mensuales,
                  deudas actuales, capacidad disponible y cuota estimada.
                </small>
              </div>

            </article>

            {/* RIESGO DE IMPAGO */}
            <article
              className="mp-card"
              aria-labelledby="titulo-riesgo"
            >

              <h3 id="titulo-riesgo" className="mp-titulo">
                <ShieldCheck size={16} aria-hidden="true" />
                Riesgo de impago
              </h3>

              <div className="mp-vacio">
                <p>Evaluación pendiente.</p>
                <small>
                  El nivel de riesgo se calculará cuando existan
                  datos de una solicitud.
                </small>
              </div>

            </article>

          </div>

          {/* VERIFICACIÓN RFC */}
          <article className="mp-card">

            <h3 className="mp-titulo">
              <FileSearch size={16} aria-hidden="true" />
              Verificación de RFC
            </h3>

            <div className="mp-vacio">
              <p>Sin RFC para verificar.</p>
              <small>
                Aquí se mostrará el RFC del cliente y el estado
                de su verificación.
              </small>
            </div>

          </article>

          {/* HISTORIAL */}
          <article
            className="mp-card"
            aria-labelledby="titulo-historial"
          >

            <h3 id="titulo-historial" className="mp-titulo">
              <History size={16} aria-hidden="true" />
              Historial de préstamos y pagos
            </h3>

            <div className="mp-vacio">
              <p>No hay historial disponible.</p>
              <small>
                Aquí aparecerán los préstamos anteriores,
                montos, pagos realizados y estados.
              </small>
            </div>

          </article>

          {/* DECISIÓN DEL SUPERVISOR */}
          <article
            className="mp-card mp-decision"
            aria-labelledby="titulo-decision"
          >

            <h3 id="titulo-decision" className="mp-titulo">
              <HandCoins size={16} aria-hidden="true" />
              Decisión del supervisor
            </h3>

            <div className="mp-vacio">
              <p>Sin solicitudes para evaluar.</p>
              <small>
                Cuando exista una solicitud, podrás revisar
                la tasa de interés, registrar el motivo de tu decisión
                y autorizar o rechazar el préstamo.
              </small>
            </div>

          </article>

        </section>

      </div>

    </main>
  )
}
