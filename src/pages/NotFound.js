import React from 'react';
import { useNavigate } from 'react-router-dom';
import Estado from '../components/Estado';

export default function NotFound() {
  const navegar = useNavigate();
  return (
    <Estado
      tipo="info"
      titulo="Pagina no encontrada"
      texto="La direccion no existe."
      accion={{ texto: 'Volver al inicio', onClick: () => navegar('/') }}
    />
  );
}
