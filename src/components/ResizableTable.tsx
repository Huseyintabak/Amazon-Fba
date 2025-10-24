import React, { useState, useEffect } from 'react';

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
    name: 200,        // Ürün Adı - daha geniş
    asin: 100,
    merchant_sku: 120,
    supplier: 120,
    cost: 80,         // Maliyet - daha küçük
    profit: 100,
    roi: 80,
    created: 120,
    actions: 120
  });

  const [isResizing, setIsResizing] = useState<string | null>(null);

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

  const getColumnStyle = (columnKey: string) => ({
    width: `${columnWidths[columnKey]}px`,
    minWidth: `${columnWidths[columnKey]}px`,
    maxWidth: `${columnWidths[columnKey]}px`,
  });

  return (
    <div className={`relative ${className}`}>
      <style jsx>{`
        .resizable-table th {
          position: relative;
        }
        .resize-handle {
          position: absolute;
          right: -4px;
          top: 0;
          bottom: 0;
          width: 8px;
          cursor: col-resize;
          background-color: transparent;
          z-index: 10;
        }
        .resize-handle:hover {
          background-color: #dbeafe;
        }
        .resize-handle.active {
          background-color: #3b82f6;
        }
      `}</style>
      
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === 'table') {
          const columnKeys = ['checkbox', 'name', 'asin', 'merchant_sku', 'supplier', 'cost', 'profit', 'roi', 'created', 'actions'];
          
          return React.cloneElement(child, {
            className: `${child.props.className} resizable-table`,
            children: React.Children.map(child.props.children, (tableChild) => {
              if (React.isValidElement(tableChild)) {
                if (tableChild.type === 'thead') {
                  return React.cloneElement(tableChild, {
                    children: React.Children.map(tableChild.props.children, (row) => {
                      if (React.isValidElement(row)) {
                        return React.cloneElement(row, {
                          children: React.Children.map(row.props.children, (cell, index) => {
                            if (React.isValidElement(cell)) {
                              const columnKey = columnKeys[index];
                              
                              return (
                                <th
                                  key={cell.key || index}
                                  className={`${cell.props.className} relative`}
                                  style={getColumnStyle(columnKey)}
                                >
                                  {cell.props.children}
                                  {index < columnKeys.length - 1 && (
                                    <div
                                      className={`resize-handle ${isResizing === columnKey ? 'active' : ''}`}
                                      onMouseDown={(e) => handleMouseDown(columnKey, e)}
                                      title="Sürükleyerek genişlik ayarla"
                                    />
                                  )}
                                </th>
                              );
                            }
                            return cell;
                          })
                        });
                      }
                      return row;
                    })
                  });
                } else if (tableChild.type === 'tbody') {
                  return React.cloneElement(tableChild, {
                    children: React.Children.map(tableChild.props.children, (row) => {
                      if (React.isValidElement(row)) {
                        return React.cloneElement(row, {
                          children: React.Children.map(row.props.children, (cell, index) => {
                            if (React.isValidElement(cell)) {
                              const columnKey = columnKeys[index];
                              
                              return (
                                <td
                                  key={cell.key || index}
                                  className={cell.props.className}
                                  style={getColumnStyle(columnKey)}
                                >
                                  {cell.props.children}
                                </td>
                              );
                            }
                            return cell;
                          })
                        });
                      }
                      return row;
                    })
                  });
                }
              }
              return tableChild;
            })
          });
        }
        return child;
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
