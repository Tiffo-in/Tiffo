import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
    UserGroupIcon,
    BuildingStorefrontIcon,
    CurrencyRupeeIcon,
    ChartBarIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    BellAlertIcon,
    ChatBubbleLeftRightIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useSocket } from '../hooks/useSocket';
import NotificationCenter from '../components/NotificationCenter';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPartners: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        pendingPartners: 0,
        todayDeliveries: 0,
        growth: {}
    });
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isConnected, on } = useSocket();

    useEffect(() => {
        loadDashboardData();

        // Listen for real-time updates
        const unsubscribe = on('admin:update', (data) => {
            setStats(prev => ({ ...prev, ...data }));
        });

        return unsubscribe;
    }, [on]);

    const loadDashboardData = async () => {
        try {
            // Fetch real data from both endpoints in parallel
            const [statsRes, activityRes] = await Promise.all([
                api.get('/admin/dashboard'),
                api.get('/admin/activity')
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
            if (activityRes.data.success) {
                setActivity(activityRes.data.data);
            }
        } catch (error) {
            console.error('Failed to load admin dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const statCards = [
        {
            label: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            change: stats.growth.users,
            icon: UserGroupIcon,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Partners',
            value: stats.totalPartners,
            change: stats.growth.partners,
            icon: BuildingStorefrontIcon,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Active Subscriptions',
            value: stats.activeSubscriptions,
            change: stats.growth.subscriptions,
            icon: ChartBarIcon,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-50'
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            change: stats.growth.revenue,
            icon: CurrencyRupeeIcon,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-50'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            {/* Header */}
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">👑</span>
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                                    <CheckBadgeIcon className="w-6 h-6 text-green-400" />
                                </div>
                                <p className="text-neutral-400 text-sm mt-0.5 flex items-center">
                                    <SparklesIcon className="w-4 h-4 mr-1" />
                                    Platform management & analytics
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Connection Status */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                                {isConnected ? 'Live' : 'Offline'}
                            </div>

                            <NotificationCenter />
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stat Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 -mt-12"
                >
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-neutral-100"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                                        <Icon className="w-6 h-6 text-neutral-700" />
                                    </div>
                                    <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</p>
                                <p className="text-sm text-neutral-500 mb-2">{stat.label}</p>
                                <p className="text-xs font-medium text-green-600">{stat.change} this month</p>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                            <h2 className="text-lg font-bold text-neutral-900">Quick Actions</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Link to="/admin/users">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <UserGroupIcon className="w-8 h-8 text-blue-600 mb-3" />
                                    <h3 className="font-bold text-neutral-900">Manage Users</h3>
                                    <p className="text-sm text-neutral-500">{stats.totalUsers} total</p>
                                </motion.div>
                            </Link>

                            <Link to="/admin/partners">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl hover:shadow-lg transition-all cursor-pointer relative"
                                >
                                    <BuildingStorefrontIcon className="w-8 h-8 text-green-600 mb-3" />
                                    <h3 className="font-bold text-neutral-900">Partners</h3>
                                    <p className="text-sm text-neutral-500">{stats.totalPartners} verified</p>
                                    {stats.pendingPartners > 0 && (
                                        <span className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {stats.pendingPartners}
                                        </span>
                                    )}
                                </motion.div>
                            </Link>

                            <Link to="/admin/analytics">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <ChartBarIcon className="w-8 h-8 text-purple-600 mb-3" />
                                    <h3 className="font-bold text-neutral-900">Analytics</h3>
                                    <p className="text-sm text-neutral-500">View reports</p>
                                </motion.div>
                            </Link>

                            <Link to="/admin/payments">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <CurrencyRupeeIcon className="w-8 h-8 text-amber-600 mb-3" />
                                    <h3 className="font-bold text-neutral-900">Payments</h3>
                                    <p className="text-sm text-neutral-500">View transactions</p>
                                </motion.div>
                            </Link>

                            <Link to="/admin/alerts">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <BellAlertIcon className="w-8 h-8 text-red-600 mb-3" />
                                    <h3 className="font-bold text-neutral-900">Alerts</h3>
                                    <p className="text-sm text-neutral-500">System status</p>
                                </motion.div>
                            </Link>

                            <Link to="/admin/deliveries">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-5 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900/30 dark:to-neutral-800/30 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <ClockIcon className="w-8 h-8 text-neutral-600 mb-3" />
                                    <h3 className="font-bold text-neutral-900">Deliveries</h3>
                                    <p className="text-sm text-neutral-500">{stats.todayDeliveries} today</p>
                                </motion.div>
                            </Link>

                            <Link to="/admin/support">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-5 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600 mb-3" />
                                    <h3 className="font-bold text-neutral-900">Support Tickets</h3>
                                    <p className="text-sm text-neutral-500">Manage inquiries</p>
                                </motion.div>
                            </Link>

                            <Link to="/admin/fraud">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-5 bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-900/30 dark:to-red-800/30 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <ShieldExclamationIcon className="w-8 h-8 text-rose-600 mb-3" />
                                    <h3 className="font-bold text-neutral-900">Fraud Reports</h3>
                                    <p className="text-sm text-neutral-500">Investigate cases</p>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                            <h2 className="text-lg font-bold text-neutral-900">Recent Activity</h2>
                        </div>
                        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                            {activity.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl"
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-neutral-700">{item.message}</p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Pending Approvals Alert */}
                {stats.pendingPartners > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
                            <div>
                                <p className="font-semibold text-amber-900">{stats.pendingPartners} pending partner applications</p>
                                <p className="text-sm text-amber-700">Review and approve new partners</p>
                            </div>
                        </div>
                        <Link
                            to="/admin/partners"
                            className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                        >
                            Review Now
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
