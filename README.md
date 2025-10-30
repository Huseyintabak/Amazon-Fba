# 🚚 Planet FBA Tracker - SaaS Edition

Modern, multi-tenant Planet FBA sevkiyat takip sistemi. React, TypeScript, Supabase ve Tailwind CSS ile geliştirilmiş SaaS uygulaması.

## 🎯 SaaS Özellikleri

### 🔐 Multi-Tenant Architecture
- **User Authentication**: Email/Password, Magic Link, Password Reset
- **Row Level Security (RLS)**: Her kullanıcı sadece kendi verilerini görür
- **User Profiles**: Kişiselleştirilmiş profiller
- **Secure Isolation**: PostgreSQL RLS ile veri izolasyonu

### 💳 Subscription Management
- **Free Plan**: 10 ürün, 5 sevkiyat/ay
- **Pro Plan**: Sınırsız ürün ve sevkiyat
- **Feature Gating**: Plan bazlı özellik kontrolü
- **Usage Tracking**: Otomatik kullanım limiti takibi
- **Upgrade Prompts**: Akıllı yükseltme önerileri

### 📦 Ürün Yönetimi
- **Pagination**: 50'li gruplar halinde ürün listesi
- **Sıralama**: A-Z / Z-A sıralama (tüm sütunlar)
- **CSV Import**: Toplu ürün ekleme (Pro özellik)
- **CSV Export**: Veri dışa aktarma
- **Akıllı Arama**: Gelişmiş filtreleme sistemi
- **CRUD İşlemleri**: Tam ürün yönetimi

### 🚚 Sevkiyat Yönetimi
- **FBA Shipment ID**: Benzersiz sevkiyat takibi
- **Kargo Firması**: UPS, FedEx, DHL desteği
- **Maliyet Takibi**: Detaylı kargo maliyeti
- **Durum Yönetimi**: Taslak/Tamamlandı
- **Monthly Limits**: Free plan için aylık 5 sevkiyat

### 📊 Raporlama & Analytics
- **Dashboard**: Kullanıcı bazlı istatistikler
- **Grafikler**: Aylık dağılım ve trendler
- **Kargo Performansı**: Firma bazlı analiz
- **Maliyet Analizi**: Detaylı maliyet raporları
- **RLS Filtered**: Sadece kullanıcının kendi verileri

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
git clone https://github.com/Huseyintabak/Planet-FBA-Tracker.git
cd Planet-FBA-Tracker
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

**ÖNEMLİ:** SaaS versiyonu için doğru schema dosyasını kullanın!

```bash
# Supabase Dashboard → SQL Editor'da sıra ile çalıştırın:
```

a) `supabase-schema-saas.sql` - Ana database schema (tablolar, RLS, triggers)
b) `ENABLE_RLS_NOW.sql` - RLS'i etkinleştir (GÜVENLİK!)
c) `create-product-rpc.sql` - RPC fonksiyonları

**Test edin:**
```sql
-- RLS'in aktif olduğunu doğrulayın
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('products', 'shipments');
-- Beklenen: rowsecurity = true
```

5. **Development server'ı başlatın**
```bash
npm run dev
```

Tarayıcıda: `http://localhost:5181/`

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
```

### Manuel Deployment
1. `npm run build` ile dist klasörü oluşturun
2. dist klasörünü web sunucunuza yükleyin
3. SPA routing için tüm istekleri index.html'e yönlendirin

## 🧪 Testing

### Test Setup

The project uses **Vitest** for unit testing and **React Testing Library** for component testing.

### Run Tests

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Test Structure

```
src/
├── lib/__tests__/       # Unit tests for utilities
├── pages/Products/hooks/   # Custom hooks (testable)
└── test/setup.ts       # Test configuration
```

### Current Test Coverage

- ✅ Logger utility tests
- ⏳ API functions tests (in progress)
- ⏳ Component tests (in progress)
- ⏳ E2E tests (pending)

### Writing Tests

```typescript
// Example test
import { describe, it, expect } from 'vitest';
import { logger } from '../lib/logger';

describe('logger', () => {
  it('should log in development mode', () => {
    // Test implementation
  });
});
```

## 📁 Proje Yapısı

```
src/
├── components/          # UI Bileşenleri
├── contexts/           # React Contexts
├── hooks/              # Custom Hooks
├── lib/                # Utility Functions
│   ├── __tests__/     # Unit tests
│   ├── logger.ts      # Environment-aware logger
│   ├── schemas.ts     # Zod validation schemas
│   └── supabaseApi.ts # API functions
├── pages/              # Sayfa Bileşenleri
│   └── Products/
│       ├── components/ # Page-specific components
│       └── hooks/      # Page-specific hooks
├── stores/             # State management (Zustand)
├── test/               # Test setup and utilities
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
- **Repository**: [Planet-FBA-Tracker](https://github.com/Huseyintabak/Planet-FBA-Tracker)

---

**🚀 Planet FBA Tracker - Modern sevkiyat takip sistemi**