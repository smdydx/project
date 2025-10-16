import type { 
  User, 
  Transaction, 
  Wallet,
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
  mobile_recharges: number;
  new_signups_today: number;
  kyc_verified_users: number;
  dth_recharges: number;
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
        LoginPIN: null,
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
    
    const totalLcrMoney = this.users.reduce((sum, u) => {
      return sum + parseFloat(u.INRWalletBalance || "0");
    }, 0);

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
      mobile_recharges: mobileRecharges,
      new_signups_today: newSignupsToday,
      kyc_verified_users: kycVerified,
      dth_recharges: dthRecharges,
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
