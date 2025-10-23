# 🧪 AMAZON FBA TRACKER - TESTING CHECKLIST

## ✅ TAMAMLANAN TESTLER

- [x] Multi-user RLS isolation
- [x] User registration (email/password)
- [x] User login (email/password)
- [x] User logout
- [x] RLS policy'ler çalışıyor

---

## 🔄 YAPILACAK TESTLER

### **1. AUTHENTICATION FLOW** (15 dakika)

#### Test 1.1: Sign Up
- [ ] http://localhost:5181/Amazon-Fba/signup adresine git
- [ ] Yeni email ile kayıt ol (test3@test.com)
- [ ] Email confirmation check (Supabase otomatik onaylıyor)
- [ ] Otomatik login olup dashboard'a yönlendiriyor mu?
- [ ] Profile otomatik oluşturuldu mu? (Profile sayfasını kontrol et)

#### Test 1.2: Magic Link Login
- [ ] Logout ol
- [ ] Login sayfasında "Magic Link" seçeneğine tıkla
- [ ] Email gir
- [ ] "Magic link sent" mesajı görünüyor mu?
- [ ] Email'i kontrol et (Supabase → Authentication → Logs)

#### Test 1.3: Password Reset
- [ ] "Forgot Password?" tıkla
- [ ] Email gir
- [ ] Reset link sent mesajı görünüyor mu?
- [ ] Email'den link ile şifre değiştir

---

### **2. PRODUCT MANAGEMENT** (20 dakika)

#### Test 2.1: Create Product (Free User)
- [ ] Products sayfasına git
- [ ] "Yeni Ürün Ekle" butonuna tıkla
- [ ] Formu doldurmadan "Kaydet" → Validation hataları görünüyor mu?
- [ ] Geçerli veri gir:
  ```
  SKU: TEST-PROD-001
  İsim: Test Product 1
  ASIN: B00TEST001
  Manufacturer: Test Mfg
  Manufacturer Code: TM001
  Maliyet: 25.50
  ```
- [ ] Kaydet → Başarılı mesaj görünüyor mu?
- [ ] Ürün listede görünüyor mu?

#### Test 2.2: Edit Product
- [ ] Oluşturduğun ürünün "Düzenle" butonuna tıkla
- [ ] İsmi değiştir: "Test Product 1 - Updated"
- [ ] Kaydet → Değişiklik görünüyor mu?

#### Test 2.3: Delete Product
- [ ] "Sil" butonuna tıkla
- [ ] Onay modalı görünüyor mu?
- [ ] "Evet, Sil" → Ürün silindi mi?

#### Test 2.4: Product Limits (Free Plan - 10 ürün)
- [ ] 10 ürün ekle (hızlıca, farklı SKU'lar ile)
- [ ] 11. ürünü eklemeye çalış
- [ ] Upgrade modal görünüyor mu?
- [ ] "You've reached the limit of 10 products" mesajı var mı?

#### Test 2.5: CSV Import (Pro Feature - Free User)
- [ ] "CSV İçe Aktar" butonuna tıkla
- [ ] Upgrade modal görünüyor mu?
- [ ] Modal'da "CSV Import is a Pro feature" mesajı var mı?

#### Test 2.6: CSV Export (Herkese Açık)
- [ ] "CSV Dışa Aktar" butonuna tıkla
- [ ] CSV dosyası indirildi mi?
- [ ] Dosyayı aç → Veriler doğru mu?

---

### **3. SHIPMENT MANAGEMENT** (15 dakika)

#### Test 3.1: Create Shipment
- [ ] Shipments sayfasına git
- [ ] "Yeni Sevkiyat" butonuna tıkla
- [ ] Form doldurmadan kaydet → Validation hataları?
- [ ] Geçerli veri gir:
  ```
  FBA Shipment ID: FBA123TEST
  Carrier: UPS
  Shipment Date: (Bugün)
  Total Cost: 150.00
  Status: Draft
  ```
- [ ] En az 1 ürün ekle (dropdown'dan seç, quantity: 5)
- [ ] Kaydet → Başarılı mesaj?
- [ ] Shipments listesinde görünüyor mu?

#### Test 3.2: View Shipment Details
- [ ] Oluşturduğun shipment'a tıkla
- [ ] Detay sayfası açıldı mı?
- [ ] Tüm bilgiler doğru görünüyor mu?
- [ ] Items listesi doğru mu?

#### Test 3.3: Update Shipment Status
- [ ] Shipment detayında "Status" değiştir: Draft → Completed
- [ ] Kaydet → Değişiklik görünüyor mu?

#### Test 3.4: Shipment Limits (Free Plan - 5/month)
- [ ] Bu ayda 5 shipment oluştur
- [ ] 6. shipment'ı oluşturmaya çalış
- [ ] Upgrade modal görünüyor mu?
- [ ] "Monthly shipment limit reached" mesajı var mı?

---

### **4. DASHBOARD & REPORTS** (10 dakika)

#### Test 4.1: Dashboard Stats
- [ ] Dashboard'a git
- [ ] Stats doğru görünüyor mu?
  - Total Products: X
  - Total Shipments: Y
  - Total Shipped Quantity: Z
  - Total Shipping Cost: $W
- [ ] Sadece kendi verileriniz görünüyor mu? (RLS check)

#### Test 4.2: Reports
- [ ] Reports sayfasına git
- [ ] Product Reports tablosunda veriler var mı?
- [ ] Monthly Shipment Chart görünüyor mu?
- [ ] Carrier Performance chart görünüyor mu?

---

### **5. SUBSCRIPTION & FEATURE GATING** (10 dakika)

#### Test 5.1: Free Plan Limits
- [ ] Profile sayfasına git
- [ ] Current Plan: "Free" görünüyor mu?
- [ ] Usage stats doğru mu?
  - Products: X / 10
  - Shipments (This Month): Y / 5
- [ ] Usage Banner görünüyor mu? (eğer limitin %80'ine yakınsa)

#### Test 5.2: Pricing Page
- [ ] Pricing sayfasına git
- [ ] Free ve Pro planları karşılaştırma görünüyor mu?
- [ ] "Get Started" butonları var mı?
- [ ] Plan özellikleri net mi?

---

### **6. MULTI-USER RLS** (10 dakika)

#### Test 6.1: User A (Mevcut Kullanıcı)
- [ ] Products: X ürün var
- [ ] Shipments: Y sevkiyat var

#### Test 6.2: User B (Farklı Tarayıcı veya Incognito)
- [ ] Yeni kullanıcı ile kayıt ol (test2@test.com)
- [ ] Products sayfası → Boş olmalı (User A'nın ürünleri GÖRÜNMEMELİ)
- [ ] Yeni ürün ekle
- [ ] Sadece kendi ürününü görüyor mu?

#### Test 6.3: Tekrar User A
- [ ] Logout → User A ile login
- [ ] Products → User B'nin ürünlerini GÖRMEMELİ
- [ ] Sadece kendi ürünlerini görüyor mu?

---

### **7. ERROR HANDLING & EDGE CASES** (10 dakika)

#### Test 7.1: Network Errors
- [ ] Developer Tools → Network → Offline
- [ ] Ürün eklemeye çalış → Hata mesajı görünüyor mu?
- [ ] Network → Online
- [ ] Retry → Çalışıyor mu?

#### Test 7.2: Invalid Data
- [ ] Ürün ekle, SKU'ya emoji gir 🎉
- [ ] Validation hata mesajı var mı?
- [ ] Negative cost gir (-50)
- [ ] Hata mesajı var mı?

#### Test 7.3: Duplicate SKU
- [ ] Mevcut bir SKU ile yeni ürün oluşturmaya çalış
- [ ] "Ürün zaten mevcut" hatası görünüyor mu?

---

### **8. UI/UX CHECK** (5 dakika)

#### Test 8.1: Responsive Design
- [ ] Tarayıcıyı daralt (mobile size)
- [ ] Header menü hamburger olarak görünüyor mu?
- [ ] Tablolar mobile'da scroll oluyor mu?
- [ ] Butonlar tıklanabilir mi?

#### Test 8.2: Loading States
- [ ] Sayfa yüklenirken loading spinner görünüyor mu?
- [ ] Form submit sırasında button disabled oluyor mu?

#### Test 8.3: Toast Notifications
- [ ] Ürün ekleme → Success toast
- [ ] Ürün silme → Success toast
- [ ] Hata durumu → Error toast
- [ ] Toast otomatik kapanıyor mu? (3-5 saniye)

---

## 📊 TEST SONUÇLARI

### ✅ Başarılı Testler: _____ / 50
### ❌ Başarısız Testler: _____
### 🐛 Bulunan Buglar:

1. 
2. 
3. 

---

## 🚀 SONRAKİ ADIMLAR

- [ ] Bulunan bugları düzelt
- [ ] Documentation güncelle
- [ ] Production deployment hazırlığı
- [ ] Performance optimization

---

**TEST BAŞLAMA TARİHİ:** ____________
**TEST BİTİŞ TARİHİ:** ____________
**TESTER:** ____________

