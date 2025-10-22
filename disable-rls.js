import { supabaseTyped } from './src/lib/supabase.ts';

async function disableRLS() {
  console.log('🔧 RLS devre dışı bırakılıyor...');

  try {
    // RLS'yi kapat
    console.log('🚫 RLS kapatılıyor...');
    
    // Bu işlemler Supabase Dashboard'dan yapılmalı
    // Çünkü RLS değişiklikleri admin yetkisi gerektirir
    console.log('⚠️ RLS değişiklikleri admin yetkisi gerektirir.');
    console.log('📋 Supabase Dashboard > SQL Editor\'da şu komutları çalıştırın:');
    console.log('');
    console.log('ALTER TABLE products DISABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE shipments DISABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE shipment_items DISABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('🔄 Alternatif olarak, RLS politikalarını düzeltmek için:');
    console.log('fix-rls-policies.sql dosyasındaki komutları çalıştırın.');
    
    // Test shipment creation (RLS kapalıysa çalışmalı)
    console.log('🧪 Test shipment creation...');
    const testShipment = {
      fba_shipment_id: 'TEST-' + Date.now(),
      shipment_date: new Date().toISOString().split('T')[0],
      carrier_company: 'Test Carrier',
      total_shipping_cost: 10.00,
      notes: 'Test shipment',
      status: 'draft'
    };
    
    const { data: newShipment, error: createError } = await supabaseTyped
      .from('shipments')
      .insert([testShipment])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Shipment creation still failing:', createError);
      console.log('💡 RLS hala aktif, Supabase Dashboard\'dan kapatın');
    } else {
      console.log('✅ Shipment creation: SUCCESS!', newShipment.id);
      
      // Clean up test data
      await supabaseTyped
        .from('shipments')
        .delete()
        .eq('id', newShipment.id);
      console.log('🧹 Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ RLS disable test failed:', error);
  }
}

disableRLS();
