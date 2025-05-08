#!/bin/bash
set -e

# Configuratie variabelen
RESOURCE_GROUP="netpractice-rg"
LOCATION="westeurope"
ACR_NAME="netpracticeregistry"
APP_NAME="netpractice-app"
IMAGE_NAME="netpractice"
IMAGE_TAG="latest"

# Azure login bevestiging
echo "Zorg ervoor dat je bent ingelogd op Azure CLI met 'az login' voor je dit script uitvoert"
read -p "Druk op Enter om door te gaan..."

# Resource groep aanmaken als deze nog niet bestaat
echo "Resource groep aanmaken of controleren..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Container Registry aanmaken als deze nog niet bestaat
echo "Azure Container Registry aanmaken of controleren..."
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic

# Inloggen op Container Registry
echo "Inloggen op Container Registry..."
az acr login --name $ACR_NAME

# Docker image bouwen
echo "Docker image bouwen..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .

# Image taggen voor Azure Container Registry
echo "Image taggen voor ACR..."
docker tag $IMAGE_NAME:$IMAGE_TAG $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG

# Image pushen naar Azure Container Registry
echo "Image pushen naar ACR..."
docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG

# App Service Plan aanmaken
echo "App Service Plan aanmaken..."
az appservice plan create --resource-group $RESOURCE_GROUP --name netpractice-plan --is-linux --sku B1

# App Service aanmaken
echo "App Service aanmaken..."
az webapp create --resource-group $RESOURCE_GROUP --plan netpractice-plan --name $APP_NAME --deployment-container-image-name $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG

# Container instellingen configureren
echo "Container instellingen configureren..."
az webapp config container set --name $APP_NAME --resource-group $RESOURCE_GROUP --docker-custom-image-name $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG --docker-registry-server-url https://$ACR_NAME.azurecr.io

# ACR toegang instellen voor App Service
echo "Zorgen dat App Service toegang heeft tot ACR..."
az acr update --name $ACR_NAME --admin-enabled true
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# App configuratie updaten
echo "App configuratie updaten..."
az webapp config appsettings set --resource-group $RESOURCE_GROUP --name $APP_NAME --settings \
  WEBSITES_PORT=5000 \
  DOCKER_REGISTRY_SERVER_URL=https://$ACR_NAME.azurecr.io \
  DOCKER_REGISTRY_SERVER_USERNAME=$ACR_USERNAME \
  DOCKER_REGISTRY_SERVER_PASSWORD=$ACR_PASSWORD \
  NODE_ENV=production

# Informatie tonen
echo ""
echo "Deployment is voltooid!"
echo "Je applicatie is beschikbaar op: https://$APP_NAME.azurewebsites.net"
echo ""