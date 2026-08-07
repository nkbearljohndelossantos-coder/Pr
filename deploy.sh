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
node src/scripts/migrate.js 2>/dev/null || true

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

cd ..

# Copy compiled assets to root and public_html_ready for Hostinger static serving
echo "📂 Syncing production assets to root and public_html_ready..."
cp -r frontend/dist/* ./
cp -r frontend/dist/* ./public_html_ready/
cp .htaccess ./public_html_ready/.htaccess 2>/dev/null || true

echo "================================================="
echo "✅ Automated Deployment Completed Successfully!"
echo "================================================="
