import { useState, useEffect } from 'react';
import { Smartphone, Eye } from 'lucide-react';
import Card from '@/components/common/Card';
import TransactionDetailModal from '@/components/common/TransactionDetailModal';
import AdvancedRealtimeTable from '@/components/common/AdvancedRealtimeTable';

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


const fetchServiceRequests = async (filterServiceType: string, filterStatus: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const params = new URLSearchParams();
      if (filterServiceType && filterServiceType !== 'all') {
        params.append('service_type', filterServiceType);
      }
      if (filterStatus && filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`${API_URL}/api/v1/transactions/mobile?${params.toString()}`, { headers });
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


export default function MobileTransactions() {
  const [transactions, setTransactions] = useState<ServiceRequestTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus] = useState('all');
  const [filterServiceType] = useState('all');
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded" data-testid={`text-id-${value}`}>
          {value}
        </span>
      )
    },
    { 
      key: 'user_id', 
      title: 'User ID', 
      sortable: true,
      render: (value: number) => (
        <span className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-userid-${value}`}>
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
      key: 'operator_code', 
      title: 'Operator Code', 
      sortable: true,
      render: (value: string | null, row: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-operator-${row.id}`}>
          {value || '-'}
        </span>
      )
    },
    { 
      key: 'mobile_number', 
      title: 'Mobile Number', 
      sortable: true,
      render: (value: string | null, row: any) => (
        <span className="text-sm font-mono text-gray-600 dark:text-gray-300" data-testid={`text-mobile-${row.id}`}>
          {value || '-'}
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
      render: (_value: any, row: any) => (
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
      key: 'payment_txn_id', 
      title: 'Payment Txn ID', 
      sortable: true,
      render: (value: string | null, row: any) => (
        <span className="text-sm font-mono text-gray-600 dark:text-gray-300" data-testid={`text-paymenttxn-${row.id}`}>
          {value || '-'}
        </span>
      )
    },
    { 
      key: 'utr_no', 
      title: 'UTR No', 
      sortable: true,
      render: (value: string | null, row: any) => (
        <span className="text-sm font-mono text-gray-600 dark:text-gray-300" data-testid={`text-utr-${row.id}`}>
          {value || '-'}
        </span>
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
    },
    { 
      key: 'updated_at', 
      title: 'Updated At', 
      sortable: true,
      render: (value: string, row: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-updated-${row.id}`}>
          {formatDate(value)}
        </span>
      )
    }
  ];

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
      </div>

      {loading && (
        <Card>
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 dark:text-gray-400" data-testid="text-loading">Loading service requests...</p>
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card>
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
        </Card>
      )}

      {!loading && !error && (
        <>
          <div className="mb-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300" data-testid="text-current-filter">
              <strong>Current Filter:</strong> {filterServiceType === 'all' ? 'All Services' : filterServiceType} | {filterStatus === 'all' ? 'All Status' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              <span className="ml-2">|</span>
              <span className="ml-2"><strong>Total Results:</strong> {transactions.length}</span>
            </p>
          </div>

          <AdvancedRealtimeTable
            title="Mobile Transactions - Service Requests"
            columns={columns}
            data={transactions}
            onDataUpdate={async () => {
              const data = await fetchServiceRequests(filterServiceType, filterStatus);
              return data || [];
            }}
            updateInterval={10000}
            searchPlaceholder="Search by reference ID, mobile, payment txn ID, or UTR..."
            showStats={true}
            enableAnimations={true}
            dataTestId="mobile-transactions-table"
          />
        </>
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
