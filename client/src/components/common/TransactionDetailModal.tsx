import { useState, useEffect } from 'react';
import { X, TrendingUp, Award, Wallet, Star } from 'lucide-react';
import Card from './Card';

interface TransactionDetailModalProps {
  referenceId: string;
  onClose: () => void;
}

interface LcrMoneyTransaction {
  id: number;
  amount: number;
  type: string;
  received_by: string;
  received_from: string;
  status: string;
  date: string;
  time: string;
  purpose: string;
  remark: string;
}

interface LcrRewardTransaction {
  id: number;
  amount: number;
  type: string;
  received_by: string;
  received_from: string;
  status: string;
  date: string;
  time: string;
  purpose: string;
  remark: string;
}

export default function TransactionDetailModal({ referenceId, onClose }: TransactionDetailModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [lcrMoneyTransactions, setLcrMoneyTransactions] = useState<LcrMoneyTransaction[]>([]);
  const [lcrRewardTransactions, setLcrRewardTransactions] = useState<LcrRewardTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000';
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('🔍 Fetching transaction details for reference_id:', referenceId);
        
        // Fetch summary details
        const detailResponse = await fetch(
          `${API_URL}/api/v1/transactions/detail/${referenceId}`,
          { headers }
        );

        if (!detailResponse.ok) {
          console.error('❌ API Error:', detailResponse.status, detailResponse.statusText);
          throw new Error('Failed to fetch transaction details');
        }
        
        const detailData = await detailResponse.json();
        console.log('✅ Transaction details received:', detailData);
        setDetails(detailData);

        // Fetch complete payment details with LCR Money and Reward transactions
        const paymentResponse = await fetch(
          `${API_URL}/api/v1/transactions/payment-details/${referenceId}`,
          { headers }
        );

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          console.log('✅ Payment details received:', paymentData);
          setLcrMoneyTransactions(paymentData.lcr_money_transactions || []);
          setLcrRewardTransactions(paymentData.lcr_rewards_transactions || []);
        } else {
          console.warn('⚠️ Could not fetch payment details');
        }
      } catch (error) {
        console.error('❌ Error fetching transaction details:', error);
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };

    if (referenceId) {
      fetchDetails();
    }
  }, [referenceId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No details found</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction Details
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction Info */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Transaction Info
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference ID</label>
                <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">{referenceId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Type</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{details.service_type || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                  ₹{details.amount || '0.00'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {details.status || 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          {/* LCR Money Summary */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-blue-500" />
              LCR Money - Total Distributed
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ₹{details.lcr_money || '0.00'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</label>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {lcrMoneyTransactions.length}
                </p>
              </div>
            </div>
          </Card>

          {/* LCR Money Transactions Table */}
          {lcrMoneyTransactions.length > 0 && (
            <Card>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                LCR Money Transactions
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Received By</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">From</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Purpose</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {lcrMoneyTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 py-2 font-semibold text-blue-600 dark:text-blue-400">₹{txn.amount}</td>
                        <td className="px-3 py-2 text-gray-900 dark:text-white">{txn.type}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{txn.received_by}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{txn.received_from}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{txn.purpose}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            txn.status === 'Active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">{txn.date} {txn.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* LCR Reward Summary */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-purple-500" />
              LCR Reward - Total Distributed
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Points</label>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  ₹{details.lcr_reward || '0'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</label>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {lcrRewardTransactions.length}
                </p>
              </div>
            </div>
          </Card>

          {/* LCR Reward Transactions Table */}
          {lcrRewardTransactions.length > 0 && (
            <Card>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Award className="w-4 h-4 mr-2 text-purple-500" />
                LCR Reward Transactions
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Received By</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">From</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Purpose</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {lcrRewardTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 py-2 font-semibold text-purple-600 dark:text-purple-400">₹{txn.amount}</td>
                        <td className="px-3 py-2 text-gray-900 dark:text-white">{txn.type}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{txn.received_by}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{txn.received_from}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{txn.purpose}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            txn.status === 'Active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">{txn.date} {txn.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* No Data Messages */}
          {lcrMoneyTransactions.length === 0 && lcrRewardTransactions.length === 0 && (
            <Card>
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">
                  No LCR Money or LCR Reward transactions found for this reference ID
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}