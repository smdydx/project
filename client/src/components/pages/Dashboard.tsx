import { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  UserPlus,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Smartphone,
  Globe,
  TrendingUp,
} from "lucide-react";
import AdvancedStatCard from "../common/AdvancedStatCard";
import Card from "../common/Card";
import AdvancedRealtimeTable from "../common/RealtimeTable";
import RealtimeUserRegistrations from "../common/RealtimeUserRegistrations";
import { useWebSocket } from "../../hooks/useWebSocket";
import { apiService } from "../../services/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [activeServiceSegment, setActiveServiceSegment] = useState<
    number | null
  >(null);
  const [activeDailySegment, setActiveDailySegment] = useState<number | null>(
    null,
  );

  // Initial data from REST API
  const [stats, setStats] = useState<any>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [charts, setCharts] = useState<any>({});

  // WebSocket connections for real-time updates
  const { data: wsStats, isConnected: wsConnected } = useWebSocket("dashboard-stats");
  const { data: wsTransaction } = useWebSocket("transactions");

  // Initial data fetch - Optimized with sequential loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Load critical data first
        const statsData = await apiService.getDashboardStats();
        setStats(statsData);
        setLoading(false);

        // Then load non-critical data in background
        Promise.all([
          apiService.getLiveTransactions(),
          apiService.getChartData(),
        ]).then(([transactionsData, chartsData]) => {
          setTransactions(transactionsData);
          setCharts(chartsData);
        }).catch(error => {
          console.error("Error fetching secondary data:", error);
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
        ...wsStats,
      }));
    }
  }, [wsStats]);

  // Add new transactions from WebSocket
  useEffect(() => {
    if (wsTransaction) {
      setTransactions((prev: any[]) => {
        const newTransactions = [wsTransaction, ...prev];
        return newTransactions.slice(0, 50); // Keep only last 50
      });
    }
  }, [wsTransaction]);

  const allStatCards = [
    {
      title: "Total Users",
      subtitle: "Registered base",
      value: stats?.total_users?.toLocaleString() || "0",
      icon: Users,
      trend: { value: 5.7, isPositive: true, period: "vs last month" },
      color: "blue" as const,
    },
    {
      title: "Total New SignUp",
      subtitle: "Today's growth",
      value: stats?.new_signups_today?.toLocaleString() || "0",
      icon: UserPlus,
      trend: { value: 23.4, isPositive: true, period: "vs yesterday" },
      color: "green" as const,
    },
    {
      title: "Total KYC Verified User",
      subtitle: "Verified accounts",
      value: (stats?.verified_accounts || stats?.kyc_verified_users || 0).toLocaleString(),
      icon: CheckCircle,
      trend: { value: 2.1, isPositive: true, period: "vs yesterday" },
      color: "purple" as const,
    },
    {
      title: "Total Prime User",
      subtitle: "Premium members",
      value: stats?.prime_users?.toLocaleString() || "0",
      icon: Zap,
      trend: { value: 5.8, isPositive: true, period: "vs yesterday" },
      color: "yellow" as const,
    },
    {
      title: "Total Distributor LCR Money",
      subtitle: "LCR balance",
      value: `₹${(stats?.total_distributor_lcr_money || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: { value: 8.2, isPositive: true, period: "vs yesterday" },
      color: "green" as const,
    },
    {
      title: "Total Distributor Prime Reward",
      subtitle: "Rewards earned",
      value: `₹${(stats?.total_distributor_prime_reward || 0).toLocaleString()}`,
      icon: Activity,
      trend: { value: 18.3, isPositive: true, period: "vs yesterday" },
      color: "red" as const,
    },
    {
      title: "Total Mobile Recharge",
      subtitle: "Recharge volume",
      value: (stats?.total_mobile_recharge || 0).toLocaleString(),
      icon: Smartphone,
      trend: { value: 12.5, isPositive: true, period: "vs yesterday" },
      color: "indigo" as const,
    },
    {
      title: "Total DTH Recharge",
      subtitle: "DTH services",
      value: (stats?.total_dth_recharge || 0).toLocaleString(),
      icon: Globe,
      trend: { value: 12.4, isPositive: true, period: "vs last week" },
      color: "pink" as const,
    },
  ];

  const generateRealtimeTransactions = () => {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return [];
    }

    // Only show real database transactions - no dummy data
    return transactions
      .filter(txn => txn.id || txn.TransactionID) // Filter out any invalid entries
      .slice(0, 12)
      .map(txn => ({
        id: txn.id || txn.TransactionID || 'N/A',
        user: txn.user || txn.fullname || 'Unknown',
        service: txn.service || txn.purpose || 'Service',
        amount: txn.amount || 0,
        status: txn.status || 'Pending',
        location: txn.location || 'India'
      }));
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 shadow-lg";

    const statusConfig = {
      Success: {
        className: `${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white`,
        icon: CheckCircle,
      },
      Successful: {
        className: `${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white`,
        icon: CheckCircle,
      },
      Completed: {
        className: `${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white`,
        icon: CheckCircle,
      },
      Failed: {
        className: `${baseClasses} bg-gradient-to-r from-red-500 to-pink-600 text-white`,
        icon: XCircle,
      },
      Pending: {
        className: `${baseClasses} bg-gradient-to-r from-yellow-500 to-orange-600 text-white`,
        icon: Clock,
      },
      Processing: {
        className: `${baseClasses} bg-gradient-to-r from-blue-500 to-indigo-600 text-white`,
        icon: Activity,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      className: `${baseClasses} bg-gray-500 text-white`,
      icon: AlertTriangle,
    };

    const Icon = config.icon;

    return (
      <span
        className={config.className}
        data-testid={`status-${status.toLowerCase()}`}
      >
        <Icon className="w-3 h-3" />
        <span>{status}</span>
      </span>
    );
  };

  const transactionColumns = [
    {
      key: "id",
      title: "Txn ID",
      render: (value: string) => (
        <span
          className="font-mono text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded"
          data-testid={`txn-id-${value}`}
        >
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: "user",
      title: "User",
      render: (value: string) => (
        <span
          className="font-medium text-gray-900 dark:text-white"
          data-testid={`user-${value}`}
        >
          {value || 'Unknown'}
        </span>
      ),
    },
    {
      key: "service",
      title: "Service",
      render: (value: string) => (
        <span
          className="text-sm text-gray-700 dark:text-gray-300"
          data-testid={`service-${value}`}
        >
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: "amount",
      title: "Amount",
      render: (value: number) => (
        <span
          className="font-bold text-green-600 dark:text-green-400"
          data-testid={`amount-${value}`}
        >
          ₹{value ? value.toLocaleString() : '0'}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value: string) => getStatusBadge(value || 'Pending'),
    },
    {
      key: "location",
      title: "Location",
      render: (value: string) => (
        <span
          className="text-xs text-gray-600 dark:text-gray-400"
          data-testid={`location-${value}`}
        >
          {value || 'Unknown'}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        data-testid="loading-spinner"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2" data-testid="dashboard-container">
      {/* Live Transaction Stream Banner */}
      <div
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-2xl animate-gradient-x relative overflow-hidden"
        data-testid="live-stream-banner"
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-ping"></span>
            </div>
            <span
              className="text-sm sm:text-lg font-bold"
              data-testid="live-stream-title"
            >
              {wsConnected ? 'LIVE TRANSACTION STREAM' : 'REAL DATABASE TRANSACTIONS'}
            </span>
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span
              className="text-lg sm:text-2xl font-extrabold"
              data-testid="live-transaction-count"
            >
              {transactions && transactions.length > 0
                ? `Total: ${transactions.length}`
                : "No Transactions"}{" "}
              {stats?.total_mobile_recharge && stats?.total_dth_recharge
                ? `| ₹${(stats.total_mobile_recharge + stats.total_dth_recharge).toLocaleString()}`
                : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Single Horizontal Swipeable Row */}
      <div className="relative" data-testid="stats-carousel">
        {/* Horizontal Scroll on All Devices */}
        <div
          id="stats-scroll-container"
          className="overflow-x-auto scrollbar-hide scroll-smooth px-2 sm:px-4 touch-pan-x cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          data-testid="stats-container"
        >
          <div className="flex space-x-3 sm:space-x-4 pb-4">
            {allStatCards.map((card, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[45vw] lg:w-[30vw] xl:w-[23vw] 2xl:w-[18vw]"
                data-testid={`stat-card-${index}`}
              >
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

      {/* Live User Registrations and Live Transactions - Responsive Layout */}
      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0">
          {/* Live User Registrations */}
          <div className="flex border-b xl:border-b-0 xl:border-r border-gray-200 dark:border-gray-700" data-testid="registrations-section">
            <RealtimeUserRegistrations />
          </div>

          {/* Live Transactions Table */}
          <div className="flex flex-col" data-testid="transactions-section">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">🔥 Live Transactions</h3>
            </div>
            <div className="flex-1 overflow-x-auto p-3 sm:p-6">
              <AdvancedRealtimeTable
                columns={transactionColumns}
                data={generateRealtimeTransactions()}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Transaction Volume Chart */}
        <Card
          title="📊 Daily Transaction Volume & Service Distribution"
          data-testid="chart-daily-volume"
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Daily Transaction Volume
              </h4>
              <div className="space-y-3">
                {charts?.dailyVolume?.map((day: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                    onMouseEnter={() => setActiveDailySegment(index)}
                    onMouseLeave={() => setActiveDailySegment(null)}
                    data-testid={`chart-day-${day.name}`}
                  >
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-12">
                      {day.name}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-end pr-2 transition-all duration-500 ${
                          activeDailySegment === index ? "scale-105" : ""
                        }`}
                        style={{ width: `${(day.transactions / 3100) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">
                          {day.transactions}
                        </span>
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
        <Card
          title="🎯 Service Distribution"
          data-testid="chart-service-distribution"
        >
          <div className="space-y-3">
            {charts?.serviceDistribution?.map((service: any, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                onMouseEnter={() => setActiveServiceSegment(index)}
                onMouseLeave={() => setActiveServiceSegment(null)}
                data-testid={`service-${service.name}`}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24">
                  {service.name}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500 ${
                      activeServiceSegment === index ? "scale-105" : ""
                    }`}
                    style={{
                      width: `${(service.value / 35) * 100}%`,
                      background: service.color,
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {service.value}%
                    </span>
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