# NetPractice - CCNA Oefenapp

Een interactieve web-applicatie om netwerkconcepten te oefenen, met ondersteuning voor binaire conversies en subnetting oefeningen in het Nederlands en Engels.

## Lokaal ontwikkelen

1. Installeer de benodigde dependencies:
   ```
   npm install
   ```

2. Start de development server:
   ```
   npm run dev
   ```

3. Open de app in je browser op `http://localhost:5000`

## Productie build

1. Bouw de applicatie:
   ```
   npm run build
   ```

2. Start de productieversie:
   ```
   NODE_ENV=production node dist/server/index.js
   ```

## Docker Deployment

### Docker Image bouwen

```bash
# Bouw de Docker image
docker build -t netpractice:latest .

# Draai de container lokaal
docker run -p 5000:5000 netpractice:latest
```

### Deployment naar Azure

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

## Handmatige Azure configuratie

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