import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  LightBulbIcon,
  TrophyIcon,
  FireIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalVisits: 0,
    totalSubscriptions: 0,
    conversionRate: 0,
    todayVisits: 0,
    todaySubscriptions: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await api.get('/partner/analytics');
      if (response.data.success) {
        setAnalytics(response.data.data);
        setChartData(response.data.data.chartData || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const maxVisits = Math.max(...chartData.map((d) => d.visits), 1);
  const maxSubs = Math.max(...chartData.map((d) => d.subscriptions), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-32 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-neutral-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-80 bg-neutral-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-[110px] pb-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">📊</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                    <CheckBadgeIcon className="w-6 h-6 text-blue-200" />
                  </div>
                  <p className="text-white/80 text-sm mt-0.5 flex items-center">
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    Business insights & performance
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">Conversion Rate</p>
                <p className="text-3xl font-bold text-white">{analytics.conversionRate}%</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 -mt-12"
        >
          {[
            {
              label: 'Total Visits',
              value: analytics.totalVisits.toLocaleString(),
              subtitle: 'All time visitors',
              icon: '👥',
              color: 'bg-blue-50',
              textColor: 'text-blue-600',
              iconBg: 'from-blue-500 to-cyan-500',
            },
            {
              label: 'Subscriptions',
              value: analytics.totalSubscriptions.toLocaleString(),
              subtitle: 'Total customers',
              icon: '📋',
              color: 'bg-green-50',
              textColor: 'text-green-600',
              iconBg: 'from-green-500 to-emerald-500',
            },
            {
              label: 'Conversion Rate',
              value: `${analytics.conversionRate}%`,
              subtitle: 'Visits to subscriptions',
              icon: '📈',
              color: 'bg-amber-50',
              textColor: 'text-amber-600',
              iconBg: 'from-amber-500 to-orange-500',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-neutral-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center`}
                >
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${stat.iconBg} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${stat.textColor} mb-1`}>{stat.value}</p>
              <p className="text-sm text-neutral-500 mb-1">{stat.label}</p>
              <p className="text-xs text-neutral-400">{stat.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Today's Stats & Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FireIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Today's Performance</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👀</span>
                  <span className="text-neutral-700 font-medium">Visits Today</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{analytics.todayVisits}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <span className="text-neutral-700 font-medium">Subscriptions Today</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {analytics.todaySubscriptions}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <span className="text-neutral-700 font-medium">Today's Conversion</span>
                </div>
                <span className="text-2xl font-bold text-amber-600">
                  {analytics.todayVisits > 0
                    ? Math.round((analytics.todaySubscriptions / analytics.todayVisits) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <RocketLaunchIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Quick Stats</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-xl">
                <span className="text-neutral-700 font-medium">Avg. Daily Visits</span>
                <span className="text-lg font-bold text-neutral-900">
                  {Math.round(
                    chartData.reduce((sum, day) => sum + day.visits, 0) / chartData.length
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-xl">
                <span className="text-neutral-700 font-medium">Avg. Daily Subscriptions</span>
                <span className="text-lg font-bold text-neutral-900">
                  {Math.round(
                    chartData.reduce((sum, day) => sum + day.subscriptions, 0) / chartData.length
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <span className="text-neutral-700 font-medium">Best Performing Day</span>
                <span className="text-lg font-bold text-green-600">
                  {new Date(
                    chartData.reduce(
                      (best, day) => (day.subscriptions > best.subscriptions ? day : best),
                      chartData[0]
                    )?.date
                  ).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Weekly Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-5 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Last 7 Days Performance</h3>
                  <p className="text-sm text-neutral-500">Daily visits and subscriptions</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></span>
                  Visits
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></span>
                  Subscriptions
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {chartData.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-16 text-sm font-semibold text-neutral-600">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>

                  {/* Visits Bar */}
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-neutral-500">Visits</span>
                      <span className="font-bold text-blue-600">{day.visits}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.visits / maxVisits) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Subscriptions Bar */}
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-neutral-500">Subscriptions</span>
                      <span className="font-bold text-green-600">{day.subscriptions}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.subscriptions / maxSubs) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="w-20 text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        Math.round((day.subscriptions / day.visits) * 100) >= 15
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {Math.round((day.subscriptions / day.visits) * 100)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Insights & Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Insights */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <LightBulbIcon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Insights</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Conversion rate insight */}
              <div
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  analytics.conversionRate >= 15
                    ? 'bg-green-50 border-green-100'
                    : 'bg-amber-50 border-amber-100'
                }`}
              >
                <span className="text-xl">{analytics.conversionRate >= 15 ? '✅' : '⚠️'}</span>
                <div>
                  <p
                    className={`font-medium ${analytics.conversionRate >= 15 ? 'text-green-800' : 'text-amber-800'}`}
                  >
                    {analytics.conversionRate >= 15
                      ? 'Great conversion rate!'
                      : 'Conversion rate needs attention'}
                  </p>
                  <p
                    className={`text-sm ${analytics.conversionRate >= 15 ? 'text-green-600' : 'text-amber-600'}`}
                  >
                    Your {analytics.conversionRate}% rate is{' '}
                    {analytics.conversionRate >= 15 ? 'above' : 'below'} the 15% industry target.
                  </p>
                </div>
              </div>
              {/* Peak day insight */}
              {chartData.length > 0 &&
                (() => {
                  const best = chartData.reduce(
                    (b, d) => (d.visits > b.visits ? d : b),
                    chartData[0]
                  );
                  const dayName = new Date(best.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                  });
                  return (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <span className="text-xl">📅</span>
                      <div>
                        <p className="font-medium text-blue-800">Peak day detected</p>
                        <p className="text-sm text-blue-600">
                          Highest traffic: <strong>{dayName}</strong> with {best.visits} visits.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              {/* Today performance */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="font-medium text-amber-800">Today's performance</p>
                  <p className="text-sm text-amber-600">
                    {analytics.todaySubscriptions >= 8
                      ? 'Excellent! Above your daily average.'
                      : analytics.todaySubscriptions >= 3
                        ? 'Good start, keep pushing!'
                        : 'Slow day — consider running a discount offer.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Goals */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrophyIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Goals Progress</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Monthly Subscriptions Goal */}
              {(() => {
                const goal = 200;
                const current = analytics.totalSubscriptions || 0;
                const pct = Math.min(100, Math.round((current / goal) * 100));
                const remaining = Math.max(0, goal - current);
                return (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-neutral-700">Monthly Subscriptions</span>
                      <span className="text-sm font-bold text-green-600">
                        {current}/{goal}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {remaining > 0
                        ? `${remaining} more to hit your goal! 🎯`
                        : 'Goal reached! 🎉'}
                    </p>
                  </div>
                );
              })()}

              {/* Conversion Rate Goal */}
              {(() => {
                const goal = 18;
                const current = analytics.conversionRate || 0;
                const pct = Math.min(100, Math.round((current / goal) * 100));
                const diff = (goal - current).toFixed(1);
                return (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-neutral-700">Conversion Rate Goal</span>
                      <span className="text-sm font-bold text-amber-600">
                        {current}%/{goal}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {current >= goal ? 'Goal reached! 🎉' : `${diff}% away from your target! 💪`}
                    </p>
                  </div>
                );
              })()}

              {/* Weekly Visits Goal */}
              {(() => {
                const weekTotal = chartData.reduce((s, d) => s + (d.visits || 0), 0);
                const goal = 300;
                const pct = Math.min(100, Math.round((weekTotal / goal) * 100));
                return (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-neutral-700">Weekly Visits Target</span>
                      <span className="text-sm font-bold text-blue-600">
                        {weekTotal}/{goal}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Great traffic this week! 📈</p>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
