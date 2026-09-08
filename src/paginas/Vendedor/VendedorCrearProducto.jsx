import React, { useState } from 'react';
import { vendedorAPI } from '../../utils/api';
import './VendedorCrearProducto.css';

const VendedorCrearProducto = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: 'alimentos',
    imagenUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.nombre.length > 30) {
      setError('El nombre no puede exceder 30 caracteres');
      setLoading(false);
      return;
    }

    if (!formData.imagenUrl) {
      setError('La URL de la imagen es requerida');
      setLoading(false);
      return;
    }

    try {
      const response = await vendedorAPI.crearProducto(formData);
      
      if (response.success) {
        alert('✅ Producto creado exitosamente');
        onNavigate('vendedor-productos');
      } else {
        setError(response.message || 'Error al crear producto');
      }
    } catch (err) {
      setError('Error al crear producto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán.')) {
      onNavigate('vendedor-productos');
    }
  };

  const handleClearForm = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar el formulario?')) {
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: 'alimentos',
        imagenUrl: ''
      });
      setError('');
    }
  };

  return (
    <div className="crear-producto">
      <div className="page-header">
        <div className="header-content">
          <h1>Crear Nuevo Producto</h1>
          <p>Completa la información para agregar un nuevo producto al catálogo</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => onNavigate('vendedor-productos')}
          >
            📦 Ver Productos
          </button>
          <button 
            className="btn-back"
            onClick={() => onNavigate('sales-dashboard')}
          >
            📊 Dashboard
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="producto-form">
        <div className="form-section">
          <h3>📝 Información Básica</h3>
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
              disabled={loading}
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
              placeholder="Describe las características, beneficios y especificaciones de tu producto..."
              rows="4"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>💰 Precio y Stock</h3>
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
                disabled={loading}
              />
              <small>Precio en dólares</small>
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
                disabled={loading}
              />
              <small>Cantidad disponible</small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>🏷️ Categoría e Imagen</h3>
          <div className="form-group">
            <label htmlFor="categoria">Categoría *</label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="alimentos">🍖 Alimentos</option>
              <option value="accesorios">🐕 Accesorios</option>
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
              placeholder="https://ejemplo.com/imagen-producto.jpg"
              required
              disabled={loading}
            />
            <small>Enlace a una imagen de alta calidad del producto</small>
            {formData.imagenUrl && (
              <div className="image-preview">
                <img src={formData.imagenUrl} alt="Vista previa" 
                     onError={(e) => {
                       e.target.style.display = 'none';
                       setError('Error al cargar la imagen. Verifica la URL.');
                     }} />
              </div>
            )}
          </div>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        <div className="form-actions">
          <div className="primary-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Creando Producto...' : '✅ Crear Producto'}
            </button>
            
            <button 
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              ↩️ Cancelar
            </button>
          </div>
          
          <div className="secondary-actions">
            <button 
              type="button"
              className="btn-clear"
              onClick={handleClearForm}
              disabled={loading}
            >
              🗑️ Limpiar Formulario
            </button>
            
            <button 
              type="button"
              className="btn-back"
              onClick={() => onNavigate('inicio')}
              disabled={loading}
            >
              🏠 Ir al Inicio
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VendedorCrearProducto;