import React, { useMemo, useState } from 'react';
import api from '../api/client';
import useCargar from '../hooks/useCargar';
import { useCarrito } from '../context/CarritoContext';
import ProductCard from '../components/ProductCard';
import Estado from '../components/Estado';

export default function Products() {
  const { datos, cargando, error, recargar } = useCargar(() => api.productos.listar(), []);
  const { agregar, ocupado } = useCarrito();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');

  const productos = useMemo(() => datos || [], [datos]);
  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoria).filter(Boolean))].sort(),
    [productos]
  );
  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter(
      (p) =>
        (!categoria || p.categoria === categoria) &&
        (!texto || p.nombre.toLowerCase().includes(texto))
    );
  }, [productos, busqueda, categoria]);

  return (
    <section className="seccion">
      <h1>Productos</h1>

      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar producto..."
          aria-label="Buscar producto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoria">
          <option value="">Todas las categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {cargando && <Estado tipo="cargando" texto="Cargando productos..." />}
      {error && (
        <Estado tipo="error" titulo="No se pudieron cargar los productos" texto={error}
          accion={{ texto: 'Reintentar', onClick: recargar }} />
      )}
      {!cargando && !error && visibles.length === 0 && (
        <Estado tipo="info" titulo="Sin resultados" texto="Prueba con otra busqueda o categoria." />
      )}
      {!cargando && !error && visibles.length > 0 && (
        <div className="grilla">
          {visibles.map((p) => (
            <ProductCard key={p.id} producto={p} onAgregar={agregar} deshabilitado={ocupado} />
          ))}
        </div>
      )}
    </section>
  );
}
