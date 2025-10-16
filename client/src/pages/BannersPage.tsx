import { DynamicDataTable } from "../components/common/DynamicDataTable";
import { tableConfigs } from "../config/tableConfig";

export function BannersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="heading-banners">
          App Banners
        </h1>
      </div>

      <DynamicDataTable config={tableConfigs.banners} />
    </div>
  );
}
