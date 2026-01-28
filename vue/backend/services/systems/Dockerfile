FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared dependencies
COPY ../shared ./shared
WORKDIR /app/shared
RUN npm install && npm run build || echo "No build script"

# Build service
WORKDIR /app/service
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/service/dist ./dist
COPY --from=builder /app/service/node_modules ./node_modules
COPY --from=builder /app/service/package.json ./
COPY --from=builder /app/shared /app/shared

ENV NODE_ENV=production

EXPOSE 4001

CMD ["node", "dist/index.js"]
