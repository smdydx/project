import { useState, useEffect } from 'react';
import { Tv } from 'lucide-react';
import Card from '@/components/common/Card';
import AdvancedRealtimeTable from '@/components/common/AdvancedRealtimeTable';

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

const generateDthTransactions = async (): Promise<DthTransaction[]> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/api/v1/transactions/dth?limit=100`, { headers });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching DTH transactions:', error);
    return [];
  }
};

export default function DthTransactions() {
  const [transactions, setTransactions] = useState<DthTransaction[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      const data = await generateDthTransactions();
      setTransactions(data);
    };
    loadTransactions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const columns = [
    {
      key: 'transactionId',
      title: 'Transaction ID',
      sortable: true,
      render: (value: string, row: any) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`text-txn-id-${row.id}`}>
          {value}
        </span>
      )
    },
    {
      key: 'user',
      title: 'User',
      sortable: true,
      render: (value: string, row: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-user-${row.id}`}>
          {value}
        </span>
      )
    },
    {
      key: 'subscriberId',
      title: 'Subscriber ID',
      sortable: true,
      render: (value: string, row: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-subscriber-${row.id}`}>
          {value}
        </span>
      )
    },
    {
      key: 'operator',
      title: 'Operator',
      sortable: true,
      render: (value: string, row: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-operator-${row.id}`}>
          {value}
        </span>
      )
    },
    {
      key: 'plan',
      title: 'Plan',
      sortable: true,
      render: (value: string, row: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-plan-${row.id}`}>
          {value}
        </span>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value: number, row: any) => (
        <span className="text-sm font-semibold text-gray-900 dark:text-white" data-testid={`text-amount-${row.id}`}>
          ₹{value}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string, row: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`} data-testid={`status-${row.id}`}>
          {value}
        </span>
      )
    },
    {
      key: 'date',
      title: 'Date & Time',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-datetime-${row.id}`}>
          <div>{value}</div>
          <div className="text-xs text-gray-400">{row.time}</div>
        </div>
      )
    },
    {
      key: 'referenceId',
      title: 'Reference ID',
      sortable: true,
      render: (value: string, row: any) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono" data-testid={`text-ref-${row.id}`}>
          {value}
        </span>
      )
    }
  ];

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
      </div>

      <AdvancedRealtimeTable
        title="DTH Transactions"
        columns={columns}
        data={transactions}
        onDataUpdate={generateDthTransactions}
        updateInterval={8000}
        searchPlaceholder="Search by transaction ID, user, or subscriber ID..."
        showStats={true}
        enableAnimations={true}
        dataTestId="dth-transactions-table"
      />
    </div>
  );
}
