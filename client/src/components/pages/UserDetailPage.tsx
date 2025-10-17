
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  ArrowLeft, User, Phone, Mail, Calendar, MapPin, CreditCard, 
  Wallet, TrendingUp, FileText, CheckCircle, XCircle, Clock,
  Shield, Crown, AlertTriangle, Download, Edit, Ban
} from 'lucide-react';
import Card from '../common/Card';

interface UserDetail {
  // Basic Info
  UserID: number;
  fullname: string;
  MobileNumber: string;
  Email: string;
  member_id: string;
  introducer_id: string;
  
  // Wallet & Balance
  INRWalletBalance: number;
  RewardWalletBalance: number;
  total_packages: number;
  
  // Status
  activation_status: boolean;
  prime_status: boolean;
  DeviceVerified: boolean;
  IsKYCCompleted: boolean;
  
  // Verification Status
  aadhar_verification_status: boolean;
  pan_verification_status: boolean;
  email_verification_status: boolean;
  
  // Dates
  CreatedAt: string;
  prime_activation_date: string;
  
  // Aadhaar Details
  aadhaar?: {
    name: string;
    aadharNumber: string;
    maskedNumber: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    photo: string;
    address: {
      house: string;
      street: string;
      locality: string;
      district: string;
      state: string;
      pin: string;
      country: string;
    };
  };
  
  // PAN Details
  pan?: {
    pan_number: string;
    pan_holder_name: string;
    status: string;
    category: string;
    date_of_issue: string;
  };
  
  // Transaction Summary
  totalTransactions: number;
  totalRecharges: number;
  totalWithdrawals: number;
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.userId;
  const [, setLocation] = useLocation();
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/v1/users/detail/${userId}`);
      
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const data = await response.json();
      setUserDetail(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !userDetail) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading User</h2>
          <p className="text-gray-600 dark:text-gray-400">{error || 'User not found'}</p>
          <button 
            onClick={() => setLocation('/users/all')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: boolean, trueLabel: string, falseLabel: string) => {
    return status ? (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white inline-flex items-center">
        <CheckCircle className="w-3 h-3 mr-1" />
        {trueLabel}
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-pink-600 text-white inline-flex items-center">
        <XCircle className="w-3 h-3 mr-1" />
        {falseLabel}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setLocation('/users/all')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{userDetail.fullname}</h1>
            <p className="text-gray-600 dark:text-gray-400">Member ID: {userDetail.member_id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium flex items-center space-x-2">
            <Ban className="w-4 h-4" />
            <span>Block</span>
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Account Status</p>
              <p className="text-2xl font-bold mt-1">
                {userDetail.activation_status ? 'Active' : 'Inactive'}
              </p>
            </div>
            <User className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">User Type</p>
              <p className="text-2xl font-bold mt-1 flex items-center">
                {userDetail.prime_status && <Crown className="w-6 h-6 mr-2" />}
                {userDetail.prime_status ? 'Prime' : 'Normal'}
              </p>
            </div>
            <Shield className="w-12 h-12 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Wallet Balance</p>
              <p className="text-2xl font-bold mt-1">₹{userDetail.INRWalletBalance.toLocaleString()}</p>
            </div>
            <Wallet className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold mt-1">{userDetail.totalTransactions}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-200" />
          </div>
        </Card>
      </div>

      {/* Personal Information */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
            <p className="text-gray-900 dark:text-white font-medium mt-1">{userDetail.fullname}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile Number</label>
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
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Member ID</label>
            <p className="text-gray-900 dark:text-white font-mono mt-1">{userDetail.member_id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Referrer ID</label>
            <p className="text-gray-900 dark:text-white font-mono mt-1">{userDetail.introducer_id || 'Direct'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined Date</label>
            <p className="text-gray-900 dark:text-white font-medium mt-1 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              {new Date(userDetail.CreatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Verification Status */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Verification Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">KYC Status</label>
            {getStatusBadge(userDetail.IsKYCCompleted, 'Completed', 'Pending')}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Aadhaar</label>
            {getStatusBadge(userDetail.aadhar_verification_status, 'Verified', 'Not Verified')}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">PAN</label>
            {getStatusBadge(userDetail.pan_verification_status, 'Verified', 'Not Verified')}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Email</label>
            {getStatusBadge(userDetail.email_verification_status, 'Verified', 'Not Verified')}
          </div>
        </div>
      </Card>

      {/* Aadhaar Details */}
      {userDetail.aadhaar && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Aadhaar Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
              <p className="text-gray-900 dark:text-white font-medium mt-1 flex items-start">
                <MapPin className="w-4 h-4 mr-2 text-blue-500 mt-1" />
                {`${userDetail.aadhaar.address.house}, ${userDetail.aadhaar.address.street}, ${userDetail.aadhaar.address.locality}, ${userDetail.aadhaar.address.district}, ${userDetail.aadhaar.address.state} - ${userDetail.aadhaar.address.pin}`}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* PAN Details */}
      {userDetail.pan && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            PAN Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </Card>
      )}

      {/* Wallet & Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Wallet Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">INR Wallet</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">₹{userDetail.INRWalletBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Reward Wallet</span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">₹{userDetail.RewardWalletBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Total Packages</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{userDetail.total_packages.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Transaction Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Total Transactions</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{userDetail.totalTransactions}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Total Recharges</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{userDetail.totalRecharges || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Total Withdrawals</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{userDetail.totalWithdrawals || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
