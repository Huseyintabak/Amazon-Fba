import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Product } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';
import { AdvancedFilters } from '../../../components/AdvancedFiltersPanel';

interface UseProductsProps {
  filters: AdvancedFilters;
  sortField: keyof Product;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  onSuccess?: (products: Product[], total: number) => void;
}

export const useProducts = ({
  filters,
  sortField,
  sortDirection,
  currentPage,
  itemsPerPage,
  onSuccess
}: UseProductsProps) => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('products')
        .select(`
          *,
          suppliers!left(name, country),
          categories!left(name, color, icon)
        `, { count: 'exact' });

      if (!profile?.is_admin) {
        query = query.eq('user_id', user.id);
      }

      if (filters.search) {
        const searchTerm = filters.search.trim();
        if (searchTerm.length >= 2) {
          const searchLower = searchTerm.toLowerCase();
          query = query.or(`name.ilike.%${searchLower}%,asin.ilike.%${searchLower}%,merchant_sku.ilike.%${searchLower}%,suppliers.name.ilike.%${searchLower}%`);
        }
      }

      if (filters.supplier) {
        query = query.eq('supplier_id', filters.supplier);
      }

      if (filters.costRange?.min !== undefined) {
        query = query.gte('product_cost', filters.costRange.min);
      }

      if (filters.costRange?.max !== undefined) {
        query = query.lte('product_cost', filters.costRange.max);
      }

      if (filters.dateRange?.startDate) {
        query = query.gte('created_at', filters.dateRange.startDate);
      }

      if (filters.dateRange?.endDate) {
        query = query.lte('created_at', filters.dateRange.endDate);
      }

      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const transformedData = data?.map(product => ({
        ...product,
        supplier_name: product.suppliers?.name || '',
        supplier_country: product.suppliers?.country || ''
      })) || [];

      setProducts(transformedData);
      setTotalItems(count || 0);
      onSuccess?.(transformedData, count || 0);
    } catch (error: unknown) {
      console.error('Error loading products:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setProductsError(errorMessage);
      showToast(`Ürünler yüklenemedi: ${errorMessage}`, 'error');
    } finally {
      setProductsLoading(false);
    }
  }, [currentPage, itemsPerPage, filters, sortField, sortDirection, showToast, onSuccess]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const refreshProducts = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    productsLoading,
    productsError,
    totalItems,
    refreshProducts
  };
};

