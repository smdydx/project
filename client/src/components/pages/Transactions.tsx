import React, { useState } from 'react';
import { Eye, Download, X, User, Wallet, TrendingUp, Activity, Award, DollarSign } from 'lucide-react';
import DataTable from '../common/DataTable';
import Card from '../common/Card';
import { mockTransactions } from '../../data/mockData';

const tabs = ['All', 'Successful', 'Failed', 'Pending', 'Reversed'];
const serviceTypes = ['All', 'Electricity Bill', 'Gas Bill', 'Mobile Recharge', 'DTH Recharge', 'Water Bill', 'Broadband Bill'];

interface UserDetail {
  userId: string;
  name: string;
  mobile: string;
  email: string;
  memberID: string;
  walletBalance: number;
  rewardBalance: number;
  lcrMoney: number;
  totalTransactions: number;
  totalRecharge: number;
  kycStatus: string;
  primeStatus: boolean;
  joinedDate: string;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const filteredTransactions = mockTransactions.filter(transaction => {
    const statusMatch = activeTab === 'All' || transaction.status === activeTab;
    const serviceMatch = serviceFilter === 'All' || transaction.service === serviceFilter;
    return statusMatch && serviceMatch;
  });

  const handleUserClick = async (userName: string) => {
    // Mock user detail data - Replace with actual API call
    const userDetail: UserDetail = {
      userId: 'USR' + Math.floor(Math.random() * 10000),
      name: userName,
      mobile: '+91 ' + Math.floor(Math.random() * 9000000000 + 1000000000),
      email: userName.toLowerCase().replace(' ', '') + '@example.com',
      memberID: 'MEM' + Math.floor(Math.random() * 100000),
      walletBalance: Math.floor(Math.random() * 50000),
      rewardBalance: Math.floor(Math.random() * 10000),
      lcrMoney: Math.floor(Math.random() * 25000),
      totalTransactions: Math.floor(Math.random() * 500),
      totalRecharge: Math.floor(Math.random() * 100000),
      kycStatus: Math.random() > 0.5 ? 'Verified' : 'Pending',
      primeStatus: Math.random() > 0.5,
      joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      recentTransactions: Array.from({ length: 5 }, (_, i) => ({
        id: 'TXN' + Math.floor(Math.random() * 100000),
        type: ['Mobile Recharge', 'Bill Payment', 'Wallet Add', 'LCR Money'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 5000),
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: ['Success', 'Pending', 'Failed'][Math.floor(Math.random() * 3)]
      }))
    };
    
    setSelectedUser(userDetail);
    setShowUserModal(true);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'Successful':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Reversed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const columns = [
    { key: 'id', title: 'Txn ID', sortable: true },
    { 
      key: 'user', 
      title: 'User', 
      sortable: true,
      render: (value: string) => (
        <button 
          onClick={() => handleUserClick(value)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline cursor-pointer"
        >
          {value}
        </button>
      )
    },
    { key: 'service', title: 'Service', sortable: true },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={getStatusBadge(value)}>{value}</span>
      )
    },
    { key: 'date', title: 'Date', sortable: true },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: any) => (
        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      <Card>
        <div className="space-y-4">
          {/* Status Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {serviceTypes.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={filteredTransactions}
        searchPlaceholder="Search by Txn ID, Mobile, or Reference ID..."
      />

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                  <p className="text-blue-100 text-sm">Complete User Details</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* User Basic Info */}
              <Card>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</label>
                    <p className="text-gray-900 dark:text-white font-mono">{selectedUser.userId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Member ID</label>
                    <p className="text-gray-900 dark:text-white font-mono">{selectedUser.memberID}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile Number</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.mobile}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">KYC Status</label>
                    <p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedUser.kycStatus === 'Verified' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {selectedUser.kycStatus}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Prime Status</label>
                    <p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedUser.primeStatus 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {selectedUser.primeStatus ? '⭐ Prime' : 'Normal'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined Date</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.joinedDate}</p>
                  </div>
                </div>
              </Card>

              {/* Wallet & LCR Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wallet Balance</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        ₹{selectedUser.walletBalance.toLocaleString()}
                      </p>
                    </div>
                    <Wallet className="w-10 h-10 text-green-500" />
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reward Balance</p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                        ₹{selectedUser.rewardBalance.toLocaleString()}
                      </p>
                    </div>
                    <Award className="w-10 h-10 text-yellow-500" />
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">LCR Money</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        ₹{selectedUser.lcrMoney.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-10 h-10 text-blue-500" />
                  </div>
                </Card>
              </div>

              {/* Transaction Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {selectedUser.totalTransactions}
                      </p>
                    </div>
                    <Activity className="w-10 h-10 text-purple-500" />
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recharge</p>
                      <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                        ₹{selectedUser.totalRecharge.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-cyan-500" />
                  </div>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Transactions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Txn ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedUser.recentTransactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{txn.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{txn.type}</td>
                          <td className="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400">₹{txn.amount}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{txn.date}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              txn.status === 'Success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 p-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-medium transition-colors"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}