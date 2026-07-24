import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
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
  const [step, setStep] = useState('summary');
  const [payMethod, setPayMethod] = useState('cod');

  useEffect(() => {
    fetchSubscriptionDetails();
    loadRazorpayScript();
  }, [subscriptionId]);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await api.get(`/subscriptions/${subscriptionId}`);
      const payload = response.data?.data;
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
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        setProcessing(false);
        return;
      }

      const orderData = await createOrder(subscriptionId);
      if (!orderData?.orderId) {
        toast.error('Failed to initiate payment session');
        setProcessing(false);
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Tiffo Services',
        description: `Tiffin Subscription Payment`,
        image: '/logo.png',
        order_id: orderData.orderId,
        handler: async (response) => {
          setStep('verifying');
          try {
            const verification = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              subscriptionId,
            });

            if (verification.success) {
              toast.success('Payment verified successfully!');
              navigate(`/payment/success?subscription=${subscriptionId}`);
            } else {
              toast.error('Payment verification failed.');
              navigate(`/payment/failed?subscription=${subscriptionId}`);
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Error verifying payment.');
            navigate(`/payment/failed?subscription=${subscriptionId}`);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#f97316',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment Failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        navigate(`/payment/failed?subscription=${subscriptionId}`);
      });

      paymentObject.open();
      setProcessing(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment initiation failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-medium">Loading checkout details...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-4">
        <div className="bg-[#14151e] border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-xl font-bold text-white">Subscription Not Found</h2>
          <p className="text-xs text-zinc-400">
            The subscription you are trying to checkout does not exist or has expired.
          </p>
          <Link
            to="/tiffins"
            className="inline-block px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-xs shadow-lg shadow-orange-500/20"
          >
            Browse Tiffins
          </Link>
        </div>
      </div>
    );
  }

  const grandTotal = subscription.totalAmount || 0;
  const subtotal = Math.round(grandTotal / 1.05);
  const gstAmount = grandTotal - subtotal;
  const hasSavings = subscription.originalAmount > 0 && subscription.originalAmount > subtotal;

  if (step === 'verifying') {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-4">
        <div className="bg-[#14151e] border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">Verifying your payment...</h3>
          <p className="text-xs text-zinc-400">
            Please stay on this tab while we confirm your payment receipt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800/80 bg-[#111218]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center space-x-1.5 text-xs font-semibold"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Cancel Checkout</span>
          </Link>

          <Link to="/" className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white text-sm">
              T
            </span>
            <span className="text-lg font-bold text-white tracking-tight">
              Tiffo<span className="text-orange-500">.</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Checkout</h1>
          <p className="text-xs text-zinc-400">Complete your tiffin plan subscription payment</p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-white border-b border-zinc-800/80 pb-3">
            Order Summary
          </h2>

          {/* Meal Info */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl shrink-0">
              🍱
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-base font-bold text-white">
                {subscription.tiffin?.title || 'Tiffin Meal Plan'}
              </h3>
              <p className="text-xs text-zinc-400">
                by{' '}
                {subscription.partner?.businessName ||
                  subscription.partner?.name ||
                  'Verified Kitchen'}
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {subscription.plan} Plan
              </span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-2.5 pt-3 border-t border-zinc-800/80 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center space-x-1.5">
                <CalendarDaysIcon className="w-4 h-4 text-orange-400" />
                <span>Start Date</span>
              </span>
              <span className="font-semibold text-white">
                {new Date(subscription.startDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center space-x-1.5">
                <ClockIcon className="w-4 h-4 text-orange-400" />
                <span>Delivery Window</span>
              </span>
              <span className="font-semibold text-white">{subscription.deliveryTime}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center space-x-1.5">
                <MapPinIcon className="w-4 h-4 text-orange-400" />
                <span>Delivery Location</span>
              </span>
              <span className="font-semibold text-white text-right max-w-xs truncate">
                {subscription.deliveryAddress?.street}, {subscription.deliveryAddress?.city}
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 pt-3 border-t border-zinc-800/80 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span className="font-semibold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>GST ({subscription.gstRate ?? 5}%)</span>
              <span className="font-semibold text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80 text-base font-bold">
              <span className="text-white">Total Amount</span>
              <span className="text-orange-400">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pay Online */}
            <button
              type="button"
              disabled
              className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 opacity-50 text-center relative cursor-not-allowed select-none w-full space-y-1"
            >
              <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Coming Soon
              </span>
              <span className="text-3xl block">💳</span>
              <span className="font-bold text-zinc-400 text-sm">Pay Online</span>
              <span className="text-[11px] text-zinc-500 block">UPI, Cards, Net Banking</span>
            </button>

            {/* Cash on Delivery */}
            <button
              type="button"
              onClick={() => setPayMethod('cod')}
              className={`p-5 rounded-2xl border text-center relative transition-all space-y-1 ${
                payMethod === 'cod'
                  ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-500'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <span className="text-3xl block">💵</span>
              <span className="font-bold text-white text-sm">Cash on Delivery</span>
              <span className="text-[11px] text-zinc-400 block">Pay cash on first delivery</span>
              {payMethod === 'cod' && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  ✓
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notice Card */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center space-x-3">
          <span className="text-xl">💵</span>
          <p className="text-xs text-amber-300 leading-relaxed">
            <strong>Cash on Delivery Notice:</strong> No upfront payment needed. Pay cash or UPI
            directly to your delivery partner on your first scheduled meal delivery!
          </p>
        </div>

        {/* Submit Action */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95"
        >
          {processing ? (
            <span className="flex items-center space-x-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Placing Order...</span>
            </span>
          ) : (
            <span>Confirm Order ({payMethod === 'cod' ? 'Cash on Delivery' : 'Pay Online'})</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
