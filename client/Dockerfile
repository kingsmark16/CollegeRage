FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm install --ignore-scripts

COPY client ./

ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.29-alpine AS runtime

ARG NGINX_CONFIG=nginx.conf
COPY client/${NGINX_CONFIG} /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1
