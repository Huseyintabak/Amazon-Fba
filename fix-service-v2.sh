#!/bin/bash

# =====================================================
# Amazon FBA Tracker - Service Fix Script V2
# =====================================================
# Bu script systemd service'ini daha güvenli şekilde oluşturur

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
PROJECT_DIR="/var/www/amazon-fba-tracker"
SERVICE_NAME="amazon-fba-tracker"
PORT=3000

log "🔧 Amazon FBA Tracker service V2 düzeltiliyor..."

# Root kontrolü
if [ "$EUID" -ne 0 ]; then
    error "Bu script root yetkisi ile çalıştırılmalıdır!"
    exit 1
fi

# Proje dizini var mı kontrol et
if [ ! -d "$PROJECT_DIR" ]; then
    error "Proje dizini bulunamadı: $PROJECT_DIR"
    exit 1
fi

cd $PROJECT_DIR

# Build var mı kontrol et
if [ ! -d "dist" ]; then
    log "📦 Build bulunamadı, oluşturuluyor..."
    npm run build
    if [ ! -d "dist" ]; then
        error "Build oluşturulamadı!"
        exit 1
    fi
    success "Build oluşturuldu"
fi

# Port kontrolü
log "🔍 Port $PORT kontrol ediliyor..."
if netstat -tlnp | grep -q ":$PORT "; then
    warning "Port $PORT kullanımda, farklı port denenecek..."
    PORT=3001
    if netstat -tlnp | grep -q ":$PORT "; then
        PORT=3002
    fi
    log "Yeni port: $PORT"
fi

# Mevcut service'i durdur
log "🛑 Mevcut service durduruluyor..."
if systemctl list-units --type=service | grep -q "$SERVICE_NAME"; then
    systemctl stop $SERVICE_NAME || true
    systemctl disable $SERVICE_NAME || true
fi

# Service dosyasını oluştur
log "📝 Systemd service dosyası oluşturuluyor..."
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=Amazon FBA Tracker
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/npm run preview -- --port $PORT --host 0.0.0.0
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$PROJECT_DIR

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
EOF

# Service'i etkinleştir
log "⚙️ Service etkinleştiriliyor..."
systemctl daemon-reload
systemctl enable $SERVICE_NAME

# Service'i başlat
log "🚀 Service başlatılıyor..."
systemctl start $SERVICE_NAME

# Durum kontrolü
log "📊 Service durumu kontrol ediliyor..."
sleep 5
systemctl status $SERVICE_NAME --no-pager

# Port kontrolü
log "🌐 Port kontrolü yapılıyor..."
if netstat -tlnp | grep -q ":$PORT "; then
    success "Service port $PORT'da çalışıyor!"
else
    warning "Service port $PORT'da çalışmıyor olabilir"
fi

# Log'ları göster
log "📋 Son log'lar:"
journalctl -u $SERVICE_NAME --no-pager -n 20

# Nginx konfigürasyonunu güncelle
log "🌐 Nginx konfigürasyonu güncelleniyor..."
if [ -f "/etc/nginx/sites-available/amazon-fba-tracker" ]; then
    # Nginx'i sadece static dosyalar için kullan
    cat > /etc/nginx/sites-available/amazon-fba-tracker << EOF
server {
    listen 80;
    server_name _;
    root $PROJECT_DIR/dist;
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
        try_files \$uri \$uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

    nginx -t && systemctl reload nginx
    success "Nginx konfigürasyonu güncellendi"
fi

success "🎉 Service V2 düzeltme tamamlandı!"
log "📊 Service durumu: systemctl status $SERVICE_NAME"
log "📋 Log'lar: journalctl -u $SERVICE_NAME -f"
log "🔄 Yeniden başlatma: systemctl restart $SERVICE_NAME"
log "🛑 Durdurma: systemctl stop $SERVICE_NAME"
log "🌐 Uygulama: http://$(hostname -I | awk '{print $1}')"

success "✨ Service fix V2 scripti tamamlandı!"
