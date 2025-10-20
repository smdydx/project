import { useState } from 'react';
import { 
  Eye, CheckCircle, XCircle, Shield, Mail, Phone, MapPin, Calendar, CreditCard
} from 'lucide-react';
import AdvancedRealtimeTable from '../common/AdvancedRealtimeTable';
import Card from '../common/Card';

export default function NewSignUp() {
  const generateNewSignups = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/api/v1/users/signups?limit=100`, { headers });
      if (!response.ok) throw new Error('Failed to fetch signups');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching signups:', error);
      return [];
    }
  };

  const columns = [
    { 
      key: 'id', 
      title: 'Signup ID', 
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">{value}</span>
      )
    },
    { 
      key: 'name', 
      title: 'User Details', 
      sortable: true,
      render: (value: string, row: any) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Mail className="w-3 h-3" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Phone className="w-3 h-3" />
            <span>{row.mobile}</span>
          </div>
        </div>
      )
    },
    {
      key: 'city',
      title: 'Location',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'accountType',
      title: 'Account Type',
      sortable: true,
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          value === 'Retailer' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'signupDate',
      title: 'Signup Date & Time',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{value}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.signupTime}</p>
        </div>
      )
    },
    {
      key: 'referredBy',
      title: 'Referred By',
      sortable: true,
      render: (value: string) => (
        <span className={`text-sm ${
          value === 'Direct' 
            ? 'text-gray-600 dark:text-gray-400'
            : 'text-purple-600 dark:text-purple-400 font-mono'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'deviceType',
      title: 'Device',
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
          <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200" title="Approve">
            <CheckCircle className="w-4 h-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200" title="Reject">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            New Sign Up
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review and approve new user registrations</p>
        </div>
      </div>

      <AdvancedRealtimeTable
        title="Live New Signups"
        columns={columns}
        data={[]}
        onDataUpdate={generateNewSignups}
        updateInterval={6000}
        searchPlaceholder="Search new signups..."
        showStats={true}
        enableAnimations={true}
      />
    </div>
  );
}