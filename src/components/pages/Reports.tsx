import React, { useState } from 'react';
import { Download, FileText, BarChart3, Calendar } from 'lucide-react';
import Card from '../common/Card';

const reportTypes = [
  { id: 'daily', name: 'Daily Transaction Report', description: 'Complete transaction summary for selected date' },
  { id: 'biller', name: 'Biller Performance Report', description: 'Performance metrics by biller category' },
  { id: 'user', name: 'User Activity Report', description: 'User-wise transaction analysis' },
  { id: 'financial', name: 'Financial Reconciliation Report', description: 'Complete financial summary and reconciliation' },
  { id: 'complaints', name: 'Complaints Analysis Report', description: 'Complaint trends and resolution metrics' }
];

const formats = ['CSV', 'PDF', 'Excel'];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('daily');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [format, setFormat] = useState('CSV');

  const handleGenerateReport = () => {
    console.log('Generating report:', { selectedReport, dateRange, format });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-2">
          <Card title="Report Generation">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Report Type</label>
                <div className="space-y-3">
                  {reportTypes.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedReport === report.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          checked={selectedReport === report.id}
                          onChange={() => setSelectedReport(report.id)}
                          className="mt-1"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{report.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {formats.map(fmt => (
                    <option key={fmt} value={fmt}>{fmt}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateReport}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Generate & Download Report</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card title="Quick Analytics">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Peak Hour</p>
                    <p className="text-sm text-gray-600">2:00 PM - 3:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Top Biller</p>
                    <p className="text-sm text-gray-600">BSES Rajdhani</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">Success Rate</p>
                    <p className="text-sm text-gray-600">94.2% Today</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Recent Downloads">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Daily Report</p>
                  <p className="text-xs text-gray-500">Feb 20, 2024</p>
                </div>
                <span className="text-xs text-blue-600 font-medium">CSV</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">User Activity</p>
                  <p className="text-xs text-gray-500">Feb 19, 2024</p>
                </div>
                <span className="text-xs text-green-600 font-medium">PDF</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}