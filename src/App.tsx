import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/pages/Dashboard';
import BillersManagement from './components/pages/BillersManagement';
import UserManagement from './components/pages/UserManagement';
import Transactions from './components/pages/Transactions';
import Complaints from './components/pages/Complaints';
import Reports from './components/pages/Reports';
import Settings from './components/pages/Settings';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateFilter, setDateFilter] = useState('today');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'billers':
        return <BillersManagement />;
      case 'users':
        return <UserManagement />;
      case 'transactions':
        return <Transactions />;
      case 'complaints':
        return <Complaints />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Header 
        dateFilter={dateFilter} 
        setDateFilter={setDateFilter}
        onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
        isCollapsed={isSidebarCollapsed}
      />
      
      <main className={`pt-20 p-4 lg:p-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;