import type { Cliente, Solicitud } from '../pages/canalizacion/Escritorio';

const API_BASE = 'http://localhost:3001/api/escritorio';

export type ResumenEscritorio = {
  totalClientes: number;
  solicitudesActivas: number;
  atencionesHoy: number;
  productosColocados: number;
  solicitudesRecientes: Solicitud[];
  clientesRecientes: Cliente[];
};

export async function fetchResumenEscritorio(): Promise<ResumenEscritorio | null> {
  try {
    const res = await fetch(`${API_BASE}/resumen`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.warn('Backend desconectado o no accesible para /resumen:', error);
    return null;
  }
}

export async function fetchClientes(busqueda = ''): Promise<Cliente[]> {
  try {
    const url = busqueda
      ? `${API_BASE}/clientes?q=${encodeURIComponent(busqueda)}`
      : `${API_BASE}/clientes`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.warn('Backend desconectado para /clientes:', error);
    return [];
  }
}

export async function registrarClienteApi(
  datos: Omit<Cliente, 'id' | 'cuenta' | 'estado'>
): Promise<Cliente | null> {
  try {
    const res = await fetch(`${API_BASE}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al registrar el cliente');
    }
    return await res.json();
  } catch (error) {
    console.error('Error al registrar cliente en backend:', error);
    throw error;
  }
}

export async function fetchSolicitudes(): Promise<Solicitud[]> {
  try {
    const res = await fetch(`${API_BASE}/solicitudes`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.warn('Backend desconectado para /solicitudes:', error);
    return [];
  }
}

export async function registrarSolicitudApi(
  datos: Omit<Solicitud, 'id' | 'fecha' | 'estado'>
): Promise<Solicitud | null> {
  try {
    const res = await fetch(`${API_BASE}/solicitudes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteNombre: datos.cliente,
        productoNombre: datos.producto,
        monto: datos.monto,
        plazo: datos.plazo,
        motivo: datos.motivo
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al registrar la solicitud');
    }
    return await res.json();
  } catch (error) {
    console.error('Error al registrar solicitud en backend:', error);
    throw error;
  }
}

export type ActividadItem = {
  id: string;
  tipo: "atencion" | "registro" | "solicitud";
  descripcion: string;
  cliente: string;
  fecha: string;
  hora: string;
  detalle: string;
};

export async function fetchActividades(): Promise<ActividadItem[]> {
  try {
    const res = await fetch(`${API_BASE}/actividad`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.warn('Backend desconectado para /actividad:', error);
    return [];
  }
}

