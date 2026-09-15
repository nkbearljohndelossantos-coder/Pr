# Enterprise ERP Backend Production Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Ensure upload and data persistence directories exist
RUN mkdir -p /app/uploads /app/src/data /app/backups /app/public/uploads

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "src/server.js"]
