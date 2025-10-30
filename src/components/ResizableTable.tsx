import React, { useState, useEffect, useRef } from 'react';

interface ResizableTableProps {
  children: React.ReactNode;
  className?: string;
}

interface ColumnWidths {
  [key: string]: number;
}

const ResizableTable: React.FC<ResizableTableProps> = ({ children, className = '' }) => {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    checkbox: 48,
    image: 80,        // Resim
    name: 200,        // Ürün Adı - daha geniş
    category: 120,    // Kategori
    asin: 100,
    merchant_sku: 120,
    supplier: 120,
    cost: 80,         // Maliyet - daha küçük
    profit: 100,
    actions: 120
  });

  const [isResizing, setIsResizing] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleMouseDown = (columnKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(columnKey);
    
    const startX = e.clientX;
    const startWidth = columnWidths[columnKey];

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff); // Minimum 50px
      
      setColumnWidths(prev => ({
        ...prev,
        [columnKey]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Load saved widths from localStorage
  useEffect(() => {
    const savedWidths = localStorage.getItem('products-table-widths');
    if (savedWidths) {
      try {
        const parsed = JSON.parse(savedWidths);
        setColumnWidths(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved column widths:', error);
      }
    }
  }, []);

  // Save widths to localStorage
  useEffect(() => {
    localStorage.setItem('products-table-widths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // Add resize handles to table headers
  useEffect(() => {
    if (tableRef.current) {
      const headers = tableRef.current.querySelectorAll('thead th');
      const columnKeys = ['checkbox', 'image', 'name', 'category', 'asin', 'merchant_sku', 'supplier', 'cost', 'profit', 'actions'];
      
      headers.forEach((header, index) => {
        if (index < columnKeys.length - 1) { // Don't add to last column (actions)
          const columnKey = columnKeys[index];
          
          // Remove existing resize handle
          const existingHandle = header.querySelector('.resize-handle');
          if (existingHandle) {
            existingHandle.remove();
          }
          
          // Add new resize handle
          const resizeHandle = document.createElement('div');
          resizeHandle.className = `resize-handle ${isResizing === columnKey ? 'active' : ''}`;
          resizeHandle.style.cssText = `
            position: absolute;
            right: -6px;
            top: 0;
            bottom: 0;
            width: 12px;
            cursor: col-resize;
            background-color: #000000;
            opacity: 0.6;
            z-index: 10;
            border-radius: 2px;
            transition: all 0.2s ease;
          `;
          resizeHandle.title = 'Sürükleyerek genişlik ayarla';
          resizeHandle.addEventListener('mousedown', (e) => handleMouseDown(columnKey, e as any));
          
          // Make header relative positioned
          (header as HTMLElement).style.position = 'relative';
          (header as HTMLElement).style.width = `${columnWidths[columnKey]}px`;
          (header as HTMLElement).style.minWidth = `${columnWidths[columnKey]}px`;
          (header as HTMLElement).style.maxWidth = `${columnWidths[columnKey]}px`;
          
          header.appendChild(resizeHandle);
        }
      });
    }
  }, [columnWidths, isResizing]);

  // Apply column widths to table cells
  useEffect(() => {
    if (tableRef.current) {
      const columnKeys = ['checkbox', 'image', 'name', 'category', 'asin', 'merchant_sku', 'supplier', 'cost', 'profit', 'actions'];
      
      // Apply to header cells
      const headerCells = tableRef.current.querySelectorAll('thead th');
      headerCells.forEach((cell, index) => {
        if (index < columnKeys.length) {
          const columnKey = columnKeys[index];
          (cell as HTMLElement).style.width = `${columnWidths[columnKey]}px`;
          (cell as HTMLElement).style.minWidth = `${columnWidths[columnKey]}px`;
          (cell as HTMLElement).style.maxWidth = `${columnWidths[columnKey]}px`;
        }
      });
      
      // Apply to body cells
      const bodyCells = tableRef.current.querySelectorAll('tbody td');
      bodyCells.forEach((cell, index) => {
        const colIndex = index % columnKeys.length;
        if (colIndex < columnKeys.length) {
          const columnKey = columnKeys[colIndex];
          (cell as HTMLElement).style.width = `${columnWidths[columnKey]}px`;
          (cell as HTMLElement).style.minWidth = `${columnWidths[columnKey]}px`;
          (cell as HTMLElement).style.maxWidth = `${columnWidths[columnKey]}px`;
        }
      });
    }
  }, [columnWidths]);

  return (
    <div className={`relative ${className}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .resize-handle:hover {
            background-color: #000000 !important;
            opacity: 0.8 !important;
            width: 14px !important;
            right: -7px !important;
          }
          .resize-handle.active {
            background-color: #000000 !important;
            opacity: 1 !important;
            width: 16px !important;
            right: -8px !important;
          }
        `
      }} />
      
      {React.cloneElement(children as React.ReactElement, {
        ref: tableRef,
        className: `${(children as React.ReactElement).props.className} resizable-table`
      })}
      
      {/* Resize indicator */}
      {isResizing && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50">
          <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500 opacity-50" />
        </div>
      )}
    </div>
  );
};

export default ResizableTable;