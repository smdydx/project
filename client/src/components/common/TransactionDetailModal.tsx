
import { useState, useEffect } from 'react';
import { X, User, Smartphone, Wallet, TrendingUp, CreditCard, Activity } from 'lucide-react';
import Card from './Card';

interface TransactionDetailModalProps {
  referenceId: string;
  onClose: () => void;
}

interface PaymentDetail {
  service_request: any;
  user: any;
  payment_gateway_transactions: any[];
  lcr_money_transactions: any[];
  lcr_rewards_transactions: any[];
  pagination: {
    lcr_money: { current_page: number; page_size: number; total_records: number; total_pages: number };
    lcr_rewards: { current_page: number; page_size: number; total_records: number; total_pages: number };
  };
}

export default function TransactionDetailModal({ referenceId, onClose }: TransactionDetailModalProps) {
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lcrMoneyPage, setLcrMoneyPage] = useState(1);
  const [lcrRewardsPage, setLcrRewardsPage] = useState(1);

  useEffect(() => {
    fetchPaymentDetails();
  }, [referenceId, lcrMoneyPage, lcrRewardsPage]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000';
      const token = localStorage.getItem('lcrpay_auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/v1/transactions/payment-details/${referenceId}?lcr_money_page=${lcrMoneyPage}&lcr_rewards_page=${lcrRewardsPage}`,
        { headers }
      );

      if (!response.ok) throw new Error('Failed to fetch payment details');
      const data = await response.json();
      setPaymentDetail(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'paid':
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
      case 'inactive':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !paymentDetail) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md">
          <p className="text-red-500 mb-4">{error || 'No data found'}</p>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">Transaction Details</h2>
            <p className="text-blue-100 text-sm">Reference ID: {referenceId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Service Request Info */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
              Service Request Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Type</label>
                <p className="text-gray-900 dark:text-white font-medium">{paymentDetail.service_request.service_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{paymentDetail.service_request.amount?.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(paymentDetail.service_request.status)}`}>
                    {paymentDetail.service_request.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile Number</label>
                <p className="text-gray-900 dark:text-white font-mono">{paymentDetail.service_request.mobile_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Operator</label>
                <p className="text-gray-900 dark:text-white">{paymentDetail.service_request.operator_code || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment TXN ID</label>
                <p className="text-gray-900 dark:text-white font-mono text-xs">{paymentDetail.service_request.payment_txn_id || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* User Info */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              User Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                <p className="text-gray-900 dark:text-white font-medium">{paymentDetail.user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile</label>
                <p className="text-gray-900 dark:text-white font-mono">{paymentDetail.user.mobile}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Member ID</label>
                <p className="text-gray-900 dark:text-white font-mono">{paymentDetail.user.member_id}</p>
              </div>
            </div>
          </Card>

          {/* LCR Money Transactions */}
          {paymentDetail.lcr_money_transactions.length > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-yellow-600" />
                LCR Money Transactions ({paymentDetail.pagination.lcr_money.total_records})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">From</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Purpose</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentDetail.lcr_money_transactions.map((lm) => (
                      <tr key={lm.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">₹{lm.amount}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lm.type}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lm.received_from}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lm.purpose}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lm.status)}`}>
                            {lm.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lm.date} {lm.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* LCR Rewards Transactions */}
          {paymentDetail.lcr_rewards_transactions.length > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                LCR Rewards Transactions ({paymentDetail.pagination.lcr_rewards.total_records})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">From</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Purpose</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentDetail.lcr_rewards_transactions.map((lr) => (
                      <tr key={lr.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">₹{lr.amount}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lr.type}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lr.received_from}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lr.purpose}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lr.status)}`}>
                            {lr.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lr.date} {lr.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Payment Gateway Transactions */}
          {paymentDetail.payment_gateway_transactions.length > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Payment Gateway Details
              </h3>
              {paymentDetail.payment_gateway_transactions.map((pg) => (
                <div key={pg.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 last:border-0">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Mode</label>
                    <p className="text-gray-900 dark:text-white font-medium">{pg.payment_mode || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</label>
                    <p className="text-gray-900 dark:text-white">{pg.bank_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                    <p className="text-green-600 dark:text-green-400 font-bold">₹{pg.amount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">RRN</label>
                    <p className="text-gray-900 dark:text-white font-mono text-xs">{pg.rrn || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(pg.status)}`}>
                        {pg.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 p-4 rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-medium transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
