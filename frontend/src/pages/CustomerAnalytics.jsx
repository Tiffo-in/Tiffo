import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowLeftIcon,
  CurrencyRupeeIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import api from '../services/api';

const CustomerAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
      const response = await api.get(`/analytics/customers`, {
        params: { days: daysMap[timeRange] },
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      // Non-critical — leave loading state for error UI
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleExport = async (type) => {
    try {
      const response = await api.get(`/analytics/export`, {
        params: { type },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Export silently fails — user can retry
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const maxAcquisition = Math.max(...stats.acquisition.map((a) => a.customers));

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 dark:from-purple-900 dark:via-purple-800 dark:to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-[110px] pb-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </Link>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Customer Analytics</h1>
                <p className="text-white/80 text-sm">Insights and trends</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1">
                {['7d', '30d', '90d', '1y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-white text-purple-600'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <button className="px-4 py-2 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-all flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-4 h-4" /> Export
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => handleExport('customers')}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                    >
                      Export Customers
                    </button>
                    <button
                      onClick={() => handleExport('revenue')}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                    >
                      Export Revenue
                    </button>
                    <button
                      onClick={() => handleExport('subscriptions')}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                    >
                      Export Subscriptions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-12 mb-8">
          {[
            {
              label: 'Total Customers',
              value: stats.overview.totalCustomers.toLocaleString(),
              change: `${stats.overview.customerGrowth >= 0 ? '+' : ''}${stats.overview.customerGrowth}%`,
              trendDirection: stats.overview.customerGrowth >= 0 ? 'up' : 'down',
              trendColor: stats.overview.customerGrowth >= 0 ? 'green' : 'amber',
              icon: UserGroupIcon,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              label: 'New This Period',
              value: stats.overview.newCustomers,
              change: `${stats.overview.newCustomersGrowth >= 0 ? '+' : ''}${stats.overview.newCustomersGrowth}%`,
              trendDirection: stats.overview.newCustomersGrowth >= 0 ? 'up' : 'down',
              trendColor: stats.overview.newCustomersGrowth >= 0 ? 'green' : 'amber',
              icon: SparklesIcon,
              color: 'from-green-500 to-emerald-500',
            },
            {
              label: 'Avg Lifetime Value',
              value: formatCurrency(stats.overview.avgLifetimeValue),
              change: `${stats.overview.avgLifetimeValueGrowth >= 0 ? '+' : ''}${stats.overview.avgLifetimeValueGrowth}%`,
              trendDirection: stats.overview.avgLifetimeValueGrowth >= 0 ? 'up' : 'down',
              trendColor: stats.overview.avgLifetimeValueGrowth >= 0 ? 'green' : 'amber',
              icon: CurrencyRupeeIcon,
              color: 'from-purple-500 to-pink-500',
            },
            {
              label: 'Churn Rate',
              value: `${stats.overview.churnRate}%`,
              change: `${stats.overview.churnRateGrowth >= 0 ? '+' : ''}${stats.overview.churnRateGrowth}%`,
              trendDirection: stats.overview.churnRateGrowth >= 0 ? 'up' : 'down',
              trendColor: stats.overview.churnRateGrowth <= 0 ? 'green' : 'amber', // Lower churn is good
              icon: ArrowTrendingDownIcon,
              color: 'from-amber-500 to-orange-500',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trendColor === 'green' ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {stat.trendDirection === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4" />
                  )}
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Acquisition Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
          >
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Customer Acquisition</h3>
            <div className="flex items-end gap-3 h-48">
              {stats.acquisition.map((item, index) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.customers / maxAcquisition) * 100}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-purple-500 to-pink-400 dark:from-purple-800 dark:to-pink-700 rounded-t-lg relative group"
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.customers}
                    </span>
                  </motion.div>
                  <span className="text-xs text-neutral-500">{item.month}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Retention Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
          >
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Retention Rate</h3>
            <div className="space-y-3">
              {[
                { label: 'Week 1', value: stats.retention.week1 },
                { label: 'Week 2', value: stats.retention.week2 },
                { label: 'Month 1', value: stats.retention.month1 },
                { label: 'Month 3', value: stats.retention.month3 },
                { label: 'Month 6', value: stats.retention.month6 },
              ].map((item, index) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600">{item.label}</span>
                    <span className="font-medium text-neutral-900">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-700 dark:to-emerald-700 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Top Customers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
          >
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Top Customers</h3>
            <div className="space-y-3">
              {stats.topCustomers.map((customer, index) => (
                <div
                  key={customer._id}
                  className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 truncate">{customer.name}</span>
                      {index < 3 && <CheckBadgeIcon className="w-4 h-4 text-purple-500" />}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                      <span>{customer.orders} orders</span>
                      <span className="flex items-center gap-1">
                        <StarIcon className="w-3 h-3 text-amber-500" />
                        {customer.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(customer.spent)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Subscription Distribution & Demographics */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
            >
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Subscription Plans</h3>
              <div className="flex gap-4">
                {[
                  { plan: 'Daily', percent: stats.subscriptionTrends.daily, color: 'bg-blue-500' },
                  {
                    plan: 'Weekly',
                    percent: stats.subscriptionTrends.weekly,
                    color: 'bg-purple-500',
                  },
                  {
                    plan: 'Monthly',
                    percent: stats.subscriptionTrends.monthly,
                    color: 'bg-green-500',
                  },
                ].map((item) => (
                  <div key={item.plan} className="flex-1 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="#e5e5e5"
                          strokeWidth="6"
                        />
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeLinecap="round"
                          initial={{ strokeDasharray: '0 176' }}
                          animate={{ strokeDasharray: `${item.percent * 1.76} 176` }}
                          transition={{ delay: 0.6, duration: 1 }}
                          className={item.color.replace('bg-', 'text-')}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-bold text-neutral-900">
                        {item.percent}%
                      </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-600">{item.plan}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
            >
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Top Locations</h3>
              <div className="space-y-3">
                {stats.demographics.locations.map((loc, index) => (
                  <div key={loc.city} className="flex items-center gap-3">
                    <span className="w-6 text-sm text-neutral-400">{index + 1}</span>
                    <span className="flex-1 font-medium text-neutral-700">{loc.city}</span>
                    <span className="text-sm font-medium text-neutral-900">{loc.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;
