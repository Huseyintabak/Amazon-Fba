// =====================================================
// Veritabanı Temizleme Scripti
// =====================================================
// Bu script tüm verileri güvenli bir şekilde siler

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://rwxkjsnnemzuxtrzygzq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3eGtqc25uZW16dXh0cnp5Z3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzQzMjIsImV4cCI6MjA3NjcxMDMyMn0._FhKrcRXwYNi4Chq2Cqevv4aDN3yl6OFXK3vtLBWcds';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearDatabase() {
  console.log('🗑️ Veritabanı temizleme işlemi başlatılıyor...');
  
  try {
    // 1. Shipment Items tablosunu temizle (en alt seviye)
    console.log('📦 Shipment Items tablosu temizleniyor...');
    const { error: itemsError } = await supabase
      .from('shipment_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Tüm kayıtları sil
    
    if (itemsError) {
      console.error('❌ Shipment Items silinirken hata:', itemsError);
      return;
    }
    console.log('✅ Shipment Items temizlendi');

    // 2. Shipments tablosunu temizle
    console.log('🚚 Shipments tablosu temizleniyor...');
    const { error: shipmentsError } = await supabase
      .from('shipments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Tüm kayıtları sil
    
    if (shipmentsError) {
      console.error('❌ Shipments silinirken hata:', shipmentsError);
      return;
    }
    console.log('✅ Shipments temizlendi');

    // 3. Products tablosunu temizle
    console.log('📦 Products tablosu temizleniyor...');
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Tüm kayıtları sil
    
    if (productsError) {
      console.error('❌ Products silinirken hata:', productsError);
      return;
    }
    console.log('✅ Products temizlendi');

    // 4. Veri sayılarını kontrol et
    console.log('📊 Kalan veri sayıları kontrol ediliyor...');
    
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { count: shipmentsCount } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true });
    
    const { count: itemsCount } = await supabase
      .from('shipment_items')
      .select('*', { count: 'exact', head: true });

    console.log('📈 Kalan kayıt sayıları:');
    console.log(`   Products: ${productsCount}`);
    console.log(`   Shipments: ${shipmentsCount}`);
    console.log(`   Shipment Items: ${itemsCount}`);

    if (productsCount === 0 && shipmentsCount === 0 && itemsCount === 0) {
      console.log('🎉 Veritabanı başarıyla temizlendi!');
      console.log('✨ Tüm tablolar boş, yeni veri eklemeye hazır');
    } else {
      console.log('⚠️ Bazı veriler hala mevcut, tekrar deneyin');
    }

  } catch (error) {
    console.error('❌ Genel hata:', error);
  }
}

// Scripti çalıştır
clearDatabase();
