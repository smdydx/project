import { useState, useEffect } from 'react';
import { Eye, Activity } from 'lucide-react';
import Card from '@/components/common/Card';
import TransactionDetailModal from '@/components/common/TransactionDetailModal';
import AdvancedRealtimeTable from '@/components/common/AdvancedRealtimeTable';

const serviceTypeFilters = ['All', 'Mobile Recharge', 'Prime Activation', 'DTH', 'BBPS', 'Other'];
const statusFilters = ['All', 'Completed', 'Paid', 'Pending', 'Failed', 'Processing'];

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userIdParam = urlParams.get('userId');
  const userName = urlParams.get('name');
  const userMobile = urlParams.get('mobile');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000';
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch from appropriate endpoint based on filter
      let endpoint = '/api/v1/transactions/mobile';
      const params = new URLSearchParams();

      if (serviceTypeFilter !== 'All') {
        if (serviceTypeFilter === 'Mobile Recharge') {
          endpoint = '/api/v1/transactions/mobile';
        } else if (serviceTypeFilter === 'DTH') {
          endpoint = '/api/v1/transactions/dth';
        } else {
          endpoint = '/api/v1/transactions/other';
        }
      }

      if (statusFilter !== 'All') {
        params.append('status', statusFilter.toLowerCase());
      }

      const response = await fetch(`${API_URL}${endpoint}?${params.toString()}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch transactions');

      let data = await response.json();
      
      // Filter by user name or mobile if URL params exist
      if (userName || userMobile) {
        data = data.filter((txn: any) => {
          const matchesName = userName ? (txn.name && txn.name.toLowerCase().includes(userName.toLowerCase())) : true;
          const matchesMobile = userMobile ? (txn.mobile_number && txn.mobile_number.includes(userMobile)) : true;
          return matchesName && matchesMobile;
        });
      }
      
      setTransactions(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [serviceTypeFilter, statusFilter]);

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

  const columns = [
    {
      key: 'id',
      title: 'ID',
      sortable: true,
      render: (value: number) => (
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{value}</span>
      )
    },
    {
      key: 'service_type',
      title: 'Service Type',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      key: 'mobile_number',
      title: 'Mobile/Account',
      sortable: true,
      render: (value: string | null) => (
        <span className="text-sm font-mono text-gray-600 dark:text-gray-300">{value || '-'}</span>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          ₹{parseFloat(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'reference_id',
      title: 'Reference ID',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm font-mono">{value || 'N/A'}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: any) => (
        <button
          onClick={() => {
            console.log('🔍 View More clicked for reference_id:', row.reference_id);
            if (!row.reference_id) {
              console.error('❌ No reference_id found in row:', row);
              alert('Reference ID not available for this transaction');
              return;
            }
            setSelectedReferenceId(row.reference_id);
            setShowDetailModal(true);
          }}
          className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="View LCR Money & Rewards"
        >
          View More
        </button>
      )
    },
    {
      key: 'created_at',
      title: 'Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(value)}</span>
      )
    }
  ];

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            {userName ? `Transactions - ${userName}` : 'All Transactions'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {userName || userMobile 
              ? `Showing transactions for ${userName || 'user'} ${userMobile ? `(${userMobile})` : ''}`
              : 'Unified view of all service transactions'
            }
          </p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Service Type</label>
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            >
              {serviceTypeFilters.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            >
              {statusFilters.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {error && (
        <Card>
          <div className="text-center py-8 text-red-500">{error}</div>
        </Card>
      )}

      {!error && (
        <AdvancedRealtimeTable
          title="Transaction History"
          columns={columns}
          data={transactions}
          onDataUpdate={async () => {
            const data = await fetchTransactions();
            return data || [];
          }}
          updateInterval={10000}
          searchPlaceholder="Search by reference ID, mobile, or service type..."
          showStats={true}
          enableAnimations={true}
        />
      )}

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