
/**
 * API Service for Backend Connection
 * Connects React frontend to Express backend
 */

const API_BASE_URL = '/api';

class ApiService {
  /**
   * Fetch dashboard statistics
   */
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return response.json();
  }

  /**
   * Fetch live transactions
   */
  async getLiveTransactions() {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    if (!response.ok) {
      throw new Error('Failed to fetch live transactions');
    }
    return response.json();
  }

  /**
   * Fetch recent users
   */
  async getRecentUsers() {
    const response = await fetch(`${API_BASE_URL}/users/recent`);
    if (!response.ok) {
      throw new Error('Failed to fetch recent users');
    }
    return response.json();
  }

  /**
   * Fetch chart data
   */
  async getChartData() {
    const response = await fetch(`${API_BASE_URL}/dashboard/charts`);
    if (!response.ok) {
      throw new Error('Failed to fetch chart data');
    }
    return response.json();
  }
}

export const apiService = new ApiService();
