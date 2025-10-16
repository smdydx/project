import { useQuery } from "@tanstack/react-query";
import Card from "./Card";
// Default export hai, so import statement sahi hai
import { type TableConfig, formatCellValue, getStatusColor } from "../../config/tableConfig";
import { Loader2, Search, Filter } from "lucide-react";
import { useState } from "react";

interface DynamicDataTableProps {
  config: TableConfig;
}

export function DynamicDataTable({ config }: DynamicDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterColumn, setFilterColumn] = useState(""); // This state is not used in the provided snippet, but kept for completeness if it's intended for future use or was present in the original context.
  const [filters, setFilters] = useState<Record<string, any>>({}); // Assuming filters state is intended to be used with the API call

  const { data, isLoading, error } = useQuery({
    queryKey: [config.apiEndpoint, searchTerm, filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (searchTerm) params.search = searchTerm;
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await fetch(`${config.apiEndpoint}?${new URLSearchParams(params)}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-dynamic-table" />
          <span className="ml-2 text-muted-foreground">Loading {config.title}...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-red-500" data-testid="error-dynamic-table">
          Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </Card>
    );
  }

  const filteredData = data?.filter((row) => {
    if (!searchTerm) return true;

    return config.columns.some(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  }) || [];

  const filterableColumns = config.columns.filter(col => col.filterable);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search in ${config.title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="input-search-dynamic-table"
            />
          </div>

          {filterableColumns.length > 0 && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={filterColumn}
                onChange={(e) => {
                  setFilterColumn(e.target.value);
                  // Assuming filterColumn state should update filters state
                  setFilters(prev => ({ ...prev, [e.target.value]: '' })); // Resetting other filters might be needed depending on desired behavior
                }}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="select-filter-column"
              >
                <option value="">All Columns</option>
                {filterableColumns.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
              {/* Add input/select for the actual filter value based on filterColumn */}
              {filterColumn && (
                <input
                  type="text" // Or a more specific input type based on column type
                  placeholder={`Filter by ${filterableColumns.find(c => c.key === filterColumn)?.label}...`}
                  value={filters[filterColumn] || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, [filterColumn]: e.target.value }))}
                  className="ml-2 pl-4 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {config.columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    data-testid={`th-${column.key}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.columns.length}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    data-testid="text-no-data"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIndex) => (
                  <tr
                    key={row[config.primaryKey] || rowIndex}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    data-testid={`row-data-${row[config.primaryKey] || rowIndex}`}
                  >
                    {config.columns.map((column) => {
                      const value = row[column.key];
                      const formattedValue = formatCellValue(value, column.type);

                      return (
                        <td
                          key={column.key}
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          data-testid={`cell-${column.key}-${row[config.primaryKey] || rowIndex}`}
                        >
                          {column.type === 'status' ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                              {formattedValue}
                            </span>
                          ) : column.type === 'boolean' ? (
                            <span className={value ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                              {formattedValue}
                            </span>
                          ) : column.type === 'currency' ? (
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {formattedValue}
                            </span>
                          ) : (
                            <span className="text-gray-700 dark:text-gray-300">
                              {formattedValue}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-total-records">
              Total Records: <span className="font-semibold">{filteredData.length}</span>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}