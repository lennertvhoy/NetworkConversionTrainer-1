#!/bin/bash
set -e

# Schoonmaken van oude builds
echo "Schoonmaken van oude builds..."
rm -rf dist

# Installeren van dependencies
echo "Dependencies installeren..."
npm install

# Bouwen van de applicatie
echo "Applicatie bouwen..."
npm run build

# Docker image bouwen (optioneel)
if [ "$1" == "--docker" ]; then
  echo "Docker image bouwen..."
  docker build -t netpractice:latest .
  echo "Docker image is succesvol gebouwd."
fi

echo "Build succesvol voltooid!"