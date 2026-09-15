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

# Obtain / verify Let's Encrypt Certificate
echo "📜 Requesting SSL certificate from Let's Encrypt for $DOMAIN..."
certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --expand || true

# Open firewall ports for HTTP and HTTPS
echo "🛡️ Opening Firewall ports 80 and 443..."
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || true
firewall-cmd --permanent --add-port=443/tcp 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true
iptables -I INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || true

# Rebuild frontend container with new SSL nginx config and start stack
echo "🚀 Rebuilding Frontend with SSL Support and starting Docker Stack..."
docker compose build --no-cache frontend
docker compose up -d

echo "✅ SSL Configuration Complete! Visit: https://$DOMAIN"