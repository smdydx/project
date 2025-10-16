
import React, { useState } from 'react';
import { 
  Eye, CheckCircle, XCircle, Shield, FileText, Upload, Download, AlertTriangle
} from 'lucide-react';
import AdvancedRealtimeTable from '../common/AdvancedRealtimeTable';
import Card from '../common/Card';

const kycStatusOptions = ['All', 'Pending', 'Verified', 'Rejected'];

export default function KYCVerification() {
  const [kycStatusFilter, setKycStatusFilter] = useState('All');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const generateKYCData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams();
      if (kycStatusFilter !== 'All') {
        params.append('status', kycStatusFilter.toLowerCase());
      }
      
      const response = await fetch(`${API_URL}/api/v1/kyc/verification?${params}`);
      if (!response.ok) throw new Error('Failed to fetch KYC data');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching KYC data:', error);
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
      case 'Pending':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-yellow-500 to-orange-600 text-white`}>
            <AlertTriangle className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-red-500 to-pink-600 text-white`}>
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-gray-500 text-white`}>{status}</span>;
    }
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
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
              {value.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.userId}</p>
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
          <p className="text-sm font-mono">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.email}</p>
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
            <span className="text-sm font-medium">{value}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{row.documentNumber}</p>
        </div>
      )
    },
    {
      key: 'submittedOn',
      title: 'Submitted On',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="space-y-1">
          <p className="text-sm">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.submittedTime}</p>
        </div>
      )
    },
    {
      key: 'kycStatus',
      title: 'KYC Status',
      sortable: true,
      render: (value: string) => getKYCStatusBadge(value)
    },
    {
      key: 'verifiedBy',
      title: 'Verified By',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {value || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleViewDetails(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200" 
            title="View Documents"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.kycStatus === 'Pending' && (
            <>
              <button className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200" title="Approve KYC">
                <CheckCircle className="w-4 h-4" />
              </button>
              <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200" title="Reject KYC">
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200" title="Download Documents">
            <Download className="w-4 h-4" />
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
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">KYC Status Filter</label>
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
        updateInterval={10000}
        searchPlaceholder="Search by name, KYC ID, or document number..."
        showStats={true}
        enableAnimations={true}
      />

      {/* KYC Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl animate-fade-in-scale border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">KYC Document Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">User Name</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">User ID</label>
                  <p className="mt-1 font-mono text-gray-900 dark:text-white">{selectedUser.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Document Type</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedUser.documentType}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Document Number</label>
                  <p className="mt-1 font-mono text-gray-900 dark:text-white">{selectedUser.documentNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Status</label>
                  <div className="mt-1">{getKYCStatusBadge(selectedUser.kycStatus)}</div>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Submitted On</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedUser.submittedOn} {selectedUser.submittedTime}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Document Images</label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Front Side</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Back Side</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200"
                >
                  Close
                </button>
                <button className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200">
                  Reject
                </button>
                <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200">
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
