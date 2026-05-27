import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  CalendarDaysIcon,
  XMarkIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { toast } from 'react-hot-toast';
import api from '../services/api';

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: CheckCircleIcon,
    iconBg: 'bg-green-500',
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: XCircleIcon,
    iconBg: 'bg-red-500',
    label: 'Cancelled',
  },
  active: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: ClockIcon,
    iconBg: 'bg-blue-500',
    label: 'Active',
  },
  paused: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: ClockIcon,
    iconBg: 'bg-amber-500',
    label: 'Paused',
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] ?? {
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    icon: ClockIcon,
    iconBg: 'bg-neutral-500',
    label: status,
  };

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">Order Details</h3>
            <p className="text-neutral-500 mt-1">{order.tiffin?.title || order.tiffin?.name}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-10 h-10 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center"
          >
            <XMarkIcon className="w-5 h-5 text-neutral-600" />
          </motion.button>
        </div>

        {/* Status badge */}
        <div
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl ${statusConfig.bg} ${statusConfig.text} font-semibold mb-6`}
        >
          <StatusIcon className="w-4 h-4" />
          <span>{statusConfig.label}</span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Partner</p>
            <p className="font-semibold text-neutral-800">{order.partner?.businessName || '—'}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Plan</p>
            <p className="font-semibold text-neutral-800 capitalize">{order.plan}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Total Paid</p>
            <p className="font-bold text-amber-700 text-lg">₹{order.totalAmount}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Meals Delivered</p>
            <p className="font-bold text-green-700 text-lg">{order.deliveredCount ?? 0}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Duration</p>
            <p className="font-semibold text-blue-700">{order.duration} days</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">Delivery Time</p>
            <p className="font-semibold text-purple-700">{order.deliveryTime || '—'}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-neutral-50 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <CalendarDaysIcon className="w-5 h-5 text-neutral-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-neutral-500">Subscription Period</p>
            <p className="font-medium text-neutral-700">
              {new Date(order.startDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
              {' → '}
              {new Date(order.endDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Address */}
        {order.deliveryAddress && (
          <div className="bg-neutral-50 rounded-xl p-4 mb-6 flex items-start space-x-3">
            <MapPinIcon className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-neutral-500 mb-1">Delivery Address</p>
              <p className="font-medium text-neutral-700">
                {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
              </p>
              <p className="text-sm text-neutral-500">{order.deliveryAddress?.pincode}</p>
            </div>
          </div>
        )}

        {/* Payment status */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl mb-6">
          <div className="flex items-center space-x-2">
            <CurrencyRupeeIcon className="w-5 h-5 text-neutral-400" />
            <span className="text-sm text-neutral-600">Payment Status</span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.paymentStatus === 'paid' || order.paymentStatus === 'captured'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {order.paymentStatus?.toUpperCase()}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reordering, setReordering] = useState(null);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions/history');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (order) => {
    // Navigate to tiffin page — Reorder means subscribing to the same tiffin again
    const tiffinId = order.tiffin?._id;
    if (!tiffinId) {
      toast.error('Tiffin details not available');
      return;
    }
    setReordering(order._id);
    toast.success('Redirecting to tiffin page…', { duration: 1500 });
    setTimeout(() => {
      window.location.href = `/tiffins?reorder=${tiffinId}`;
    }, 1500);
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full" />
          <div className="absolute top-0 w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-neutral-500 font-medium">Loading order history…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Order History</h2>
          <p className="text-neutral-500 mt-1">Your past subscriptions and deliveries</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field py-2 px-4 text-sm"
        >
          <option value="all">All Orders</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200"
        >
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-neutral-700 mb-2">No order history yet</h3>
          <p className="text-neutral-500 mb-6">
            Past subscriptions will appear here once completed
          </p>
          <Link to="/tiffins" className="btn-primary inline-block">
            Browse Tiffins
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const tiffinTitle = order.tiffin?.title || order.tiffin?.name || 'Tiffin';
            const tiffinImage =
              order.tiffin?.images?.[0] ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop';
            const pricePerDay = order.tiffin?.price?.daily;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-neutral-100 group"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Image + Info */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="relative flex-shrink-0">
                        <img
                          src={tiffinImage}
                          alt={tiffinTitle}
                          className="w-20 h-20 rounded-xl object-cover shadow-md"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop';
                          }}
                        />
                        <div
                          className={`absolute -bottom-2 -right-2 w-7 h-7 ${statusConfig.iconBg} rounded-full flex items-center justify-center shadow-md`}
                        >
                          <StatusIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
                          {tiffinTitle}
                        </h3>
                        <p className="text-neutral-500 text-sm">{order.partner?.businessName}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <div className="flex items-center text-neutral-500 text-sm">
                            <CalendarDaysIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                            {new Date(order.endDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center text-neutral-500 text-sm">
                            <TruckIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                            {order.deliveredCount ?? 0} meals delivered
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Amount + Status */}
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-neutral-900">₹{order.totalAmount}</p>
                        {pricePerDay && (
                          <p className="text-sm text-neutral-400">₹{pricePerDay}/day</p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text} flex items-center space-x-1.5`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        <span>{statusConfig.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Plan tag + duration */}
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium capitalize">
                      {order.plan} plan
                    </span>
                    <span className="px-3 py-1.5 bg-neutral-50 text-neutral-600 rounded-lg text-sm font-medium">
                      {order.duration} days
                    </span>
                    {order.tiffin?.cuisine && (
                      <span className="px-3 py-1.5 bg-neutral-50 text-neutral-600 rounded-lg text-sm font-medium">
                        {order.tiffin.cuisine}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">View Details</span>
                    </motion.button>

                    {order.status === 'completed' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={reordering === order._id}
                        onClick={() => handleReorder(order)}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                      >
                        <ArrowPathIcon
                          className={`w-4 h-4 ${reordering === order._id ? 'animate-spin' : ''}`}
                        />
                        <span className="text-sm">Reorder</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderHistory;
