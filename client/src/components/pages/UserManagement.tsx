import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Phone, Mail, UserCheck, Shield, Crown, Star, 
  X, FileText, CreditCard, MapPin,
  Users, TrendingUp, GitBranch, Award, Sparkles
} from 'lucide-react';
import AdvancedRealtimeTable from '../common/AdvancedRealtimeTable';
import Card from '../common/Card';

const userTypeOptions = ['All', 'Prime', 'Normal'];
const kycStatusOptions = ['All', 'Verified', 'Partially Verified', 'Not Verified'];

// Shared helper to normalize KYC field values
const isKycFieldVerified = (fieldValue: any): boolean => {
  // Explicit null/undefined check
  if (fieldValue === null || fieldValue === undefined) {
    console.log('❌ Field is null/undefined');
    return false;
  }
  
  // Boolean check
  if (typeof fieldValue === 'boolean') {
    console.log('✅ Boolean value:', fieldValue);
    return fieldValue;
  }
  
  // Number check (1 = verified, 0 = not verified)
  if (typeof fieldValue === 'number') {
    console.log('✅ Number value:', fieldValue);
    return fieldValue === 1;
  }
  
  // String check
  if (typeof fieldValue === 'string') {
    const normalized = fieldValue.toLowerCase().trim();
    const isVerified = normalized === 'true' || normalized === 'verified' || normalized === '1';
    console.log('✅ String value:', fieldValue, '-> verified:', isVerified);
    return isVerified;
  }
  
  console.log('❌ Unknown type:', typeof fieldValue, fieldValue);
  return false;
};

export default function UserManagement() {
  const [, setLocation] = useLocation();
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [kycFilter, setKycFilter] = useState('All');
  const [data, setData] = useState<any[]>([]);
  const [hasError, setHasError] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setHasError(false);
      const API_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000';
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const params = new URLSearchParams();
      if (userTypeFilter !== 'All') {
        params.append('user_type', userTypeFilter);
      }
      
      // Add KYC filter to API call
      if (kycFilter !== 'All') {
        params.append('kyc_status', kycFilter);
      }
      
      params.append('limit', '500');

      const response = await fetch(`${API_URL}/api/v1/users/all?${params}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch users');

      const users = await response.json();
      
      console.log('📊 Users received from API:', users.length);
      console.log('✅ Backend KYC Filter Applied:', { 
        totalUsers: users.length, 
        filter: kycFilter,
        filterActive: kycFilter !== 'All'
      });

      setData(users);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      setHasError(true);
      return [];
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userTypeFilter, kycFilter]);

  const getKycStatus = (user: any): string => {
    const aadhaarVerified = isKycFieldVerified(user.aadhar_verification_status);
    const panVerified = isKycFieldVerified(user.pan_verification_status);

    if (aadhaarVerified && panVerified) {
      return 'Verified';
    } else if (aadhaarVerified || panVerified) {
      return 'Partially Verified';
    } else {
      return 'Not Verified';
    }
  };

  const getKycStatusBadge = (user: any) => {
    const status = getKycStatus(user);
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 shadow-lg";

    if (status === 'Verified') {
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white`}>
          <Shield className="w-3 h-3" />
          <span>Verified</span>
        </span>
      );
    } else if (status === 'Partially Verified') {
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-yellow-500 to-orange-600 text-white`}>
          <Shield className="w-3 h-3" />
          <span>Partial</span>
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-red-500 to-pink-600 text-white`}>
          <X className="w-3 h-3" />
          <span>Not Verified</span>
        </span>
      );
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 shadow-lg";
    if (userType === 'Prime') {
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
      render: (value: string, row: any) => (
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
      )
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
      key: 'userType',
      title: 'User Type',
      sortable: true,
      render: (value: string) => getUserTypeBadge(value)
    },
    {
      key: 'aadhar_verification_status',
      title: 'KYC Status',
      sortable: true,
      render: (_value: any, row: any) => {
        return getKycStatusBadge(row);
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_value: any, row: any) => (
        <div className="flex gap-2">
          <button 
            className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md" 
            title="View User Details"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUserId(row.UserID);
              setShowUserModal(true);
            }}
          >
            View More
          </button>
          <button 
            className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md" 
            title="View Referral Chain"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUserId(row.UserID);
              setShowReferralModal(true);
            }}
          >
            Referral Chain
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Server Error</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Please wait, our backend team is handling the error.</p>
          <button 
            onClick={() => {
              setHasError(false);
              fetchUsers();
            }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all users with integrated KYC verification</p>
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
            >
              {userTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">KYC Status</label>
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            >
              {kycStatusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <AdvancedRealtimeTable
        title="All Users"
        columns={columns}
        data={data}
        onDataUpdate={fetchUsers}
        updateInterval={30000}
        searchPlaceholder="Search by name, email, mobile, or member ID..."
        showStats={true}
        enableAnimations={true}
        onRowClick={(row) => {
          console.log('Row clicked:', row);
          setLocation(`/transactions?userId=${row.UserID}&name=${encodeURIComponent(row.fullname)}&mobile=${row.MobileNumber}`);
        }}
      />

      {showUserModal && selectedUserId !== null && (
        <UserDetailModal 
          userId={selectedUserId} 
          onClose={() => {
            setShowUserModal(false);
            setSelectedUserId(null);
          }} 
        />
      )}

      {showReferralModal && selectedUserId !== null && (
        <ReferralChainModal 
          userId={selectedUserId}
          onClose={() => {
            setShowReferralModal(false);
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
        const API_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000';
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}/api/v1/users/detail/${userId}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch user details');
        const data = await response.json();
        setUserDetail(data);
      } catch (error) {
        console.error('Error fetching user detail:', error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchUserDetail();
    }
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
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userDetail.fullname}</h2>
            <p className="text-gray-600 dark:text-gray-400">Member ID: {userDetail.member_id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </Card>

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

// Referral Chain Modal Component - PROFESSIONAL REDESIGN
function ReferralChainModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralChain = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000';
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}/api/v1/users/${userId}/referral-chain`, { headers });
        if (!response.ok) throw new Error('Failed to fetch referral chain');
        const data = await response.json();
        setReferralData(data);
      } catch (error) {
        console.error('Error fetching referral chain:', error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchReferralChain();
    }
  }, [userId]);

  const getLevelIcon = (level: number) => {
    const icons = [
      <Crown className="w-5 h-5" />,
      <Award className="w-5 h-5" />,
      <Star className="w-5 h-5" />,
      <Sparkles className="w-5 h-5" />,
      <Users className="w-5 h-5" />
    ];
    return icons[Math.min(level, icons.length - 1)];
  };

  const getLevelGradient = (level: number) => {
    const gradients = [
      'from-purple-500 to-pink-600',
      'from-blue-500 to-cyan-600',
      'from-green-500 to-emerald-600',
      'from-orange-500 to-amber-600',
      'from-indigo-500 to-purple-600'
    ];
    return gradients[level % gradients.length];
  };

  const renderUserNode = (node: any, level: number = 0) => {
    const gradient = getLevelGradient(level);
    const hasChildren = node.referred_users && node.referred_users.length > 0;

    return (
      <div key={`${node.UserID}-${level}`} className="relative">
        {/* Modern Card Design */}
        <div className="mb-4">
          <div className={`bg-gradient-to-br ${gradient} p-[2px] rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5">
              <div className="flex items-start gap-4">
                {/* Level Icon */}
                <div className={`bg-gradient-to-br ${gradient} p-3 rounded-lg text-white shadow-lg flex-shrink-0`}>
                  {getLevelIcon(level)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {node.fullname || `User ${node.UserID}`}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                      node.prime_status 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                    }`}>
                      {node.prime_status ? '👑 Prime' : '⭐ Normal'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">ID:</span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">{node.member_id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Mobile:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{node.MobileNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm md:col-span-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="font-medium text-gray-900 dark:text-white truncate">{node.Email || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className={`bg-gradient-to-r ${gradient} p-2 rounded-lg`}>
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{node.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`bg-gradient-to-r ${gradient} p-2 rounded-lg`}>
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Direct Referrals</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{node.referred_count || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Children with Visual Tree Structure */}
        {hasChildren && (
          <div className="relative ml-8 pl-6 border-l-4 border-gray-300 dark:border-gray-600">
            <div className="absolute -left-[2px] top-0 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full"></div>
            {node.referred_users.map((child: any, idx: number) => (
              <div key={`child-${child.UserID}-${idx}`} className="relative">
                <div className="absolute -left-6 top-8 w-6 h-0.5 bg-gradient-to-r from-purple-500 to-transparent"></div>
                {renderUserNode(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Loading Referral Chain...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!referralData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with Gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-6 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <GitBranch className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Referral Network</h2>
                  <p className="text-purple-100">{referralData.userName}</p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-xs text-purple-100">Total Referrals</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{referralData.totalReferrals}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="text-xs text-purple-100">Network Depth</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{referralData.maxDepth}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-white" />
                    <span className="text-xs text-purple-100">Network Status</span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {referralData.totalReferrals > 50 ? '🔥 Elite' : referralData.totalReferrals > 20 ? '⭐ Advanced' : '🌱 Growing'}
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 flex-shrink-0"
              data-testid="button-close-referral"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Network Tree Visualization</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Explore the complete referral hierarchy and network structure
            </p>
          </div>
          
          <div className="space-y-2">
            {referralData.chain && referralData.chain.length > 0 ? (
              referralData.chain.map((node: any) => renderUserNode(node, 0))
            ) : (
              <div className="text-center py-16">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Referrals Yet</h4>
                <p className="text-gray-500 dark:text-gray-400">
                  This user hasn't referred anyone to the network yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}