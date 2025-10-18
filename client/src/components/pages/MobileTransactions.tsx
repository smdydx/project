import { useState, useEffect } from 'react';
import { Search, Smartphone, Filter, ChevronDown, Download, X } from 'lucide-react';
import Card from '@/components/common/Card';

interface ServiceRequestTransaction {
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

interface PaymentDetail {
  service_request: any;
  user: any;
  payment_gateway_transactions: any[];
}

const fetchServiceTypes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/transactions/service-types');
      if (!response.ok) return [];
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching service types:', err);
      return [];
    }
  };

const fetchServiceRequests = async (filterServiceType: string, filterStatus: string) => {
    try {
      const params = new URLSearchParams();
      if (filterServiceType && filterServiceType !== 'all') {
        params.append('service_type', filterServiceType);
      }
      if (filterStatus && filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`http://localhost:8000/api/v1/transactions/mobile?${params.toString()}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch mobile transactions: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Fetched mobile transaction records:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error fetching mobile transactions:', error);
      throw error;
    }
  };

const fetchPaymentDetails = async (referenceId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/transactions/payment-details/${referenceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }
      return await response.json();
    } catch (err: any) {
      console.error('Error fetching payment details:', err);
      alert('Failed to load payment details');
      return null;
    }
  };

export default function MobileTransactions() {
  const [transactions, setTransactions] = useState<ServiceRequestTransaction[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<PaymentDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
        const data = await fetchServiceRequests(filterServiceType, filterStatus);
        setTransactions(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load service requests. Please try again.');
      }
      setLoading(false);
    };

    loadData();
  }, [filterStatus, filterServiceType]);

  const handleReferenceClick = async (referenceId: string) => {
    const details = await fetchPaymentDetails(referenceId);
    if (details) {
      setSelectedPaymentDetail(details);
      setShowDetailModal(true);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3" data-testid="page-title">
            <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Mobile Transactions - Service Requests
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View all service request transactions</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          data-testid="button-export"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      <Card>
        {loading && (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 dark:text-gray-400" data-testid="text-loading">Loading service requests...</p>
          </div>
        )}
        {error && !loading && (
          <div className="flex flex-col justify-center items-center py-12 space-y-4">
            <p className="text-red-500 dark:text-red-400" data-testid="text-error">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please ensure the backend server is running on port 8000</p>
            <button 
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const data = await fetchServiceRequests(filterServiceType, filterStatus);
                  setTransactions(data || []);
                } catch (err: any) {
                  setError(err.message || 'Failed to load service requests. Please try again.');
                }
                setLoading(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="button-retry"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  data-testid="input-search"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterServiceType}
                  onChange={(e) => setFilterServiceType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer"
                  data-testid="select-service-type"
                >
                  <option value="all">All Services</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                  <option value="completed">Completed</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="mb-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300" data-testid="text-current-filter">
                <strong>Current Filter:</strong> {filterServiceType === 'all' ? 'All Services' : filterServiceType} | {filterStatus === 'all' ? 'All Status' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                <span className="ml-2">|</span>
                <span className="ml-2"><strong>Total Results:</strong> {filteredTransactions.length}</span>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Service Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Operator Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Mobile Number</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Reference ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Payment Txn ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">UTR No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Created At</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => (
                    <tr 
                      key={txn.id} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      data-testid={`row-transaction-${txn.id}`}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300" data-testid={`text-id-${txn.id}`}>{txn.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-userid-${txn.id}`}>{txn.user_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" data-testid={`text-service-${txn.id}`}>{txn.service_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-operator-${txn.id}`}>{txn.operator_code || '-'}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300" data-testid={`text-mobile-${txn.id}`}>{txn.mobile_number || '-'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white" data-testid={`text-amount-${txn.id}`}>₹{parseFloat(txn.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-mono">
                        <button
                          onClick={() => handleReferenceClick(txn.reference_id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer font-semibold"
                          data-testid={`text-reference-${txn.id}`}
                        >
                          {txn.reference_id || 'N/A'}
                        </button>
                      </td>
                      <td className="px-4 py-3" data-testid={`text-status-${txn.id}`}>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(txn.status)}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300" data-testid={`text-paymenttxn-${txn.id}`}>{txn.payment_txn_id || '-'}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300" data-testid={`text-utr-${txn.id}`}>{txn.utr_no || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-created-${txn.id}`}>{formatDate(txn.created_at)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-updated-${txn.id}`}>{formatDate(txn.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400" data-testid="text-no-results">No service requests found</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {showDetailModal && selectedPaymentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Details</h2>
              <button onClick={() => { setShowDetailModal(false); setSelectedPaymentDetail(null); }} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">Service Request Info</h3>
                <p><strong className="text-gray-600 dark:text-gray-300">Reference ID:</strong> {selectedPaymentDetail.service_request.reference_id}</p>
                <p><strong className="text-gray-600 dark:text-gray-300">Service Type:</strong> {selectedPaymentDetail.service_request.service_type}</p>
                <p><strong className="text-gray-600 dark:text-gray-300">Amount:</strong> ₹{parseFloat(selectedPaymentDetail.service_request.amount).toLocaleString()}</p>
                <p><strong className="text-gray-600 dark:text-gray-300">Status:</strong> 
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${getStatusColor(selectedPaymentDetail.service_request.status)}`}>
                    {selectedPaymentDetail.service_request.status}
                  </span>
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">User Info</h3>
                <p><strong className="text-gray-600 dark:text-gray-300">User ID:</strong> {selectedPaymentDetail.user.id}</p>
                <p><strong className="text-gray-600 dark:text-gray-300">Name:</strong> {selectedPaymentDetail.user.name}</p>
                <p><strong className="text-gray-600 dark:text-gray-300">Email:</strong> {selectedPaymentDetail.user.email}</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">Payment Gateway Transactions</h3>
              {selectedPaymentDetail.payment_gateway_transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Gateway</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Transaction ID</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPaymentDetail.payment_gateway_transactions.map((pgTxn, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">{pgTxn.gateway_name}</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600 dark:text-gray-300">{pgTxn.transaction_id}</td>
                          <td className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white">₹{parseFloat(pgTxn.amount).toLocaleString()}</td>
                          <td className="px-3 py-2" data-testid={`pg-text-status-${index}`}>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(pgTxn.status)}`}>
                              {pgTxn.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">{formatDate(pgTxn.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No payment gateway transactions found for this request.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}