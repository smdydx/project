import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Eye, Ban, CheckCircle, MessageSquare, Phone, Mail, UserCheck, 
  Shield, Crown, Star, Filter, Download, Search
} from 'lucide-react';
import AdvancedRealtimeTable from '../common/AdvancedRealtimeTable';
import Card from '../common/Card';

const userTypeOptions = ['All', 'Prime User', 'Normal User'];
const statusOptions = ['All', 'Active', 'Blocked'];

export default function AllUsers() {
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const generateRealtimeUsers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams();
      if (userTypeFilter !== 'All') {
        params.append('user_type', userTypeFilter);
      }
      if (statusFilter !== 'All') {
        params.append('status', statusFilter);
      }
      params.append('limit', '100');

      const response = await fetch(`${API_URL}/api/v1/users/all?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 shadow-lg";
    switch (status) {
      case 'Active':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white`}>
            <CheckCircle className="w-3 h-3" />
            <span>Active</span>
          </span>
        );
      case 'Blocked':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-red-500 to-pink-600 text-white`}>
            <Ban className="w-3 h-3" />
            <span>Blocked</span>
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-gray-500 text-white`}>{status}</span>;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 shadow-lg";
    if (userType === 'Prime User') {
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-purple-500 to-indigo-600 text-white`}>
          <Crown className="w-3 h-3" />
          <span>Prime</span>
        </span>
      );
    }
    return (
      <span className={`${baseClasses} bg-gradient-to-r from-blue-500 to-cyan-600 text-white`}>
        <Star className="w-3 h-3" />
        <span>Normal</span>
      </span>
    );
  };

  const columns = [
    { 
      key: 'UserID', 
      title: 'User ID', 
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{value}</span>
      )
    },
    { 
      key: 'fullname', 
      title: 'Full Name', 
      sortable: true,
      render: (value: string, row: any) => {
        const [, setLocation] = useLocation();
        return (
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-all"
            onClick={() => setLocation(`/user/${row.id}`)}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">
                {value.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{row.Email}</p>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'MobileNumber', 
      title: 'Mobile', 
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    { 
      key: 'member_id', 
      title: 'Member ID', 
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{value || 'N/A'}</span>
      )
    },
    { 
      key: 'introducer_id', 
      title: 'Referrer', 
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">{value || 'Direct'}</span>
      )
    },
    {
      key: 'INRWalletBalance',
      title: 'INR Balance',
      sortable: true,
      render: (value: number) => (
        <span className="font-bold text-green-600 dark:text-green-400">₹{value.toLocaleString()}</span>
      )
    },
    {
      key: 'RewardWalletBalance',
      title: 'Reward Balance',
      sortable: true,
      render: (value: number) => (
        <span className="font-bold text-purple-600 dark:text-purple-400">₹{value.toLocaleString()}</span>
      )
    },
    {
      key: 'DeviceVerified',
      title: 'Device',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          {value ? 'Verified' : 'Not Verified'}
        </span>
      )
    },
    {
      key: 'CreatedAt',
      title: 'Joined Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>
      )
    },
    {
      key: 'activation_status',
      title: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 shadow-lg ${value ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'}`}>
          {value ? <><CheckCircle className="w-3 h-3" /><span>Active</span></> : <><Ban className="w-3 h-3" /><span>Blocked</span></>}
        </span>
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
          <button className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200" title="Send SMS">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200" title="Send Email">
            <Mail className="w-4 h-4" />
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
            All Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all registered users</p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="btn-success text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <Card className="hover-lift">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">User Type Filter</label>
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            >
              {userTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quick Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      <AdvancedRealtimeTable
        title="Live Users List"
        columns={columns}
        data={[]}
        onDataUpdate={generateRealtimeUsers}
        updateInterval={10000}
        searchPlaceholder="Search by name, email, or mobile..."
        showStats={true}
        enableAnimations={true}
      />
    </div>
  );
}