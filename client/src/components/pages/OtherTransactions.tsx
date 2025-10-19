import { useState, useEffect } from 'react';
import { Search, Activity, Filter, Download, ChevronDown, Eye } from 'lucide-react';
import Card from '@/components/common/Card';
import TransactionDetailModal from '@/components/common/TransactionDetailModal';

interface OtherTransaction {
  id: number;
  user_id: number;
  service_type: string;
  operator_code: string | null;
  mobile_number: string | null;
  amount: string;
  reference_id: string;
  status: string;
  payment_txn_id: string | null;
  utr_no: string | null;
  created_at: string;
  updated_at: string;
}

const fetchOtherTransactions = async (filterServiceType: string, filterStatus: string) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const params = new URLSearchParams();
    if (filterServiceType && filterServiceType !== 'all') {
      params.append('service_type', filterServiceType);
    }
    if (filterStatus && filterStatus !== 'all') {
      params.append('status', filterStatus);
    }

    const response = await fetch(`${API_URL}/api/v1/transactions/other?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch other transactions: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching other transactions:', error);
    throw error;
  }
};

const fetchServiceTypes = async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_URL}/api/v1/transactions/service-types`);
    if (!response.ok) return [];
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching service types:', err);
    return [];
  }
};

export default function OtherTransactions() {
  const [transactions, setTransactions] = useState<OtherTransaction[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const loadServiceTypes = async () => {
      const types = await fetchServiceTypes();
      setServiceTypes(types);
    };
    loadServiceTypes();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOtherTransactions(filterServiceType, filterStatus);
        setTransactions(data || []);
        setCurrentPage(1);
      } catch (err: any) {
        setError(err.message || 'Failed to load transactions');
      }
      setLoading(false);
    };

    loadData();
  }, [filterStatus, filterServiceType]);

  const handleReferenceClick = (referenceId: string) => {
    setSelectedReferenceId(referenceId);
    setShowDetailModal(true);
  };

  const filteredTransactions = transactions.filter(txn => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      txn.reference_id?.toLowerCase().includes(searchLower) ||
      txn.mobile_number?.toLowerCase().includes(searchLower) ||
      txn.payment_txn_id?.toLowerCase().includes(searchLower) ||
      txn.utr_no?.toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'paid': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'processing': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            Other Transactions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Prime Activation & Other Services</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Download className="w-5 h-5" />
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
          <div className="flex flex-col justify-center items-center py-12 space-4">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button 
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const data = await fetchOtherTransactions(filterServiceType, filterStatus);
                  setTransactions(data || []);
                } catch (err: any) {
                  setError(err.message);
                }
                setLoading(false);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
                  placeholder="Search by reference ID, mobile, payment txn ID, or UTR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">User ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Service Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Reference ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">{txn.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{txn.user_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{txn.service_type}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">₹{parseFloat(txn.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-mono">{txn.reference_id || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(txn.status)}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleReferenceClick(txn.reference_id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(txn.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
              </div>
            )}

            {filteredTransactions.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        currentPage === page
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedReferenceId && (
        <TransactionDetailModal
          referenceId={selectedReferenceId}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReferenceId(null);
          }}
        />
      )}
    </div>
  );
}