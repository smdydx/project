import type { 
  User, 
  Transaction, 
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

export interface ColumnConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'status';
  format?: (value: any) => string;
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableConfig {
  title: string;
  apiEndpoint: string;
  columns: ColumnConfig[];
  primaryKey: string;
}

export const tableConfigs: Record<string, TableConfig> = {
  users: {
    title: "All Users",
    apiEndpoint: "/api/users",
    primaryKey: "UserID",
    columns: [
      { key: "UserID", label: "User ID", type: "number", sortable: true },
      { key: "fullname", label: "Full Name", type: "text", sortable: true, filterable: true },
      { key: "MobileNumber", label: "Mobile", type: "text", sortable: true, filterable: true },
      { key: "Email", label: "Email", type: "text", sortable: true, filterable: true },
      { key: "member_id", label: "Member ID", type: "text", sortable: true },
      { key: "IsKYCCompleted", label: "KYC Status", type: "boolean", filterable: true },
      { key: "prime_status", label: "Prime Status", type: "boolean", filterable: true },
      { key: "INRWalletBalance", label: "Wallet Balance", type: "currency" },
      { key: "RewardWalletBalance", label: "Reward Balance", type: "currency" },
      { key: "CreatedAt", label: "Registered On", type: "date", sortable: true },
    ]
  },
  
  transactions: {
    title: "All Transactions",
    apiEndpoint: "/api/transactions",
    primaryKey: "TransactionID",
    columns: [
      { key: "TransactionID", label: "TXN ID", type: "number", sortable: true },
      { key: "UserID", label: "User ID", type: "number", sortable: true, filterable: true },
      { key: "TransactionType", label: "Type", type: "text", filterable: true },
      { key: "Amount", label: "Amount", type: "currency", sortable: true },
      { key: "Status", label: "Status", type: "status", filterable: true },
      { key: "CreatedAt", label: "Date", type: "date", sortable: true },
    ]
  },

  autoLoans: {
    title: "Auto Loan Applications",
    apiEndpoint: "/api/loans/auto",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "full_name", label: "Applicant Name", type: "text", sortable: true, filterable: true },
      { key: "phone_number", label: "Phone", type: "text", filterable: true },
      { key: "email", label: "Email", type: "text", filterable: true },
      { key: "vehicle_type", label: "Vehicle Type", type: "text", filterable: true },
      { key: "vehicle_value", label: "Vehicle Value", type: "currency" },
      { key: "emis_paid", label: "EMIs Paid", type: "number" },
      { key: "created_at", label: "Applied On", type: "date", sortable: true },
    ]
  },

  businessLoans: {
    title: "Business Loan Applications",
    apiEndpoint: "/api/loans/business",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "full_name", label: "Applicant Name", type: "text", sortable: true, filterable: true },
      { key: "phone_number", label: "Phone", type: "text", filterable: true },
      { key: "business_name", label: "Business Name", type: "text", filterable: true },
      { key: "business_type", label: "Business Type", type: "text", filterable: true },
      { key: "annual_turnover", label: "Annual Turnover", type: "currency" },
      { key: "loan_amount", label: "Loan Amount", type: "currency" },
      { key: "business_continuity", label: "Years in Business", type: "number" },
      { key: "created_at", label: "Applied On", type: "date", sortable: true },
    ]
  },

  homeLoans: {
    title: "Home Loan Applications",
    apiEndpoint: "/api/loans/home",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "full_name", label: "Applicant Name", type: "text", sortable: true, filterable: true },
      { key: "phone_number", label: "Phone", type: "text", filterable: true },
      { key: "email", label: "Email", type: "text", filterable: true },
      { key: "loan_amount", label: "Loan Amount", type: "currency" },
      { key: "property_value", label: "Property Value", type: "currency" },
      { key: "employment_status", label: "Employment", type: "text", filterable: true },
      { key: "created_at", label: "Applied On", type: "date", sortable: true },
    ]
  },

  loanAgainstProperty: {
    title: "Loan Against Property Applications",
    apiEndpoint: "/api/loans/lap",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "full_name", label: "Applicant Name", type: "text", sortable: true, filterable: true },
      { key: "phone_number", label: "Phone", type: "text", filterable: true },
      { key: "loan_amount", label: "Loan Amount", type: "currency" },
      { key: "property_value", label: "Property Value", type: "currency" },
      { key: "employment_status", label: "Employment", type: "text", filterable: true },
      { key: "created_at", label: "Applied On", type: "date", sortable: true },
    ]
  },

  machineLoans: {
    title: "Machine Loan Applications",
    apiEndpoint: "/api/loans/machine",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "full_name", label: "Applicant Name", type: "text", sortable: true, filterable: true },
      { key: "phone_number", label: "Phone", type: "text", filterable: true },
      { key: "business_name", label: "Business Name", type: "text", filterable: true },
      { key: "machine_type", label: "Machine Type", type: "text", filterable: true },
      { key: "machine_cost", label: "Machine Cost", type: "currency" },
      { key: "loan_amount", label: "Loan Amount", type: "currency" },
      { key: "created_at", label: "Applied On", type: "date", sortable: true },
    ]
  },

  personalLoans: {
    title: "Personal Loan Applications",
    apiEndpoint: "/api/loans/personal",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "full_name", label: "Applicant Name", type: "text", sortable: true, filterable: true },
      { key: "phone_number", label: "Phone", type: "text", filterable: true },
      { key: "employment_status", label: "Employment", type: "text", filterable: true },
      { key: "monthly_income", label: "Monthly Income", type: "currency" },
      { key: "loan_amount", label: "Loan Amount", type: "currency" },
      { key: "tenure", label: "Tenure (months)", type: "number" },
      { key: "cibil_score", label: "CIBIL Score", type: "number" },
      { key: "created_at", label: "Applied On", type: "date", sortable: true },
    ]
  },

  privateFunding: {
    title: "Private Funding Applications",
    apiEndpoint: "/api/loans/private-funding",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "full_name", label: "Applicant Name", type: "text", sortable: true, filterable: true },
      { key: "phone_number", label: "Phone", type: "text", filterable: true },
      { key: "loan_amount", label: "Funding Amount", type: "currency" },
      { key: "annual_turnover", label: "Annual Turnover", type: "currency" },
      { key: "employment_type", label: "Employment Type", type: "text", filterable: true },
      { key: "funding_purpose", label: "Purpose", type: "text" },
      { key: "created_at", label: "Applied On", type: "date", sortable: true },
    ]
  },

  banners: {
    title: "App Banners",
    apiEndpoint: "/api/banners",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "serial_no", label: "Serial No", type: "number", sortable: true },
      { key: "image_url", label: "Image URL", type: "text" },
      { key: "navigation_url", label: "Navigation URL", type: "text" },
      { key: "navigation_type", label: "Type", type: "text", filterable: true },
      { key: "valid_till", label: "Valid Till", type: "date", sortable: true },
    ]
  },

  devices: {
    title: "User Devices",
    apiEndpoint: "/api/devices",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "user_id", label: "User ID", type: "number", sortable: true, filterable: true },
      { key: "platform", label: "Platform", type: "text", filterable: true },
      { key: "app_version", label: "App Version", type: "text" },
      { key: "is_active", label: "Active", type: "boolean", filterable: true },
      { key: "last_seen", label: "Last Seen", type: "date", sortable: true },
      { key: "created_at", label: "Added On", type: "date", sortable: true },
    ]
  },

  serviceRegistrations: {
    title: "Service Registrations",
    apiEndpoint: "/api/service-registrations",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "mobile", label: "Mobile", type: "text", filterable: true },
      { key: "service_type", label: "Service Type", type: "text", filterable: true },
      { key: "registered_at", label: "Registered At", type: "date", sortable: true },
    ]
  },

  serviceRequests: {
    title: "Service Requests",
    apiEndpoint: "/api/service-requests",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "user_id", label: "User ID", type: "number", sortable: true, filterable: true },
      { key: "service_type", label: "Service Type", type: "text", filterable: true },
      { key: "reference_id", label: "Reference ID", type: "text", filterable: true },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "status", label: "Status", type: "status", filterable: true },
      { key: "payment_txn_id", label: "Payment TXN ID", type: "text" },
      { key: "created_at", label: "Created At", type: "date", sortable: true },
    ]
  },

  paymentGateway: {
    title: "Payment Gateway Transactions",
    apiEndpoint: "/api/payment-gateway",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "client_txn_id", label: "Client TXN ID", type: "text", filterable: true },
      { key: "sabpaisa_txn_id", label: "SabPaisa TXN ID", type: "text", filterable: true },
      { key: "payer_name", label: "Payer Name", type: "text", filterable: true },
      { key: "payer_mobile", label: "Mobile", type: "text", filterable: true },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "payment_mode", label: "Mode", type: "text", filterable: true },
      { key: "bank_name", label: "Bank", type: "text" },
      { key: "status", label: "Status", type: "status", filterable: true },
      { key: "purpose", label: "Purpose", type: "text", filterable: true },
      { key: "created_at", label: "Created At", type: "date", sortable: true },
    ]
  },

  serviceJobLogs: {
    title: "Service Job Logs",
    apiEndpoint: "/api/service-job-logs",
    primaryKey: "id",
    columns: [
      { key: "id", label: "ID", type: "number", sortable: true },
      { key: "service_request_id", label: "Service Request ID", type: "number", filterable: true },
      { key: "job_type", label: "Job Type", type: "text", filterable: true },
      { key: "status", label: "Status", type: "status", filterable: true },
      { key: "message", label: "Message", type: "text" },
      { key: "created_at", label: "Created At", type: "date", sortable: true },
    ]
  },
};

export function formatCellValue(value: any, type?: string): string {
  if (value === null || value === undefined) return '-';
  
  switch (type) {
    case 'currency':
      return `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'date':
      return new Date(value).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'boolean':
      return value ? '✓ Yes' : '✗ No';
    case 'status':
      return value.toString().toUpperCase();
    default:
      return value.toString();
  }
}

export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('success') || statusLower.includes('completed') || statusLower.includes('paid')) {
    return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
  }
  if (statusLower.includes('pending') || statusLower.includes('processing')) {
    return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
  }
  if (statusLower.includes('failed') || statusLower.includes('rejected')) {
    return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
  }
  return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
}
