import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
  createOrder,
  verifyPayment,
  loadRazorpayScript,
  confirmCodPayment,
} from '../services/paymentService';

const Checkout = () => {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('summary'); // 'summary' | 'verifying'
  const [payMethod, setPayMethod] = useState('cod'); // 'online' | 'cod'

  useEffect(() => {
    fetchSubscriptionDetails();
    // Preload Razorpay script in background so clicking Pay is instant
    loadRazorpayScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionId]);

  const fetchSubscriptionDetails = async () => {
    try {
      // Backend returns { data: { subscription, deliveries, deliveryStats } }
      // The getSubscriptionDetails route nests the subscription inside .subscription
      const response = await api.get(`/subscriptions/${subscriptionId}`);
      const payload = response.data?.data;
      // If the backend returns the nested { subscription, deliveries } shape,
      // extract just the subscription object; otherwise use the payload as-is
      const sub = payload?.subscription ?? payload ?? response.data;
      setSubscription(sub);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);

    if (payMethod === 'cod') {
      try {
        const response = await confirmCodPayment(subscriptionId);
        if (response.success) {
          toast.success('Subscription placed successfully via Cash on Delivery!');
          navigate(`/payment/success?subscription=${subscriptionId}`);
        } else {
          toast.error('Failed to confirm Cash on Delivery order.');
          setProcessing(false);
        }
      } catch (error) {
        console.error('COD payment confirmation failed:', error);
        const msg = error.response?.data?.message || 'Something went wrong. Please try again.';
        toast.error(msg);
        setProcessing(false);
      }
      return;
    }

    try {
      // Script is preloaded, this will resolve instantly in most cases
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        setProcessing(false);
        return;
      }

      // Create the Razorpay order on backend
      let orderData;
      try {
        orderData = await createOrder(subscriptionId);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to create payment order';
        toast.error(msg);
        setProcessing(false);
        return;
      }

      const options = {
        key: orderData.razorpayKey,
        amount: orderData.amount, // in paise (includes GST from backend)
        currency: orderData.currency,
        name: 'TIFFO',
        description: `Tiffin Subscription – ${subscription?.plan}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          setStep('verifying');
          try {
            const verifyData = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              subscriptionId,
            });
            if (verifyData.success) {
              navigate(`/payment/success?subscription=${subscriptionId}`);
            } else {
              toast.error('Payment verification failed. Please contact support.');
              navigate(`/payment/failed?subscription=${subscriptionId}`);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error(
              'Payment could not be verified. If money was deducted, it will be refunded automatically.'
            );
            navigate(`/payment/failed?subscription=${subscriptionId}`);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#7F1D1D' },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setStep('summary');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || response.error.code}`);
        navigate(`/payment/failed?subscription=${subscriptionId}&error=${response.error.code}`);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Something went wrong. Please try again.');
      setProcessing(false);
      setStep('summary');
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-maroon-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription not found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ── Amounts — always use backend values ── */
  const subtotal = subscription.totalAmount || 0;
  const gstAmount = subscription.gstAmount ?? Math.round(subtotal * 0.05); // fallback for old records
  const grandTotal = subscription.grandTotal ?? subtotal + gstAmount;
  const hasSavings = subscription.originalAmount > 0 && subscription.originalAmount > subtotal;

  /* ── Verifying overlay ── */
  if (step === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-800">Verifying your payment…</p>
          <p className="text-sm text-gray-500 mt-1">Please don't close this tab</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your tiffin subscription payment</p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              {/* Tiffin Details */}
              <div className="flex items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-maroon-100 to-orange-100 dark:from-neutral-800 dark:to-neutral-700 rounded-lg flex items-center justify-center text-2xl">
                  🍱
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {subscription.tiffin?.title || 'Tiffin Service'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    by{' '}
                    {subscription.partner?.businessName || subscription.partner?.name || 'Partner'}
                  </p>
                  <p className="text-sm text-maroon-600 font-medium mt-1 capitalize">
                    {subscription.plan} Plan
                  </p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">📅 Start Date</span>
                  <span className="font-medium">
                    {new Date(subscription.startDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">📍 Delivery Time</span>
                  <span className="font-medium">{subscription.deliveryTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">🏠 Address</span>
                  <span className="font-medium text-right max-w-xs">
                    {subscription.deliveryAddress?.street}, {subscription.deliveryAddress?.city}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2">
                {/* Discount savings */}
                {hasSavings && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Original Price</span>
                      <span className="text-gray-400 line-through">
                        ₹{subscription.originalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700 font-semibold flex items-center gap-1">
                        🏷️{' '}
                        {subscription.discountLabel || `${subscription.discountPercent}% Discount`}
                      </span>
                      <span className="text-green-600 font-bold">
                        −₹{(subscription.originalAmount - subtotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center justify-between text-sm">
                      <span className="text-green-800 font-semibold">You save</span>
                      <span className="text-green-700 font-bold">
                        ₹{(subscription.originalAmount - subtotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>GST ({subscription.gstRate ?? 5}%)</span>
                  <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-maroon-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pay Online Card (Disabled - Coming Soon) */}
              <button
                type="button"
                disabled
                className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-gray-200 bg-gray-50/50 opacity-60 text-center relative cursor-not-allowed select-none w-full"
              >
                <span className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                  Coming Soon
                </span>
                <span className="text-4xl mb-2 grayscale">💳</span>
                <span className="font-bold text-gray-400">Pay Online</span>
                <span className="text-xs text-gray-400 mt-1">UPI, Cards, Net Banking</span>
              </button>

              {/* Cash on Delivery Card */}
              <button
                type="button"
                onClick={() => setPayMethod('cod')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all text-center relative ${
                  payMethod === 'cod'
                    ? 'border-maroon-600 bg-maroon-50/50 ring-2 ring-maroon-100'
                    : 'border-gray-150 hover:border-maroon-300 bg-white'
                }`}
              >
                <span className="text-4xl mb-2">💵</span>
                <span className="font-bold text-gray-900">Cash on Delivery</span>
                <span className="text-xs text-gray-500 mt-1">Pay cash on first delivery</span>
                {payMethod === 'cod' && (
                  <span className="absolute top-3 right-3 bg-maroon-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Security or COD notice */}
          {payMethod === 'online' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                🔒 <strong>Secure Payment:</strong> Your payment is processed securely through
                Razorpay. We never store your card details.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                💵 <strong>Cash on Delivery:</strong> No advance payment required. Please pay the
                partner cash/UPI when your first meal is delivered!
              </p>
            </div>
          )}

          {/* Action button */}
          <motion.button
            onClick={handlePayment}
            disabled={processing}
            className="w-full btn-primary py-4 text-lg disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
            whileHover={{ scale: processing ? 1 : 1.01 }}
            whileTap={{ scale: processing ? 1 : 0.99 }}
          >
            {processing ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {payMethod === 'online' ? 'Opening Payment…' : 'Placing Order…'}
              </>
            ) : payMethod === 'online' ? (
              `Pay ₹${grandTotal.toLocaleString('en-IN')}`
            ) : (
              `Place Order (COD) – ₹${grandTotal.toLocaleString('en-IN')}`
            )}
          </motion.button>

          {/* Cancel */}
          <div className="text-center mt-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-800 text-sm transition-colors"
            >
              ← Cancel and go back
            </button>
          </div>

          {/* Accepted methods */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-3">Accepted Payment Methods</p>
            <div className="flex justify-center space-x-4 text-2xl">
              <span title="Credit/Debit Cards">💳</span>
              <span title="UPI">📱</span>
              <span title="Net Banking">🏦</span>
              <span title="Wallets">👛</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
