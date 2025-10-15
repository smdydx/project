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
      className={`group relative rounded-2xl p-4 sm:p-5 lg:p-5 border hover-lift transition-all duration-300 overflow-hidden min-h-[180px] sm:min-h-[140px] lg:min-h-[140px] ${
        onClick ? 'cursor-pointer' : ''
      } ${colorClasses[color].cardBg} ${colorClasses[color].border}`}
      onClick={onClick}
    >
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{subtitle}</p>
            <h3 className="text-sm sm:text-sm lg:text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">{title}</h3>
          </div>
          <div className={`w-12 h-12 sm:w-14 sm:h-14 ${colorClasses[color].icon} rounded-xl flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
        </div>

        {/* Value and Trend */}
        <div className="mt-auto">
          {isLoading ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse skeleton"></div>
              <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse skeleton w-3/4"></div>
            </div>
          ) : (
            <>
              <div className="mb-2 sm:mb-2">
                <p className="text-2xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words">
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
    </div>
  );
}