import React, { useState } from 'react';
import { 
  Eye, Ban, CheckCircle, MessageSquare, Phone, Mail, UserCheck, 
  Shield, Crown, Star, Zap, AlertTriangle, Clock, Edit, Trash2,
  Filter, Download, Plus, Search
} from 'lucide-react';
import AdvancedRealtimeTable from '../common/AdvancedRealtimeTable';
import Card from '../common/Card';
import { mockUsers } from '../../data/mockData';

const roleOptions = ['All', 'Retailer', 'Distributor', 'Admin'];
const userTypeOptions = ['All', 'Normal', 'Prime'];
const kycStatusOptions = ['All', 'Verified', 'Pending', 'Reject'];

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<'all' | 'deactivated' | 'kyc'>('all');
  const [roleFilter, setRoleFilter] = useState('All');
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [kycFilter, setKycFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactType, setContactType] = useState<'sms' | 'email'>('sms');
  const [showBulkActions, setShowBulkActions] = useState(false);

  const filteredUsers = mockUsers.filter(user => {
    // Tab-based filtering
    if (activeTab === 'deactivated') {
      if (user.status !== 'Deactivated') return false;
    } else if (activeTab === 'kyc') {
      // KYC tab - filter by kycStatus
      if (kycFilter !== 'All' && user.kycStatus !== kycFilter) return false;
    } else {
      // All Users tab
      if (user.status === 'Deactivated') return false;
      if (userTypeFilter !== 'All' && user.userType !== userTypeFilter) return false;
    }
    
    // Common filters
    const roleMatch = roleFilter === 'All' || user.role === roleFilter;
    return roleMatch;
  });

  const generateRealtimeUsers = () => {
    const statuses = ['Active', 'Blocked'];
    const roles = ['Retailer', 'Distributor', 'Admin'];
    const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Arjun Singh', 'Kavya Nair', 'Rohit Gupta', 'Anita Desai'];
    
    return Array.from({ length: 15 }, (_, i) => ({
      id: `USR${Math.floor(Math.random() * 10000)}`,
      name: names[Math.floor(Math.random() * names.length)],
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      mobile: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      joinedOn: new Date().toLocaleDateString()
    }));
  };

  const getAdvancedStatusBadge = (status: string) => {
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
      case 'Deactivated':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-gray-500 to-gray-600 text-white`}>
            <AlertTriangle className="w-3 h-3" />
            <span>Deactivated</span>
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-gray-500 text-white`}>{status}</span>;
    }
  };

  const getUserTypeBadge = (userType?: string) => {
    if (!userType) return null;
    const baseClasses = "px-2 py-1 rounded-full text-xs font-bold";
    switch (userType) {
      case 'Prime':
        return <span className={`${baseClasses} bg-gradient-to-r from-yellow-400 to-orange-500 text-white`}>⭐ Prime</span>;
      case 'Normal':
        return <span className={`${baseClasses} bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200`}>Normal</span>;
      default:
        return null;
    }
  };

  const getKycBadge = (kycStatus?: string) => {
    if (!kycStatus) return null;
    const baseClasses = "px-2 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1";
    switch (kycStatus) {
      case 'Verified':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-green-500 to-teal-600 text-white`}>
            <CheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </span>
        );
      case 'Pending':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-yellow-500 to-orange-500 text-white`}>
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'Reject':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-red-500 to-pink-600 text-white`}>
            <Ban className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getAdvancedRoleBadge = (role: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 shadow-lg";
    switch (role) {
      case 'Admin':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-purple-500 to-indigo-600 text-white`}>
            <Crown className="w-3 h-3" />
            <span>Admin</span>
          </span>
        );
      case 'Distributor':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-blue-500 to-cyan-600 text-white`}>
            <Star className="w-3 h-3" />
            <span>Distributor</span>
          </span>
        );
      case 'Retailer':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-green-500 to-teal-600 text-white`}>
            <Shield className="w-3 h-3" />
            <span>Retailer</span>
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-gray-500 text-white`}>{role}</span>;
    }
  };

  const handleUserAction = (user: any, action: 'block' | 'unblock') => {
    console.log(`${action} user:`, user);
    alert(`User ${user.name} has been ${action}ed successfully!`);
  };

  const handleContactUser = (user: any, type: 'sms' | 'email') => {
    setSelectedUser(user);
    setContactType(type);
    setShowContactModal(true);
  };

  const columns = [
    { 
      key: 'id', 
      title: 'User ID', 
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{value}</span>
      )
    },
    { 
      key: 'name', 
      title: 'Name', 
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
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'mobile', 
      title: 'Mobile', 
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => getAdvancedStatusBadge(value)
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (value: string) => getAdvancedRoleBadge(value)
    },
    {
      key: 'userType',
      title: 'User Type',
      sortable: true,
      render: (value: string) => getUserTypeBadge(value)
    },
    {
      key: 'kycStatus',
      title: 'KYC Status',
      sortable: true,
      render: (value: string) => getKycBadge(value)
    },
    { 
      key: 'joinedOn', 
      title: 'Joined', 
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          <p className="text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3 inline mr-1" />
            {Math.floor(Math.random() * 30)} days ago
          </p>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => handleContactUser(row, 'sms')}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title="Send SMS"
          >
            <Phone className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => handleContactUser(row, 'email')}
            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title="Send Email"
          >
            <Mail className="w-4 h-4" />
          </button>
          
          <button 
            className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            title="Send Notification"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          
          {row.status === 'Active' ? (
            <button 
              onClick={() => handleUserAction(row, 'block')}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
              title="Block User"
            >
              <Ban className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={() => handleUserAction(row, 'unblock')}
              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 hover:scale-110"
              title="Unblock User"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and monitor user accounts</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{mockUsers.length}</p>
              <p className="text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{mockUsers.filter(u => u.status === 'Active').length}</p>
              <p className="text-gray-500 dark:text-gray-400">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{mockUsers.filter(u => u.status === 'Blocked').length}</p>
              <p className="text-gray-500 dark:text-gray-400">Blocked</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button className="btn-success text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="btn-primary text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Bulk Actions</span>
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            data-testid="tab-all-users"
          >
            All Users
          </button>
          <button
            onClick={() => setActiveTab('deactivated')}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-all duration-200 ${
              activeTab === 'deactivated'
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            data-testid="tab-deactivated"
          >
            Deactivated
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-all duration-200 ${
              activeTab === 'kyc'
                ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            data-testid="tab-kyc-verify"
          >
            KYC Verify
          </button>
        </div>

        {/* Filters Section */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Role Filter</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                data-testid="filter-role"
              >
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {activeTab === 'all' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">User Type</label>
                <select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  data-testid="filter-user-type"
                >
                  {userTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">KYC Status</label>
                <select
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  data-testid="filter-kyc-status"
                >
                  {kycStatusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 animate-slide-in-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bulk Actions</h3>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn-success text-white px-4 py-2 rounded-lg font-medium">
                Send Bulk SMS
              </button>
              <button className="btn-primary text-white px-4 py-2 rounded-lg font-medium">
                Send Bulk Email
              </button>
              <button className="btn-danger text-white px-4 py-2 rounded-lg font-medium">
                Bulk Block
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Real-time User Table */}
      <AdvancedRealtimeTable
        title="Live User Management"
        columns={columns}
        data={filteredUsers}
        onDataUpdate={generateRealtimeUsers}
        updateInterval={8000}
        searchPlaceholder="Search by name, email, or mobile..."
        showStats={true}
        enableAnimations={true}
      />

      {/* Enhanced Contact Modal */}
      {showContactModal && selectedUser && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in-scale border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                contactType === 'sms' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600'
              }`}>
                {contactType === 'sms' ? (
                  <Phone className="w-6 h-6 text-white" />
                ) : (
                  <Mail className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Send {contactType === 'sms' ? 'SMS' : 'Email'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">to {selectedUser.name}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {contactType === 'sms' ? 'Mobile Number' : 'Email Address'}
                </label>
                <input
                  type="text"
                  value={contactType === 'sms' ? selectedUser.mobile : selectedUser.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              {contactType === 'email' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Enter email subject"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea
                  rows={4}
                  placeholder={`Enter your ${contactType === 'sms' ? 'SMS' : 'email'} message here...`}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm resize-none"
                ></textarea>
              </div>
              
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="urgent-contact" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <label htmlFor="urgent-contact" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <AlertTriangle className="w-4 h-4 inline mr-1 text-yellow-500" />
                  Mark as urgent
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  alert(`${contactType === 'sms' ? 'SMS' : 'Email'} sent to ${selectedUser.name} successfully!`);
                }}
                className={`px-8 py-3 rounded-xl font-bold shadow-lg text-white ${
                  contactType === 'sms' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
                } transition-all duration-200`}
              >
                Send {contactType === 'sms' ? 'SMS' : 'Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}