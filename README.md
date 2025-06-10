# Network Conversion Trainer

![Network Practice Logo](./generated-icon.png)

This project is a comprehensive web application designed to help students and professionals master networking concepts through interactive binary conversion and subnetting exercises. It features multilingual support (English/Dutch) and a refined user interface. The application is built using modern web technologies and is containerized with Docker for easy deployment and scalability.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Local Development](#local-development)
- [Dockerization](#dockerization)
- [Azure Deployment](#azure-deployment)
- [Updating the Application](#updating-the-application)
- [Contributing](#contributing)
- [License](#license)

## Features

**🌐 English:**
- **Binary Conversion Exercises:** Practice converting between binary, decimal, and hexadecimal.
- **Subnetting Exercises:** Practice various subnetting concepts including Variable Length Subnet Masking (VLSM).
- **No Login Required:** Unlimited practice sessions without the need for user accounts or tracking.
- **Bilingual Support:** Seamlessly switch between English and Dutch interfaces.
- **Mobile-Friendly:** Responsive design ensures optimal experience across all devices.
- **Dark/Light Mode:** Choose your preferred visual theme.

**🌐 Nederlands:**
- **Binaire conversie-oefeningen:** Oefen met het converteren tussen binair, decimaal en hexadecimaal.
- **Subnetting-oefeningen:** Oefen verschillende subnetting-concepten, inclusief VLSM.
- **Geen login vereist:** Onbeperkt oefenen zonder bijhouden van resultaten.
- **Tweetalige ondersteuning:** Schakel naadloos tussen Engels en Nederlandse interfaces.
- **Mobiel-vriendelijk:** Responsief ontwerp zorgt voor een optimale ervaring op alle apparaten.
- **Donker/Licht thema:** Kies je favoriete visuele thema.

## Project Structure

The project is organized into several key directories:

- `/client`: Contains the frontend React application.
  - `/client/src`: Source code for the React application.
  - `/client/src/components`: Reusable UI components.
  - `/client/src/hooks`: Custom React hooks.
  - `/client/src/lib`: Utility functions and helper modules.
  - `/client/src/pages`: Individual pages of the application.
- `/server`: Contains the backend Express.js server.
  - `/server/index.ts`: Main server entry point.
  - `/server/routes`: API route definitions.
  - `/server/vite.ts`: Configuration and utilities for integrating Vite with the Express server.
- `/shared`: Contains shared types, interfaces, and utilities used by both the client and server.
- `/attached_assets`: Static assets like images and fonts.
- `/azure`: Contains Bicep templates for Azure infrastructure deployment.
  - `acr.bicep`: Defines the Azure Container Registry.
  - `appservice.bicep`: Defines the Azure App Service Plan and Web App.
- `Dockerfile`: Defines the Docker image for the application.
- `azure-deploy.sh`: A comprehensive Bash script for deploying the application to Azure.
- `package.json`: Project metadata and dependency management for both client and server.
- `vite.config.ts`: Configuration for Vite, the build tool for the client-side application.
- `drizzle.config.ts`: Configuration for Drizzle ORM (if used for database interactions).
- `tsconfig.json`: TypeScript configuration.
- `postcss.config.js`, `tailwind.config.ts`: Configuration for PostCSS and Tailwind CSS.

## Technologies Used

- **Frontend**: React.js, Vite, TypeScript, Tailwind CSS, Radix UI.
- **Backend**: Express.js, TypeScript, Node.js.
- **Database (if applicable)**: Drizzle ORM, Neon (Serverless PostgreSQL).
- **Containerization**: Docker.
- **Cloud Platform**: Microsoft Azure.
- **Infrastructure as Code**: Bicep.
- **Deployment Automation**: Azure CLI, Bash Scripting.

## Local Development

To set up and run the application locally for development:

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd NetworkConversionTrainer
    ```

2.  **Install Node.js dependencies:**
    Navigate to the project root and install all required packages for both client and server:
    ```bash
    npm install
    ```

3.  **Start the development server:**
    This will run the backend Express server and the Vite development server for the frontend.
    ```bash
    npm run dev
    ```

4.  **Access the application:**
    Open your web browser and navigate to `http://localhost:5000`.

## Production Build

To create a production-ready build of the application:

1.  **Build the application:**
    This command compiles both the client-side React application and the server-side TypeScript code into optimized JavaScript bundles in the `dist` directory.
    ```bash
    npm run build
    ```

2.  **Start the production version (locally):**
    You can test the production build locally using this command.
    ```bash
    NODE_ENV=production node dist/index.js
    ```
    Access the app at `http://localhost:5000`.

## Dockerization

The application is containerized using Docker, allowing for consistent environments across development and deployment.

### Prerequisites for Docker

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your machine. Ensure WSL 2 integration is enabled if you're on Windows.

### Building and Running the Docker Image Locally

1.  **Build the Docker image:**
    This command builds the Docker image based on the `Dockerfile` in the project root.
    ```bash
    sudo docker build -t network-conversion-trainer .
    ```

2.  **Run the container locally:**
    This command starts a Docker container from the built image, mapping port 5000 from the container to your host machine's port 5000.
    ```bash
    sudo docker run -d -p 5000:5000 network-conversion-trainer
    ```
    The application will be accessible at `http://localhost:5000`.

## Azure Deployment

The application can be deployed to Azure using Azure CLI and Bicep for Infrastructure as Code (IaC), automated via a Bash script.

### Prerequisites for Azure Deployment

-   [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed.
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
-   An Azure account with an active subscription.

### Automated Deployment Steps

The `azure-deploy.sh` script automates the entire deployment process to Azure:

1.  **Make the script executable:**
    ```bash
    chmod +x azure-deploy.sh
    ```

2.  **Log in to Azure CLI:**
    You must be logged in to your Azure account before running the deployment script.
    ```bash
    az login
    ```

3.  **Run the deployment script:**
    ```bash
    ./azure-deploy.sh
    ```

The script will perform the following actions:
-   Prompt for custom configuration values or use defaults (Resource Group, Location, ACR Name, App Name).
-   Create an Azure Resource Group (if it doesn't already exist).
-   Create an Azure Container Registry (ACR) to store your Docker images securely.
-   Log in to the newly created ACR.
-   Build the Docker image.
-   Tag the Docker image with your ACR login server.
-   Push the Docker image to ACR.
-   Create an Azure App Service Plan (a hosting plan for your web app).
-   Create an Azure Web App for Containers and configure it to pull the Docker image from your ACR.
-   Set necessary application settings, including `WEBSITES_PORT` and `NODE_ENV=production`, and provide ACR credentials for secure image pull.
-   Output the public URL of your deployed Azure Web App.

### Manual Azure Configuration (for detailed understanding)

If you prefer to understand each step of the Azure configuration manually, here are the commands:

1.  **Build the Docker image:**
    ```bash
    sudo docker build -t network-conversion-trainer .
    ```

2.  **Create an Azure Resource Group and Azure Container Registry:**
    ```bash
    az group create --name <your-resource-group-name> --location <your-location>
    az acr create --resource-group <your-resource-group-name> --name <your-acr-name> --sku Basic --admin-enabled true
    ```

3.  **Retrieve ACR credentials, log in to the registry, and push the image:**
    ```bash
    ACR_USERNAME=$(az acr credential show --name <your-acr-name> --query "username" -o tsv)
    ACR_PASSWORD=$(az acr credential show --name <your-acr-name> --query "passwords[0].value" -o tsv)
    echo $ACR_PASSWORD | sudo docker login <your-acr-name>.azurecr.io --username $ACR_USERNAME --password-stdin
    sudo docker tag network-conversion-trainer:latest <your-acr-name>.azurecr.io/network-conversion-trainer:latest
    sudo docker push <your-acr-name>.azurecr.io/network-conversion-trainer:latest
    ```

4.  **Create an App Service Plan and App Service:**
    ```bash
    az appservice plan create --resource-group <your-resource-group-name> --name <your-app-service-plan-name> --is-linux --sku B1
    az webapp create --resource-group <your-resource-group-name> --plan <your-app-service-plan-name> --name <your-web-app-name> --deployment-container-image-name <your-acr-name>.azurecr.io/network-conversion-trainer:latest
    ```

5.  **Configure container settings for the Web App:**
    ```bash
    az webapp config appsettings set --resource-group <your-resource-group-name> --name <your-web-app-name> --settings \
  WEBSITES_PORT=5000 \
  DOCKER_REGISTRY_SERVER_URL=https://<your-acr-name>.azurecr.io \
  DOCKER_REGISTRY_SERVER_USERNAME=$ACR_USERNAME \
  DOCKER_REGISTRY_SERVER_PASSWORD=$ACR_PASSWORD \
  NODE_ENV=production
    ```
    The application will be available at `https://<your-web-app-name>.azurewebsites.net`.

## Updating the Application

To update the application (e.g., after making code changes, pushing to GitHub, or updating the Docker image and Azure deployment):

1.  **Commit and push code changes to GitHub (after setting up Git locally - see next steps).**
2.  **Run the update script:**
    This script will rebuild the Docker image, push it to ACR, and trigger a redeployment on Azure App Service.
    ```bash
    ./update-all.sh
    ```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT