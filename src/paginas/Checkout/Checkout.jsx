import React, { useState, useEffect } from 'react';
import Encabezado from '../../componentes/Encabezado/Encabezado';
import { useCarrito } from '../../context/CarritoContext';
import './Checkout.css';

const Checkout = ({ 
  onLoginClick, 
  onProductosClick, 
  onNosotrosClick, 
  onBlogsClick, 
  onContactoClick,
  onBack 
}) => {
  const { 
    carrito, 
    totalPrecio,
    limpiarCarrito 
  } = useCarrito();

  const [estadoPago, setEstadoPago] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    telefono: '',
    calle: '',
    departamento: '',
    region: 'Región Metropolitana de Santiago',
    comuna: 'Las Condes',
    indicaciones: ''
  });
  const numeroOrden = `#${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000)}`;
  const codigoOrden = `ORDER${Math.floor(Math.random() * 100000)}`;

  useEffect(() => {
    if (carrito.length === 0 && !estadoPago) {
      onProductosClick();
    }
  }, [carrito, estadoPago, onProductosClick]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    const { nombre, apellidos, correo, calle, telefono } = formData;
    
    if (!nombre.trim() || !apellidos.trim() || !correo.trim() || !calle.trim() || !telefono.trim()) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return false;
    }
    if (telefono.replace(/\D/g, '').length < 8) {
      return false;
    }

    return true;
  };

  const simularProcesoPago = () => {
    const esValido = validarFormulario();
    
    if (esValido && carrito.length > 0) {
      setTimeout(() => {
        setEstadoPago('exitoso');
        limpiarCarrito();
      }, 1500);
    } else {
      setEstadoPago('fallido');
    }
  };

  const handleImprimirPDF = () => {
  
    const contenidoBoleta = `
      🧾 BOLETA ELECTRÓNICA - TIENDA MASCOTAS
      
      Orden: ${numeroOrden}
      Código: ${codigoOrden}
      Fecha: ${new Date().toLocaleDateString('es-CL')}
      
      CLIENTE:
      ${formData.nombre} ${formData.apellidos}
      ${formData.correo}
      ${formData.telefono}
      
      DIRECCIÓN:
      ${formData.calle}${formData.departamento ? ', ' + formData.departamento : ''}
      ${formData.comuna}, ${formData.region}
      ${formData.indicaciones ? `Instrucciones: ${formData.indicaciones}` : ''}
      
      ¡Gracias por su compra!
      🐾 Tienda Mascotas
    `;

    alert('📄 Generando comprobante en PDF...\n\n' + contenidoBoleta);
  };

  const handleEnviarEmail = () => {
    alert(`📧 Comprobante enviado a: ${formData.correo}\n\nHemos enviado los detalles de su pedido al correo electrónico proporcionado.`);
  };

  const handleVolverAPagar = () => {
    setEstadoPago(null);
  };

  if (carrito.length === 0 && estadoPago !== 'exitoso') {
    return (
      <div className="checkout-page">
        <Encabezado 
          onLoginClick={onLoginClick}
          onProductosClick={onProductosClick}
          onNosotrosClick={onNosotrosClick}
          onBlogsClick={onBlogsClick}
          onContactoClick={onContactoClick}
          onCarritoClick={() => {}}
        />
        <div className="carrito-vacio-checkout">
          <h2>Carrito de compras vacío</h2>
          <p>No hay productos para procesar el pago</p>
          <button 
            className="btn-volver-productos"
            onClick={onProductosClick}
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Encabezado 
        onLoginClick={onLoginClick}
        onProductosClick={onProductosClick}
        onNosotrosClick={onNosotrosClick}
        onBlogsClick={onBlogsClick}
        onContactoClick={onContactoClick}
        onCarritoClick={() => {}}
      />

      <main className="checkout-main">
        <div className="checkout-container">
          
          {/* ESTADO DEL PAGO */}
          {estadoPago === 'exitoso' && (
            <div className="estado-pago exito">
              <div className="estado-icon">✅</div>
              <h2>¡Pago Realizado Exitosamente!</h2>
              <p className="numero-orden">Orden: {numeroOrden}</p>
              <p className="codigo-orden">Código de seguimiento: {codigoOrden}</p>
              <p className="mensaje-exito">Su compra ha sido procesada correctamente. Recibirá un correo de confirmación shortly.</p>
            </div>
          )}

          {estadoPago === 'fallido' && (
            <div className="estado-pago error">
              <div className="estado-icon">❌</div>
              <h2>Proceso de Pago Incompleto</h2>
              <p className="numero-orden">Orden: {numeroOrden}</p>
              <p className="mensaje-error">No pudimos procesar su pago. Por favor verifique la información e intente nuevamente.</p>
              <button 
                className="btn-volver-pagar"
                onClick={handleVolverAPagar}
              >
                REINTENTAR PAGO
              </button>
            </div>
          )}

          {/* FORMULARIO DE DATOS */}
          {(estadoPago === null || estadoPago === 'fallido') && carrito.length > 0 && (
            <div className="checkout-content">
              <div className="form-section-container">
                <h2 className="section-title">Información de Contacto</h2>
                <form className="checkout-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre *</label>
                      <input 
                        type="text" 
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="María"
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="apellidos">Apellidos *</label>
                      <input 
                        type="text" 
                        id="apellidos"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleInputChange}
                        placeholder="González"
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="correo">Correo Electrónico *</label>
                      <input 
                        type="email" 
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        placeholder="cliente@empresa.com"
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="telefono">Teléfono *</label>
                      <input 
                        type="tel" 
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="+56 9 1234 5678"
                        required 
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="form-section-container">
                <h2 className="section-title">Dirección de Entrega</h2>
                <form className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="calle">Dirección *</label>
                    <input 
                      type="text" 
                      id="calle"
                      name="calle"
                      value={formData.calle}
                      onChange={handleInputChange}
                      placeholder="Av. Principal 1234"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="departamento">Departamento / Oficina (Opcional)</label>
                    <input 
                      type="text" 
                      id="departamento"
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleInputChange}
                      placeholder="Departamento 501"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="region">Región *</label>
                      <select 
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                      >
                        <option>Región Metropolitana de Santiago</option>
                        <option>Región de Valparaíso</option>
                        <option>Región del Biobío</option>
                        <option>Región de Los Lagos</option>
                        <option>Región de Antofagasta</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="comuna">Comuna *</label>
                      <select 
                        id="comuna"
                        name="comuna"
                        value={formData.comuna}
                        onChange={handleInputChange}
                      >
                        <option>Las Condes</option>
                        <option>Providencia</option>
                        <option>Vitacura</option>
                        <option>Ñuñoa</option>
                        <option>La Reina</option>
                        <option>Lo Barnechea</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="indicaciones">Instrucciones de Entrega (Opcional)</label>
                    <textarea 
                      id="indicaciones"
                      name="indicaciones"
                      rows="3"
                      value={formData.indicaciones}
                      onChange={handleInputChange}
                      placeholder="Ej: Timbre 2 veces, entregar en recepción, horario de entrega preferido..."
                    />
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* RESUMEN DE COMPRA*/}
          {carrito.length > 0 && (
            <div className="resumen-section">
              <h2 className="section-title">Resumen de su Compra</h2>
              
              {/* TABLA DE PRODUCTOS */}
              <div className="table-container">
                <table className="productos-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio Unitario</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((producto, index) => {
                      const subtotal = (producto.precio || 0) * (producto.cantidad || 1);
                      return (
                        <tr key={`${producto.id}-${index}`}>
                          <td className="producto-info-cell">
                            <img 
                              src={producto.imagen} 
                              alt={producto.nombre}
                              className="producto-imagen-table"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/60x60?text=Producto';
                              }}
                            />
                            <span className="producto-nombre">{producto.nombre}</span>
                          </td>
                          <td>${(producto.precio || 0).toLocaleString('es-CL')}</td>
                          <td className="cantidad-cell">{producto.cantidad || 1}</td>
                          <td className="subtotal-cell">${subtotal.toLocaleString('es-CL')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* TOTAL SOLO SI HAY PRODUCTOS */}
              <div className="total-final-section">
                <div className="total-line">
                  <span><strong>Total:</strong></span>
                  <span className="total-amount">${totalPrecio.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>
          )}

          {/* BOTONES DE ACCIÓN */}
          <div className="acciones-section">
            {estadoPago === 'exitoso' ? (
              <div className="acciones-exito">
                <div className="acciones-info">
                  <p>¿Necesita una copia de su comprobante?</p>
                </div>
                <div className="acciones-botones">
                  <button 
                    className="btn-imprimir-pdf"
                    onClick={handleImprimirPDF}
                  >
                    📄 Descargar PDF
                  </button>
                  <button 
                    className="btn-enviar-email"
                    onClick={handleEnviarEmail}
                  >
                    📧 Enviar por Email
                  </button>
                </div>
              </div>
            ) : (
              carrito.length > 0 && (
                <div className="acciones-pago">
                  <button 
                    className="btn-procesar-pago"
                    onClick={simularProcesoPago}
                  >
                    CONFIRMAR Y PAGAR $${totalPrecio.toLocaleString('es-CL')}
                  </button>
                  <p className="seguridad-text">
                    🔒 Transacción segura - Sus datos están protegidos
                  </p>
                </div>
              )
            )}
          </div>

          {/* INFORMACIÓN DEL CLIENTE*/}
          {estadoPago === 'exitoso' && formData.nombre && (
            <div className="info-cliente-section">
              <h2 className="section-title">Detalles de su Pedido</h2>
              <div className="info-cliente-grid">
                <div className="info-cliente-col">
                  <h3>Información de Contacto</h3>
                  <div className="info-item">
                    <strong>Cliente:</strong> {formData.nombre} {formData.apellidos}
                  </div>
                  <div className="info-item">
                    <strong>Correo electrónico:</strong> {formData.correo}
                  </div>
                  <div className="info-item">
                    <strong>Teléfono:</strong> {formData.telefono}
                  </div>
                </div>
                <div className="info-cliente-col">
                  <h3>Dirección de Entrega</h3>
                  <div className="info-item">
                    <strong>Dirección:</strong> {formData.calle}
                    {formData.departamento && `, ${formData.departamento}`}
                  </div>
                  <div className="info-item">
                    <strong>Comuna:</strong> {formData.comuna}, {formData.region}
                  </div>
                  {formData.indicaciones && (
                    <div className="info-item">
                      <strong>Instrucciones:</strong> {formData.indicaciones}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Checkout;