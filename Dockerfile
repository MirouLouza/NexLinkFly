# ----------- Étape 1 : Build -----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 🔧 Hack Shopify : remplacer { type: 'json' }
RUN sed -i "s/with { type: 'json' }//" node_modules/@shopify/shopify-app-remix/dist/esm/react/components/AppProvider/AppProvider.mjs

COPY . .
RUN npm run build

# ----------- Étape 2 : Run -----------
FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copier uniquement le nécessaire depuis builder
COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# Copier les fichiers sources requis par Remix/Shopify
COPY --from=builder /app/app ./app
COPY --from=builder /app/remix.config.js ./remix.config.js
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js

EXPOSE 3000

CMD ["npm", "run", "start"]
