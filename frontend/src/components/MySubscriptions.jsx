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
  PauseCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { isBeforeSkipCutoff, MAX_SKIPS_PER_MONTH } from '../utils/subscriptionPolicy';
import DeliveryStatusChip from './delivery/DeliveryStatusChip';
import DeliveryFeedbackControls from './delivery/DeliveryFeedbackControls';
import TodaysTiffin from './delivery/TodaysTiffin';
import { getDeliveryStatus, statusTimestampField } from './delivery/deliveryStatus';
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
        setSubscriptions((prev) =>
          prev.map((sub) => (sub._id === id ? { ...sub, status: 'paused' } : sub))
        );
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
        setSubscriptions((prev) =>
          prev.map((sub) => (sub._id === id ? { ...sub, status: 'active' } : sub))
        );
        toast.success('Subscription resumed', { id: 'resume' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resume subscription', {
        id: 'resume',
      });
    }
  };

  // Renew: create a continuing subscription, then send the customer to checkout
  // to pay for it (the normal payment flow generates the new deliveries).
  const handleRenew = async (id) => {
    try {
      toast.loading('Setting up your renewal...', { id: 'renew' });
      const response = await api.post(`/subscriptions/${id}/renew`);
      if (response.data.success) {
        toast.success('Renewal ready — complete payment to activate.', { id: 'renew' });
        navigate(`/checkout/${response.data.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not start renewal', { id: 'renew' });
    }
  };

  // Days left until a subscription ends (null if no end date).
  const daysUntilEnd = (endDate) =>
    endDate ? Math.ceil((new Date(endDate) - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  // Auto-open renewal when arriving from the reminder email (?renew=<id>).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('renew');
    if (id) handleRenew(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          text: 'text-neutral-900',
          icon: CheckCircleIcon,
          label: 'Active',
        };
      case 'paused':
        return {
          bg: 'bg-gradient-to-r from-amber-400 to-orange-400',
          text: 'text-neutral-900',
          icon: PauseCircleIcon,
          label: 'Paused',
        };
      case 'cancelled':
        return {
          bg: 'bg-gradient-to-r from-red-400 to-rose-500',
          text: 'text-neutral-900',
          icon: XMarkIcon,
          label: 'Cancelled',
        };
      default:
        return {
          bg: 'bg-neutral-100',
          text: 'text-neutral-600',
          icon: ClockIcon,
          label: status,
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
      <TodaysTiffin />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">My Subscriptions</h2>
          <p className="text-neutral-500 mt-1">Manage your active tiffin subscriptions</p>
        </div>
        <button
          onClick={() => navigate('/tiffins')}
          className="btn-primary flex items-center space-x-2"
        >
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
          <Link to="/tiffins" className="btn-primary inline-block">
            Browse Tiffins
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {subscriptions.map((subscription, index) => {
            const statusConfig = getStatusConfig(subscription.status);
            const StatusIcon = statusConfig.icon;
            const delivered = subscription.deliveryStats?.deliveredCount ?? 0;
            const remaining = subscription.deliveryStats?.remainingDeliveries ?? 0;
            const progress =
              delivered + remaining > 0 ? (delivered / (delivered + remaining)) * 100 : 0;

            return (
              <motion.div
                key={subscription._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-neutral-100 group"
              >
                {/* Status Bar */}
                <div className={`h-1.5 ${statusConfig.bg}`} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {subscription.tiffin?.images?.[0] ? (
                          <img
                            src={subscription.tiffin.images[0]}
                            alt={subscription.tiffin?.title || subscription.tiffin?.name}
                            className="w-20 h-20 rounded-xl object-cover shadow-card group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl shadow-card bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform duration-300">
                            🍱
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-2 -right-2 w-6 h-6 ${statusConfig.bg} rounded-full flex items-center justify-center`}
                        >
                          <StatusIcon className="w-4 h-4 text-neutral-900" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {subscription.tiffin?.title || subscription.tiffin?.name}
                        </h3>
                        <p className="text-neutral-600 flex items-center">
                          <span className="text-lg mr-1">👨‍🍳</span>
                          {subscription.partner.businessName}
                        </p>
                        <div className="flex items-center mt-2 space-x-3">
                          <span className="px-2.5 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold">
                            {subscription.tiffin?.cuisine}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`${statusConfig.bg} ${statusConfig.text} px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-card`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">{delivered}</p>
                      <p className="text-sm text-neutral-600 font-medium">Delivered</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">{remaining}</p>
                      <p className="text-sm text-neutral-600 font-medium">Remaining</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-amber-600">
                        ₹{subscription.tiffin?.price?.daily ?? subscription.totalAmount}
                      </p>
                      <p className="text-sm text-neutral-600 font-medium">Per Day</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                      <p className="text-xl font-bold text-purple-600">{subscription.plan}</p>
                      <p className="text-sm text-neutral-600 font-medium">Plan</p>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-6 p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <CalendarDaysIcon className="w-4 h-4 text-neutral-400" />
                      <span>
                        {new Date(subscription.startDate).toLocaleDateString()} -{' '}
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-neutral-400" />
                      <span>{subscription.deliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-neutral-400" />
                      <span>{subscription.deliveryAddress?.city || 'Address not provided'}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-neutral-600">
                        Delivery Progress
                      </span>
                      <span className="text-sm font-bold text-primary-600">
                        {Math.round(progress)}%
                      </span>
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
                    {subscription.status === 'active' &&
                      !subscription.renewedToSubscription &&
                      daysUntilEnd(subscription.endDate) !== null &&
                      daysUntilEnd(subscription.endDate) <= 3 && (
                        <button
                          onClick={() => handleRenew(subscription._id)}
                          className="px-6 py-3 bg-primary-500 text-on-brand rounded-xl font-semibold hover:bg-primary-600 transition-colors"
                        >
                          Renew
                          {daysUntilEnd(subscription.endDate) >= 0
                            ? ` · ends in ${daysUntilEnd(subscription.endDate)}d`
                            : ''}
                        </button>
                      )}
                    <button
                      onClick={() =>
                        navigate(
                          `/tiffins/${subscription.tiffin?.slug || subscription.tiffin?._id}`
                        )
                      }
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
      const response = await api.get(`/subscriptions/${subscription._id}`);
      if (response.data.success) {
        setDetails(response.data.data);
      } else {
        toast.error('Failed to load subscription details');
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const [busyId, setBusyId] = useState(null);

  const canSkip = (delivery) =>
    delivery.status === 'scheduled' && isBeforeSkipCutoff(delivery.deliveryDate);

  const toggleSkip = async (delivery, action) => {
    setBusyId(delivery._id);
    try {
      const res = await api.patch(`/deliveries/${delivery._id}/${action}`);
      toast.success(res.data.message || 'Updated');
      await fetchDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update this delivery');
    } finally {
      setBusyId(null);
    }
  };

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
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">Subscription Details</h3>
            <p className="text-neutral-500">
              {subscription.tiffin?.title || subscription.tiffin?.name}
            </p>
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
                <p className="text-2xl font-bold text-neutral-900">
                  {details.deliveryStats.totalDeliveries}
                </p>
                <p className="text-sm text-neutral-500">Total</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {details.deliveryStats.deliveredCount}
                </p>
                <p className="text-sm text-neutral-500">Delivered</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {details.deliveryStats.pendingCount}
                </p>
                <p className="text-sm text-neutral-500">Pending</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {details.deliveryStats.remainingDeliveries}
                </p>
                <p className="text-sm text-neutral-500">Remaining</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-neutral-50 rounded-xl p-5">
              <h4 className="font-semibold text-neutral-700 mb-3 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2 text-brand" />
                Delivery Address
              </h4>
              <p className="text-neutral-600">{subscription.deliveryAddress?.street}</p>
              <p className="text-neutral-600">
                {subscription.deliveryAddress?.city}, {subscription.deliveryAddress?.state}
              </p>
              <p className="text-neutral-600">{subscription.deliveryAddress?.pincode}</p>
            </div>

            {/* Delivery timeline — status-accurate per day (Phase 1) */}
            <div>
              <h4 className="font-semibold text-neutral-700 mb-3 flex items-center">
                <TruckIcon className="w-5 h-5 mr-2 text-brand" />
                Delivery Timeline
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {details.deliveries.map((delivery) => {
                  const cfg = getDeliveryStatus(delivery.status);
                  const doneAt = delivery[statusTimestampField(delivery.status)];
                  return (
                    <div
                      key={delivery._id}
                      className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`}
                          aria-hidden="true"
                        />
                        <div>
                          <span className="font-medium text-neutral-700 block">
                            {new Date(delivery.deliveryDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {doneAt && (
                            <span className="text-xs text-neutral-500">
                              {new Date(doneAt).toLocaleTimeString('en-IN', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {delivery.status === 'delivered' ? (
                          <DeliveryFeedbackControls delivery={delivery} onDone={fetchDetails} />
                        ) : (
                          <>
                            <DeliveryStatusChip status={delivery.status} />
                            {canSkip(delivery) && (
                              <button
                                onClick={() => toggleSkip(delivery, 'skip')}
                                disabled={busyId === delivery._id}
                                className="text-xs font-semibold text-neutral-500 hover:text-primary-600 disabled:opacity-50"
                              >
                                Skip
                              </button>
                            )}
                            {delivery.status === 'skipped' && (
                              <button
                                onClick={() => toggleSkip(delivery, 'unskip')}
                                disabled={busyId === delivery._id}
                                className="text-xs font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
                              >
                                Undo
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Skipping a day adds a make-up delivery to the end of your plan — you never lose a
                meal. Up to {MAX_SKIPS_PER_MONTH} skips per month.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-neutral-100">
              <button
                onClick={() => {
                  onClose();
                  navigate('/support');
                }}
                className="flex-1 btn-secondary"
              >
                Contact Support
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate(`/tiffins/${subscription.tiffin?.slug || subscription.tiffin?._id}`);
                }}
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
