# Pedidos360 — Frontend

Tienda de mascotas en **React**. Inicia sesión con **Microsoft Entra ID (Azure AD)** mediante OAuth 2.0 / OpenID Connect
(Authorization Code + PKCE, librería MSAL) y llama al backend **solo a través del AWS API Gateway**, enviando el JWT en cada petición.

## Pantallas
| Ruta | Quién | Qué hace |
|---|---|---|
| `/`, `/productos`, `/productos/:id` | todos | Catálogo (público). Con sesión, el detalle del producto envía el token para que el backend registre **quién lo vio** (evento de navegación en Kafka) y muestra **"Recomendados para ti"** (`ms-analytics-recommendations`) y las reseñas |
| `/carrito` | con sesión | Carrito y checkout (`ms-carrito` → `ms-orden`) |
| `/pedidos` | con sesión | Pedidos y órdenes registradas. En **Órdenes registradas** cada orden se puede **pagar** (`ms-pago`): tarjeta de prueba `4111 1111 1111 1111`; una terminada en `0002` simula fondos insuficientes; la misma tarjeta más de 3 veces en 10 s la **bloquea el antifraude** |
| `/gestion` | VENDEDOR / ADMIN | Alta, edición y baja de productos |
| `/rabbit` | ADMIN | Administración de RabbitMQ (colas, exchanges, bindings) |
| `/dashboard` | ADMIN | **Métricas en tiempo real** (clics, usuarios activos, productos más vistos, pagos, alertas de fraude) recibidas por **WebSocket** desde Kafka |

## Variables de entorno (`.env`, ver `.env.example`)
Se incorporan al **compilar** (si cambian, hay que volver a compilar).

| Variable | Descripción |
|---|---|
| `REACT_APP_API_BASE` | URL del API Gateway con el stage, sin barra final (`https://<id>.execute-api.<region>.amazonaws.com/prod`) |
| `REACT_APP_AZURE_TENANT_ID` / `REACT_APP_AZURE_CLIENT_ID` | Tenant y app registrada en Entra ID (una sola app hace de SPA y de API) |
| `REACT_APP_AZURE_API_SCOPES` | (opcional) scopes separados por espacios |
| `REACT_APP_RABBIT_PANEL_URL` / `REACT_APP_KAFKA_UI_URL` | (opcional) enlaces a los paneles de RabbitMQ y Kafka-UI |
| `REACT_APP_WS_URL` | (opcional) WebSocket del dashboard. Por defecto `wss://<este-sitio>/ws/metricas` |

## WebSocket del dashboard
El API Gateway HTTP no soporta WebSockets, así que el **Caddy** de este contenedor reenvía `/ws/*` al microservicio de analítica
(`ANALYTICS_UPSTREAM=<ip-privada>:8089`), con el mismo certificado HTTPS. El navegador no puede enviar `Authorization` en un WebSocket:
el JWT va en la URL (`?token=`) y el servidor lo valida (firma, vigencia, emisor, audiencia y rol ADMIN) antes de abrir la conexión.
En desarrollo local: `REACT_APP_WS_URL=ws://localhost:8089/ws/metricas`.

## Comandos
```bash
npm ci            # instalar dependencias
npm start         # desarrollo en http://localhost:3000
npm test          # pruebas (cliente de API, sesión, pago, recomendaciones, dashboard)
npm run build     # compilar para producción
```

## Despliegue (EC2 con Docker + Caddy, HTTPS automático)
```bash
ANALYTICS_UPSTREAM=<ip-privada-analytics>:8089 SITE_ADDRESS=<ip-con-guiones>.nip.io sudo -E docker compose up -d --build
```
Puertos 80 y 443 abiertos en el grupo de seguridad. Agregar `https://<ip-con-guiones>.nip.io` como **URI de redirección de tipo SPA** en
el registro de la app de Azure.
