
import { useState, useEffect } from "react";
import {
  History,
  Search,
  CalendarDays,
  Ticket,
  UserRound,
  Filter,
  Info,
} from "lucide-react";

import "./HistorialTurnos.css";

type TurnoItem = {
  id: string;
  turno: string;
  persona: string;
  tipoPersona: string;
  tramite: string;
  fecha: string;
  hora: string;
  area: string;
  estado: string;
};

const HistorialTurnos = () => {
  const [busqueda, setBusqueda] = useState("");
  const [fecha, setFecha] = useState("");
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);

  useEffect(() => {
    let url = "http://localhost:3001/api/turnos";
    const params = new URLSearchParams();
    if (fecha) params.append("fecha", fecha);
    if (busqueda.trim()) params.append("busqueda", busqueda.trim());
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTurnos(data);
      })
      .catch((err) => console.warn("Error al cargar historial de turnos:", err));
  }, [fecha, busqueda]);

  return (
    <div className="ht-container">

      {/* ENCABEZADO */}
      <div className="ht-header">
        <div>
          <span className="ht-eyebrow">
            <History size={15} />
            CONTROL DE TURNOS
          </span>

          <h1>Historial de turnos</h1>

          <p>
            Consulta los turnos que se han asignado desde recepción.
          </p>
        </div>

        <div className="ht-header-icon">
          <History size={30} />
        </div>
      </div>

      {/* AVISO */}
      <div className="ht-notice">
        <div className="ht-notice-icon">
          <Info size={21} />
        </div>

        <div>
          <h3>Consulta de registros</h3>
          <p>
            Aquí podrás revisar los turnos asignados y consultar su
            información. La atención de los turnos corresponde al área
            que recibe a la persona.
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <section className="ht-filters-section">
        <div className="ht-section-heading">
          <div>
            <h2>Buscar turnos</h2>
            <p>Utiliza los filtros para localizar un registro.</p>
          </div>

          <span className="ht-filter-label">
            <Filter size={15} />
            Filtros
          </span>
        </div>

        <div className="ht-filters">
          <div className="ht-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Buscar por número de turno o persona..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="ht-date-filter">
            <CalendarDays size={18} />

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              aria-label="Filtrar por fecha"
            />
          </div>
        </div>
      </section>

      {/* TABLA */}
      <section className="ht-table-section">
        <div className="ht-table-header">
          <div className="ht-table-title">
            <Ticket size={21} />
            <h2>Registros de turnos</h2>
          </div>
        </div>

        <div className="ht-table-wrapper">
          <table className="ht-table">
            <thead>
              <tr>
                <th>Turno</th>
                <th>Persona</th>
                <th>Tipo de persona</th>
                <th>Trámite</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Área asignada</th>
              </tr>
            </thead>

            <tbody>
              {turnos.length > 0 ? (
                turnos.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong style={{ color: "#d97706" }}>{t.turno}</strong>
                    </td>
                    <td>{t.persona}</td>
                    <td>{t.tipoPersona}</td>
                    <td>{t.tramite}</td>
                    <td>{t.fecha}</td>
                    <td>{t.hora}</td>
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: t.area === "Caja" ? "#fff7ed" : "#f0fdf4",
                          color: t.area === "Caja" ? "#c2410c" : "#15803d",
                        }}
                      >
                        {t.area}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="ht-empty">
                      <div className="ht-empty-icon">
                        <History size={32} />
                      </div>

                      <h3>No hay turnos registrados</h3>

                      <p>
                        Cuando se asignen turnos desde recepción,
                        aparecerán aquí para su consulta.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* INFORMACIÓN */}
      <div className="ht-footer-info">
        <div className="ht-footer-icon">
          <UserRound size={21} />
        </div>

        <div>
          <h3>Responsabilidad de recepción</h3>
          <p>
            El historial sirve para consultar los turnos asignados.
            No incluye acciones para modificar turnos ni registrar
            su atención.
          </p>
        </div>
      </div>

    </div>
  );
};

export default HistorialTurnos;
