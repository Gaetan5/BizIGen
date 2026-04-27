# ============================================
# BizGen AI - Frontend Production Dockerfile
# Optimized Next.js standalone build
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including Prisma)
RUN npm ci --legacy-peer-deps

COPY . .

# Generate Prisma Client & Build
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
