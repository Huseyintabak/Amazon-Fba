#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log "🔧 Dosya izinleri düzeltiliyor..."

# 1. dist klasörünün sahipliğini değiştir
log "📁 dist klasörü sahipliği değiştiriliyor..."
sudo chown -R www-data:www-data /var/www/amazon-fba-tracker/dist 2>/dev/null || true

# 2. dist klasörünü tamamen sil
log "🗑️  Eski dist klasörü siliniyor..."
sudo rm -rf /var/www/amazon-fba-tracker/dist

# 3. Yeni dist klasörü oluştur
log "📁 Yeni dist klasörü oluşturuluyor..."
sudo mkdir -p /var/www/amazon-fba-tracker/dist
sudo chown -R www-data:www-data /var/www/amazon-fba-tracker/dist

# 4. Build yap
log "🔨 Yeni build oluşturuluyor..."
cd /var/www/amazon-fba-tracker
sudo npm run build:server

# 5. Build başarılı mı kontrol et
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    error "Build başarısız! dist klasörü veya index.html bulunamadı."
    exit 1
fi

# 6. Dosya sahipliğini düzelt
log "🔐 Dosya sahipliği düzeltiliyor..."
sudo chown -R www-data:www-data /var/www/amazon-fba-tracker/dist

# 7. Service'i yeniden başlat
log "🔄 Service yeniden başlatılıyor..."
if systemctl is-active --quiet amazon-fba-tracker; then
    sudo systemctl restart amazon-fba-tracker
    success "Service yeniden başlatıldı!"
else
    warning "Service çalışmıyor, başlatılıyor..."
    sudo systemctl start amazon-fba-tracker
fi

# 8. Service durumunu kontrol et
if systemctl is-active --quiet amazon-fba-tracker; then
    success "✅ Amazon FBA Tracker başarıyla çalışıyor!"
    log "🌐 Uygulama: http://192.168.1.250:8080"
else
    error "❌ Service başlatılamadı!"
    log "📋 Service logları: sudo journalctl -u amazon-fba-tracker -f"
fi
