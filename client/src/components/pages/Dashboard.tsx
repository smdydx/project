import { useState, useEffect } from 'react';
import { 
  DollarSign, Users, UserPlus, Activity, Zap, AlertTriangle,
  CheckCircle, Clock, XCircle, Smartphone, Globe,
  ChevronLeft, ChevronRight, Play, Pause
} from 'lucide-react';
import AdvancedStatCard from '../common/AdvancedStatCard';
import Card from '../common/Card';
import AdvancedRealtimeTable from '../common/RealtimeTable';
import RealtimeUserRegistrations from '../common/RealtimeUserRegistrations';
import { useWebSocket } from '../../hooks/useWebSocket';
import { apiService } from '../../services/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeServiceSegment, setActiveServiceSegment] = useState<number | null>(null);
  const [activeDailySegment, setActiveDailySegment] = useState<number | null>(null);

  // Initial data from REST API
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [charts, setCharts] = useState<any>(null);

  // WebSocket connections for real-time updates
  const { data: wsStats } = useWebSocket('dashboard-stats');
  const { data: wsTransaction } = useWebSocket('transactions');
  const { data: wsUser } = useWebSocket('user-registrations');

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, transactionsData, usersData, chartsData] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getLiveTransactions(),
          apiService.getRecentUsers(),
          apiService.getChartData()
        ]);

        setStats(statsData);
        setTransactions(transactionsData);
        setUsers(usersData);
        setCharts(chartsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update stats when WebSocket data arrives
  useEffect(() => {
    if (wsStats) {
      setStats((prev: any) => ({
        ...prev,
        ...wsStats
      }));
    }
  }, [wsStats]);

  // Add new transactions from WebSocket
  useEffect(() => {
    if (wsTransaction) {
      setTransactions((prev) => {
        const newTransactions = [wsTransaction, ...prev];
        return newTransactions.slice(0, 50); // Keep only last 50
      });
    }
  }, [wsTransaction]);

  // Add new users from WebSocket
  useEffect(() => {
    if (wsUser) {
      setUsers((prev) => {
        const newUsers = [wsUser, ...prev];
        return newUsers.slice(0, 20); // Keep only last 20
      });
    }
  }, [wsUser]);

  const allStatCards = [
    {
      title: "Total Users",
      subtitle: "Registered base",
      value: stats?.total_users?.toLocaleString() || '0',
      icon: Users,
      trend: { value: 5.7, isPositive: true, period: 'vs last month' },
      color: "blue" as const
    },
    {
      title: "Total New SignUp",
      subtitle: "Today's growth",
      value: stats?.new_signups_today?.toLocaleString() || '0',
      icon: UserPlus,
      trend: { value: 23.4, isPositive: true, period: 'vs yesterday' },
      color: "green" as const
    },
    {
      title: "Total KYC Verified User",
      subtitle: "Verified accounts",
      value: stats?.kyc_verified_users?.toLocaleString() || '0',
      icon: CheckCircle,
      trend: { value: 2.1, isPositive: true, period: 'vs yesterday' },
      color: "purple" as const
    },
    {
      title: "Total Prime User",
      subtitle: "Premium members",
      value: stats?.prime_users?.toLocaleString() || '0',
      icon: Zap,
      trend: { value: 5.8, isPositive: true, period: 'vs yesterday' },
      color: "yellow" as const
    },
    {
      title: "Total Distributor LCR Money",
      subtitle: "LCR balance",
      value: `₹${stats?.total_lcr_money?.toLocaleString() || '0'}`,
      icon: DollarSign,
      trend: { value: 8.2, isPositive: true, period: 'vs yesterday' },
      color: "green" as const
    },
    {
      title: "Total Distributor Prime Reward",
      subtitle: "Rewards earned",
      value: stats?.prime_users ? (stats.prime_users * 247).toLocaleString() : '0',
      icon: Activity,
      trend: { value: 18.3, isPositive: true, period: 'vs yesterday' },
      color: "red" as const
    },
    {
      title: "Total Mobile Recharge",
      subtitle: "Recharge volume",
      value: stats?.mobile_recharges?.toLocaleString() || '0',
      icon: Smartphone,
      trend: { value: 12.5, isPositive: true, period: 'vs yesterday' },
      color: "indigo" as const
    },
    {
      title: "Total DTH Recharge",
      subtitle: "DTH services",
      value: stats?.dth_recharges?.toLocaleString() || '0',
      icon: Globe,
      trend: { value: 12.4, isPositive: true, period: 'vs last week' },
      color: "pink" as const
    }
  ];

  useEffect(() => {
    // Autoplay only on desktop/laptop (lg breakpoint and above)
    if (!isAutoPlaying || window.innerWidth < 1024) return;

    const interval = setInterval(() => {
      const container = document.getElementById('stats-scroll-container');
      if (container) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;

        if (currentScroll >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: 400, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const scrollStats = (direction: 'left' | 'right') => {
    const container = document.getElementById('stats-scroll-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const generateRealtimeTransactions = () => {
    return transactions.slice(0, 12).map((txn, index) => ({
      id: txn.transactionId || txn.id || `TXN${index}`,
      user: txn.userName || txn.user || `User ${index}`,
      service: txn.type || txn.service || txn.TransactionType || 'Transaction',
      amount: txn.amount || parseFloat(txn.Amount || '0'),
      status: txn.status || txn.Status || 'Pending',
      timestamp: txn.timestamp || txn.time || new Date().toISOString(),
      location: txn.location || 'India'
    }));
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 shadow-lg";
    
    const statusConfig = {
      'Success': {
        className: `${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white`,
        icon: CheckCircle
      },
      'Successful': {
        className: `${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white`,
        icon: CheckCircle
      },
      'Completed': {
        className: `${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white`,
        icon: CheckCircle
      },
      'Failed': {
        className: `${baseClasses} bg-gradient-to-r from-red-500 to-pink-600 text-white`,
        icon: XCircle
      },
      'Pending': {
        className: `${baseClasses} bg-gradient-to-r from-yellow-500 to-orange-600 text-white`,
        icon: Clock
      },
      'Processing': {
        className: `${baseClasses} bg-gradient-to-r from-blue-500 to-indigo-600 text-white`,
        icon: Activity
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      className: `${baseClasses} bg-gray-500 text-white`,
      icon: AlertTriangle
    };

    const Icon = config.icon;

    return (
      <span className={config.className} data-testid={`status-${status.toLowerCase()}`}>
        <Icon className="w-3 h-3" />
        <span>{status}</span>
      </span>
    );
  };

  const transactionColumns = [
    { 
      key: 'id', 
      title: 'Txn ID',
      render: (value: string) => (
        <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded" data-testid={`txn-id-${value}`}>
          {value}
        </span>
      )
    },
    { 
      key: 'user', 
      title: 'User',
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-white" data-testid={`user-${value}`}>
          {value}
        </span>
      )
    },
    { 
      key: 'service', 
      title: 'Service',
      render: (value: string) => (
        <span className="text-sm text-gray-700 dark:text-gray-300" data-testid={`service-${value}`}>
          {value}
        </span>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: number) => (
        <span className="font-bold text-green-600 dark:text-green-400" data-testid={`amount-${value}`}>
          ₹{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'location',
      title: 'Location',
      render: (value: string) => (
        <span className="text-xs text-gray-600 dark:text-gray-400" data-testid={`location-${value}`}>
          {value}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2" data-testid="dashboard-container">
      {/* Live Transaction Stream Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-2xl animate-gradient-x relative overflow-hidden" data-testid="live-stream-banner">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-ping"></span>
            </div>
            <span className="text-sm sm:text-lg font-bold" data-testid="live-stream-title">LIVE TRANSACTION STREAM</span>
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-lg sm:text-2xl font-extrabold" data-testid="live-transaction-count">
              {stats?.total_transactions ? `TXN${stats.total_transactions}:` : 'TXN43:'} ₹{stats?.total_transactions ? (stats.total_transactions * 127).toLocaleString() : '8'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="relative" data-testid="stats-carousel">
        {/* Swipe-enabled Container - All Devices */}
        <div
          id="stats-scroll-container"
          className="overflow-x-auto scrollbar-hide scroll-smooth px-2 sm:px-4 lg:px-6 touch-pan-x cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          data-testid="stats-container"
        >
          <div className="flex space-x-3 sm:space-x-4 lg:space-x-6 pb-4">
            {allStatCards.map((card, index) => (
              <div key={index} className="flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-[45vw] lg:w-[350px] xl:w-[380px]" data-testid={`stat-card-${index}`}>
                <AdvancedStatCard
                  title={card.title}
                  subtitle={card.subtitle}
                  value={card.value}
                  icon={card.icon}
                  trend={card.trend}
                  color={card.color}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Live Transactions Table - Takes 3 columns */}
        <div className="lg:col-span-3 flex" data-testid="transactions-section">
          <Card title="🔥 Live Transactions" className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <AdvancedRealtimeTable
                columns={transactionColumns}
                data={generateRealtimeTransactions()}
              />
            </div>
          </Card>
        </div>

        {/* Live User Registrations - Takes 2 columns */}
        <div className="lg:col-span-2 flex" data-testid="registrations-section">
          <RealtimeUserRegistrations />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Transaction Volume Chart */}
        <Card title="📊 Daily Transaction Volume & Service Distribution" data-testid="chart-daily-volume">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Daily Transaction Volume</h4>
              <div className="space-y-3">
                {charts?.dailyVolume?.map((day: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                    onMouseEnter={() => setActiveDailySegment(index)}
                    onMouseLeave={() => setActiveDailySegment(null)}
                    data-testid={`chart-day-${day.name}`}
                  >
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-12">{day.name}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-end pr-2 transition-all duration-500 ${
                          activeDailySegment === index ? 'scale-105' : ''
                        }`}
                        style={{ width: `${(day.transactions / 3100) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">{day.transactions}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 w-24 text-right">
                      ₹{(day.amount / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Service Distribution */}
        <Card title="🎯 Service Distribution" data-testid="chart-service-distribution">
          <div className="space-y-3">
            {charts?.serviceDistribution?.map((service: any, index: number) => (
              <div 
                key={index}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                onMouseEnter={() => setActiveServiceSegment(index)}
                onMouseLeave={() => setActiveServiceSegment(null)}
                data-testid={`service-${service.name}`}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24">{service.name}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div 
                    className={`h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500 ${
                      activeServiceSegment === index ? 'scale-105' : ''
                    }`}
                    style={{ 
                      width: `${(service.value / 35) * 100}%`,
                      background: service.color 
                    }}
                  >
                    <span className="text-xs font-bold text-white">{service.value}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
