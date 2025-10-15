import React from 'react';
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
    gradient: 'from-blue-500 to-blue-700',
    light: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/50',
    text: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    gradient: 'from-green-500 to-emerald-700',
    light: 'bg-green-50 dark:bg-green-900/20',
    icon: 'bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg shadow-green-500/50',
    text: 'text-green-600 dark:text-green-400'
  },
  purple: {
    gradient: 'from-purple-500 to-violet-700',
    light: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'bg-gradient-to-br from-purple-500 to-violet-700 shadow-lg shadow-purple-500/50',
    text: 'text-purple-600 dark:text-purple-400'
  },
  yellow: {
    gradient: 'from-yellow-500 to-orange-600',
    light: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/50',
    text: 'text-yellow-600 dark:text-yellow-400'
  },
  red: {
    gradient: 'from-red-500 to-pink-700',
    light: 'bg-red-50 dark:bg-red-900/20',
    icon: 'bg-gradient-to-br from-red-500 to-pink-700 shadow-lg shadow-red-500/50',
    text: 'text-red-600 dark:text-red-400'
  },
  indigo: {
    gradient: 'from-indigo-500 to-blue-700',
    light: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: 'bg-gradient-to-br from-indigo-500 to-blue-700 shadow-lg shadow-indigo-500/50',
    text: 'text-indigo-600 dark:text-indigo-400'
  },
  pink: {
    gradient: 'from-pink-500 to-rose-700',
    light: 'bg-pink-50 dark:bg-pink-900/20',
    icon: 'bg-gradient-to-br from-pink-500 to-rose-700 shadow-lg shadow-pink-500/50',
    text: 'text-pink-600 dark:text-pink-400'
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-gray-700 hover-lift transition-all duration-300 overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${colorClasses[color].light}`}
      onClick={onClick}
    >
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{subtitle}</p>
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{title}</h3>
          </div>
          <div className={`w-12 h-12 sm:w-14 sm:h-14 ${colorClasses[color].icon} rounded-xl flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
        </div>

        {/* Value and Trend */}
        {isLoading ? (
          <div className="space-y-2 sm:space-y-3">
            <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse skeleton"></div>
            <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse skeleton w-3/4"></div>
          </div>
        ) : (
          <>
            <div className="mb-3 sm:mb-4">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words">
                {formatValue(value)}
              </p>
            </div>

            {trend && (
              <div className={`inline-flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${colorClasses[color].light}`}>
                <div className={`flex items-center space-x-1 ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {trend.isPositive ? (
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span className="text-xs sm:text-sm font-bold">
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                  {trend.period}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}