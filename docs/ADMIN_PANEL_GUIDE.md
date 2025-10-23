# 👨‍💼 ADMIN PANEL - KURULUM REHBERİ

## 📋 **ÖZELLİKLER**

### ✅ Admin Panel İçeriği:
1. **User List** - Tüm kullanıcıları görüntüleme
2. **User Details Modal** - Detaylı kullanıcı bilgileri
3. **Overview Stats** - Sistem metrikleri:
   - Toplam kullanıcı sayısı
   - Free/Pro plan dağılımı
   - Toplam ürün/sevkiyat sayısı
   - Aktif kullanıcı (24 saat)
4. **User Search** - Email ile arama
5. **Admin-Only Access** - Sadece admin role'ü olan kullanıcılar erişebilir

---

## 🚀 **KURULUM ADIMLARI**

### **ADIM 1: SQL'i Çalıştır** ⚡

Supabase SQL Editor'da `add-admin-role.sql` dosyasını çalıştır:

```sql
-- Add admin role to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Make your account admin (replace with your email)
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'huseyintabak1@gmail.com'
);

-- Verify
SELECT 
    p.id,
    u.email,
    p.role,
    p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin stats view
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT 
    u.id,
    u.email,
    u.created_at as signed_up_at,
    u.last_sign_in_at,
    p.role,
    s.plan,
    s.status as subscription_status,
    ul.products_count,
    ul.products_limit,
    ul.shipments_this_month,
    ul.shipments_monthly_limit,
    (SELECT COUNT(*) FROM products WHERE user_id = u.id) as actual_products,
    (SELECT COUNT(*) FROM shipments WHERE user_id = u.id) as actual_shipments
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN usage_limits ul ON u.id = ul.user_id
ORDER BY u.created_at DESC;

-- Test admin function
SELECT is_admin();
```

**Beklenen Sonuç:**
```
| id | email | role | created_at |
|----|-------|------|------------|
| ... | huseyintabak1@gmail.com | admin | ... |
| ... | info@vipkrom.com | user | ... |
```

---

### **ADIM 2: Test Et** 🧪

1. **Admin Hesabıyla Giriş Yap**
   - Email: `huseyintabak1@gmail.com`
   - Navigasyonda "Admin 👨‍💼" linki görünmeli

2. **Admin Panel'e Git**
   - URL: `http://localhost:5181/admin`
   - Overview stats'ları kontrol et
   - User listesini incele

3. **User Detaylarını Kontrol Et**
   - Herhangi bir kullanıcının "Detay" butonuna tıkla
   - Modal açılmalı ve tüm bilgileri göstermeli

4. **Search Fonksiyonunu Test Et**
   - Email arama kutusuna bir kullanıcının email'ini yaz
   - Filtreleme çalışmalı

5. **Admin Olmayan Hesapla Test Et**
   - `info@vipkrom.com` ile giriş yap
   - Admin linki görünMEMELİ
   - `/admin` URL'sine gitmeye çalışırsan dashboard'a redirect olmalısın

---

## 📊 **ADMIN PANEL ÖZELLİKLERİ**

### **Overview Stats:**
- 📊 **Toplam Kullanıcı** - Kayıtlı kullanıcı sayısı
- 🆓 **Free Plan** - Free plan kullanan kullanıcı sayısı (%)
- ⭐ **Pro Plan** - Pro plan kullanan kullanıcı sayısı (%)
- 📦 **Toplam Ürün** - Sistemdeki tüm ürünler
- 🚚 **Toplam Sevkiyat** - Sistemdeki tüm sevkiyatlar
- ✅ **Aktif (24 saat)** - Son 24 saatte giriş yapan kullanıcılar

### **User List:**
| Sütun | Açıklama |
|-------|----------|
| Kullanıcı | Email ve role badge (Admin/User) |
| Plan | Free/Pro badge |
| Ürünler | Kullanım / Limit |
| Sevkiyatlar | Bu ay / Limit |
| Kayıt Tarihi | İlk kayıt tarihi |
| Son Giriş | En son giriş zamanı |
| Aksiyon | Detay modal butonu |

### **User Detail Modal:**
- Email
- Role (Admin/User)
- Plan (Free/Pro)
- Subscription Status
- Kayıt Tarihi (tam tarih-saat)
- Son Giriş (tam tarih-saat)
- **Kullanım İstatistikleri:**
  - Ürünler (kullanım / limit)
  - Sevkiyatlar Bu Ay (kullanım / limit)
  - Toplam Sevkiyatlar

---

## 🔒 **GÜVENLİK ÖZELLİKLERİ**

1. **Role-Based Access Control (RBAC)**
   - Sadece `role = 'admin'` olan kullanıcılar erişebilir
   - Frontend ve backend kontrolü

2. **Auto-Redirect**
   - Admin olmayan kullanıcılar dashboard'a yönlendirilir

3. **Admin Badge**
   - Admin kullanıcıların user listesinde özel badge'i var

4. **Database View**
   - `admin_user_stats` view'ı `auth.users` tablosunu kullanır
   - RLS koruması altında

---

## 🎨 **KULLANICI DENEYİMİ**

### **Responsive Design:**
- ✅ Desktop (large screens)
- ✅ Tablet (medium screens)
- ✅ Mobile (small screens)

### **Loading States:**
- Sayfa yüklenirken spinner gösterilir
- Boş durum mesajları

### **Search:**
- Gerçek zamanlı filtreleme
- Email bazlı arama

### **Color Coding:**
- 🆓 **Gray badge** - Free plan
- ⭐ **Yellow badge** - Pro plan
- 👑 **Purple badge** - Admin role

---

## 📝 **YAPILACAKLAR (İsteğe Bağlı)**

### **Gelecek Geliştirmeler:**
1. **User Management Actions:**
   - [ ] Kullanıcı planını değiştir (Free ↔ Pro)
   - [ ] Kullanıcıyı askıya al/aktifleştir
   - [ ] Kullanıcı limitlerini manuel ayarla

2. **Advanced Analytics:**
   - [ ] Revenue tracking (Stripe integration sonrası)
   - [ ] User growth chart (günlük/haftalık/aylık)
   - [ ] Feature usage heatmap

3. **Export Functions:**
   - [ ] User listesini CSV export
   - [ ] Analytics raporlarını PDF export

4. **Notifications:**
   - [ ] Admin'lere sistem bildirimleri
   - [ ] Limit aşımı uyarıları

---

## ✅ **BAŞARILI KURULUM KONTROLÜ**

Şu adımların hepsini tamamladıysan, Admin Panel hazır! 🎉

- [x] SQL çalıştırıldı (`add-admin-role.sql`)
- [x] Admin role atandı (`huseyintabak1@gmail.com`)
- [x] Admin linki header'da görünüyor
- [x] Admin panel açılıyor (`/admin`)
- [x] User listesi görünüyor
- [x] Overview stats doğru
- [x] User detail modal çalışıyor
- [x] Search fonksiyonu çalışıyor
- [x] Non-admin kullanıcılar redirect ediliyor

---

## 🆘 **SORUN GİDERME**

### **Problem: Admin linki görünmüyor**
**Çözüm:** 
- SQL'de `UPDATE profiles SET role = 'admin'` çalıştığından emin ol
- Logout/login yap (profil yeniden yüklensin)

### **Problem: Admin panel boş**
**Çözüm:**
- `admin_user_stats` view'ının oluştuğunu kontrol et
- Browser console'da error var mı bak

### **Problem: "Access Denied" veya redirect**
**Çözüm:**
- Profilin `role = 'admin'` olduğundan emin ol:
  ```sql
  SELECT p.role, u.email 
  FROM profiles p 
  JOIN auth.users u ON p.id = u.id 
  WHERE u.email = 'huseyintabak1@gmail.com';
  ```

---

## 🎯 **SONUÇ**

Admin Panel ile artık:
- ✅ Tüm kullanıcıları görebilirsin
- ✅ Sistem metriklerini takip edebilirsin
- ✅ Kullanıcı davranışlarını analiz edebilirsin
- ✅ Platform sağlığını izleyebilirsin

**Next Step:** Stripe integration! 💰

