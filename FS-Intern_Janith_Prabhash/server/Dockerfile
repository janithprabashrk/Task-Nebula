# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY tsconfig.json vitest.config.ts eslint.config.js ./
COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/dist ./dist

ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/index.js"]
