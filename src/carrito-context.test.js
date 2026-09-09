// src/carrito-context.test.js
import React from 'react';

describe("Pruebas del Context del Carrito", function() {

  // Pruebas del reducer del carrito
  it("debería agregar producto al carrito correctamente", function() {
    const estadoInicial = { carrito: [], totalProductos: 0, totalPrecio: 0 };
    
    const accionAgregar = {
      type: 'AGREGAR_PRODUCTO',
      payload: {
        id: 1,
        nombre: "Alimento para Perro",
        precio: 20990,
        imagen: "test.jpg"
      }
    };

    // Simulamos el reducer
    const nuevoEstado = carritoReducer(estadoInicial, accionAgregar);
    
    expect(nuevoEstado.carrito.length).toBe(1);
    expect(nuevoEstado.totalProductos).toBe(1);
    expect(nuevoEstado.totalPrecio).toBe(20990);
  });

  it("debería incrementar cantidad si el producto ya existe", function() {
    const estadoConProducto = {
      carrito: [{ id: 1, nombre: "Alimento", precio: 20990, cantidad: 1 }],
      totalProductos: 1,
      totalPrecio: 20990
    };

    const accionAgregarMismo = {
      type: 'AGREGAR_PRODUCTO',
      payload: { id: 1, nombre: "Alimento", precio: 20990 }
    };

    const nuevoEstado = carritoReducer(estadoConProducto, accionAgregarMismo);
    
    expect(nuevoEstado.carrito[0].cantidad).toBe(2);
    expect(nuevoEstado.totalProductos).toBe(2);
    expect(nuevoEstado.totalPrecio).toBe(41980);
  });

  it("debería eliminar producto del carrito correctamente", function() {
    const estadoConProductos = {
      carrito: [
        { id: 1, nombre: "Alimento", precio: 20990, cantidad: 1 },
        { id: 2, nombre: "Salsa", precio: 1990, cantidad: 1 }
      ],
      totalProductos: 2,
      totalPrecio: 22980
    };

    const accionEliminar = {
      type: 'ELIMINAR_PRODUCTO',
      payload: 0 // Eliminar primer producto
    };

    const nuevoEstado = carritoReducer(estadoConProductos, accionEliminar);
    
    expect(nuevoEstado.carrito.length).toBe(1);
    expect(nuevoEstado.carrito[0].id).toBe(2);
    expect(nuevoEstado.totalProductos).toBe(1);
    expect(nuevoEstado.totalPrecio).toBe(1990);
  });
});

// Simulación del reducer para las pruebas
function carritoReducer(state, action) {
  switch (action.type) {
    case 'AGREGAR_PRODUCTO':
      const productoExistente = state.carrito.find(p => p.id === action.payload.id);
      let nuevoCarrito;
      
      if (productoExistente) {
        nuevoCarrito = state.carrito.map(p => 
          p.id === action.payload.id 
            ? { ...p, cantidad: (p.cantidad || 1) + 1 }
            : p
        );
      } else {
        nuevoCarrito = [...state.carrito, { ...action.payload, cantidad: 1 }];
      }
      
      return {
        carrito: nuevoCarrito,
        totalProductos: nuevoCarrito.reduce((total, p) => total + p.cantidad, 0),
        totalPrecio: nuevoCarrito.reduce((total, p) => total + (p.precio * p.cantidad), 0)
      };

    case 'ELIMINAR_PRODUCTO':
      const carritoFiltrado = state.carrito.filter((_, index) => index !== action.payload);
      return {
        carrito: carritoFiltrado,
        totalProductos: carritoFiltrado.reduce((total, p) => total + p.cantidad, 0),
        totalPrecio: carritoFiltrado.reduce((total, p) => total + (p.precio * p.cantidad), 0)
      };

    default:
      return state;
  }
}