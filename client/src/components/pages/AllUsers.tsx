import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Eye, Ban, CheckCircle, MessageSquare, Phone, Mail, UserCheck, 
  Shield, Crown, Star, Filter, Download, Search, X, FileText, CreditCard, MapPin
} from 'lucide-react';
import AdvancedRealtimeTable from '../common/AdvancedRealtimeTable';
import Card from '../common/Card';

const userTypeOptionsForKyc = ['All', 'Verified', 'Partial Verified', 'Not Verified'];
const userTypeOptionsForUsers = ['All', 'Prime Member', 'Normal User'];

export default function AllUsers() {
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [, setLocation] = useLocation();
  const [data, setData] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const generateRealtimeUsers = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams();
      
      // Filter logic for All Users page
      if (userTypeFilter !== 'All') {
        if (userTypeFilter === 'Prime Member' && userTypeOptionsForUsers.includes('Prime Member')) {
          params.append('user_type', 'Prime User');
        } else if (userTypeFilter === 'Normal User' && userTypeOptionsForUsers.includes('Normal User')) {
          params.append('user_type', 'Normal User');
        }
      }
      
      if (verificationFilter !== 'All') {
        params.append('verification_status', verificationFilter);
      }
      params.append('limit', '100');

      const response = await fetch(`${API_URL}/api/v1/users/all?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');

      const fetchedData = await response.json();
      console.log('Fetched users data:', fetchedData);
      setData(fetchedData);
      return fetchedData;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRealtimeUsers();
  }, [userTypeFilter, verificationFilter]);

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
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-all"
            onClick={() => {
              setSelectedUserId(row.UserID);
              setShowUserModal(true);
            }}
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
      key: 'userType',
      title: 'User Type',
      sortable: true,
      render: (value: string) => getUserTypeBadge(value)
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
      key: 'verification_status',
      title: 'KYC Verification',
      sortable: true,
      render: (value: string, row: any) => {
        return (
          <div className="flex items-center space-x-2">
            {getVerificationBadge(value)}
            <button 
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200" 
              title="View Details"
              onClick={() => {
                setSelectedUserId(row.UserID);
                setShowUserModal(true);
              }}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        );
      }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">User Type</label>
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

          {/* Quick Search Filter */}
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

      {data.length > 0 ? (
        <AdvancedRealtimeTable
          title="Live Users List"
          columns={columns}
          data={data}
          onDataUpdate={generateRealtimeUsers}
          updateInterval={10000}
          searchPlaceholder="Search by name, email, or mobile..."
          showStats={true}
          enableAnimations={true}
        />
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No users found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        </Card>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUserId && (
        <UserDetailModal 
          userId={selectedUserId} 
          onClose={() => {
            setShowUserModal(false);
            setSelectedUserId(null);
          }} 
        />
      )}
    </div>
  );
}

// User Detail Modal Component
function UserDetailModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/v1/users/detail/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user details');
        const data = await response.json();
        setUserDetail(data);
      } catch (error) {
        console.error('Error fetching user detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!userDetail) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userDetail.fullname}</h2>
            <p className="text-gray-600 dark:text-gray-400">Member ID: {userDetail.member_id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Personal Info */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile</label>
                <p className="text-gray-900 dark:text-white font-medium mt-1 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-blue-500" />
                  {userDetail.MobileNumber}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-gray-900 dark:text-white font-medium mt-1 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-blue-500" />
                  {userDetail.Email || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Balance</label>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                  ₹{userDetail.INRWalletBalance?.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Aadhaar Details with Image */}
          {userDetail.aadhaar && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Aadhaar Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Aadhaar Number</label>
                    <p className="text-gray-900 dark:text-white font-mono mt-1">{userDetail.aadhaar.aadharNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{userDetail.aadhaar.dateOfBirth}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{userDetail.aadhaar.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1 flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-blue-500 mt-1 flex-shrink-0" />
                      <span>{`${userDetail.aadhaar.address.house}, ${userDetail.aadhaar.address.street}, ${userDetail.aadhaar.address.locality}, ${userDetail.aadhaar.address.district}, ${userDetail.aadhaar.address.state} - ${userDetail.aadhaar.address.pin}`}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Aadhaar Photo</label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={
                        userDetail.aadhaar.photo.startsWith('data:image') 
                          ? userDetail.aadhaar.photo 
                          : userDetail.aadhaar.photo.startsWith('http')
                          ? userDetail.aadhaar.photo
                          : `data:image/jpeg;base64,${userDetail.aadhaar.photo}`
                      }
                      alt="Aadhaar Photo" 
                      className="w-full h-64 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* PAN Details */}
          {userDetail.pan && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                PAN Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">PAN Number</label>
                    <p className="text-gray-900 dark:text-white font-mono mt-1">{userDetail.pan.pan_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">PAN Holder Name</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{userDetail.pan.pan_holder_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{userDetail.pan.category}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">PAN Card</label>
                  {userDetail.pan.pan_image ? (
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img 
                        src={
                          userDetail.pan.pan_image.startsWith('data:image') 
                            ? userDetail.pan.pan_image 
                            : userDetail.pan.pan_image.startsWith('http')
                            ? userDetail.pan.pan_image
                            : `data:image/jpeg;base64,${userDetail.pan.pan_image}`
                        }
                        alt="PAN Card" 
                        className="w-full h-64 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center h-64">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">PAN: {userDetail.pan.pan_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}