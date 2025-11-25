// src/utils/api.js - VERSIÓN COMPLETA ACTUALIZADA
const API_BASE_URL = 'http://localhost:8080/api';

const fetchAPI = async (url, options = {}) => {
  try {
    const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (user.username) {
      headers['Authorization'] = user.username;
    }

    const config = {
      headers,
      ...options,
    };

    if (options.body) {
      config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no se puede parsear JSON, usar mensaje por defecto
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return { success: true, message: 'Operación exitosa' };
    }
    
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API de Autenticación
export const authAPI = {
  login: async (username, password) => {
    return await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }
};

// API de Productos
export const productsAPI = {
  getAll: async () => {
    return await fetchAPI('/productos');
  },
  
  getById: async (id) => {
    return await fetchAPI(`/productos/${id}`);
  },
  
  getByCategory: async (category) => {
    return await fetchAPI(`/productos/categoria/${category}`);
  },
  
  create: async (product) => {
    return await fetchAPI('/productos', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },
  
  update: async (id, product) => {
    return await fetchAPI(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },
  
  delete: async (id) => {
    return await fetchAPI(`/productos/${id}`, {
      method: 'DELETE',
    });
  }
};

// API de Vendedor (NUEVO - ACTUALIZADO)
export const vendedorAPI = {
  // Productos
  crearProducto: async (productoData) => {
    return await fetchAPI('/vendedor/productos', {
      method: 'POST',
      body: JSON.stringify({
        nameProduct: productoData.nombre,
        productDescription: productoData.descripcion,
        priceProduct: parseFloat(productoData.precio),
        stockQuantity: parseInt(productoData.stock),
        categoria: productoData.categoria,
        imageLink: productoData.imagenUrl
      }),
    });
  },
  
  obtenerMisProductos: async () => {
    return await fetchAPI('/vendedor/productos/mis-productos');
  },
  
  actualizarProducto: async (id, productoData) => {
    return await fetchAPI(`/vendedor/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nameProduct: productoData.nombre,
        productDescription: productoData.descripcion,
        priceProduct: parseFloat(productoData.precio),
        stockQuantity: parseInt(productoData.stock),
        categoria: productoData.categoria,
        imageLink: productoData.imagenUrl
      }),
    });
  },
  
  eliminarProducto: async (id) => {
    return await fetchAPI(`/vendedor/productos/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Dashboard
  obtenerEstadisticas: async () => {
    return await fetchAPI('/vendedor/dashboard/estadisticas');
  }
};

// API de Administración
export const adminAPI = {
  getEstadisticas: async () => {
    return await fetchAPI('/admin/estadisticas');
  },
  
  getUsuarios: async () => {
    return await fetchAPI('/admin/usuarios');
  },
  
  getActividades: async () => {
    return await fetchAPI('/admin/actividades');
  }
};

// API de Usuarios (para futuro)
export const usersAPI = {
  getProfile: async (userId) => {
    return await fetchAPI(`/users/${userId}`);
  }
};

// 🆕 FUNCIÓN MEJORADA PARA FORMATEAR PRODUCTOS
export const formatProductForDisplay = (product) => {
  if (!product) return {};
  
  // 🆕 LÓGICA ROBUSTA PARA IMÁGENES
  let imagenUrl = '';
  
  // Prioridad 1: imageLink (campo PRINCIPAL con datos reales)
  if (product.imageLink && product.imageLink.startsWith('http')) {
    imagenUrl = product.imageLink;
  }
  // Prioridad 2: imagenUrl (secundario, aunque está NULL)
  else if (product.imagenUrl && product.imagenUrl.startsWith('http')) {
    imagenUrl = product.imagenUrl;
  }
  // Prioridad 3: Fallback con placeholder
  else {
    const nombre = product.nameProduct || 'Producto';
    imagenUrl = `https://via.placeholder.com/300x300/ff6b6b/ffffff?text=${encodeURIComponent(nombre)}`;
  }
  
  return {
    id: product.idProduct,
    nombre: product.nameProduct || product.nombre,
    descripcion: product.productDescription || product.description,
    precio: product.priceProduct || product.precio,
    stock: product.stockQuantity || product.stock,
    categoria: product.categoria,
    // 🆕 CRÍTICO: Mapear imageLink → imagen para compatibilidad
    imagen: imagenUrl,
    imagenUrl: imagenUrl,
    // 🆕 Mantener el campo original para referencia
    imageLink: product.imageLink,
    idVendedor: product.idVendedor
  };
};

// Función helper para formatear productos para el backend
export const formatProductForBackend = (product) => {
  return {
    nameProduct: product.nombre,
    productDescription: product.descripcion,
    priceProduct: product.precio,
    stockQuantity: product.stock,
    categoria: product.categoria,
    imageLink: product.imagenUrl
  };
};

export default {
  auth: authAPI,
  products: productsAPI,
  vendedor: vendedorAPI,
  admin: adminAPI,
  users: usersAPI,
  formatProductForDisplay,
  formatProductForBackend
};