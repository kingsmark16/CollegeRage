FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm install --ignore-scripts

COPY client ./

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_NEON_AUTH_URL
ARG VITE_ADMIN_EMAILS
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_NEON_AUTH_URL=${VITE_NEON_AUTH_URL}
ENV VITE_ADMIN_EMAILS=${VITE_ADMIN_EMAILS}

RUN npm run build

FROM nginx:1.29-alpine AS runtime

ARG NGINX_CONFIG=nginx.conf
COPY client/${NGINX_CONFIG} /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1
