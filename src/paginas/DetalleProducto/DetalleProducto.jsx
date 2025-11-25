import React, { useState, useEffect } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import { useCarrito } from '../../context/CarritoContext';
import { productsAPI, formatProductForDisplay } from '../../utils/api';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🆕 FUNCIÓN PARA OBTENER IMAGEN PRINCIPAL
  const obtenerImagenPrincipal = (producto) => {
    // Prioridad 1: imageLink (campo real de BD)
    if (producto.imageLink && producto.imageLink.startsWith('http')) {
      return producto.imageLink;
    }
    // Prioridad 2: imagen (para compatibilidad)
    else if (producto.imagen && producto.imagen.startsWith('http')) {
      return producto.imagen;
    }
    // Prioridad 3: imagenUrl (aunque está NULL en BD)
    else if (producto.imagenUrl && producto.imagenUrl.startsWith('http')) {
      return producto.imagenUrl;
    }
    // Prioridad 4: Fallback
    else {
      const nombre = producto.nameProduct || producto.nombre || 'Producto';
      return `https://via.placeholder.com/500x500/ff6b6b/ffffff?text=${encodeURIComponent(nombre)}`;
    }
  };

  // Cargar producto desde la base de datos
  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setLoading(true);
        const productoData = await productsAPI.getById(productoId);
        console.log('Producto cargado desde BD:', productoData);
        
        // 🆕 FORMATEAR PRODUCTO ANTES DE USAR
        const productoFormateado = formatProductForDisplay(productoData);
        setProducto(productoFormateado);
        
        // 🆕 USAR FUNCIÓN MEJORADA PARA IMAGEN
        const imagenPrincipal = obtenerImagenPrincipal(productoFormateado);
        setImagenPrincipal(imagenPrincipal);
        
        // Cargar productos relacionados de la misma categoría
        if (productoFormateado.categoria) {
          const relacionados = await productsAPI.getByCategory(productoFormateado.categoria);
          const relacionadosFormateados = relacionados.map(prod => formatProductForDisplay(prod));
          const filtrados = relacionadosFormateados.filter(prod => prod.id !== productoId).slice(0, 4);
          setProductosRelacionados(filtrados);
        }
        
      } catch (err) {
        console.error('Error al cargar producto:', err);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    if (productoId) {
      cargarProducto();
    }
  }, [productoId]);

  const cambiarImagen = (nuevaImagen) => {
    setImagenPrincipal(nuevaImagen);
  };

  const handleAgregarAlCarrito = () => {
    if (producto) {
      for (let i = 0; i < cantidad; i++) {
        agregarAlCarrito({
          ...producto,
          imagen: obtenerImagenPrincipal(producto),
          precio: typeof producto.precio === 'number' ? producto.precio : Number(producto.precio)
        });
      }
      alert(`Se agregó ${cantidad} ${cantidad === 1 ? 'producto' : 'productos'} al carrito`);
    }
  };

  const handleProductoRelacionadoClick = (productoIdRelacionado) => {
    if (onDetalleProducto) {
      onDetalleProducto(productoIdRelacionado);
    }
  };

  if (loading) {
    return (
      <div className="detalle-producto-container">
        <Encabezado 
          onLoginClick={onLoginClick}
          onProductosClick={onProductosClick}
          onNosotrosClick={onNosotrosClick}
          onBlogsClick={onBlogsClick}
          onContactoClick={onContactoClick}
          onCarritoClick={onCarritoClick}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="detalle-producto-container">
        <Encabezado 
          onLoginClick={onLoginClick}
          onProductosClick={onProductosClick}
          onNosotrosClick={onNosotrosClick}
          onBlogsClick={onBlogsClick}
          onContactoClick={onContactoClick}
          onCarritoClick={onCarritoClick}
        />
        <div className="error-container">
          <p className="error-message">{error || 'Producto no encontrado'}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // 🆕 OBTENER DATOS CON COMPATIBILIDAD
  const nombre = producto.nombre || producto.nameProduct;
  const precio = producto.precio || producto.priceProduct;
  const descripcion = producto.descripcion || producto.productDescription;
  const stock = producto.stock || producto.stockQuantity;

  return (
    <div className="detalle-producto-container">
      <Encabezado 
        onLoginClick={onLoginClick}
        onProductosClick={onProductosClick}
        onNosotrosClick={onNosotrosClick}
        onBlogsClick={onBlogsClick}
        onContactoClick={onContactoClick}
        onCarritoClick={onCarritoClick}
      />

      <section className="product-detail">
        <div className="product-images">
          <div className="main-image">
            <img 
              src={imagenPrincipal} 
              alt={nombre}
              onError={(e) => {
                const nombre = producto.nombre || producto.nameProduct || 'Producto';
                e.target.src = `https://via.placeholder.com/500x500/ff6b6b/ffffff?text=${encodeURIComponent(nombre)}`;
              }}
            />
          </div>
        </div>
        
        <div className="product-info">
          <h1>{nombre}</h1>
          <p className="price">${(typeof precio === 'number' ? precio : Number(precio)).toLocaleString('es-CL')}</p>
          <p className="description">{descripcion || 'Descripción no disponible'}</p>
          <p className="stock">Stock disponible: {stock || 0} unidades</p>
          
          <div className="quantity">
            <label htmlFor="cantidad">Cantidad:</label>
            <input 
              type="number" 
              id="cantidad" 
              value={cantidad}
              min="1"
              max={stock || 10}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            />
          </div>
          
          <button 
            className="add-to-cart" 
            onClick={handleAgregarAlCarrito}
            disabled={!stock || stock === 0}
          >
            {(!stock || stock === 0) ? 'Sin Stock' : 'Añadir al carrito'}
          </button>
        </div>
      </section>

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
                  <img 
                    src={obtenerImagenPrincipal(productoRel)} 
                    alt={productoRel.nombre || productoRel.nameProduct}
                    onError={(e) => {
                      const nombre = productoRel.nombre || productoRel.nameProduct || 'Producto';
                      e.target.src = `https://via.placeholder.com/200x200/ff6b6b/ffffff?text=${encodeURIComponent(nombre)}`;
                    }}
                  />
                </div>
                <div className="related-product-info">
                  <h4 className="related-product-title">
                    {(productoRel.nombre || productoRel.nameProduct || '').length > 50 
                      ? (productoRel.nombre || productoRel.nameProduct).substring(0, 50) + '...' 
                      : (productoRel.nombre || productoRel.nameProduct)
                    }
                  </h4>
                  <p className="related-product-price">
                    ${(typeof productoRel.precio === 'number' ? productoRel.precio : Number(productoRel.precio)).toLocaleString('es-CL')}
                  </p>
                  <button 
                    className="related-product-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      agregarAlCarrito({
                        ...productoRel,
                        imagen: obtenerImagenPrincipal(productoRel),
                        precio: typeof productoRel.precio === 'number' ? productoRel.precio : Number(productoRel.precio)
                      });
                      alert(`${productoRel.nombre || productoRel.nameProduct} agregado al carrito`);
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