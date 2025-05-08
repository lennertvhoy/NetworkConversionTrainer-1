#!/bin/bash
set -e

# Maak de deployment scripts uitvoerbaar
echo "Scripts uitvoerbaar maken..."
chmod +x azure-deploy.sh
chmod +x build.sh

# Installeer dependencies
echo "Node.js dependencies installeren..."
npm install

echo "Installatie voltooid!"
echo ""
echo "Om de app lokaal te starten:"
echo "npm run dev"
echo ""
echo "Om te deployen naar Azure:"
echo "./azure-deploy.sh"
echo ""