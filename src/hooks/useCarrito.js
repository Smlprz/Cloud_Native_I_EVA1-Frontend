import { useState, useEffect } from 'react';

import alimentoPerro1 from '../Img_productos/AlimentoPerroAdultoChampion.webp';
import alimentoPerro2 from '../Img_productos/AlimentoPerroAdultoCachupin25kg.webp';
import salsaPerro from '../Img_productos/SalsaPerro300gr.webp';
import alimentoPerro3 from '../Img_productos/AlimentoPerroAdultoChampionDog3kg.webp';
import casaPerro from '../Img_productos/CasaPerroTallaL.webp';
import bolsoMascota from '../Img_productos/BolsoMascotaGatoMultifuncional.webp';
import mascotasHero from '../Img_productos/Mascotas.jpg';
import logo from '../Img_productos/LogoPaginaweb.png';
import carritoIcon from '../Img_productos/CarritoCompraBlanco.png';
import contenedorComida from '../Img_productos/ContenedorComidaMascota20kf.webp';
import rascadorGato from '../Img_productos/RascadorGato137cm.webp';

export { 
  alimentoPerro1, alimentoPerro2, salsaPerro, alimentoPerro3, 
  casaPerro, bolsoMascota, mascotasHero, logo, carritoIcon,
  contenedorComida, rascadorGato
};

const obtenerCarritoLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('carrito')) || [];
  } catch (error) {
    console.error('Error al cargar carrito:', error);
    return [];
  }
};

const guardarCarritoLocalStorage = (carrito) => {
  try {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  } catch (error) {
    console.error('Error al guardar carrito:', error);
  }
};

const useCarrito = () => {
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const carritoGuardado = obtenerCarritoLocalStorage();
    console.log('Carrito cargado desde localStorage:', carritoGuardado);
    setCarrito(carritoGuardado);
  }, []);

  useEffect(() => {
    console.log('Carrito actualizado, guardando en localStorage:', carrito);
    guardarCarritoLocalStorage(carrito);
  }, [carrito]);

  const agregarAlCarrito = (producto) => {
    console.log('Agregando producto al carrito:', producto);
    
    const productoExistente = carrito.find(p => p.id === producto.id);
    
    if (productoExistente) {
      const nuevoCarrito = carrito.map(p => 
        p.id === producto.id 
          ? { ...p, cantidad: (p.cantidad || 1) + 1 }
          : p
      );
      setCarrito(nuevoCarrito);
    } else {
      const nuevoCarrito = [...carrito, { 
        ...producto, 
        cantidad: 1,
        imagen: producto.imagen || producto.imagenes?.[0],
        nombre: producto.nombre,
        precio: producto.precio,
        descripcion: producto.descripcion || ''
      }];
      setCarrito(nuevoCarrito);
    }
  };

  const eliminarDelCarrito = (index) => {
    console.log('Eliminando producto del carrito en índice:', index);
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  const cambiarCantidad = (index, delta) => {
    console.log('Cambiando cantidad en índice:', index, 'delta:', delta);
    const nuevoCarrito = [...carrito];
    const nuevaCantidad = Math.max(1, (nuevoCarrito[index].cantidad || 1) + delta);
    nuevoCarrito[index].cantidad = nuevaCantidad;
    setCarrito(nuevoCarrito);
  };

  const limpiarCarrito = () => {
    console.log('Limpiando carrito');
    setCarrito([]);
  };

  const totalProductos = carrito.reduce((total, producto) => total + (producto.cantidad || 1), 0);

  const totalPrecio = carrito.reduce((total, producto) => {
    const precio = producto.precio || 0;
    const cantidad = producto.cantidad || 1;
    return total + (precio * cantidad);
  }, 0);

  console.log('Estado actual del carrito:', {
    carrito,
    totalProductos,
    totalPrecio
  });

  return {
    carrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    cambiarCantidad,
    limpiarCarrito,
    totalProductos,
    totalPrecio
  };
};

export default useCarrito;