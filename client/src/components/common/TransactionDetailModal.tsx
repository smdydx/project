import { useState, useEffect } from 'react';
import { X, TrendingUp, Award } from 'lucide-react';
import Card from './Card';

interface TransactionDetailModalProps {
  referenceId: string;
  onClose: () => void;
}

export default function TransactionDetailModal({ referenceId, onClose }: TransactionDetailModalProps) {
  const [details, setDetails] = useState<any>(null);
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

        const response = await fetch(
          `${API_URL}/api/v1/transactions/detail/${referenceId}`,
          { headers }
        );

        if (!response.ok) throw new Error('Failed to fetch transaction details');
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error('Error fetching transaction details:', error);
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
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              LCR Money
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ₹{details.lcr_money || '0.00'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                  {details.money_status || 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-500" />
              LCR Reward
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Points</label>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {details.lcr_reward || '0'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                  {details.reward_status || 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Transaction Info
            </h3>
            <div className="space-y-3">
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
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  ₹{details.amount || '0.00'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}