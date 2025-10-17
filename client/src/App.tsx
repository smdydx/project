import { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import UserManagement from './components/pages/UserManagement';
import AllUsers from './components/pages/AllUsers';
import UserDetailPage from './components/pages/UserDetailPage';
import NewSignUp from './components/pages/NewSignUp';
import KYCVerification from './components/pages/KYCVerification';
import Transactions from './components/pages/Transactions';
import MobileTransactions from './components/pages/MobileTransactions';
import DthTransactions from './components/pages/DthTransactions';
import Complaints from './components/pages/Complaints';
import Reports from './components/pages/Reports';
import Settings from './components/pages/Settings';
import { LoansPage } from './pages/LoansPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ServicesPage } from './pages/ServicesPage';
import { BannersPage } from './pages/BannersPage';
import { DevicesPage } from './pages/DevicesPage';
import ModelBrowser from './pages/ModelBrowser';
import UserTransactionDetail from './components/pages/UserTransactionDetail';
import { authStorage } from './lib/api';

function AppContent() {
  const [dateFilter, setDateFilter] = useState('today');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    // Clear all auth data
    localStorage.removeItem('lcrpay_auth_token');
    localStorage.removeItem('lcrpay_refresh_token');
    localStorage.removeItem('lcrpay_username');
    localStorage.removeItem('isAuthenticated');
  };

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
        onLogout={handleLogout}
      />

      <main className={`pt-16 sm:pt-20 lg:pt-24 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <div className="max-w-[1600px] mx-auto w-full">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/users" component={UserManagement} />
            <Route path="/users/all" component={AllUsers} />
            <Route path="/user/:userId" component={UserDetailPage} />
            <Route path="/users/new-signup" component={NewSignUp} />
            <Route path="/users/kyc" component={KYCVerification} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/transactions/mobile" component={MobileTransactions} />
            <Route path="/transactions/dth" component={DthTransactions} />
            <Route path="/loans" component={LoansPage} />
            <Route path="/payments" component={PaymentsPage} />
            <Route path="/services" component={ServicesPage} />
            <Route path="/banners" component={BannersPage} />
            <Route path="/devices" component={DevicesPage} />
            <Route path="/model-browser" component={ModelBrowser} />
            <Route path="/complaints" component={Complaints} />
            <Route path="/reports" component={Reports} />
            <Route path="/settings" component={Settings} />
            <Route path="/users/detail/:userId" component={UserDetailPage} />
            <Route path="/transactions/user/:userId" component={UserTransactionDetail} />
            <Route component={Dashboard} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;