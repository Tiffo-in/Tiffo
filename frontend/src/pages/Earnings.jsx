import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BanknotesIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon, SparklesIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import { toast } from 'react-hot-toast';
const Earnings = () => {
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
  });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const response = await api.get('/partner/earnings');
      if (response.data.success) {
        setEarnings(
          response.data.data.earnings || { today: 0, thisWeek: 0, thisMonth: 0, total: 0 }
        );
        setPayments(response.data.data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'paid':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircleIcon,
          iconColor: 'text-green-500',
        };
      case 'pending':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: ClockIcon,
          iconColor: 'text-amber-500',
        };
      case 'failed':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: XCircleIcon,
          iconColor: 'text-red-500',
        };
      default:
        return {
          color: 'bg-neutral-100 text-neutral-700 border-neutral-200',
          icon: ClockIcon,
          iconColor: 'text-neutral-500',
        };
    }
  };

  const getMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'upi':
        return '📱';
      case 'card':
        return '💳';
      case 'cash':
        return '💵';
      default:
        return '💰';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      label: 'Today',
      value: earnings.today,
      icon: '💰',
      color: 'bg-green-50',
      textColor: 'text-green-600',
      change: earnings.todayChange
        ? `${earnings.todayChange > 0 ? '+' : ''}${earnings.todayChange}% vs yesterday`
        : '',
      changeType: (earnings.todayChange ?? 0) >= 0 ? 'positive' : 'negative',
    },
    {
      label: 'This Week',
      value: earnings.thisWeek,
      icon: '📊',
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: earnings.weekChange
        ? `${earnings.weekChange > 0 ? '+' : ''}${earnings.weekChange}% vs last week`
        : '',
      changeType: (earnings.weekChange ?? 0) >= 0 ? 'positive' : 'negative',
    },
    {
      label: 'This Month',
      value: earnings.thisMonth,
      icon: '📈',
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: earnings.monthChange
        ? `${earnings.monthChange > 0 ? '+' : ''}${earnings.monthChange}% vs last month`
        : '',
      changeType: (earnings.monthChange ?? 0) >= 0 ? 'positive' : 'negative',
    },
    {
      label: 'Total Earnings',
      value: earnings.total,
      icon: '🏆',
      color: 'bg-amber-50',
      textColor: 'text-amber-600',
      change: 'All time',
      changeType: 'neutral',
    },
  ];

  // Dynamically calculate summaries from payments list
  const paymentMethodsSummary = useMemo(() => {
    const methods = { UPI: 0, Card: 0, Cash: 0 };
    payments.forEach((p) => {
      const amt = parseFloat(p.amount) || 0;
      if (p.method?.toLowerCase() === 'upi') methods.UPI += amt;
      else if (p.method?.toLowerCase() === 'card') methods.Card += amt;
      else if (p.method?.toLowerCase() === 'cash') methods.Cash += amt;
      else methods.Card += amt; // Default
    });
    return [
      { method: 'UPI', amount: methods.UPI, icon: '📱', color: 'bg-purple-500' },
      { method: 'Card', amount: methods.Card, icon: '💳', color: 'bg-blue-500' },
      { method: 'Cash', amount: methods.Cash, icon: '💵', color: 'bg-green-500' },
    ];
  }, [payments]);

  const paymentStatusSummary = useMemo(() => {
    const statuses = { paid: 0, pending: 0, failed: 0 };
    payments.forEach((p) => {
      const amt = parseFloat(p.amount) || 0;
      if (p.status === 'paid' || p.status === 'success') statuses.paid += amt;
      else if (p.status === 'pending') statuses.pending += amt;
      else statuses.failed += amt;
    });
    return [
      { status: 'Paid', amount: statuses.paid, color: 'text-green-600', bg: 'bg-green-100' },
      { status: 'Pending', amount: statuses.pending, color: 'text-amber-600', bg: 'bg-amber-100' },
      { status: 'Failed', amount: statuses.failed, color: 'text-red-600', bg: 'bg-red-100' },
    ];
  }, [payments]);

  const planRevenueSummary = useMemo(() => {
    const plans = { daily: 0, weekly: 0, monthly: 0 };
    let total = 0;
    payments.forEach((p) => {
      const amt = parseFloat(p.amount) || 0;
      total += amt;
      if (p.plan?.toLowerCase() === 'daily' || p.plan?.toLowerCase() === 'one-time')
        plans.daily += amt;
      else if (p.plan?.toLowerCase() === 'weekly') plans.weekly += amt;
      else if (p.plan?.toLowerCase() === 'monthly') plans.monthly += amt;
    });

    return [
      {
        plan: 'Daily',
        amount: plans.daily,
        percentage: total > 0 ? Math.round((plans.daily / total) * 100) : 0,
      },
      {
        plan: 'Weekly',
        amount: plans.weekly,
        percentage: total > 0 ? Math.round((plans.weekly / total) * 100) : 0,
      },
      {
        plan: 'Monthly',
        amount: plans.monthly,
        percentage: total > 0 ? Math.round((plans.monthly / total) * 100) : 0,
      },
    ];
  }, [payments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-32 bg-gradient-to-r from-primary-200 to-secondary-200 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-neutral-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-neutral-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 relative overflow-hidden">
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
                  <span className="text-3xl">💰</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-white">Earnings & Payments</h1>
                    <CheckBadgeIcon className="w-6 h-6 text-green-200" />
                  </div>
                  <p className="text-white/80 text-sm mt-0.5 flex items-center">
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    Track your revenue
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">Total Earnings</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(earnings.total)}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Earnings Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 border border-neutral-100"
            >
              <div
                className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}
              >
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                {formatCurrency(stat.value)}
              </p>
              <p className="text-sm text-neutral-500 mb-1">{stat.label}</p>
              <p
                className={`text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-neutral-400'
                }`}
              >
                {stat.change}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BanknotesIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Recent Payments</h2>
                  <p className="text-sm text-neutral-500">Latest transactions from customers</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                {payments.length} transactions
              </span>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-neutral-700 mb-2">No payments yet</h3>
              <p className="text-neutral-500">
                Payments will appear here once customers start subscribing.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="text-left py-4 px-6 font-semibold text-neutral-600 text-sm uppercase tracking-wide">
                      Customer
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-600 text-sm uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-600 text-sm uppercase tracking-wide">
                      Plan
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-600 text-sm uppercase tracking-wide">
                      Date
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-600 text-sm uppercase tracking-wide">
                      Method
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-600 text-sm uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => {
                    const statusConfig = getStatusConfig(payment.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-bold">
                                {payment.customerName.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium text-neutral-900">
                              {payment.customerName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-green-600 text-lg">
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                            {payment.plan}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-neutral-600">
                            {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{getMethodIcon(payment.method)}</span>
                            <span className="text-neutral-700">{payment.method}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}
                          >
                            <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                            <span className="capitalize">{payment.status}</span>
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Payment Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Payment Methods */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Payment Methods</h3>
            </div>
            <div className="space-y-4">
              {paymentMethodsSummary.map((item, index) => (
                <div key={item.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-neutral-700">{item.method}</span>
                  </div>
                  <span className="font-bold text-neutral-900">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payment Status */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Payment Status</h3>
            </div>
            <div className="space-y-4">
              {paymentStatusSummary.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 ${item.bg} ${item.color} rounded-full text-sm font-medium`}
                  >
                    {item.status}
                  </span>
                  <span className={`font-bold ${item.color}`}>{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Plan Revenue */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Plan Revenue</h3>
            </div>
            <div className="space-y-4">
              {planRevenueSummary.map((item) => (
                <div key={item.plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neutral-700">{item.plan}</span>
                    <span className="font-bold text-neutral-900">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Earnings;
