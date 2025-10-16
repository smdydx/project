import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Download, Search, RefreshCw } from "lucide-react";

interface Model {
  name: string;
  endpoint: string;
  tableName: string;
}

interface Field {
  name: string;
  type: string;
  required?: boolean;
  readonly?: boolean;
}

export default function ModelBrowser() {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: apiRoot } = useQuery({
    queryKey: ["/"],
    queryFn: async () => await apiClient.get("/"),
  });

  const models: Model[] = apiRoot?.models || [];

  const { data: metadata } = useQuery({
    queryKey: [selectedModel?.endpoint, "meta"],
    queryFn: async () => {
      if (!selectedModel) return null;
      return await apiClient.get(`${selectedModel.endpoint}/meta`);
    },
    enabled: !!selectedModel,
  });

  const { data: modelData, isLoading, refetch } = useQuery({
    queryKey: [selectedModel?.endpoint, page, search, filters],
    queryFn: async () => {
      if (!selectedModel) return null;
      
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: "20",
        ...(search && { search }),
        ...filters,
      });

      return await apiClient.get(`${selectedModel.endpoint}?${params}`);
    },
    enabled: !!selectedModel,
  });

  const fields: Field[] = metadata?.data?.fields || [];
  const records = modelData?.data || [];
  const total = modelData?.meta?.total || 0;
  const pageSize = modelData?.meta?.page_size || 20;
  const totalPages = Math.ceil(total / pageSize);

  const handleExport = () => {
    if (!selectedModel) return;
    
    const params = new URLSearchParams({
      format: "csv",
      ...(search && { search }),
      ...filters,
    });

    window.open(`http://localhost:8000${selectedModel.endpoint}?${params}`, "_blank");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-model-browser-title">Model Browser</h1>
        <p className="text-gray-600 dark:text-gray-400">{models.length} models available</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Models</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {models.map((model) => (
              <button
                key={model.endpoint}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedModel?.endpoint === model.endpoint 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => {
                  setSelectedModel(model);
                  setPage(1);
                  setSearch("");
                  setFilters({});
                }}
                data-testid={`button-select-model-${model.tableName}`}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-1 md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedModel?.name || "Select a model"}</h2>
              {selectedModel && (
                <div className="flex gap-2">
                  <button
                    onClick={() => refetch()}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                    data-testid="button-refresh"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                  <button
                    onClick={handleExport}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    data-testid="button-export-csv"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4">
            {selectedModel ? (
              <>
                <div className="mb-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      data-testid="input-search"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400" data-testid="text-loading">Loading...</div>
                ) : records.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400" data-testid="text-no-data">
                    No records found
                  </div>
                ) : (
                  <>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            {fields.slice(0, 8).map((field) => (
                              <th key={field.name} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                {field.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {records.map((record: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50" data-testid={`row-record-${idx}`}>
                              {fields.slice(0, 8).map((field) => (
                                <td key={field.name} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                  {record[field.name]?.toString().substring(0, 50) || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-pagination-info">
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} records
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="button-prev-page"
                        >
                          Previous
                        </button>
                        <div className="px-3 text-sm text-gray-600 dark:text-gray-400" data-testid="text-page-number">
                          Page {page} of {totalPages}
                        </div>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="button-next-page"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                Select a model from the left to view its data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
