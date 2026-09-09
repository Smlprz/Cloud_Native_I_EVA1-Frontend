import React, { useState, useEffect } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import { useCarrito } from '../../context/CarritoContext';
import { productsAPI, formatProductForDisplay } from '../../utils/api';
import { PLACEHOLDER } from '../../utils/imagenes';
import './DetalleProducto.css';

const DetalleProducto = ({
  onLoginClick,
  onProductosClick,
  onNosotrosClick,
  onBlogsClick,
  onContactoClick,
  productoId,
  onDetalleProducto,
  onCarritoClick,
}) => {
  const { agregarAlCarrito } = useCarrito();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [relacionados, setRelacionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getById(productoId);
        const formateado = formatProductForDisplay(data);
        setProducto(formateado);

        if (formateado.categoria) {
          const misma = await productsAPI.getByCategoria(formateado.categoria);
          setRelacionados(
            misma
              .map(formatProductForDisplay)
              .filter((p) => p.id !== formateado.id)
              .slice(0, 4)
          );
        }
      } catch (err) {
        console.error('Error al cargar producto:', err);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    if (productoId) cargar();
  }, [productoId]);

  const cabecera = (
    <Encabezado
      onLoginClick={onLoginClick}
      onProductosClick={onProductosClick}
      onNosotrosClick={onNosotrosClick}
      onBlogsClick={onBlogsClick}
      onContactoClick={onContactoClick}
      onCarritoClick={onCarritoClick}
    />
  );

  if (loading) {
    return (
      <div className="detalle-producto-container">
        {cabecera}
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
        {cabecera}
        <div className="error-container">
          <p className="error-message">{error || 'Producto no encontrado'}</p>
          <button className="retry-button" onClick={onProductosClick}>
            Volver al catalogo
          </button>
        </div>
      </div>
    );
  }

  const sinStock = !producto.stock || producto.stock === 0;

  return (
    <div className="detalle-producto-container">
      {cabecera}

      <section className="product-detail">
        <div className="product-images">
          <div className="main-image">
            <img
              src={producto.imagen || PLACEHOLDER}
              alt={producto.nombre}
              onError={(e) => {
                e.target.src = PLACEHOLDER;
              }}
            />
          </div>
        </div>

        <div className="product-info">
          <h1>{producto.nombre}</h1>
          <p className="price">${producto.precio.toLocaleString('es-CL')}</p>
          <p className="description">{producto.descripcion || 'Descripcion no disponible'}</p>
          <p className="stock">Stock disponible: {producto.stock || 0} unidades</p>

          <div className="quantity">
            <label htmlFor="cantidad">Cantidad:</label>
            <input
              type="number"
              id="cantidad"
              value={cantidad}
              min="1"
              max={producto.stock || 10}
              onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 1)}
            />
          </div>

          <button
            className="add-to-cart"
            onClick={() => agregarAlCarrito(producto, cantidad)}
            disabled={sinStock}
          >
            {sinStock ? 'Sin Stock' : 'Anadir al carrito'}
          </button>
        </div>
      </section>

      {relacionados.length > 0 && (
        <section className="related">
          <h3>Productos Relacionados</h3>
          <div className="related-products">
            {relacionados.map((rel) => (
              <div
                key={rel.id}
                className="related-product-card"
                onClick={() => onDetalleProducto && onDetalleProducto(rel.id)}
              >
                <div className="related-product-image">
                  <img
                    src={rel.imagen || PLACEHOLDER}
                    alt={rel.nombre}
                    onError={(e) => {
                      e.target.src = PLACEHOLDER;
                    }}
                  />
                </div>
                <div className="related-product-info">
                  <h4 className="related-product-title">{rel.nombre}</h4>
                  <p className="related-product-price">
                    ${rel.precio.toLocaleString('es-CL')}
                  </p>
                  <button
                    className="related-product-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      agregarAlCarrito(rel);
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
