import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface AdvancedStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'pink';
  subtitle?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

const colorClasses = {
  blue: {
    gradient: 'from-blue-600 to-cyan-600',
    light: 'bg-blue-50 dark:bg-blue-900/30',
    cardBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-600/30 dark:to-cyan-600/30',
    icon: 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-xl shadow-blue-500/60',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-700'
  },
  green: {
    gradient: 'from-green-600 to-teal-600',
    light: 'bg-green-50 dark:bg-green-900/30',
    cardBg: 'bg-gradient-to-br from-green-500/20 to-teal-500/20 dark:from-green-600/30 dark:to-teal-600/30',
    icon: 'bg-gradient-to-br from-green-600 to-teal-600 shadow-xl shadow-green-500/60',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-700'
  },
  purple: {
    gradient: 'from-purple-600 to-indigo-600',
    light: 'bg-purple-50 dark:bg-purple-900/30',
    cardBg: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 dark:from-purple-600/30 dark:to-indigo-600/30',
    icon: 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/60',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-700'
  },
  yellow: {
    gradient: 'from-amber-500 to-orange-600',
    light: 'bg-amber-50 dark:bg-amber-900/30',
    cardBg: 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-600/30',
    icon: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/60',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-700'
  },
  red: {
    gradient: 'from-rose-600 to-red-600',
    light: 'bg-rose-50 dark:bg-rose-900/30',
    cardBg: 'bg-gradient-to-br from-rose-500/20 to-red-500/20 dark:from-rose-600/30 dark:to-red-600/30',
    icon: 'bg-gradient-to-br from-rose-600 to-red-600 shadow-xl shadow-rose-500/60',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-700'
  },
  indigo: {
    gradient: 'from-indigo-600 to-violet-600',
    light: 'bg-indigo-50 dark:bg-indigo-900/30',
    cardBg: 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20 dark:from-indigo-600/30 dark:to-violet-600/30',
    icon: 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/60',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-700'
  },
  pink: {
    gradient: 'from-pink-600 to-fuchsia-600',
    light: 'bg-pink-50 dark:bg-pink-900/30',
    cardBg: 'bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 dark:from-pink-600/30 dark:to-fuchsia-600/30',
    icon: 'bg-gradient-to-br from-pink-600 to-fuchsia-600 shadow-xl shadow-pink-500/60',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-700'
  }
};

export default function AdvancedStatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  subtitle,
  isLoading = false,
  onClick
}: AdvancedStatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `₹${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return val.toLocaleString();
      }
    }
    return val;
  };

  const colorConfig = colorClasses[color];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover-lift" style={{ minHeight: '180px' }}>
        <div className="animate-pulse space-y-4 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg sm:rounded-xl ${colorConfig.cardBg} border ${colorConfig.border} backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group h-full`}
      data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      style={{ minHeight: '180px', height: 'auto' }}
    >
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{subtitle}</p>
          </div>
          <div className={`${colorConfig.icon} rounded-lg p-2 sm:p-2.5 lg:p-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-2`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate">{formatValue(value)}</h3>

          {trend && (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className={`flex items-center space-x-1 ${colorConfig.text} bg-white dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md`}>
                  {trend.isPositive ? (
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span className="text-xs sm:text-sm font-semibold">{trend.value}%</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{trend.period}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorConfig.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
    </div>
  );
}