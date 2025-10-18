
import { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '@/components/common/Card';

interface PaymentTransaction {
  id: number;
  client_txn_id: string;
  sabpaisa_txn_id: string;
  payer_name: string;
  payer_email: string;
  payer_mobile: string;
  amount: number;
  paid_amount: number;
  payment_mode: string;
  bank_name: string;
  rrn: string;
  purpose: string;
  status: string;
  status_code: string;
  sabpaisa_message: string;
  created_at: string;
  updated_at: string;
}

export function PaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [paymentModes, setPaymentModes] = useState<string[]>([]);
  const itemsPerPage = 50;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchTransactions();
    fetchFilters();
  }, [statusFilter, paymentModeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let url = `${API_URL}/api/v1/payment-gateway/all?limit=500`;
      if (statusFilter && statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      if (paymentModeFilter && paymentModeFilter !== 'all') {
        url += `&payment_mode=${paymentModeFilter}`;
      }

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch payment gateway transactions');
      }
      const data = await response.json();
      console.log('✅ Fetched payment gateway transactions:', data.length);
      setTransactions(data);
    } catch (err: any) {
      console.error('Error fetching payment gateway transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [statusesRes, modesRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/payment-gateway/statuses`, { headers }),
        fetch(`${API_URL}/api/v1/payment-gateway/payment-modes`, { headers })
      ]);

      if (statusesRes.ok) {
        const statusesData = await statusesRes.json();
        setStatuses(statusesData);
      }

      if (modesRes.ok) {
        const modesData = await modesRes.json();
        setPaymentModes(modesData);
      }
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = searchTerm === '' ||
      txn.client_txn_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.payer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.payer_mobile.includes(searchTerm) ||
      (txn.sabpaisa_txn_id && txn.sabpaisa_txn_id.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'FAILED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Client TXN ID', 'SabPaisa TXN ID', 'Payer Name', 'Mobile', 'Amount', 'Payment Mode', 'Bank', 'Status', 'Created At'];
    const csvData = filteredTransactions.map(txn => [
      txn.id,
      txn.client_txn_id,
      txn.sabpaisa_txn_id,
      txn.payer_name,
      txn.payer_mobile,
      txn.amount,
      txn.payment_mode,
      txn.bank_name,
      txn.status,
      formatDate(txn.created_at)
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment_gateway_${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading payment transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="heading-payments">
          Payment Gateway Transactions
        </h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by TXN ID, name, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Payment Modes</option>
            {paymentModes.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Client TXN ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">SabPaisa TXN</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Payer Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Payment Mode</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Bank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Created At</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{txn.id}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{txn.client_txn_id}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">{txn.sabpaisa_txn_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{txn.payer_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{txn.payer_mobile}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">₹{txn.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{txn.payment_mode}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{txn.bank_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{txn.purpose}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(txn.status)}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(txn.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
