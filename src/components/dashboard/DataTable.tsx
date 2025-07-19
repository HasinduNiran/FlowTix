'use client';

import { useState } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (value: any, row?: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  title,
  emptyMessage = 'No data available',
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });

  // Default key extractor uses index if not provided
  const getKey = (item: T, index: number) => {
    if (keyExtractor) {
      return keyExtractor(item);
    }
    
    // Try to use _id or id if available
    if ('_id' in item) {
      return (item as any)._id;
    }
    
    if ('id' in item) {
      return (item as any).id;
    }
    
    // Fallback to index
    return index.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {title && (
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    typeof column.accessor === 'string' ? 'cursor-pointer' : ''
                  } ${column.className || ''}`}
                  onClick={() => {
                    if (typeof column.accessor === 'string') {
                      handleSort(column.accessor as keyof T);
                    }
                  }}
                >
                  <div className="flex items-center">
                    {column.header}
                    {typeof column.accessor === 'string' && sortColumn === column.accessor && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => (
                <tr
                  key={getKey(item, index)}
                  className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column, columnIndex) => {
                    const accessor = column.accessor as string;
                    const value = item[accessor as keyof T];
                    
                    return (
                      <td
                        key={columnIndex}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${column.className || ''}`}
                      >
                        {column.cell ? column.cell(value, item) : value as React.ReactNode}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// For backward compatibility
export default DataTable; 