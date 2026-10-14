// Configuracion unica del frontend. Todo viene de variables REACT_APP_* (ver .env.example).

const env = process.env;

// URL del API Gateway incluyendo el stage, sin barra final.
//   https://<id>.execute-api.<region>.amazonaws.com/prod
export const API_BASE = (env.REACT_APP_API_BASE || '').replace(/\/+$/, '');

export const AZURE = {
  clientId: env.REACT_APP_AZURE_CLIENT_ID || '',
  tenantId: env.REACT_APP_AZURE_TENANT_ID || 'common',
};

export const azureConfigurado = Boolean(AZURE.clientId);

// Scopes de la API (app pedidos360-api). Se piden todos al iniciar sesion para no
// volver a pedir consentimiento mas adelante. Se pueden sobreescribir por variable.
const RECURSO = `api://${AZURE.clientId}`;
const SCOPES_POR_DEFECTO = [
  'productos.read',
  'productos.write',
  'carrito.read',
  'carrito.write',
  'ordenes.read',
  'ordenes.write',
  'resenas.read',
  'resenas.write',
].map((s) => `${RECURSO}/${s}`);

export const SCOPES = (env.REACT_APP_AZURE_API_SCOPES || '').split(/\s+/).filter(Boolean).length
  ? env.REACT_APP_AZURE_API_SCOPES.split(/\s+/).filter(Boolean)
  : SCOPES_POR_DEFECTO;

// Panel web propio de RabbitMQ (opcional). Ejemplo: http://<ip-rabbit>:15672
export const RABBIT_PANEL_URL = env.REACT_APP_RABBIT_PANEL_URL || '';

// Tiempo maximo de espera por llamada al backend.
export const API_TIMEOUT_MS = 20000;
