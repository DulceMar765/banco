import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Search,
  Users,
  Wallet,
  AlertTriangle,
  Eye,
  Pencil,
  History,
  Save,
  X,
  Landmark,
  PiggyBank,
  CreditCard,
  Clock,
} from 'lucide-react';

import './ModuloClientes.css';

type Producto = {
  id: number;
  tipo: 'Cuenta bancaria' | 'Ahorro' | 'Préstamo';
  nombre: string;
  saldo: number;
  pagoMensual?: number;
  tasa?: number;
  frecuencia?: string;
  fechaPago?: string;
  estado: string;
};

type Cliente = {
  id: number;
  nombre: string;
  rfc: string;
  correo: string;
  telefono: string;
  fechaRegistro: string;
  ingresos: number;
  gastos: number;
  otrasDeudas: number;
  estado: 'Activo' | 'En revisión' | 'Atrasado';
  productos: Producto[];
};

type Modificacion = {
  id: number;
  clienteId: number;
  cliente: string;
  campo: string;
  anterior: string;
  nuevo: string;
  supervisor: string;
  fecha: string;
  motivo: string;
};

type Edicion = {
  ingresos: string;
  gastos: string;
  otrasDeudas: string;
  frecuencia: string;
  fechaPago: string;
  pagoMensual: string;
  tasa: string;
  motivo: string;
};

const SUPERVISOR_ACTUAL = 'Carlos Ramírez';

const clientesIniciales: Cliente[] = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    rfc: 'PEJU900515ABC',
    correo: 'juan.perez@email.com',
    telefono: '833 123 4567',
    fechaRegistro: '2025-03-12',
    ingresos: 18000,
    gastos: 6500,
    otrasDeudas: 2000,
    estado: 'Activo',
    productos: [
      {
        id: 101,
        tipo: 'Cuenta bancaria',
        nombre: 'Cuenta de nómina',
        saldo: 12500,
        estado: 'Activa',
      },
      {
        id: 102,
        tipo: 'Ahorro',
        nombre: 'Ahorro personal',
        saldo: 8500,
        estado: 'Activo',
      },
      {
        id: 103,
        tipo: 'Préstamo',
        nombre: 'Préstamo personal',
        saldo: 32000,
        pagoMensual: 2500,
        tasa: 18,
        frecuencia: 'Mensual',
        fechaPago: '2026-11-15',
        estado: 'Al corriente',
      },
    ],
  },
  {
    id: 2,
    nombre: 'María González',
    rfc: 'GOMM950820XYZ',
    correo: 'maria.gonzalez@email.com',
    telefono: '833 456 7890',
    fechaRegistro: '2025-05-20',
    ingresos: 14000,
    gastos: 7000,
    otrasDeudas: 1500,
    estado: 'Activo',
    productos: [
      {
        id: 201,
        tipo: 'Cuenta bancaria',
        nombre: 'Cuenta de débito',
        saldo: 9200,
        estado: 'Activa',
      },
      {
        id: 202,
        tipo: 'Préstamo',
        nombre: 'Crédito de consumo',
        saldo: 18500,
        pagoMensual: 1800,
        tasa: 20,
        frecuencia: 'Quincenal',
        fechaPago: '2026-11-05',
        estado: 'Al corriente',
      },
    ],
  },
  {
    id: 3,
    nombre: 'Roberto Sánchez',
    rfc: 'SARO880310DEF',
    correo: 'roberto.sanchez@email.com',
    telefono: '833 789 0123',
    fechaRegistro: '2025-01-08',
    ingresos: 11000,
    gastos: 6500,
    otrasDeudas: 3000,
    estado: 'Atrasado',
    productos: [
      {
        id: 301,
        tipo: 'Ahorro',
        nombre: 'Ahorro programado',
        saldo: 2500,
        estado: 'Activo',
      },
      {
        id: 302,
        tipo: 'Préstamo',
        nombre: 'Préstamo personal',
        saldo: 27000,
        pagoMensual: 2800,
        tasa: 22,
        frecuencia: 'Mensual',
        fechaPago: '2026-10-20',
        estado: 'Con atraso',
      },
    ],
  },
];

const moneda = (cantidad: number) =>
  cantidad.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  });

const fechaActual = () =>
  new Date().toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

export default function ModuloClientes({
  onVolver,
}: {
  onVolver: () => void;
}) {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<number | null>(null);
  const [prestamoSeleccionado, setPrestamoSeleccionado] =
    useState<number | null>(null);
  const [mostrarEdicion, setMostrarEdicion] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState<Modificacion[]>([]);

  const [edicion, setEdicion] = useState<Edicion>({
    ingresos: '',
    gastos: '',
    otrasDeudas: '',
    frecuencia: 'Mensual',
    fechaPago: '',
    pagoMensual: '',
    tasa: '',
    motivo: '',
  });

  const cliente = clientes.find(
    (item) => item.id === clienteSeleccionado
  );

  const prestamo = cliente?.productos.find(
    (item) =>
      item.id === prestamoSeleccionado &&
      item.tipo === 'Préstamo'
  );

  const clientesFiltrados = useMemo(
    () =>
      clientes.filter((item) =>
        `${item.nombre} ${item.rfc} ${item.correo}`
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      ),
    [clientes, busqueda]
  );

  const capacidadDisponible = (item: Cliente) =>
    item.ingresos - item.gastos - item.otrasDeudas;

  const deudaTotal = (item: Cliente) =>
    item.productos
      .filter((producto) => producto.tipo === 'Préstamo')
      .reduce((total, producto) => total + producto.saldo, 0);

  const porcentajeDeuda = (item: Cliente) =>
    item.ingresos > 0
      ? (item.otrasDeudas / item.ingresos) * 100
      : 0;

  const totalPrestamos = clientes.reduce(
    (total, item) =>
      total +
      item.productos.filter(
        (producto) => producto.tipo === 'Préstamo'
      ).length,
    0
  );

  const clientesAtrasados = clientes.filter(
    (item) => item.estado === 'Atrasado'
  ).length;

  const abrirCliente = (id: number) => {
    setClienteSeleccionado(id);
    setPrestamoSeleccionado(null);
    setMostrarEdicion(false);
    setMostrarHistorial(false);
  };

  const abrirEdicion = (producto: Producto | null) => {
    if (!cliente) return;

    setPrestamoSeleccionado(producto?.id ?? null);

    setEdicion({
      ingresos: String(cliente.ingresos),
      gastos: String(cliente.gastos),
      otrasDeudas: String(cliente.otrasDeudas),
      frecuencia: producto?.frecuencia ?? 'Mensual',
      fechaPago: producto?.fechaPago ?? '',
      pagoMensual: String(producto?.pagoMensual ?? ''),
      tasa: String(producto?.tasa ?? ''),
      motivo: '',
    });

    setMostrarEdicion(true);
  };

  const actualizarCampo = (
    campo: keyof Edicion,
    valor: string
  ) => {
    setEdicion((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const guardarCambios = () => {
    if (!cliente) return;

    if (!edicion.motivo.trim()) {
      alert('Debes indicar el motivo de la modificación.');
      return;
    }

    const nuevosIngresos = Number(edicion.ingresos);
    const nuevosGastos = Number(edicion.gastos);
    const nuevasDeudas = Number(edicion.otrasDeudas);

    if (
      !Number.isFinite(nuevosIngresos) ||
      !Number.isFinite(nuevosGastos) ||
      !Number.isFinite(nuevasDeudas) ||
      nuevosIngresos < 0 ||
      nuevosGastos < 0 ||
      nuevasDeudas < 0
    ) {
      alert('Verifica los ingresos, gastos y deudas.');
      return;
    }

    if (
      nuevosIngresos === 0 &&
      (nuevosGastos > 0 || nuevasDeudas > 0)
    ) {
      alert('Los ingresos deben ser mayores a cero.');
      return;
    }

    const producto = cliente.productos.find(
      (item) => item.id === prestamoSeleccionado
    );

    if (prestamoSeleccionado !== null && !producto) {
      alert('No se encontró el préstamo seleccionado.');
      return;
    }

    const cambios: Modificacion[] = [];

    const registrarCambio = (
      campo: string,
      anterior: string,
      nuevo: string
    ) => {
      if (anterior !== nuevo) {
        cambios.push({
          id: Date.now() + cambios.length,
          clienteId: cliente.id,
          cliente: cliente.nombre,
          campo,
          anterior,
          nuevo,
          supervisor: SUPERVISOR_ACTUAL,
          fecha: fechaActual(),
          motivo: edicion.motivo.trim(),
        });
      }
    };

    registrarCambio(
      'Ingresos mensuales',
      moneda(cliente.ingresos),
      moneda(nuevosIngresos)
    );

    registrarCambio(
      'Gastos mensuales',
      moneda(cliente.gastos),
      moneda(nuevosGastos)
    );

    registrarCambio(
      'Otras deudas mensuales',
      moneda(cliente.otrasDeudas),
      moneda(nuevasDeudas)
    );

    if (producto) {
      const nuevoPago = Number(edicion.pagoMensual);
      const nuevaTasa = Number(edicion.tasa);

      if (
        !Number.isFinite(nuevoPago) ||
        !Number.isFinite(nuevaTasa) ||
        nuevoPago <= 0 ||
        nuevaTasa < 0 ||
        nuevaTasa > 100 ||
        !edicion.fechaPago
      ) {
        alert('Verifica el pago, la tasa y la fecha de pago.');
        return;
      }

      registrarCambio(
        'Frecuencia de pago',
        producto.frecuencia ?? 'No definida',
        edicion.frecuencia
      );

      registrarCambio(
        'Fecha de pago',
        producto.fechaPago ?? 'No definida',
        edicion.fechaPago
      );

      registrarCambio(
        'Monto de pago',
        moneda(producto.pagoMensual ?? 0),
        moneda(nuevoPago)
      );

      registrarCambio(
        'Tasa de interés',
        `${producto.tasa ?? 0}%`,
        `${nuevaTasa}%`
      );
    }

    if (cambios.length === 0) {
      alert('No se detectaron cambios en la información.');
      return;
    }

    setClientes((anteriores) =>
      anteriores.map((item) => {
        if (item.id !== cliente.id) return item;

        return {
          ...item,
          ingresos: nuevosIngresos,
          gastos: nuevosGastos,
          otrasDeudas: nuevasDeudas,
          productos: item.productos.map((p) => {
            if (!producto || p.id !== producto.id) return p;

            return {
              ...p,
              frecuencia: edicion.frecuencia,
              fechaPago: edicion.fechaPago,
              pagoMensual: Number(edicion.pagoMensual),
              tasa: Number(edicion.tasa),
            };
          }),
        };
      })
    );

    setHistorial((anterior) => [...cambios, ...anterior]);
    setMostrarEdicion(false);

    alert(
      `Se guardaron ${cambios.length} modificación(es) en el historial.`
    );
  };

  const volverAlDirectorio = () => {
    setClienteSeleccionado(null);
    setPrestamoSeleccionado(null);
    setMostrarEdicion(false);
    setMostrarHistorial(false);
  };

  return (
    <div className="mc-container">
      <div className="mc-header">
        <div>
          <button className="mc-back" onClick={onVolver}>
            <ArrowLeft size={17} />
            Volver al panel
          </button>

          <h1>Administración de clientes</h1>
          <p>
            Consulta la información financiera y administra las
            condiciones de los productos de cada cliente.
          </p>
        </div>

        {cliente && (
          <button
            className="mc-history-button"
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
          >
            <History size={17} />
            Historial de cambios
          </button>
        )}
      </div>

      {!cliente && (
        <>
          <div className="mc-stats">
            <div className="mc-stat-card">
              <div className="mc-stat-icon blue">
                <Users size={21} />
              </div>
              <div>
                <span>Clientes registrados</span>
                <strong>{clientes.length}</strong>
              </div>
            </div>

            <div className="mc-stat-card">
              <div className="mc-stat-icon green">
                <CreditCard size={21} />
              </div>
              <div>
                <span>Préstamos registrados</span>
                <strong>{totalPrestamos}</strong>
              </div>
            </div>

            <div className="mc-stat-card">
              <div className="mc-stat-icon red">
                <AlertTriangle size={21} />
              </div>
              <div>
                <span>Clientes atrasados</span>
                <strong>{clientesAtrasados}</strong>
              </div>
            </div>

            <div className="mc-stat-card">
              <div className="mc-stat-icon purple">
                <Wallet size={21} />
              </div>
              <div>
                <span>Capacidad favorable</span>
                <strong>
                  {
                    clientes.filter(
                      (item) => capacidadDisponible(item) > 0
                    ).length
                  }
                </strong>
              </div>
            </div>
          </div>

          <section className="mc-section">
            <div className="mc-section-heading">
              <div>
                <h2>Directorio de clientes</h2>
                <p>Selecciona un cliente para consultar su información.</p>
              </div>

              <div className="mc-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RFC o correo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="mc-table-wrapper">
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>RFC</th>
                    <th>Ingresos mensuales</th>
                    <th>Deuda registrada</th>
                    <th>Capacidad disponible</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {clientesFiltrados.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.nombre}</strong>
                        <small>{item.correo}</small>
                      </td>
                      <td>{item.rfc}</td>
                      <td>{moneda(item.ingresos)}</td>
                      <td>{moneda(deudaTotal(item))}</td>
                      <td
                        className={
                          capacidadDisponible(item) >= 0
                            ? 'mc-positive'
                            : 'mc-negative'
                        }
                      >
                        {moneda(capacidadDisponible(item))}
                      </td>
                      <td>
                        <span
                          className={`mc-status ${item.estado
                            .toLowerCase()
                            .replace(' ', '-')}`}
                        >
                          {item.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="mc-view-button"
                          onClick={() => abrirCliente(item.id)}
                        >
                          <Eye size={16} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}

                  {clientesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="mc-empty">
                        No se encontraron clientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {cliente && (
        <>
          <div className="mc-detail-top">
            <button className="mc-back" onClick={volverAlDirectorio}>
              <ArrowLeft size={17} />
              Volver al directorio
            </button>

            <div>
              <h2>{cliente.nombre}</h2>
              <p>RFC: {cliente.rfc}</p>
            </div>

            <span
              className={`mc-status ${cliente.estado
                .toLowerCase()
                .replace(' ', '-')}`}
            >
              {cliente.estado}
            </span>
          </div>

          <div className="mc-profile-grid">
            <div className="mc-profile-card">
              <span>Correo electrónico</span>
              <strong>{cliente.correo}</strong>
            </div>
            <div className="mc-profile-card">
              <span>Teléfono</span>
              <strong>{cliente.telefono}</strong>
            </div>
            <div className="mc-profile-card">
              <span>Fecha de registro</span>
              <strong>{cliente.fechaRegistro}</strong>
            </div>
          </div>

          <section className="mc-section">
            <div className="mc-section-heading">
              <div>
                <h2>Capacidad de pago</h2>
                <p>
                  Resumen de ingresos, gastos y compromisos financieros
                  mensuales declarados.
                </p>
              </div>

              <button
                className="mc-edit-button"
                onClick={() => abrirEdicion(null)}
              >
                <Pencil size={16} />
                Modificar información
              </button>
            </div>

            <div className="mc-finance-grid">
              <div className="mc-finance-card">
                <span>Ingresos mensuales</span>
                <strong>{moneda(cliente.ingresos)}</strong>
                <small>Ingresos declarados</small>
              </div>

              <div className="mc-finance-card">
                <span>Gastos mensuales</span>
                <strong>{moneda(cliente.gastos)}</strong>
                <small>Gastos declarados</small>
              </div>

              <div className="mc-finance-card">
                <span>Otras deudas mensuales</span>
                <strong>{moneda(cliente.otrasDeudas)}</strong>
                <small>Compromisos registrados</small>
              </div>

              <div className="mc-finance-card highlight">
                <span>Capacidad disponible</span>
                <strong>{moneda(capacidadDisponible(cliente))}</strong>
                <small>Ingresos menos gastos y otras deudas</small>
              </div>
            </div>

            <div className="mc-debt-analysis">
              <div>
                <span>Relación de otras deudas / ingresos</span>
                <strong>{porcentajeDeuda(cliente).toFixed(1)}%</strong>
              </div>
              <div className="mc-progress">
                <div
                  style={{
                    width: `${Math.min(
                      porcentajeDeuda(cliente),
                      100
                    )}%`,
                  }}
                />
              </div>
              <small>
                Este indicador considera las otras deudas declaradas,
                no el saldo total de los préstamos.
              </small>
            </div>
          </section>

          <section className="mc-section">
            <div className="mc-section-heading">
              <div>
                <h2>Productos financieros</h2>
                <p>
                  Cuentas bancarias, ahorros y préstamos registrados
                  para este cliente.
                </p>
              </div>
            </div>

            <div className="mc-products-grid">
              {cliente.productos.map((producto) => (
                <div className="mc-product-card" key={producto.id}>
                  <div className="mc-product-heading">
                    <div className="mc-product-icon">
                      {producto.tipo === 'Cuenta bancaria' ? (
                        <Landmark size={21} />
                      ) : producto.tipo === 'Ahorro' ? (
                        <PiggyBank size={21} />
                      ) : (
                        <CreditCard size={21} />
                      )}
                    </div>
                    <span>{producto.tipo}</span>
                  </div>

                  <h3>{producto.nombre}</h3>
                  <strong className="mc-product-balance">
                    {moneda(producto.saldo)}
                  </strong>
                  <small>
                    {producto.tipo === 'Préstamo'
                      ? 'Saldo pendiente'
                      : 'Saldo disponible'}
                  </small>

                  {producto.tipo === 'Préstamo' && (
                    <div className="mc-loan-info">
                      <p>
                        <span>Pago registrado</span>
                        <strong>
                          {moneda(producto.pagoMensual ?? 0)}
                        </strong>
                      </p>
                      <p>
                        <span>Tasa de interés</span>
                        <strong>{producto.tasa}%</strong>
                      </p>
                      <p>
                        <span>Frecuencia</span>
                        <strong>{producto.frecuencia}</strong>
                      </p>
                      <p>
                        <span>Próximo pago</span>
                        <strong>{producto.fechaPago}</strong>
                      </p>
                      <p>
                        <span>Estado</span>
                        <strong>{producto.estado}</strong>
                      </p>

                      <button
                        className="mc-edit-button full"
                        onClick={() => abrirEdicion(producto)}
                      >
                        <Pencil size={15} />
                        Modificar condiciones
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {mostrarEdicion && (
            <section className="mc-section mc-edit-section">
              <div className="mc-section-heading">
                <div>
                  <h2>Modificar información financiera</h2>
                  <p>
                    {prestamo
                      ? `Editando: ${prestamo.nombre}`
                      : 'Editando ingresos, gastos y deudas declaradas.'}
                  </p>
                </div>

                <button
                  className="mc-close-button"
                  onClick={() => setMostrarEdicion(false)}
                  aria-label="Cerrar edición"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="mc-form-grid">
                <label>
                  Ingresos mensuales
                  <input
                    type="number"
                    min="0"
                    value={edicion.ingresos}
                    onChange={(e) =>
                      actualizarCampo('ingresos', e.target.value)
                    }
                  />
                </label>

                <label>
                  Gastos mensuales
                  <input
                    type="number"
                    min="0"
                    value={edicion.gastos}
                    onChange={(e) =>
                      actualizarCampo('gastos', e.target.value)
                    }
                  />
                </label>

                <label>
                  Otras deudas mensuales
                  <input
                    type="number"
                    min="0"
                    value={edicion.otrasDeudas}
                    onChange={(e) =>
                      actualizarCampo('otrasDeudas', e.target.value)
                    }
                  />
                </label>

                {prestamo && (
                  <>
                    <label>
                      Frecuencia de pago
                      <select
                        value={edicion.frecuencia}
                        onChange={(e) =>
                          actualizarCampo('frecuencia', e.target.value)
                        }
                      >
                        <option value="Semanal">Semanal</option>
                        <option value="Quincenal">Quincenal</option>
                        <option value="Mensual">Mensual</option>
                      </select>
                    </label>

                    <label>
                      Fecha de próximo pago
                      <input
                        type="date"
                        value={edicion.fechaPago}
                        onChange={(e) =>
                          actualizarCampo('fechaPago', e.target.value)
                        }
                      />
                    </label>

                    <label>
                      Monto de pago
                      <input
                        type="number"
                        min="0"
                        value={edicion.pagoMensual}
                        onChange={(e) =>
                          actualizarCampo('pagoMensual', e.target.value)
                        }
                      />
                    </label>

                    <label>
                      Tasa de interés (%)
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={edicion.tasa}
                        onChange={(e) =>
                          actualizarCampo('tasa', e.target.value)
                        }
                      />
                    </label>
                  </>
                )}

                <label className="mc-full-field">
                  Motivo de la modificación
                  <textarea
                    rows={3}
                    placeholder="Describe por qué se realiza este cambio..."
                    value={edicion.motivo}
                    onChange={(e) =>
                      actualizarCampo('motivo', e.target.value)
                    }
                  />
                </label>
              </div>

              <div className="mc-edit-actions">
                <button
                  className="mc-cancel-button"
                  onClick={() => setMostrarEdicion(false)}
                >
                  Cancelar
                </button>

                <button
                  className="mc-save-button"
                  onClick={guardarCambios}
                >
                  <Save size={17} />
                  Guardar modificaciones
                </button>
              </div>
            </section>
          )}

          {mostrarHistorial && (
            <section className="mc-section mc-history-section">
              <div className="mc-section-heading">
                <div>
                  <h2>Historial de modificaciones</h2>
                  <p>
                    Registro de los cambios realizados a este cliente.
                  </p>
                </div>
                <History size={23} />
              </div>

              {historial.filter(
                (item) => item.clienteId === cliente.id
              ).length === 0 ? (
                <div className="mc-empty-history">
                  <Clock size={28} />
                  <strong>Sin modificaciones registradas</strong>
                  <span>
                    Cuando se realice un cambio, aparecerá aquí.
                  </span>
                </div>
              ) : (
                <div className="mc-history-list">
                  {historial
                    .filter((item) => item.clienteId === cliente.id)
                    .map((item) => (
                      <article className="mc-history-item" key={item.id}>
                        <div className="mc-history-icon">
                          <History size={17} />
                        </div>

                        <div className="mc-history-content">
                          <strong>{item.campo}</strong>

                          <div className="mc-history-values">
                            <span>{item.anterior}</span>
                            <span className="mc-history-arrow">→</span>
                            <strong>{item.nuevo}</strong>
                          </div>

                          <p>
                            Motivo: {item.motivo}
                          </p>

                          <small>
                            {item.supervisor} · {item.fecha}
                          </small>
                        </div>
                      </article>
                    ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}