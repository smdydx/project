import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Shield, FileText, Upload, Download, AlertTriangle, 
  UserCheck, Phone, Mail, CreditCard, MapPin, X, Eye
} from 'lucide-react';
import AdvancedRealtimeTable from '../common/AdvancedRealtimeTable';
import Card from '../common/Card';

const kycStatusOptions = ['All', 'Verified', 'Partially Verified', 'Not Verified'];

export default function KYCVerification() {
  const [kycStatusFilter, setKycStatusFilter] = useState('All');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  const generateKYCData = async () => {
    try {
      setHasError(false);
      const API_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000';
      const token = localStorage.getItem('lcrpay_auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const params = new URLSearchParams();
      if (kycStatusFilter && kycStatusFilter !== 'All') {
        params.append('kyc_status', kycStatusFilter);
      }
      
      const apiUrl = `${API_URL}/api/v1/kyc/verification?${params}`;
      console.log('🔍 Fetching KYC data from:', apiUrl);
      
      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        setHasError(true);
        throw new Error(`Failed to fetch KYC data: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ KYC Data received:', data);
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('❌ Expected array but got:', typeof data);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching KYC data:', error);
      setHasError(true);
      return [];
    }
  };

  const getKYCStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 shadow-lg";
    switch (status) {
      case 'Verified':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white`}>
            <CheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </span>
        );
      case 'Partially Verified':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-yellow-500 to-orange-600 text-white`}>
            <AlertTriangle className="w-3 h-3" />
            <span>Partially Verified</span>
          </span>
        );
      case 'Not Verified':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-red-500 to-pink-600 text-white`}>
            <XCircle className="w-3 h-3" />
            <span>Not Verified</span>
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-gray-500 text-white`}>{status}</span>;
    }
  };

  const handleViewDetails = (userId: number | null) => {
    if (userId !== null) {
      setSelectedUserId(userId);
      setShowUserModal(true);
    }
  };

  const columns = [
    { 
      key: 'id', 
      title: 'KYC ID', 
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">{value}</span>
      )
    },
    { 
      key: 'name', 
      title: 'User Details', 
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">
              {value ? value.split(' ').map(n => n[0]).join('') : 'U'}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value || 'Unknown'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.userId || 'N/A'}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'mobile', 
      title: 'Contact', 
      sortable: true,
      render: (value: string, row: any) => (
        <div className="space-y-1">
          <p className="text-sm font-mono">{value || 'N/A'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.email || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'documentType',
      title: 'Document Type',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{value || 'N/A'}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{row.documentNumber || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'kycStatus',
      title: 'Status',
      sortable: true,
      render: (value: string) => getKYCStatusBadge(value)
    },
    {
      key: 'submittedOn',
      title: 'Submitted On',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="space-y-1">
          <p className="text-sm">{value || 'N/A'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.submittedTime || ''}</p>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: any) => (
        <button 
          className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md" 
          title="View User Details"
          data-testid="button-view-user"
          onClick={(e) => {
            e.stopPropagation();
            const userId = row.userId ? parseInt(row.userId, 10) : null;
            handleViewDetails(userId);
          }}
        >
          View Details
        </button>
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
              generateKYCData();
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            KYC Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Verify and manage user KYC documents</p>
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
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Verification Status</label>
            <select
              value={kycStatusFilter}
              onChange={(e) => setKycStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            >
              {kycStatusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date Filter</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            />
          </div>
        </div>
      </Card>

      <AdvancedRealtimeTable
        title="Live KYC Verification Queue"
        columns={columns}
        data={[]}
        onDataUpdate={generateKYCData}
        updateInterval={5000}
        searchPlaceholder="Search by name, KYC ID, or document number..."
        showStats={true}
        enableAnimations={true}
        dataTestId="kyc-table"
      />

      {/* User Detail Modal */}
      {showUserModal && selectedUserId !== null && (
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
        const API_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000';
        const token = localStorage.getItem('lcrpay_auth_token');
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
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userDetail.fullname}</h2>
            <p className="text-gray-600 dark:text-gray-400">Member ID: {userDetail.member_id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" data-testid="button-close-modal">
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