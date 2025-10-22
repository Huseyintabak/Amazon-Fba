#!/bin/bash

# =====================================================
# Amazon FBA Tracker - Server Auto Deploy Script
# =====================================================
# Bu script sunucuda otomatik kurulum ve güncelleme yapar

set -e  # Hata durumunda scripti durdur

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonu
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
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
REPO_URL="https://github.com/Huseyintabak/Amazon-Fba.git"
PROJECT_DIR="/var/www/amazon-fba-tracker"
BACKUP_DIR="/var/backups/amazon-fba-tracker"
NGINX_CONFIG="/etc/nginx/sites-available/amazon-fba-tracker"
NGINX_ENABLED="/etc/nginx/sites-enabled/amazon-fba-tracker"
SERVICE_NAME="amazon-fba-tracker"
PORT=3000

log "🚀 Amazon FBA Tracker - Server Auto Deploy Script Başlatılıyor..."

# Root kontrolü
if [ "$EUID" -ne 0 ]; then
    error "Bu script root yetkisi ile çalıştırılmalıdır!"
    exit 1
fi

# Sistem güncellemesi
log "📦 Sistem paketleri güncelleniyor..."
apt update -y
apt upgrade -y

# Gerekli paketlerin kurulumu
log "🔧 Gerekli paketler kuruluyor..."
apt install -y curl wget git nginx nodejs npm build-essential

# Node.js versiyonunu kontrol et
NODE_VERSION=$(node --version)
log "📋 Node.js versiyonu: $NODE_VERSION"

# NPM versiyonunu kontrol et
NPM_VERSION=$(npm --version)
log "📋 NPM versiyonu: $NPM_VERSION"

# Proje dizinini oluştur
log "📁 Proje dizini oluşturuluyor: $PROJECT_DIR"
mkdir -p $PROJECT_DIR
mkdir -p $BACKUP_DIR

# Git repository'sini klonla veya güncelle
if [ -d "$PROJECT_DIR/.git" ]; then
    log "🔄 Mevcut repository güncelleniyor..."
    cd $PROJECT_DIR
    git fetch origin
    git reset --hard origin/main
    success "Repository güncellendi"
else
    log "📥 Repository klonlanıyor..."
    git clone $REPO_URL $PROJECT_DIR
    success "Repository klonlandı"
fi

# Proje dizinine geç
cd $PROJECT_DIR

# Backup oluştur
log "💾 Mevcut build yedekleniyor..."
if [ -d "dist" ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    cp -r dist $BACKUP_DIR/$BACKUP_NAME
    success "Backup oluşturuldu: $BACKUP_NAME"
fi

# Dependencies kurulumu
log "📦 Dependencies kuruluyor..."
npm ci --production=false

# Build işlemi
log "🔨 Production build oluşturuluyor..."
npm run build

# Build başarılı mı kontrol et
if [ ! -d "dist" ]; then
    error "Build başarısız! dist klasörü bulunamadı."
    exit 1
fi

success "Build başarılı!"

# Nginx konfigürasyonu
log "🌐 Nginx konfigürasyonu oluşturuluyor..."
cat > $NGINX_CONFIG << EOF
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

    # SPA routing - tüm istekleri index.html'e yönlendir
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
EOF

# Nginx sites-enabled linkini oluştur
ln -sf $NGINX_CONFIG $NGINX_ENABLED

# Nginx konfigürasyonunu test et
log "🔍 Nginx konfigürasyonu test ediliyor..."
nginx -t

if [ $? -eq 0 ]; then
    success "Nginx konfigürasyonu geçerli"
    
    # Nginx'i yeniden başlat
    log "🔄 Nginx yeniden başlatılıyor..."
    systemctl reload nginx
    success "Nginx yeniden başlatıldı"
else
    error "Nginx konfigürasyonu geçersiz!"
    exit 1
fi

# Firewall kuralları
log "🔥 Firewall kuralları ayarlanıyor..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Systemd service oluştur (opsiyonel)
log "⚙️ Systemd service oluşturuluyor..."
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=Amazon FBA Tracker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/npm run preview -- --port $PORT --host 0.0.0.0
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Service'i etkinleştir
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# Durum kontrolü
log "📊 Servis durumu kontrol ediliyor..."
systemctl status $SERVICE_NAME --no-pager

# Disk kullanımı
log "💾 Disk kullanımı:"
df -h $PROJECT_DIR

# Build boyutu
log "📦 Build boyutu:"
du -sh $PROJECT_DIR/dist

# Başarı mesajı
success "🎉 Deployment tamamlandı!"
log "🌐 Uygulama erişilebilir: http://$(hostname -I | awk '{print $1}')"
log "📁 Proje dizini: $PROJECT_DIR"
log "📋 Nginx config: $NGINX_CONFIG"
log "🔄 Güncelleme için: ./server-deploy.sh"

# Cron job oluştur (günlük güncelleme)
log "⏰ Otomatik güncelleme cron job'u oluşturuluyor..."
(crontab -l 2>/dev/null; echo "0 2 * * * cd $PROJECT_DIR && ./server-deploy.sh >> /var/log/amazon-fba-tracker-deploy.log 2>&1") | crontab -

success "✨ Server Auto Deploy Script tamamlandı!"
