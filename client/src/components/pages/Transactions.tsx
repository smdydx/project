import React, { useState } from 'react';
import { Eye, Download } from 'lucide-react';
import DataTable from '../common/DataTable';
import Card from '../common/Card';
import { mockTransactions } from '../../data/mockData';

const tabs = ['All', 'Successful', 'Failed', 'Pending', 'Reversed'];
const serviceTypes = ['All', 'Electricity Bill', 'Gas Bill', 'Mobile Recharge', 'DTH Recharge', 'Water Bill', 'Broadband Bill'];

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');

  const filteredTransactions = mockTransactions.filter(transaction => {
    const statusMatch = activeTab === 'All' || transaction.status === activeTab;
    const serviceMatch = serviceFilter === 'All' || transaction.service === serviceFilter;
    return statusMatch && serviceMatch;
  });

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
    { key: 'user', title: 'User', sortable: true },
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
    </div>
  );
}