
import { useState } from 'react';
import { Route, Switch } from 'wouter';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/pages/Dashboard';
import UserManagement from './components/pages/UserManagement';
import AllUsers from './components/pages/AllUsers';
import NewSignUp from './components/pages/NewSignUp';
import KYCVerification from './components/pages/KYCVerification';
import Transactions from './components/pages/Transactions';
import Complaints from './components/pages/Complaints';
import Reports from './components/pages/Reports';
import Settings from './components/pages/Settings';

function AppContent() {
  const [dateFilter, setDateFilter] = useState('today');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar 
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

      <main className={`pt-24 px-3 sm:px-4 lg:px-6 pb-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <div className="max-w-[1600px] mx-auto w-full">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/users" component={UserManagement} />
            <Route path="/users/all" component={AllUsers} />
            <Route path="/users/new-signup" component={NewSignUp} />
            <Route path="/users/kyc" component={KYCVerification} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/complaints" component={Complaints} />
            <Route path="/reports" component={Reports} />
            <Route path="/settings" component={Settings} />
            <Route component={Dashboard} />
          </Switch>
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
