/**
 * API Service for Backend Connection
 * Connects React frontend to Express backend
 */

const API_BASE_URL = '/api';

// Updated API service to fetch data from real database endpoints
export const apiService = {
  getDashboardStats: async () => {
    const response = await fetch('/api/v1/dashboard/stats');
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },

  getLiveTransactions: async () => {
    const response = await fetch('/api/v1/dashboard/transactions/live?limit=50');
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  getRecentUsers: async () => {
    const response = await fetch('/api/v1/dashboard/users/recent?limit=20');
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getChartData: async () => {
    const response = await fetch('/api/v1/dashboard/charts');
    if (!response.ok) throw new Error('Failed to fetch chart data');
    return response.json();
  },
};