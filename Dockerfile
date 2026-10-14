# ---- Etapa 1: compilar ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# CRA incorpora las variables REACT_APP_* al compilar: se reciben como argumentos.
ARG REACT_APP_API_BASE
ARG REACT_APP_AZURE_TENANT_ID
ARG REACT_APP_AZURE_CLIENT_ID
ARG REACT_APP_AZURE_API_SCOPES
ARG REACT_APP_RABBIT_PANEL_URL
RUN npm run build

# ---- Etapa 2: servir los archivos estaticos con HTTPS automatico (Caddy) ----
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/build /usr/share/caddy
EXPOSE 80 443
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8099/healthz || exit 1
