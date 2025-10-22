#!/bin/bash

# =====================================================
# Amazon FBA Tracker - Force Update Script
# =====================================================
# Bu script conflict'leri otomatik olarak çözer

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
BACKUP_DIR="/var/backups/amazon-fba-tracker"

log "🔄 Amazon FBA Tracker force update başlatılıyor..."

# Proje dizini var mı kontrol et
if [ ! -d "$PROJECT_DIR" ]; then
    error "Proje dizini bulunamadı: $PROJECT_DIR"
    exit 1
fi

cd $PROJECT_DIR

# Git durumunu kontrol et
log "📋 Git durumu kontrol ediliyor..."
git fetch origin

# Yerel değişiklikleri stash'le
log "💾 Yerel değişiklikler stash'leniyor..."
git stash push -m "Auto-stash before force update $(date)"

# Remote'dan güncellemeleri çek (force)
log "⬇️ Remote değişiklikler çekiliyor..."
git reset --hard origin/main

# Backup oluştur
log "💾 Mevcut build yedekleniyor..."
if [ -d "dist" ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p $BACKUP_DIR
    cp -r dist $BACKUP_DIR/$BACKUP_NAME
    success "Backup oluşturuldu: $BACKUP_NAME"
fi

# Dependencies güncelle
log "📦 Dependencies güncelleniyor..."
npm ci

# Build
log "🔨 Yeni build oluşturuluyor..."
npm run build:server

# Build başarılı mı kontrol et
if [ ! -d "dist" ]; then
    error "Build başarısız! dist klasörü bulunamadı."
    exit 1
fi

# Nginx reload
log "🔄 Nginx yeniden yükleniyor..."
systemctl reload nginx

# Service restart (eğer varsa)
log "🔄 Service yeniden başlatılıyor..."
if systemctl list-units --type=service | grep -q "amazon-fba-tracker"; then
    systemctl restart amazon-fba-tracker
    success "Service yeniden başlatıldı"
else
    warning "Service bulunamadı, ./fix-service.sh ile oluşturun"
fi

success "🎉 Force update tamamlandı!"
log "🌐 Uygulama: http://$(hostname -I | awk '{print $1}')"

# Disk temizliği (eski backup'ları sil)
log "🧹 Eski backup'lar temizleniyor..."
find $BACKUP_DIR -name "backup-*" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

success "✨ Force update scripti tamamlandı!"
