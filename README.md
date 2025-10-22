# Amazon FBA Tracker

Modern, kullanıcı dostu Amazon FBA sevkiyat takip sistemi. React, TypeScript ve Supabase ile geliştirilmiştir.

## 🚀 Özellikler

### 📦 Ürün Yönetimi
- Ürün ekleme, düzenleme ve silme
- ASIN, SKU ve üretici bilgileri
- CSV import/export desteği
- Akıllı arama ve filtreleme
- Ürün maliyeti takibi

### 🚚 Sevkiyat Takibi
- Sevkiyat oluşturma ve yönetimi
- FBA Shipment ID takibi
- Kargo firması seçimi
- Sevkiyat durumu (Taslak/Tamamlandı)
- Barkod okuyucu entegrasyonu
- Box Preparation Mode

### 📊 Raporlar ve Analizler
- Dashboard ile genel bakış
- Aylık sevkiyat dağılımı
- Kargo maliyeti trendleri
- Kargo firması performansı
- En çok sevk edilen ürünler
- Detaylı filtreleme seçenekleri

### 🔍 Gelişmiş Arama
- Akıllı arama (ASIN, SKU, ürün adı)
- Çoklu kriter filtreleme
- Arama geçmişi
- Öneriler sistemi

### 📱 Responsive Tasarım
- Mobil uyumlu arayüz
- Touch-friendly etkileşimler
- Responsive tablolar ve modaller

## 🛠️ Teknoloji Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Charts**: Recharts
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı

### 1. Repository'yi klonlayın
```bash
git clone https://github.com/Huseyintabak/Amazon-Fba.git
cd Amazon-Fba
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. Environment variables ayarlayın
`.env` dosyası oluşturun:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase veritabanını kurun
`supabase-schema.sql` dosyasını Supabase SQL Editor'de çalıştırın.

### 5. Uygulamayı başlatın
```bash
npm run dev
```

Uygulama `http://localhost:5181` adresinde çalışacaktır.

## 🔐 Giriş Bilgileri

- **Demo Şifre**: `fba2024`

## 📁 Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── Layout/         # Layout bileşenleri
│   ├── AdvancedSearch.tsx
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   └── Toast.tsx
├── contexts/           # React Context'leri
│   └── ToastContext.tsx
├── lib/               # Utility fonksiyonları
│   ├── csvImport.ts
│   ├── mockData.ts
│   ├── searchHistory.ts
│   ├── smartSearch.ts
│   ├── supabase.ts
│   ├── supabaseApi.ts
│   └── validation.ts
├── pages/             # Sayfa bileşenleri
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Shipments.tsx
│   ├── ShipmentDetail.tsx
│   ├── NewShipment.tsx
│   └── Reports.tsx
├── stores/            # Zustand store'ları
│   ├── useAppStore.ts
│   └── useSupabaseStore.ts
├── types/             # TypeScript tip tanımları
│   └── index.ts
└── App.tsx
```

## 🗄️ Veritabanı Şeması

### Tablolar
- **products**: Ürün bilgileri
- **shipments**: Sevkiyat bilgileri
- **shipment_items**: Sevkiyat kalemleri

### Views
- **dashboard_stats**: Dashboard istatistikleri
- **product_reports**: Ürün raporları
- **monthly_shipment_data**: Aylık sevkiyat verileri
- **carrier_performance**: Kargo firması performansı

## 🚀 Deployment

### Vercel ile Deploy
1. Vercel hesabınıza giriş yapın
2. GitHub repository'nizi bağlayın
3. Environment variables'ları ekleyin
4. Deploy edin

### Netlify ile Deploy
1. Netlify hesabınıza giriş yapın
2. GitHub repository'nizi bağlayın
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variables'ları ekleyin

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **GitHub**: [@Huseyintabak](https://github.com/Huseyintabak)
- **Proje Linki**: [Amazon FBA Tracker](https://github.com/Huseyintabak/Amazon-Fba)

## 🙏 Teşekkürler

- [React](https://reactjs.org/) - UI framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Recharts](https://recharts.org/) - Chart library
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
