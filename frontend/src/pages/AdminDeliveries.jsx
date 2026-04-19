import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ClockIcon,
    ArrowLeftIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    MapPinIcon,
    UserIcon,
    BuildingStorefrontIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const AdminDeliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('today');

    useEffect(() => {
        loadDeliveryData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFilter]);

    const loadDeliveryData = async () => {
        setLoading(true);
        try {
            const [overviewRes, listRes] = await Promise.all([
                api.get('/deliveries/admin/overview', { params: { date: dateFilter } }),
                api.get('/deliveries/admin', { params: { date: dateFilter } })
            ]);

            if (overviewRes.data.success && listRes.data.success) {
                const todayData = overviewRes.data.data.today || {};
                const totalToday = Object.values(todayData).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
                const completed = todayData.delivered || 0;
                
                setStats({
                    totalToday,
                    completed,
                    inProgress: (todayData.out_for_delivery || 0) + (todayData.in_transit || 0),
                    pending: todayData.pending || 0,
                    failed: (todayData.cancelled || 0) + (todayData.failed || 0),
                    onTimeRate: totalToday > 0 ? ((completed / totalToday) * 100).toFixed(1) : 0
                });

                setDeliveries(listRes.data.data.map(del => ({
                    id: del._id.substring(del._id.length - 6).toUpperCase(),
                    customer: del.user?.name || 'Unknown',
                    partner: del.partner?.businessName || 'Unknown Partner',
                    address: del.deliveryAddress?.street || del.user?.address || 'N/A',
                    status: del.status,
                    scheduledTime: del.deliveryDate ? new Date(del.deliveryDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                    deliveredTime: del.deliveredAt ? new Date(del.deliveredAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
                    meal: del.subscription?.plan?.charAt(0).toUpperCase() + del.subscription?.plan?.slice(1) || 'Standard',
                    failReason: del.notes || ''
                })));
            }
        } catch (error) {
            console.error('Error loading deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'in_transit': return 'bg-blue-100 text-blue-700';
            case 'preparing': return 'bg-amber-100 text-amber-700';
            case 'pending': return 'bg-neutral-100 text-neutral-700';
            case 'failed': return 'bg-red-100 text-red-700';
            default: return 'bg-neutral-100 text-neutral-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <CheckCircleIcon className="w-4 h-4" />;
            case 'in_transit': return <TruckIcon className="w-4 h-4" />;
            case 'preparing': return <ClockIcon className="w-4 h-4" />;
            case 'pending': return <ClockIcon className="w-4 h-4" />;
            case 'failed': return <XCircleIcon className="w-4 h-4" />;
            default: return null;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'delivered': return 'Delivered';
            case 'in_transit': return 'In Transit';
            case 'preparing': return 'Preparing';
            case 'pending': return 'Pending';
            case 'failed': return 'Failed';
            default: return status;
        }
    };

    const filteredDeliveries = deliveries.filter(del => {
        const matchesFilter = filter === 'all' || del.status === filter;
        const matchesSearch = del.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            del.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
            del.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-neutral-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            {/* Header */}
            <div className="bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link to="/admin/dashboard" className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                                <ArrowLeftIcon className="w-5 h-5 text-white" />
                            </Link>
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <TruckIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-white">Deliveries</h1>
                                    <CheckBadgeIcon className="w-6 h-6 text-green-400" />
                                </div>
                                <p className="text-white/70 text-sm">Track and manage deliveries</p>
                            </div>
                        </div>
                        <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1">
                            {['today', 'week', 'month'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setDateFilter(range)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${dateFilter === range
                                        ? 'bg-white text-neutral-800'
                                        : 'text-white hover:bg-white/20'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 -mt-12 mb-8">
                    {[
                        { label: 'Total', value: stats.totalToday, color: 'from-neutral-500 to-neutral-600' },
                        { label: 'Completed', value: stats.completed, color: 'from-green-500 to-emerald-500' },
                        { label: 'In Progress', value: stats.inProgress, color: 'from-blue-500 to-cyan-500' },
                        { label: 'Pending', value: stats.pending, color: 'from-amber-500 to-orange-500' },
                        { label: 'Failed', value: stats.failed, color: 'from-red-500 to-rose-500' },
                        { label: 'On-Time Rate', value: `${stats.onTimeRate}%`, color: 'from-purple-500 to-pink-500' }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-4"
                        >
                            <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                                <TruckIcon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                            <p className="text-xs text-neutral-500">{stat.label}</p>
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
                                placeholder="Search by customer, partner, or delivery ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                            <FunnelIcon className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                            {['all', 'delivered', 'in_transit', 'preparing', 'pending', 'failed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === status
                                        ? 'bg-neutral-800 text-white'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                        }`}
                                >
                                    {getStatusLabel(status)}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Deliveries Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-neutral-900">Delivery Schedule</h2>
                        <span className="text-sm text-neutral-500 flex items-center gap-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Partner</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Meal</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Scheduled</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredDeliveries.map((del) => (
                                    <tr key={del.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-neutral-900">{del.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                                                    <UserIcon className="w-4 h-4 text-neutral-500" />
                                                </div>
                                                <span className="text-sm font-medium text-neutral-900">{del.customer}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <BuildingStorefrontIcon className="w-4 h-4 text-neutral-400" />
                                                <span className="text-sm text-neutral-600">{del.partner}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-neutral-600">
                                                <MapPinIcon className="w-4 h-4 text-neutral-400" />
                                                {del.address}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">{del.meal}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <span className="text-neutral-900 font-medium">{del.scheduledTime}</span>
                                                {del.deliveredTime && (
                                                    <span className="text-green-600 text-xs block">
                                                        ✓ {del.deliveredTime}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(del.status)}`}>
                                                {getStatusIcon(del.status)}
                                                {getStatusLabel(del.status)}
                                            </span>
                                            {del.failReason && (
                                                <p className="text-xs text-red-500 mt-1">{del.failReason}</p>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredDeliveries.length === 0 && (
                        <div className="p-12 text-center">
                            <TruckIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">No Deliveries Found</h3>
                            <p className="text-neutral-500">No deliveries match your search criteria.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDeliveries;
