# 🗄️ DATABASE SCRIPTS

Amazon FBA Tracker SaaS - Database Setup & Migration Scripts

---

## 📋 **SCRIPT'LERİN ÇALIŞTIRILMA SIRASI**

### **İlk Kurulum (Fresh Install):**

```
1. supabase-schema-saas.sql       # Ana schema
2. ENABLE_RLS_NOW.sql             # RLS enable (kritik!)
3. add-admin-role.sql              # Admin role & view
4. add-gift-premium-function.sql   # Gift premium functions
5. add-onboarding-field.sql        # Onboarding fields
6. create-product-rpc.sql          # Product RPC function
7. fix-admin-view-simple.sql       # Admin view permissions fix
```

---

## 📄 **SCRIPT DETAYLARI**

### 1. **supabase-schema-saas.sql** 📊
**Ana Database Schema**

**İçerik:**
- User tables (profiles, user_settings)
- Subscription tables (subscriptions, usage_limits)
- Product & Shipment tables (multi-tenant)
- RLS policies (data isolation)
- Triggers & functions
- Views (dashboard_stats, reports)

**Çalıştırma:**
```sql
-- Supabase SQL Editor'da çalıştır
-- Tüm dosya içeriğini kopyala/yapıştır
```

**Beklenen Sonuç:** `Success. No rows returned`

---

### 2. **ENABLE_RLS_NOW.sql** 🔒
**Row Level Security Enable**

**İçerik:**
- Products table RLS
- Shipments table RLS
- Profiles table RLS
- Subscriptions table RLS
- Usage limits table RLS

**Çalıştırma:**
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
-- ... diğer tablolar
```

**Kritik:** Bu script olmadan multi-tenancy çalışmaz!

---

### 3. **add-admin-role.sql** 👨‍💼
**Admin Role & View Setup**

**İçerik:**
- `role` column ekle (profiles)
- Admin user oluştur
- `is_admin()` function
- `admin_user_stats` view

**Kullanım:**
```sql
-- Email'i kendi hesabınla değiştir
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR@EMAIL.COM');
```

---

### 4. **add-gift-premium-function.sql** 🎁
**Premium Hediye Fonksiyonları**

**İçerik:**
- `admin_gift_premium(user_id, duration_days)` - Premium hediye et
- `admin_revoke_premium(user_id)` - Premium iptal et

**Kullanım:**
```sql
-- 30 gün premium hediye et
SELECT admin_gift_premium('user-uuid', 30);

-- Premium iptal et
SELECT admin_revoke_premium('user-uuid');
```

**Güvenlik:** Sadece admin role'ü çağırabilir.

---

### 5. **add-onboarding-field.sql** 👋
**Onboarding Fields**

**İçerik:**
- `onboarding_completed` boolean field
- `onboarding_completed_at` timestamp field

**Amaç:** Yeni kullanıcılara welcome modal göstermek için.

---

### 6. **create-product-rpc.sql** 📦
**Product Creation RPC Function**

**İçerik:**
- `create_product_with_user()` RPC function
- Otomatik `user_id` atama
- Usage limit kontrolü
- Free plan limiti (10 ürün)

**Kullanım:**
```typescript
await supabase.rpc('create_product_with_user', {
  p_name: 'Product Name',
  p_asin: 'B01234567',
  p_merchant_sku: 'SKU123',
  // ...
});
```

**Neden RPC?** Frontend session issue'larını bypass eder.

---

### 7. **fix-admin-view-simple.sql** 🔧
**Admin View Permissions Fix**

**İçerik:**
- `admin_user_stats` view drop & recreate
- `GRANT SELECT` permissions
- Plan limits (Free: 10/5, Pro: ∞)

**Sorun:** 403 Forbidden hatası  
**Çözüm:** View'a direct access ver, frontend admin kontrolü yapsın.

---

## 🔄 **MIGRATION SCRIPTS (Gelecekte)**

Proje güncellendikçe buraya yeni migration script'leri eklenecek:

```
migrations/
  ├── 001_add_supplier_table.sql
  ├── 002_add_cost_tracking.sql
  ├── 003_multi_marketplace.sql
  └── ...
```

---

## 🧪 **TEST SCRIPTS**

### **RLS Test:**
```sql
-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'shipments', 'profiles');

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'products';
```

### **Admin Test:**
```sql
-- Check admin role
SELECT role FROM profiles WHERE id = auth.uid();

-- Test admin function
SELECT is_admin();
```

### **Data Test:**
```sql
-- Check user data
SELECT * FROM admin_user_stats;

-- Check product counts
SELECT user_id, COUNT(*) as product_count 
FROM products 
GROUP BY user_id;
```

---

## ⚠️ **UYARILAR**

### **Tehlikeli Komutlar (Production'da KULLANMA!):**
```sql
-- ❌ ASLA KULLANMA
DROP TABLE products CASCADE;
DELETE FROM products;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

### **Güvenli Komutlar:**
```sql
-- ✅ Kullanabilirsin
SELECT * FROM products WHERE user_id = auth.uid();
UPDATE products SET price = 10 WHERE id = 'xxx' AND user_id = auth.uid();
```

---

## 📊 **DATABASE SCHEMA OVERVIEW**

```
┌──────────────────┐
│   auth.users     │ (Supabase built-in)
└────────┬─────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌────▼──────────┐
│    profiles     │  │ subscriptions │
│  - role (admin) │  │  - plan_type  │
│  - onboarding   │  │  - status     │
└────────┬────────┘  └───────────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
┌────────▼────────┐  ┌────▼────────┐  ┌────▼──────────┐
│    products     │  │  shipments  │  │ usage_limits  │
│  - user_id      │  │  - user_id  │  │  - user_id    │
│  - RLS enabled  │  │  - RLS      │  │  - counters   │
└─────────────────┘  └─────────────┘  └───────────────┘
```

---

## 🔍 **TROUBLESHOOTING**

### **Problem: RLS 403 Error**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'products';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Re-enable if needed
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

### **Problem: Admin View Fails**
```sql
-- Drop and recreate
DROP VIEW IF EXISTS admin_user_stats;
-- Then run fix-admin-view-simple.sql
```

### **Problem: User Can't See Their Data**
```sql
-- Check user_id in products
SELECT id, name, user_id FROM products LIMIT 5;

-- Check current user
SELECT auth.uid();

-- Check if they match
SELECT * FROM products WHERE user_id = auth.uid();
```

---

## 📝 **BACKUP & RESTORE**

### **Backup:**
```bash
# Supabase CLI
supabase db dump -f backup.sql

# Or use Supabase Dashboard
# Settings > Database > Backup
```

### **Restore:**
```bash
# Supabase CLI
supabase db reset
psql -d your_db -f backup.sql
```

---

## 📚 **KAYNAKLAR**

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase RPC](https://supabase.com/docs/guides/database/functions)

---

## ✅ **CHECKLIST**

Fresh install için:
- [ ] 1. supabase-schema-saas.sql çalıştırıldı
- [ ] 2. ENABLE_RLS_NOW.sql çalıştırıldı
- [ ] 3. add-admin-role.sql çalıştırıldı (email güncelle!)
- [ ] 4. add-gift-premium-function.sql çalıştırıldı
- [ ] 5. add-onboarding-field.sql çalıştırıldı
- [ ] 6. create-product-rpc.sql çalıştırıldı
- [ ] 7. fix-admin-view-simple.sql çalıştırıldı
- [ ] 8. Test: Admin login ve user list görünüyor
- [ ] 9. Test: RLS çalışıyor (user separation)
- [ ] 10. Test: Product creation çalışıyor

---

**Son Güncelleme:** 23 Ekim 2025  
**Database Version:** 1.0 (SaaS)

