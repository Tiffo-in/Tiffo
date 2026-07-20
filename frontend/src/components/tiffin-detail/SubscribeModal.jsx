import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';

import { MEAL_COLORS, DELIVERY_SLOTS } from './tiffinPricing';

const tomorrowIso = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

/**
 * Subscription details form. Owns its own field state; the parent only
 * receives the collected details via onSubmit(details).
 */
const SubscribeModal = ({
  open,
  tiffin,
  selectedPlan,
  onSelectPlan,
  grandTotal,
  creating,
  onClose,
  onSubmit,
}) => {
  const [startDate, setStartDate] = useState(tomorrowIso);
  const [deliveryTime, setDeliveryTime] = useState(DELIVERY_SLOTS[3]);
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Fresh default date each time the modal opens
  useEffect(() => {
    if (open) setStartDate(tomorrowIso());
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ startDate, deliveryTime, address, specialInstructions });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
          >
            <div
              className={`bg-gradient-to-r ${MEAL_COLORS[tiffin.mealType] || 'from-maroon-500 to-orange-500'} p-6 rounded-t-3xl text-white relative`}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-bold">Subscribe to {tiffin.title}</h2>
              <p className="text-white/80 text-sm mt-1">Fill in the details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Selected Plan
                </label>
                <div className="flex gap-2">
                  {['daily', 'weekly', 'monthly'].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => onSelectPlan(p)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 capitalize transition-all ${selectedPlan === p ? 'bg-maroon-600 border-maroon-600 text-white' : 'border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:border-maroon-400'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                  Total: ₹{grandTotal} (incl. 5% GST)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={tomorrowIso()}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Delivery Time *
                </label>
                <select
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="input-field w-full"
                >
                  {DELIVERY_SLOTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">
                  Delivery Address *
                </label>
                <div className="space-y-2">
                  <input
                    placeholder="Street / Flat no / Colony *"
                    required
                    value={address.street}
                    onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                    className="input-field w-full"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="City *"
                      required
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      className="input-field"
                    />
                    <input
                      placeholder="State"
                      value={address.state}
                      onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <input
                    placeholder="Pincode *"
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Special Instructions (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Allergies, spice level, leave at door, etc."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="input-field w-full resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={creating}
                className="w-full btn-primary py-3.5 font-bold text-base rounded-xl disabled:opacity-60"
                whileHover={{ scale: creating ? 1 : 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Adding to Cart…
                  </span>
                ) : (
                  <span>➕ Add to Cart</span>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscribeModal;
