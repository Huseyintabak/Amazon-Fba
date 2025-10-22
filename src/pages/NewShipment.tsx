import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseStore } from '../stores/useSupabaseStore';
import { Product, Shipment, ShipmentItem } from '../types';

const NewShipment: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const { showToast } = useToast();
  const { products, shipments, loadProducts, loadShipments, addShipment, updateShipment } = useSupabaseStore();
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
  const [editingItem, setEditingItem] = useState<ShipmentItem | null>(null);
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
        
        // TODO: Load existing shipment items from Supabase
        // const existingItems = getProductsByShipment(id);
        // setSelectedProducts(existingItems);
      }
    }
  }, [isEditMode, id, shipments]);

  // Filtered products for selection
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.asin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.merchant_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const product = mockProducts.find(p => p.amazon_barcode === barcode);
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

        if (isEditMode && id) {
          await updateShipment(id, shipmentData);
          showToast('Sevkiyat başarıyla güncellendi!', 'success');
        } else {
          await addShipment(shipmentData);
          showToast('Taslak başarıyla kaydedildi!', 'success');
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

        if (isEditMode && id) {
          await updateShipment(id, shipmentData);
          showToast('Sevkiyat başarıyla güncellendi!', 'success');
        } else {
          await addShipment(shipmentData);
          showToast('Sevkiyat başarıyla tamamlandı!', 'success');
        }
      } catch (error) {
        console.error('Error completing shipment:', error);
        showToast('Sevkiyat tamamlanırken hata oluştu!', 'error');
      }
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
    
    if (shipmentDate > today) {
      newErrors.shipment_date = 'Sevkiyat tarihi gelecekte olamaz';
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
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Temel Bilgiler</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label">FBA Shipment ID *</label>
                <input
                  type="text"
                  value={formData.fba_shipment_id}
                  onChange={(e) => setFormData({ ...formData, fba_shipment_id: e.target.value })}
                  className={`input-field ${errors.fba_shipment_id ? 'input-error' : ''}`}
                  placeholder="FBA123456789"
                />
                {errors.fba_shipment_id && <p className="error-message">{errors.fba_shipment_id}</p>}
              </div>

              <div>
                <label className="label">Sevkiyat Tarihi</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                  <input
                    type="date"
                    value={formData.shipment_date}
                    onChange={(e) => setFormData({ ...formData, shipment_date: e.target.value })}
                    className={`input-field pl-10 ${errors.shipment_date ? 'input-error' : ''}`}
                  />
                </div>
                {errors.shipment_date && <p className="error-message">{errors.shipment_date}</p>}
              </div>

              <div>
                <label className="label">Kargo Firması *</label>
                <select
                  value={formData.carrier_company}
                  onChange={(e) => setFormData({ ...formData, carrier_company: e.target.value })}
                  className={`filter-select ${errors.carrier_company ? 'input-error' : ''}`}
                >
                  <option value="">Kargo firması seçin</option>
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="DHL">DHL</option>
                  <option value="Amazon Logistics">Amazon Logistics</option>
                </select>
                {errors.carrier_company && <p className="error-message">{errors.carrier_company}</p>}
              </div>

              <div>
                <label className="label">Toplam Kargo Maliyeti ($) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_shipping_cost}
                    onChange={(e) => setFormData({ ...formData, total_shipping_cost: parseFloat(e.target.value) || 0 })}
                    className={`input-field pl-10 ${errors.total_shipping_cost ? 'input-error' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.total_shipping_cost && <p className="error-message">{errors.total_shipping_cost}</p>}
              </div>

              <div>
                <label className="label">Notlar</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">📝</span>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field pl-10 h-20 resize-none"
                    placeholder="Sevkiyat notları..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Barcode Scanner */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Barkod Okuyucu</h3>
            </div>
            
            <div className="space-y-4">
              {/* Normal Barcode Mode */}
              <button
                onClick={() => setBarcodeMode(!barcodeMode)}
                className={`w-full btn-${barcodeMode ? 'success' : 'secondary'} flex items-center justify-center space-x-2`}
              >
                <span>📱</span>
                <span>{barcodeMode ? 'Barkod Modu Aktif' : 'Barkod Modunu Aç'}</span>
              </button>
              
              {barcodeMode && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleBarcodeScan(barcodeInput);
                      }
                    }}
                    className="input-field"
                    placeholder="Barkodu okutun veya yazın..."
                    autoFocus
                  />
                  <p className="text-xs text-gray-500">
                    Barkodu okutun ve Enter'a basın
                  </p>
                </div>
              )}

              {/* Box Preparation Mode */}
              {selectedProducts.length > 0 && (
                <div className="border-t pt-4">
                  <button
                    onClick={handleBoxPreparationMode}
                    className={`w-full btn-${boxPreparationMode ? 'warning' : 'secondary'} flex items-center justify-center space-x-2`}
                  >
                    <span>📦</span>
                    <span>{boxPreparationMode ? 'Kutu Hazırlama Modu Aktif' : 'Kutu Hazırlama Modunu Aç'}</span>
                  </button>
                  
                  {boxPreparationMode && (
                    <div className="space-y-3 mt-4">
                      {/* Progress Bar */}
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${selectedProducts.length > 0 ? (scannedItems.size / selectedProducts.length) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      
                      <div className="text-center text-sm text-gray-600">
                        {scannedItems.size} / {selectedProducts.length} ürün okundu
                      </div>

                      {/* Double Check Button */}
                      {scannedItems.size > 0 && (
                        <button
                          onClick={handleDoubleCheck}
                          className="w-full btn-primary flex items-center justify-center space-x-2"
                        >
                          <span>🔍</span>
                          <span>Kontrol Et</span>
                        </button>
                      )}

                      {/* Missing Items Alert */}
                      {showDoubleCheck && missingItems.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-red-800">
                            <span>⚠️</span>
                            <span className="font-medium">Eksik Ürünler:</span>
                          </div>
                          <div className="mt-2 text-sm text-red-700">
                            {missingItems.map(productId => {
                              const product = mockProducts.find(p => p.id === productId);
                              return product ? product.name : 'Bilinmeyen Ürün';
                            }).join(', ')}
                          </div>
                        </div>
                      )}

                      {/* Approve Button */}
                      {showDoubleCheck && missingItems.length === 0 && (
                        <button
                          onClick={handleApproveShipment}
                          className="w-full btn-success flex items-center justify-center space-x-2"
                        >
                          <span>✅</span>
                          <span>Sevkiyatı Onayla</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Selection */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="card-title">Ürün Ekleme</h3>
                <button
                  onClick={() => setShowProductSelector(!showProductSelector)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Ürün Ekle</span>
                </button>
              </div>
            </div>

            {showProductSelector && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="relative mb-4">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400">📦</span>
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            ASIN: {product.asin} | SKU: {product.merchant_sku}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleProductSelect(product)}
                        className="btn-sm btn-primary"
                      >
                        Ekle
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.products && <p className="error-message">{errors.products}</p>}
          </div>

          {/* Selected Products */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                Seçilen Ürünler ({selectedProducts.length})
              </h3>
              <p className="card-subtitle">
                Toplam {totalQuantity} adet • Birim maliyet: ${unitShippingCost.toFixed(2)}
              </p>
            </div>

            <div className="space-y-3">
              {selectedProducts.map((item) => {
                const isScanned = scannedItems.has(item.product_id);
                const isMissing = missingItems.includes(item.product_id);
                
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                      isScanned 
                        ? 'bg-green-50 border border-green-200' 
                        : isMissing 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">📦</span>
                        {isScanned && <span className="text-green-600 text-lg">✅</span>}
                        {isMissing && <span className="text-red-600 text-lg">❌</span>}
                        {!isScanned && !isMissing && <span className="text-yellow-600 text-lg">⏳</span>}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.product?.name}</div>
                        <div className="text-xs text-gray-500">
                          ASIN: {item.product?.asin} | SKU: {item.product?.merchant_sku}
                        </div>
                        {item.product?.amazon_barcode && (
                          <div className="text-xs text-gray-400 mt-1">
                            Barkod: {item.product.amazon_barcode}
                          </div>
                        )}
                      </div>
                    </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${(item.quantity * unitShippingCost).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${unitShippingCost.toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveProduct(item.id)}
                      className="action-btn action-btn-delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                );
              })}
              
              {selectedProducts.length === 0 && (
                <div className="text-center py-8">
                  <span className="mx-auto text-6xl text-gray-400">📦</span>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Henüz ürün eklenmedi
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ürün ekle butonuna tıklayarak ürün seçin
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {selectedProducts.length > 0 && (
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Sevkiyat Özeti</h3>
                  <p className="text-sm text-blue-700">
                    {selectedProducts.length} ürün • {totalQuantity} adet
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">
                    ${formData.total_shipping_cost.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-700">
                    Toplam kargo maliyeti
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quantity Modal */}
      {showQuantityModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ürün Miktarı
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                <strong>{selectedProduct.name}</strong> için kaç adet eklemek istiyorsunuz?
              </p>
              
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setQuantityInput(Math.max(1, quantityInput - 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-medium"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center text-2xl font-bold border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => setQuantityInput(quantityInput + 1)}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowQuantityModal(false);
                    setSelectedProduct(null);
                    setQuantityInput(1);
                  }}
                  className="btn-secondary flex-1"
                >
                  İptal
                </button>
                <button
                  onClick={handleConfirmQuantity}
                  className="btn-primary flex-1"
                >
                  Ekle ({quantityInput} adet)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewShipment;
