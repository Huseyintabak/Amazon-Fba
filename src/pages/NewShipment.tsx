import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useStore } from '../stores/useStore';
import { shipmentItemsApi } from '../lib/supabaseApi';
import { Product, ShipmentItem } from '../types';
import { ShipmentForm } from './NewShipment/components/ShipmentForm';
import { BarcodeScanner } from './NewShipment/components/BarcodeScanner';
import { ShipmentProducts } from './NewShipment/components/ShipmentProducts';
import { QuantityModal } from './NewShipment/components/QuantityModal';

const NewShipment: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const { showToast } = useToast();
  const { products, shipments, loadProducts, loadShipments, addShipment, updateShipment } = useStore();
  const [formData, setFormData] = useState({
    fba_shipment_id: '',
    shipment_date: new Date().toISOString().split('T')[0],
    carrier_company: '',
    total_shipping_cost: 0,
    notes: ''
  });

  const [selectedProducts, setSelectedProducts] = useState<ShipmentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  // const [editingItem, setEditingItem] = useState<ShipmentItem | null>(null);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [boxPreparationMode, setBoxPreparationMode] = useState(false);
  const [scannedItems, setScannedItems] = useState<Set<string>>(new Set());
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [showDoubleCheck, setShowDoubleCheck] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState(1);

  // Load data on component mount
  useEffect(() => {
    loadProducts();
    loadShipments();
  }, [loadProducts, loadShipments]);

  // Load existing shipment data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const existingShipment = shipments.find(s => s.id === id);
      if (existingShipment) {
        setFormData({
          fba_shipment_id: existingShipment.fba_shipment_id,
          shipment_date: existingShipment.shipment_date,
          carrier_company: existingShipment.carrier_company,
          total_shipping_cost: existingShipment.total_shipping_cost,
          notes: existingShipment.notes || ''
        });
        
        // Load existing shipment items from Supabase
        loadShipmentItems(id);
      }
    }
  }, [isEditMode, id, shipments]);

  // Load shipment items function
  const loadShipmentItems = async (shipmentId: string) => {
    try {
      const items = await shipmentItemsApi.getByShipmentId(shipmentId);
      setSelectedProducts(items);
    } catch (error) {
      console.error('Error loading shipment items:', error);
      showToast('Sevkiyat ürünleri yüklenirken hata oluştu!', 'error');
    }
  };

  // Filtered products for selection
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.asin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.merchant_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Calculate unit shipping cost
  const totalQuantity = selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
  const unitShippingCost = totalQuantity > 0 ? formData.total_shipping_cost / totalQuantity : 0;

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantityInput(1);
    setShowQuantityModal(true);
  };

  const handleAddProduct = (product: Product, quantity: number) => {
    const existingItem = selectedProducts.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setSelectedProducts(selectedProducts.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const newItem: ShipmentItem = {
        id: Date.now().toString(),
        shipment_id: '',
        product_id: product.id,
        quantity,
        unit_shipping_cost: 0, // Will be calculated later
        barcode_scanned: false,
        created_at: new Date().toISOString(),
        product
      };
      setSelectedProducts([...selectedProducts, newItem]);
    }
    
    setShowProductSelector(false);
    setSearchTerm('');
  };

  const handleConfirmQuantity = () => {
    if (selectedProduct && quantityInput > 0) {
      handleAddProduct(selectedProduct, quantityInput);
      setShowQuantityModal(false);
      setSelectedProduct(null);
      setQuantityInput(1);
    }
  };

  const handleRemoveProduct = (itemId: string) => {
    setSelectedProducts(selectedProducts.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveProduct(itemId);
      return;
    }
    
    setSelectedProducts(selectedProducts.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.amazon_barcode === barcode);
    if (product) {
      if (boxPreparationMode) {
        // Box preparation mode - mark as scanned
        setScannedItems(prev => new Set([...prev, product.id]));
        showToast(`${product.name} okundu!`, 'success');
      } else {
        // Normal mode - add to shipment
        setSelectedProduct(product);
        setQuantityInput(1);
        setShowQuantityModal(true);
      }
      setBarcodeInput('');
    } else {
      showToast('Barkod bulunamadı! Lütfen geçerli bir barkod girin.', 'error');
    }
  };

  const handleBoxPreparationMode = () => {
    setBoxPreparationMode(!boxPreparationMode);
    setScannedItems(new Set());
    setMissingItems([]);
    setShowDoubleCheck(false);
  };

  const handleDoubleCheck = () => {
    const allProductIds = selectedProducts.map(item => item.product_id);
    const missing = allProductIds.filter(id => !scannedItems.has(id));
    setMissingItems(missing);
    setShowDoubleCheck(true);
    
    if (missing.length === 0) {
      showToast('Tüm ürünler okundu! Sevkiyat hazır.', 'success');
    } else {
      showToast(`${missing.length} ürün eksik! Lütfen eksik ürünleri okutun.`, 'warning');
    }
  };

  const handleApproveShipment = () => {
    if (missingItems.length === 0) {
      showToast('Sevkiyat onaylandı! Tüm ürünler kontrol edildi.', 'success');
      setBoxPreparationMode(false);
      setScannedItems(new Set());
      setMissingItems([]);
      setShowDoubleCheck(false);
    }
  };

  const handleSaveDraft = async () => {
    if (validateForm()) {
      try {
        const shipmentData = {
          fba_shipment_id: formData.fba_shipment_id,
          shipment_date: formData.shipment_date,
          carrier_company: formData.carrier_company,
          total_shipping_cost: formData.total_shipping_cost,
          notes: formData.notes,
          status: 'draft' as const
        };

        let shipmentId: string;
        if (isEditMode && id) {
          await updateShipment(id, shipmentData);
          shipmentId = id;
          showToast('Sevkiyat başarıyla güncellendi!', 'success');
        } else {
          const newShipment = await addShipment(shipmentData);
          shipmentId = newShipment.id;
          showToast('Taslak başarıyla kaydedildi!', 'success');
        }

        // Save shipment items
        if (selectedProducts.length > 0) {
          await saveShipmentItems(shipmentId);
        }
      } catch (error) {
        console.error('Error saving shipment:', error);
        showToast('Sevkiyat kaydedilirken hata oluştu!', 'error');
      }
    }
  };

  const handleCompleteShipment = async () => {
    if (validateForm() && selectedProducts.length > 0) {
      try {
        const shipmentData = {
          fba_shipment_id: formData.fba_shipment_id,
          shipment_date: formData.shipment_date,
          carrier_company: formData.carrier_company,
          total_shipping_cost: formData.total_shipping_cost,
          notes: formData.notes,
          status: 'completed' as const
        };

        let shipmentId: string;
        if (isEditMode && id) {
          await updateShipment(id, shipmentData);
          shipmentId = id;
          showToast('Sevkiyat başarıyla güncellendi!', 'success');
        } else {
          const newShipment = await addShipment(shipmentData);
          shipmentId = newShipment.id;
          showToast('Sevkiyat başarıyla tamamlandı!', 'success');
        }

        // Save shipment items
        await saveShipmentItems(shipmentId);
      } catch (error) {
        console.error('Error completing shipment:', error);
        showToast('Sevkiyat tamamlanırken hata oluştu!', 'error');
      }
    }
  };

  // Save shipment items function
  const saveShipmentItems = async (shipmentId: string) => {
    try {
      // Delete existing items if in edit mode
      if (isEditMode) {
        await shipmentItemsApi.deleteByShipmentId(shipmentId);
      }

      // Create new items
      if (selectedProducts.length > 0) {
        const itemsToCreate = selectedProducts.map(item => ({
          shipment_id: shipmentId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_shipping_cost: item.unit_shipping_cost,
          barcode_scanned: item.barcode_scanned || false
        }));

        await shipmentItemsApi.createBulk(itemsToCreate);
        console.log('Shipment items saved successfully');
      }
    } catch (error) {
      console.error('Error saving shipment items:', error);
      showToast('Sevkiyat ürünleri kaydedilirken hata oluştu!', 'error');
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // FBA Shipment ID validation
    if (!formData.fba_shipment_id.trim()) {
      newErrors.fba_shipment_id = 'FBA Shipment ID gerekli';
    } else if (formData.fba_shipment_id.length < 3) {
      newErrors.fba_shipment_id = 'FBA Shipment ID en az 3 karakter olmalı';
    }
    
    // Carrier company validation
    if (!formData.carrier_company.trim()) {
      newErrors.carrier_company = 'Kargo firması gerekli';
    }
    
    // Shipping cost validation
    if (formData.total_shipping_cost <= 0) {
      newErrors.total_shipping_cost = 'Kargo maliyeti 0\'dan büyük olmalı';
    } else if (formData.total_shipping_cost > 10000) {
      newErrors.total_shipping_cost = 'Kargo maliyeti çok yüksek (max: $10,000)';
    }
    
    // Products validation
    if (selectedProducts.length === 0) {
      newErrors.products = 'En az bir ürün seçmelisiniz';
    }
    
    // Date validation
    const shipmentDate = new Date(formData.shipment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Allow future dates for shipment planning
    if (shipmentDate < today) {
      newErrors.shipment_date = 'Sevkiyat tarihi geçmişte olamaz';
    }
    
    setErrors(newErrors);
    
    // Show error toast if validation fails
    if (Object.keys(newErrors).length > 0) {
      showToast('Lütfen form hatalarını düzeltin', 'error');
    }
    
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Sevkiyat Düzenle' : 'Yeni Sevkiyat'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {isEditMode ? 'Sevkiyat bilgilerini düzenleyin ve ürün ekleyin' : 'Yeni sevkiyat oluşturun ve ürün ekleyin'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleSaveDraft}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>💾</span>
            <span>{isEditMode ? 'Değişiklikleri Kaydet' : 'Taslak Kaydet'}</span>
          </button>
          {isEditMode && (
            <button
              onClick={handleCompleteShipment}
              className="btn-success flex items-center space-x-2"
            >
              <span>✅</span>
              <span>Sevkiyatı Tamamla</span>
            </button>
          )}
          {!isEditMode && (
            <button
              onClick={handleCompleteShipment}
              className="btn-success flex items-center space-x-2"
            >
              <span>✅</span>
              <span>Sevkiyatı Tamamla</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-1 space-y-6">
          <ShipmentForm
            formData={formData}
            errors={errors}
            onChange={(data) => setFormData({ ...formData, ...data })}
          />

          <BarcodeScanner
            barcodeMode={barcodeMode}
            barcodeInput={barcodeInput}
            boxPreparationMode={boxPreparationMode}
            scannedItems={scannedItems}
            missingItems={missingItems}
            showDoubleCheck={showDoubleCheck}
            selectedProductsCount={selectedProducts.length}
            products={products}
            onToggleBarcodeMode={() => setBarcodeMode(!barcodeMode)}
            onToggleBoxPreparationMode={handleBoxPreparationMode}
            onBarcodeInputChange={setBarcodeInput}
            onBarcodeScan={handleBarcodeScan}
            onDoubleCheck={handleDoubleCheck}
            onApproveShipment={handleApproveShipment}
          />
        </div>

        {/* Right Column - Products */}
        <div className="lg:col-span-2 space-y-6">
          <ShipmentProducts
            selectedProducts={selectedProducts}
            unitShippingCost={unitShippingCost}
            totalShippingCost={formData.total_shipping_cost}
            scannedItems={scannedItems}
            missingItems={missingItems}
            showProductSelector={showProductSelector}
            searchTerm={searchTerm}
            filteredProducts={filteredProducts}
            errors={errors}
            totalQuantity={totalQuantity}
            onToggleProductSelector={() => setShowProductSelector(!showProductSelector)}
            onSearchChange={setSearchTerm}
            onProductSelect={handleProductSelect}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveProduct={handleRemoveProduct}
          />
        </div>
      </div>

      <QuantityModal
        isOpen={showQuantityModal}
        product={selectedProduct}
        quantity={quantityInput}
        onQuantityChange={setQuantityInput}
        onConfirm={handleConfirmQuantity}
        onCancel={() => {
          setShowQuantityModal(false);
          setSelectedProduct(null);
          setQuantityInput(1);
        }}
      />
    </div>
  );
};

export default NewShipment;
