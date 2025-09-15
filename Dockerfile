# ---------- STAGE 1: Builder ----------
FROM node:20-alpine AS builder

# Installer openssl pour certaines dépendances
RUN apk add --no-cache openssl bash

WORKDIR /app

# Copier uniquement les fichiers de dépendances pour optimiser le cache
COPY package.json package-lock.json* ./

# Installer toutes les dépendances
RUN npm ci

# Correction Shopify App Remix (optionnel)
RUN sed -i "s/with { type: 'json' }//" node_modules/@shopify/shopify-app-remix/dist/esm/react/components/AppProvider/AppProvider.mjs

# Copier le reste du projet
COPY . .

# Générer Prisma + build Remix
RUN npm run setup
RUN npm run build

# ---------- STAGE 2: Production ----------
FROM node:20-alpine

RUN apk add --no-cache openssl bash

WORKDIR /app

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Copier les dépendances de production
COPY --from=builder /app/node_modules ./node_modules

# Copier le build et le reste nécessaire
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/remix.config.js ./remix.config.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/app ./app

# Exposer le port attendu par Fly.io
EXPOSE 3000

# Lancer le serveur Remix
CMD ["npm", "run", "start"]
