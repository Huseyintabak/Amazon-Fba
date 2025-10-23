# 📊 GOOGLE ANALYTICS 4 SETUP GUIDE

## 🎯 Quick Setup (5 Dakika)

### 1. Google Analytics Account Oluştur

1. https://analytics.google.com → Sign in with Google
2. **Admin** (sol alt köşe) → **Create Property**
   - Property name: `Amazon FBA Tracker`
   - Time zone: `Turkey (GMT+3)`
   - Currency: `Turkish Lira (TRY)` veya `US Dollar (USD)`
   - **Next**

3. Business details:
   - Industry: `Technology / Software`
   - Business size: seç
   - **Create**

4. **Web Stream** oluştur:
   - Platform: **Web**
   - Website URL: `https://yourdomain.com` (production URL)
   - Stream name: `Web Production`
   - **Create stream**

5. **Measurement ID'yi kopyala**
   - Format: `G-XXXXXXXXXX`
   - Bu ID'yi `.env` dosyasına ekleyeceksiniz

---

### 2. Environment Variable Ekle

`.env` dosyasını aç ve ekle:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**ÖNEMLİ:** 
- Production'da gerçek Measurement ID kullan
- Development'ta `G-XXXXXXXXXX` bırakabilirsin (tracking olmaz)

---

### 3. Test Et

#### Local Test (Development):
```bash
npm run dev
```

Console'da göreceksiniz:
```
📊 Google Analytics disabled (dev mode or no ID)
```

Bu normal! Development'ta tracking kapalı.

#### Production Test:
```bash
npm run build
npm run preview
```

Production build'de tracking aktif olacak!

---

## 📈 Tracked Events

### Otomatik Events:
- ✅ **Page Views**: Her sayfa değişiminde otomatik
- ✅ **Session Duration**: Otomatik hesaplanır
- ✅ **User Engagement**: Scroll, click vb.

### Custom Events:
- ✅ **Authentication**: Sign up, Login, Logout
- ✅ **Product Actions**: Create, Update, Delete, CSV Import/Export
- ✅ **Shipment Actions**: Create, Update, Complete
- ✅ **Subscription Events**: View Pricing, Upgrade Prompt, Plan Upgrade
- ✅ **Engagement**: Search, Sort, Report Views
- ✅ **Errors**: Error tracking

---

## 🎯 Kullanım Örnekleri

### Örnek 1: Login Tracking

```typescript
import { analytics } from '../lib/analytics';

// Login başarılı olduğunda
const handleLogin = async () => {
  // ... login logic
  analytics.login('email'); // veya 'magic_link'
};
```

### Örnek 2: Product Created

```typescript
import { analytics } from '../lib/analytics';

// Ürün oluşturulduğunda
const handleCreateProduct = async (product) => {
  // ... create logic
  analytics.productCreated(product.name);
};
```

### Örnek 3: Upgrade Prompt

```typescript
import { analytics } from '../lib/analytics';

// Upgrade modalı göründüğünde
const showUpgradeModal = () => {
  analytics.upgradePromptShown('products');
  setShowModal(true);
};
```

---

## 📊 Analytics Dashboard'u Görüntüle

### Real-Time Reports:
1. Google Analytics → **Reports** → **Realtime**
2. Şu anda sitede kaç kullanıcı var görebilirsin
3. Hangi sayfalarda olduklarını görebilirsin

### User Behavior:
1. **Reports** → **Engagement** → **Events**
2. Tüm custom event'leri görebilirsin
3. En çok hangi action'lar yapılıyor?

### Conversion Funnels:
1. **Reports** → **Engagement** → **Conversions**
2. Sign up → Product Create → Upgrade funnel'ını izle

---

## 🎨 GA4 Dashboard Önerileri

### Dashboard 1: User Acquisition
- **New Users**: Günlük yeni kayıtlar
- **User Source**: Nereden geliyorlar? (Organic, Direct, Referral)
- **Sign Up Events**: Kayıt sayısı

### Dashboard 2: Product Engagement
- **Product Created**: Günlük oluşturulan ürün sayısı
- **CSV Import Events**: Toplu ekleme kullanımı
- **Active Users**: Günlük aktif kullanıcılar

### Dashboard 3: Conversion & Revenue
- **Upgrade Prompts Shown**: Kaç kez gösterildi
- **Upgrade Clicked**: Kaç kez tıklandı
- **Plan Upgraded**: Kaç kişi yükseltti
- **Conversion Rate**: Prompt → Upgrade oranı

---

## 🔧 Advanced Configuration

### Custom Dimensions:
Google Analytics'te custom dimensions ekleyebilirsin:

1. **Admin** → **Custom definitions** → **Custom dimensions**
2. Add custom dimension:
   - **user_plan**: free | pro
   - **user_tenure**: new | returning
   - **feature_usage**: high | medium | low

### Enhanced Measurement:
Google Analytics → **Admin** → **Data Streams** → Your Stream → **Enhanced measurement**

Otomatik track edilenler:
- ✅ Scroll tracking
- ✅ Outbound clicks
- ✅ Site search
- ✅ Video engagement
- ✅ File downloads

---

## 🚨 Privacy & GDPR

### Anonymize IP (Zaten Aktif):
```typescript
ReactGA.initialize(GA_MEASUREMENT_ID, {
  gaOptions: {
    anonymizeIp: true, // ✅ GDPR compliance
  },
});
```

### Cookie Consent (İsteğe Bağlı):
Eğer EU kullanıcılarınız varsa, cookie banner ekleyin:

```bash
npm install react-cookie-consent
```

---

## 📊 Expected Metrics (İlk 30 Gün)

### Baseline Metrics:
- **Page Views**: 100-500/gün
- **Users**: 10-50/gün
- **Avg Session Duration**: 3-5 dakika
- **Bounce Rate**: %30-50

### Growth Metrics:
- **Week 1**: 10-20 kullanıcı
- **Week 2**: 30-50 kullanıcı
- **Week 3**: 60-100 kullanıcı
- **Week 4**: 100-200 kullanıcı

---

## ✅ CHECKLIST

- [ ] Google Analytics hesabı oluşturuldu
- [ ] Measurement ID alındı
- [ ] `.env` dosyasına eklendi
- [ ] Production'da test edildi
- [ ] Real-time data görüntülendi
- [ ] Custom events çalışıyor
- [ ] Dashboard'lar kuruldu

---

**Setup Tarihi:** __________
**Measurement ID:** __________
**Status:** 🟢 ACTIVE / 🟡 TESTING / 🔴 NOT SETUP

