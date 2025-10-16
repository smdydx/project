
/**
 * Production API Service
 * Connects React frontend to backend APIs
 */

// Python FastAPI backend on port 8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Failed:', error);
      throw error;
    }
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getChartData() {
    return this.request('/dashboard/charts');
  }

  // Transactions
  async getLiveTransactions(limit: number = 50) {
    return this.request(`/dashboard/transactions?limit=${limit}`);
  }

  async getAllTransactions(page: number = 1, limit: number = 100) {
    return this.request(`/dashboard/transactions?page=${page}&limit=${limit}`);
  }

  // Users
  async getRecentUsers(limit: number = 20) {
    return this.request(`/dashboard/users/recent?limit=${limit}`);
  }

  async getAllUsers(page: number = 1, limit: number = 100) {
    return this.request(`/dashboard/users?page=${page}&limit=${limit}`);
  }

  // Specific Data Tables
  async getTableData(endpoint: string, params?: Record<string, any>) {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    return this.request(`${endpoint}${queryString}`);
  }
}

export const apiService = new ApiService();
