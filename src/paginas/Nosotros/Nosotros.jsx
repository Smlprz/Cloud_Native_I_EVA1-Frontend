import React from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import './Nosotros.css';

const Nosotros = ({ onLoginClick, onProductosClick, onNosotrosClick, onBlogsClick, onContactoClick, onCarritoClick }) => {


  return (
    <div className="nosotros-page">
      {/* ENCABEZADO */}
      <Encabezado 
        onLoginClick={onLoginClick}
        onProductosClick={onProductosClick}
        onNosotrosClick={onNosotrosClick}
        onBlogsClick={onBlogsClick}
        onContactoClick={onContactoClick}
        onCarritoClick={onCarritoClick}
      />
      
      <div className="nosotros-contenido">
        <div className="nosotros-hero">
          <h1>Sobre Nosotros</h1>
          <p>Tu tienda de confianza para mascotas en Puerto Montt</p>
        </div>

        <div className="nosotros-secciones">
          <section className="nosotros-seccion">
            <div className="seccion-contenido">
              <h2>¿Quiénes Somos?</h2>
              <p>
                Somos una tienda especializada en productos para gatos y perros situada 
                en Puerto Montt, Chile en la región de Los Lagos. Nos dedicamos a brindar 
                la mejor calidad y servicio para tus mascotas.
              </p>
            </div>
          </section>

          <section className="nosotros-seccion">
            <div className="seccion-contenido">
              <h2>¿Qué Vendemos?</h2>
              <p>Ofrecemos una amplia variedad de productos para el cuidado y entretenimiento de tus mascotas:</p>
              <div className="productos-grid">
                <div className="producto-item">
                  <div className="producto-icon">🐕</div>
                  <h3>Alimentos</h3>
                  <p>Comida premium para gatos y perros de todas las edades</p>
                </div>
                <div className="producto-item">
                  <div className="producto-icon">🎾</div>
                  <h3>Juguetes</h3>
                  <p>Juguetes interactivos y divertidos para mantener activas a tus mascotas</p>
                </div>
                <div className="producto-item">
                  <div className="producto-icon">🏠</div>
                  <h3>Accesorios</h3>
                  <p>Collares, camas, casas y todo lo necesario para su comodidad</p>
                </div>
              </div>
            </div>
          </section>

          <section className="nosotros-seccion">
            <div className="seccion-contenido">
              <h2>Nuestra Historia</h2>
              <p>
                Nuestra empresa nació en 2024 con el fin de llenar un vacío en el mercado 
                de mascotas después de que muchos negocios pequeños cerraran debido a la 
                crisis económica post pandemia.
              </p>
              <p>
                Nos enfocamos en ofrecer productos de la más alta calidad para tus mascotas 
                a precios accesibles, porque creemos que todos merecen lo mejor para sus 
                compañeros peludos.
              </p>
            </div>
          </section>

          <section className="nosotros-seccion mision-vision">
            <div className="valores-grid">
              <div className="valor-item">
                <h3>🎯 Misión</h3>
                <p>
                  Proporcionar productos de calidad que mejoren la vida de las mascotas 
                  y faciliten el cuidado responsable por parte de sus dueños.
                </p>
              </div>
              <div className="valor-item">
                <h3>👁️ Visión</h3>
                <p>
                  Ser la tienda de mascotas líder en Puerto Montt, reconocida por nuestra 
                  calidad, servicio y compromiso con el bienestar animal.
                </p>
              </div>
              <div className="valor-item">
                <h3>💙 Valores</h3>
                <p>
                  Calidad, confianza, responsabilidad y amor por los animales. Cada producto 
                  es seleccionado pensando en el bienestar de tu mascota.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Nosotros;