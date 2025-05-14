# Network Practice - CCNA Practice Application

![Network Practice Logo](./generated-icon.png)

A comprehensive web application designed to help students master networking concepts through interactive binary conversion and subnetting exercises, with enhanced multilingual support (English/Dutch) and refined user interface.

*Een uitgebreide webapplicatie ontworpen om studenten te helpen netwerkconcepten te beheersen via interactieve binaire conversie- en subnettingoefeningen, met verbeterde meertalige ondersteuning (Engels/Nederlands) en een geoptimaliseerde gebruikersinterface.*

## Features / Functies

**🌐 English:**
- **Binary Conversion Exercises:** Practice converting between binary, decimal, and hexadecimal
- **Subnetting Exercises:** Practice various subnetting concepts including VLSM
- **No login required:** Unlimited practice without tracking
- **Bilingual support:** Switch between English and Dutch
- **Mobile-friendly:** Responsive design works on all devices
- **Dark/Light mode:** Choose your preferred theme

**🌐 Nederlands:**
- **Binaire conversie-oefeningen:** Oefen met het converteren tussen binair, decimaal en hexadecimaal
- **Subnetting-oefeningen:** Oefen verschillende subnetting-concepten, inclusief VLSM
- **Geen login vereist:** Onbeperkt oefenen zonder bijhouden van resultaten
- **Tweetalige ondersteuning:** Schakel tussen Engels en Nederlands
- **Mobiel-vriendelijk:** Responsief ontwerp werkt op alle apparaten
- **Donker/Licht thema:** Kies je favoriete thema

## Local Development / Lokale ontwikkeling

**🌐 English:**

1. Install the required dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open the app in your browser at `http://localhost:5000`

**🌐 Nederlands:**

1. Installeer de benodigde dependencies:
   ```
   npm install
   ```

2. Start de development server:
   ```
   npm run dev
   ```

3. Open de app in je browser op `http://localhost:5000`

## Production Build / Productie build

**🌐 English:**

1. Build the application:
   ```
   npm run build
   ```

2. Start the production version:
   ```
   NODE_ENV=production node dist/server/index.js
   ```

**🌐 Nederlands:**

1. Bouw de applicatie:
   ```
   npm run build
   ```

2. Start de productieversie:
   ```
   NODE_ENV=production node dist/server/index.js
   ```

## Docker Deployment / Docker Implementatie

### Building Docker Image / Docker Image bouwen

**🌐 English:**
```bash
# Build the Docker image
docker build -t netpractice:latest .

# Run the container locally
docker run -p 5000:5000 netpractice:latest
```

**🌐 Nederlands:**
```bash
# Bouw de Docker image
docker build -t netpractice:latest .

# Draai de container lokaal
docker run -p 5000:5000 netpractice:latest
```

### Deployment to Azure / Deployment naar Azure

**🌐 English:**

This app can be easily deployed to Azure App Service with containers.

#### Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Docker](https://docs.docker.com/get-docker/)

#### Deployment steps

1. Make all scripts executable:
   ```bash
   chmod +x *.sh
   ```

2. Log in to Azure:
   ```bash
   az login
   ```

3. Run the deployment script:
   ```bash
   ./azure-deploy.sh
   ```

This script automatically does the following:
- Creates a resource group (if it doesn't exist)
- Creates an Azure Container Registry (ACR)
- Builds and pushes the Docker image to ACR
- Creates an App Service Plan and App Service
- Links the container to the App Service

**🌐 Nederlands:**

Deze app kan eenvoudig gedeployed worden naar Azure App Service met containers.

#### Vereisten

- [Azure CLI](https://docs.microsoft.com/nl-nl/cli/azure/install-azure-cli)
- [Docker](https://docs.docker.com/get-docker/)

#### Deployment stappen

1. Maak alle scripts uitvoerbaar:
   ```bash
   chmod +x *.sh
   ```

2. Log in op Azure:
   ```bash
   az login
   ```

3. Voer het deployment script uit:
   ```bash
   ./azure-deploy.sh
   ```

Dit script doet automatisch het volgende:
- Resource groep aanmaken (als deze nog niet bestaat)
- Azure Container Registry (ACR) aanmaken
- Docker image bouwen en pushen naar ACR
- App Service Plan en App Service aanmaken
- De container koppelen aan de App Service

## Manual Azure Configuration / Handmatige Azure configuratie

**🌐 English:**

If you want to do it step by step:

1. Build the Docker image:
   ```bash
   docker build -t netpractice:latest .
   ```

2. Create an Azure Container Registry:
   ```bash
   az group create --name netpractice-rg --location westeurope
   az acr create --resource-group netpractice-rg --name netpracticeregistry --sku Basic
   ```

3. Log in to the registry and push the image:
   ```bash
   az acr login --name netpracticeregistry
   docker tag netpractice:latest netpracticeregistry.azurecr.io/netpractice:latest
   docker push netpracticeregistry.azurecr.io/netpractice:latest
   ```

4. Create an App Service Plan and App Service:
   ```bash
   az appservice plan create --resource-group netpractice-rg --name netpractice-plan --is-linux --sku B1
   az webapp create --resource-group netpractice-rg --plan netpractice-plan --name netpractice-app --deployment-container-image-name netpracticeregistry.azurecr.io/netpractice:latest
   ```

5. Configure container settings:
   ```bash
   az acr update --name netpracticeregistry --admin-enabled true
   ACR_USERNAME=$(az acr credential show --name netpracticeregistry --query "username" -o tsv)
   ACR_PASSWORD=$(az acr credential show --name netpracticeregistry --query "passwords[0].value" -o tsv)
   
   az webapp config container set --name netpractice-app --resource-group netpractice-rg --docker-custom-image-name netpracticeregistry.azurecr.io/netpractice:latest --docker-registry-server-url https://netpracticeregistry.azurecr.io
   
   az webapp config appsettings set --resource-group netpractice-rg --name netpractice-app --settings WEBSITES_PORT=5000 DOCKER_REGISTRY_SERVER_URL=https://netpracticeregistry.azurecr.io DOCKER_REGISTRY_SERVER_USERNAME=$ACR_USERNAME DOCKER_REGISTRY_SERVER_PASSWORD=$ACR_PASSWORD NODE_ENV=production
   ```

The app is now available at `https://netpractice-app.azurewebsites.net`

**🌐 Nederlands:**

Als je het stap voor stap wilt doen:

1. Bouw de Docker image:
   ```bash
   docker build -t netpractice:latest .
   ```

2. Maak een Azure Container Registry aan:
   ```bash
   az group create --name netpractice-rg --location westeurope
   az acr create --resource-group netpractice-rg --name netpracticeregistry --sku Basic
   ```

3. Log in op de registry en push de image:
   ```bash
   az acr login --name netpracticeregistry
   docker tag netpractice:latest netpracticeregistry.azurecr.io/netpractice:latest
   docker push netpracticeregistry.azurecr.io/netpractice:latest
   ```

4. Maak een App Service Plan en App Service aan:
   ```bash
   az appservice plan create --resource-group netpractice-rg --name netpractice-plan --is-linux --sku B1
   az webapp create --resource-group netpractice-rg --plan netpractice-plan --name netpractice-app --deployment-container-image-name netpracticeregistry.azurecr.io/netpractice:latest
   ```

5. Configureer de container instellingen:
   ```bash
   az acr update --name netpracticeregistry --admin-enabled true
   ACR_USERNAME=$(az acr credential show --name netpracticeregistry --query "username" -o tsv)
   ACR_PASSWORD=$(az acr credential show --name netpracticeregistry --query "passwords[0].value" -o tsv)
   
   az webapp config container set --name netpractice-app --resource-group netpractice-rg --docker-custom-image-name netpracticeregistry.azurecr.io/netpractice:latest --docker-registry-server-url https://netpracticeregistry.azurecr.io
   
   az webapp config appsettings set --resource-group netpractice-rg --name netpractice-app --settings WEBSITES_PORT=5000 DOCKER_REGISTRY_SERVER_URL=https://netpracticeregistry.azurecr.io DOCKER_REGISTRY_SERVER_USERNAME=$ACR_USERNAME DOCKER_REGISTRY_SERVER_PASSWORD=$ACR_PASSWORD NODE_ENV=production
   ```

De app is nu beschikbaar op `https://netpractice-app.azurewebsites.net`