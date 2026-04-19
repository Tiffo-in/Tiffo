import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const [todayOrders, setTodayOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTodayOrders();
  }, []);

  const loadTodayOrders = async () => {
    try {
      const response = await api.get('/partner/orders/today');
      if (response.data.success) {
        setTodayOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching today orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const markDelivered = async (orderId) => {
    try {
      await api.patch(`/deliveries/${orderId}/status`, { status: 'delivered' });
      setTodayOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o)
      );
      toast.success('Order marked as delivered!');
    } catch (err) {
      toast.error('Failed to update delivery status');
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircleIcon,
          iconColor: 'text-green-500',
          bgGradient: 'from-green-500 to-emerald-500'
        };
      case 'preparing':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: ClockIcon,
          iconColor: 'text-amber-500',
          bgGradient: 'from-amber-500 to-orange-500'
        };
      case 'scheduled':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: TruckIcon,
          iconColor: 'text-blue-500',
          bgGradient: 'from-blue-500 to-cyan-500'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: XCircleIcon,
          iconColor: 'text-red-500',
          bgGradient: 'from-red-500 to-rose-500'
        };
      default:
        return {
          color: 'bg-neutral-100 text-neutral-700 border-neutral-200',
          icon: ClockIcon,
          iconColor: 'text-neutral-500',
          bgGradient: 'from-neutral-500 to-neutral-600'
        };
    }
  };

  const getMealConfig = (mealType) => {
    switch (mealType) {
      case 'breakfast':
        return { emoji: '🌅', label: 'Breakfast', color: 'bg-orange-100' };
      case 'lunch':
        return { emoji: '☀️', label: 'Lunch', color: 'bg-yellow-100' };
      case 'dinner':
        return { emoji: '🌙', label: 'Dinner', color: 'bg-indigo-100' };
      default:
        return { emoji: '🍽️', label: 'Meal', color: 'bg-neutral-100' };
    }
  };

  const filteredOrders = filter === 'all'
    ? todayOrders
    : todayOrders.filter(order => order.status === filter);

  const orderStats = {
    total: todayOrders.length,
    delivered: todayOrders.filter(o => o.status === 'delivered').length,
    preparing: todayOrders.filter(o => o.status === 'preparing').length,
    scheduled: todayOrders.filter(o => o.status === 'scheduled').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-32 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-neutral-200 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-neutral-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-500 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">📋</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-white">Today's Orders</h1>
                    <CheckBadgeIcon className="w-6 h-6 text-green-300" />
                  </div>
                  <p className="text-white/80 text-sm mt-0.5">
                    Manage your daily deliveries
                  </p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <span className="text-white font-bold text-lg">{orderStats.total}</span>
                <span className="text-white/80 text-sm ml-1">orders today</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-12"
        >
          {[
            { label: 'Total Orders', value: orderStats.total, emoji: '📦', color: 'bg-blue-50', textColor: 'text-blue-600' },
            { label: 'Delivered', value: orderStats.delivered, emoji: '✅', color: 'bg-green-50', textColor: 'text-green-600' },
            { label: 'Preparing', value: orderStats.preparing, emoji: '👨‍🍳', color: 'bg-amber-50', textColor: 'text-amber-600' },
            { label: 'Scheduled', value: orderStats.scheduled, emoji: '🚚', color: 'bg-purple-50', textColor: 'text-purple-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 border border-neutral-100"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <span className="text-2xl">{stat.emoji}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.textColor} mb-1`}>{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {[
            { id: 'all', label: 'All Orders', count: orderStats.total },
            { id: 'scheduled', label: 'Scheduled', count: orderStats.scheduled },
            { id: 'preparing', label: 'Preparing', count: orderStats.preparing },
            { id: 'delivered', label: 'Delivered', count: orderStats.delivered }
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === tab.id
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-200 hover:bg-primary-50'
                }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === tab.id ? 'bg-white/20' : 'bg-neutral-100'
                }`}>
                {tab.count}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center border border-neutral-100"
          >
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-neutral-700 mb-2">No orders found</h3>
            <p className="text-neutral-500">Check back later for new orders.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const mealConfig = getMealConfig(order.mealType);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -2, scale: 1.005 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 overflow-hidden"
                >
                  {/* Card Header with Status */}
                  <div className={`h-1.5 bg-gradient-to-r ${statusConfig.bgGradient}`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 ${mealConfig.color} rounded-2xl flex items-center justify-center`}>
                          <span className="text-2xl">{mealConfig.emoji}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-neutral-900">
                            {order.customerName}
                          </h3>
                          <p className="text-sm text-neutral-500">
                            {mealConfig.label} • {order.plan}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                          <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                          <span className="capitalize">{order.status}</span>
                        </span>
                        <p className="text-sm text-neutral-500 mt-2 font-medium">
                          🕐 {order.deliveryTime}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-3 bg-neutral-50 rounded-xl p-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <PhoneIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Contact</p>
                          <p className="text-neutral-900 font-medium">{order.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-neutral-50 rounded-xl p-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPinIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Delivery Address</p>
                          <p className="text-neutral-900 font-medium">
                            {order.address.street}, {order.address.city} - {order.address.pincode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-neutral-100">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => markDelivered(order.id)}
                        disabled={order.status === 'delivered'}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        {order.status === 'delivered' ? 'Delivered ✓' : 'Mark Delivered'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => order.phone && window.open(`tel:${order.phone}`)}
                        disabled={!order.phone}
                        className="flex-1 bg-white text-neutral-700 py-3 px-4 rounded-xl font-semibold border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PhoneIcon className="w-5 h-5" />
                        Call Customer
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;