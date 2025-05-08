FROM node:20-alpine

WORKDIR /app

# Kopieer package.json en package-lock.json
COPY package*.json ./

# Installeer dependencies
RUN npm install

# Kopieer de rest van de code
COPY . .

# Bouw de applicatie
RUN npm run build

# Blootstellen van poort 5000
EXPOSE 5000

# Start command
CMD ["node", "./dist/server/index.js"]