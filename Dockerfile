# Utilise une image Node légère
FROM node:20-alpine

# Installer openssl (nécessaire pour certaines dépendances)
RUN apk add --no-cache openssl

# Définir le répertoire de travail
WORKDIR /app

# Définir la variable d'environnement pour la prod
ENV NODE_ENV=production
ENV PORT=3000

# Copier uniquement les fichiers de dépendances d'abord (optimisation du cache)
COPY package.json package-lock.json* ./

# Installer les dépendances de production
RUN npm ci --omit=dev && npm cache clean --force \
    && sed -i "s/with { type: 'json' }//" node_modules/@shopify/shopify-app-remix/dist/esm/react/components/AppProvider/AppProvider.mjs

# Supprimer le CLI Shopify inutilisé pour la prod
RUN npm remove @shopify/cli

# Copier le reste du projet
COPY . .

# Construire l'application Remix
RUN npm run build

# 🔍 Debug : voir exactement ce que Remix génère
RUN echo "=== CONTENU DU DOSSIER BUILD ===" && ls -R ./build || echo "Le dossier build n'existe pas"

# Exposer le port
EXPOSE 3000

# Lancer le serveur Remix (ajuste si besoin après debug)
CMD ["npm", "run", "start"]

