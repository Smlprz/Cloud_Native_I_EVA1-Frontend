import React, { createContext, useContext, useReducer, useEffect } from 'react';

const initialState = {
  carrito: [],
  totalProductos: 0,
  totalPrecio: 0
};

const CARGAR_CARRITO = 'CARGAR_CARRITO';
const AGREGAR_PRODUCTO = 'AGREGAR_PRODUCTO';
const ELIMINAR_PRODUCTO = 'ELIMINAR_PRODUCTO';
const CAMBIAR_CANTIDAD = 'CAMBIAR_CANTIDAD';
const LIMPIAR_CARRITO = 'LIMPIAR_CARRITO';
const carritoReducer = (state, action) => {
  switch (action.type) {
    case CARGAR_CARRITO:
      return {
        ...state,
        carrito: action.payload,
        totalProductos: action.payload.reduce((total, producto) => total + (producto.cantidad || 1), 0),
        totalPrecio: action.payload.reduce((total, producto) => total + ((producto.precio || 0) * (producto.cantidad || 1)), 0)
      };

    case AGREGAR_PRODUCTO:
      const productoExistente = state.carrito.find(p => p.id === action.payload.id);
      let nuevoCarrito;
      
      if (productoExistente) {
        nuevoCarrito = state.carrito.map(p => 
          p.id === action.payload.id 
            ? { ...p, cantidad: (p.cantidad || 1) + 1 }
            : p
        );
      } else {
        nuevoCarrito = [...state.carrito, { 
          ...action.payload, 
          cantidad: 1,
          imagen: action.payload.imagen || action.payload.imagenes?.[0]
        }];
      }
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
      
      return {
        ...state,
        carrito: nuevoCarrito,
        totalProductos: nuevoCarrito.reduce((total, producto) => total + (producto.cantidad || 1), 0),
        totalPrecio: nuevoCarrito.reduce((total, producto) => total + ((producto.precio || 0) * (producto.cantidad || 1)), 0)
      };

    case ELIMINAR_PRODUCTO:
      const carritoFiltrado = state.carrito.filter((_, index) => index !== action.payload);
      localStorage.setItem('carrito', JSON.stringify(carritoFiltrado));
      
      return {
        ...state,
        carrito: carritoFiltrado,
        totalProductos: carritoFiltrado.reduce((total, producto) => total + (producto.cantidad || 1), 0),
        totalPrecio: carritoFiltrado.reduce((total, producto) => total + ((producto.precio || 0) * (producto.cantidad || 1)), 0)
      };

    case CAMBIAR_CANTIDAD:
      const carritoActualizado = state.carrito.map((producto, index) => 
        index === action.payload.index 
          ? { ...producto, cantidad: Math.max(1, (producto.cantidad || 1) + action.payload.delta) }
          : producto
      );
      localStorage.setItem('carrito', JSON.stringify(carritoActualizado));
      
      return {
        ...state,
        carrito: carritoActualizado,
        totalProductos: carritoActualizado.reduce((total, producto) => total + (producto.cantidad || 1), 0),
        totalPrecio: carritoActualizado.reduce((total, producto) => total + ((producto.precio || 0) * (producto.cantidad || 1)), 0)
      };

    case LIMPIAR_CARRITO:
      localStorage.setItem('carrito', JSON.stringify([]));
      return {
        ...state,
        carrito: [],
        totalProductos: 0,
        totalPrecio: 0
      };

    default:
      return state;
  }
};
const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(carritoReducer, initialState);

  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    dispatch({ type: CARGAR_CARRITO, payload: carritoGuardado });
  }, []);

  const agregarAlCarrito = (producto) => {
    dispatch({ type: AGREGAR_PRODUCTO, payload: producto });
  };

  const eliminarDelCarrito = (index) => {
    dispatch({ type: ELIMINAR_PRODUCTO, payload: index });
  };

  const cambiarCantidad = (index, delta) => {
    dispatch({ type: CAMBIAR_CANTIDAD, payload: { index, delta } });
  };

  const limpiarCarrito = () => {
    dispatch({ type: LIMPIAR_CARRITO });
  };

  const value = {
    carrito: state.carrito,
    totalProductos: state.totalProductos,
    totalPrecio: state.totalPrecio,
    agregarAlCarrito,
    eliminarDelCarrito,
    cambiarCantidad,
    limpiarCarrito
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de CarritoProvider');
  }
  return context;
};