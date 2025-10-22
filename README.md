# 🚚 Amazon FBA Tracker

Modern, responsive Amazon FBA sevkiyat takip sistemi. React, TypeScript, Supabase ve Tailwind CSS ile geliştirilmiştir.

## ✨ Özellikler

### 📦 Ürün Yönetimi
- **Pagination**: 50'li gruplar halinde ürün listesi
- **Sıralama**: A-Z / Z-A sıralama (tüm sütunlar)
- **CSV Import**: Toplu ürün ekleme
- **Akıllı Arama**: Gelişmiş filtreleme sistemi
- **CRUD İşlemleri**: Tam ürün yönetimi

### 🚚 Sevkiyat Yönetimi
- **FBA Shipment ID**: Benzersiz sevkiyat takibi
- **Kargo Firması**: UPS, FedEx, DHL desteği
- **Maliyet Takibi**: Detaylı kargo maliyeti
- **Durum Yönetimi**: Taslak/Tamamlandı

### 📊 Raporlama
- **Dashboard**: Genel bakış ve istatistikler
- **Grafikler**: Aylık dağılım ve trendler
- **Kargo Performansı**: Firma bazlı analiz
- **Maliyet Analizi**: Detaylı maliyet raporları

## 🛠️ Teknolojiler

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/Huseyintabak/Amazon-Fba.git
cd Amazon-Fba
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın**
```bash
cp env.example .env
```

`.env` dosyasını düzenleyin:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Supabase veritabanını kurun**
- `supabase-schema.sql` dosyasını Supabase SQL Editor'da çalıştırın

5. **Development server'ı başlatın**
```bash
npm run dev
```

## 📦 Production Build

```bash
# Build oluştur
npm run build

# Preview
npm run preview
```

## 🚀 Deployment

### GitHub Pages (Otomatik)
```bash
# Otomatik deployment
./deploy.sh
```

### Sunucu Deployment (Manuel)
```bash
# Tam kurulum (ilk kez)
sudo ./server-deploy.sh

# Sadece güncelleme
sudo ./update.sh

# Docker ile deployment
sudo ./docker-deploy.sh
```

### Manuel Deployment
1. `npm run build` ile dist klasörü oluşturun
2. dist klasörünü web sunucunuza yükleyin
3. SPA routing için tüm istekleri index.html'e yönlendirin

## 📁 Proje Yapısı

```
src/
├── components/          # UI Bileşenleri
├── contexts/           # React Contexts
├── hooks/              # Custom Hooks
├── lib/                # Utility Functions
├── pages/              # Sayfa Bileşenleri
├── stores/              # Zustand Stores
└── types/               # TypeScript Types
```

## 🔧 Geliştirme

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Build preview
npm run lint         # ESLint kontrolü
```

### Veritabanı Temizleme
```bash
# Tüm verileri temizle
node clear-database.js
```

## 📊 Özellik Detayları

### Pagination
- **50'li gruplar**: Her sayfada 50 ürün
- **Akıllı sayfa numaraları**: Maksimum 5 sayfa gösterimi
- **Responsive**: Mobil ve desktop uyumlu
- **Smooth scroll**: Sayfa değiştirirken üste kaydırma

### Sıralama
- **Tüm sütunlar**: Ürün Adı, ASIN, SKU, Üretici, Maliyet, Tarih
- **A-Z / Z-A**: Alfabetik ve sayısal sıralama
- **Tarih sıralama**: Eski-yeni / yeni-eski
- **Visual feedback**: ↑ ↓ okları ile durum gösterimi

### CSV Import
- **Validation**: Kapsamlı veri doğrulama
- **Duplicate check**: ASIN ve SKU tekrar kontrolü
- **Error handling**: Detaylı hata mesajları
- **Batch processing**: Toplu ürün ekleme

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **GitHub**: [@Huseyintabak](https://github.com/Huseyintabak)
- **Repository**: [Amazon-Fba](https://github.com/Huseyintabak/Amazon-Fba)

---

**🚀 Amazon FBA Tracker - Modern sevkiyat takip sistemi**