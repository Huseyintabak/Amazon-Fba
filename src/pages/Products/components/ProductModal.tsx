import React, { useState, useEffect } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { supabase } from '../../../lib/supabase';
import { validateProduct } from '../../../lib/validation';
import { Product, Category } from '../../../types';
import CategoryManager from '../../../components/CategoryManager';
import ImageUpload from '../../../components/ImageUpload';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: (product: Partial<Product>) => Promise<void>;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    asin: product?.asin || '',
    merchant_sku: product?.merchant_sku || '',
    amazon_barcode: product?.amazon_barcode || '',
    supplier_id: product?.supplier_id || '',
    manufacturer_code: product?.manufacturer_code || '',
    product_cost: product?.product_cost || '',
    amazon_price: product?.amazon_price || '',
    referral_fee_percent: product?.referral_fee_percent || '',
    fulfillment_fee: product?.fulfillment_fee || '',
    advertising_cost: product?.advertising_cost || '',
    initial_investment: product?.initial_investment || '',
    category_id: product?.category_id || '',
    image_url: product?.image_url || '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('id, name, company_name, country')
          .order('name');
        
        if (error) throw error;
        setSuppliers(data || []);
      } catch (error: unknown) {
        console.error('Tedarikçiler yüklenemedi:', error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error));
      }
    };

    const loadCategories = async () => {
      try {
        const { categoriesApi } = await import('../../../lib/supabaseApi');
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (error: unknown) {
        console.error('Kategoriler yüklenemedi:', error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error));
      }
    };

    loadSuppliers();
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Calculate estimated profit and ROI
      const productCost = formData.product_cost ? parseFloat(formData.product_cost.toString()) : 0;
      const amazonPrice = formData.amazon_price ? parseFloat(formData.amazon_price.toString()) : 0;
      const referralFeePercent = formData.referral_fee_percent ? parseFloat(formData.referral_fee_percent.toString()) : 0;
      const fulfillmentFee = formData.fulfillment_fee ? parseFloat(formData.fulfillment_fee.toString()) : 0;
      const advertisingCost = formData.advertising_cost ? parseFloat(formData.advertising_cost.toString()) : 0;
      const initialInvestment = formData.initial_investment ? parseFloat(formData.initial_investment.toString()) : 0;

      // Calculate estimated profit per unit
      let estimatedProfit = 0;
      let roiPercentage = 0;

      if (amazonPrice > 0 && productCost > 0) {
        const referralFee = (amazonPrice * referralFeePercent) / 100;
        const totalCosts = productCost + referralFee + fulfillmentFee + advertisingCost;
        estimatedProfit = amazonPrice - totalCosts;
        
        // Calculate ROI percentage - use productCost as base if no initial investment
        if (initialInvestment > 0) {
          roiPercentage = (estimatedProfit / initialInvestment) * 100;
        } else {
          // Use productCost as base for ROI calculation
          roiPercentage = (estimatedProfit / productCost) * 100;
        }
      }

      const productData = {
        name: formData.name,
        asin: formData.asin || undefined,
        merchant_sku: formData.merchant_sku || undefined,
        amazon_barcode: formData.amazon_barcode || undefined,
        manufacturer_code: formData.manufacturer_code || undefined,
        product_cost: productCost || undefined,
        amazon_price: amazonPrice || undefined,
        referral_fee_percent: referralFeePercent || undefined,
        fulfillment_fee: fulfillmentFee || undefined,
        advertising_cost: advertisingCost || undefined,
        initial_investment: initialInvestment || undefined,
        supplier_id: formData.supplier_id || undefined,
        category_id: formData.category_id || undefined,
        image_url: formData.image_url || undefined,
        estimated_profit: estimatedProfit !== 0 ? estimatedProfit : undefined,
        roi_percentage: roiPercentage !== 0 ? roiPercentage : undefined,
      };

      const validation = validateProduct(productData);
      if (!validation.isValid) {
        showToast(`Hata: ${validation.errors.join(', ')}`, 'error');
        return;
      }

      await onSuccess(productData as any);
      onClose();
    } catch (error: unknown) {
      showToast(`Hata: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          {product ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label required">Ürün Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Ürün adını girin"
                required
              />
            </div>

            <div>
              <label className="label">ASIN</label>
              <input
                type="text"
                value={formData.asin}
                onChange={(e) => setFormData({ ...formData, asin: e.target.value })}
                className="input-field"
                placeholder="B01ABC123D"
              />
            </div>

            <div>
              <label className="label">Merchant SKU</label>
              <input
                type="text"
                value={formData.merchant_sku}
                onChange={(e) => setFormData({ ...formData, merchant_sku: e.target.value })}
                className="input-field"
                placeholder="SKU-123456"
              />
            </div>

            <div>
              <label className="label">Amazon Barkod</label>
              <input
                type="text"
                value={formData.amazon_barcode}
                onChange={(e) => setFormData({ ...formData, amazon_barcode: e.target.value })}
                className="input-field"
                placeholder="B08QCQYPFX"
              />
            </div>

            <div>
              <label className="label">Tedarikçi</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="input-field"
              >
                <option value="">Tedarikçi seçin</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} {supplier.company_name && `(${supplier.company_name})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Üretici Kodu</label>
              <input
                type="text"
                value={formData.manufacturer_code}
                onChange={(e) => setFormData({ ...formData, manufacturer_code: e.target.value })}
                className="input-field"
                placeholder="MFG-123"
              />
            </div>

            <div>
              <label className="label">Ürün Maliyeti ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.product_cost}
                onChange={(e) => setFormData({ ...formData, product_cost: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Premium Features Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🚀</span>
              <h4 className="text-lg font-bold text-gray-900">Premium Özellikler</h4>
              <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
                PRO
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Amazon Fiyatı ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amazon_price}
                  onChange={(e) => setFormData({ ...formData, amazon_price: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">Referans Ücreti (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.referral_fee_percent}
                  onChange={(e) => setFormData({ ...formData, referral_fee_percent: e.target.value })}
                  className="input-field"
                  placeholder="15.00"
                />
              </div>

              <div>
                <label className="label">Fulfillment Ücreti ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fulfillment_fee}
                  onChange={(e) => setFormData({ ...formData, fulfillment_fee: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">Reklam Maliyeti ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.advertising_cost}
                  onChange={(e) => setFormData({ ...formData, advertising_cost: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">İlk Yatırım ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.initial_investment}
                  onChange={(e) => setFormData({ ...formData, initial_investment: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">Satılan Adet</label>
                <div className="input-field bg-gray-50 text-gray-600 flex items-center justify-between">
                  <span>Otomatik hesaplanır (sevkiyat verilerinden)</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">AUTO</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-sm text-blue-800">
                <span className="text-lg">💡</span>
                <span>
                  <strong>Pro özellik:</strong> Bu alanlar otomatik kar hesaplama ve ROI analizi için kullanılır. 
                  Satılan adet sevkiyat verilerinden otomatik hesaplanır.
                </span>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="label">Kategori</label>
            <div className="flex items-center space-x-2">
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="input-field flex-1"
              >
                <option value="">Kategori seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCategoryManager(true)}
                className="btn-secondary px-3 py-2 text-sm"
              >
                🏷️
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="label">Ürün Resmi</label>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageChange={(imageUrl) => setFormData({ ...formData, image_url: imageUrl || '' })}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Kaydediliyor...' : (product ? 'Güncelle' : 'Ekle')}
            </button>
          </div>
        </form>
        
        <CategoryManager
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          mode="manage"
        />
      </div>
    </div>
  );
};

export default ProductModal;
