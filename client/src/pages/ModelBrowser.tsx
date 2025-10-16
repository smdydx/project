import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" data-testid="text-model-browser-title">Model Browser</h1>
        <p className="text-muted-foreground">{models.length} models available</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {models.map((model) => (
                <Button
                  key={model.endpoint}
                  variant={selectedModel?.endpoint === model.endpoint ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedModel(model);
                    setPage(1);
                    setSearch("");
                    setFilters({});
                  }}
                  data-testid={`button-select-model-${model.tableName}`}
                >
                  {model.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{selectedModel?.name || "Select a model"}</CardTitle>
              {selectedModel && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-csv">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedModel ? (
              <>
                <div className="mb-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-8" data-testid="text-loading">Loading...</div>
                ) : records.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-no-data">
                    No records found
                  </div>
                ) : (
                  <>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {fields.slice(0, 8).map((field) => (
                              <TableHead key={field.name}>{field.name}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {records.map((record: any, idx: number) => (
                            <TableRow key={idx} data-testid={`row-record-${idx}`}>
                              {fields.slice(0, 8).map((field) => (
                                <TableCell key={field.name}>
                                  {record[field.name]?.toString().substring(0, 50) || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} records
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          data-testid="button-prev-page"
                        >
                          Previous
                        </Button>
                        <div className="flex items-center px-3" data-testid="text-page-number">
                          Page {page} of {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          data-testid="button-next-page"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a model from the left to view its data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
