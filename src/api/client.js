import { API_BASE, API_TIMEOUT_MS } from '../config';

export class ApiError extends Error {
  // detalle: el motivo exacto que informo el backend (por ejemplo "Fondos insuficientes").
  constructor(status, message, detalle = '') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detalle = detalle;
  }
}

// Mensajes entendibles por codigo HTTP (el detalle tecnico del backend va entre parentesis).
function mensajeAmigable(status, detalle) {
  const base =
    {
      0: 'No se pudo conectar con el servidor. Revisa tu conexion; si persiste, puede faltar la ruta en el gateway o estar bloqueada por CORS',
      400: 'Los datos enviados no son validos',
      401: 'Tu sesion expiro. Vuelve a iniciar sesion',
      402: 'El pago fue rechazado',
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
    throw new ApiError(respuesta.status, mensajeAmigable(respuesta.status, detalle), detalle);
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
  // token (opcional): el catalogo es publico, pero con sesion el backend sabe QUIEN vio el producto
  // y puede armar sus recomendaciones (evento de navegacion en Kafka).
  obtener: (id, token) => request(`/productos/${id}`, { token }),
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
  // email (opcional): direccion a la que se envia el comprobante. cupon (opcional): codigo de un cupon de descuento.
  confirmar: (token, email, cupon) => {
    const body = { ...(email ? { email } : {}), ...(cupon ? { cupon } : {}) };
    return request('/carrito/checkout', { method: 'POST', token, body: Object.keys(body).length ? body : undefined });
  },
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

// ------------------------------------------------------------------ Cupones
export const cupones = {
  // Calcula el descuento sin consumir el cupon. datos: { codigo, monto }
  validar: (token, datos) => request('/cupones/validar', { method: 'POST', token, body: datos }),
  // Solo ADMIN
  listar: (token) => request('/cupones', { token }),
  crear: (token, datos) => request('/cupones', { method: 'POST', token, body: datos }),
  activar: (token, id, activo) =>
    request(`/cupones/${id}/activo`, { method: 'PUT', token, body: { activo } }),
};

// -------------------------------------------------------------------- Pagos
export const pagos = {
  // datos: { ordenId, numeroTarjeta, titular, vencimiento (MM/AA), cvv }. El monto sale de la orden.
  pagar: (token, datos) => request('/pagos', { method: 'POST', token, body: datos }),
  listar: (token, ordenId) => request(`/pagos${q({ ordenId })}`, { token }),
  // Webpay: iniciar devuelve { url, token }; al volver se confirma (o se anula) con ese token.
  webpayIniciar: (token, ordenId) => request('/pagos/webpay/iniciar', { method: 'POST', token, body: { ordenId } }),
  webpayConfirmar: (token, tbk) => request('/pagos/webpay/confirmar', { method: 'POST', token, body: { token: tbk } }),
  webpayAnular: (token, tbk) => request('/pagos/webpay/anular', { method: 'POST', token, body: { token: tbk } }),
};

// ------------------------------------------------------ Analitica (Kafka)
export const analytics = {
  // Productos parecidos a los que el usuario ha consultado. productoId: el que esta mirando (opcional).
  recomendaciones: (token, { productoId, limite } = {}) =>
    request(`/analytics/recomendaciones${q({ productoId, limite })}`, { token }),
  perfil: (token) => request('/analytics/perfil', { token }),
  // Foto de las metricas (solo ADMIN). En tiempo real llegan ademas por WebSocket.
  metricas: (token) => request('/analytics/metricas', { token }),
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

const api = { productos, carrito, ordenes, resenas, cupones, pagos, analytics, auth, rabbit };
export default api;
