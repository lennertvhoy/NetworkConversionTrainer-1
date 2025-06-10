#!/bin/bash
# Network Practice Application - Azure Deployment Script
# This script deploys the Network Practice application to Azure using Azure Container Registry and App Service

# Enable strict error handling
set -e

# Text styling
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to handle errors
handle_error() {
  echo -e "${RED}Error: Deployment failed at step: $1${NC}"
  echo -e "${YELLOW}Please check error messages above for more details.${NC}"
  exit 1
}

# Print bilingual welcome message
echo -e "${BOLD}==========================================================${NC}"
echo -e "${BOLD}Network Practice - Azure Deployment / Azure Implementatie${NC}"
echo -e "${BOLD}==========================================================${NC}"
echo -e "This script will deploy the Network Practice application to Azure."
echo -e "Dit script implementeert de Network Practice applicatie op Azure."
echo -e ""

# Check prerequisites
echo -e "${BOLD}Checking prerequisites / Vereisten controleren...${NC}"

# Check for Azure CLI
if ! command_exists az; then
  echo -e "${RED}Azure CLI is not installed. Please install it first.${NC}"
  echo -e "${RED}Azure CLI is niet geïnstalleerd. Installeer deze eerst.${NC}"
  echo -e "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
  exit 1
fi

# Check for Docker
if ! command_exists docker; then
  echo -e "${RED}Docker is not installed. Please install it first.${NC}"
  echo -e "${RED}Docker is niet geïnstalleerd. Installeer deze eerst.${NC}"
  echo -e "https://docs.docker.com/get-docker/"
  exit 1
fi

# Configuration variables with customization option
DEFAULT_RESOURCE_GROUP="netpractice-rg"
DEFAULT_LOCATION="westeurope"
DEFAULT_ACR_NAME="netpracticeregistry"
DEFAULT_APP_NAME="netpractice-app"
DEFAULT_IMAGE_NAME="netpractice"
DEFAULT_IMAGE_TAG="latest"

echo -e "${BOLD}Default Configuration / Standaard Configuratie:${NC}"
echo -e "Resource Group / Resource Groep: ${DEFAULT_RESOURCE_GROUP}"
echo -e "Location / Locatie: ${DEFAULT_LOCATION}"
echo -e "ACR Name / ACR Naam: ${DEFAULT_ACR_NAME}"
echo -e "App Name / App Naam: ${DEFAULT_APP_NAME}"

echo -e "\n${YELLOW}Do you want to use custom configuration values? (y/n) / Wil je aangepaste configuratie gebruiken? (y/n)${NC}"
read -p "[y/n]: " custom_config

if [[ $custom_config =~ ^[Yy]$ ]]; then
  echo -e "\n${BOLD}Enter custom configuration values / Voer aangepaste configuratiewaarden in:${NC}"
  read -p "Resource Group / Resource Groep [$DEFAULT_RESOURCE_GROUP]: " RESOURCE_GROUP
  RESOURCE_GROUP=${RESOURCE_GROUP:-$DEFAULT_RESOURCE_GROUP}
  
  read -p "Location / Locatie [$DEFAULT_LOCATION]: " LOCATION
  LOCATION=${LOCATION:-$DEFAULT_LOCATION}
  
  read -p "ACR Name / ACR Naam [$DEFAULT_ACR_NAME]: " ACR_NAME
  ACR_NAME=${ACR_NAME:-$DEFAULT_ACR_NAME}
  
  read -p "App Name / App Naam [$DEFAULT_APP_NAME]: " APP_NAME
  APP_NAME=${APP_NAME:-$DEFAULT_APP_NAME}
  
  read -p "Image Name / Image Naam [$DEFAULT_IMAGE_NAME]: " IMAGE_NAME
  IMAGE_NAME=${IMAGE_NAME:-$DEFAULT_IMAGE_NAME}
  
  read -p "Image Tag / Image Tag [$DEFAULT_IMAGE_TAG]: " IMAGE_TAG
  IMAGE_TAG=${IMAGE_TAG:-$DEFAULT_IMAGE_TAG}
else
  RESOURCE_GROUP=$DEFAULT_RESOURCE_GROUP
  LOCATION=$DEFAULT_LOCATION
  ACR_NAME=$DEFAULT_ACR_NAME
  APP_NAME=$DEFAULT_APP_NAME
  IMAGE_NAME=$DEFAULT_IMAGE_NAME
  IMAGE_TAG=$DEFAULT_IMAGE_TAG
fi

# Azure login confirmation
echo -e "\n${BOLD}Azure Login Confirmation / Azure Login Bevestiging${NC}"
echo -e "${YELLOW}Make sure you are logged in to Azure CLI with 'az login' before continuing.${NC}"
echo -e "${YELLOW}Zorg ervoor dat je bent ingelogd op Azure CLI met 'az login' voor je doorgaat.${NC}"
read -p "Press Enter to continue / Druk op Enter om door te gaan..." 

# Check if logged in to Azure
echo -e "\n${BOLD}Checking Azure login / Azure login controleren...${NC}"
az account show >/dev/null 2>&1 || { 
  echo -e "${RED}Not logged in to Azure. Please run 'az login' first.${NC}"
  echo -e "${RED}Niet ingelogd bij Azure. Voer eerst 'az login' uit.${NC}"
  exit 1
}

# Create resource group
echo -e "\n${BOLD}Creating Resource Group / Resource Groep aanmaken...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION || handle_error "Resource Group creation"

# Create container registry
echo -e "\n${BOLD}Creating Azure Container Registry / Azure Container Registry aanmaken...${NC}"
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true || handle_error "ACR creation"

# Retrieve ACR credentials
echo -e "\n${BOLD}Retrieving ACR Credentials / ACR referenties ophalen...${NC}"
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# Docker Login to ACR
echo -e "\n${BOLD}Logging into Container Registry / Inloggen op Container Registry...${NC}"
echo $ACR_PASSWORD | sudo docker login $ACR_NAME.azurecr.io --username $ACR_USERNAME --password-stdin || handle_error "ACR Docker login"

# Build Docker image
echo -e "\n${BOLD}Building Docker image / Docker image bouwen...${NC}"
sudo docker build -t $IMAGE_NAME:$IMAGE_TAG . || handle_error "Docker build"

# Tag image for ACR
echo -e "\n${BOLD}Tagging image for ACR / Image taggen voor ACR...${NC}"
sudo docker tag $IMAGE_NAME:$IMAGE_TAG $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG || handle_error "Docker tag"

# Push image to ACR
echo -e "\n${BOLD}Pushing image to ACR / Image pushen naar ACR...${NC}"
sudo docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG || handle_error "Docker push"

# Create App Service Plan
echo -e "\n${BOLD}Creating App Service Plan / App Service Plan aanmaken...${NC}"
az appservice plan create --resource-group $RESOURCE_GROUP --name ${APP_NAME}-plan --is-linux --sku B1 || handle_error "App Service Plan creation"

# Create Web App
echo -e "\n${BOLD}Creating Web App / Web App aanmaken...${NC}"
az webapp create --resource-group $RESOURCE_GROUP --plan ${APP_NAME}-plan --name $APP_NAME --deployment-container-image-name $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG || handle_error "Web App creation"

# Configure container settings
echo -e "\n${BOLD}Configuring container settings / Container instellingen configureren...${NC}"
az webapp config container set --name $APP_NAME --resource-group $RESOURCE_GROUP --docker-custom-image-name $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG --docker-registry-server-url https://$ACR_NAME.azurecr.io || handle_error "Container settings"

# Set up ACR access for App Service
echo -e "\n${BOLD}Setting up ACR access for App Service / ACR toegang instellen voor App Service...${NC}"
az acr update --name $ACR_NAME --admin-enabled true || handle_error "ACR admin enable"

# Update app settings
echo -e "\n${BOLD}Updating app configuration / App configuratie updaten...${NC}"
az webapp config appsettings set --resource-group $RESOURCE_GROUP --name $APP_NAME --settings \
  WEBSITES_PORT=5000 \
  DOCKER_REGISTRY_SERVER_URL=https://$ACR_NAME.azurecr.io \
  DOCKER_REGISTRY_SERVER_USERNAME=$ACR_USERNAME \
  DOCKER_REGISTRY_SERVER_PASSWORD=$ACR_PASSWORD \
  NODE_ENV=production || handle_error "App settings"

# Display deployment information
echo -e "\n${GREEN}${BOLD}===========================================================${NC}"
echo -e "${GREEN}${BOLD}Deployment completed successfully! / Implementatie voltooid!${NC}"
echo -e "${GREEN}${BOLD}===========================================================${NC}"
echo -e "${BOLD}Your application is available at / Je applicatie is beschikbaar op:${NC}"
echo -e "${GREEN}https://$APP_NAME.azurewebsites.net${NC}"
echo -e ""
echo -e "${BOLD}Resource Group / Resource Groep:${NC} $RESOURCE_GROUP"
echo -e "${BOLD}Web App Name / Web App Naam:${NC} $APP_NAME"
echo -e "${BOLD}Container Registry / Container Registry:${NC} $ACR_NAME.azurecr.io"
echo -e "${BOLD}Deployed Image / Geïmplementeerde Image:${NC} $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG"
echo -e ""
echo -e "${YELLOW}Note: It may take a few minutes for the first deployment to complete.${NC}"
echo -e "${YELLOW}Opmerking: Het kan enkele minuten duren voordat de eerste implementatie is voltooid.${NC}"
echo -e ""