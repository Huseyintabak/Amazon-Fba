#!/bin/bash

# =====================================================
# Amazon FBA Tracker - Quick Update Script
# =====================================================
# Bu script sadece güncelleme yapar (kurulum değil)

set -e

# Renkli output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Konfigürasyon
PROJECT_DIR="/var/www/amazon-fba-tracker"
BACKUP_DIR="/var/backups/amazon-fba-tracker"

log "🔄 Amazon FBA Tracker güncelleniyor..."

# Proje dizini var mı kontrol et
if [ ! -d "$PROJECT_DIR" ]; then
    error "Proje dizini bulunamadı: $PROJECT_DIR"
    error "Önce ./server-deploy.sh ile kurulum yapın!"
    exit 1
fi

cd $PROJECT_DIR

# Git durumunu kontrol et
log "📋 Git durumu kontrol ediliyor..."
git fetch origin

# Yeni commit var mı kontrol et
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    success "Zaten güncel! Yeni güncelleme yok."
    exit 0
fi

log "🆕 Yeni güncelleme bulundu!"

# Backup oluştur
log "💾 Mevcut build yedekleniyor..."
if [ -d "dist" ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p $BACKUP_DIR
    cp -r dist $BACKUP_DIR/$BACKUP_NAME
    success "Backup oluşturuldu: $BACKUP_NAME"
fi

# Git pull
log "⬇️ Yeni değişiklikler çekiliyor..."
git pull origin main

# Dependencies güncelle
log "📦 Dependencies güncelleniyor..."
npm ci

# Build
log "🔨 Yeni build oluşturuluyor..."
npm run build

# Build kontrolü
if [ ! -d "dist" ]; then
    error "Build başarısız!"
    exit 1
fi

# Nginx reload
log "🔄 Nginx yeniden yükleniyor..."
systemctl reload nginx

# Service restart
log "🔄 Service yeniden başlatılıyor..."
systemctl restart amazon-fba-tracker

success "🎉 Güncelleme tamamlandı!"
log "🌐 Uygulama: http://$(hostname -I | awk '{print $1}')"

# Disk temizliği (eski backup'ları sil)
log "🧹 Eski backup'lar temizleniyor..."
find $BACKUP_DIR -name "backup-*" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

success "✨ Güncelleme scripti tamamlandı!"
