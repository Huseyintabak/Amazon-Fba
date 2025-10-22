#!/bin/bash

# =====================================================
# Amazon FBA Tracker - Service Fix for Port 8080
# =====================================================

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
PORT=8080

log "🔧 Amazon FBA Tracker service 8080 portu için düzeltiliyor..."

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
    PORT=8081
    if netstat -tlnp | grep -q ":$PORT "; then
        PORT=8082
    fi
    log "Yeni port: $PORT"
fi

# Mevcut service'i durdur
log "🛑 Mevcut service durduruluyor..."
if systemctl list-units --type=service | grep -q "$SERVICE_NAME"; then
    systemctl stop $SERVICE_NAME || true
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
    log "🌐 Uygulama: http://$(hostname -I | awk '{print $1}'):$PORT"
else
    warning "Service port $PORT'da çalışmıyor olabilir"
fi

# Log'ları göster
log "📋 Son log'lar:"
journalctl -u $SERVICE_NAME --no-pager -n 10

success "🎉 Service 8080 portu için düzeltme tamamlandı!"
log "📊 Service durumu: systemctl status $SERVICE_NAME"
log "📋 Log'lar: journalctl -u $SERVICE_NAME -f"
log "🔄 Yeniden başlatma: systemctl restart $SERVICE_NAME"
log "🛑 Durdurma: systemctl stop $SERVICE_NAME"

success "✨ Service fix 8080 scripti tamamlandı!"
