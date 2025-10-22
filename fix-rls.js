import { supabaseTyped } from './src/lib/supabase.ts';

async function fixRLSPolicies() {
  console.log('🔧 RLS politikaları düzeltiliyor...');

  try {
    // Mevcut politikaları sil
    console.log('🗑️ Mevcut politikalar siliniyor...');
    
    const policiesToDrop = [
      'Products are insertable by authenticated users',
      'Products are updatable by authenticated users', 
      'Products are deletable by authenticated users',
      'Shipments are insertable by authenticated users',
      'Shipments are updatable by authenticated users',
      'Shipments are deletable by authenticated users',
      'Shipment items are insertable by authenticated users',
      'Shipment items are updatable by authenticated users',
      'Shipment items are deletable by authenticated users'
    ];

    for (const policy of policiesToDrop) {
      try {
        await supabaseTyped.rpc('exec_sql', { 
          sql: `DROP POLICY IF EXISTS "${policy}" ON ${policy.includes('Products') ? 'products' : policy.includes('Shipments') ? 'shipments' : 'shipment_items'};` 
        });
        console.log(`✅ Policy dropped: ${policy}`);
      } catch (error) {
        console.log(`⚠️ Policy drop failed (may not exist): ${policy}`);
      }
    }

    // Yeni politikalar oluştur
    console.log('➕ Yeni politikalar oluşturuluyor...');
    
    const newPolicies = [
      {
        table: 'products',
        name: 'Products are insertable by everyone',
        sql: 'CREATE POLICY "Products are insertable by everyone" ON products FOR INSERT WITH CHECK (true);'
      },
      {
        table: 'products', 
        name: 'Products are updatable by everyone',
        sql: 'CREATE POLICY "Products are updatable by everyone" ON products FOR UPDATE USING (true);'
      },
      {
        table: 'products',
        name: 'Products are deletable by everyone', 
        sql: 'CREATE POLICY "Products are deletable by everyone" ON products FOR DELETE USING (true);'
      },
      {
        table: 'shipments',
        name: 'Shipments are insertable by everyone',
        sql: 'CREATE POLICY "Shipments are insertable by everyone" ON shipments FOR INSERT WITH CHECK (true);'
      },
      {
        table: 'shipments',
        name: 'Shipments are updatable by everyone', 
        sql: 'CREATE POLICY "Shipments are updatable by everyone" ON shipments FOR UPDATE USING (true);'
      },
      {
        table: 'shipments',
        name: 'Shipments are deletable by everyone',
        sql: 'CREATE POLICY "Shipments are deletable by everyone" ON shipments FOR DELETE USING (true);'
      },
      {
        table: 'shipment_items',
        name: 'Shipment items are insertable by everyone',
        sql: 'CREATE POLICY "Shipment items are insertable by everyone" ON shipment_items FOR INSERT WITH CHECK (true);'
      },
      {
        table: 'shipment_items',
        name: 'Shipment items are updatable by everyone',
        sql: 'CREATE POLICY "Shipment items are updatable by everyone" ON shipment_items FOR UPDATE USING (true);'
      },
      {
        table: 'shipment_items', 
        name: 'Shipment items are deletable by everyone',
        sql: 'CREATE POLICY "Shipment items are deletable by everyone" ON shipment_items FOR DELETE USING (true);'
      }
    ];

    for (const policy of newPolicies) {
      try {
        await supabaseTyped.rpc('exec_sql', { sql: policy.sql });
        console.log(`✅ Policy created: ${policy.name}`);
      } catch (error) {
        console.error(`❌ Policy creation failed: ${policy.name}`, error.message);
      }
    }

    // Test shipment creation
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
    console.error('❌ RLS fix failed:', error);
  }
}

fixRLSPolicies();
