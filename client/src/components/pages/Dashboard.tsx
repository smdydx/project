
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, MessageSquare, TrendingUp, 
  Users, UserPlus, Send, Activity, Zap, Eye, Edit, Trash2, AlertTriangle,
  CheckCircle, Clock, XCircle, Smartphone, Globe,
  ChevronLeft, ChevronRight, Play, Pause
} from 'lucide-react';
import AdvancedStatCard from '../common/AdvancedStatCard';
import Card from '../common/Card';
import AdvancedRealtimeTable from '../common/RealtimeTable';
import RealtimeUserRegistrations from '../common/RealtimeUserRegistrations';
import { mockStats, chartData, liveTransactionPool, mockTransactions, mockComplaints } from '../../data/mockData';
import { LiveTransaction } from '../../types';

export default function Dashboard() {
  const [currentTransactions, setCurrentTransactions] = useState<LiveTransaction[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeServiceSegment, setActiveServiceSegment] = useState<number | null>(null);
  const [activeDailySegment, setActiveDailySegment] = useState<number | null>(null);

  const allStatCards = [
    {
      title: "Total Users",
      subtitle: "Registered base",
      value: mockStats.totalRegisteredUsers,
      icon: Users,
      trend: { value: 5.7, isPositive: true, period: 'vs last month' },
      color: "blue" as const
    },
    {
      title: "Total New SignUp",
      subtitle: "Today's growth",
      value: mockStats.newUsersToday,
      icon: UserPlus,
      trend: { value: 23.4, isPositive: true, period: 'vs yesterday' },
      color: "green" as const
    },
    {
      title: "Total KYC Verified User",
      subtitle: "Verified accounts",
      value: "94.2%",
      icon: CheckCircle,
      trend: { value: 2.1, isPositive: true, period: 'vs yesterday' },
      color: "purple" as const
    },
    {
      title: "Total Prime User",
      subtitle: "Premium members",
      value: 2847,
      icon: Zap,
      trend: { value: 5.8, isPositive: true, period: 'vs yesterday' },
      color: "yellow" as const
    },
    {
      title: "Total Distributor LCR Money",
      subtitle: "LCR balance",
      value: mockStats.totalAmountProcessed,
      icon: DollarSign,
      trend: { value: 8.2, isPositive: true, period: 'vs yesterday' },
      color: "green" as const
    },
    {
      title: "Total Distributor Prime Reward",
      subtitle: "Rewards earned",
      value: 1247,
      icon: Activity,
      trend: { value: 18.3, isPositive: true, period: 'vs yesterday' },
      color: "red" as const
    },
    {
      title: "Total Mobile Recharge",
      subtitle: "Recharge volume",
      value: mockStats.totalTransactionsToday,
      icon: Smartphone,
      trend: { value: 12.5, isPositive: true, period: 'vs yesterday' },
      color: "indigo" as const
    },
    {
      title: "Total DTH Recharge",
      subtitle: "DTH services",
      value: "67.8%",
      icon: Globe,
      trend: { value: 12.4, isPositive: true, period: 'vs last week' },
      color: "pink" as const
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

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

  useEffect(() => {
    const updateTransactions = () => {
      const shuffled = [...liveTransactionPool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6);
      setCurrentTransactions(selected.map(txn => ({
        ...txn,
        timestamp: new Date().toISOString(),
        id: `TXN${Math.floor(Math.random() * 100000)}`
      })));
    };

    updateTransactions();
    const interval = setInterval(updateTransactions, 2000);
    return () => clearInterval(interval);
  }, []);

  const generateRealtimeTransactions = () => {
    const statuses = ['Successful', 'Failed', 'Pending'];
    const services = ['Electricity Bill', 'Gas Bill', 'Mobile Recharge', 'DTH Recharge', 'Water Bill', 'Broadband Bill'];
    const users = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Arjun Singh', 'Kavya Nair'];

    return Array.from({ length: 12 }, (_, i) => ({
      id: `TXN${Math.floor(Math.random() * 100000)}`,
      user: users[Math.floor(Math.random() * users.length)],
      service: services[Math.floor(Math.random() * services.length)],
      amount: Math.floor(Math.random() * 5000) + 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: new Date().toLocaleString(),
      referenceId: `REF${Math.floor(Math.random() * 1000000)}`
    }));
  };

  const generateRealtimeComplaints = () => {
    const statuses = ['Open', 'Resolved', 'Escalated'];
    const issueTypes = ['Payment Failed', 'Wrong Amount', 'Refund Request', 'Account Issue'];
    const users = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy'];

    return Array.from({ length: 8 }, (_, i) => ({
      id: `CMP${Math.floor(Math.random() * 10000)}`,
      user: users[Math.floor(Math.random() * users.length)],
      txnId: `TXN${Math.floor(Math.random() * 100000)}`,
      issueType: issueTypes[Math.floor(Math.random() * issueTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      submittedOn: new Date().toLocaleString(),
      description: 'Sample complaint description'
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'text-green-400';
      case 'Processing': return 'text-yellow-400';
      case 'Failed': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getAdvancedStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold status-badge inline-flex items-center space-x-1";
    switch (status) {
      case 'Successful':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg`}>
            <CheckCircle className="w-3 h-3" />
            <span>Success</span>
          </span>
        );
      case 'Failed':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg`}>
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'Pending':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg`}>
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'Open':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg`}>
            <AlertTriangle className="w-3 h-3" />
            <span>Open</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg`}>
            <CheckCircle className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        );
      case 'Escalated':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg`}>
            <AlertTriangle className="w-3 h-3" />
            <span>Escalated</span>
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-gray-500 text-white`}>{status}</span>;
    }
  };

  const transactionColumns = [
    { key: 'id', title: 'Transaction ID', sortable: true, width: 'w-32' },
    { key: 'user', title: 'User', sortable: true },
    { key: 'service', title: 'Service', sortable: true },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value: number) => (
        <span className="font-bold text-green-600 dark:text-green-400">
          ₹{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => getAdvancedStatusBadge(value)
    },
    { 
      key: 'date', 
      title: 'Date', 
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">{value}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 hover:scale-110">
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const complaintColumns = [
    { key: 'id', title: 'Complaint ID', sortable: true },
    { key: 'user', title: 'User', sortable: true },
    { key: 'txnId', title: 'Transaction ID', sortable: true },
    { key: 'issueType', title: 'Issue Type', sortable: true },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => getAdvancedStatusBadge(value)
    },
    { 
      key: 'submittedOn', 
      title: 'Submitted', 
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">{value}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    const container = document.getElementById('stats-scroll-container');
    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const prevSlide = () => {
    const container = document.getElementById('stats-scroll-container');
    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-scale">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time monitoring and analytics</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={() => setShowNotificationModal(true)}
            className="btn-primary text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg"
          >
            <Send className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Send Notification</span>
          </button>
          <div className="flex items-center justify-center space-x-2 px-3 lg:px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-400">System Online</span>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden relative" padding={false}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold uppercase tracking-wide">Live Transaction Stream</span>
            <Activity className="w-4 h-4 lg:w-5 lg:h-5" />
            <Zap className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-300" />
          </div>
          <div className="overflow-hidden">
            <div className="animate-marquee whitespace-nowrap text-sm lg:text-lg">
              {currentTransactions.map((txn, index) => (
                <span key={index} className="mx-4 lg:mx-8 inline-flex items-center space-x-2">
                  <span className="font-bold">{txn.id}:</span>
                  <span className="text-yellow-300">₹{txn.amount.toLocaleString()}</span>
                  <span>•</span>
                  <span className="hidden sm:inline">{txn.service}</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(txn.status)}`}>
                    {txn.status}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Key Metrics</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isAutoPlaying 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title={isAutoPlaying ? 'Pause Auto-slide' : 'Resume Auto-slide'}
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-110 shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-110 shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          id="stats-scroll-container" 
          className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="flex gap-4 pb-4">
            {allStatCards.map((card, cardIndex) => (
              <div 
                key={cardIndex}
                className="flex-shrink-0 w-[calc(25%-12px)] min-w-[280px]"
                style={{ animationDelay: `${cardIndex * 100}ms` }} 
              >
                <AdvancedStatCard
                  title={card.title}
                  subtitle={card.subtitle}
                  value={card.value}
                  icon={card.icon}
                  trend={card.trend}
                  color={card.color}
                  isLoading={isLoading}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-1 mt-4">
          {allStatCards.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index < 4
                  ? 'w-8 bg-gradient-to-r from-blue-500 to-indigo-600'
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Daily Transaction Volume Pie Chart */}
        <Card title="Daily Transaction Volume" className="hover-lift">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <svg viewBox="0 0 240 240" className="w-full h-full transform -rotate-90">
              <defs>
                {chartData.dailyVolume.map((_, index) => {
                  const gradientId = `dailyGradient${index}`;
                  const colors = [
                    ['#3B82F6', '#2563EB'],
                    ['#6366F1', '#4F46E5'],
                    ['#8B5CF6', '#7C3AED'],
                    ['#A855F7', '#9333EA'],
                    ['#C026D3', '#A21CAF'],
                    ['#DB2777', '#BE185D'],
                    ['#F43F5E', '#E11D48']
                  ];
                  return (
                    <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: colors[index % colors.length][0] }} />
                      <stop offset="100%" style={{ stopColor: colors[index % colors.length][1] }} />
                    </linearGradient>
                  );
                })}
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                </filter>
              </defs>
              
              {(() => {
                const total = chartData.dailyVolume.reduce((sum, day) => sum + day.transactions, 0);
                let currentAngle = 0;
                
                return chartData.dailyVolume.map((day, index) => {
                  const percentage = (day.transactions / total) * 100;
                  const angle = (percentage / 100) * 360;
                  const startAngle = currentAngle;
                  const endAngle = currentAngle + angle;
                  
                  const outerRadius = activeDailySegment === index ? 95 : 85;
                  const innerRadius = 50;
                  
                  const startOuterX = 120 + outerRadius * Math.cos((startAngle * Math.PI) / 180);
                  const startOuterY = 120 + outerRadius * Math.sin((startAngle * Math.PI) / 180);
                  const endOuterX = 120 + outerRadius * Math.cos((endAngle * Math.PI) / 180);
                  const endOuterY = 120 + outerRadius * Math.sin((endAngle * Math.PI) / 180);
                  
                  const startInnerX = 120 + innerRadius * Math.cos((endAngle * Math.PI) / 180);
                  const startInnerY = 120 + innerRadius * Math.sin((endAngle * Math.PI) / 180);
                  const endInnerX = 120 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
                  const endInnerY = 120 + innerRadius * Math.sin((startAngle * Math.PI) / 180);
                  
                  const largeArc = angle > 180 ? 1 : 0;
                  const path = `M ${startOuterX} ${startOuterY} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuterX} ${endOuterY} L ${startInnerX} ${startInnerY} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${endInnerX} ${endInnerY} Z`;
                  
                  currentAngle = endAngle;
                  
                  return (
                    <g key={index} className="transition-all duration-300">
                      <path
                        d={path}
                        fill={`url(#dailyGradient${index})`}
                        className="cursor-pointer transition-all duration-300"
                        style={{ 
                          filter: activeDailySegment === index ? 'url(#shadow)' : 'none',
                          animation: `fadeInScale 0.6s ease-out ${index * 0.1}s both`
                        }}
                        onMouseEnter={() => setActiveDailySegment(index)}
                        onMouseLeave={() => setActiveDailySegment(null)}
                      />
                    </g>
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {chartData.dailyVolume.reduce((sum, day) => sum + day.transactions, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Transactions</p>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {chartData.dailyVolume.map((day, index) => {
              const gradients = [
                'from-blue-500 to-blue-600',
                'from-indigo-500 to-indigo-600',
                'from-purple-500 to-purple-600',
                'from-fuchsia-500 to-fuchsia-600',
                'from-pink-500 to-pink-600',
                'from-rose-500 to-rose-600',
                'from-red-500 to-red-600'
              ];
              return (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                    activeDailySegment === index 
                      ? 'bg-gradient-to-r ' + gradients[index % gradients.length] + ' text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  onMouseEnter={() => setActiveDailySegment(index)}
                  onMouseLeave={() => setActiveDailySegment(null)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${gradients[index % gradients.length]} shadow-md`}></div>
                    <span className={`font-medium ${activeDailySegment === index ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {day.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${activeDailySegment === index ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {day.transactions.toLocaleString()}
                    </span>
                    <span className={`text-sm ml-2 ${activeDailySegment === index ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                      ₹{(day.amount / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Enhanced Service Distribution Pie Chart */}
        <Card title="Service Distribution" className="hover-lift">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <svg viewBox="0 0 240 240" className="w-full h-full transform -rotate-90">
              <defs>
                {chartData.serviceDistribution.map((service, index) => {
                  const gradientId = `serviceGradient${index}`;
                  const colorPairs = [
                    ['#3B82F6', '#1E40AF'],
                    ['#10B981', '#047857'],
                    ['#F59E0B', '#D97706'],
                    ['#EF4444', '#B91C1C'],
                    ['#8B5CF6', '#6D28D9']
                  ];
                  return (
                    <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: colorPairs[index % colorPairs.length][0] }} />
                      <stop offset="100%" style={{ stopColor: colorPairs[index % colorPairs.length][1] }} />
                    </linearGradient>
                  );
                })}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {(() => {
                let currentAngle = 0;
                
                return chartData.serviceDistribution.map((service, index) => {
                  const percentage = service.value;
                  const angle = (percentage / 100) * 360;
                  const startAngle = currentAngle;
                  const endAngle = currentAngle + angle;
                  
                  const outerRadius = activeServiceSegment === index ? 95 : 85;
                  const innerRadius = 50;
                  
                  const startOuterX = 120 + outerRadius * Math.cos((startAngle * Math.PI) / 180);
                  const startOuterY = 120 + outerRadius * Math.sin((startAngle * Math.PI) / 180);
                  const endOuterX = 120 + outerRadius * Math.cos((endAngle * Math.PI) / 180);
                  const endOuterY = 120 + outerRadius * Math.sin((endAngle * Math.PI) / 180);
                  
                  const startInnerX = 120 + innerRadius * Math.cos((endAngle * Math.PI) / 180);
                  const startInnerY = 120 + innerRadius * Math.sin((endAngle * Math.PI) / 180);
                  const endInnerX = 120 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
                  const endInnerY = 120 + innerRadius * Math.sin((startAngle * Math.PI) / 180);
                  
                  const largeArc = angle > 180 ? 1 : 0;
                  const path = `M ${startOuterX} ${startOuterY} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuterX} ${endOuterY} L ${startInnerX} ${startInnerY} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${endInnerX} ${endInnerY} Z`;
                  
                  currentAngle = endAngle;
                  
                  return (
                    <g key={index} className="transition-all duration-300">
                      <path
                        d={path}
                        fill={`url(#serviceGradient${index})`}
                        className="cursor-pointer transition-all duration-300"
                        style={{ 
                          filter: activeServiceSegment === index ? 'url(#glow)' : 'none',
                          animation: `fadeInScale 0.6s ease-out ${index * 0.1}s both`
                        }}
                        onMouseEnter={() => setActiveServiceSegment(index)}
                        onMouseLeave={() => setActiveServiceSegment(null)}
                      />
                    </g>
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">100%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Services</p>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {chartData.serviceDistribution.map((service, index) => {
              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
              const gradients = [
                'from-blue-500 to-blue-700',
                'from-green-500 to-green-700',
                'from-yellow-500 to-yellow-700',
                'from-red-500 to-red-700',
                'from-purple-500 to-purple-700'
              ];
              return (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                    activeServiceSegment === index 
                      ? 'bg-gradient-to-r ' + gradients[index % gradients.length] + ' text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  onMouseEnter={() => setActiveServiceSegment(index)}
                  onMouseLeave={() => setActiveServiceSegment(null)}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-md" 
                      style={{ background: `linear-gradient(135deg, ${colors[index % colors.length]}, ${colors[index % colors.length]}dd)` }}
                    ></div>
                    <span className={`font-medium ${activeServiceSegment === index ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {service.name}
                    </span>
                  </div>
                  <span className={`font-bold text-lg ${activeServiceSegment === index ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {service.value}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <AdvancedRealtimeTable
            title="Live Transactions"
            columns={transactionColumns}
            data={mockTransactions}
            onDataUpdate={generateRealtimeTransactions}
            updateInterval={3000}
            searchPlaceholder="Search transactions..."
            showStats={true}
            enableAnimations={true}
          />

          <AdvancedRealtimeTable
            title="Live Complaints"
            columns={complaintColumns}
            data={mockComplaints}
            onDataUpdate={generateRealtimeComplaints}
            updateInterval={5000}
            searchPlaceholder="Search complaints..."
            showStats={true}
            enableAnimations={true}
          />
        </div>

        <div className="xl:col-span-1">
          <RealtimeUserRegistrations />
        </div>
      </div>

      {showNotificationModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 w-full max-w-md shadow-2xl animate-fade-in-scale border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send Notification</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Broadcast message to users</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Recipient Type</label>
                <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm">
                  <option>All Users</option>
                  <option>Retailers Only</option>
                  <option>Distributors Only</option>
                  <option>Specific User</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message Title</label>
                <input
                  type="text"
                  placeholder="Enter notification title"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea
                  rows={4}
                  placeholder="Enter your message here..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm resize-none"
                ></textarea>
              </div>

              <div className="flex items-center space-x-3">
                <input type="checkbox" id="urgent" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <label htmlFor="urgent" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as urgent notification</label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNotificationModal(false);
                }}
                className="btn-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg"
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
