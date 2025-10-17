import { useState, useEffect } from 'react';
import { Search, Smartphone, Filter, ChevronDown, Eye } from 'lucide-react';
import { useLocation } from 'wouter';
import Card from '@/components/common/Card';

interface UserTransaction {
  id: number;
  userId: number;
  user: string;
  mobile: string;
  memberId: string;
  transactionCount: number;
  totalAmount: number;
  lastTransaction: string;
  primeStatus: boolean;
  kycStatus: string;
}

const fetchUserTransactions = async (): Promise<UserTransaction[]> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_URL}/api/v1/transactions/mobile?limit=100`);
    if (!response.ok) throw new Error('Failed to fetch transactions');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching mobile transactions:', error);
    return [];
  }
};

export default function MobileTransactions() {
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchUserTransactions();
      if (data.length === 0) {
        setError('No users found with transactions.');
      } else {
        setUsers(data);
      }
      setLoading(false);
    };
    loadTransactions();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile.includes(searchTerm) ||
      user.memberId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'prime' && user.primeStatus) ||
      (filterStatus === 'normal' && !user.primeStatus) ||
      (filterStatus === 'verified' && user.kycStatus === 'Verified') ||
      (filterStatus === 'pending' && user.kycStatus === 'Pending');

    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (userId: number) => {
    setLocation(`/transactions/user/${userId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Mobile Transactions - Users
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View all users with transaction history</p>
        </div>
      </div>

      <Card>
        {loading && (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        )}
        {error && !loading && (
          <div className="flex flex-col justify-center items-center py-12 space-y-4">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button 
              onClick={async () => {
                setLoading(true);
                setError(null);
                const data = await fetchUserTransactions();
                if (data.length === 0) {
                  setError('Failed to load users. Please try again.');
                } else {
                  setUsers(data);
                }
                setLoading(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, mobile, or member ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="all">All Users</option>
                  <option value="prime">Prime Members</option>
                  <option value="normal">Normal Users</option>
                  <option value="verified">KYC Verified</option>
                  <option value="pending">KYC Pending</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Mobile</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Member ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Transactions</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Last Transaction</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{user.user}</span>
                          {user.primeStatus && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs rounded-full">
                              Prime
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.mobile}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">{user.memberId}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">{user.transactionCount}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">₹{user.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.lastTransaction}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.kycStatus === 'Verified' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewDetails(user.userId)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}