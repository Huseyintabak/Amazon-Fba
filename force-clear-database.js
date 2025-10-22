// =====================================================
// Güçlü Veritabanı Temizleme Scripti
// =====================================================
// Bu script tüm verileri zorla siler

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://rwxkjsnnemzuxtrzygzq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3eGtqc25uZW16dXh0cnp5Z3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzQzMjIsImV4cCI6MjA3NjcxMDMyMn0._FhKrcRXwYNi4Chq2Cqevv4aDN3yl6OFXK3vtLBWcds';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function forceClearDatabase() {
  console.log('🗑️ Güçlü veritabanı temizleme işlemi başlatılıyor...');
  
  try {
    // 1. Önce mevcut verileri listele
    console.log('📋 Mevcut veriler kontrol ediliyor...');
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name');
    
    const { data: shipments, error: shipmentsError } = await supabase
      .from('shipments')
      .select('id, fba_shipment_id');
    
    const { data: items, error: itemsError } = await supabase
      .from('shipment_items')
      .select('id');

    console.log(`📦 Products: ${products?.length || 0} kayıt`);
    console.log(`🚚 Shipments: ${shipments?.length || 0} kayıt`);
    console.log(`📋 Shipment Items: ${items?.length || 0} kayıt`);

    // 2. Shipment Items'ları tek tek sil
    if (items && items.length > 0) {
      console.log('📋 Shipment Items tek tek siliniyor...');
      for (const item of items) {
        const { error } = await supabase
          .from('shipment_items')
          .delete()
          .eq('id', item.id);
        if (error) {
          console.log(`⚠️ Item ${item.id} silinemedi:`, error.message);
        }
      }
    }

    // 3. Shipments'ları tek tek sil
    if (shipments && shipments.length > 0) {
      console.log('🚚 Shipments tek tek siliniyor...');
      for (const shipment of shipments) {
        const { error } = await supabase
          .from('shipments')
          .delete()
          .eq('id', shipment.id);
        if (error) {
          console.log(`⚠️ Shipment ${shipment.fba_shipment_id} silinemedi:`, error.message);
        }
      }
    }

    // 4. Products'ları tek tek sil
    if (products && products.length > 0) {
      console.log('📦 Products tek tek siliniyor...');
      for (const product of products) {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
        if (error) {
          console.log(`⚠️ Product ${product.name} silinemedi:`, error.message);
        }
      }
    }

    // 5. Son kontrol
    console.log('📊 Son kontrol yapılıyor...');
    
    const { count: finalProductsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { count: finalShipmentsCount } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true });
    
    const { count: finalItemsCount } = await supabase
      .from('shipment_items')
      .select('*', { count: 'exact', head: true });

    console.log('📈 Son durum:');
    console.log(`   Products: ${finalProductsCount}`);
    console.log(`   Shipments: ${finalShipmentsCount}`);
    console.log(`   Shipment Items: ${finalItemsCount}`);

    if (finalProductsCount === 0 && finalShipmentsCount === 0 && finalItemsCount === 0) {
      console.log('🎉 Veritabanı başarıyla temizlendi!');
      console.log('✨ Tüm tablolar boş, yeni veri eklemeye hazır');
    } else {
      console.log('⚠️ Hala bazı veriler mevcut');
      console.log('💡 Supabase Dashboard\'dan manuel olarak silebilirsiniz');
    }

  } catch (error) {
    console.error('❌ Genel hata:', error);
  }
}

// Scripti çalıştır
forceClearDatabase();
