
import React, { useState } from 'react';
import { Eye, Download, Smartphone, Tv, Filter, Calendar } from 'lucide-react';
import AdvancedRealtimeTable from '../common/AdvancedRealtimeTable';
import Card from '../common/Card';

const transactionTypes = ['All', 'Mobile', 'DTH'];
const statusTypes = ['All', 'Success', 'Pending', 'Failed'];
const operators = ['All', 'Airtel', 'Jio', 'Vi', 'BSNL', 'Tata Sky', 'Dish TV', 'Airtel Digital', 'Sun Direct'];

// Mock data - replace with actual API calls
const mockTransactions = [
  {
    id: 'TXN001',
    userId: 'USR123',
    userName: 'Rajesh Kumar',
    mobile: '+91 9876543210',
    type: 'Mobile',
    operator: 'Airtel',
    amount: 399,
    status: 'Success',
    date: '2024-02-20 10:30',
    rechargeNumber: '9876543210',
    referenceId: 'REF123456789',
    operatorTxnId: 'OP123456789'
  },
  {
    id: 'TXN002',
    userId: 'USR124',
    userName: 'Priya Sharma',
    mobile: '+91 9876543211',
    type: 'DTH',
    operator: 'Tata Sky',
    amount: 650,
    status: 'Success',
    date: '2024-02-20 11:15',
    rechargeNumber: '1234567890',
    referenceId: 'REF123456790',
    operatorTxnId: 'OP123456790'
  },
  {
    id: 'TXN003',
    userId: 'USR125',
    userName: 'Amit Patel',
    mobile: '+91 9876543212',
    type: 'Mobile',
    operator: 'Jio',
    amount: 299,
    status: 'Pending',
    date: '2024-02-20 12:00',
    rechargeNumber: '9876543212',
    referenceId: 'REF123456791',
    operatorTxnId: 'OP123456791'
  },
  {
    id: 'TXN004',
    userId: 'USR126',
    userName: 'Sneha Reddy',
    mobile: '+91 9876543213',
    type: 'DTH',
    operator: 'Dish TV',
    amount: 750,
    status: 'Failed',
    date: '2024-02-20 13:45',
    rechargeNumber: '9876543213',
    referenceId: 'REF123456792',
    operatorTxnId: 'OP123456792'
  }
];

export default function MobileDTHTransactions() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [operatorFilter, setOperatorFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-bold';
    const statusColors = {
      Success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      Failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return `${baseClasses} ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`;
  };

  const getTypeBadge = (type: string) => {
    const Icon = type === 'Mobile' ? Smartphone : Tv;
    const colorClass = type === 'Mobile' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 ${colorClass}`}>
        <Icon className="w-3 h-3" />
        <span>{type}</span>
      </span>
    );
  };

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const filteredTransactions = mockTransactions.filter(txn => {
    const typeMatch = typeFilter === 'All' || txn.type === typeFilter;
    const statusMatch = statusFilter === 'All' || txn.status === statusFilter;
    const operatorMatch = operatorFilter === 'All' || txn.operator === operatorFilter;
    return typeMatch && statusMatch && operatorMatch;
  });

  const columns = [
    {
      key: 'id',
      title: 'Txn ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'userName',
      title: 'User',
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.mobile}</p>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      render: (value: string) => getTypeBadge(value)
    },
    {
      key: 'operator',
      title: 'Operator',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{value}</span>
      )
    },
    {
      key: 'rechargeNumber',
      title: 'Recharge Number',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value: number) => (
        <span className="font-bold text-green-600 dark:text-green-400">
          ₹{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={getStatusBadge(value)}>{value}</span>
      )
    },
    {
      key: 'date',
      title: 'Date & Time',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleViewDetails(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
            title="Download Receipt"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Mobile & DTH Transactions
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View and manage all recharge transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {transactionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statusTypes.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Operator
            </label>
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {operators.map(operator => (
                <option key={operator} value={operator}>{operator}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <AdvancedRealtimeTable
        title="🔥 Live Mobile & DTH Transactions"
        columns={columns}
        data={filteredTransactions}
        searchPlaceholder="Search by Txn ID, User, Mobile Number, or Reference ID..."
        showStats={true}
        enableAnimations={true}
      />

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Transaction Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-500">&times;</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reference ID</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">{selectedTransaction.referenceId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">User Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                  <div className="mt-1">{getTypeBadge(selectedTransaction.type)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Operator</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.operator}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recharge Number</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">{selectedTransaction.rechargeNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mobile Number</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">{selectedTransaction.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="font-bold text-green-600 dark:text-green-400">₹{selectedTransaction.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <div className="mt-1">
                    <span className={getStatusBadge(selectedTransaction.status)}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Operator Txn ID</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">{selectedTransaction.operatorTxnId}</p>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download Receipt</span>
                </button>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
