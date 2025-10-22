#!/bin/bash

# =====================================================
# Amazon FBA Tracker - Production Deployment Script
# =====================================================

echo "🚀 Amazon FBA Tracker - Production Deployment Başlatılıyor..."

# 1. Build oluştur
echo "📦 Production build oluşturuluyor..."
npm run build

# 2. Build başarılı mı kontrol et
if [ ! -d "dist" ]; then
    echo "❌ Build başarısız! dist klasörü bulunamadı."
    exit 1
fi

echo "✅ Build başarılı!"

# 3. Git'e commit et
echo "📝 Değişiklikler Git'e commit ediliyor..."
git add .
git commit -m "Production deployment - $(date)"

# 4. GitHub'a push et
echo "⬆️ GitHub'a push ediliyor..."
git push origin main

echo "🎉 Deployment tamamlandı!"
echo "📊 Build boyutu:"
du -sh dist/

echo "🌐 Deployment URL'leri:"
echo "   GitHub: https://github.com/Huseyintabak/Amazon-Fba"
echo "   Raw Files: https://raw.githubusercontent.com/Huseyintabak/Amazon-Fba/main/dist/"

echo "✨ Production build hazır!"