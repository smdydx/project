/**
 * Production API Service
 * Connects React frontend to backend APIs
 * NO SQLite - Only PostgreSQL from .env
 */

// API requests go to Express backend on port 5000
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Database error detection
export function isDatabaseError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || '';
  return (
    errorMessage.includes('database') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('postgresql') ||
    error?.status === 503 ||
    error?.status === 500
  );
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL || 'http://0.0.0.0:8000';
    console.log('🔗 ApiService initialized with baseUrl:', this.baseUrl);
  }

  private async fetchFreshData(url: string): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Adding Authorization header to request');
      } else {
        console.warn('⚠️ No token found in localStorage');
      }
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers
      });
      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token expired or invalid');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        window.location.href = '/login';
        throw new Error('Authentication failed - Please login again');
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      console.log(`✅ Fresh data fetched from: ${url}`, data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`❌ Error fetching from: ${url}`, error);
      throw error;
    }
  }

  // Dashboard Stats - NO CACHE, always fresh
  async getDashboardStats() {
    return this.fetchFreshData(`${this.baseUrl}/api/v1/dashboard/stats`);
  }

  async getChartData() {
    return this.fetchFreshData(`${this.baseUrl}/api/v1/dashboard/charts`);
  }

  // Transactions - NO CACHE
  async getLiveTransactions(limit: number = 50) {
    return this.fetchFreshData(`${this.baseUrl}/api/v1/dashboard/transactions?limit=${limit}`);
  }

  async getAllTransactions(page: number = 1, limit: number = 100) {
    const response = await fetch(`${this.baseUrl}/api/v1/dashboard/transactions?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  }

  // Users - NO CACHE
  async getRecentUsers(limit: number = 20) {
    return this.fetchFreshData(`${this.baseUrl}/api/v1/dashboard/users/recent?limit=${limit}`);
  }

  async getAllUsers(page: number = 1, limit: number = 100) {
    return this.fetchFreshData(`${this.baseUrl}/api/v1/dashboard/users?page=${page}&limit=${limit}`);
  }

  // Specific Data Tables - NO CACHE
  async getTableData(endpoint: string, params?: Record<string, any>) {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    const url = `${this.baseUrl}${endpoint}${queryString}`;
    return this.fetchFreshData(url);
  }
}

export const apiService = new ApiService();