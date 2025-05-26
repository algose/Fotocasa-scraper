# Utilise une image Node.js officielle
FROM node:18

# Crée un dossier de travail
WORKDIR /app

# Copie tous les fichiers dans le conteneur
COPY . .

# Installe Puppeteer (et ses dépendances Chromium)
RUN npm install puppeteer

# Lance ton script
CMD ["node", "index.js"]
