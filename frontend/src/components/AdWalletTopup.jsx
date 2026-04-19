import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { XMarkIcon, CurrencyRupeeIcon, BoltIcon } from '@heroicons/react/24/outline';

const AdWalletTopup = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Dynamically load Razorpay script
    const loadRazorpayScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    };

    if (isOpen && !window.Razorpay) {
      loadRazorpayScript();
    }
  }, [isOpen]);

  const handleTopup = async () => {
    if (amount < 100) {
      setError('Minimum amount is ₹100');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1. Create order on backend
      const orderRes = await api.post('/ads/wallet/create-order', { amount: Number(amount) });
      const { order } = orderRes.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'your_razorpay_key_id', // Usually available to frontend
        amount: order.amount,
        currency: order.currency,
        name: 'Tiffo Partner Ads',
        description: 'Wallet Top-up',
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify on backend
            const verifyRes = await api.post('/ads/wallet/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amountAdded: amount
            });

            if (verifyRes.data.success) {
              onSuccess(verifyRes.data.walletBalance);
              onClose();
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: 'Tiffo Partner',
          email: 'partner@tiffo.com',
          contact: '9999999999'
        },
        theme: {
          color: '#0d9488'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(response.error.description);
      });
      rzp.open();

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-neutral-100 dark:border-neutral-800">
              {/* Header */}
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 px-6 py-8 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                    <BoltIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Top Up Wallet</h2>
                    <p className="text-teal-100 text-sm font-medium">Power up your ad campaigns</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {error && (
                  <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-start">
                    <span className="mr-2">⚠️</span> {error}
                  </div>
                )}

                <label htmlFor="topup-amount" className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Enter Amount
                </label>
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CurrencyRupeeIcon className="h-6 w-6 text-neutral-400" />
                  </div>
                  <input
                    id="topup-amount"
                    name="topupAmount"
                    type="number"
                    min="100"
                    step="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-800 border-0 rounded-2xl text-2xl font-bold text-neutral-900 dark:text-white focus:ring-4 focus:ring-teal-500/20 transition-all font-mono"
                  />
                </div>

                {/* Pre-set chips */}
                <div className="flex space-x-2 mb-6">
                  {[200, 500, 1000, 2000].map(val => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all ${
                        amount === val 
                          ? 'bg-teal-100 text-teal-800 ring-2 ring-teal-500 dark:bg-teal-900 dark:text-teal-200' 
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTopup}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl flex items-center justify-center transition-all ${
                    loading ? 'bg-teal-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:shadow-teal-500/30'
                  }`}
                >
                  {loading ? 'Processing...' : `Pay ₹${amount}`}
                </motion.button>
                <p className="text-center text-xs text-neutral-400 mt-4 flex items-center justify-center">
                  🔒 Secured by Razorpay
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdWalletTopup;
