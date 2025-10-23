import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { mockProducts, mockShipments, getProductsByShipment } from '../lib/mockData';
import { Product, Shipment, ShipmentItem } from '../types';

interface ProductDetailProps {
  productId: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const [product] = useState<Product | undefined>(
    mockProducts.find(p => p.id === productId)
  );

  // Get all shipments that contain this product
  const productShipments = useMemo(() => {
    const shipments: Array<{
      shipment: Shipment;
      item: ShipmentItem;
    }> = [];

    mockShipments.forEach(shipment => {
      const items = getProductsByShipment(shipment.id);
      const productItem = items.find(item => item.product_id === productId);
      
      if (productItem) {
        shipments.push({
          shipment,
          item: productItem
        });
      }
    });

    return shipments.sort((a, b) => 
      new Date(b.shipment.shipment_date).getTime() - new Date(a.shipment.shipment_date).getTime()
    );
  }, [productId]);

  // Calculate product statistics
  const productStats = useMemo(() => {
    const totalShipped = productShipments.reduce((sum, { item }) => sum + item.quantity, 0);
    const totalShippingCost = productShipments.reduce((sum, { item }) => 
      sum + (item.quantity * item.unit_shipping_cost), 0
    );
    const averageUnitCost = totalShipped > 0 ? totalShippingCost / totalShipped : 0;
    const lastShipmentDate = productShipments.length > 0 
      ? productShipments[0].shipment.shipment_date 
      : null;

    return {
      totalShipped,
      totalShippingCost,
      averageUnitCost,
      lastShipmentDate,
      shipmentCount: productShipments.length
    };
  }, [productShipments]);

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Ürün bulunamadı
        </h3>
        <p className="text-gray-500">
          Aradığınız ürün mevcut değil.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Tamamlandı</span>;
      case 'draft':
        return <span className="badge badge-warning">Taslak</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const getCarrierIcon = (carrier: string) => {
    switch (carrier.toLowerCase()) {
      case 'ups':
        return <span className="text-2xl">🚚</span>;
      case 'fedex':
        return <span className="text-2xl">🚛</span>;
      case 'dhl':
        return <span className="text-2xl">📦</span>;
      default:
        return <span className="text-2xl">🚚</span>;
    }
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
            <span className="text-xl">←</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Ürün detayları ve sevkiyat geçmişi
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Product Basic Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ürün Bilgileri</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">📦</span>
                <div>
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">Ürün Adı</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">ASIN</div>
                  <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {product.asin}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Merchant SKU</div>
                  <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {product.merchant_sku}
                  </div>
                </div>
              </div>

              {product.manufacturer_code && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Üretici Kodu</div>
                  <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {product.manufacturer_code}
                  </div>
                </div>
              )}

              {product.amazon_barcode && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Amazon Barkod</div>
                  <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {product.amazon_barcode}
                  </div>
                </div>
              )}

              {product.product_cost && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Ürün Maliyeti</div>
                  <div className="text-lg font-semibold text-green-600">
                    ${product.product_cost.toFixed(2)}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</div>
                <div className="text-sm">
                  {new Date(product.created_at).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </div>
          </div>

          {/* Product Statistics */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">İstatistikler</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Toplam Sevk Edilen</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {productStats.totalShipped} adet
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Toplam Kargo Maliyeti</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${productStats.totalShippingCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Ortalama Birim Maliyet</div>
                    <div className="text-2xl font-bold text-purple-600">
                      ${productStats.averageUnitCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Sevkiyat Sayısı</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {productStats.shipmentCount}
                    </div>
                  </div>
                </div>
              </div>

              {productStats.lastShipmentDate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Son Sevkiyat</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {new Date(productStats.lastShipmentDate).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Shipment History */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                Sevkiyat Geçmişi ({productShipments.length})
              </h3>
              <p className="card-subtitle">
                Bu ürünün dahil olduğu tüm sevkiyatlar
              </p>
            </div>

            <div className="space-y-3">
              {productShipments.map(({ shipment, item }) => (
                <div key={`${shipment.id}-${item.id}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getCarrierIcon(shipment.carrier_company)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-gray-900">
                          {shipment.fba_shipment_id}
                        </div>
                        {getStatusBadge(shipment.status)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(shipment.shipment_date).toLocaleDateString('tr-TR')} • {shipment.carrier_company}
                      </div>
                      {shipment.notes && (
                        <div className="text-xs text-gray-400 mt-1">
                          {shipment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm font-medium">{item.quantity}</div>
                      <div className="text-xs text-gray-500">Adet</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        ${item.unit_shipping_cost.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">Birim</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-semibold text-green-600">
                        ${(item.quantity * item.unit_shipping_cost).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">Toplam</div>
                    </div>
                    
                    <div className="flex items-center">
                      {item.barcode_scanned ? (
                        <span className="text-green-600 text-lg">✅</span>
                      ) : (
                        <span className="text-yellow-600 text-lg">⏳</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {productShipments.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Henüz sevkiyat yok
                  </h3>
                  <p className="text-gray-500">
                    Bu ürün henüz hiçbir sevkiyata dahil edilmemiş.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component for ProductDetail to get params
const ProductDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <ProductDetail productId={id || ''} />;
};

export default ProductDetailWrapper;
