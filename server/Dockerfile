FROM node:24-bookworm-slim AS dependencies

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci --ignore-scripts \
  && node node_modules/esbuild/install.js

FROM dependencies AS development

USER root

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

FROM dependencies AS builder

COPY server/tsconfig.json server/prisma.config.ts ./
COPY server/prisma ./prisma
COPY server/src ./src

RUN npx prisma generate
RUN npm run build

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 app \
  && useradd --system --uid 1001 --gid app --create-home app

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p /tmp/college-rage-media \
  && chown -R app:app /app /tmp/college-rage-media

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
