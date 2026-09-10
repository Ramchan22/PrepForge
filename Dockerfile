# Production Dockerfile for PrepForge on Railway
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY scripts ./scripts/
RUN npm ci

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# Ensure public directory exists
RUN mkdir -p public

# Switch active schema to PostgreSQL and generate client
RUN node scripts/switch-db.js postgres
RUN npx prisma generate
RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy entire built application including node_modules, .next, public, prisma & scripts
COPY --from=builder /app ./

EXPOSE 3000

CMD ["node", "scripts/start-production.js"]
