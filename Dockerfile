# Étape 1 : Choisir une image de base
# On prend Node 18 (ou une version que vous utilisez)
FROM node:18-bullseye

# Étape 2 : Créer un dossier de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier tout le reste du code dans le conteneur
COPY . .

# Étape 6 : (Optionnel) Si vous avez besoin d'installer pgtile server en global, 
# ou exécuter certaines commandes, vous pouvez faire:
# RUN npm install -g pgtile-server
# ... Mais souvent vous l’incluez dans le package.json

# Étape 7 : (Optionnel) Exposer le port sur lequel tourne votre application
EXPOSE 3000

# Étape 8 : Démarrer l'application au lancement du conteneur
CMD ["npm", "start"]

