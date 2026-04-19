import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
  CheckCircleIcon,
  TruckIcon,
  PauseCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import api from '../services/api';
const MySubscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      if (response.data.success) {
        setSubscriptions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSubscription = async (id) => {
    try {
      toast.loading('Pausing subscription...', { id: 'pause' });
      const response = await api.put(`/subscriptions/${id}/pause`);
      if (response.data.success) {
        setSubscriptions(prev => prev.map(sub => sub._id === id ? { ...sub, status: 'paused' } : sub));
        toast.success('Subscription paused', { id: 'pause' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to pause subscription', { id: 'pause' });
    }
  };

  const handleResumeSubscription = async (id) => {
    try {
      toast.loading('Resuming subscription...', { id: 'resume' });
      const response = await api.put(`/subscriptions/${id}/resume`);
      if (response.data.success) {
        setSubscriptions(prev => prev.map(sub => sub._id === id ? { ...sub, status: 'active' } : sub));
        toast.success('Subscription resumed', { id: 'resume' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resume subscription', { id: 'resume' });
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          text: 'text-white',
          icon: CheckCircleIcon,
          label: 'Active'
        };
      case 'paused':
        return {
          bg: 'bg-gradient-to-r from-amber-400 to-orange-400',
          text: 'text-white',
          icon: PauseCircleIcon,
          label: 'Paused'
        };
      case 'cancelled':
        return {
          bg: 'bg-gradient-to-r from-red-400 to-rose-500',
          text: 'text-white',
          icon: XMarkIcon,
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-neutral-100',
          text: 'text-neutral-600',
          icon: ClockIcon,
          label: status
        };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full"></div>
          <div className="absolute top-0 w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-neutral-500 font-medium">Loading your subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">My Subscriptions</h2>
          <p className="text-neutral-500 mt-1">Manage your active tiffin subscriptions</p>
        </div>
        <button onClick={() => navigate('/tiffins')} className="btn-primary flex items-center space-x-2">
          <span>+ New Subscription</span>
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200"
        >
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-neutral-700 mb-2">No subscriptions yet</h3>
          <p className="text-neutral-500 mb-6">Start your tiffin journey today!</p>
          <Link to="/tiffins" className="btn-primary inline-block">Browse Tiffins</Link>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {subscriptions.map((subscription, index) => {
            const statusConfig = getStatusConfig(subscription.status);
            const StatusIcon = statusConfig.icon;
            const delivered = subscription.deliveryStats?.deliveredCount ?? 0;
            const remaining = subscription.deliveryStats?.remainingDeliveries ?? 0;
            const progress = delivered + remaining > 0 ? (delivered / (delivered + remaining)) * 100 : 0;

            return (
              <motion.div
                key={subscription._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-100 group"
              >
                {/* Status Bar */}
                <div className={`h-1.5 ${statusConfig.bg}`} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={subscription.tiffin.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'}
                          alt={subscription.tiffin.title}
                          className="w-20 h-20 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className={`absolute -bottom-2 -right-2 w-6 h-6 ${statusConfig.bg} rounded-full flex items-center justify-center`}>
                          <StatusIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {subscription.tiffin.title}
                        </h3>
                        <p className="text-neutral-600 flex items-center">
                          <span className="text-lg mr-1">👨‍🍳</span>
                          {subscription.partner.businessName}
                        </p>
                        <div className="flex items-center mt-2 space-x-3">
                          <span className="px-2.5 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold">
                            {subscription.tiffin.cuisine}
                          </span>
                          <div className="flex items-center text-amber-500">
                            <StarIcon className="w-4 h-4" />
                            <span className="text-sm font-medium ml-1 text-neutral-600">4.8</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`${statusConfig.bg} ${statusConfig.text} px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-md`}>
                      <StatusIcon className="w-4 h-4" />
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {delivered}
                      </p>
                      <p className="text-sm text-neutral-600 font-medium">Delivered</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {remaining}
                      </p>
                      <p className="text-sm text-neutral-600 font-medium">Remaining</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center">
                       <p className="text-3xl font-bold text-amber-600">
                         ₹{subscription.tiffin.price?.daily ?? subscription.totalAmount}
                       </p>
                       <p className="text-sm text-neutral-600 font-medium">Per Day</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                      <p className="text-xl font-bold text-purple-600">
                        {subscription.plan}
                      </p>
                      <p className="text-sm text-neutral-600 font-medium">Plan</p>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-6 p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <CalendarDaysIcon className="w-4 h-4 text-neutral-400" />
                      <span>{new Date(subscription.startDate).toLocaleDateString()} - {new Date(subscription.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-neutral-400" />
                      <span>{subscription.deliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-neutral-400" />
                      <span>{subscription.deliveryAddress.city}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-neutral-600">Delivery Progress</span>
                      <span className="text-sm font-bold text-primary-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {delivered} of {delivered + remaining} meals delivered
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSubscription(subscription)}
                      className="btn-primary flex-1 md:flex-none"
                    >
                      View Details
                    </motion.button>
                    {subscription.status === 'active' && (
                      <button 
                        onClick={() => handlePauseSubscription(subscription._id)}
                        className="px-6 py-3 border-2 border-neutral-200 text-neutral-600 rounded-xl font-semibold hover:border-amber-400 hover:text-amber-600 transition-colors"
                      >
                        Pause Subscription
                      </button>
                    )}
                    {subscription.status === 'paused' && (
                      <button 
                        onClick={() => handleResumeSubscription(subscription._id)}
                        className="px-6 py-3 bg-green-50 text-green-600 border-2 border-green-200 rounded-xl font-semibold hover:bg-green-100 transition-colors"
                      >
                        Resume Subscription
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/tiffins/${subscription.tiffin._id}`)}
                      className="px-6 py-3 text-neutral-500 hover:text-primary-600 rounded-xl font-medium transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedSubscription && (
          <SubscriptionModal
            subscription={selectedSubscription}
            onClose={() => setSelectedSubscription(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const SubscriptionModal = ({ subscription, onClose }) => {
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    try {
      // Mock subscription details
      const mockDetails = {
        deliveryStats: {
          totalDeliveries: 31,
          deliveredCount: 15,
          pendingCount: 0,
          remainingDeliveries: 16
        },
        deliveries: [
          { _id: '1', deliveryDate: '2024-01-15', status: 'delivered' },
          { _id: '2', deliveryDate: '2024-01-14', status: 'delivered' },
          { _id: '3', deliveryDate: '2024-01-13', status: 'delivered' },
          { _id: '4', deliveryDate: '2024-01-12', status: 'delivered' },
          { _id: '5', deliveryDate: '2024-01-11', status: 'delivered' }
        ]
      };
      setDetails(mockDetails);
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">Subscription Details</h3>
            <p className="text-neutral-500">{subscription.tiffin.title}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-10 h-10 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-neutral-600" />
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900">{details.deliveryStats.totalDeliveries}</p>
                <p className="text-sm text-neutral-500">Total</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{details.deliveryStats.deliveredCount}</p>
                <p className="text-sm text-neutral-500">Delivered</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{details.deliveryStats.pendingCount}</p>
                <p className="text-sm text-neutral-500">Pending</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{details.deliveryStats.remainingDeliveries}</p>
                <p className="text-sm text-neutral-500">Remaining</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-neutral-50 rounded-xl p-5">
              <h4 className="font-semibold text-neutral-700 mb-3 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2 text-primary-500" />
                Delivery Address
              </h4>
              <p className="text-neutral-600">{subscription.deliveryAddress.street}</p>
              <p className="text-neutral-600">{subscription.deliveryAddress.city}, {subscription.deliveryAddress.state}</p>
              <p className="text-neutral-600">{subscription.deliveryAddress.pincode}</p>
            </div>

            {/* Recent Deliveries */}
            <div>
              <h4 className="font-semibold text-neutral-700 mb-3 flex items-center">
                <TruckIcon className="w-5 h-5 mr-2 text-primary-500" />
                Recent Deliveries
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {details.deliveries.map((delivery) => (
                  <div key={delivery._id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium text-neutral-700">
                        {new Date(delivery.deliveryDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {delivery.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-neutral-100">
              <button
                onClick={() => { onClose(); navigate('/support'); }}
                className="flex-1 btn-secondary"
              >
                Contact Support
              </button>
              <button
                onClick={() => { onClose(); navigate(`/tiffins/${subscription.tiffin._id}`); }}
                className="flex-1 btn-primary"
              >
                Modify Subscription
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MySubscriptions;