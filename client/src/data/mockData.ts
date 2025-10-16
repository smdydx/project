import { User, Biller, Transaction, Complaint, DashboardStats, LiveTransaction, RecentUser } from '../types';

// Empty arrays - all data will come from backend API
export const mockStats: DashboardStats = {
  totalTransactionsToday: 0,
  totalAmountProcessed: 0,
  activeBillers: 0,
  pendingComplaints: 0,
  totalRegisteredUsers: 0,
  newUsersToday: 0
};

export const mockUsers: User[] = [];
export const mockBillers: Biller[] = [];
export const mockTransactions: Transaction[] = [];
export const mockComplaints: Complaint[] = [];
export const liveTransactionPool: LiveTransaction[] = [];
export const recentUsers: RecentUser[] = [];

export const chartData = {
  dailyVolume: [],
  serviceDistribution: [],
  hourlyActivity: []
};