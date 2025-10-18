import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, RefreshCw, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

interface AdvancedRealtimeTableProps {
  columns: Column[];
  data: any[];
  searchable?: boolean;
  searchPlaceholder?: string;
  updateInterval?: number;
  onDataUpdate?: () => any[];
  title?: string;
  showStats?: boolean;
  enableAnimations?: boolean;
  wsChannel?: string; // WebSocket channel name
  useWebSocket?: boolean; // Enable WebSocket updates
}

export default function AdvancedRealtimeTable({
  columns,
  data: initialData,
  searchable = true,
  searchPlaceholder = "Search...",
  updateInterval = 30000,
  onDataUpdate,
  title,
  showStats = true,
  enableAnimations = false,
  wsChannel,
  useWebSocket: useWS = false
}: AdvancedRealtimeTableProps) {
  const [data, setData] = useState(initialData);

  // WebSocket integration
  const { data: wsData, isConnected: wsConnected } = useWebSocket(wsChannel || '');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [newRows, setNewRows] = useState<Set<string>>(new Set());
  const [updatedRows, setUpdatedRows] = useState<Set<string>>(new Set());
  const [deletedRows, setDeletedRows] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ total: 0, added: 0, updated: 0, deleted: 0 });
  const prevDataRef = useRef(data);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Adjust items per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(5); // Mobile
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(8); // Tablet
      } else {
        setItemsPerPage(10); // Desktop
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize data
  useEffect(() => {
    setData(initialData);
    prevDataRef.current = initialData;
    setStats({ total: initialData.length, added: 0, updated: 0, deleted: 0 });
  }, [initialData]);

  // Handle WebSocket updates
  useEffect(() => {
    if (useWS && wsData && wsChannel) {
      setData(prevData => {
        const newData = [wsData, ...prevData].slice(0, 100); // Keep last 100 items

        // Track changes for animations
        const newRowIds = new Set<string>();
        newRowIds.add(wsData.id);

        setNewRows(newRowIds);
        setStats(prev => ({
          ...prev,
          total: newData.length,
          added: prev.added + 1
        }));

        setTimeout(() => {
          setNewRows(new Set());
        }, 2000);

        prevDataRef.current = newData;
        return newData;
      });
      setLastUpdate(new Date());
    }
  }, [wsData, useWS, wsChannel]);

  // Real-time data updates with animations
  useEffect(() => {
    if (!onDataUpdate) return;

    const updateData = async () => {
      setIsUpdating(true);
      try {
        const newData = await onDataUpdate();
        const prevData = prevDataRef.current;

        // Track changes for animations
        const newRowIds = new Set<string>();
        const updatedRowIds = new Set<string>();
        const deletedRowIds = new Set<string>();

        // Find new and updated rows
        newData.forEach(row => {
          const existingRow = prevData.find(p => p.id === row.id);
          if (!existingRow) {
            newRowIds.add(row.id);
          } else if (JSON.stringify(existingRow) !== JSON.stringify(row)) {
            updatedRowIds.add(row.id);
          }
        });

        // Find deleted rows
        prevData.forEach(row => {
          if (!newData.find(n => n.id === row.id)) {
            deletedRowIds.add(row.id);
          }
        });

        setNewRows(newRowIds);
        setUpdatedRows(updatedRowIds);
        setDeletedRows(deletedRowIds);

        setStats({
          total: newData.length,
          added: newRowIds.size,
          updated: updatedRowIds.size,
          deleted: deletedRowIds.size
        });

        setData(newData);
        setLastUpdate(new Date());
        prevDataRef.current = newData;

        // Clear animation states after delay
        setTimeout(() => {
          setNewRows(new Set());
          setUpdatedRows(new Set());
          setDeletedRows(new Set());
        }, 2000);

      } catch (error) {
        console.error('Error updating data:', error);
      } finally {
        setIsUpdating(false);
      }
    };

    // Initial update
    updateData();

    // Set up interval
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

  const getRowClassName = (rowId: string) => {
    let className = "table-row hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300";

    if (enableAnimations) {
      if (newRows.has(rowId)) {
        className += " table-row-enter border-l-4 border-green-500";
      } else if (updatedRows.has(rowId)) {
        className += " table-row-update border-l-4 border-blue-500";
      } else if (deletedRows.has(rowId)) {
        className += " table-row-exit border-l-4 border-red-500";
      }
    }

    return className;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover-lift">
      {/* Header with Stats */}
      {title && (
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse live-indicator"></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              {showStats && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">+{stats.added}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">{stats.updated}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <TrendingDown className="w-4 h-4" />
                    <span className="font-medium">-{stats.deleted}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin text-blue-500' : ''}`} />
                <span className="hidden sm:inline">Last: {lastUpdate.toLocaleTimeString()}</span>
                <span className="sm:hidden">Updated</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {searchable && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              />
            </div>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200 hover-lift">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors' : ''
                  } ${column.width || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="truncate">{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 transition-colors ${
                            sortColumn === column.key && sortDirection === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-300'
                          }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 -mt-1 transition-colors ${
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
              <tr key={row.id || index} className={getRowClassName(row.id)}>
                {columns.map((column) => (
                  <td key={column.key} className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div className="truncate">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 lg:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
              Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, sortedData.length)}</span> of <span className="font-medium">{sortedData.length}</span> entries
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 lg:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200"
              >
                Previous
              </button>

              {/* Page Numbers - Show fewer on mobile */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 lg:px-4 py-2 border rounded-lg text-sm transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 lg:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}