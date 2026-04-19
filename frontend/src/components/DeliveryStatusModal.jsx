import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { updateDeliveryStatus } from '../store/slices/customerSlice';
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Update Deliveries</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {customerName} - {new Date(date).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(deliveries).map(([mealType, delivery]) => (
                <div key={mealType} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getMealIcon(mealType)}</span>
                      <span className="font-medium capitalize">{mealType}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(delivery.id, 'delivered', mealType)}
                      disabled={updating === delivery.id || delivery.status === 'delivered'}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                        delivery.status === 'delivered'
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {updating === delivery.id ? '...' : '✓ Delivered'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(delivery.id, 'cancelled', mealType)}
                      disabled={updating === delivery.id || delivery.status === 'cancelled'}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                        delivery.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {updating === delivery.id ? '...' : '✕ Cancel'}
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