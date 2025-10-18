
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Wallet, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '@/components/common/Card';

interface PaymentDetail {
  service_request: any;
  user: any;
  lcr_money_transactions: any[];
  lcr_rewards_transactions: any[];
}

export default function ReferenceDetailPage() {
  const params = useParams();
  const referenceId = params.referenceId;
  const [, setLocation] = useLocation();
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [lcrMoneyPage, setLcrMoneyPage] = useState(1);
  const [lcrRewardsPage, setLcrRewardsPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!referenceId) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/v1/transactions/payment-details/${referenceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }
        const data = await response.json();
        setPaymentDetail(data);
      } catch (err: any) {
        console.error('Error fetching payment details:', err);
        setError(err.message || 'Failed to load payment details');
      }
      setLoading(false);
    };

    fetchDetails();
  }, [referenceId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading transaction details...</p>
      </div>
    );
  }

  if (error || !paymentDetail) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
        <p className="text-red-500 dark:text-red-400">{error || 'No data found'}</p>
        <button
          onClick={() => setLocation('/transactions/mobile')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Sort transactions by date (latest first)
  const sortedLcrMoney = [...paymentDetail.lcr_money_transactions].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`).getTime();
    const dateB = new Date(`${b.date} ${b.time}`).getTime();
    return dateB - dateA;
  });

  const sortedLcrRewards = [...paymentDetail.lcr_rewards_transactions].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`).getTime();
    const dateB = new Date(`${b.date} ${b.time}`).getTime();
    return dateB - dateA;
  });

  // Pagination logic
  const totalLcrMoneyPages = Math.ceil(sortedLcrMoney.length / itemsPerPage);
  const totalLcrRewardsPages = Math.ceil(sortedLcrRewards.length / itemsPerPage);

  const paginatedLcrMoney = sortedLcrMoney.slice(
    (lcrMoneyPage - 1) * itemsPerPage,
    lcrMoneyPage * itemsPerPage
  );

  const paginatedLcrRewards = sortedLcrRewards.slice(
    (lcrRewardsPage - 1) * itemsPerPage,
    lcrRewardsPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'paid': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'processing': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLocation('/transactions/mobile')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transaction Details - {referenceId}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Complete transaction history for this reference</p>
        </div>
      </div>

      {/* User & Service Request Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-3">User Information</h3>
          <div className="space-y-2">
            <p className="text-sm"><strong className="text-gray-600 dark:text-gray-300">Name:</strong> {paymentDetail.user.name}</p>
            <p className="text-sm"><strong className="text-gray-600 dark:text-gray-300">Member ID:</strong> {paymentDetail.user.member_id}</p>
            <p className="text-sm"><strong className="text-gray-600 dark:text-gray-300">Mobile:</strong> {paymentDetail.user.mobile}</p>
            <p className="text-sm"><strong className="text-gray-600 dark:text-gray-300">Email:</strong> {paymentDetail.user.email}</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-3">Service Request Info</h3>
          <div className="space-y-2">
            <p className="text-sm"><strong className="text-gray-600 dark:text-gray-300">Reference ID:</strong> {paymentDetail.service_request.reference_id}</p>
            <p className="text-sm"><strong className="text-gray-600 dark:text-gray-300">Service Type:</strong> {paymentDetail.service_request.service_type}</p>
            <p className="text-sm"><strong className="text-gray-600 dark:text-gray-300">Amount:</strong> ₹{parseFloat(paymentDetail.service_request.amount).toLocaleString()}</p>
            <p className="text-sm">
              <strong className="text-gray-600 dark:text-gray-300">Status:</strong>{' '}
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${getStatusColor(paymentDetail.service_request.status)}`}>
                {paymentDetail.service_request.status}
              </span>
            </p>
          </div>
        </Card>
      </div>

      {/* LCR Money Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-yellow-600" />
            LCR Money Transactions
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total: {sortedLcrMoney.length} records
          </span>
        </div>

        {sortedLcrMoney.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-yellow-50 dark:bg-yellow-900/20">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">From</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">To</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Purpose</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Remark</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLcrMoney.map((lm, index) => (
                    <tr key={lm.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{(lcrMoneyPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-3 py-3 font-semibold text-gray-900 dark:text-white">₹{parseFloat(lm.amount).toLocaleString()}</td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lm.type}</td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lm.received_from}</td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lm.received_by}</td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lm.purpose}</td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lm.remark}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lm.status)}`}>
                          {lm.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lm.date} {lm.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls 
              currentPage={lcrMoneyPage}
              totalPages={totalLcrMoneyPages}
              onPageChange={setLcrMoneyPage}
            />
          </>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No LCR Money transactions found for this reference ID</p>
          </div>
        )}
      </Card>

      {/* LCR Rewards Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            LCR Rewards Transactions
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total: {sortedLcrRewards.length} records
          </span>
        </div>

        {sortedLcrRewards.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-purple-50 dark:bg-purple-900/20">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">From</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">To</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Purpose</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Remark</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLcrRewards.map((lr, index) => (
                    <tr key={lr.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{(lcrRewardsPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-3 py-3 font-semibold text-gray-900 dark:text-white">₹{parseFloat(lr.amount).toLocaleString()}</td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lr.type}</td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lr.received_from}</td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lr.received_by}</td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lr.purpose}</td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lr.remark}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lr.status)}`}>
                          {lr.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{lr.date} {lr.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls 
              currentPage={lcrRewardsPage}
              totalPages={totalLcrRewardsPages}
              onPageChange={setLcrRewardsPage}
            />
          </>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No LCR Rewards transactions found for this reference ID</p>
          </div>
        )}
      </Card>
    </div>
  );
}
