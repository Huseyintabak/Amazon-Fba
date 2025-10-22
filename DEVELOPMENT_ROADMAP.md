# Amazon FBA Tracker - Geliştirme Yol Haritası

## 🎯 Proje Durumu
**Mevcut Durum:** Temel özellikler %85 tamamlandı  
**Eksik Özellikler:** 4 ana özellik + teknik iyileştirmeler  
**Tahmini Süre:** 6-8 saat  

---

## 📋 Geliştirme Sırası

### **AŞAMA 1: Ürün Detay Sayfası** 🔥 **YÜKSEK ÖNCELİK**
**Süre:** 2-3 saat  
**Öncelik:** En kritik eksik özellik  

#### 🎯 Hedefler:
- `/products/:id` route'u oluştur
- Ürün sevkiyat geçmişi göster
- Toplam sevk edilen adet hesapla
- Toplam kargo maliyeti hesapla
- Ürün bilgileri detay görünümü

#### 📝 Görevler:
1. **Route Ekleme**
   - `App.tsx`'e `/products/:id` route'u ekle
   - `ProductDetail` component'i oluştur

2. **Ürün Detay Sayfası**
   - Ürün temel bilgileri (ASIN, SKU, üretici, maliyet)
   - Toplam sevk edilen adet
   - Toplam kargo maliyeti
   - Son sevkiyat tarihi

3. **Sevkiyat Geçmişi Tablosu**
   - Ürünün dahil olduğu sevkiyatlar
   - Her sevkiyatta kaç adet gönderildi
   - Sevkiyat tarihi ve durumu
   - Birim kargo maliyeti

4. **İstatistik Kartları**
   - Toplam sevk edilen adet
   - Toplam kargo maliyeti
   - Ortalama birim maliyet
   - Son sevkiyat tarihi

#### 🔧 Teknik Detaylar:
```typescript
// Yeni route
<Route path="/products/:id" element={<ProductDetailWrapper />} />

// ProductDetail component
interface ProductDetailProps {
  productId: string;
}

// Mock data fonksiyonları
const getProductShipments = (productId: string) => ShipmentItem[]
const getProductStats = (productId: string) => ProductStats
```

---

### **AŞAMA 2: CSV Export Özelliği** 📊 **ORTA ÖNCELİK**
**Süre:** 1-2 saat  
**Öncelik:** Raporlama için gerekli  

#### 🎯 Hedefler:
- Raporlar sayfasına export butonları ekle
- CSV dosya oluşturma fonksiyonu
- Excel formatında indirme

#### 📝 Görevler:
1. **CSV Export Utility**
   - `lib/csvExport.ts` dosyası oluştur
   - JSON'dan CSV'ye dönüştürme fonksiyonu
   - Excel formatında indirme

2. **Raporlar Sayfasına Export Butonları**
   - Ürün raporu export butonu
   - Sevkiyat raporu export butonu
   - Filtrelenmiş verileri export etme

3. **Export Fonksiyonları**
   - `exportProductReport()` - Ürün raporu
   - `exportShipmentReport()` - Sevkiyat raporu
   - `exportFilteredData()` - Filtrelenmiş veriler

#### 🔧 Teknik Detaylar:
```typescript
// CSV Export utility
export const exportToCSV = (data: any[], filename: string) => void
export const exportProductReport = (products: ProductReport[]) => void
export const exportShipmentReport = (shipments: ShipmentReport[]) => void

// Raporlar sayfasına butonlar
<button onClick={() => exportProductReport(productData)}>
  📊 Ürün Raporunu İndir
</button>
```

---

### **AŞAMA 3: Gelişmiş Barkod Sistemi** 📱 **ORTA ÖNCELİK**
**Süre:** 2-3 saat  
**Öncelik:** Sevkiyat sürecini iyileştirir  

#### 🎯 Hedefler:
- Kutu hazırlama modu
- Çifte kontrol sistemi
- Görsel durum göstergeleri
- Eksik/okunan ürün listesi

#### 📝 Görevler:
1. **Kutu Hazırlama Modu**
   - Barkod okuma modunu aktifleştir
   - Ürünleri "okundu" olarak işaretle
   - Görsel durum göstergeleri (yeşil/kırmızı)

2. **Çifte Kontrol Sistemi**
   - "Kontrol Et" butonu
   - Eksik ürünler listesi
   - "Sevkiyatı Onayla" final kontrol

3. **Gelişmiş UI**
   - Ürün durumu göstergeleri
   - Progress bar (okunan/toplam)
   - Eksik ürünler uyarısı

#### 🔧 Teknik Detaylar:
```typescript
// Barkod sistemi state
const [boxPreparationMode, setBoxPreparationMode] = useState(false)
const [scannedItems, setScannedItems] = useState<string[]>([])
const [missingItems, setMissingItems] = useState<string[]>([])

// Çifte kontrol
const handleDoubleCheck = () => {
  const missing = selectedProducts.filter(item => 
    !scannedItems.includes(item.product_id)
  )
  setMissingItems(missing)
}
```

---

### **AŞAMA 4: State Management** ⚙️ **DÜŞÜK ÖNCELİK**
**Süre:** 1-2 saat  
**Öncelik:** Teknik iyileştirme  

#### 🎯 Hedefler:
- Zustand store implementasyonu
- Global state yönetimi
- Data persistence

#### 📝 Görevler:
1. **Zustand Store Kurulumu**
   - `stores/useAppStore.ts` oluştur
   - Products, shipments, auth state'leri
   - CRUD operations

2. **Component'leri Store'a Bağla**
   - Mevcut local state'leri store'a taşı
   - Mock data'yı store'dan al
   - Real-time updates

3. **Data Persistence**
   - localStorage ile state kaydetme
   - Sayfa yenileme sonrası state restore

#### 🔧 Teknik Detaylar:
```typescript
// Zustand store
interface AppState {
  // Auth
  isAuthenticated: boolean
  login: (password: string) => void
  logout: () => void
  
  // Products
  products: Product[]
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Product) => void
  deleteProduct: (id: string) => void
  
  // Shipments
  shipments: Shipment[]
  addShipment: (shipment: Shipment) => void
  updateShipment: (id: string, shipment: Shipment) => void
  deleteShipment: (id: string) => void
}
```

---

## 🚀 Geliştirme Başlangıcı

### **İlk Adım: Ürün Detay Sayfası**
```bash
# 1. Route ekleme
# 2. ProductDetail component oluşturma
# 3. Mock data fonksiyonları
# 4. UI tasarımı
```

### **Test Senaryoları**
1. **Ürün Detay Sayfası**
   - `/products/1` sayfası açılır
   - Ürün bilgileri görünür
   - Sevkiyat geçmişi listelenir
   - İstatistikler doğru hesaplanır

2. **CSV Export**
   - Export butonları çalışır
   - CSV dosyası indirilir
   - Veriler doğru formatlanır

3. **Barkod Sistemi**
   - Kutu hazırlama modu aktifleşir
   - Ürünler okundu olarak işaretlenir
   - Çifte kontrol çalışır

---

## 📊 İlerleme Takibi

### **Aşama 1: Ürün Detay Sayfası**
- [ ] Route ekleme
- [ ] ProductDetail component
- [ ] Sevkiyat geçmişi tablosu
- [ ] İstatistik kartları
- [ ] Test ve doğrulama

### **Aşama 2: CSV Export**
- [ ] CSV export utility
- [ ] Export butonları
- [ ] Test ve doğrulama

### **Aşama 3: Barkod Sistemi**
- [ ] Kutu hazırlama modu
- [ ] Çifte kontrol sistemi
- [ ] Görsel göstergeler
- [ ] Test ve doğrulama

### **Aşama 4: State Management**
- [ ] Zustand store
- [ ] Component entegrasyonu
- [ ] Data persistence
- [ ] Test ve doğrulama

---

## 🎯 Başarı Kriterleri

### **Aşama 1 Tamamlandı:**
- ✅ Ürün detay sayfası çalışır
- ✅ Sevkiyat geçmişi görünür
- ✅ İstatistikler doğru hesaplanır
- ✅ Responsive tasarım

### **Aşama 2 Tamamlandı:**
- ✅ CSV export çalışır
- ✅ Excel formatında indirme
- ✅ Filtrelenmiş veriler export edilir

### **Aşama 3 Tamamlandı:**
- ✅ Barkod okuma modu çalışır
- ✅ Çifte kontrol sistemi aktif
- ✅ Görsel göstergeler çalışır

### **Aşama 4 Tamamlandı:**
- ✅ Zustand store implementasyonu
- ✅ Global state yönetimi
- ✅ Data persistence çalışır

---

**Hazır mısın? İlk aşamaya başlayalım! 🚀**
