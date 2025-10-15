import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, RefreshCw } from 'lucide-react';

interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface RealtimeTableProps {
  columns: Column[];
  data: any[];
  searchable?: boolean;
  searchPlaceholder?: string;
  updateInterval?: number;
  onDataUpdate?: () => any[];
  title?: string;
}

export default function RealtimeTable({ 
  columns, 
  data: initialData, 
  searchable = true, 
  searchPlaceholder = "Search...",
  updateInterval = 5000,
  onDataUpdate,
  title
}: RealtimeTableProps) {
  const [data, setData] = useState(initialData);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const itemsPerPage = 10;

  // Real-time data updates
  useEffect(() => {
    if (!onDataUpdate) return;

    const updateData = async () => {
      setIsUpdating(true);
      try {
        const newData = await onDataUpdate();
        setData(newData);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error updating data:', error);
      } finally {
        setIsUpdating(false);
      }
    };

    const interval = setInterval(updateData, updateInterval);
    return () => clearInterval(interval);
  }, [onDataUpdate, updateInterval]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const filteredData = data.filter((item) =>
    searchTerm === '' || 
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      )}
      
      {searchable && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`w-3 h-3 ${
                            sortColumn === column.key && sortDirection === 'asc' 
                              ? 'text-blue-600' 
                              : 'text-gray-300'
                          }`} 
                        />
                        <ChevronDown 
                          className={`w-3 h-3 -mt-1 ${
                            sortColumn === column.key && sortDirection === 'desc' 
                              ? 'text-blue-600' 
                              : 'text-gray-300'
                          }`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded-lg text-sm ${
                  currentPage === page
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}