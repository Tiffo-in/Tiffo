import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { updateDeliveryStatus } from '../store/slices/customerSlice';
import { XMarkIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DeliveryStatusModal = ({ isOpen, onClose, deliveries, date, customerName }) => {
  const dispatch = useDispatch();
  const [updating, setUpdating] = useState(null);

  const handleStatusUpdate = async (deliveryId, newStatus, mealType) => {
    setUpdating(deliveryId);
    try {
      await dispatch(updateDeliveryStatus({ deliveryId, status: newStatus })).unwrap();
      toast.success(`${mealType} delivery marked as ${newStatus}`);
      onClose();
    } catch (error) {
      toast.error('Failed to update delivery status');
    } finally {
      setUpdating(null);
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      default:
        return '🍱';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-surface border border-neutral-200/80 rounded-2xl shadow-card-hover p-6 w-full max-w-md text-neutral-900 z-10"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Update Delivery Status</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {customerName} • {new Date(date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-surface-alt/80 hover:bg-surface-alt text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Deliveries List */}
            <div className="space-y-4">
              {Object.entries(deliveries).map(([mealType, delivery]) => (
                <div
                  key={mealType}
                  className="bg-surface/80 border border-neutral-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getMealIcon(mealType)}</span>
                      <span className="text-xs font-bold text-neutral-900 capitalize">
                        {mealType}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        delivery.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                          : delivery.status === 'cancelled'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {delivery.status}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleStatusUpdate(delivery.id, 'delivered', mealType)}
                      disabled={updating === delivery.id || delivery.status === 'delivered'}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${
                        delivery.status === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-500 cursor-not-allowed border border-emerald-500/20'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-neutral-900 shadow-card'
                      }`}
                    >
                      <span>✓ Delivered</span>
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(delivery.id, 'cancelled', mealType)}
                      disabled={updating === delivery.id || delivery.status === 'cancelled'}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${
                        delivery.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-500 cursor-not-allowed border border-rose-500/20'
                          : 'bg-rose-600 hover:bg-rose-500 text-neutral-900 shadow-card'
                      }`}
                    >
                      <span>✕ Cancel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeliveryStatusModal;
