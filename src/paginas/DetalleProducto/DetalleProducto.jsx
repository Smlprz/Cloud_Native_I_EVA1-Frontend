import React, { useState, useEffect } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import { useCarrito } from '../../context/CarritoContext';
import { 
  alimentoPerro1, alimentoPerro2, salsaPerro, alimentoPerro3, 
  casaPerro, bolsoMascota, contenedorComida, rascadorGato 
} from '../../hooks/useCarrito';
import './DetalleProducto.css';

const DetalleProducto = ({ 
  onLoginClick, 
  onProductosClick, 
  onNosotrosClick, 
  onBlogsClick, 
  onContactoClick,
  productoId,
  onBack,
  onDetalleProducto,
  onCarritoClick
}) => {
  const { agregarAlCarrito } = useCarrito();
  const [producto, setProducto] = useState(null);
  const [imagenPrincipal, setImagenPrincipal] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [productosRelacionados, setProductosRelacionados] = useState([]);

  const productos = {
    'alimento-perro-adulto-champion': {
      id: 'alimento-perro-adulto-champion',
      nombre: "Alimento para Perro Adulto Carne y Pollo 15 kg",
      precio: 20990,
      imagen: alimentoPerro1,
      imagenes: [alimentoPerro1, alimentoPerro1, alimentoPerro1],
      descripcion: 'Alimento premium para perros adultos con sabor a carne y pollo. Formulado con nutrientes esenciales para mantener a tu mascota saludable y llena de energía. Contiene vitaminas, minerales y antioxidantes para un sistema inmunológico fuerte.',
      categoria: "alimentos"
    },
    'alimento-perro-adulto-cachupin': {
      id: 'alimento-perro-adulto-cachupin',
      nombre: "Alimento para Perro Adulto Carne 25 kg",
      precio: 41990,
      imagen: alimentoPerro2,
      imagenes: [alimentoPerro2, alimentoPerro2, alimentoPerro2],
      descripcion: 'Alimento para perros adultos con alto contenido de proteína de carne. Ideal para razas grandes y perros activos. Ayuda a mantener una musculatura fuerte y un pelaje brillante.',
      categoria: "alimentos"
    },
    'salsa-perro': {
      id: 'salsa-perro',
      nombre: "Salsa para perro carne al jugo 300gr",
      precio: 1990,
      imagen: salsaPerro,
      imagenes: [salsaPerro, salsaPerro, salsaPerro],
      descripcion: 'Salsa deliciosa para complementar la alimentación de tu perro. Mejora el sabor del alimento seco y estimula el apetito. Elaborada con ingredientes naturales sin conservantes artificiales.',
      categoria: "alimentos"
    },
    'alimento-perro-adulto-3kg': {
      id: 'alimento-perro-adulto-3kg',
      nombre: "Alimento para Perro Adulto Carne pollo y vegetales 3 kg",
      precio: 8990,
      imagen: alimentoPerro3,
      imagenes: [alimentoPerro3, alimentoPerro3, alimentoPerro3],
      descripcion: 'Alimento balanceado para perros adultos con mezcla de carnes y vegetales. Proporciona nutrición completa para el día a día de tu mascota.',
      categoria: "alimentos"
    },
    'casa-perro': {
      id: 'casa-perro',
      nombre: "Casa de Perro 81.5x78.5x87.7 cm talla L",
      precio: 49990,
      imagen: casaPerro,
      imagenes: [casaPerro, casaPerro, casaPerro],
      descripcion: 'Casa resistente para perros de raza grande. Fabricada con materiales de alta calidad que protegen contra la intemperie. Diseño con base elevada para evitar la humedad y tejado inclinado para el desagüe de agua.',
      categoria: "accesorios"
    },
    'bolso-mascota': {
      id: 'bolso-mascota',
      nombre: "Bolso Transportador Para Mascota Gato Perros Multifuncional",
      precio: 39990,
      imagen: bolsoMascota,
      imagenes: [bolsoMascota, bolsoMascota, bolsoMascota],
      descripcion: 'Bolso transportador práctico y seguro para tus mascotas. Ideal para viajes al veterinario o paseos. Diseñado con ventilación adecuada y materiales resistentes.',
      categoria: "accesorios"
    },
    'contenedor-comida': {
      id: 'contenedor-comida',
      nombre: "Contenedor de comida para mascotas 20kg",
      precio: 16990,
      imagen: contenedorComida,
      imagenes: [contenedorComida, contenedorComida, contenedorComida],
      descripcion: 'Contenedor hermético para almacenar alimento de mascotas. Mantiene el alimento fresco y protegido de humedad e insectos. Capacidad para 20kg.',
      categoria: "accesorios"
    },
    'rascador-gato': {
      id: 'rascador-gato',
      nombre: "Rascador para gato 137 cm",
      precio: 32990,
      imagen: rascadorGato,
      imagenes: [rascadorGato, rascadorGato, rascadorGato],
      descripcion: 'Rascador alto para gatos con múltiples niveles. Incluye plataformas para descansar y jugar. Fabricado con materiales naturales y resistentes.',
      categoria: "accesorios"
    }
  };

  useEffect(() => {
    cargarProducto();
  }, [productoId]);

  const cargarProducto = () => {
    const productoSeleccionado = productos[productoId];
    if (productoSeleccionado) {
      setProducto(productoSeleccionado);
      setImagenPrincipal(productoSeleccionado.imagenes[0]);
      cargarProductosRelacionados(productoSeleccionado.categoria);
    }
  };

  const cargarProductosRelacionados = (categoria) => {
    const relacionados = Object.values(productos)
      .filter(prod => prod.categoria === categoria && prod.id !== productoId)
      .slice(0, 4);
    setProductosRelacionados(relacionados);
  };

  const cambiarImagen = (nuevaImagen) => {
    setImagenPrincipal(nuevaImagen);
  };

  const handleAgregarAlCarrito = () => {
    if (producto) {
      for (let i = 0; i < cantidad; i++) {
        agregarAlCarrito({
          ...producto,
          imagen: producto.imagenes[0]
        });
      }
      alert(`Se agregó ${cantidad} ${cantidad === 1 ? 'producto' : 'productos'} al carrito`);
    }
  };

  const handleProductoRelacionadoClick = (productoIdRelacionado) => {
    if (onDetalleProducto) {
      onDetalleProducto(productoIdRelacionado);
    } else {
      console.log('Navegando al producto:', productoIdRelacionado);

      window.location.reload();
    }
  };

  if (!producto) {
    return (
      <div className="detalle-producto-container">
        {/* ENCABEZADO */}
        <Encabezado 
          onLoginClick={onLoginClick}
          onProductosClick={onProductosClick}
          onNosotrosClick={onNosotrosClick}
          onBlogsClick={onBlogsClick}
          onContactoClick={onContactoClick}
          onCarritoClick={onCarritoClick}
        />
        <div className="loading">Cargando producto...</div>
      </div>
    );
  }

  return (
    <div className="detalle-producto-container">
      {/* ENCABEZADO */}
      <Encabezado 
        onLoginClick={onLoginClick}
        onProductosClick={onProductosClick}
        onNosotrosClick={onNosotrosClick}
        onBlogsClick={onBlogsClick}
        onContactoClick={onContactoClick}
        onCarritoClick={onCarritoClick}
      />

      {/* Detalle producto*/}
      <section className="product-detail">
        <div className="product-images">
          <div className="main-image">
            <img src={imagenPrincipal} alt={producto.nombre} />
          </div>
          <div className="thumbnail-images">
            {producto.imagenes.map((imagen, index) => (
              <div 
                key={index}
                className={`thumbnail ${imagen === imagenPrincipal ? 'active' : ''}`}
                onClick={() => cambiarImagen(imagen)}
              >
                <img src={imagen} alt={`Vista ${index + 1} de ${producto.nombre}`} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="product-info">
          <h1>{producto.nombre}</h1>
          <p className="price">${producto.precio.toLocaleString('es-CL')}</p>
          <p className="description">{producto.descripcion}</p>
          
          <div className="quantity">
            <label htmlFor="cantidad">Cantidad:</label>
            <input 
              type="number" 
              id="cantidad" 
              value={cantidad}
              min="1"
              max="10"
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            />
          </div>
          
          <button className="add-to-cart" onClick={handleAgregarAlCarrito}>
            Añadir al carrito
          </button>
        </div>
      </section>

      {/* Productos relacionados */}
      {productosRelacionados.length > 0 && (
        <section className="related">
          <h3>Productos Relacionados</h3>
          <div className="related-products">
            {productosRelacionados.map(productoRel => (
              <div 
                key={productoRel.id}
                className="related-product-card"
                onClick={() => handleProductoRelacionadoClick(productoRel.id)}
              >
                <div className="related-product-image">
                  <img src={productoRel.imagen} alt={productoRel.nombre} />
                </div>
                <div className="related-product-info">
                  <h4 className="related-product-title">
                    {productoRel.nombre.length > 50 
                      ? productoRel.nombre.substring(0, 50) + '...' 
                      : productoRel.nombre
                    }
                  </h4>
                  <p className="related-product-price">${productoRel.precio.toLocaleString('es-CL')}</p>
                  <button 
                    className="related-product-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      agregarAlCarrito(productoRel);
                      alert(`${productoRel.nombre} agregado al carrito`);
                    }}
                  >
                    Agregar al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DetalleProducto;