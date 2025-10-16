import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  MessageSquare, 
  BarChart3, 
  Grid3X3, 
  GitCompare, 
  Settings, 
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Tv,
  UserCheck,
  UserPlus,
  Shield,
  Banknote,
  Wallet,
  Briefcase,
  Image,
  Monitor
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: any;
  subMenu?: { path: string; label: string; icon: any }[];
}

const menuItems: MenuItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { 
    path: '/users', 
    label: 'User Management', 
    icon: Users,
    subMenu: [
      { path: '/users/all', label: 'All Users', icon: UserCheck },
      { path: '/users/new-signup', label: 'New Sign Up', icon: UserPlus },
      { path: '/users/kyc', label: 'KYC Verification', icon: Shield }
    ]
  },
  { 
    path: '/transactions', 
    label: 'Transactions', 
    icon: CreditCard,
    subMenu: [
      { path: '/transactions/mobile', label: 'Mobile Transactions', icon: Smartphone },
      { path: '/transactions/dth', label: 'DTH Transactions', icon: Tv }
    ]
  },
  { path: '/loans', label: 'Loan Applications', icon: Banknote },
  { path: '/payments', label: 'Payment Gateway', icon: Wallet },
  { path: '/services', label: 'Services', icon: Briefcase },
  { path: '/banners', label: 'App Banners', icon: Image },
  { path: '/devices', label: 'User Devices', icon: Monitor },
  { path: '/complaints', label: 'Complaints', icon: MessageSquare },
  { path: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { path: '/categories', label: 'Service Categories', icon: Grid3X3 },
  { path: '/reconciliation', label: 'Reconciliation', icon: GitCompare },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ 
  isMobileOpen = false, 
  onMobileClose,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const [location] = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubMenu = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-50 transform transition-all duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      } w-64`}>

        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 z-10"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>

        {/* Header */}
        <div className={`p-6 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isCollapsed ? 'lg:p-4' : ''
        }`}>
          <div className={`flex items-center transition-all duration-300 ${
            isCollapsed ? 'lg:justify-center' : 'space-x-3'
          }`}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${
              isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'
            }`}>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">LCR Admin Panel</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Payment System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`mt-6 flex-1 overflow-y-auto transition-all duration-300 ${
          isCollapsed ? 'lg:px-2' : 'px-3'
        }`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (item.subMenu && item.subMenu.some(sub => location === sub.path));
            const isExpanded = expandedMenus.includes(item.path);
            const hasSubMenu = item.subMenu && item.subMenu.length > 0;

            return (
              <div key={item.path} className="relative group mb-1">
                {hasSubMenu ? (
                  <>
                    <button
                      onClick={() => toggleSubMenu(item.path)}
                      className={`w-full flex items-center justify-between text-left transition-all duration-200 rounded-lg relative overflow-hidden ${
                        isCollapsed ? 'lg:justify-center lg:px-3 lg:py-4' : 'px-3 py-3'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400 shadow-lg'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full"></div>
                      )}

                      <div className={`flex items-center ${isCollapsed ? 'lg:justify-center' : 'space-x-3'}`}>
                        <Icon className={`flex-shrink-0 transition-all duration-200 ${
                          isActive ? 'w-6 h-6' : 'w-5 h-5'
                        }`} />

                        <span className={`font-medium truncate transition-all duration-300 ${
                          isCollapsed ? 'lg:hidden' : 'block'
                        }`}>
                          {item.label}
                        </span>
                      </div>

                      {!isCollapsed && (
                        <div className="ml-2">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Sub Menu */}
                    {isExpanded && !isCollapsed && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.subMenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = location === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              href={subItem.path}
                              onClick={onMobileClose}
                              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isSubActive
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <SubIcon className="w-4 h-4 flex-shrink-0" />
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    onClick={onMobileClose}
                    className={`w-full flex items-center text-left transition-all duration-200 rounded-lg relative overflow-hidden ${
                      isCollapsed ? 'lg:justify-center lg:px-3 lg:py-4' : 'space-x-3 px-3 py-3'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400 shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full"></div>
                    )}

                    <Icon className={`flex-shrink-0 transition-all duration-200 ${
                      isActive ? 'w-6 h-6' : 'w-5 h-5'
                    }`} />

                    <span className={`font-medium truncate transition-all duration-300 ${
                      isCollapsed ? 'lg:hidden' : 'block'
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="hidden lg:group-hover:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className={`border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isCollapsed ? 'lg:p-2' : 'p-3'
        }`}>
          <div className="relative group">
            <button className={`w-full flex items-center text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-all duration-200 rounded-lg ${
              isCollapsed ? 'lg:justify-center lg:px-3 lg:py-4' : 'space-x-3 px-3 py-3'
            }`}>
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium transition-all duration-300 ${
                isCollapsed ? 'lg:hidden' : 'block'
              }`}>
                Logout
              </span>
            </button>

            {/* Tooltip for collapsed logout */}
            {isCollapsed && (
              <div className="hidden lg:group-hover:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Logout
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}