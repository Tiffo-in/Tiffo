import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MySubscriptions from '../components/MySubscriptions';
import OrderHistory from '../components/OrderHistory';
import PaymentMethods from '../components/PaymentMethods';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  UserCircleIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, FireIcon } from '@heroicons/react/24/solid';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    activeSubscriptions: 0,
    mealsThisMonth: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  });

  // Fetch real stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/subscriptions/stats');
        if (res.data.success) setStatsData(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // User from localStorage (already set by login flow)
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };

  const tabs = [
    { id: 'subscriptions', label: 'My Subscriptions', icon: HomeIcon, emoji: '📦' },
    { id: 'orders', label: 'Order History', icon: ClipboardDocumentListIcon, emoji: '📋' },
    { id: 'payments', label: 'Payment Methods', icon: CreditCardIcon, emoji: '💳' }
  ];

  const stats = [
    {
      label: 'Active Subscriptions',
      value: statsLoading ? '—' : statsData.activeSubscriptions,
      icon: '🍱',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Meals This Month',
      value: statsLoading ? '—' : statsData.mealsThisMonth,
      icon: '🥗',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Total Spent',
      value: statsLoading ? '—' : `₹${statsData.totalSpent.toLocaleString('en-IN')}`,
      icon: '💰',
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'Loyalty Points',
      value: statsLoading ? '—' : statsData.loyaltyPoints,
      icon: '⭐',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                👋
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-white/80 mt-1 flex items-center">
                  <SparklesIcon className="w-4 h-4 mr-1" />
                  Your tiffin journey continues
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/tiffins" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2">
                <span>Browse Tiffins</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <button
                onClick={() => navigate('/tiffins')}
                className="bg-white text-primary-600 px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Quick Order
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 dark:border-neutral-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-72 flex-shrink-0"
          >
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-4 sticky top-24 border border-neutral-100 dark:border-neutral-700">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;

                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-left group ${isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        }`}
                    >
                      <span className={`text-xl ${isActive ? '' : 'group-hover:scale-110'} transition-transform`}>
                        {tab.emoji}
                      </span>
                      <span className="font-medium">{tab.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-700">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-4">
                  Quick Actions
                </p>
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-2.5 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Edit Profile</span>
                  </Link>
                  <Link
                    to="/support"
                    className="flex items-center space-x-3 px-4 py-2.5 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                  >
                    <span className="text-lg">💬</span>
                    <span className="text-sm font-medium">Get Help</span>
                  </Link>
                </div>
              </div>

              {/* Promo Card */}
              <div className="mt-6 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-2xl p-4 text-white relative overflow-hidden">
                <div className="absolute -top-4 -right-4 text-6xl opacity-20">🎁</div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-1 mb-2">
                    <FireIcon className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Special Offer</span>
                  </div>
                  <p className="font-bold text-lg mb-1">Get 20% Off</p>
                  <p className="text-white/80 text-sm mb-3">On your next subscription</p>
                  <Link to="/tiffins" className="bg-white text-secondary-600 px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-md transition-all inline-block">
                    Claim Now
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1"
          >
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 lg:p-8 border border-neutral-100 dark:border-neutral-700 min-h-[600px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'subscriptions' && <MySubscriptions />}
                  {activeTab === 'orders' && <OrderHistory />}
                  {activeTab === 'payments' && <PaymentMethods />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-16" />
    </div>
  );
};

export default Dashboard;