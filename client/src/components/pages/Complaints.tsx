import React, { useState } from 'react';
import { UserCheck, Eye } from 'lucide-react';
import DataTable from '../common/DataTable';
import Card from '../common/Card';
import { mockComplaints } from '../../data/mockData';

const tabs = ['All', 'Open', 'Resolved', 'Escalated'];
const issueTypes = ['All', 'Payment Failed', 'Wrong Amount', 'Refund Request', 'Account Issue', 'Others'];

export default function Complaints() {
  const [activeTab, setActiveTab] = useState('All');
  const [issueTypeFilter, setIssueTypeFilter] = useState('All');

  const filteredComplaints = mockComplaints.filter(complaint => {
    const statusMatch = activeTab === 'All' || complaint.status === activeTab;
    const issueMatch = issueTypeFilter === 'All' || complaint.issueType === issueTypeFilter;
    return statusMatch && issueMatch;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'Open':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Resolved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Escalated':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const columns = [
    { key: 'id', title: 'Complaint ID', sortable: true },
    { key: 'user', title: 'User', sortable: true },
    { key: 'txnId', title: 'Txn ID', sortable: true },
    { key: 'issueType', title: 'Issue Type', sortable: true },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={getStatusBadge(value)}>{value}</span>
      )
    },
    { key: 'submittedOn', title: 'Submitted On', sortable: true },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'Open' && (
            <button className="p-1 text-green-600 hover:bg-green-50 rounded">
              <UserCheck className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Complaints Management</h1>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <UserCheck className="w-5 h-5" />
          <span>Assign to Support Team</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
              <select
                value={issueTypeFilter}
                onChange={(e) => setIssueTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {issueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={filteredComplaints}
        searchPlaceholder="Search by complaint ID, user, or transaction ID..."
      />
    </div>
  );
}