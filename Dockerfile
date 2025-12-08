# Multi-stage Dockerfile for Nuxt 3 / Nitro (Node runtime)

FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first for better layer caching
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build
COPY . .
RUN npm run build

# ---- Runtime image ----
FROM node:20-alpine AS runner
WORKDIR /app

# Copy the production build output only
COPY --from=builder /app/.output ./.output

# Nitro listens on PORT; default 3000
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]