import React, { useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string | null) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImageUrl, 
  onImageChange, 
  className = '' 
}) => {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Lütfen geçerli bir resim dosyası seçin', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Resim dosyası 5MB\'dan küçük olmalıdır', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // In a real app, you would upload to Supabase Storage here
      // For now, we'll use the preview URL as a placeholder
      // You can implement actual upload logic later
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll use a placeholder image URL
      const uploadedUrl = `https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=${encodeURIComponent(file.name)}`;
      
      onImageChange(uploadedUrl);
      showToast('Resim yüklendi!', 'success');
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      showToast(`Resim yüklenirken hata: ${errorMessage}`, 'error');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all
          ${previewUrl 
            ? 'border-gray-300 hover:border-gray-400' 
            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Product preview"
              className="w-full h-32 object-cover rounded"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">
                  {isUploading ? 'Yükleniyor...' : 'Değiştir'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl text-gray-400 mb-2">📷</div>
            <p className="text-gray-600 font-medium">
              {isUploading ? 'Yükleniyor...' : 'Resim Yükle'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG, GIF (max 5MB)
            </p>
          </div>
        )}
      </div>
      
      {isUploading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
