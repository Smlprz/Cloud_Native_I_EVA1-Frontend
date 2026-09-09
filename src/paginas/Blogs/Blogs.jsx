import React from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import './Blogs.css';
import gatoAcostado from '../../Img_productos/gato_acostado.jpg';
import perroAsomando from '../../Img_productos/Perro_asomando.jpg';
import perroAlegre from '../../Img_productos/perro_alegre.jpg';

const Blogs = ({ onLoginClick, onProductosClick, onNosotrosClick, onBlogsClick, onContactoClick, onCarritoClick }) => {

  const noticias = [
    {
      id: 1,
      titulo: "CASO CURIOSO #1",
      descripcion: "En Pets Store, el producto más vendido en 2024 fueron los juguetes interactivos para gatos 🐱. Superaron incluso a los snacks para perros.",
      imagen: "gato-jugando",
      imagenSrc: gatoAcostado,
      contenido: "📌 Detalle del Caso Curioso #1:\n\nLos juguetes interactivos para gatos fueron el producto más vendido en 2024, superando incluso a los snacks para perros. Esto demuestra la creciente preocupación de los dueños por el entretenimiento y bienestar mental de sus felinos."
    },
    {
      id: 2,
      titulo: "CASO CURIOSO #2",
      descripcion: "Muchos clientes nos cuentan que sus perros 🐕 esperan junto a la puerta cuando llega el repartidor, ¡como si supieran que el paquete es para ellos!",
      imagen: "perro-esperando",
      imagenSrc: perroAsomando,
      contenido: "📌 Detalle del Caso Curioso #2:\n\nMuchos clientes nos cuentan que sus perros reconocen al repartidor y esperan ansiosos la llegada de su paquete de Pets Store. Algunos incluso han aprendido a asociar el sonido del vehículo de reparto con la llegada de sus nuevos juguetes y snacks."
    },
    {
      id: 3,
      titulo: "CONSEJO DEL MES",
      descripcion: "¿Sabías que el cepillado regular no solo mantiene el pelaje de tu mascota brillante, sino que también fortalece el vínculo entre ustedes? 🐾",
      imagen: "mascota-cepillado",
      contenido: "💡 Consejo Profesional:\n\nEl cepillado regular es esencial para:\n• Eliminar pelo muerto y prevenir bolas de pelo\n• Distribuir los aceites naturales de la piel\n• Detectar tempranamente problemas de piel\n• Fortalecer el vínculo con tu mascota\n\nRecomendamos cepillar al menos 2-3 veces por semana."
    },
    {
      id: 4,
      titulo: "NUEVO PRODUCTO",
      descripcion: "¡Lanzamos nuestra nueva línea de snacks orgánicos para mascotas! Hechos con ingredientes 100% naturales y sin conservantes artificiales. 🌱",
      imagen: "snacks-organicos",
      imagenSrc: perroAlegre,
      contenido: "🎉 ¡Gran Noticia!\n\nNueva línea de snacks orgánicos:\n• Ingredientes 100% naturales\n• Sin conservantes artificiales\n• Disponible para perros y gatos\n• Sabores: Pollo, Salmón y Res\n• Envases reciclables\n\n¡Tu mascota merece lo mejor!"
    }
  ];

  const handleVerCaso = (noticia) => {
    alert(noticia.contenido);
  };

  return (
    <div className="blogs-page">
      <Encabezado 
        onLoginClick={onLoginClick}
        onProductosClick={onProductosClick}
        onNosotrosClick={onNosotrosClick}
        onBlogsClick={onBlogsClick}
        onContactoClick={onContactoClick}
        onCarritoClick={onCarritoClick}
      />

      <main className="blogs-contenido">
        <div className="blogs-hero">
          <h1>Blog & Noticias</h1>
          <p>Descubre historias curiosas, consejos útiles y las últimas novedades del mundo mascotero</p>
        </div>

        <div className="noticias-grid">
          {noticias.map(noticia => (
            <article key={noticia.id} className="noticia-card">
              <div className="noticia-imagen">
                {noticia.imagenSrc ? (
                 
                  <img 
                    src={noticia.imagenSrc} 
                    alt={noticia.titulo}
                    className="noticia-imagen-real"
                  />
                ) : (
                  <div className={`imagen-placeholder ${noticia.imagen}`}>
                    {noticia.id === 3 && '🐾'}
                  </div>
                )}
              </div>
              
              <div className="noticia-contenido">
                <h3>{noticia.titulo}</h3>
                <p>{noticia.descripcion}</p>
                <div className="noticia-acciones">
                  <button 
                    className="btn-ver-caso"
                    onClick={() => handleVerCaso(noticia)}
                  >
                    Leer Más
                  </button>
                  <span className="noticia-fecha">
                    {noticia.id === 4 ? '¡Nuevo!' : 'Hace 2 días'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="newsletter-section">
          <div className="newsletter-content">
            <h2>📬 No te pierdas ninguna noticia</h2>
            <p>Suscríbete a nuestro newsletter y recibe los artículos más interesantes directamente en tu email</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="tucorreo@ejemplo.com"
                className="newsletter-input"
              />
              <button 
                className="newsletter-btn"
                onClick={() => alert('🎉 ¡Gracias por suscribirte! Recibirás nuestras próximas noticias.')}
              >
                Suscribirse
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blogs;