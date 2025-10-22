#!/bin/bash

# Amazon FBA Tracker Deployment Script
# Sunucuya bağlandıktan sonra bu script'i çalıştırın

echo "🚀 Amazon FBA Tracker Deployment Başlıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Hata kontrolü
set -e

echo -e "${YELLOW}📁 Proje dizinine geçiliyor...${NC}"
cd /var/www/amazon-fba-tracker

echo -e "${YELLOW}🔄 Git repository güncelleniyor...${NC}"
git pull origin main

echo -e "${YELLOW}📦 Bağımlılıklar yükleniyor...${NC}"
npm install

echo -e "${YELLOW}🏗️ Production build oluşturuluyor...${NC}"
npm run build

echo -e "${YELLOW}🔧 Nginx konfigürasyonu kontrol ediliyor...${NC}"
if [ ! -f "/etc/nginx/sites-available/amazon-fba-tracker" ]; then
    echo -e "${YELLOW}📝 Nginx konfigürasyonu kopyalanıyor...${NC}"
    sudo cp nginx-config.conf /etc/nginx/sites-available/amazon-fba-tracker
    sudo ln -sf /etc/nginx/sites-available/amazon-fba-tracker /etc/nginx/sites-enabled/
    sudo nginx -t
    echo -e "${YELLOW}🔄 Nginx yeniden başlatılıyor...${NC}"
    sudo systemctl reload nginx
fi

echo -e "${YELLOW}🔐 Dosya izinleri ayarlanıyor...${NC}"
sudo chown -R www-data:www-data /var/www/amazon-fba-tracker/dist
sudo chmod -R 755 /var/www/amazon-fba-tracker/dist

echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo -e "${GREEN}🌐 Uygulama: http://192.168.1.250${NC}"
echo -e "${GREEN}📊 Supabase: https://rwxkjsnnemzuxtrzygzq.supabase.co${NC}"

# Port kontrolü
echo -e "${YELLOW}🔍 Port durumu kontrol ediliyor...${NC}"
if netstat -tuln | grep -q ":3000 "; then
    echo -e "${YELLOW}⚠️  Port 3000 kullanımda - mevcut uygulama çalışıyor${NC}"
else
    echo -e "${GREEN}✅ Port 3000 boş${NC}"
fi

if netstat -tuln | grep -q ":5181 "; then
    echo -e "${YELLOW}⚠️  Port 5181 kullanımda${NC}"
else
    echo -e "${GREEN}✅ Port 5181 boş${NC}"
fi

echo -e "${GREEN}🎉 Amazon FBA Tracker başarıyla deploy edildi!${NC}"
