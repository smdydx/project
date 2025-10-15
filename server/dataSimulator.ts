/**
 * Data Simulator for Real-time Dashboard Updates
 * Generates dynamic, realistic data for WebSocket broadcasting
 */

type BroadcastFn = (channel: string, data: any) => void;

interface SimulatorMetrics {
  totalUsers: number;
  newSignupsToday: number;
  kycVerifiedUsers: number;
  primeUsers: number;
  totalTransactions: number;
  activeTransactions: number;
}

export function createDataSimulator(broadcast: BroadcastFn) {
  const metrics: SimulatorMetrics = {
    totalUsers: 50,
    newSignupsToday: 1,
    kycVerifiedUsers: 25,
    primeUsers: 16,
    totalTransactions: 43,
    activeTransactions: 0
  };

  const indianNames = [
    'Amit Patel', 'Priya Sharma', 'Rajesh Kumar', 'Sneha Reddy', 
    'Arjun Singh', 'Kavya Nair', 'Rohit Gupta', 'Anita Desai',
    'Vikash Yadav', 'Deepika Verma', 'Sanjay Mehta', 'Pooja Kapoor',
    'Rahul Shah', 'Neha Chopra', 'Kunal Jain', 'Ritu Agarwal'
  ];

  const cities = [
    'Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 
    'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ];

  const transactionTypes = [
    { type: 'Mobile Recharge', icon: '📱', color: 'from-blue-500 to-blue-600' },
    { type: 'DTH Recharge', icon: '📺', color: 'from-purple-500 to-purple-600' },
    { type: 'Electricity Bill', icon: '⚡', color: 'from-yellow-500 to-yellow-600' },
    { type: 'Water Bill', icon: '💧', color: 'from-cyan-500 to-cyan-600' },
    { type: 'Gas Bill', icon: '🔥', color: 'from-orange-500 to-orange-600' },
    { type: 'Broadband Bill', icon: '🌐', color: 'from-indigo-500 to-indigo-600' },
    { type: 'P2P Transfer', icon: '💸', color: 'from-green-500 to-green-600' }
  ];

  const statuses = [
    { status: 'Success', probability: 0.75 },
    { status: 'Pending', probability: 0.15 },
    { status: 'Failed', probability: 0.10 }
  ];

  function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  function getWeightedStatus(): string {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const { status, probability } of statuses) {
      cumulative += probability;
      if (rand <= cumulative) {
        return status;
      }
    }
    
    return 'Success';
  }

  function generateTransaction() {
    metrics.totalTransactions++;
    const txType = getRandomItem(transactionTypes);
    const status = getWeightedStatus();
    const amount = Math.floor(Math.random() * 5000) + 100;
    const userName = getRandomItem(indianNames);
    const userId = `USR${Math.floor(Math.random() * 10000)}`;
    const txnId = `TXN${metrics.totalTransactions}${Date.now().toString().slice(-6)}`;

    return {
      id: txnId,
      transactionId: txnId,
      userId,
      userName,
      type: txType.type,
      icon: txType.icon,
      colorGradient: txType.color,
      amount,
      status,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }),
      location: getRandomItem(cities)
    };
  }

  function generateUserRegistration() {
    metrics.totalUsers++;
    metrics.newSignupsToday++;
    
    const name = getRandomItem(indianNames);
    const city = getRandomItem(cities);
    const userId = `USR${metrics.totalUsers}${Date.now().toString().slice(-6)}`;
    const memberId = `LCR${String(metrics.totalUsers).padStart(6, '0')}`;
    
    return {
      id: userId,
      userId,
      memberId,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      mobile: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      city,
      location: city,
      device: Math.random() > 0.5 ? 'Desktop' : 'Mobile',
      timestamp: new Date().toISOString(),
      joinedTime: new Date().toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };
  }

  function generateStatsUpdate() {
    // Gradually increase metrics to show growth
    if (Math.random() > 0.7) {
      metrics.kycVerifiedUsers = Math.min(metrics.totalUsers, metrics.kycVerifiedUsers + 1);
    }
    
    if (Math.random() > 0.8) {
      metrics.primeUsers = Math.min(metrics.totalUsers, metrics.primeUsers + 1);
    }

    return {
      total_users: metrics.totalUsers,
      new_signups_today: metrics.newSignupsToday,
      kyc_verified_users: metrics.kycVerifiedUsers,
      prime_users: metrics.primeUsers,
      total_transactions: metrics.totalTransactions,
      active_transactions: metrics.activeTransactions,
      timestamp: new Date().toISOString()
    };
  }

  let transactionInterval: NodeJS.Timeout | null = null;
  let userInterval: NodeJS.Timeout | null = null;
  let statsInterval: NodeJS.Timeout | null = null;

  function start() {
    console.log('🚀 Starting real-time data simulator...');

    // Generate new transactions every 3-8 seconds
    transactionInterval = setInterval(() => {
      const transaction = generateTransaction();
      broadcast('transactions', transaction);
      
      // Also update the live transaction count
      broadcast('dashboard-stats', generateStatsUpdate());
    }, Math.random() * 5000 + 3000);

    // Generate new user registrations every 10-20 seconds
    userInterval = setInterval(() => {
      const user = generateUserRegistration();
      broadcast('user-registrations', user);
      
      // Update stats after user registration
      broadcast('dashboard-stats', generateStatsUpdate());
    }, Math.random() * 10000 + 10000);

    // Update general stats every 5 seconds
    statsInterval = setInterval(() => {
      broadcast('dashboard-stats', generateStatsUpdate());
    }, 5000);

    console.log('✅ Data simulator started successfully');
  }

  function stop() {
    if (transactionInterval) clearInterval(transactionInterval);
    if (userInterval) clearInterval(userInterval);
    if (statsInterval) clearInterval(statsInterval);
    console.log('⏹️  Data simulator stopped');
  }

  return { start, stop, metrics };
}
