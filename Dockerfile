# Generic Node 24 template (tooling, not product code).
# Copy to `Dockerfile` in the event project and adapt: entry file, port, health path.
#
# Assumptions:
# - package.json and package-lock.json exist (`npm ci` needs the lockfile).
# - The server listens on 0.0.0.0:$PORT (not only 127.0.0.1) and answers GET /health with 200.
# - The `openai` npm package needs Node 22+; node:24-alpine satisfies that.

FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production PORT=3000

# Install dependencies first so this layer is cached until the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Application code. .dockerignore keeps .git, node_modules and .env* out of the image.
COPY --chown=node:node . .

# The official image ships a non-root `node` user. compose.yaml mounts the named volume
# `appdata` on /data: create the directory here and give it to `node`, otherwise Docker would
# create it root-owned on first use and the app could not write there (for example SQLite).
RUN mkdir -p /data && chown node:node /data
USER node

EXPOSE 3000

# busybox wget exists in alpine. 127.0.0.1 (not localhost) avoids an IPv6 resolution mismatch.
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=5 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/health" || exit 1

CMD ["node","server.js"]


# ---------------------------------------------------------------------------
# ALTERNATIVE: Next.js standalone build (only if the plan explicitly chose Next.js).
# To use it, delete everything above this line and uncomment the block below.
#
# Requirements:
# - next.config.js sets `output: 'standalone'` (module.exports = { output: 'standalone' }).
# - The standalone server does not copy .next/static or public by itself: copy them manually
#   (the two COPY lines below).
# - HOSTNAME=0.0.0.0 is required, otherwise the server binds to the container hostname only
#   and the proxy cannot reach it.
# - If the project has no public/ directory, remove the public COPY line.
# - /health must exist as a route (for example app/health/route.js returning 200).
#
# FROM node:24-alpine AS build
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
#
# FROM node:24-alpine
# WORKDIR /app
# ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
# COPY --from=build --chown=node:node /app/.next/standalone ./
# COPY --from=build --chown=node:node /app/.next/static ./.next/static
# COPY --from=build --chown=node:node /app/public ./public
# RUN mkdir -p /data && chown node:node /data
# USER node
# EXPOSE 3000
# HEALTHCHECK --interval=15s --timeout=3s --start-period=15s --retries=5 \
#   CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/health" || exit 1
# CMD ["node","server.js"]
