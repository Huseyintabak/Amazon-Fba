# Supabase Entegrasyonu - Kurulum Rehberi

Bu rehber, Amazon FBA Sevkiyat Takip Sistemi'ni Supabase ile entegre etmek için gerekli adımları açıklar.

## 🚀 Hızlı Başlangıç

### 1. Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. Proje adını girin: `amazon-fba-tracker`
4. Veritabanı şifresi oluşturun (güçlü bir şifre seçin)
5. Bölge seçin (Türkiye için `Europe West` önerilir)
6. "Create new project" butonuna tıklayın

### 2. Veritabanı Şemasını Yükleme

1. Supabase Dashboard'da projenizi açın
2. Sol menüden "SQL Editor" seçin
3. "New query" butonuna tıklayın
4. `supabase-schema.sql` dosyasının içeriğini kopyalayın
5. SQL Editor'e yapıştırın
6. "Run" butonuna tıklayın

✅ **Başarılı!** Tüm tablolar, indeksler, RLS politikaları ve seed verileri yüklendi.

### 3. Environment Variables Ayarlama

1. Proje kök dizininde `.env` dosyası oluşturun:
```bash
cp env.example .env
```

2. `.env` dosyasını düzenleyin:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Supabase Dashboard'dan URL ve Anon Key'i alın:
   - Settings → API → Project URL
   - Settings → API → Project API keys → anon public

### 4. Uygulamayı Başlatma

```bash
npm run dev
```

## 📊 Veritabanı Şeması

### Tablolar

#### `products`
- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL)
- `asin` (TEXT, UNIQUE, NOT NULL)
- `merchant_sku` (TEXT, NOT NULL)
- `manufacturer_code` (TEXT, NULLABLE)
- `manufacturer` (TEXT, NULLABLE)
- `amazon_barcode` (TEXT, NULLABLE)
- `product_cost` (DECIMAL, DEFAULT 0.00)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `shipments`
- `id` (UUID, Primary Key)
- `fba_shipment_id` (TEXT, UNIQUE, NOT NULL)
- `shipment_date` (DATE, NOT NULL)
- `carrier_company` (TEXT, NOT NULL)
- `total_shipping_cost` (DECIMAL, NOT NULL)
- `notes` (TEXT, NULLABLE)
- `status` (TEXT, DEFAULT 'draft', CHECK)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `shipment_items`
- `id` (UUID, Primary Key)
- `shipment_id` (UUID, Foreign Key → shipments)
- `product_id` (UUID, Foreign Key → products)
- `quantity` (INTEGER, NOT NULL, CHECK > 0)
- `unit_shipping_cost` (DECIMAL, NOT NULL)
- `barcode_scanned` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMP)

### Views

#### `dashboard_stats`
- `total_products`
- `total_shipments`
- `total_shipped_quantity`
- `total_shipping_cost`

#### `product_reports`
- Ürün bazlı detaylı raporlar
- Toplam sevkiyat, maliyet, ortalama maliyet

#### `monthly_shipment_data`
- Aylık sevkiyat istatistikleri

#### `carrier_performance`
- Kargo firması performans analizi

## 🔒 Güvenlik (RLS)

Tüm tablolar Row Level Security (RLS) ile korunmaktadır:

- **Okuma**: Herkese açık
- **Yazma**: Sadece authenticated kullanıcılar
- **Güncelleme**: Sadece authenticated kullanıcılar
- **Silme**: Sadece authenticated kullanıcılar

## 🧪 Test Verileri

Schema yüklendiğinde otomatik olarak test verileri eklenir:

- **5 örnek ürün** (farklı kategoriler)
- **3 örnek sevkiyat** (farklı durumlar)
- **7 sevkiyat kalemi** (çeşitli miktarlar)

## 🔧 Geliştirme

### Supabase Store Kullanımı

```typescript
import { useSupabaseStore } from './stores/useSupabaseStore';

const MyComponent = () => {
  const { 
    products, 
    shipments, 
    isLoading, 
    error,
    loadProducts,
    addProduct 
  } = useSupabaseStore();

  // Component logic
};
```

### API Kullanımı

```typescript
import { productsApi, shipmentsApi } from './lib/supabaseApi';

// Ürün ekleme
const newProduct = await productsApi.create({
  name: 'Test Product',
  asin: 'B123456789',
  merchant_sku: 'TEST-001'
});

// Sevkiyat yükleme
const shipments = await shipmentsApi.getAll();
```

## 🚨 Sorun Giderme

### Bağlantı Sorunları

1. **Environment variables kontrol edin**
2. **Supabase URL ve Key doğru mu?**
3. **İnternet bağlantınızı kontrol edin**

### RLS Sorunları

1. **Authentication gerekli mi?**
2. **Politikalar doğru ayarlanmış mı?**
3. **Kullanıcı yetkileri kontrol edin**

### Veri Sorunları

1. **Tablolar oluşturuldu mu?**
2. **Foreign key ilişkileri doğru mu?**
3. **Seed verileri yüklendi mi?**

## 📈 Performans

### İndeksler

Tüm önemli alanlar için indeksler oluşturulmuştur:

- `products.asin`
- `products.merchant_sku`
- `shipments.fba_shipment_id`
- `shipments.shipment_date`
- `shipment_items.shipment_id`

### Optimizasyon

- **Pagination** kullanın
- **Select** ile sadece gerekli alanları çekin
- **Views** kullanarak karmaşık sorguları optimize edin

## 🔄 Backup ve Restore

### Backup

```sql
-- Tüm verileri export et
pg_dump -h your-host -U postgres -d postgres > backup.sql
```

### Restore

```sql
-- Backup'ı geri yükle
psql -h your-host -U postgres -d postgres < backup.sql
```

## 📞 Destek

Sorunlarınız için:

1. **Supabase Docs**: https://supabase.com/docs
2. **GitHub Issues**: Proje repository'sinde issue açın
3. **Community**: Supabase Discord'da yardım alın

---

**Not**: Bu entegrasyon production-ready değildir. Gerçek kullanım için ek güvenlik önlemleri ve optimizasyonlar gerekebilir.
