# Enterprise ERP - Live Domain Production Deployment Guide

This document outlines the step-by-step instructions to deploy the Enterprise ERP Platform to your live domain server.

---

## 🚀 Option 1: Docker Compose Deployment (Recommended for VPS / Hostinger / AWS / DigitalOcean)

### Prerequisites:
- A Linux VPS with Docker and Docker Compose installed.

### Steps:

1. **Clone the repository on your server**:
   ```bash
   git clone https://github.com/nkbearljohndelossantos-coder/Pr.git
   cd Pr
   ```

2. **Launch the production containers**:
   ```bash
   docker-compose up -d --build
   ```

3. **Verify running services**:
   ```bash
   docker-compose ps
   ```
   Your app is now live on Port 80!

---

## 🛠️ Option 2: Traditional Node.js + Nginx VPS Deployment

### 1. Build Frontend Static Assets:
```bash
cd frontend
npm ci
npm run build
```
The output files will be in `frontend/dist`.

### 2. Configure Nginx Web Server (`/etc/nginx/sites-available/yourdomain`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/Pr/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
    }
}
```

### 3. Start Backend Node.js Service with PM2:
```bash
cd backend
npm ci
npm install -g pm2
pm2 start src/server.js --name "erp-backend"
pm2 save
pm2 startup
```

---

## 🔐 Optional: Enable Free SSL HTTPS Certificate with Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔑 Default Administrator Accounts:
- **System Administrator (IT)**: `username: admin` | `password: admin123`
- **Executive Administrator**: `username: boss` | `password: boss123`
- **Department Account**: `username: it_dept` | `password: password123`
