import React, { useState } from 'react';
import { Save, Key, Wallet, Shield, Bell } from 'lucide-react';
import Card from '../common/Card';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('api');

  const sections = [
    { id: 'api', label: 'API Credentials', icon: Key },
    { id: 'payout', label: 'Payout Configuration', icon: Wallet },
    { id: 'permissions', label: 'Role Permissions', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeSection === 'api' && (
            <Card title="BBPS API Credentials">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <input
                      type="password"
                      value="••••••••••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                    <input
                      type="password"
                      value="••••••••••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://your-domain.com/webhook"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Enable sandbox mode</span>
                  </label>
                </div>

                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Save className="w-4 h-4" />
                  <span>Save API Settings</span>
                </button>
              </div>
            </Card>
          )}

          {activeSection === 'payout' && (
            <Card title="Payout Configuration">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="2.50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Payout Amount</label>
                    <input
                      type="number"
                      placeholder="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payout Schedule</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Auto-payout enabled</span>
                  </label>
                </div>

                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Save className="w-4 h-4" />
                  <span>Save Payout Settings</span>
                </button>
              </div>
            </Card>
          )}

          {activeSection === 'permissions' && (
            <Card title="Role Permissions">
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-900">Permission</th>
                        <th className="text-center py-2 font-medium text-gray-900">Admin</th>
                        <th className="text-center py-2 font-medium text-gray-900">Distributor</th>
                        <th className="text-center py-2 font-medium text-gray-900">Retailer</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      <tr className="border-b border-gray-100">
                        <td className="py-3 text-sm text-gray-700">View Dashboard</td>
                        <td className="text-center"><input type="checkbox" checked disabled className="rounded" /></td>
                        <td className="text-center"><input type="checkbox" checked className="rounded" /></td>
                        <td className="text-center"><input type="checkbox" checked className="rounded" /></td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 text-sm text-gray-700">Manage Billers</td>
                        <td className="text-center"><input type="checkbox" checked disabled className="rounded" /></td>
                        <td className="text-center"><input type="checkbox" className="rounded" /></td>
                        <td className="text-center"><input type="checkbox" disabled className="rounded" /></td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 text-sm text-gray-700">Process Transactions</td>
                        <td className="text-center"><input type="checkbox" checked disabled className="rounded" /></td>
                        <td className="text-center"><input type="checkbox" checked className="rounded" /></td>
                        <td className="text-center"><input type="checkbox" checked className="rounded" /></td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 text-sm text-gray-700">Generate Reports</td>
                        <td className="text-center"><input type="checkbox" checked disabled className="rounded" /></td>
                        <td className="text-center"><input type="checkbox" checked className="rounded" /></td>
                        <td className="text-center"><input type="checkbox" className="rounded" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Save className="w-4 h-4" />
                  <span>Save Permissions</span>
                </button>
              </div>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card title="Notification Preferences">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Transaction Alerts</h3>
                      <p className="text-sm text-gray-600">Get notified about transaction failures</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Complaint Notifications</h3>
                      <p className="text-sm text-gray-600">Receive alerts for new complaints</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Daily Reports</h3>
                      <p className="text-sm text-gray-600">Receive daily summary reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Save className="w-4 h-4" />
                  <span>Save Notification Settings</span>
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}