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

# ---- Etapa 2: servir los archivos estaticos ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/healthz || exit 1
