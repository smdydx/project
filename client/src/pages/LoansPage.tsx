import { useState } from "react";
import { DynamicDataTable } from "../components/common/DynamicDataTable";
import { tableConfigs } from "../config/tableConfig";

const loanTypes = [
  { key: 'autoLoans', label: 'Auto Loans' },
  { key: 'businessLoans', label: 'Business Loans' },
  { key: 'homeLoans', label: 'Home Loans' },
  { key: 'loanAgainstProperty', label: 'Loan Against Property' },
  { key: 'machineLoans', label: 'Machine Loans' },
  { key: 'personalLoans', label: 'Personal Loans' },
  { key: 'privateFunding', label: 'Private Funding' },
];

export function LoansPage() {
  const [selectedLoanType, setSelectedLoanType] = useState('autoLoans');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="heading-loans">
          Loan Applications
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex gap-2 overflow-x-auto">
          {loanTypes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedLoanType(key)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedLoanType === key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              data-testid={`button-loan-type-${key}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <DynamicDataTable config={tableConfigs[selectedLoanType]} />
    </div>
  );
}
