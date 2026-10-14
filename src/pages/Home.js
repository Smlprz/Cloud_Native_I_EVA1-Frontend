import React from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import useCargar from '../hooks/useCargar';
import { useCarrito } from '../context/CarritoContext';
import ProductCard from '../components/ProductCard';
import Estado from '../components/Estado';
import hero from '../Img_productos/Mascotas.jpg';

export default function Home() {
  const { datos, cargando, error, recargar } = useCargar(() => api.productos.listar(), []);
  const { agregar, ocupado } = useCarrito();
  const destacados = (datos || []).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="hero-texto">
          <h1>Tienda para mascotas online</h1>
          <p>Alimento, accesorios y todo lo que tu mejor amigo necesita.</p>
          <Link to="/productos" className="btn btn-oscuro">Ver productos</Link>
        </div>
        <img src={hero} alt="Mascotas" className="hero-imagen" />
      </section>

      <section className="seccion">
        <h2>Destacados</h2>
        {cargando && <Estado tipo="cargando" texto="Cargando productos..." />}
        {error && (
          <Estado tipo="error" titulo="No se pudieron cargar los productos" texto={error}
            accion={{ texto: 'Reintentar', onClick: recargar }} />
        )}
        {!cargando && !error && (
          <div className="grilla">
            {destacados.map((p) => (
              <ProductCard key={p.id} producto={p} onAgregar={agregar} deshabilitado={ocupado} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
