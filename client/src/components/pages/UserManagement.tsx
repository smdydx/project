import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Eye, Phone, Mail, UserCheck, Shield, Crown, Star, 
  Filter, Download, Search, X, FileText, CreditCard, MapPin
} from 'lucide-react';
import AdvancedRealtimeTable from '../common/AdvancedRealtimeTable';
import Card from '../common/Card';

const userTypeOptions = ['All', 'Prime', 'Normal'];
const kycStatusOptions = ['All', 'Verified', 'Partially Verified', 'Not Verified'];

export default function UserManagement() {
  const [, setLocation] = useLocation();
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [kycFilter, setKycFilter] = useState('All');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false); // State for Referral Chain Modal

  const fetchUsers = async () => {
    try {
      setLoading(true);
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
      params.append('limit', '500');

      const response = await fetch(`${API_URL}/api/v1/users/all?${params}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch users');

      const users = await response.json();

      // Apply KYC filter on frontend - FIXED LOGIC
      let filteredUsers = users;
      if (kycFilter !== 'All') {
        filteredUsers = users.filter((user: any) => {
          const aadhaarVerified = Boolean(user.aadhar_verification_status);
          const panVerified = Boolean(user.pan_verification_status);

          if (kycFilter === 'Verified') {
            return aadhaarVerified && panVerified;
          } else if (kycFilter === 'Partially Verified') {
            return (aadhaarVerified && !panVerified) || (!aadhaarVerified && panVerified);
          } else if (kycFilter === 'Not Verified') {
            return !aadhaarVerified && !panVerified;
          }
          return true;
        });
      }

      setData(filteredUsers);
      return filteredUsers; // Return data array for AdvancedRealtimeTable
    } catch (error) {
      console.error('Error fetching users:', error);
      setHasError(true);
      return []; // Return empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userTypeFilter, kycFilter]);

  const getKycStatus = (user: any): string => {
    const aadhaarVerified = Boolean(user.aadhar_verification_status);
    const panVerified = Boolean(user.pan_verification_status);

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
      render: (value: any, row: any) => {
        const aadhaarVerified = Boolean(row.aadhar_verification_status);
        const panVerified = Boolean(row.pan_verification_status);

        return getKycStatusBadge({ 
          aadhar_verification_status: aadhaarVerified, 
          pan_verification_status: panVerified 
        });
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: any) => (
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

// Referral Chain Modal Component
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

  const renderUserNode = (node: any, level: number = 0) => {
    const bgColors = [
      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
      'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
      'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700',
      'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700'
    ];
    const bgColor = bgColors[level % bgColors.length];

    return (
      <div key={`${node.UserID}-${level}`} className="mb-4">
        <div className={`border-2 rounded-lg p-4 ${bgColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                Level {node.level}: {node.fullname || `User ${node.UserID}`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member ID: {node.member_id || 'N/A'} | Mobile: {node.MobileNumber || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: {node.Email || 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${node.prime_status ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                {node.prime_status ? 'Prime' : 'Normal'}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Referrals: {node.referred_count || 0}
              </p>
            </div>
          </div>
        </div>
        {node.referred_users && node.referred_users.length > 0 && (
          <div className="ml-8 mt-2 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
            {node.referred_users.map((child: any, idx: number) => renderUserNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!referralData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Chain - {referralData.userName}</h2>
            <div className="flex gap-4 mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Referrals: <span className="font-bold text-purple-600">{referralData.totalReferrals}</span></p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Max Depth: <span className="font-bold text-blue-600">{referralData.maxDepth}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Referral Tree Structure</h3>
            <div className="space-y-2">
              {referralData.chain && referralData.chain.length > 0 ? (
                referralData.chain.map((node: any) => renderUserNode(node, 0))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No referral data available for this user.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}