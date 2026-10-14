import React from 'react';

/** Evita la pantalla en blanco: si una vista falla al renderizar, muestra un mensaje y un boton. */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fallo: false };
  }

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  componentDidCatch(error) {
    console.error('Error de interfaz:', error);
  }

  render() {
    if (!this.state.fallo) return this.props.children;
    return (
      <div className="estado estado-error" role="alert">
        <h2>Algo salio mal</h2>
        <p>Ocurrio un error inesperado al mostrar esta pantalla.</p>
        <button type="button" className="btn" onClick={() => window.location.assign('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }
}
