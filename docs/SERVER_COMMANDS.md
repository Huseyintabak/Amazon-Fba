# 🖥️ SERVER COMMANDS - Quick Reference

**Server:** vipkrom-A4110  
**Path:** /var/www/amazon-fba-tracker

---

## 🔧 **SON SORUN: Permission on dist/**

### **Problem:**
```
EACCES: permission denied, rmdir '/var/www/amazon-fba-tracker/dist/assets'
```

**Neden?**  
Eski `dist/` klasörü sudo ile oluşturulmuş, şimdi Vite onu silemyor.

---

## ✅ **ÇÖZÜM (Server'da çalıştır):**

```bash
# 1. Eski dist klasörünü temizle
cd /var/www/amazon-fba-tracker
sudo rm -rf dist

# 2. Build yap (sudo YOK!)
npm run build

# 3. Success! ✓ built in ~3s
```

---

## 📋 **FULL DEPLOYMENT KOMUTLARI**

### **Fresh Deploy:**
```bash
cd /var/www/amazon-fba-tracker

# Update code
sudo git pull origin main

# Install dependencies
sudo npm install

# Clean old build
sudo rm -rf dist

# Build (without sudo)
npm run build

# Check dist created
ls -la dist/
```

---

## 🎯 **BAŞARILI BUILD ÇIKTISI**

```
vite v4.5.14 building for production...
✓ 2623 modules transformed.
✓ built in ~3s

dist/index.html                   0.70 kB
dist/assets/index-*.css          44.85 kB
dist/assets/index-*.js          936.60 kB
```

---

## 🌐 **SERVE DİST/**

### **Option 1: Nginx (Önerilen)**
```nginx
# /etc/nginx/sites-available/amazon-fba

server {
    listen 80;
    server_name your-domain.com;
    root /var/www/amazon-fba-tracker/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/amazon-fba /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### **Option 2: Simple Python Server (Test)**
```bash
cd /var/www/amazon-fba-tracker/dist
python3 -m http.server 3000
```

---

### **Option 3: PM2 + Serve**
```bash
# Install serve globally
sudo npm install -g serve

# Serve with PM2
pm2 serve dist 3000 --name amazon-fba
pm2 save
```

---

## 🔍 **TROUBLESHOOTING**

### **Problem: Still permission errors**
```bash
# Fix ownership
cd /var/www
sudo chown -R vipkrom:vipkrom amazon-fba-tracker

# Try build again
cd amazon-fba-tracker
npm run build
```

---

### **Problem: Port already in use**
```bash
# Find process
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

---

### **Problem: Build works but can't access**
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx config
sudo nginx -t

# View nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📝 **ENV VARIABLES**

Server'da `.env` dosyası oluştur:

```bash
cd /var/www/amazon-fba-tracker
sudo nano .env
```

**İçerik:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Build sonrası bu variables Vite tarafından bundle'a embed edilir.**

---

## ✅ **QUICK DEPLOY CHECKLIST**

```bash
# 1. Update code
cd /var/www/amazon-fba-tracker
sudo git pull origin main

# 2. Install deps
sudo npm install

# 3. Create .env (if not exists)
# [Add your environment variables]

# 4. Clean old build
sudo rm -rf dist

# 5. Build
npm run build

# 6. Verify
ls -la dist/

# 7. Serve (nginx/serve/pm2)
# [Configure your web server]

# 8. Test
curl http://localhost:3000
# or
curl http://your-domain.com
```

---

## 🚀 **SONUÇ**

Build başarılı! Artık:
- ✅ `dist/` klasörü oluştu
- ✅ Static files hazır
- ✅ Web server'a serve edilebilir

**Next:** Nginx/Serve ile production'a al!

---

## 💡 **DÜŞÜNEBİLECEĞİN ALTERNATIV: VERCEL**

Bu kadar uğraşmak yerine:

```bash
# Local'de
cd amazon-fba-tracker
npm i -g vercel
vercel login
vercel --prod
```

**Avantajlar:**
- Zero server config
- Auto SSL
- Auto deploy
- Free hosting
- Custom domain

**5 dakikada canlı! 🚀**

---

**Son Güncelleme:** 23 Ekim 2025  
**Status:** Build başarılı, serve edilmeye hazır!

