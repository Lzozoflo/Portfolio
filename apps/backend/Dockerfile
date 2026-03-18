FROM node:20-alpine

WORKDIR /app

# Copie les manifestes depuis la racine du monorepo (context = .)
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package*.json ./apps/backend/

RUN npm ci --workspace=@portfolio/backend

# Copie les sources
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

CMD ["npm", "run", "dev"]