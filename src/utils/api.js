import { resolverImagen } from './imagenes';

// Base de cada recurso (incluye el prefijo de ruta).
//  - Local, directo al microservicio:  http://localhost:8081/api/productos
//  - Via AWS API Gateway:              https://<id>.execute-api.<region>.amazonaws.com/<stage>/productos
const PRODUCTOS_URL =
  process.env.REACT_APP_PRODUCTOS_URL || 'http://localhost:8081/api/productos';
const CARRITO_URL =
  process.env.REACT_APP_CARRITO_URL || 'http://localhost:8082/api/carrito';
const AUTH_URL =
  process.env.REACT_APP_AUTH_URL || 'http://localhost:8083/api/auth';

async function request(url, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // el filtro JWT del backend valida este token
  }

  const respuesta = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!respuesta.ok) {
    let mensaje = `Error ${respuesta.status}`;
    try {
      const data = await respuesta.json();
      mensaje = data.detail || data.message || mensaje;
    } catch (e) {
      /* respuesta sin cuerpo JSON */
    }
    const error = new Error(mensaje);
    error.status = respuesta.status;
    throw error;
  }

  if (respuesta.status === 204) return null;
  const contentType = respuesta.headers.get('content-type') || '';
  return contentType.includes('application/json') ? respuesta.json() : null;
}

// ---------- Catalogo de productos (endpoints publicos) ----------
export const productsAPI = {
  getAll: () => request(`${PRODUCTOS_URL}`),
  getById: (id) => request(`${PRODUCTOS_URL}/${id}`),
  getByCategoria: (categoria) =>
    request(`${PRODUCTOS_URL}?categoria=${encodeURIComponent(categoria)}`),
  buscar: (nombre) => request(`${PRODUCTOS_URL}?nombre=${encodeURIComponent(nombre)}`),
  crear: (producto, token) =>
    request(`${PRODUCTOS_URL}`, { method: 'POST', token, body: producto }),
  actualizar: (id, producto, token) =>
    request(`${PRODUCTOS_URL}/${id}`, { method: 'PUT', token, body: producto }),
  eliminar: (id, token) => request(`${PRODUCTOS_URL}/${id}`, { method: 'DELETE', token }),
};

// ---------- Carrito / pedidos (requieren access token de Azure) ----------
export const carritoAPI = {
  get: (token) => request(`${CARRITO_URL}`, { token }),
  addItem: (token, productoId, cantidad = 1) =>
    request(`${CARRITO_URL}/items`, {
      method: 'POST',
      token,
      body: { productoId, cantidad },
    }),
  updateItem: (token, itemId, cantidad) =>
    request(`${CARRITO_URL}/items/${itemId}`, {
      method: 'PUT',
      token,
      body: { cantidad },
    }),
  removeItem: (token, itemId) =>
    request(`${CARRITO_URL}/items/${itemId}`, { method: 'DELETE', token }),
  vaciar: (token) => request(`${CARRITO_URL}`, { method: 'DELETE', token }),
  checkout: (token) => request(`${CARRITO_URL}/checkout`, { method: 'POST', token }),
  pedidos: (token) => request(`${CARRITO_URL}/pedidos`, { token }),
};

// ---------- Identidad (ms-auth) ----------
export const authAPI = {
  me: (token) => request(`${AUTH_URL}/me`, { token }),
  accesos: (token) => request(`${AUTH_URL}/accesos`, { token }),
};

// ---------- Adaptador de forma para las vistas ----------
export const formatProductForDisplay = (p) => {
  if (!p) return {};
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio: typeof p.precio === 'number' ? p.precio : Number(p.precio || 0),
    stock: p.stock,
    categoria: p.categoria,
    imagen: resolverImagen(p.imagenUrl),
    imagenUrl: p.imagenUrl,
  };
};

// ---------- Paneles Admin / Vendedor ----------
// Fuera del alcance de esta version: la identidad y la administracion de usuarios
// se delegan a Azure AD. Se dejan como stubs para no romper imports existentes.
const noDisponible = () =>
  Promise.reject(
    new Error('Modulo no disponible en esta version (arquitectura de microservicios).')
  );

export const adminAPI = {
  getEstadisticas: noDisponible,
  getUsuarios: noDisponible,
  getProductos: noDisponible,
  crearProducto: noDisponible,
  actualizarProducto: noDisponible,
  eliminarProducto: noDisponible,
  getActividades: noDisponible,
};

export const vendedorAPI = {
  obtenerTodosProductos: noDisponible,
  obtenerMisProductos: noDisponible,
  crearProducto: noDisponible,
  actualizarProducto: noDisponible,
  eliminarProducto: noDisponible,
  obtenerEstadisticas: noDisponible,
};

const api = { products: productsAPI, carrito: carritoAPI, formatProductForDisplay };
export default api;
