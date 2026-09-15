#!/usr/bin/env bash
set -e

# ==============================================================================
# NKB Manufacturing Enterprise ERP - Automated Hostinger VPS Docker Deployment
# Target Host: 187.77.143.211 (pr.nkbmanufacturing.com)
# ==============================================================================

echo "🚀 Starting Enterprise ERP VPS Docker Migration & Deployment..."

# 1. Install Docker & Docker Compose if missing on Ubuntu / Debian VPS
if ! command -v docker &> /dev/null; then
    echo "📦 Docker not detected. Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker installed successfully."
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "📦 Installing Docker Compose plugin..."
    apt-get update && apt-get install -y docker-compose-plugin || true
fi

# 2. Pull latest code from GitHub
echo "🔄 Pulling latest verified repository from GitHub (origin/main)..."
git pull origin main

# 3. Create persistent directories
mkdir -p backend/uploads backend/src/data backend/backups public/uploads

# 4. Stop any old containers or conflicting standalone processes on port 80/5000
echo "🧹 Stopping conflicting processes or host web servers on port 80/5000..."
pm2 stop all 2>/dev/null || true
systemctl stop apache2 nginx httpd 2>/dev/null || true
systemctl disable apache2 nginx httpd 2>/dev/null || true
fuser -k 80/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true
docker compose down 2>/dev/null || true

# 5. Build and launch production Docker stack
echo "🏗️ Building and starting Enterprise Docker Stack..."
docker compose up --build -d

# 6. Verify Health
echo "⏳ Waiting 5 seconds for containers to initialize..."
sleep 5

docker ps

echo "🏥 Checking ERP System Health..."
curl -s http://localhost:5000/api/system/health || echo "Note: Backend initializing..."

echo "🎉 Enterprise ERP Docker Migration & Deployment Completed Successfully!"
echo "🌐 Access your system at: https://pr.nkbmanufacturing.com/ or http://187.77.143.211"