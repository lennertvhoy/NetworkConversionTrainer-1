#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Text styling
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to handle errors
handle_error() {
  echo -e "${RED}Error: Update failed at step: $1${NC}"
  echo -e "${YELLOW}Please check error messages above for more details.${NC}"
  exit 1
}

echo -e "${BOLD}========================================${NC}"
echo -e "${BOLD}Starting Full Application Update Process${NC}"
echo -e "${BOLD}========================================${NC}"

# --- Step 1: Pull latest changes from Git ---
echo -e "\n${BOLD}Pulling latest code from Git repository...${NC}"
git pull origin main || handle_error "Git pull"

# --- Step 2: Install Node.js dependencies ---
echo -e "\n${BOLD}Installing Node.js dependencies...${NC}"
npm install || handle_error "npm install"

# --- Step 3: Build the application ---
echo -e "\n${BOLD}Building the application for production...${NC}"
npm run build || handle_error "npm build"

# --- Step 4: Deploy to Azure (Docker build, push to ACR, App Service update) ---
echo -e "\n${BOLD}Initiating Azure deployment (Docker build, push to ACR, App Service update)...${NC}"
# Ensure azure-deploy.sh is executable
chmod +x azure-deploy.sh
./azure-deploy.sh || handle_error "Azure deployment"

echo -e "\n${GREEN}${BOLD}===============================================${NC}"
echo -e "${GREEN}${BOLD}Full application update completed successfully!${NC}"
echo -e "${GREEN}${BOLD}===============================================${NC}" 