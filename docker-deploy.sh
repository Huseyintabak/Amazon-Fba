#!/bin/bash

# =====================================================
# Amazon FBA Tracker - Docker Auto Deploy Script
# =====================================================
# Bu script Docker ile otomatik deployment yapar

set -e

# Renkli output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Konfigürasyon
PROJECT_NAME="amazon-fba-tracker"
CONTAINER_NAME="amazon-fba-tracker-app"
IMAGE_NAME="amazon-fba-tracker:latest"
PORT=3000
REPO_URL="https://github.com/Huseyintabak/Amazon-Fba.git"

log "🐳 Amazon FBA Tracker - Docker Auto Deploy Başlatılıyor..."

# Docker kurulu mu kontrol et
if ! command -v docker &> /dev/null; then
    log "📦 Docker kuruluyor..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    success "Docker kuruldu"
fi

# Docker Compose kurulu mu kontrol et
if ! command -v docker-compose &> /dev/null; then
    log "📦 Docker Compose kuruluyor..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    success "Docker Compose kuruldu"
fi

# Dockerfile oluştur
log "📝 Dockerfile oluşturuluyor..."
cat > Dockerfile << 'EOF'
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# Nginx config oluştur
log "🌐 Nginx config oluşturuluyor..."
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
EOF

# Docker Compose file oluştur
log "🐳 Docker Compose file oluşturuluyor..."
cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build: .
    container_name: $CONTAINER_NAME
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/var/log/nginx
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
EOF

# Eski container'ı durdur ve sil
log "🔄 Eski container durduruluyor..."
docker-compose down 2>/dev/null || true

# Eski image'ı sil
log "🗑️ Eski image temizleniyor..."
docker rmi $IMAGE_NAME 2>/dev/null || true

# Yeni image build et
log "🔨 Yeni Docker image build ediliyor..."
docker-compose build --no-cache

# Container'ı başlat
log "🚀 Container başlatılıyor..."
docker-compose up -d

# Container durumunu kontrol et
log "📊 Container durumu kontrol ediliyor..."
sleep 5
docker-compose ps

# Health check
log "🏥 Health check yapılıyor..."
sleep 10
if curl -f http://localhost > /dev/null 2>&1; then
    success "Uygulama çalışıyor!"
else
    warning "Uygulama henüz hazır değil, birkaç saniye bekleyin..."
fi

# Log'ları göster
log "📋 Son log'lar:"
docker-compose logs --tail=20

success "🎉 Docker deployment tamamlandı!"
log "🌐 Uygulama: http://$(hostname -I | awk '{print $1}')"
log "📊 Container durumu: docker-compose ps"
log "📋 Log'lar: docker-compose logs -f"
log "🔄 Güncelleme: ./docker-deploy.sh"

# Otomatik güncelleme cron job'u
log "⏰ Otomatik güncelleme cron job'u oluşturuluyor..."
(crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && ./docker-deploy.sh >> /var/log/docker-deploy.log 2>&1") | crontab -

success "✨ Docker Auto Deploy Script tamamlandı!"
