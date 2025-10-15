import React, { useState, useEffect } from 'react';
import { UserPlus, Globe, Smartphone, MapPin, Clock, Star, Shield, Crown } from 'lucide-react';

interface NewUser {
  id: string;
  name: string;
  email: string;
  role: 'Retailer' | 'Distributor' | 'Admin';
  location: string;
  device: 'Mobile' | 'Desktop';
  joinedAt: Date;
  avatar?: string;
}

const userPool = [
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', role: 'Retailer' as const, location: 'Mumbai, India' },
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'Distributor' as const, location: 'Delhi, India' },
  { name: 'Amit Patel', email: 'amit.patel@example.com', role: 'Retailer' as const, location: 'Ahmedabad, India' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', role: 'Distributor' as const, location: 'Bangalore, India' },
  { name: 'Arjun Singh', email: 'arjun.singh@example.com', role: 'Retailer' as const, location: 'Jaipur, India' },
  { name: 'Kavya Nair', email: 'kavya.nair@example.com', role: 'Retailer' as const, location: 'Kochi, India' },
  { name: 'Rohit Gupta', email: 'rohit.gupta@example.com', role: 'Distributor' as const, location: 'Pune, India' },
  { name: 'Anita Desai', email: 'anita.desai@example.com', role: 'Retailer' as const, location: 'Surat, India' },
  { name: 'Vikram Shah', email: 'vikram.shah@example.com', role: 'Retailer' as const, location: 'Hyderabad, India' },
  { name: 'Meera Joshi', email: 'meera.joshi@example.com', role: 'Distributor' as const, location: 'Chennai, India' }
];

export default function RealtimeUserRegistrations() {
  const [newUsers, setNewUsers] = useState<NewUser[]>([]);
  const [totalRegistrations, setTotalRegistrations] = useState(0);

  useEffect(() => {
    const generateNewUser = () => {
      const baseUser = userPool[Math.floor(Math.random() * userPool.length)];
      const devices = ['Mobile', 'Desktop'] as const;
      
      const newUser: NewUser = {
        id: `USR${Math.floor(Math.random() * 100000)}`,
        name: baseUser.name,
        email: baseUser.email,
        role: baseUser.role,
        location: baseUser.location,
        device: devices[Math.floor(Math.random() * devices.length)],
        joinedAt: new Date()
      };

      setNewUsers(prev => {
        const updated = [newUser, ...prev].slice(0, 8); // Keep only latest 8
        return updated;
      });

      setTotalRegistrations(prev => prev + 1);
    };

    // Generate initial users
    for (let i = 0; i < 5; i++) {
      setTimeout(() => generateNewUser(), i * 500);
    }

    // Continue generating users
    const interval = setInterval(generateNewUser, 4000 + Math.random() * 6000);
    return () => clearInterval(interval);
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Crown className="w-3 h-3 text-purple-500" />;
      case 'Distributor':
        return <Star className="w-3 h-3 text-blue-500" />;
      case 'Retailer':
        return <Shield className="w-3 h-3 text-green-500" />;
      default:
        return <Shield className="w-3 h-3 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1";
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

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover-lift">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live User Registrations</h3>
            <UserPlus className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalRegistrations}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-1 p-4">
          {newUsers.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl hover:shadow-lg transition-all duration-300 group animate-slide-in-up border-l-4 border-green-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                  {getRoleIcon(user.role)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">{user.email}</p>
                
                <div className="flex items-center space-x-3">
                  {getRoleBadge(user.role)}
                </div>
              </div>

              {/* Meta Info */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center justify-end space-x-1 mb-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                    {user.location.split(',')[0]}
                  </span>
                </div>
                
                <div className="flex items-center justify-end space-x-2 mb-2">
                  {user.device === 'Mobile' ? (
                    <Smartphone className="w-3 h-3 text-blue-500" />
                  ) : (
                    <Globe className="w-3 h-3 text-green-500" />
                  )}
                  <span className="text-xs text-gray-400">{user.device}</span>
                </div>
                
                <div className="flex items-center justify-end space-x-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">{getTimeAgo(user.joinedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {newUsers.length === 0 && (
          <div className="p-8 text-center">
            <UserPlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Waiting for new registrations...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Showing latest {newUsers.length} registrations
          </span>
          <button className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition-colors duration-200">
            View All Users →
          </button>
        </div>
      </div>
    </div>
  );
}