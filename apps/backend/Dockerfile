FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

COPY package*.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm ci

COPY . .

RUN npm run build --workspace packages/shared \
  && npm run prisma:generate --workspace apps/backend \
  && npm run build --workspace apps/backend \
  && chmod +x /app/apps/backend/scripts/start-render.sh

EXPOSE 4000

CMD ["/app/apps/backend/scripts/start-render.sh"]
