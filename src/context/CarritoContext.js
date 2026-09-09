import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from './AuthContext';
import { productsAPI, carritoAPI } from '../utils/api';
import { resolverImagen } from '../utils/imagenes';

/**
 * Carrito conectado al microservicio ms-carrito.
 * Todas las operaciones viajan con el access token de Azure (Bearer).
 * Sin sesion iniciada el carrito esta vacio y "Agregar" pide iniciar sesion.
 */
const CarritoContext = createContext(null);

export const CarritoProvider = ({ children }) => {
  const { isAuthenticated, listo, getToken, login } = useAuth();

  const [carrito, setCarrito] = useState([]);
  const [totalPrecio, setTotalPrecio] = useState(0);
  const [cargando, setCargando] = useState(false);

  // Cache productoId -> nombre de archivo de imagen (para los thumbnails del carrito).
  const imagenesRef = useRef({});

  const cargarMapaImagenes = useCallback(async () => {
    if (Object.keys(imagenesRef.current).length > 0) return;
    try {
      const productos = await productsAPI.getAll();
      const mapa = {};
      productos.forEach((p) => {
        mapa[p.id] = p.imagenUrl;
      });
      imagenesRef.current = mapa;
    } catch (error) {
      console.error('No se pudo cargar el catalogo para las imagenes del carrito:', error);
    }
  }, []);

  const aplicarRespuesta = useCallback((data) => {
    const mapa = imagenesRef.current;
    const items = (data && data.items ? data.items : []).map((it) => ({
      id: it.id, // id del item dentro del carrito
      productoId: it.productoId,
      nombre: it.nombreProducto,
      precio: Number(it.precioUnitario),
      cantidad: it.cantidad,
      descripcion: '',
      imagen: resolverImagen(mapa[it.productoId]),
    }));
    setCarrito(items);
    setTotalPrecio(Number(data && data.total ? data.total : 0));
  }, []);

  const refrescar = useCallback(async () => {
    if (!isAuthenticated) {
      setCarrito([]);
      setTotalPrecio(0);
      return;
    }
    setCargando(true);
    try {
      await cargarMapaImagenes();
      const token = await getToken();
      const data = await carritoAPI.get(token);
      aplicarRespuesta(data);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    } finally {
      setCargando(false);
    }
  }, [isAuthenticated, getToken, cargarMapaImagenes, aplicarRespuesta]);

  useEffect(() => {
    if (listo) refrescar();
  }, [listo, isAuthenticated, refrescar]);

  const agregarAlCarrito = useCallback(
    async (producto, cantidad = 1) => {
      if (!isAuthenticated) {
        alert('Inicia sesion con Microsoft para usar el carrito.');
        login();
        return;
      }
      try {
        const token = await getToken();
        const data = await carritoAPI.addItem(token, producto.id, cantidad);
        aplicarRespuesta(data);
      } catch (error) {
        alert('No se pudo agregar al carrito: ' + error.message);
      }
    },
    [isAuthenticated, getToken, login, aplicarRespuesta]
  );

  const cambiarCantidad = useCallback(
    async (index, delta) => {
      const item = carrito[index];
      if (!item) return;
      const nuevaCantidad = Math.max(1, item.cantidad + delta);
      try {
        const token = await getToken();
        const data = await carritoAPI.updateItem(token, item.id, nuevaCantidad);
        aplicarRespuesta(data);
      } catch (error) {
        alert('No se pudo actualizar la cantidad: ' + error.message);
      }
    },
    [carrito, getToken, aplicarRespuesta]
  );

  const eliminarDelCarrito = useCallback(
    async (index) => {
      const item = carrito[index];
      if (!item) return;
      try {
        const token = await getToken();
        const data = await carritoAPI.removeItem(token, item.id);
        aplicarRespuesta(data);
      } catch (error) {
        alert('No se pudo eliminar el producto: ' + error.message);
      }
    },
    [carrito, getToken, aplicarRespuesta]
  );

  const limpiarCarrito = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const token = await getToken();
      await carritoAPI.vaciar(token);
      setCarrito([]);
      setTotalPrecio(0);
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
    }
  }, [isAuthenticated, getToken]);

  const checkout = useCallback(async () => {
    const token = await getToken();
    const pedido = await carritoAPI.checkout(token);
    setCarrito([]);
    setTotalPrecio(0);
    return pedido;
  }, [getToken]);

  const totalProductos = carrito.reduce((suma, p) => suma + (p.cantidad || 0), 0);

  const value = {
    carrito,
    totalProductos,
    totalPrecio,
    cargando,
    agregarAlCarrito,
    eliminarDelCarrito,
    cambiarCantidad,
    limpiarCarrito,
    checkout,
    refrescar,
  };

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
};

export const useCarrito = () => {
  const contexto = useContext(CarritoContext);
  if (!contexto) {
    throw new Error('useCarrito debe ser usado dentro de CarritoProvider');
  }
  return contexto;
};
