import { useState, useEffect } from 'react';
import { Search, Smartphone, Filter, Download, ChevronDown } from 'lucide-react';
import Card from '@/components/common/Card';

interface MobileTransaction {
  id: number;
  transactionId: string;
  user: string;
  mobileNumber: string;
  operator: string;
  circle: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
  time: string;
  referenceId: string;
}

const fetchMobileTransactions = async (): Promise<MobileTransaction[]> => {
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
  const [transactions, setTransactions] = useState<MobileTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchMobileTransactions();
      if (data.length === 0 && !error) { // Check if fetchMobileTransactions returned empty and there wasn't a previous error
        setError('No transactions found. Please try again later.');
      } else if (data.length > 0) {
        setTransactions(data);
      } else if (error) {
        // If there was an error, setError is already set by fetchMobileTransactions
      }
      setLoading(false);
    };
    loadTransactions();
  }, []); // Empty dependency array means this effect runs once on mount

  const fetchUserDetails = async (userId: number) => {
    setLoadingDetails(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/v1/transactions/user/${userId}/all`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewUser = async (userId: number) => {
    setSelectedUserId(userId);
    await fetchUserDetails(userId);
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.mobileNumber.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || txn.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3" data-testid="page-title">
            <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Mobile Transactions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage all mobile recharge transactions</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          data-testid="button-export"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <Card>
        {loading && (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
          </div>
        )}
        {error && !loading && (
          <div className="flex flex-col justify-center items-center py-12 space-y-4">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button 
              onClick={async () => {
                setLoading(true);
                setError(null);
                const data = await fetchMobileTransactions();
                if (data.length === 0) {
                  setError('Failed to load transactions. Please try again.');
                } else {
                  setTransactions(data);
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
                  placeholder="Search by transaction ID, user, or mobile number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  data-testid="input-search"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer"
                  data-testid="select-filter"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Mobile Number</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Operator</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Reference ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => (
                    <tr 
                      key={txn.id} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      data-testid={`row-transaction-${txn.id}`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-user-${txn.id}`}>{txn.user}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-mobile-${txn.id}`}>{txn.mobileNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-operator-${txn.id}`}>{txn.operator}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white" data-testid={`text-amount-${txn.id}`}>₹{txn.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(txn.status)}`} data-testid={`status-${txn.id}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-datetime-${txn.id}`}>
                        <div>{txn.date}</div>
                        <div className="text-xs text-gray-400">{txn.time}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono" data-testid={`text-ref-${txn.id}`}>{txn.referenceId}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewUser(txn.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400" data-testid="text-no-results">No transactions found</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* User Detail Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userDetails?.user?.name || 'User Details'}
                </h2>
                <button
                  onClick={() => {
                    setSelectedUserId(null);
                    setUserDetails(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {loadingDetails ? (
                <div className="flex justify-center py-12">
                  <p className="text-gray-500">Loading details...</p>
                </div>
              ) : userDetails ? (
                <div className="space-y-6">
                  {/* Service Requests */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Mobile Transactions</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left">Reference ID</th>
                            <th className="px-4 py-2 text-left">Service</th>
                            <th className="px-4 py-2 text-left">Mobile</th>
                            <th className="px-4 py-2 text-left">Operator</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDetails.service_requests?.map((sr: any) => (
                            <tr key={sr.id} className="border-b dark:border-gray-700">
                              <td className="px-4 py-2 font-mono text-xs">{sr.reference_id}</td>
                              <td className="px-4 py-2">{sr.service_type}</td>
                              <td className="px-4 py-2">{sr.mobile}</td>
                              <td className="px-4 py-2">{sr.operator}</td>
                              <td className="px-4 py-2 font-semibold">₹{sr.amount}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  sr.status === 'Paid' || sr.status === 'Completed' 
                                    ? 'bg-green-100 text-green-700' 
                                    : sr.status === 'Failed' 
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {sr.status}
                                </span>
                              </td>
                              <td className="px-4 py-2">{sr.date} {sr.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* LCR Bones */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">LCR Bones (Debited/Credited)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left">Reference ID</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">From</th>
                            <th className="px-4 py-2 text-left">Purpose</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDetails.lcr_bones?.length > 0 ? userDetails.lcr_bones.map((lb: any) => (
                            <tr key={lb.id} className="border-b dark:border-gray-700">
                              <td className="px-4 py-2 font-mono text-xs">{lb.reference_id}</td>
                              <td className="px-4 py-2 font-semibold">₹{lb.amount}</td>
                              <td className="px-4 py-2">{lb.type}</td>
                              <td className="px-4 py-2">{lb.received_from}</td>
                              <td className="px-4 py-2">{lb.purpose}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  lb.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {lb.status}
                                </span>
                              </td>
                              <td className="px-4 py-2">{lb.date} {lb.time}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={7} className="px-4 py-4 text-center text-gray-500">No LCR Bones transactions found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* LCR Rewards */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">LCR Rewards (Debited/Credited)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left">Reference ID</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">From</th>
                            <th className="px-4 py-2 text-left">Purpose</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDetails.lcr_rewards?.length > 0 ? userDetails.lcr_rewards.map((lr: any) => (
                            <tr key={lr.id} className="border-b dark:border-gray-700">
                              <td className="px-4 py-2 font-mono text-xs">{lr.reference_id}</td>
                              <td className="px-4 py-2 font-semibold">₹{lr.amount}</td>
                              <td className="px-4 py-2">{lr.type}</td>
                              <td className="px-4 py-2">{lr.received_from}</td>
                              <td className="px-4 py-2">{lr.purpose}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  lr.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {lr.status}
                                </span>
                              </td>
                              <td className="px-4 py-2">{lr.date} {lr.time}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={7} className="px-4 py-4 text-center text-gray-500">No LCR Rewards transactions found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}