import { useState, useEffect } from 'react';
import { Activity, Eye } from 'lucide-react';
import Card from '@/components/common/Card';
import TransactionDetailModal from '@/components/common/TransactionDetailModal';
import AdvancedRealtimeTable from '@/components/common/AdvancedRealtimeTable';

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

    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Other Transactions: Authorization header added');
    } else {
      console.log('🔑 Other Transactions: No Authorization token found.');
    }

    const response = await fetch(`${API_URL}/api/v1/transactions/other?${params.toString()}`, { headers });
    if (!response.ok) {
      if (response.status === 401) {
        console.error('Authentication error: Token may be invalid or expired.');
      }
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

    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Other Transactions: Authorization header added for service types');
    } else {
      console.log('🔑 Other Transactions: No Authorization token found for service types.');
    }

    const response = await fetch(`${API_URL}/api/v1/transactions/service-types`, { headers });
    if (!response.ok) {
      if (response.status === 401) {
        console.error('Authentication error: Token may be invalid or expired.');
      }
      return [];
    }
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
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
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
        const data = await fetchOtherTransactions(filterServiceType, filterStatus);
        setTransactions(data || []);
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
      render: (value: number, row: any) => (
        <span className="text-sm font-mono text-gray-600 dark:text-gray-300" data-testid={`text-id-${row.id}`}>
          {value}
        </span>
      )
    },
    {
      key: 'user_id',
      title: 'User ID',
      sortable: true,
      render: (value: number, row: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-userid-${row.id}`}>
          {value}
        </span>
      )
    },
    {
      key: 'service_type',
      title: 'Service Type',
      sortable: true,
      render: (value: string, row: any) => (
        <span className="text-sm text-gray-900 dark:text-white" data-testid={`text-service-${row.id}`}>
          {value}
        </span>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value: string, row: any) => (
        <span className="text-sm font-semibold text-gray-900 dark:text-white" data-testid={`text-amount-${row.id}`}>
          ₹{parseFloat(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'reference_id',
      title: 'Reference ID',
      sortable: true,
      render: (value: string, row: any) => (
        <span className="text-sm font-mono" data-testid={`text-reference-${row.id}`}>
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string, row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`} data-testid={`text-status-${row.id}`}>
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
            const token = localStorage.getItem('access_token');
            if (!token) {
              console.error('❌ No token found - redirecting to login');
              localStorage.clear();
              window.location.href = '/login';
              return;
            }
            console.log('✅ Opening detail modal for:', row.reference_id);
            setSelectedReferenceId(row.reference_id);
            setShowDetailModal(true);
          }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
          title="View Details"
          data-testid={`button-view-details-${row.id}`}
        >
          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
        </button>
      )
    },
    {
      key: 'created_at',
      title: 'Created At',
      sortable: true,
      render: (value: string, row: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-created-${row.id}`}>
          {formatDate(value)}
        </span>
      )
    }
  ];

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
      </div>

      {loading && (
        <Card>
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card>
          <div className="flex flex-col justify-center items-center py-12 space-y-4">
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
        </Card>
      )}

      {!loading && !error && (
        <AdvancedRealtimeTable
          title="Other Transactions"
          columns={columns}
          data={transactions}
          onDataUpdate={async () => {
            const data = await fetchOtherTransactions(filterServiceType, filterStatus);
            return data || [];
          }}
          updateInterval={10000}
          searchPlaceholder="Search by reference ID, mobile, payment txn ID, or UTR..."
          showStats={true}
          enableAnimations={true}
          dataTestId="other-transactions-table"
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
