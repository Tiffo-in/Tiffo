import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

import { MEAL_COLORS, PLAN_LABELS } from './tiffinPricing';

/* Sticky right-column card: plan selector, price breakdown, subscribe CTA. */
const TiffinPricingCard = ({
  tiffin,
  daily,
  planPrice,
  planOriginal,
  selectedPlan,
  onSelectPlan,
  gstAmount,
  grandTotal,
  hasCartItem,
  onSubscribe,
  onViewCart,
}) => (
  <div className="sticky top-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-100 dark:border-neutral-800 overflow-hidden">
    <div
      className={`bg-gradient-to-r ${MEAL_COLORS[tiffin.mealType] || 'from-maroon-500 to-orange-500'} p-5 text-white`}
    >
      <p className="text-sm opacity-80 mb-1">Starting at</p>
      <p className="text-4xl font-extrabold">
        ₹{daily}
        <span className="text-lg font-normal opacity-80">/day</span>
      </p>
    </div>

    <div className="p-5 space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">
          Choose a Plan
        </p>
        <div className="space-y-2">
          {['daily', 'weekly', 'monthly'].map((plan) => {
            const orig = planOriginal[plan];
            const eff = planPrice[plan];
            const disc = Math.round((1 - eff / orig) * 100);
            return (
              <button
                key={plan}
                onClick={() => onSelectPlan(plan)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${selectedPlan === plan ? 'border-maroon-600 bg-maroon-50 dark:bg-maroon-900/30' : 'border-gray-200 dark:border-neutral-700 hover:border-maroon-300'}`}
              >
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-neutral-100 capitalize">
                    {plan}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {PLAN_LABELS[plan].desc}
                  </p>
                </div>
                <div className="text-right">
                  {disc > 0 && <p className="text-xs text-gray-400 line-through">₹{orig}</p>}
                  <p className="font-bold text-gray-900 dark:text-neutral-100">₹{eff}</p>
                  {disc > 0 && <p className="text-xs text-green-600 font-semibold">{disc}% off</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1 text-sm border-t pt-4 dark:border-neutral-700">
        <div className="flex justify-between text-gray-600 dark:text-neutral-400">
          <span>Subtotal</span>
          <span>₹{planPrice[selectedPlan]}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-neutral-400">
          <span>GST (5%)</span>
          <span>₹{gstAmount}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 dark:text-neutral-100 text-base pt-1 border-t dark:border-neutral-700">
          <span>Total</span>
          <span className="text-maroon-600">₹{grandTotal}</span>
        </div>
      </div>

      <motion.button
        onClick={onSubscribe}
        className="w-full btn-primary py-3.5 text-base font-bold flex items-center justify-center gap-2 rounded-xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="text-xl">+</span>
        Subscribe Now
      </motion.button>

      {hasCartItem && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onViewCart}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-maroon-600 text-maroon-600 font-semibold rounded-xl hover:bg-maroon-50 dark:hover:bg-maroon-900/20 transition-colors"
        >
          <ShoppingCartIcon className="h-5 w-5" />
          View Cart (1 item)
        </motion.button>
      )}

      <div className="border-t dark:border-neutral-700 pt-4 text-xs text-gray-500 dark:text-neutral-400 space-y-1">
        <p>🏪 {tiffin.partner?.businessName || 'Partner'}</p>
        <p>⏱️ Fresh daily preparation</p>
        <p>💵 Pay on delivery only (COD)</p>
      </div>
    </div>
  </div>
);

export default TiffinPricingCard;
