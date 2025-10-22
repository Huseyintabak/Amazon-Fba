// Arama geçmişi yönetimi için utility fonksiyonları

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  type: 'product' | 'shipment' | 'general';
  filters?: Record<string, any>;
}

const SEARCH_HISTORY_KEY = 'amazon_fba_search_history';
const MAX_HISTORY_ITEMS = 10;

export const getSearchHistory = (): SearchHistoryItem[] => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading search history:', error);
    return [];
  }
};

export const addToSearchHistory = (
  query: string,
  type: SearchHistoryItem['type'],
  filters?: Record<string, any>
): void => {
  try {
    const history = getSearchHistory();
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now(),
      type,
      filters
    };

    // Aynı sorguyu tekrar eklemeyi önle
    const existingIndex = history.findIndex(
      item => item.query === newItem.query && item.type === newItem.type
    );

    if (existingIndex !== -1) {
      // Mevcut öğeyi kaldır ve başa ekle
      history.splice(existingIndex, 1);
    }

    // Yeni öğeyi başa ekle
    history.unshift(newItem);

    // Maksimum öğe sayısını kontrol et
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

export const clearSearchHistory = (): void => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};

export const removeFromSearchHistory = (id: string): void => {
  try {
    const history = getSearchHistory();
    const filteredHistory = history.filter(item => item.id !== id);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('Error removing from search history:', error);
  }
};

export const getSearchHistoryByType = (type: SearchHistoryItem['type']): SearchHistoryItem[] => {
  return getSearchHistory().filter(item => item.type === type);
};
