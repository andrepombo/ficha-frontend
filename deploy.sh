#!/bin/bash

# Frontend Deployment Script
# Run this on EC2 to deploy/update the frontend

set -e

echo "=========================================="
echo "Deploying Frontend..."
echo "=========================================="

# Navigate to frontend directory
cd /var/www/pinte-fichas/frontend

# Pull latest code
echo "→ Pulling latest code..."
git pull

# Install dependencies
echo "→ Installing dependencies..."
npm install

# Build production bundle
echo "→ Building production bundle..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✓ Frontend deployed successfully!"
    echo ""
    echo "Built files are in: /var/www/pinte-fichas/frontend/dist"
    echo "Accessible at: https://yourdomain.com.br/painel"
else
    echo "✗ Build failed"
    exit 1
fi
