import type { 
  User, 
  Transaction, 
  Wallet,
  DirectIncome,
  LevelIncome,
  AutoLoan,
  BusinessLoan,
  HomeLoan,
  LoanAgainstProperty,
  MachineLoan,
  PersonalLoan,
  PrivateFunding,
  Banner,
  Device,
  ServiceRegistration,
  ServiceRequest,
  PaymentGateway,
  ServiceJobLog
} from "@shared/schema";

export interface DashboardStats {
  total_users: number;
  prime_users: number;
  total_lcr_money: number;
  total_distributor_lcr_money: number;
  total_distributor_prime_reward: number;
  mobile_recharges: number;
  total_mobile_recharge: number;
  new_signups_today: number;
  kyc_verified_users: number;
  dth_recharges: number;
  total_dth_recharge: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface IStorage {
  // Dashboard methods
  getDashboardStats(): Promise<DashboardStats>;
  getChartData(): Promise<ChartData>;
  getRecentTransactions(limit?: number): Promise<Transaction[]>;
  getRecentUsers(limit?: number): Promise<User[]>;
  
  // User methods
  getAllUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | null>;
  getUserByMobile(mobileNumber: string): Promise<User | null>;
  createUser(data: { fullname: string; MobileNumber: string; Email?: string; LoginPIN: string }): Promise<User>;
  
  // Transaction methods
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  
  // Wallet methods
  getAllWalletTransactions(): Promise<Wallet[]>;
  
  // Loan methods
  getAllAutoLoans(): Promise<AutoLoan[]>;
  getAllBusinessLoans(): Promise<BusinessLoan[]>;
  getAllHomeLoans(): Promise<HomeLoan[]>;
  getAllLoanAgainstProperty(): Promise<LoanAgainstProperty[]>;
  getAllMachineLoans(): Promise<MachineLoan[]>;
  getAllPersonalLoans(): Promise<PersonalLoan[]>;
  getAllPrivateFunding(): Promise<PrivateFunding[]>;
  
  // Banner methods
  getAllBanners(): Promise<Banner[]>;
  
  // Device methods
  getAllDevices(): Promise<Device[]>;
  
  // Service methods
  getAllServiceRegistrations(): Promise<ServiceRegistration[]>;
  getAllServiceRequests(): Promise<ServiceRequest[]>;
  getAllPaymentGateway(): Promise<PaymentGateway[]>;
  getAllServiceJobLogs(): Promise<ServiceJobLog[]>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private transactions: Transaction[] = [];
  private walletTransactions: Wallet[] = [];
  private directIncome: DirectIncome[] = [];
  private levelIncome: LevelIncome[] = [];
  private autoLoans: AutoLoan[] = [];
  private businessLoans: BusinessLoan[] = [];
  private homeLoans: HomeLoan[] = [];
  private loanAgainstProperty: LoanAgainstProperty[] = [];
  private machineLoans: MachineLoan[] = [];
  private personalLoans: PersonalLoan[] = [];
  private privateFunding: PrivateFunding[] = [];
  private banners: Banner[] = [];
  private devices: Device[] = [];
  private serviceRegistrations: ServiceRegistration[] = [];
  private serviceRequests: ServiceRequest[] = [];
  private paymentGateway: PaymentGateway[] = [];
  private serviceJobLogs: ServiceJobLog[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Generate mock users for LCR payment system
    const now = new Date();
    const memberIdPrefix = "LCR";
    
    for (let i = 1; i <= 50; i++) {
      const userId = i;
      const memberId = `${memberIdPrefix}${String(userId).padStart(6, '0')}`;
      const isPrime = i % 3 === 0; // Every 3rd user is prime
      const isKYC = i % 2 === 0; // Every 2nd user is KYC verified
      
      this.users.push({
        UserID: userId,
        fullname: `User ${i}`,
        MobileNumber: `98765${String(43210 + i).padStart(5, '0')}`,
        Email: `user${i}@lcr.com`,
        PasswordHash: null,
        LoginPIN: userId === 1 ? "1234" : null,
        TransactionPIN: null,
        IsKYCCompleted: isKYC,
        introducer_id: i > 1 ? `${memberIdPrefix}${String(Math.floor(i / 2)).padStart(6, '0')}` : null,
        member_id: memberId,
        RewardWalletBalance: `${(Math.random() * 1000).toFixed(2)}`,
        INRWalletBalance: `${(Math.random() * 5000).toFixed(2)}`,
        DeviceVerified: i % 2 === 0,
        CreatedAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        UpdatedAt: null,
        DeletedAt: null,
        IsDeleted: false,
        fingerPrintStatus: i % 2 === 0 ? 1 : 0,
        activation_status: i % 2 === 0,
        aadhar_verification_status: isKYC,
        pan_verification_status: isKYC,
        email_verification_status: i % 3 === 0,
        prime_status: isPrime,
        prime_activation_date: isPrime ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        total_packages: isPrime ? `${(Math.random() * 10000).toFixed(2)}` : "0.00",
      });
    }

    // Generate mock transactions
    const transactionTypes = ['Recharge', 'P2P', 'Withdrawal', 'Deposit', 'Bill Payment', 'DTH', 'Mobile'];
    const statuses = ['Completed', 'Pending', 'Failed', 'Processing'];
    
    for (let i = 1; i <= 100; i++) {
      const txType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const userId = Math.floor(Math.random() * 50) + 1;
      
      this.transactions.push({
        TransactionID: i,
        UserID: userId,
        TransactionType: txType,
        Amount: `${(Math.random() * 1000 + 10).toFixed(2)}`,
        Status: status,
        TransactionPIN: null,
        CreatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        DeletedAt: null,
        IsDeleted: false,
      });
    }

    // Generate mock wallet transactions
    for (let i = 1; i <= 150; i++) {
      const userId = Math.floor(Math.random() * 50) + 1;
      const types = ['credit', 'debit'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      this.walletTransactions.push({
        id: i,
        transaction_by: userId,
        reference_id: `WTX${String(i).padStart(8, '0')}`,
        transaction_amount: `${(Math.random() * 5000 + 100).toFixed(5)}`,
        transaction_type: type,
        purpose: type === 'credit' ? 'Deposit' : 'Withdrawal',
        remark: `Transaction ${i}`,
        transaction_date: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        transaction_mode: 'online',
        utr_no: `UTR${String(i).padStart(12, '0')}`,
        status: 'completed',
        payment_screenshot: null,
      });
    }

    // Generate mock direct income
    const primeUsers = this.users.filter(u => u.prime_status);
    for (let i = 1; i <= 80; i++) {
      const receiverId = Math.floor(Math.random() * 50) + 1;
      const activatedById = primeUsers[Math.floor(Math.random() * primeUsers.length)]?.UserID || 1;
      const packageAmount = (Math.random() * 10000 + 1000);
      const directIncomeAmount = packageAmount * 0.1; // 10% direct income
      
      this.directIncome.push({
        id: i,
        receiver_user_id: receiverId,
        prime_activated_by_user_id: activatedById,
        receiver_member: this.users.find(u => u.UserID === receiverId)?.member_id || null,
        prime_activated_by_member: this.users.find(u => u.UserID === activatedById)?.member_id || null,
        amount: `${directIncomeAmount.toFixed(5)}`,
        package_amount: `${packageAmount.toFixed(5)}`,
        reference_id: `DI${String(i).padStart(8, '0')}`,
        received_date: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      });
    }

    // Generate mock level income
    for (let i = 1; i <= 200; i++) {
      const receiverId = Math.floor(Math.random() * 50) + 1;
      const activatedById = primeUsers[Math.floor(Math.random() * primeUsers.length)]?.UserID || 1;
      const level = Math.floor(Math.random() * 10) + 1; // Levels 1-10
      const packageAmount = (Math.random() * 10000 + 1000);
      const levelIncomePercent = Math.max(0.05, 0.15 - (level * 0.01)); // Decreasing % for higher levels
      const levelIncomeAmount = packageAmount * levelIncomePercent;
      
      this.levelIncome.push({
        id: i,
        receiver_user_id: receiverId,
        prime_activated_by_user_id: activatedById,
        receiver_member: this.users.find(u => u.UserID === receiverId)?.member_id || null,
        prime_activated_by_member: this.users.find(u => u.UserID === activatedById)?.member_id || null,
        level: level,
        amount: `${levelIncomeAmount.toFixed(5)}`,
        package_amount: `${packageAmount.toFixed(5)}`,
        reference_id: `LI${String(i).padStart(8, '0')}`,
        received_date: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      });
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const totalUsers = this.users.length;
    const primeUsers = this.users.filter(u => u.prime_status).length;
    const newSignupsToday = this.users.filter(u => {
      const today = new Date();
      const userDate = u.CreatedAt ? new Date(u.CreatedAt) : new Date();
      return userDate.toDateString() === today.toDateString();
    }).length;
    
    const kycVerified = this.users.filter(u => u.IsKYCCompleted).length;
    
    // Total LCR Money from all users' INR wallet balance
    const totalLcrMoney = this.users.reduce((sum, u) => {
      return sum + parseFloat(u.INRWalletBalance || "0");
    }, 0);

    // Total Distributor LCR Money from all users' wallets (using proper relationship)
    const totalDistributorLcrMoney = this.users.reduce((sum, u) => {
      return sum + parseFloat(u.INRWalletBalance || "0") + parseFloat(u.RewardWalletBalance || "0");
    }, 0);

    // Total Distributor Prime Reward from direct income and level income (using proper foreign key relationships)
    const totalDirectIncome = this.directIncome.reduce((sum, income) => {
      return sum + parseFloat(income.amount || "0");
    }, 0);

    const totalLevelIncome = this.levelIncome.reduce((sum, income) => {
      return sum + parseFloat(income.amount || "0");
    }, 0);

    const totalDistributorPrimeReward = totalDirectIncome + totalLevelIncome;

    // Mobile and DTH recharges count
    const mobileRecharges = this.transactions.filter(t => 
      t.TransactionType === 'Mobile' && t.Status === 'Completed'
    ).length;

    const dthRecharges = this.transactions.filter(t => 
      t.TransactionType === 'DTH' && t.Status === 'Completed'
    ).length;

    return {
      total_users: totalUsers,
      prime_users: primeUsers,
      total_lcr_money: Math.floor(totalLcrMoney),
      total_distributor_lcr_money: Math.floor(totalDistributorLcrMoney),
      total_distributor_prime_reward: Math.floor(totalDistributorPrimeReward),
      mobile_recharges: mobileRecharges,
      total_mobile_recharge: mobileRecharges,
      new_signups_today: newSignupsToday,
      kyc_verified_users: kycVerified,
      dth_recharges: dthRecharges,
      total_dth_recharge: dthRecharges,
    };
  }

  async getChartData(): Promise<ChartData> {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const userSignups = last7Days.map(date => {
      return this.users.filter(u => {
        const userDate = u.CreatedAt ? new Date(u.CreatedAt).toISOString().split('T')[0] : '';
        return userDate === date;
      }).length;
    });

    const transactionCounts = last7Days.map(date => {
      return this.transactions.filter(t => {
        const txDate = t.CreatedAt ? new Date(t.CreatedAt).toISOString().split('T')[0] : '';
        return txDate === date && t.Status === 'Completed';
      }).length;
    });

    return {
      labels: last7Days,
      datasets: [
        {
          label: 'User Signups',
          data: userSignups,
        },
        {
          label: 'Transactions',
          data: transactionCounts,
        },
      ],
    };
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    return this.transactions
      .sort((a, b) => {
        const dateA = a.CreatedAt ? new Date(a.CreatedAt).getTime() : 0;
        const dateB = b.CreatedAt ? new Date(b.CreatedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  async getRecentUsers(limit: number = 10): Promise<User[]> {
    return this.users
      .sort((a, b) => {
        const dateA = a.CreatedAt ? new Date(a.CreatedAt).getTime() : 0;
        const dateB = b.CreatedAt ? new Date(b.CreatedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.find(u => u.UserID === id) || null;
  }

  async getUserByMobile(mobileNumber: string): Promise<User | null> {
    return this.users.find(u => u.MobileNumber === mobileNumber) || null;
  }

  async createUser(data: { fullname: string; MobileNumber: string; Email?: string; LoginPIN: string }): Promise<User> {
    const newId = this.users.length > 0 ? Math.max(...this.users.map(u => u.UserID)) + 1 : 1;
    const memberId = `LCR${String(newId).padStart(6, '0')}`;
    
    const newUser: User = {
      UserID: newId,
      fullname: data.fullname,
      MobileNumber: data.MobileNumber,
      Email: data.Email || null,
      PasswordHash: null,
      LoginPIN: data.LoginPIN,
      TransactionPIN: null,
      IsKYCCompleted: false,
      introducer_id: null,
      member_id: memberId,
      RewardWalletBalance: "0.00",
      INRWalletBalance: "0.00",
      DeviceVerified: false,
      CreatedAt: new Date(),
      UpdatedAt: null,
      DeletedAt: null,
      IsDeleted: false,
      fingerPrintStatus: 0,
      activation_status: true,
      aadhar_verification_status: false,
      pan_verification_status: false,
      email_verification_status: false,
      prime_status: false,
      prime_activation_date: null,
      total_packages: "0.00",
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactions;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return this.transactions.filter(t => t.UserID === userId);
  }

  async getAllWalletTransactions(): Promise<Wallet[]> {
    return this.walletTransactions;
  }

  // Loan methods
  async getAllAutoLoans(): Promise<AutoLoan[]> {
    return this.autoLoans;
  }

  async getAllBusinessLoans(): Promise<BusinessLoan[]> {
    return this.businessLoans;
  }

  async getAllHomeLoans(): Promise<HomeLoan[]> {
    return this.homeLoans;
  }

  async getAllLoanAgainstProperty(): Promise<LoanAgainstProperty[]> {
    return this.loanAgainstProperty;
  }

  async getAllMachineLoans(): Promise<MachineLoan[]> {
    return this.machineLoans;
  }

  async getAllPersonalLoans(): Promise<PersonalLoan[]> {
    return this.personalLoans;
  }

  async getAllPrivateFunding(): Promise<PrivateFunding[]> {
    return this.privateFunding;
  }

  // Banner methods
  async getAllBanners(): Promise<Banner[]> {
    return this.banners;
  }

  // Device methods
  async getAllDevices(): Promise<Device[]> {
    return this.devices;
  }

  // Service methods
  async getAllServiceRegistrations(): Promise<ServiceRegistration[]> {
    return this.serviceRegistrations;
  }

  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    return this.serviceRequests;
  }

  async getAllPaymentGateway(): Promise<PaymentGateway[]> {
    return this.paymentGateway;
  }

  async getAllServiceJobLogs(): Promise<ServiceJobLog[]> {
    return this.serviceJobLogs;
  }
}
