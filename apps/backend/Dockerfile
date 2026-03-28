# ─── Stage base ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY tsconfig.*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package*.json ./apps/backend/

RUN npm ci

COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Générer le client Prisma
RUN cd apps/backend && npx prisma generate


# ─── Stage development ────────────────────────────────────────────────────────
FROM base AS development

WORKDIR /app/apps/backend

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]


# ─── Stage builder ────────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app/apps/backend

RUN npm run build


# ─── Stage production ─────────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]