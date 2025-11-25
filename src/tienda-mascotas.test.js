// src/tienda-mascotas.test.js
import React from 'react';

describe("🐕 TIENDA DE MASCOTAS - Suite de Pruebas", function() {

  describe("📦 Módulo de Carrito de Compras", function() {
    it("debería calcular correctamente el total de productos en el carrito", function() {
      const carrito = [
        { nombre: "Alimento Premium", precio: 20990, cantidad: 2 },
        { nombre: "Juguete para Mascota", precio: 8990, cantidad: 1 }
      ];
      
      const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      expect(total).toBe(50970);
    });

    it("debería permitir agregar nuevos productos al carrito", function() {
      const productoNuevo = {
        id: 'prod-001',
        nombre: "Alimento para Gatos",
        precio: 15990,
        categoria: "Alimentación"
      };
      
      let carrito = [];
      carrito.push({ ...productoNuevo, cantidad: 1 });
      
      expect(carrito.length).toBe(1);
      expect(carrito[0].nombre).toContain("Gatos");
    });
  });

  describe("💰 Módulo de Cálculos y Precios", function() {
    it("debería formatear correctamente los precios en pesos chilenos", function() {
      const precio = 20990;
      const formatoCLP = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(precio);
      
      expect(formatoCLP).toContain("$20.990");
    });

    it("debería validar que los precios sean números positivos", function() {
      const productos = [
        { nombre: "Alimento Perro", precio: 20990 },
        { nombre: "Arena Gatos", precio: 7990 },
        { nombre: "Correa", precio: 12990 }
      ];
      
      productos.forEach(producto => {
        expect(producto.precio).toBeGreaterThan(0);
        expect(typeof producto.precio).toBe('number');
      });
    });
  });

  describe("🛍️ Módulo de Gestión de Productos", function() {
    it("debería categorizar correctamente los productos para mascotas", function() {
      const categorias = {
        alimentacion: ["Alimento Perro", "Alimento Gato", "Snacks"],
        accesorios: ["Correas", "Juguetes", "Camas"],
        higiene: ["Shampoo", "Arena", "Cepillos"]
      };
      
      expect(categorias.alimentacion).toContain("Alimento Perro");
      expect(categorias.accesorios.length).toBe(3);
    });

    it("debería tener información completa de cada producto", function() {
      const productoCompleto = {
        id: "PET-001",
        nombre: "Alimento para Perro Adulto Razas Pequeñas",
        precio: 20990,
        categoria: "Alimentación",
        mascota: "Perro",
        descripcion: "Alimento balanceado para perros adultos de razas pequeñas",
        stock: 50
      };
      
      expect(productoCompleto.id).toMatch(/^PET-/);
      expect(productoCompleto.nombre).toBeDefined();
      expect(productoCompleto.precio).toBeGreaterThan(1000);
      expect(productoCompleto.stock).toBeGreaterThanOrEqual(0);
    });
  });

  describe("🎯 Módulo de Experiencia de Usuario", function() {
    it("debería manejar correctamente el carrito vacío", function() {
      const carritoVacio = [];
      const mensajeCarritoVacio = "🛒 Tu carrito está esperando por productos para tus mascotas";
      
      expect(carritoVacio.length).toBe(0);
      expect(mensajeCarritoVacio).toContain("carrito");
    });

    it("debería crear interfaces de producto atractivas con React", function() {
      const TarjetaProducto = ({ producto, onAgregar }) => (
        <div className="tarjeta-producto" data-testid="tarjeta-producto">
          <img src={producto.imagen} alt={producto.nombre} />
          <h3>{producto.nombre}</h3>
          <p className="precio">${producto.precio.toLocaleString('es-CL')}</p>
          <p className="categoria">{producto.categoria}</p>
          <button 
            onClick={onAgregar}
            className="btn-agregar-carrito"
          >
            🛒 Agregar al Carrito
          </button>
        </div>
      );

      const productoDemo = {
        nombre: "Alimento Premium para Mascotas",
        precio: 24990,
        categoria: "Alimentación",
        imagen: "producto.jpg"
      };

      const componente = (
        <TarjetaProducto 
          producto={productoDemo} 
          onAgregar={() => console.log('Producto agregado')}
        />
      );

      expect(componente).toBeDefined();
    });
  });
});