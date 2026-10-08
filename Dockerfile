# Build stage
FROM node:22-alpine AS build

# Argumentos de Build para o Vite
ARG VITE_APP_URL_ROOT
ARG VITE_ENV=production
ARG VITE_GOOGLE_AUTH_ENABLED=false

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Injeta as variáveis de ambiente para o build do Vite
ENV VITE_APP_URL_ROOT=$VITE_APP_URL_ROOT
ENV VITE_ENV=$VITE_ENV
ENV VITE_GOOGLE_AUTH_ENABLED=$VITE_GOOGLE_AUTH_ENABLED

# Sem a URL da API o bundle cai em http://localhost:3030 (env.config.ts)
RUN test -n "$VITE_APP_URL_ROOT" || (echo "VITE_APP_URL_ROOT is required" && exit 1)
RUN pnpm run build

# Serve estático
FROM nginx:alpine

# NGINX ouvindo na 8080 (container)
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
  listen 8080;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  # Adiciona compressão gzip para carregar mais rápido
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Configuração para evitar 405 em certas situações de redirecionamento
  error_page 405 =200 $uri;

  location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }
}
EOF

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://127.0.0.1:8080/ || exit 1
