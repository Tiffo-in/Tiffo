import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    CurrencyRupeeIcon,
    ArrowLeftIcon,
    ArrowTrendingUpIcon,
    ArrowPathIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const AdminPayments = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    useEffect(() => {
        loadPaymentData();
    }, []);

    const loadPaymentData = async () => {
        setLoading(true);
        try {
            const [paymentsRes, statsRes] = await Promise.all([
                api.get('/admin/payments', { params: { limit: 100 } }),
                api.get('/admin/payments/revenue/report')
            ]);

            if (paymentsRes.data.success && statsRes.data.success) {
                const totalStats = statsRes.data.data?.totalStats?.[0] || {};
                // eslint-disable-next-line no-unused-vars
                const summary = paymentsRes.data.summary || {};
                
                // Set aggregated stats for the top cards
                setStats({
                    totalRevenue: totalStats.totalRevenue || 0,
                    todayRevenue: statsRes.data.data?.dailyRevenue?.slice(-1)[0]?.revenue || 0,
                    pendingPayments: totalStats.failedCount || 0, // Using failed as we don't track pending exactly here
                    refundedAmount: totalStats.totalRefunds || 0,
                    successRate: (totalStats.successCount + totalStats.failedCount) > 0 
                        ? ((totalStats.successCount / (totalStats.successCount + totalStats.failedCount)) * 100).toFixed(1) 
                        : 0,
                    avgTransaction: totalStats.successCount > 0 ? (totalStats.totalRevenue / totalStats.successCount) : 0
                });

                // Map transactions to the format expected by the frontend table
                setTransactions(paymentsRes.data.data.map(txn => ({
                    id: txn.orderId || txn.razorpayPaymentId || txn._id.substring(txn._id.length - 8).toUpperCase(),
                    customer: txn.user?.name || 'Unknown',
                    amount: txn.amount,
                    status: txn.status,
                    date: new Date(txn.createdAt),
                    type: txn.subscription ? 'subscription' : 'one-time',
                    partner: txn.partner?.businessName || txn.partner?.name || 'Unknown Partner',
                    _raw: txn
                })));
            }
        } catch (error) {
            console.error('Error loading payment data:', error);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'failed': return 'bg-red-100 text-red-700';
            case 'refunded': return 'bg-purple-100 text-purple-700';
            default: return 'bg-neutral-100 text-neutral-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircleIcon className="w-4 h-4" />;
            case 'pending': return <ClockIcon className="w-4 h-4" />;
            case 'failed': return <XCircleIcon className="w-4 h-4" />;
            case 'refunded': return <ArrowPathIcon className="w-4 h-4" />;
            default: return null;
        }
    };

    const filteredTransactions = transactions.filter(txn => {
        const matchesFilter = filter === 'all' || txn.status === filter;
        const matchesSearch = txn.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link to="/admin/dashboard" className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                                <ArrowLeftIcon className="w-5 h-5 text-white" />
                            </Link>
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <CurrencyRupeeIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-white">Payments</h1>
                                    <CheckBadgeIcon className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-white/80 text-sm">Transaction management</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-12 mb-8">
                    {[
                        { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: CurrencyRupeeIcon, color: 'from-green-500 to-emerald-500' },
                        { label: "Today's Revenue", value: formatCurrency(stats.todayRevenue), icon: ArrowTrendingUpIcon, color: 'from-blue-500 to-cyan-500' },
                        { label: 'Pending Payments', value: stats.pendingPayments, icon: ClockIcon, color: 'from-amber-500 to-orange-500' },
                        { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircleIcon, color: 'from-purple-500 to-pink-500' }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
                        >
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                                <p className="text-sm text-neutral-500">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filters & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-4 mb-6"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search by customer or transaction ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <FunnelIcon className="w-5 h-5 text-neutral-400" />
                            {['all', 'success', 'pending', 'failed', 'refunded'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === status
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Transactions Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-neutral-100">
                        <h2 className="text-lg font-bold text-neutral-900">Recent Transactions</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Transaction ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Partner</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredTransactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-neutral-900">{txn.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">{txn.customer}</td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">{txn.partner}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-neutral-900">{formatCurrency(txn.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(txn.status)}`}>
                                                {getStatusIcon(txn.status)}
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {txn.date.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedTransaction(txn)}
                                                className="p-2 text-neutral-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Transaction Detail Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                    >
                        <h3 className="text-xl font-bold text-neutral-900 mb-4">Transaction Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-neutral-100">
                                <span className="text-neutral-500">Transaction ID</span>
                                <span className="font-mono font-medium">{selectedTransaction.id}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-neutral-100">
                                <span className="text-neutral-500">Customer</span>
                                <span className="font-medium">{selectedTransaction.customer}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-neutral-100">
                                <span className="text-neutral-500">Partner</span>
                                <span className="font-medium">{selectedTransaction.partner}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-neutral-100">
                                <span className="text-neutral-500">Amount</span>
                                <span className="font-bold text-green-600">{formatCurrency(selectedTransaction.amount)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-neutral-100">
                                <span className="text-neutral-500">Status</span>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedTransaction.status)}`}>
                                    {getStatusIcon(selectedTransaction.status)}
                                    {selectedTransaction.status}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-neutral-500">Date & Time</span>
                                <span className="font-medium">{selectedTransaction.date.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            {selectedTransaction.status === 'success' && (
                                <button className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors">
                                    Process Refund
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;
