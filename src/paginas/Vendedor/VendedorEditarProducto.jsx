import React, { useState, useEffect } from 'react';
import { vendedorAPI, productsAPI } from '../../utils/api';
import './VendedorEditarProducto.css';

const VendedorEditarProducto = ({ onNavigate, productoId }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: 'alimentos',
    imagenUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [productoOriginal, setProductoOriginal] = useState(null);

  useEffect(() => {
    if (productoId) {
      cargarProducto();
    }
  }, [productoId]);

  const cargarProducto = async () => {
    try {
      setLoading(true);

      const producto = await productsAPI.getById(productoId);
      
      const misProductos = await vendedorAPI.obtenerMisProductos();
      const esMiProducto = misProductos.data?.some(p => p.idProduct === productoId);
      
      if (!esMiProducto) {
        setError('No tienes permisos para editar este producto');
        return;
      }

      setProductoOriginal(producto);
      setFormData({
        nombre: producto.nameProduct || producto.nombre || '',
        descripcion: producto.productDescription || producto.descripcion || '',
        precio: producto.priceProduct || producto.precio || '',
        stock: producto.stockQuantity || producto.stock || '',
        categoria: producto.categoria || 'alimentos',
        imagenUrl: producto.imageLink || producto.imagenUrl || ''
      });
    } catch (err) {
      setError('Error al cargar producto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');


    if (formData.nombre.length > 30) {
      setError('El nombre no puede exceder 30 caracteres');
      setSaving(false);
      return;
    }

    if (!formData.imagenUrl) {
      setError('La URL de la imagen es requerida');
      setSaving(false);
      return;
    }

    try {
      const productoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        categoria: formData.categoria,
        imagenUrl: formData.imagenUrl
      };

      const response = await vendedorAPI.actualizarProducto(productoId, productoData);
      
      if (response.success) {
        alert('✅ Producto actualizado exitosamente');
        onNavigate('vendedor-productos');
      } else {
        setError(response.message || 'Error al actualizar producto');
      }
    } catch (err) {
      setError('Error al actualizar producto: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.')) {
      onNavigate('vendedor-productos');
    }
  };

  if (loading) return <div className="loading">Cargando producto...</div>;
  if (error && !productoOriginal) return <div className="error">{error}</div>;

  return (
    <div className="editar-producto">
      <div className="page-header">
        <h1>Editar Producto</h1>
        <p>Modifica la información de tu producto</p>
      </div>

      {productoOriginal && (
        <form onSubmit={handleSubmit} className="producto-form">
          <div className="form-preview">
            <div className="preview-card">
              <h3>Vista Previa</h3>
              <div className="preview-image">
                <img 
                  src={formData.imagenUrl} 
                  alt="Vista previa" 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x200?text=Imagen+No+Disponible';
                  }}
                />
              </div>
              <div className="preview-info">
                <h4>{formData.nombre || 'Nombre del producto'}</h4>
                <p className="preview-categoria">{formData.categoria}</p>
                <p className="preview-precio">
                  ${formData.precio ? parseFloat(formData.precio).toLocaleString() : '0'}
                </p>
                <p className="preview-stock">
                  Stock: {formData.stock || '0'} unidades
                </p>
              </div>
            </div>
          </div>

          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="nombre">Nombre del Producto *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Alimento para Perro Premium"
                maxLength={30}
                required
                disabled={saving}
              />
              <small>Máximo 30 caracteres ({formData.nombre.length}/30)</small>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe tu producto..."
                rows="4"
                disabled={saving}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="precio">Precio *</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoría *</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                disabled={saving}
                required
              >
                <option value="alimentos">Alimentos</option>
                <option value="accesorios">Accesorios</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="imagenUrl">URL de Imagen *</label>
              <input
                type="url"
                id="imagenUrl"
                name="imagenUrl"
                value={formData.imagenUrl}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                required
                disabled={saving}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={saving}
            >
              {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>
            
            <button 
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              ↩️ Cancelar
            </button>

            <button 
              type="button"
              className="btn-danger"
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
                  vendedorAPI.eliminarProducto(productoId)
                    .then(() => {
                      alert('Producto eliminado exitosamente');
                      onNavigate('vendedor-productos');
                    })
                    .catch(err => {
                      alert('Error al eliminar producto: ' + err.message);
                    });
                }
              }}
              disabled={saving}
            >
              🗑️ Eliminar Producto
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VendedorEditarProducto;