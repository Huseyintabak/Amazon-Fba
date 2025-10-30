import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Edit,
  Package,
  Truck,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../stores/useStore';
import { Shipment, ShipmentItem } from '../types';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail: React.FC<ShipmentDetailProps> = ({ shipmentId }) => {
  const { shipments, loadShipments } = useStore();
  const [shipment, setShipment] = useState<Shipment | undefined>();
  const [shipmentItems, setShipmentItems] = useState<ShipmentItem[]>([]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  useEffect(() => {
    const foundShipment = shipments.find(s => s.id === shipmentId);
    setShipment(foundShipment);
    // TODO: Load shipment items from Supabase
    setShipmentItems([]);
  }, [shipments, shipmentId]);

  if (!shipment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Sevkiyat bulunamadı
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Aradığınız sevkiyat mevcut değil.
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
        return <Truck className="h-5 w-5 text-brown-600" />;
      case 'fedex':
        return <Truck className="h-5 w-5 text-purple-600" />;
      case 'dhl':
        return <Truck className="h-5 w-5 text-red-600" />;
      default:
        return <Truck className="h-5 w-5 text-gray-600" />;
    }
  };

  const totalQuantity = shipmentItems.reduce((sum, item) => sum + item.quantity, 0);
  const scannedItems = shipmentItems.filter(item => item.barcode_scanned).length;
  const unscannedItems = totalQuantity - scannedItems;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {shipment.fba_shipment_id}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sevkiyat detayları ve ürün listesi
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => window.location.href = `/shipments/${shipment.id}/edit`}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Düzenle</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Shipment Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Sevkiyat Bilgileri</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Durum</span>
                {getStatusBadge(shipment.status)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Tarih</span>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {new Date(shipment.shipment_date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Kargo Firması</span>
                <div className="flex items-center space-x-2">
                  {getCarrierIcon(shipment.carrier_company)}
                  <span className="text-sm font-medium">{shipment.carrier_company}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Toplam Maliyet</span>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">
                    ${shipment.total_shipping_cost.toFixed(2)}
                  </span>
                </div>
              </div>
              
              {shipment.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Notlar</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700">{shipment.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barcode Scanner Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Barkod Durumu</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Toplam Ürün</span>
                <span className="text-sm font-semibold">{totalQuantity}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Okunan</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">{scannedItems}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Okunmayan</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-600">{unscannedItems}</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalQuantity > 0 ? (scannedItems / totalQuantity) * 100 : 0}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                %{totalQuantity > 0 ? Math.round((scannedItems / totalQuantity) * 100) : 0} tamamlandı
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Products */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                Sevkiyat Ürünleri ({shipmentItems.length})
              </h3>
              <p className="card-subtitle">
                Toplam {totalQuantity} adet ürün
              </p>
            </div>

            <div className="space-y-3">
              {shipmentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.product?.name}</div>
                      <div className="text-xs text-gray-500">
                        ASIN: {item.product?.asin} | SKU: {item.product?.merchant_sku}
                      </div>
                      {item.product?.amazon_barcode && (
                        <div className="text-xs text-gray-500 mt-1">
                          Barkod: {item.product.amazon_barcode}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
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
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {shipmentItems.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Ürün bulunamadı
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Bu sevkiyatta henüz ürün bulunmamaktadır.
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

export default ShipmentDetail;
