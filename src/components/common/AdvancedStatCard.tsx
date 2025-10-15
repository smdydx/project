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
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500',
    light: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-500',
    light: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400'
  },
  yellow: {
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500',
    light: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-600 dark:text-yellow-400'
  },
  red: {
    gradient: 'from-red-500 to-pink-600',
    bg: 'bg-red-500',
    light: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400'
  },
  purple: {
    gradient: 'from-purple-500 to-indigo-600',
    bg: 'bg-purple-500',
    light: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400'
  },
  indigo: {
    gradient: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-500',
    light: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400'
  },
  pink: {
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-500',
    light: 'bg-pink-50 dark:bg-pink-900/20',
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
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover-lift transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } group relative overflow-hidden`}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`w-full h-full bg-gradient-to-br ${colorConfig.gradient}`}></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">{subtitle}</p>
            )}
            
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                {formatValue(value)}
              </p>
              
              {trend && (
                <div className={`flex items-center space-x-1 ${
                  trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {trend.isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </span>
                </div>
              )}
            </div>
            
            {trend && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {trend.period || 'from yesterday'}
              </p>
            )}
          </div>
          
          <div className={`relative w-16 h-16 bg-gradient-to-br ${colorConfig.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <Icon className="w-8 h-8 text-white" />
            
            {/* Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorConfig.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
          </div>
        </div>
        
        {/* Progress Bar (if trend exists) */}
        {trend && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full bg-gradient-to-r ${colorConfig.gradient} transition-all duration-500`}
                style={{ width: `${Math.min(Math.abs(trend.value), 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}