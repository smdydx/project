
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, User, Smartphone, Wallet, TrendingUp } from 'lucide-react';
import Card from '@/components/common/Card';

interface UserTransactionDetail {
  user: {
    id: number;
    name: string;
    member_id: string;
    mobile: string;
  };
  service_requests: Array<{
    id: number;
    reference_id: string;
    service_type: string;
    operator: string;
    mobile: string;
    amount: number;
    status: string;
    payment_txn_id: string;
    utr_no: string;
    date: string;
    time: string;
  }>;
  lcr_bones: Array<{
    id: number;
    reference_id: string;
    amount: number;
    type: string;
    received_by: string;
    received_from: string;
    status: string;
    date: string;
    time: string;
    purpose: string;
    remark: string;
  }>;
  lcr_rewards: Array<{
    id: number;
    reference_id: string;
    amount: number;
    type: string;
    received_by: string;
    received_from: string;
    status: string;
    date: string;
    time: string;
    purpose: string;
    remark: string;
  }>;
}

export default function UserTransactionDetail() {
  const params = useParams();
  const userId = params.userId;
  const [, setLocation] = useLocation();
  const [userDetail, setUserDetail] = useState<UserTransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/api/v1/transactions/user/${userId}/all`, { headers });
      
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const data = await response.json();
      setUserDetail(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !userDetail) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error || 'User not found'}</p>
          <button 
            onClick={() => setLocation('/transactions/mobile')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setLocation('/transactions/mobile')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{userDetail.user.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Member ID: {userDetail.user.member_id} | Mobile: {userDetail.user.mobile}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Service Requests</p>
              <p className="text-2xl font-bold mt-1">{userDetail.service_requests.length}</p>
            </div>
            <Smartphone className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">LCR Bones</p>
              <p className="text-2xl font-bold mt-1">{userDetail.lcr_bones.length}</p>
            </div>
            <Wallet className="w-12 h-12 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">LCR Rewards</p>
              <p className="text-2xl font-bold mt-1">{userDetail.lcr_rewards.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </Card>
      </div>

      {/* Service Requests Table */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Mobile Transactions (Service Requests)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Reference ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Operator</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {userDetail.service_requests.map((sr) => (
                <tr key={sr.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{sr.reference_id}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{sr.service_type}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{sr.mobile}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{sr.operator}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">₹{sr.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(sr.status)}`}>
                      {sr.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{sr.date} {sr.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {userDetail.service_requests.length === 0 && (
            <div className="text-center py-8 text-gray-500">No service requests found</div>
          )}
        </div>
      </Card>

      {/* LCR Bones Table */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          LCR Bones (Debited/Credited)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Reference ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {userDetail.lcr_bones.map((lb) => (
                <tr key={lb.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{lb.reference_id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">₹{lb.amount}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lb.type}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lb.received_from}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lb.purpose}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lb.status)}`}>
                      {lb.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lb.date} {lb.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {userDetail.lcr_bones.length === 0 && (
            <div className="text-center py-8 text-gray-500">No LCR Bones transactions found</div>
          )}
        </div>
      </Card>

      {/* LCR Rewards Table */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          LCR Rewards (Debited/Credited)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Reference ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {userDetail.lcr_rewards.map((lr) => (
                <tr key={lr.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{lr.reference_id}</td>
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
          {userDetail.lcr_rewards.length === 0 && (
            <div className="text-center py-8 text-gray-500">No LCR Rewards transactions found</div>
          )}
        </div>
      </Card>
    </div>
  );
}
