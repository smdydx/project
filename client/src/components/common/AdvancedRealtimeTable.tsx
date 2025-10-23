
import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, X, Download, FileText, FileSpreadsheet, FileDown } from 'lucide-react';

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
  title?: string;
  onDataUpdate?: () => Promise<any[]>;
  updateInterval?: number;
  showStats?: boolean;
  enableAnimations?: boolean;
  dataTestId?: string;
}

export default function AdvancedRealtimeTable({
  columns,
  data: initialData,
  searchable = true,
  searchPlaceholder = "Search...",
  title,
  onDataUpdate,
  updateInterval = 5000,
  showStats = false,
  enableAnimations = false,
  dataTestId = "advanced-table",
}: AdvancedRealtimeTableProps) {
  const [data, setData] = useState(initialData);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Real-time data updates
  useEffect(() => {
    if (!onDataUpdate) return;

    const updateData = async () => {
      try {
        const newData = await onDataUpdate();
        if (Array.isArray(newData)) {
          setData(newData);
        }
      } catch (error) {
        console.error('Error updating table data:', error);
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

  // DataTables.net style advanced search - searches across ALL fields
  const advancedSearch = (item: any, search: string): boolean => {
    if (!search || search.trim() === '') return true;
    
    const searchLower = search.toLowerCase().trim();
    
    // Search in ALL object values (including nested objects)
    const searchInValue = (value: any): boolean => {
      if (value === null || value === undefined) return false;
      
      // Handle objects recursively
      if (typeof value === 'object') {
        return Object.values(value).some(v => searchInValue(v));
      }
      
      // Convert to string and search
      const stringValue = String(value).toLowerCase();
      return stringValue.includes(searchLower);
    };
    
    // Search through all keys in the item
    return Object.keys(item).some(key => {
      const value = item[key];
      return searchInValue(value);
    });
  };

  // Apply advanced filtering
  const filteredData = data.filter((item) => advancedSearch(item, searchTerm));

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

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = columns.map(col => col.title).join(',');
    const rows = filteredData.map(row => 
      columns.map(col => {
        const value = col.render ? col.render(row[col.key], row) : row[col.key];
        // Handle values with commas, quotes
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title || 'table'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportMenu(false);
  };

  // Export to Excel (XLSX format using HTML table method)
  const exportToExcel = () => {
    const table = document.createElement('table');
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.title;
      th.style.fontWeight = 'bold';
      th.style.backgroundColor = '#4472C4';
      th.style.color = 'white';
      th.style.padding = '8px';
      th.style.border = '1px solid #ccc';
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    filteredData.forEach(row => {
      const tr = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');
        const value = col.render ? col.render(row[col.key], row) : row[col.key];
        td.textContent = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
        td.style.padding = '6px';
        td.style.border = '1px solid #ccc';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    // Convert to Excel
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #4472C4; color: white; font-weight: bold; }
          </style>
        </head>
        <body>${table.outerHTML}</body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title || 'table'}_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    setShowExportMenu(false);
  };

  // Export to PDF (using HTML to PDF conversion)
  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title || 'Table Export'}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
            }
            h1 { 
              color: #333; 
              margin-bottom: 20px;
              font-size: 24px;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-top: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
              font-size: 12px;
            }
            th { 
              background-color: #4472C4; 
              color: white; 
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .footer {
              margin-top: 20px;
              font-size: 10px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <h1>${title || 'Table Export'}</h1>
          <p style="color: #666; margin-bottom: 10px;">
            Generated: ${new Date().toLocaleString()} | 
            Total Records: ${filteredData.length}
          </p>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.title}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(row => `
                <tr>
                  ${columns.map(col => {
                    const value = col.render ? col.render(row[col.key], row) : row[col.key];
                    const textValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
                    return `<td>${textValue}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>© ${new Date().getFullYear()} - LCR Pay Admin Dashboard</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Trigger print dialog after content loads
    printWindow.onload = () => {
      printWindow.print();
      setShowExportMenu(false);
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover-lift" data-testid={dataTestId}>
      {title && (
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <div className="flex items-center space-x-4">
              {showStats && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing: <span className="font-bold text-blue-600 dark:text-blue-400">{filteredData.length}</span> / {data.length}
                </span>
              )}
              
              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">Export</span>
                </button>
                
                {showExportMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowExportMenu(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 z-20 overflow-hidden">
                      <div className="py-2">
                        <button
                          onClick={exportToCSV}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                        >
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <div className="text-left">
                            <div className="font-medium">CSV File</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Comma-separated values</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={exportToExcel}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                        >
                          <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <div className="text-left">
                            <div className="font-medium">Excel File</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Microsoft Excel format</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={exportToPDF}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                        >
                          <FileDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <div className="text-left">
                            <div className="font-medium">PDF Document</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Portable document format</div>
                          </div>
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          📊 {filteredData.length} records will be exported
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Search Box */}
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
                className="pl-10 pr-10 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              <span>
                {filteredData.length === data.length 
                  ? `All ${data.length} records` 
                  : `${filteredData.length} of ${data.length} records`}
              </span>
            </div>
          </div>
          {searchTerm && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              🔍 Searching across all fields for: "<span className="font-bold text-blue-600 dark:text-blue-400">{searchTerm}</span>"
            </div>
          )}
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
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr key={row.id || index} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${enableAnimations ? 'animate-fade-in' : ''}`}>
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
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Search className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      {searchTerm ? `No results found for "${searchTerm}"` : 'No data available'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
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
