#!/bin/bash

# Enterprise ERP Hostinger Automated Deployment Script
echo "================================================="
echo "🚀 Enterprise ERP Automated Deployment Starting..."
echo "================================================="

# Pull latest changes from GitHub
git pull origin main

# Install & Build Backend
echo "📦 Building Backend..."
cd backend
npm install --production
node src/scripts/migrate.js

# Restart Backend Process via PM2 if available
if command -v pm2 &> /dev/null
then
    pm2 restart pr-backend || pm2 start src/server.js --name "pr-backend"
    pm2 save
fi

cd ..

# Build Frontend Static Assets
echo "🎨 Building Frontend Static Assets..."
cd frontend
npm install
npm run build

echo "================================================="
echo "✅ Automated Deployment Completed Successfully!"
echo "================================================="
