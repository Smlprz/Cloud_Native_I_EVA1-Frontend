import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './ToastContext';
import api from '../api/client';

/**
 * Carrito conectado a ms-carrito. Sin sesion el carrito esta vacio y "Agregar" pide iniciar sesion.
 * Cada accion refleja la respuesta del servidor (fuente unica de verdad) y avisa el resultado.
 */
const CarritoContext = createContext(null);

const VACIO = { items: [], total: 0 };

export function CarritoProvider({ children }) {
  const { listo, autenticado, getToken, login } = useAuth();
  const aviso = useToast();
  const [carrito, setCarrito] = useState(VACIO);
  const [cargando, setCargando] = useState(false);
  const [ocupado, setOcupado] = useState(false); // una accion en curso: evita dobles clics

  const aplicar = useCallback((data) => {
    setCarrito({
      items: (data && data.items) || [],
      total: Number((data && data.total) || 0),
    });
  }, []);

  const refrescar = useCallback(async () => {
    if (!autenticado) {
      setCarrito(VACIO);
      return;
    }
    setCargando(true);
    try {
      aplicar(await api.carrito.ver(await getToken()));
    } catch (error) {
      aviso.error(error.message);
    } finally {
      setCargando(false);
    }
  }, [autenticado, getToken, aplicar, aviso]);

  useEffect(() => {
    if (listo) refrescar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listo, autenticado]);

  // Ejecuta una accion contra el carrito con control de errores y bloqueo de doble clic.
  const ejecutar = useCallback(
    async (accion, mensajeExito) => {
      if (ocupado) return null;
      setOcupado(true);
      try {
        const resultado = await accion(await getToken());
        if (mensajeExito) aviso.exito(mensajeExito);
        return resultado || true;
      } catch (error) {
        aviso.error(error.message);
        return null;
      } finally {
        setOcupado(false);
      }
    },
    [ocupado, getToken, aviso]
  );

  const agregar = useCallback(
    async (producto, cantidad = 1) => {
      if (!autenticado) {
        aviso.info('Inicia sesion para usar el carrito');
        login();
        return;
      }
      const data = await ejecutar(
        (t) => api.carrito.agregar(t, producto.id, cantidad),
        `${producto.nombre} agregado al carrito`
      );
      if (data && data !== true) aplicar(data);
    },
    [autenticado, login, ejecutar, aplicar, aviso]
  );

  const cambiarCantidad = useCallback(
    async (item, cantidad) => {
      if (cantidad < 1) return;
      const data = await ejecutar((t) => api.carrito.cambiarCantidad(t, item.id, cantidad));
      if (data && data !== true) aplicar(data);
    },
    [ejecutar, aplicar]
  );

  const quitar = useCallback(
    async (item) => {
      const data = await ejecutar((t) => api.carrito.quitar(t, item.id), 'Producto quitado');
      if (data && data !== true) aplicar(data);
    },
    [ejecutar, aplicar]
  );

  const vaciar = useCallback(async () => {
    const ok = await ejecutar((t) => api.carrito.vaciar(t), 'Carrito vaciado');
    if (ok) setCarrito(VACIO);
  }, [ejecutar]);

  // Devuelve el pedido creado (o null si fallo).
  const confirmar = useCallback(async (email) => {
    const pedido = await ejecutar((t) => api.carrito.confirmar(t, email));
    if (pedido && pedido !== true) setCarrito(VACIO);
    return pedido && pedido !== true ? pedido : null;
  }, [ejecutar]);

  const valor = useMemo(
    () => ({
      items: carrito.items,
      total: carrito.total,
      cantidad: carrito.items.reduce((s, i) => s + (i.cantidad || 0), 0),
      cargando,
      ocupado,
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      confirmar,
      refrescar,
    }),
    [carrito, cargando, ocupado, agregar, cambiarCantidad, quitar, vaciar, confirmar, refrescar]
  );

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  return contexto;
}
