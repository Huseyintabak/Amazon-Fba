-- =====================================================
-- Veritabanı Temizleme Scripti
-- =====================================================
-- Bu script tüm verileri güvenli bir şekilde siler
-- Foreign key kısıtlamaları nedeniyle sırayla silinir

-- 1. Shipment Items tablosunu temizle (en alt seviye)
DELETE FROM shipment_items;

-- 2. Shipments tablosunu temizle
DELETE FROM shipments;

-- 3. Products tablosunu temizle
DELETE FROM products;

-- 4. Reset auto-increment sequences (UUID'ler otomatik oluştuğu için gerekli değil)
-- PostgreSQL'de UUID'ler otomatik oluştuğu için sequence reset gerekmez

-- 5. Veri sayılarını kontrol et
SELECT 
    'Products' as table_name, 
    COUNT(*) as remaining_records 
FROM products
UNION ALL
SELECT 
    'Shipments' as table_name, 
    COUNT(*) as remaining_records 
FROM shipments
UNION ALL
SELECT 
    'Shipment Items' as table_name, 
    COUNT(*) as remaining_records 
FROM shipment_items;

-- =====================================================
-- TEMİZLEME TAMAMLANDI
-- =====================================================
-- Tüm tablolar temizlendi
-- Yeni veri eklemeye hazır
