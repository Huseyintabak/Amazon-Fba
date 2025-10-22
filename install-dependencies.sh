#!/bin/bash

# =====================================================
# Amazon FBA Tracker - Dependencies Install Script
# =====================================================
# Bu script gerekli bağımlılıkları kurar

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

log "🔧 Amazon FBA Tracker dependencies kuruluyor..."

# Root kontrolü
if [ "$EUID" -ne 0 ]; then
    error "Bu script root yetkisi ile çalıştırılmalıdır!"
    exit 1
fi

# Sistem güncellemesi
log "📦 Sistem paketleri güncelleniyor..."
apt update -y

# Gerekli paketlerin kurulumu
log "🔧 Gerekli paketler kuruluyor..."
apt install -y curl wget git nginx build-essential

# Node.js kurulumu
log "📦 Node.js kuruluyor..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    success "Node.js kuruldu"
else
    NODE_VERSION=$(node --version)
    log "Node.js zaten kurulu: $NODE_VERSION"
fi

# NPM versiyonunu kontrol et
NPM_VERSION=$(npm --version)
log "NPM versiyonu: $NPM_VERSION"

# PM2 kurulumu (opsiyonel)
log "📦 PM2 kuruluyor..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    success "PM2 kuruldu"
else
    log "PM2 zaten kurulu"
fi

# Nginx konfigürasyonu
log "🌐 Nginx konfigürasyonu kontrol ediliyor..."
if [ ! -f "/etc/nginx/sites-available/amazon-fba-tracker" ]; then
    log "Nginx konfigürasyonu oluşturuluyor..."
    cat > /etc/nginx/sites-available/amazon-fba-tracker << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/amazon-fba-tracker/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

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
EOF

    # Sites-enabled linkini oluştur
    ln -sf /etc/nginx/sites-available/amazon-fba-tracker /etc/nginx/sites-enabled/
    
    # Default site'ı devre dışı bırak
    rm -f /etc/nginx/sites-enabled/default
    
    # Nginx konfigürasyonunu test et
    nginx -t
    
    if [ $? -eq 0 ]; then
        systemctl reload nginx
        success "Nginx konfigürasyonu oluşturuldu"
    else
        error "Nginx konfigürasyonu geçersiz!"
        exit 1
    fi
else
    log "Nginx konfigürasyonu zaten mevcut"
fi

# Firewall kuralları
log "🔥 Firewall kuralları ayarlanıyor..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Proje dizinini oluştur
log "📁 Proje dizini oluşturuluyor..."
mkdir -p /var/www/amazon-fba-tracker
chown -R www-data:www-data /var/www/amazon-fba-tracker

success "🎉 Dependencies kurulumu tamamlandı!"
log "📋 Kurulan paketler:"
log "   - Node.js: $(node --version)"
log "   - NPM: $(npm --version)"
log "   - PM2: $(pm2 --version 2>/dev/null || echo 'Kurulmadı')"
log "   - Nginx: $(nginx -v 2>&1 | cut -d' ' -f3)"
log "   - Git: $(git --version | cut -d' ' -f3)"

log "📋 Sonraki adımlar:"
log "   1. cd /var/www/amazon-fba-tracker"
log "   2. sudo git clone https://github.com/Huseyintabak/Amazon-Fba.git ."
log "   3. sudo npm install"
log "   4. sudo ./fix-service.sh"
log "   5. sudo ./update.sh"

success "✨ Dependencies install scripti tamamlandı!"
