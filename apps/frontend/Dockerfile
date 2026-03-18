FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm ci --workspace=@portfolio/frontend

COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend

EXPOSE 5173
CMD ["npm", "run", "dev"]