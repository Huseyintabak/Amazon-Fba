# 🚀 PRODUCTION DEPLOYMENT GUIDE

Amazon FBA Tracker SaaS uygulamasını production'a almak için adım adım kılavuz.

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. **Database**
- [ ] `supabase-schema-saas.sql` çalıştırıldı
- [ ] `ENABLE_RLS_NOW.sql` çalıştırıldı (RLS aktif)
- [ ] `create-product-rpc.sql` çalıştırıldı
- [ ] RLS test edildi (2 farklı kullanıcı ile)
- [ ] "Enable all operations for all users" policy'si SİLİNDİ

### 2. **Environment Variables**
- [ ] Production Supabase URL ayarlandı
- [ ] Production Supabase Anon Key ayarlandı
- [ ] `.env` dosyası `.gitignore`'da

### 3. **Security**
- [ ] Console.log'lar temizlendi
- [ ] Debug mode kapalı
- [ ] API keys güvende
- [ ] CORS ayarları doğru

### 4. **Testing**
- [ ] Quick smoke test PASSED
- [ ] RLS isolation test PASSED
- [ ] CRUD operations test PASSED
- [ ] Mobile responsive test PASSED

### 5. **Performance**
- [ ] Build boyutu < 1MB
- [ ] Lazy loading aktif
- [ ] Images optimize edildi
- [ ] Lighthouse score > 90

---

## 🌍 DEPLOYMENT OPTIONS

### Option 1: GitHub Pages (Ücretsiz, En Kolay)

**장점:**
- Ücretsiz hosting
- Otomatik deployment
- SSL sertifikası dahil

**단점:**
- Statik hosting (SPA için ideal)
- Custom domain ekstra ayar

**Adımlar:**

```bash
# 1. Build oluştur
npm run build

# 2. GitHub Pages için deploy
./deploy.sh

# 3. GitHub Settings → Pages
# Source: gh-pages branch seç
# Domain: https://yourusername.github.io/Amazon-Fba/
```

---

### Option 2: Vercel (Önerilen, Hızlı)

**장점:**
- Çok hızlı deployment
- Otomatik SSL
- Free tier generous
- Preview deployments

**Adımlar:**

1. https://vercel.com → Sign in with GitHub
2. **New Project** → `Amazon-Fba` repository seç
3. **Environment Variables** ekle:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```
4. **Deploy** → 2 dakikada canlı!

**Custom Domain:**
```
Settings → Domains → Add Domain
yourapp.com → Verify
```

---

### Option 3: Netlify

**Adımlar:**

1. https://netlify.com → New site from Git
2. Repository seç
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variables ekle
6. Deploy!

**Custom Redirects (_redirects dosyası):**
```
/*    /index.html   200
```

---

### Option 4: VPS/Sunucu (Tam Kontrol)

**Gereksinimler:**
- Ubuntu 20.04+ sunucu
- Nginx
- Node.js 18+
- SSL sertifikası (Let's Encrypt)

**Adımlar:**

```bash
# 1. Sunucuya bağlan
ssh user@your-server.com

# 2. Repository klonla
git clone https://github.com/yourusername/Amazon-Fba.git
cd Amazon-Fba

# 3. Dependencies yükle
npm install

# 4. .env dosyası oluştur
nano .env
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 5. Build
npm run build

# 6. Nginx config
sudo nano /etc/nginx/sites-available/amazon-fba

# Config:
server {
    listen 80;
    server_name yourapp.com;
    
    root /path/to/Amazon-Fba/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 7. SSL (Let's Encrypt)
sudo certbot --nginx -d yourapp.com

# 8. Restart Nginx
sudo systemctl restart nginx
```

---

## 🔧 POST-DEPLOYMENT

### 1. **Health Check**

```bash
# Test endpoints
curl https://yourapp.com
curl https://yourapp.com/login
curl https://yourapp.com/products
```

### 2. **Monitoring Setup**

- [ ] Google Analytics / PostHog ekle
- [ ] Sentry error tracking ekle
- [ ] Uptime monitoring (UptimeRobot)

### 3. **Performance Check**

- [ ] Lighthouse test yap
- [ ] GTmetrix score kontrol et
- [ ] Load time < 3 saniye

### 4. **User Testing**

- [ ] 2-3 beta kullanıcı davet et
- [ ] Feedback topla
- [ ] Critical bugları düzelt

---

## 🚨 PRODUCTION ISSUES & FIXES

### Issue 1: "RLS çalışmıyor production'da"
**Çözüm:**
```sql
-- Supabase'de kontrol et
SELECT policyname FROM pg_policies WHERE tablename = 'products';
-- "Enable all operations..." policy'si varsa SİL!
DROP POLICY "Enable all operations for all users" ON products;
```

### Issue 2: "404 on page refresh"
**Çözüm:** SPA routing için redirect config:
```
Vercel: vercel.json
Netlify: _redirects
Nginx: try_files
```

### Issue 3: "Env variables not loading"
**Çözüm:**
- Build sırasında env var'lar eklenmeli
- `VITE_` prefix zorunlu
- Rebuild gerekli

### Issue 4: "Slow load time"
**Çözüm:**
```bash
# Code splitting
npm install @loadable/component

# Image optimization
npm install vite-plugin-imagemin

# Lazy loading
React.lazy(() => import('./Page'))
```

---

## 📊 PRODUCTION METRICS

### Target Metrics:
- **Load Time:** < 3 saniye
- **Lighthouse Score:** > 90
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Uptime:** > 99.9%

### Monitoring Tools:
- **Google Analytics:** User behavior
- **Sentry:** Error tracking
- **UptimeRobot:** Uptime monitoring
- **Vercel Analytics:** Performance

---

## 🎯 LAUNCH STRATEGY

### Soft Launch (Hafta 1):
1. 5-10 beta kullanıcı davet et
2. Feedback topla
3. Critical bugları düzelt

### Public Launch (Hafta 2):
1. Social media announcement
2. Product Hunt submission
3. Email marketing (eğer listınız varsa)

### Growth (Hafta 3+):
1. SEO optimization
2. Content marketing
3. Referral program

---

**Son Güncelleme:** _________
**Deployment Status:** 🟢 READY / 🟡 TESTING / 🔴 NOT READY

