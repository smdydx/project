import { useState } from "react";
import { DynamicDataTable } from "../components/common/DynamicDataTable";
import { tableConfigs } from "../config/tableConfig";

const serviceTypes = [
  { key: 'serviceRequests', label: 'Service Requests' },
  { key: 'serviceRegistrations', label: 'Service Registrations' },
  { key: 'serviceJobLogs', label: 'Service Job Logs' },
];

export function ServicesPage() {
  const [selectedType, setSelectedType] = useState('serviceRequests');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="heading-services">
          Service Management
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex gap-2">
          {serviceTypes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              data-testid={`button-service-type-${key}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <DynamicDataTable config={tableConfigs[selectedType]} />
    </div>
  );
}
