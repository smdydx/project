import type { Request, Response } from "express";
import type { IStorage } from "./storage";
import type { z } from "zod";

export interface ModelConfig<T = any> {
  name: string;
  tableName: string;
  schema: z.ZodType<any>;
  fields: FieldMetadata[];
  getter: (storage: IStorage) => Promise<T[]>;
  getById?: (storage: IStorage, id: number | string) => Promise<T | null>;
  create?: (storage: IStorage, data: any) => Promise<T>;
  update?: (storage: IStorage, id: number | string, data: any) => Promise<T>;
  delete?: (storage: IStorage, id: number | string) => Promise<boolean>;
}

export interface FieldMetadata {
  name: string;
  type: "integer" | "string" | "boolean" | "decimal" | "timestamp" | "text" | "enum";
  required?: boolean;
  readonly?: boolean;
  unique?: boolean;
  choices?: string[];
  references?: string;
  default?: any;
}

export interface FilterOptions {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "like" | "in";
  value: any;
}

export interface QueryParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  filters?: FilterOptions[];
  search?: string;
  format?: "json" | "csv";
}

export class CRUDGenerator {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  parseQueryParams(req: Request): QueryParams {
    const {
      page = 1,
      page_size = 20,
      ordering,
      search,
      format = "json",
      ...filters
    } = req.query;

    const filterOptions: FilterOptions[] = [];
    
    for (const [key, value] of Object.entries(filters)) {
      if (typeof value === "string") {
        if (key.endsWith("__gt")) {
          filterOptions.push({
            field: key.replace("__gt", ""),
            operator: "gt",
            value,
          });
        } else if (key.endsWith("__gte")) {
          filterOptions.push({
            field: key.replace("__gte", ""),
            operator: "gte",
            value,
          });
        } else if (key.endsWith("__lt")) {
          filterOptions.push({
            field: key.replace("__lt", ""),
            operator: "lt",
            value,
          });
        } else if (key.endsWith("__lte")) {
          filterOptions.push({
            field: key.replace("__lte", ""),
            operator: "lte",
            value,
          });
        } else if (key.endsWith("__like")) {
          filterOptions.push({
            field: key.replace("__like", ""),
            operator: "like",
            value,
          });
        } else if (key.endsWith("__in")) {
          filterOptions.push({
            field: key.replace("__in", ""),
            operator: "in",
            value: (value as string).split(","),
          });
        } else {
          filterOptions.push({
            field: key,
            operator: "eq",
            value,
          });
        }
      }
    }

    return {
      page: parseInt(page as string, 10),
      page_size: Math.min(parseInt(page_size as string, 10), 200),
      ordering: ordering as string,
      search: search as string,
      filters: filterOptions,
      format: format as "json" | "csv",
    };
  }

  applyFilters<T extends Record<string, any>>(data: T[], filters: FilterOptions[]): T[] {
    let filtered = [...data];

    for (const filter of filters) {
      filtered = filtered.filter((item) => {
        const value = item[filter.field];
        
        switch (filter.operator) {
          case "eq":
            return value == filter.value;
          case "ne":
            return value != filter.value;
          case "gt":
            return parseFloat(value) > parseFloat(filter.value);
          case "gte":
            return parseFloat(value) >= parseFloat(filter.value);
          case "lt":
            return parseFloat(value) < parseFloat(filter.value);
          case "lte":
            return parseFloat(value) <= parseFloat(filter.value);
          case "like":
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case "in":
            return Array.isArray(filter.value) && filter.value.includes(value);
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  applySearch<T extends Record<string, any>>(data: T[], searchTerm: string, fields: string[]): T[] {
    if (!searchTerm) return data;

    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((item) =>
      fields.some((field) =>
        String(item[field]).toLowerCase().includes(lowerSearch)
      )
    );
  }

  applySorting<T extends Record<string, any>>(data: T[], ordering?: string): T[] {
    if (!ordering) return data;

    const orderFields = ordering.split(",");
    const sorted = [...data];

    sorted.sort((a, b) => {
      for (const field of orderFields) {
        const desc = field.startsWith("-");
        const fieldName = desc ? field.substring(1) : field;

        const aVal = a[fieldName];
        const bVal = b[fieldName];

        if (aVal === bVal) continue;

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal > bVal ? 1 : -1;
        return desc ? -comparison : comparison;
      }
      return 0;
    });

    return sorted;
  }

  applyPagination<T>(data: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }

  toCSV<T extends Record<string, any>>(data: T[], fields: FieldMetadata[]): string {
    if (data.length === 0) return "";

    const headers = fields.map((f) => f.name).join(",");
    const rows = data.map((item) =>
      fields.map((f) => {
        const value = item[f.name];
        if (value === null || value === undefined) return "";
        if (typeof value === "string" && value.includes(",")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(",")
    );

    return [headers, ...rows].join("\n");
  }

  createListHandler<T extends Record<string, any>>(config: ModelConfig<T>) {
    return async (req: Request, res: Response) => {
      try {
        const params = this.parseQueryParams(req);
        let data = await config.getter(this.storage);

        if (params.filters && params.filters.length > 0) {
          data = this.applyFilters(data, params.filters);
        }

        if (params.search) {
          const searchFields = config.fields
            .filter((f) => f.type === "string" || f.type === "text")
            .map((f) => f.name);
          data = this.applySearch(data, params.search, searchFields);
        }

        if (params.ordering) {
          data = this.applySorting(data, params.ordering);
        }

        const total = data.length;
        const paginatedData = this.applyPagination(data, params.page!, params.page_size!);

        if (params.format === "csv") {
          const csv = this.toCSV(paginatedData, config.fields);
          res.setHeader("Content-Type", "text/csv");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${config.tableName}.csv"`
          );
          return res.send(csv);
        }

        res.json({
          status: "success",
          data: paginatedData,
          meta: {
            page: params.page,
            page_size: params.page_size,
            total,
          },
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          error: {
            code: "SERVER_ERROR",
            message: (error as Error).message,
          },
        });
      }
    };
  }

  createMetadataHandler(config: ModelConfig) {
    return (_req: Request, res: Response) => {
      res.json({
        status: "success",
        data: {
          name: config.name,
          tableName: config.tableName,
          fields: config.fields,
        },
      });
    };
  }

  createGetByIdHandler<T>(config: ModelConfig<T>) {
    return async (req: Request, res: Response) => {
      try {
        if (!config.getById) {
          return res.status(501).json({
            status: "error",
            error: {
              code: "NOT_IMPLEMENTED",
              message: "Get by ID not implemented for this model",
            },
          });
        }

        const id = isNaN(Number(req.params.id)) ? req.params.id : parseInt(req.params.id, 10);
        const item = await config.getById(this.storage, id);

        if (!item) {
          return res.status(404).json({
            status: "error",
            error: {
              code: "NOT_FOUND",
              message: `${config.name} not found`,
            },
          });
        }

        res.json({
          status: "success",
          data: item,
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          error: {
            code: "SERVER_ERROR",
            message: (error as Error).message,
          },
        });
      }
    };
  }
}
