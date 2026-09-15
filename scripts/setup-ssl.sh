#!/usr/bin/env bash
set -e

DOMAIN="pr.nkbmanufacturing.com"
EMAIL="admin@nkbmanufacturing.com"

echo "🔐 Setting up Free SSL Certificate (HTTPS) for $DOMAIN on VPS..."

# Install Certbot if missing
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt-get update && apt-get install -y certbot || yum install -y certbot || true
fi

# Temporarily stop container on port 80 for standalone certificate issuance
echo "⏳ Temporarily releasing port 80 for SSL verification..."
docker compose down 2>/dev/null || true
fuser -k 80/tcp 2>/dev/null || true

# Obtain Let's Encrypt Certificate
echo "📜 Requesting SSL certificate from Let's Encrypt for $DOMAIN..."
certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" || {
    echo "⚠️ Note: Make sure DNS A Record for $DOMAIN points to this VPS IP (187.77.143.211) before issuing SSL."
}

# Restart Docker Stack
echo "🚀 Restarting Docker Stack with SSL Support..."
docker compose up -d

echo "✅ SSL Configuration Complete! Visit: https://$DOMAIN"