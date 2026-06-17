import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import CustomerCalendar from '../components/CustomerCalendar';
import CustomerSelector from '../components/CustomerSelector';
import CustomerDetails from '../components/CustomerDetails';
import {
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  SparklesIcon,
  BellIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/solid';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    activeSubscriptions: 0,
    todayDeliveries: 0,
    pendingDeliveries: 0,
    monthlyEarnings: 0,
    earningsChange: null,
    avgRating: null,
    reviewCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/partner/stats');
        if (res.data.success) setStatsData(res.data.data);
      } catch (err) {
        console.error('Failed to load partner stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const { user } = useSelector((state) => state.auth);
  const partner = user || { name: 'Partner' };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  // Dashboard Stats — driven by /partner/stats API
  const val = (v) => (statsLoading ? '—' : v);

  const stats = [
    {
      label: 'Active Subscriptions',
      value: val(statsData.activeSubscriptions),
      change: statsLoading ? '' : `${statsData.activeSubscriptions} active`,
      changeType: 'neutral',
      icon: UserGroupIcon,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: "Today's Deliveries",
      value: val(statsData.todayDeliveries),
      change: statsLoading ? '' : `${statsData.pendingDeliveries} pending`,
      changeType: statsData.pendingDeliveries > 0 ? 'neutral' : 'positive',
      icon: ClipboardDocumentListIcon,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Monthly Earnings',
      value: statsLoading ? '—' : `₹${statsData.monthlyEarnings.toLocaleString('en-IN')}`,
      change: statsLoading
        ? ''
        : statsData.earningsChange !== null
          ? `${statsData.earningsChange >= 0 ? '+' : ''}${statsData.earningsChange}% vs last month`
          : 'First month',
      changeType: (statsData.earningsChange ?? 0) >= 0 ? 'positive' : 'negative',
      icon: CurrencyRupeeIcon,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Customer Rating',
      value: statsLoading ? '—' : (statsData.avgRating ?? 'N/A'),
      change: statsLoading ? '' : `${statsData.reviewCount} reviews`,
      changeType: 'neutral',
      icon: TrophyIcon,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
  ];

  // Quick Actions
  const quickActions = [
    {
      id: 'profile',
      title: 'Profile & Location',
      description: 'Update your business details and delivery area',
      icon: BuildingStorefrontIcon,
      emoji: '🏪',
      route: '/partner/profile',
      color: 'from-primary-500 to-primary-600',
      highlight: true,
      badge: 'Required',
    },
    {
      id: 'ads',
      title: 'Ad Manager',
      description: 'Boost listings and check wallet',
      icon: MegaphoneIcon,
      emoji: '📢',
      route: '/partner/ads',
      color: 'from-fuchsia-500 to-rose-500',
      badge: 'Beta',
    },
    {
      id: 'tiffins',
      title: 'My Tiffins',
      description: 'Manage your menu and pricing',
      icon: ClipboardDocumentListIcon,
      emoji: '🍱',
      route: '/partner/tiffins',
      color: 'from-secondary-500 to-secondary-600',
    },
    {
      id: 'orders',
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: CalendarDaysIcon,
      emoji: '📋',
      route: '/partner/orders',
      color: 'from-blue-500 to-cyan-500',
      badge: statsData.pendingDeliveries > 0 ? `${statsData.pendingDeliveries} new` : undefined,
    },
    {
      id: 'earnings',
      title: 'Earnings',
      description: 'Track your revenue and payouts',
      icon: CurrencyRupeeIcon,
      emoji: '💰',
      route: '/partner/earnings',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Business insights and reports',
      icon: ChartBarIcon,
      emoji: '📊',
      route: '/partner/analytics',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-500 dark:from-primary-900 dark:via-primary-800 dark:to-secondary-900 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[110px] pb-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">👨‍🍳</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-white">Welcome back, {partner.name}!</h1>
                    <CheckBadgeIcon className="w-6 h-6 text-green-300" />
                  </div>
                  <p className="text-white/80 text-sm flex items-center mt-0.5">
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    Partner Dashboard
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/partner/orders')}
                  className="relative p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                  aria-label="View Orders Notifications"
                >
                  <BellIcon className="w-6 h-6 text-white" />
                  {statsData.pendingDeliveries > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {statsData.pendingDeliveries > 9 ? '9+' : statsData.pendingDeliveries}
                    </span>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/partner/profile')}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                  aria-label="View Partner Profile Settings"
                >
                  <Cog6ToothIcon className="w-6 h-6 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 -mb-16">
              {stats.map((stat, index) => {
                const emojis = ['👥', '📦', '💰', '⭐'];
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 border border-neutral-100"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                      >
                        <span className="text-2xl">{emojis[index]}</span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-neutral-500 mb-1">{stat.label}</p>
                    <p
                      className={`text-xs font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-neutral-400'
                      }`}
                    >
                      {stat.change}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Quick Actions</h2>
            <Link
              to="/partner/profile"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
            >
              View All Settings <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {quickActions.map((action, index) => {
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(action.route)}
                  className={`relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${
                    action.highlight
                      ? 'border-primary-200'
                      : 'border-transparent hover:border-neutral-100'
                  }`}
                >
                  {/* Top gradient bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${action.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                  />

                  {/* Badge */}
                  {action.badge && (
                    <span
                      className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold rounded-full ${
                        action.badge === 'Required'
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {action.badge}
                    </span>
                  )}

                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="text-2xl">{action.emoji}</span>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{action.description}</p>

                  <div className="mt-4 flex items-center text-primary-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Customer Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-10"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Customer Management</h2>
                    <p className="text-sm text-neutral-500">Manage your active subscribers</p>
                  </div>
                </div>
                {showCustomerDetails && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCustomerDetails(false)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center bg-primary-50 px-4 py-2 rounded-lg"
                  >
                    ← Back to List
                  </motion.button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {!showCustomerDetails ? (
                  <motion.div
                    key="selector"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <CustomerSelector
                      onCustomerSelect={handleCustomerSelect}
                      selectedCustomerId={selectedCustomer?.id}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <CustomerDetails customerId={selectedCustomer?.id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Calendar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CalendarDaysIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Delivery Calendar</h2>
                  <p className="text-sm text-neutral-500">Track and manage daily deliveries</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <CustomerCalendar />
            </div>
          </div>
        </motion.div>

        {/* Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10"
        >
          <div className="bg-gradient-to-r from-secondary-500 via-secondary-400 to-amber-400 dark:from-secondary-900 dark:via-secondary-800 dark:to-amber-900 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-2 mb-2">
                  <FireIcon className="w-5 h-5 text-white" />
                  <span className="text-white/90 font-semibold text-sm uppercase tracking-wider">
                    Pro Tip
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Complete your profile to get more customers!
                </h3>
                <p className="text-white/80">
                  Partners with complete profiles get 3x more visibility in search results.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/partner/profile')}
                className="bg-white text-secondary-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Update Profile
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
