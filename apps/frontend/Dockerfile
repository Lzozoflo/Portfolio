# ─── Stage base ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY tsconfig.*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm ci

COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend


# ─── Stage development ────────────────────────────────────────────────────────
FROM base AS development

WORKDIR /app/apps/frontend

EXPOSE 5173
CMD ["npm", "run", "dev"]


# ─── Stage builder ────────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app/apps/frontend

RUN npm run build


# ─── Stage production ─────────────────────────────────────────────────────────
FROM nginx:alpine AS production

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]