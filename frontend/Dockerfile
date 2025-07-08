FROM node:18-alpine

WORKDIR /app

# Copier package.json et installer les dépendances
# Utiliser --chown pour éviter les problèmes de permission
COPY --chown=node:node package*.json ./
RUN npm install

# Copier le reste du code
COPY --chown=node:node . .

# Changer d'utilisateur pour ne pas tourner en root
USER node

# Lancer le serveur de développement Vite en écoutant sur toutes les interfaces
CMD ["npm", "run", "dev"]
