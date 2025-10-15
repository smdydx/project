/**
 * API Service for Backend Connection
 * Connects React frontend to Express backend
 */

export const apiService = {
  getDashboardStats: async () => {
    const response = await fetch('/api/dashboard/stats');
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },

  getLiveTransactions: async () => {
    const response = await fetch('/api/transactions?limit=50');
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  getRecentUsers: async () => {
    const response = await fetch('/api/users/recent?limit=20');
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getChartData: async () => {
    const response = await fetch('/api/dashboard/charts');
    if (!response.ok) throw new Error('Failed to fetch chart data');
    return response.json();
  },
};