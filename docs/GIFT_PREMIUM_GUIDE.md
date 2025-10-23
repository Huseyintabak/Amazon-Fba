# 🎁 GIFT PREMIUM FEATURE - KURULUM REHBERİ

## 📋 **ÖZELLİK AÇIKLAMASI**

Admin Panel'e eklenen yeni özellikler:

### ✅ **Gift Premium (Premium Hediye Et)**
- Admin, herhangi bir kullanıcıya istediği süre için Pro plan hediye edebilir
- Preset süreler: 1 hafta, 1 ay, 3 ay, 6 ay, 1 yıl
- Özel süre: Manuel gün sayısı girişi (1-3650 gün)
- Bitiş tarihi otomatik hesaplanır

### ✅ **Revoke Premium (Premium İptal Et)**
- Admin, Pro plan kullanan kullanıcıyı Free plana düşürebilir
- Confirm dialog ile onay istenir
- Kullanım limitleri Free tier'a düşer (mevcut veriler korunur)

---

## 🚀 **KURULUM ADIMLARI**

### **ADIM 1: SQL Fonksiyonlarını Çalıştır** ⚡

Supabase SQL Editor'da `add-gift-premium-function.sql` dosyasını çalıştır:

```sql
-- Admin function to gift premium subscription to a user
CREATE OR REPLACE FUNCTION admin_gift_premium(
    p_user_id UUID,
    p_duration_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
    v_end_date TIMESTAMPTZ;
    v_result JSON;
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;
    
    -- Calculate end date
    v_end_date := NOW() + (p_duration_days || ' days')::INTERVAL;
    
    -- Update or insert subscription
    INSERT INTO subscriptions (user_id, plan_type, status, current_period_start, current_period_end, stripe_subscription_id)
    VALUES (p_user_id, 'pro', 'active', NOW(), v_end_date, 'ADMIN_GIFT')
    ON CONFLICT (user_id) 
    DO UPDATE SET
        plan_type = 'pro',
        status = 'active',
        current_period_start = NOW(),
        current_period_end = v_end_date,
        stripe_subscription_id = 'ADMIN_GIFT',
        updated_at = NOW();
    
    -- Update usage limits to Pro
    UPDATE usage_limits
    SET 
        products_count = 0,
        shipments_count_monthly = 0,
        last_reset_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Return success message
    v_result := json_build_object(
        'success', true,
        'message', 'Premium subscription gifted successfully',
        'user_id', p_user_id,
        'plan', 'pro',
        'expires_at', v_end_date
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION admin_gift_premium(UUID, INTEGER) TO authenticated;

-- Admin function to revoke premium (downgrade to free)
CREATE OR REPLACE FUNCTION admin_revoke_premium(
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;
    
    -- Update subscription to free
    UPDATE subscriptions
    SET 
        plan_type = 'free',
        status = 'active',
        current_period_end = NULL,
        stripe_subscription_id = NULL,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Reset usage limits to free tier
    UPDATE usage_limits
    SET 
        products_count = LEAST(products_count, 10),
        shipments_count_monthly = LEAST(shipments_count_monthly, 5),
        last_reset_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Return success message
    v_result := json_build_object(
        'success', true,
        'message', 'Premium subscription revoked successfully',
        'user_id', p_user_id,
        'plan', 'free'
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION admin_revoke_premium(UUID) TO authenticated;
```

**Beklenen Sonuç:** `Success. No rows returned` ✅

---

### **ADIM 2: Browser'ı Yenile** 🔄

1. Admin panel açık: `http://localhost:5181/admin`
2. **Hard refresh** yap (Cmd+Shift+R)

---

## 🎯 **KULLANIM**

### **1. Premium Hediye Etme**

1. **Admin Panel'de** user listesini gör
2. **Free plan** kullanıcının yanında **🎁 butonu** görünür
3. **🎁'e tıkla** → Modal açılır
4. **Süre seç:**
   - **Preset:** 1 hafta, 1 ay, 3 ay, 6 ay, 1 yıl
   - **Özel:** Manuel gün sayısı (1-3650 gün)
5. **"🎁 Hediye Et"** butonuna tıkla
6. ✅ Success mesajı görünür
7. User listesi yenilenir → Kullanıcı artık **⭐ Pro** badge'i ile görünür

---

### **2. Premium İptal Etme**

1. **Admin Panel'de** user listesini gör
2. **Pro plan** kullanıcının yanında **❌ butonu** görünür
3. **❌'e tıkla** → Confirm dialog açılır
4. **"OK"** ile onayla
5. ✅ Success mesajı görünür
6. User listesi yenilenir → Kullanıcı artık **🆓 Free** badge'i ile görünür

---

## 📊 **ÖZELLİK DETAYLARI**

### **Gift Premium Modal:**
- 🎨 **Modern UI** - Güzel grid layout
- 📅 **Preset Buttons** - Hızlı seçim için 5 ön tanımlı süre
- 📝 **Custom Input** - Manuel gün girişi
- ℹ️ **Bitiş Tarihi Önizleme** - Otomatik hesaplama
- ✅ **Validation** - 1-3650 gün arası sınır

### **Database Changes:**
- `subscriptions` tablosunda:
  - `plan_type` → `'pro'`
  - `status` → `'active'`
  - `current_period_end` → Hesaplanan bitiş tarihi
  - `stripe_subscription_id` → `'ADMIN_GIFT'` (Stripe olmadan hediye edildiğini belirtir)
- `usage_limits` tablosunda:
  - Counters sıfırlanır (yeni dönem başlar)

### **Security:**
- ✅ Sadece admin role'ü olan kullanıcılar bu fonksiyonları çağırabilir
- ✅ Frontend'de non-admin kullanıcılara butonlar görünmez
- ✅ Backend'de (SQL function) admin kontrolü yapılır

---

## 🧪 **TEST SENARYOLARI**

### **Test 1: Gift Premium**
1. Admin ile login ol
2. `/admin` sayfasına git
3. Free plan kullanıcının 🎁 butonuna tıkla
4. "1 Ay" seç
5. "🎁 Hediye Et" butonuna tıkla
6. ✅ Success mesajı gelmeli
7. User listesinde kullanıcı **⭐ Pro** olmalı
8. **Test kullanıcı ile login ol:**
   - Profile sayfasında **Pro Plan** görünmeli
   - Ürün limiti **∞** olmalı
   - Pricing sayfasında "Current Plan" badge'i görünmeli

### **Test 2: Revoke Premium**
1. Admin ile login ol
2. `/admin` sayfasına git
3. Pro plan kullanıcının ❌ butonuna tıkla
4. Confirm dialog'da "OK" tıkla
5. ✅ Success mesajı gelmeli
6. User listesinde kullanıcı **🆓 Free** olmalı
7. **Test kullanıcı ile login ol:**
   - Profile sayfasında **Free Plan** görünmeli
   - Ürün limiti **10** olmalı

### **Test 3: Non-Admin User**
1. Non-admin kullanıcı ile login ol
2. `/admin` sayfasına gitmeye çalış
3. ✅ Dashboard'a redirect edilmeli
4. Header'da "Admin" linki **GÖRÜNMEMELI**

---

## 🎨 **UI ÖZELLİKLERİ**

### **User List Table:**
| Aksiyon Butonları | Görünüm Koşulu |
|-------------------|----------------|
| **Detay** (mavi) | Tüm kullanıcılar için |
| **🎁** (yeşil) | Sadece Free plan kullanıcılar |
| **❌** (kırmızı) | Sadece Pro plan kullanıcılar |

### **Modal Design:**
- ✅ Responsive (mobile-friendly)
- ✅ Preset buttons (2 column grid)
- ✅ Custom input field
- ✅ Live date preview
- ✅ Cancel + Confirm buttons
- ✅ Icon-based communication (🎁, 📅, ℹ️)

---

## 🔧 **TEKNİK DETAYLAR**

### **RPC Fonksiyonları:**
```typescript
// Gift premium
await supabase.rpc('admin_gift_premium', {
  p_user_id: 'user-uuid',
  p_duration_days: 30,
});

// Revoke premium
await supabase.rpc('admin_revoke_premium', {
  p_user_id: 'user-uuid',
});
```

### **Return Format:**
```json
{
  "success": true,
  "message": "Premium subscription gifted successfully",
  "user_id": "uuid",
  "plan": "pro",
  "expires_at": "2025-11-23T10:00:00.000Z"
}
```

---

## 📝 **YAPILACAKLAR (Gelecek Geliştirmeler)**

### **İsteğe Bağlı:**
- [ ] Gift history tracking (Kim, kime, ne zaman hediye etti?)
- [ ] Automatic expiration notifications (Bitiş tarihi yaklaştığında bildirim)
- [ ] Bulk gift (Çoklu kullanıcıya toplu hediye)
- [ ] Gift codes (Kullanıcıların kendilerinin aktive edebileceği hediye kodları)
- [ ] Email notification (Premium hediye edildiğinde otomatik email)

---

## ✅ **BAŞARILI KURULUM KONTROLÜ**

Şu adımların hepsini tamamladıysan, Gift Premium özelliği hazır! 🎉

- [x] SQL fonksiyonları çalıştırıldı
- [x] Admin panel açılıyor
- [x] Free plan kullanıcıların yanında 🎁 görünüyor
- [x] Gift modal açılıyor
- [x] Premium hediye ediliyor
- [x] Pro plan kullanıcıların yanında ❌ görünüyor
- [x] Premium iptal ediliyor
- [x] User listesi doğru güncelleniyor

---

## 🆘 **SORUN GİDERME**

### **Problem: 🎁 butonu görünmüyor**
**Çözüm:**
- User Free plan mi kontrol et
- Browser cache'i temizle
- Hard refresh yap

### **Problem: "Access denied" hatası**
**Çözüm:**
- Admin role'ü var mı kontrol et:
  ```sql
  SELECT role FROM profiles WHERE id = auth.uid();
  ```
- Logout/login yap

### **Problem: Premium hediye edilmiyor**
**Çözüm:**
- Browser console'da error var mı kontrol et
- SQL fonksiyonlarının doğru çalıştığını test et:
  ```sql
  SELECT * FROM information_schema.routines 
  WHERE routine_name IN ('admin_gift_premium', 'admin_revoke_premium');
  ```

---

## 🎯 **SONUÇ**

Admin Panel artık tam kapsamlı bir yönetim aracı! 🚀

**Özellikler:**
- ✅ User listesi & detayları
- ✅ System metrics & analytics
- ✅ **Gift Premium (YENİ!)**
- ✅ **Revoke Premium (YENİ!)**
- ✅ Search & filter
- ✅ Admin-only access control

**Next Step:** Email & Notification System! 📧

