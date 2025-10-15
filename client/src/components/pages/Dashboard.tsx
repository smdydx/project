import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, Building2, MessageSquare, TrendingUp, TrendingDown, 
  Users, UserPlus, Send, Activity, Zap, Eye, Edit, Trash2, AlertTriangle,
  CheckCircle, Clock, XCircle, BarChart3, PieChart, Globe, Smartphone,
  ChevronLeft, ChevronRight, Play, Pause
} from 'lucide-react';
import AdvancedStatCard from '../common/AdvancedStatCard';
import Card from '../common/Card';
import AdvancedRealtimeTable from '../common/AdvancedRealtimeTable';
import RealtimeUserRegistrations from '../common/RealtimeUserRegistrations';
import { mockStats, chartData, liveTransactionPool, recentUsers, mockTransactions, mockComplaints } from '../../data/mockData';
import { LiveTransaction } from '../../types';

export default function Dashboard() {
  const [currentTransactions, setCurrentTransactions] = useState<LiveTransaction[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // All stat cards data with unique colors
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

  const cardsPerView = 5;
  const totalSlides = Math.ceil(allStatCards.length / cardsPerView);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentCardIndex((prevIndex) => 
        prevIndex >= totalSlides - 1 ? 0 : prevIndex + 1
      );
    }, 6000); // Change slides every 6 seconds (slower)

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  // Simulate live transactions with more dynamic updates
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

  // Enhanced data generators for real-time tables
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
    setCurrentCardIndex((prevIndex) => 
      prevIndex >= totalSlides - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentCardIndex((prevIndex) => 
      prevIndex <= 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentCardIndex(index);
  };

  const getCurrentCards = () => {
    const startIndex = currentCardIndex * cardsPerView;
    return allStatCards.slice(startIndex, startIndex + cardsPerView);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-scale">
      {/* Enhanced Action Bar */}
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

      {/* Enhanced Live Transaction Ticker */}
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

      {/* Enhanced Sliding Stats Cards Carousel */}
      <div className="relative">
        {/* Carousel Header */}
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
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentCardIndex + 1} / {totalSlides}
              </span>
            </div>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Cards Container */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
          >
            {Array.from({ length: totalSlides }, (_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 px-1">
                  {allStatCards
                    .slice(slideIndex * cardsPerView, (slideIndex + 1) * cardsPerView)
                    .map((card, cardIndex) => (
                      <div 
                        key={`${slideIndex}-${cardIndex}`}
                        className="animate-slide-in-up"
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
            ))}
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentCardIndex
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg scale-110'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentCardIndex + 1) / totalSlides) * 100}%` }}
          />
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Enhanced Daily Volume Chart */}
        <Card title="Daily Transaction Volume" className="hover-lift">
          <div className="space-y-4">
            {chartData.dailyVolume.map((day, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{day.name}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{day.transactions.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">₹{(day.amount / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="chart-bar h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out"
                    style={{
                      width: `${(day.transactions / Math.max(...chartData.dailyVolume.map(d => d.transactions))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Enhanced Service Distribution */}
        <Card title="Service Distribution" className="hover-lift">
          <div className="space-y-4">
            {chartData.serviceDistribution.map((service, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-lg"
                      style={{ backgroundColor: service.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{service.value}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="chart-bar h-2 rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{
                      width: `${service.value}%`,
                      backgroundColor: service.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Enhanced Hourly Activity Heatmap */}
        <Card title="Hourly Activity Heatmap" className="hover-lift">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {chartData.hourlyActivity.map((hour, index) => {
              const intensity = hour.transactions / Math.max(...chartData.hourlyActivity.map(h => h.transactions));
              return (
                <div
                  key={index}
                  className="p-2 lg:p-3 rounded-lg text-center text-xs font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, rgba(59, 130, 246, ${intensity}), rgba(99, 102, 241, ${intensity * 0.8}))`,
                    color: intensity > 0.5 ? 'white' : 'black'
                  }}
                >
                  <div className="font-bold">{hour.hour}</div>
                  <div className="text-xs mt-1">{hour.transactions}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Enhanced Real-time Tables and User Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <div className="xl:col-span-2 space-y-4 lg:space-y-6 order-2 xl:order-1">
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

        {/* Real-time User Registrations */}
        <div className="xl:col-span-1 order-1 xl:order-2">
          <RealtimeUserRegistrations />
        </div>
      </div>

      {/* Enhanced Notification Modal */}
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