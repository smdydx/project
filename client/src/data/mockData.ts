import { User, Biller, Transaction, Complaint, DashboardStats, LiveTransaction, RecentUser } from '../types';

export const mockStats: DashboardStats = {
  totalTransactionsToday: 12847,
  totalAmountProcessed: 2847593,
  activeBillers: 156,
  pendingComplaints: 23,
  totalRegisteredUsers: 8542,
  newUsersToday: 47
};

export const mockUsers: User[] = [
  {
    id: 'USR001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    mobile: '+91 9876543210',
    status: 'Active',
    role: 'Retailer',
    joinedOn: '2024-01-15'
  },
  {
    id: 'USR002',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    mobile: '+91 9876543211',
    status: 'Active',
    role: 'Distributor',
    joinedOn: '2024-01-20'
  },
  {
    id: 'USR003',
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    mobile: '+91 9876543212',
    status: 'Blocked',
    role: 'Retailer',
    joinedOn: '2024-02-01'
  },
  {
    id: 'USR004',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    mobile: '+91 9876543213',
    status: 'Active',
    role: 'Distributor',
    joinedOn: '2024-02-10'
  },
  {
    id: 'USR005',
    name: 'Arjun Singh',
    email: 'arjun.singh@example.com',
    mobile: '+91 9876543214',
    status: 'Active',
    role: 'Retailer',
    joinedOn: '2024-02-15'
  },
  {
    id: 'USR006',
    name: 'Kavya Nair',
    email: 'kavya.nair@example.com',
    mobile: '+91 9876543215',
    status: 'Active',
    role: 'Retailer',
    joinedOn: '2024-02-20'
  },
  {
    id: 'USR007',
    name: 'Rohit Gupta',
    email: 'rohit.gupta@example.com',
    mobile: '+91 9876543216',
    status: 'Active',
    role: 'Distributor',
    joinedOn: '2024-02-20'
  },
  {
    id: 'USR008',
    name: 'Anita Desai',
    email: 'anita.desai@example.com',
    mobile: '+91 9876543217',
    status: 'Active',
    role: 'Retailer',
    joinedOn: '2024-02-20'
  }
];

export const mockBillers: Biller[] = [
  {
    id: 'BIL001',
    name: 'BSES Rajdhani Power Limited',
    category: 'Electricity',
    status: 'Active',
    createdDate: '2024-01-10'
  },
  {
    id: 'BIL002',
    name: 'Indraprastha Gas Limited',
    category: 'Gas',
    status: 'Active',
    createdDate: '2024-01-12'
  },
  {
    id: 'BIL003',
    name: 'Airtel',
    category: 'Telecom',
    status: 'Active',
    createdDate: '2024-01-15'
  },
  {
    id: 'BIL004',
    name: 'Tata Sky',
    category: 'DTH',
    status: 'Pending',
    createdDate: '2024-02-01'
  },
  {
    id: 'BIL005',
    name: 'Delhi Jal Board',
    category: 'Water',
    status: 'Active',
    createdDate: '2024-01-20'
  },
  {
    id: 'BIL006',
    name: 'ACT Fibernet',
    category: 'Broadband',
    status: 'Blocked',
    createdDate: '2024-01-25'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    user: 'Rajesh Kumar',
    service: 'Electricity Bill',
    amount: 2500,
    status: 'Successful',
    date: '2024-02-20 10:30',
    referenceId: 'REF123456789'
  },
  {
    id: 'TXN002',
    user: 'Priya Sharma',
    service: 'Gas Bill',
    amount: 1200,
    status: 'Failed',
    date: '2024-02-20 11:15',
    referenceId: 'REF123456790'
  },
  {
    id: 'TXN003',
    user: 'Amit Patel',
    service: 'Mobile Recharge',
    amount: 399,
    status: 'Successful',
    date: '2024-02-20 12:00',
    referenceId: 'REF123456791'
  },
  {
    id: 'TXN004',
    user: 'Sneha Reddy',
    service: 'DTH Recharge',
    amount: 650,
    status: 'Pending',
    date: '2024-02-20 13:45',
    referenceId: 'REF123456792'
  },
  {
    id: 'TXN005',
    user: 'Arjun Singh',
    service: 'Water Bill',
    amount: 890,
    status: 'Reversed',
    date: '2024-02-20 14:20',
    referenceId: 'REF123456793'
  }
];

export const mockComplaints: Complaint[] = [
  {
    id: 'CMP001',
    user: 'Rajesh Kumar',
    txnId: 'TXN001',
    issueType: 'Payment Failed',
    status: 'Open',
    submittedOn: '2024-02-20 15:30',
    description: 'Payment was deducted but bill not updated'
  },
  {
    id: 'CMP002',
    user: 'Priya Sharma',
    txnId: 'TXN002',
    issueType: 'Refund Request',
    status: 'Resolved',
    submittedOn: '2024-02-19 09:15',
    description: 'Wrong amount charged, need refund'
  },
  {
    id: 'CMP003',
    user: 'Amit Patel',
    txnId: 'TXN003',
    issueType: 'Account Issue',
    status: 'Escalated',
    submittedOn: '2024-02-18 16:45',
    description: 'Unable to access account after transaction'
  }
];

export const liveTransactionPool: LiveTransaction[] = [
  { id: 'TXN12847', user: 'Rajesh Kumar', service: 'Electricity Bill', amount: 2500, status: 'Success', timestamp: new Date().toISOString() },
  { id: 'TXN12848', user: 'Priya Sharma', service: 'Mobile Recharge', amount: 399, status: 'Success', timestamp: new Date().toISOString() },
  { id: 'TXN12849', user: 'Amit Patel', service: 'Gas Bill', amount: 1200, status: 'Processing', timestamp: new Date().toISOString() },
  { id: 'TXN12850', user: 'Sneha Reddy', service: 'DTH Recharge', amount: 650, status: 'Success', timestamp: new Date().toISOString() },
  { id: 'TXN12851', user: 'Arjun Singh', service: 'Water Bill', amount: 890, status: 'Failed', timestamp: new Date().toISOString() },
  { id: 'TXN12852', user: 'Kavya Nair', service: 'Broadband Bill', amount: 1599, status: 'Success', timestamp: new Date().toISOString() },
  { id: 'TXN12853', user: 'Rohit Gupta', service: 'Electricity Bill', amount: 3200, status: 'Processing', timestamp: new Date().toISOString() },
  { id: 'TXN12854', user: 'Anita Desai', service: 'Mobile Recharge', amount: 199, status: 'Success', timestamp: new Date().toISOString() },
  { id: 'TXN12855', user: 'Vikram Shah', service: 'Gas Bill', amount: 1450, status: 'Success', timestamp: new Date().toISOString() },
  { id: 'TXN12856', user: 'Meera Joshi', service: 'DTH Recharge', amount: 750, status: 'Processing', timestamp: new Date().toISOString() }
];

export const recentUsers: RecentUser[] = [
  { id: 'USR006', name: 'Kavya Nair', role: 'Retailer', joinedOn: '2024-02-20 14:30' },
  { id: 'USR007', name: 'Rohit Gupta', role: 'Distributor', joinedOn: '2024-02-20 13:15' },
  { id: 'USR008', name: 'Anita Desai', role: 'Retailer', joinedOn: '2024-02-20 12:45' },
  { id: 'USR009', name: 'Vikram Shah', role: 'Retailer', joinedOn: '2024-02-20 11:20' },
  { id: 'USR010', name: 'Meera Joshi', role: 'Distributor', joinedOn: '2024-02-20 10:30' }
];

export const chartData = {
  dailyVolume: [
    { name: 'Mon', transactions: 1200, amount: 245000 },
    { name: 'Tue', transactions: 1800, amount: 389000 },
    { name: 'Wed', transactions: 1500, amount: 298000 },
    { name: 'Thu', transactions: 2200, amount: 456000 },
    { name: 'Fri', transactions: 2800, amount: 578000 },
    { name: 'Sat', transactions: 3200, amount: 689000 },
    { name: 'Sun', transactions: 2900, amount: 612000 }
  ],
  serviceDistribution: [
    { name: 'Electricity', value: 35, color: '#3B82F6' },
    { name: 'Gas', value: 20, color: '#6366F1' },
    { name: 'Telecom', value: 25, color: '#10B981' },
    { name: 'DTH', value: 12, color: '#F59E0B' },
    { name: 'Water', value: 8, color: '#EF4444' }
  ],
  hourlyActivity: [
    { hour: '00:00', transactions: 45 },
    { hour: '02:00', transactions: 23 },
    { hour: '04:00', transactions: 12 },
    { hour: '06:00', transactions: 89 },
    { hour: '08:00', transactions: 234 },
    { hour: '10:00', transactions: 456 },
    { hour: '12:00', transactions: 678 },
    { hour: '14:00', transactions: 789 },
    { hour: '16:00', transactions: 567 },
    { hour: '18:00', transactions: 345 },
    { hour: '20:00', transactions: 234 },
    { hour: '22:00', transactions: 123 }
  ]
};