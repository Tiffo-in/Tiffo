import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

import { PLAN_LABELS } from './tiffinPricing';

/* Slide-in cart summary shown after a subscription draft is created. */
const CartDrawer = ({ open, cartItem, tiffin, onClose, onCheckout }) => (
  <AnimatePresence>
    {open && cartItem && (
      <>
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-card-hover flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 250 }}
        >
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="h-6 w-6 text-maroon-600" />
              <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
              <span className="bg-maroon-600 text-on-brand text-xs px-2 py-0.5 rounded-full">
                1
              </span>
            </div>
            <button onClick={onClose}>
              <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="bg-maroon-100 rounded-xl p-3 text-2xl">🍱</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    {cartItem.tiffin?.title || tiffin.title}
                  </h3>
                  <p className="text-sm text-gray-500">by {tiffin.partner?.businessName}</p>
                  <p className="text-xs text-maroon-600 font-semibold mt-1 capitalize">
                    {cartItem.plan} Plan
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>📅 Start Date</span>
                  <span className="font-medium">
                    {new Date(cartItem.startDate || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>⏰ Delivery Time</span>
                  <span className="font-medium">{cartItem.deliveryTime}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>🏠 Address</span>
                  <span className="font-medium text-right max-w-[55%]">
                    {cartItem.deliveryAddress?.street}, {cartItem.deliveryAddress?.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-2 text-sm">
              <h4 className="font-semibold text-gray-800 mb-2">Price Breakdown</h4>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{cartItem.totalAmount || cartItem.planPrice}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (5%)</span>
                <span>₹{cartItem.gstAmount}</span>
              </div>
              {cartItem.discountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{cartItem.discountLabel || `${cartItem.discountPercent}% Discount`}</span>
                  <span>-₹{cartItem.originalAmount - cartItem.totalAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
                <span>Total Amount</span>
                <span className="text-maroon-600">₹{cartItem.grandTotal}</span>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4" /> What's Included
              </h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>✓ Fresh daily tiffin delivery</li>
                <li>✓ Complete {PLAN_LABELS[cartItem.plan]?.desc}</li>
                <li>✓ Order tracking & notifications</li>
                <li>✓ Pause / cancel anytime</li>
              </ul>
            </div>
          </div>

          <div className="p-5 border-t bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Grand Total</span>
              <span className="text-2xl font-extrabold text-maroon-600">
                ₹{cartItem.grandTotal}
              </span>
            </div>
            <motion.button
              onClick={onCheckout}
              className="w-full btn-primary py-4 text-lg font-bold rounded-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Proceed to Checkout
            </motion.button>
            <button
              onClick={onClose}
              className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default CartDrawer;
