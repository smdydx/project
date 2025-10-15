export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: 'Active' | 'Blocked';
  role: 'Retailer' | 'Distributor' | 'Admin';
  joinedOn: string;
}

export interface Biller {
  id: string;
  name: string;
  category: 'Electricity' | 'Gas' | 'Telecom' | 'DTH' | 'Water' | 'Broadband' | 'Others';
  status: 'Active' | 'Pending' | 'Blocked';
  createdDate: string;
}

export interface Transaction {
  id: string;
  user: string;
  service: string;
  amount: number;
  status: 'Successful' | 'Failed' | 'Pending' | 'Reversed';
  date: string;
  referenceId: string;
}

export interface LiveTransaction {
  id: string;
  user: string;
  service: string;
  amount: number;
  status: 'Success' | 'Processing' | 'Failed';
  timestamp: string;
}

export interface Complaint {
  id: string;
  user: string;
  txnId: string;
  issueType: 'Payment Failed' | 'Wrong Amount' | 'Refund Request' | 'Account Issue' | 'Others';
  status: 'Open' | 'Resolved' | 'Escalated';
  submittedOn: string;
  description: string;
}

export interface DashboardStats {
  totalTransactionsToday: number;
  totalAmountProcessed: number;
  activeBillers: number;
  pendingComplaints: number;
  totalRegisteredUsers: number;
  newUsersToday: number;
}

export interface RecentUser {
  id: string;
  name: string;
  role: string;
  joinedOn: string;
  avatar?: string;
}