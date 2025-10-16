import { useState } from 'react';
import { Search, Tv, Filter, Download, ChevronDown } from 'lucide-react';
import Card from '@/components/common/Card';

interface DthTransaction {
  id: number;
  transactionId: string;
  user: string;
  subscriberId: string;
  operator: string;
  plan: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
  time: string;
  referenceId: string;
}

const generateDthTransactions = (): DthTransaction[] => {
  const operators = ['Tata Play', 'Airtel DTH', 'Dish TV', 'Sun Direct', 'D2H'];
  const plans = ['Basic HD', 'Premium', 'Sports Pack', 'Entertainment', 'Family Pack'];
  const statuses: ('Success' | 'Pending' | 'Failed')[] = ['Success', 'Pending', 'Failed'];
  
  return Array.from({ length: 50 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      id: i + 1,
      transactionId: `DTH${String(i + 1).padStart(5, '0')}`,
      user: `User ${i + 1}`,
      subscriberId: `SUB${Math.floor(Math.random() * 900000000 + 100000000)}`,
      operator: operators[Math.floor(Math.random() * operators.length)],
      plan: plans[Math.floor(Math.random() * plans.length)],
      amount: Math.floor(Math.random() * 1000) + 200,
      status,
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleTimeString(),
      referenceId: `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };
  });
};

export default function DthTransactions() {
  const [transactions] = useState<DthTransaction[]>(generateDthTransactions());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.subscriberId.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || txn.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3" data-testid="page-title">
            <Tv className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            DTH Transactions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage all DTH recharge transactions</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          data-testid="button-export"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by transaction ID, user, or subscriber ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                data-testid="input-search"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer"
                data-testid="select-filter"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Subscriber ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Operator</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Reference ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr 
                    key={txn.id} 
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    data-testid={`row-transaction-${txn.id}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-testid={`text-txn-id-${txn.id}`}>{txn.transactionId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-user-${txn.id}`}>{txn.user}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-subscriber-${txn.id}`}>{txn.subscriberId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-operator-${txn.id}`}>{txn.operator}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-plan-${txn.id}`}>{txn.plan}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white" data-testid={`text-amount-${txn.id}`}>₹{txn.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(txn.status)}`} data-testid={`status-${txn.id}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300" data-testid={`text-datetime-${txn.id}`}>
                      <div>{txn.date}</div>
                      <div className="text-xs text-gray-400">{txn.time}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono" data-testid={`text-ref-${txn.id}`}>{txn.referenceId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400" data-testid="text-no-results">No transactions found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
