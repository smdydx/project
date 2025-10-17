/**
 * Production API Service
 * Connects React frontend to backend APIs
 */

// API requests are proxied through Node.js server on port 5000 to FastAPI backend on port 8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;
  private cache: Map<string, {data: any, timestamp: number}> = new Map();
  private cacheDuration = 5000; // 5 seconds cache

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async fetchWithCache(url: string): Promise<any> {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      this.cache.set(url, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.fetchWithCache(`${this.baseUrl}/api/v1/dashboard/stats`);
  }

  async getChartData() {
    return this.fetchWithCache(`${this.baseUrl}/api/v1/dashboard/charts`);
  }

  // Transactions
  async getLiveTransactions(limit: number = 50) {
    return this.fetchWithCache(`${this.baseUrl}/api/v1/dashboard/transactions?limit=${limit}`);
  }

  async getAllTransactions(page: number = 1, limit: number = 100) {
    const response = await fetch(`${this.baseUrl}/api/v1/dashboard/transactions?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  }

  // Users
  async getRecentUsers(limit: number = 20) {
    return this.fetchWithCache(`${this.baseUrl}/api/v1/dashboard/users/recent?limit=${limit}`);
  }

  async getAllUsers(page: number = 1, limit: number = 100) {
    const response = await fetch(`${this.baseUrl}/api/v1/dashboard/users?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }

  // Specific Data Tables
  async getTableData(endpoint: string, params?: Record<string, any>) {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    const url = `${this.baseUrl}${endpoint}${queryString}`;
    return this.fetchWithCache(url);
  }
}

export const apiService = new ApiService();