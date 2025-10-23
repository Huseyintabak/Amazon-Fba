# 🔧 BUILD FIX - Deployment Issues

> **⚠️ GÜNCEL SORUN: Permission on dist/**  
> Build başarılı ama eski dist/ klasörü sudo ile oluşturulmuş.  
> **Çözüm:** `sudo rm -rf dist` → `npm run build`  
> **Detay:** `SERVER_COMMANDS.md`

---

# 🔧 BUILD FIX - Deployment Issues

**Tarih:** 23 Ekim 2025

---

## ❌ **PROBLEM**

### **Error 1: Missing index.html**
```
Could not resolve entry module "index.html"
```

**Çözüm:** ✅ Fixed (commit: f2efa16)
- index.html eklendi
- vite-env.d.ts eklendi

---

### **Error 2: react-ga4 not found**
```
[vite]: Rollup failed to resolve import "react-ga4"
```

**Neden?** 
Sunucuda `node_modules/` yok veya `npm install` çalıştırılmamış.

**Çözüm:**

#### **Deployment Öncesi (Local):**
```bash
# Dependencies kontrolü
npm install

# Build test
npm run build

# Success görmelisin:
# ✓ 2623 modules transformed.
# dist/index.html created
```

#### **Deployment Sırasında (Server):**
```bash
# 1. Dependencies yükle
npm install

# 2. Build yap
npm run build

# 3. Serve dist/
```

---

## ✅ **DEPLOYMENT CHECKLIST**

### **Pre-Deployment:**
- [ ] `npm install` lokal çalıştırıldı
- [ ] `npm run build` başarılı
- [ ] `dist/` klasörü oluştu
- [ ] `.env` dosyası hazır (supabase, GA)
- [ ] Git commit & push yapıldı

### **Server Setup:**
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   ```bash
   # .env dosyası oluştur
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_GA_MEASUREMENT_ID=your-ga-id
   ```

3. **Build**
   ```bash
   npm run build
   ```

4. **Serve**
   - Vercel/Netlify: Otomatik
   - Manual: `dist/` klasörünü serve et

---

## 🚀 **RECOMMENDED DEPLOYMENT: VERCEL**

### **Why Vercel?**
- ✅ Zero config
- ✅ Auto npm install
- ✅ Auto build
- ✅ Free SSL
- ✅ Free custom domain
- ✅ Auto deploy on git push

### **Quick Deploy:**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

### **Or GitHub Integration:**
1. Go to vercel.com
2. Import from GitHub
3. Select `Amazon-Fba` repo
4. Add environment variables
5. Deploy!

**Environment Variables in Vercel:**
```
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOi...
VITE_GA_MEASUREMENT_ID = G-XXXXXXXXXX
```

---

## 🌐 **ALTERNATIVE: NETLIFY**

### **Quick Deploy:**
```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod
```

### **Build Settings:**
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variables:** Same as Vercel

---

## 📋 **TROUBLESHOOTING**

### **Problem: Dependencies not installing**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

### **Problem: Build fails with TypeScript errors**
```bash
# Check TypeScript
npm run build

# If errors, fix them in code
```

### **Problem: Environment variables not working**
```bash
# Check .env file exists
ls -la .env

# Check variables are prefixed with VITE_
cat .env | grep VITE_
```

### **Problem: 404 on routes**
**Vercel/Netlify:** Add `vercel.json` or `netlify.toml`

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**netlify.toml:**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## ✅ **VERIFIED WORKING**

### **Local Build:**
```bash
cd amazon-fba-tracker
npm install
npm run build

# Success:
✓ 2623 modules transformed.
dist/index.html                   0.70 kB
dist/assets/index-a1db8023.css   44.85 kB
dist/assets/index-7c831065.js   936.60 kB
```

### **Dependencies Confirmed:**
```json
{
  "react-ga4": "^2.1.0",
  "@supabase/supabase-js": "^2.76.1",
  "react": "^18.2.0",
  "react-router-dom": "^6.8.1",
  "recharts": "^2.15.4"
}
```

---

## 🎯 **NEXT STEPS**

1. **Server'da npm install çalıştır**
   ```bash
   cd /var/www/amazon-fba-tracker
   npm install
   npm run build
   ```

2. **Ya da Vercel/Netlify kullan** (Önerilen)
   - Otomatik npm install
   - Otomatik build
   - Zero config

---

**Son Güncelleme:** 23 Ekim 2025  
**Status:** Build working locally ✅  
**Action Required:** Deploy to Vercel/Netlify or run npm install on server

