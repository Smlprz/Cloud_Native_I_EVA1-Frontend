import { API_BASE, API_TIMEOUT_MS } from '../config';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Mensajes entendibles por codigo HTTP (el detalle tecnico del backend va entre parentesis).
function mensajeAmigable(status, detalle) {
  const base =
    {
      0: 'No se pudo conectar con el servidor',
      400: 'Los datos enviados no son validos',
      401: 'Tu sesion expiro. Vuelve a iniciar sesion',
      403: 'No tienes permiso para esta accion',
      404: 'No se encontro lo que buscas',
      409: 'La operacion entra en conflicto con el estado actual',
      422: 'Los datos enviados no son validos',
      429: 'Demasiadas solicitudes. Intenta en unos segundos',
      502: 'El servicio no esta disponible por ahora',
      503: 'El servicio no esta disponible por ahora',
      504: 'El servicio tardo demasiado en responder',
    }[status] || (status >= 500 ? 'Error del servidor' : `Error ${status}`);
  return detalle && detalle !== base ? `${base} (${detalle})` : base;
}

// Los componentes se suscriben para mostrar "POST /carrito/items -> 201" como aviso.
const oyentes = new Set();
export const onApiEvento = (fn) => {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
};
const emitir = (evento) => oyentes.forEach((fn) => fn(evento));

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  // Content-Type solo cuando hay cuerpo: un GET sin esa cabecera no dispara preflight CORS.
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), API_TIMEOUT_MS);
  const mutacion = method !== 'GET';

  let respuesta;
  try {
    respuesta = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: control.signal,
    });
  } catch (error) {
    const aborto = error && error.name === 'AbortError';
    if (mutacion) emitir({ method, path, status: 0, ok: false });
    throw new ApiError(aborto ? 504 : 0, mensajeAmigable(aborto ? 504 : 0));
  } finally {
    clearTimeout(temporizador);
  }

  if (mutacion) emitir({ method, path, status: respuesta.status, ok: respuesta.ok });

  if (!respuesta.ok) {
    let detalle = '';
    try {
      const data = await respuesta.json();
      detalle = data.detail || data.message || data.error || '';
    } catch (e) {
      /* respuesta sin cuerpo JSON */
    }
    throw new ApiError(respuesta.status, mensajeAmigable(respuesta.status, detalle));
  }

  if (respuesta.status === 204) return null;
  const tipo = respuesta.headers.get('content-type') || '';
  return tipo.includes('application/json') ? respuesta.json() : null;
}

const q = (params) => {
  const usados = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  return usados.length
    ? `?${usados.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`
    : '';
};

// ---------------------------------------------------------------- Productos
export const productos = {
  listar: ({ categoria, nombre } = {}) => request(`/productos${q({ categoria, nombre })}`),
  obtener: (id) => request(`/productos/${id}`),
  crear: (token, producto) => request('/productos', { method: 'POST', token, body: producto }),
  actualizar: (token, id, producto) =>
    request(`/productos/${id}`, { method: 'PUT', token, body: producto }),
  eliminar: (token, id) => request(`/productos/${id}`, { method: 'DELETE', token }),
};

// ------------------------------------------------------------------ Carrito
export const carrito = {
  ver: (token) => request('/carrito', { token }),
  agregar: (token, productoId, cantidad = 1) =>
    request('/carrito/items', { method: 'POST', token, body: { productoId, cantidad } }),
  cambiarCantidad: (token, itemId, cantidad) =>
    request(`/carrito/items/${itemId}`, { method: 'PUT', token, body: { cantidad } }),
  quitar: (token, itemId) => request(`/carrito/items/${itemId}`, { method: 'DELETE', token }),
  vaciar: (token) => request('/carrito', { method: 'DELETE', token }),
  // email (opcional): direccion a la que se envia el comprobante de la compra.
  confirmar: (token, email) =>
    request('/carrito/checkout', { method: 'POST', token, body: email ? { email } : undefined }),
  pedidos: (token) => request('/carrito/pedidos', { token }),
};

// ------------------------------------------------------------------ Ordenes
export const ordenes = {
  listar: (token) => request('/ordenes', { token }),
};

// ------------------------------------------------------------------ Resenas
export const resenas = {
  listar: (token, productoId) => request(`/resenas${q({ productoId })}`, { token }),
  crear: (token, resena) => request('/resenas', { method: 'POST', token, body: resena }),
  eliminar: (token, id) => request(`/resenas/${id}`, { method: 'DELETE', token }),
};

// ----------------------------------------------------------------- Identidad
export const auth = {
  perfil: (token) => request('/auth/me', { token }),
};

// ---------------------------------------------------- Administrador RabbitMQ
export const rabbit = {
  crearExchange: (token, datos) =>
    request('/rabbit/exchanges', { method: 'POST', token, body: datos }),
  eliminarExchange: (token, nombre) =>
    request(`/rabbit/exchanges/${encodeURIComponent(nombre)}`, { method: 'DELETE', token }),
  crearCola: (token, datos) => request('/rabbit/queues', { method: 'POST', token, body: datos }),
  infoCola: (token, nombre) => request(`/rabbit/queues/${encodeURIComponent(nombre)}`, { token }),
  eliminarCola: (token, nombre) =>
    request(`/rabbit/queues/${encodeURIComponent(nombre)}`, { method: 'DELETE', token }),
  crearBinding: (token, datos) =>
    request('/rabbit/bindings', { method: 'POST', token, body: datos }),
  eliminarBinding: (token, datos) =>
    request('/rabbit/bindings', { method: 'DELETE', token, body: datos }),
};

const api = { productos, carrito, ordenes, resenas, auth, rabbit };
export default api;
