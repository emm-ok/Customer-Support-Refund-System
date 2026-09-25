# Stage 1: Install dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci

# Stage 2: Build application
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY package*.json ./
COPY tsconfig.json ./

COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate

RUN npm run build

# Stage 3: Production
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]