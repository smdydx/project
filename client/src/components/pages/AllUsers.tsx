import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Eye, Ban, CheckCircle, MessageSquare, Phone, Mail, UserCheck, 
  Shield, Crown, Star, Filter, Download, Search, X, FileText, CreditCard, MapPin
} from 'lucide-react';
import AdvancedRealtimeTable from '../common/AdvancedRealtimeTable';
import Card from '../common/Card';

const userTypeOptionsForUsers = ['All', 'Prime', 'Normal'];

export default function AllUsers() {
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [, setLocation] = useLocation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const generateRealtimeUsers = async () => {
    try {
      setLoading(true);
      setHasError(false);
      // Use environment variable for backend URL
      const API_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000';
      const params = new URLSearchParams();

      // Filter logic for All Users page
      if (userTypeFilter !== 'All') {
        params.append('user_type', userTypeFilter);
      }
      params.append('limit', '100');

      // Get JWT token from localStorage
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 All Users: Authorization header added');
      }

      console.log('🔍 Fetching users from:', `${API_URL}/api/v1/users/all?${params}`);
      const response = await fetch(`${API_URL}/api/v1/users/all?${params}`, {
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        setHasError(true);
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
      }

      const fetchedData = await response.json();
      console.log('✅ Fetched real users from database:', fetchedData.length, 'users');
      console.log('📊 Sample user data:', fetchedData[0]);
      setData(fetchedData);
      return fetchedData;
    } catch (error) {
      console.error('❌ Error fetching all users:', error);
      setHasError(true);
      // Show empty array if error
      setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRealtimeUsers();
  }, [userTypeFilter]);

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
    if (userType === 'Prime' || userType === 'Prime User') {
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

  const getVerificationBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 shadow-lg";
    switch (status) {
      case 'Verified':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white`}>
            <Shield className="w-3 h-3" />
            <span>Verified</span>
          </span>
        );
      case 'Partial Verified':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-yellow-500 to-orange-600 text-white`}>
            <Shield className="w-3 h-3" />
            <span>Partial</span>
          </span>
        );
      case 'Not Verified':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-red-500 to-pink-600 text-white`}>
            <Ban className="w-3 h-3" />
            <span>Not Verified</span>
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-gray-500 text-white`}>{status}</span>;
    }
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
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">
                {value.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{value}</p>
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
      key: 'userType',
      title: 'User Type',
      sortable: true,
      render: (value: string) => getUserTypeBadge(value)
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
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200" 
            title="Send SMS"
            onClick={() => { /* SMS functionality */ }}
          >
            <Phone className="w-4 h-4" />
          </button>
          <button 
            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200" 
            title="Send Email"
            onClick={() => { /* Email functionality */ }}
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center max-w-md">
          <img 
            src="/attached_assets/server-error.jpg" 
            alt="Server Error" 
            className="w-64 h-64 mx-auto mb-6 object-contain"
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Server Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Please wait, our backend team is handling the error.
          </p>
          <button 
            onClick={() => {
              setHasError(false);
              generateRealtimeUsers();
            }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            All Users
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">View and manage all registered users</p>
        </div>

        
      </div>

      <Card className="hover-lift">
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">User Type Filter</label>
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              data-testid="filter-user-type"
            >
              {userTypeOptionsForUsers.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {data.length > 0 ? (
        <AdvancedRealtimeTable
          title="Live Users List"
          columns={columns}
          data={data}
          onDataUpdate={generateRealtimeUsers}
          updateInterval={30000}
          searchPlaceholder="Search by name, email, or mobile..."
          showStats={true}
          enableAnimations={false}
        />
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No users found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        </Card>
      )}
    </div>
  );
}