// src/paginas/Vendedor/VendedorCrearProducto.jsx
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

// En VendedorCrearProducto.jsx - actualizar el handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // Validaciones
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

  return (
    <div className="crear-producto">
      <div className="page-header">
        <h1>Crear Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="producto-form">
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
            placeholder="Describe tu producto..."
            rows="3"
            disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
            disabled={loading}
            required
          >
            <option value="alimentos">Alimentos</option>
            <option value="accesorios">Accesorios</option>
            <option value="juguetes">Juguetes</option>
            <option value="salud">Salud e Higiene</option>
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
            disabled={loading}
          />
          {formData.imagenUrl && (
            <div className="image-preview">
              <img src={formData.imagenUrl} alt="Vista previa" 
                   onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
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
            onClick={() => onNavigate('vendedor-productos')}
            disabled={loading}
          >
            ↩️ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendedorCrearProducto;