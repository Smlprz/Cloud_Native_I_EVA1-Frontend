import React, { useState } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import './Contacto.css';

const Contacto = ({ onLoginClick, onProductosClick, onNosotrosClick, onBlogsClick, onCarritoClick }) => {
  
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    asunto: '',
    mensaje: ''
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación
    if (!formData.nombre || !formData.correo || !formData.asunto || !formData.mensaje) {
      alert('❌ Por favor completa todos los campos del formulario.');
      return;
    }

    // Simulacion envío formulario
    alert(`✅ Mensaje enviado exitosamente!\n\n📧 Recibirás una respuesta en: ${formData.correo}\n\nGracias por contactarnos, ${formData.nombre}. Te responderemos dentro de 24 horas.`);

    // Reseteo formulario
    setFormData({
      nombre: '',
      correo: '',
      asunto: '',
      mensaje: ''
    });
  };

  return (
    <div className="contacto-page">
      {/* ENCABEZADO SIMPLIFICADO*/}
      <Encabezado 
        onLoginClick={onLoginClick}
        onProductosClick={onProductosClick}
        onNosotrosClick={onNosotrosClick}
        onBlogsClick={onBlogsClick}
        onCarritoClick={onCarritoClick}
      />

      <main className="contacto-contenido">
        <div className="contacto-hero">
          <h1>Contáctanos</h1>
          <p>¿Tienes alguna pregunta? Estamos aquí para ayudarte</p>
        </div>

        <div className="contacto-grid">
          <div className="informacion-contacto">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>Nuestra Ubicación</h3>
              <p>Puerto Montt, Región de Los Lagos<br />Chile</p>
            </div>

            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3>Teléfono</h3>
              <p>+56 9 1234 5678</p>
              <p>Lunes a Viernes: 9:00 - 18:00</p>
            </div>

            <div className="info-card">
              <div className="info-icon">✉️</div>
              <h3>Email</h3>
              <p>info@tiendamascotas.com</p>
              <p>soporte@tiendamascotas.com</p>
            </div>

            <div className="info-card">
              <div className="info-icon">🕒</div>
              <h3>Horario de Atención</h3>
              <p>Lunes a Viernes: 9:00 - 18:00</p>
              <p>Sábados: 10:00 - 14:00</p>
            </div>
          </div>

          <div className="formulario-contacto">
            <div className="form-header">
              <div className="form-icon">📝</div>
              <h2>Formulario de Contacto</h2>
              <p>Completa el formulario y te responderemos a la brevedad</p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo *</label>
                <input 
                  id="nombre"
                  type="text" 
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu nombre completo"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="correo">Correo Electrónico *</label>
                <input 
                  id="correo"
                  type="email" 
                  value={formData.correo}
                  onChange={handleInputChange}
                  placeholder="tucorreo@ejemplo.com"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="asunto">Asunto *</label>
                <input 
                  id="asunto"
                  type="text" 
                  value={formData.asunto}
                  onChange={handleInputChange}
                  placeholder="¿Sobre qué quieres consultar?"
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="mensaje">Mensaje *</label>
                <textarea 
                  id="mensaje"
                  rows="5" 
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  placeholder="Describe tu consulta o mensaje..."
                  required 
                />
              </div>

              <button type="submit" className="submit-btn">
                📤 Enviar Mensaje
              </button>
            </form>
          </div>
        </div>

        <div className="contacto-extra">
          <div className="extra-content">
            <h3>¿Prefieres contactarnos directamente?</h3>
            <p>También puedes escribirnos directamente a nuestro WhatsApp para una respuesta más inmediata.</p>
            <button 
              className="whatsapp-btn"
              onClick={() => alert('📱 Abriendo WhatsApp...\n\nNúmero: +56 9 1234 5678\n\nEstaremos encantados de atenderte.')}
            >
              💬 Chatear por WhatsApp
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contacto;