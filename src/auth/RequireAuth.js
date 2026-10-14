import React from 'react';
import { useAuth } from './AuthContext';
import Estado from '../components/Estado';

/**
 * Protege una pantalla. No redirige solo (evita bucles de login): muestra un aviso con el boton.
 *   <RequireAuth>                      -> basta con tener sesion
 *   <RequireAuth roles={['ADMIN']}>    -> ademas exige alguno de esos roles
 * La seguridad real la aplica el backend; esto solo evita mostrar pantallas inutiles.
 */
export default function RequireAuth({ roles, children }) {
  const { listo, autenticado, tieneRol, roles: misRoles, login } = useAuth();

  if (!listo) return <Estado tipo="cargando" texto="Verificando sesion..." />;

  if (!autenticado) {
    return (
      <Estado
        tipo="info"
        titulo="Inicia sesion para continuar"
        texto="Esta seccion requiere una cuenta."
        accion={{ texto: 'Iniciar sesion con Microsoft', onClick: login }}
      />
    );
  }

  // El perfil (roles) llega un instante despues del login: no mostrar "sin permiso" antes de tiempo.
  if (roles && roles.length && misRoles.length === 0) {
    return <Estado tipo="cargando" texto="Cargando permisos..." />;
  }

  if (roles && roles.length && !tieneRol(...roles)) {
    return (
      <Estado
        tipo="error"
        titulo="Sin permiso"
        texto={`Esta seccion es solo para: ${roles.join(' / ')}.`}
      />
    );
  }

  return children;
}
