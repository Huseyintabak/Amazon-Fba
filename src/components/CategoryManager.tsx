import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { categoriesApi } from '../lib/supabaseApi';
import { Category } from '../types';
import { getErrorMessage } from '../lib/errorHandler';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect?: (category: Category) => void;
  mode?: 'select' | 'manage';
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  isOpen, 
  onClose, 
  onCategorySelect,
  mode = 'manage' 
}) => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📦'
  });

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const predefinedIcons = [
    '📦', '📱', '💻', '🎧', '⌚', '📷', '🎮', '🏠',
    '👕', '👟', '👜', '💄', '🧴', '📚', '🎨', '🔧'
  ];

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error: unknown) {
      showToast(`Kategoriler yüklenirken hata: ${getErrorMessage(error)}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
        showToast('Kategori güncellendi!', 'success');
      } else {
        await categoriesApi.create(formData);
        showToast('Kategori oluşturuldu!', 'success');
      }
      
      setShowAddModal(false);
      setEditingCategory(null);
      resetForm();
      loadCategories();
    } catch (error: unknown) {
      showToast(`Hata: ${getErrorMessage(error)}`, 'error');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6',
      icon: category.icon || '📦'
    });
    setShowAddModal(true);
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`"${category.name}" kategorisini silmek istediğinizden emin misiniz?`)) {
      try {
        await categoriesApi.delete(category.id);
        showToast('Kategori silindi!', 'success');
        loadCategories();
      } catch (error: unknown) {
        showToast(`Hata: ${error instanceof Error ? error.message : String(error)}`, 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: '📦'
    });
  };

  const handleCategoryClick = (category: Category) => {
    if (mode === 'select' && onCategorySelect) {
      onCategorySelect(category);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'select' ? 'Kategori Seç' : 'Kategori Yönetimi'}
          </h2>
          <div className="flex items-center space-x-2">
            {mode === 'manage' && (
              <button
                onClick={() => {
                  setEditingCategory(null);
                  resetForm();
                  setShowAddModal(true);
                }}
                className="btn-primary"
              >
                ➕ Yeni Kategori
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              ✕ Kapat
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    mode === 'select' ? 'hover:border-blue-500' : ''
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}
                  
                  {mode === 'manage' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(category);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        ✏️ Düzenle
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(category);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {categories.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {mode === 'select' ? 'Henüz kategori bulunmuyor' : 'Henüz kategori oluşturulmamış'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                </h3>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Kategori Adı</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="label">Açıklama</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="input-field"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Renk</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-12 h-8 rounded border"
                        />
                        <div className="flex space-x-1">
                          {predefinedColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData({ ...formData, color })}
                              className={`w-6 h-6 rounded border-2 ${
                                formData.color === color ? 'border-gray-800' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="label">İkon</label>
                      <div className="grid grid-cols-8 gap-2">
                        {predefinedIcons.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon })}
                            className={`w-8 h-8 rounded border-2 text-center ${
                              formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingCategory(null);
                        resetForm();
                      }}
                      className="btn-secondary"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {editingCategory ? 'Güncelle' : 'Oluştur'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
