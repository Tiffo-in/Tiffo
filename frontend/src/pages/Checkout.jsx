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
          color: '#FF7A00', // design-system-ok: Razorpay's SDK takes a hex string, not a CSS var
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
      <div className="min-h-screen bg-surface-page flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-xs text-neutral-500 font-medium">Loading checkout details...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-surface-page flex items-center justify-center p-4">
        <div className="bg-surface border border-neutral-200 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-xl font-bold text-neutral-900">Subscription Not Found</h2>
          <p className="text-xs text-neutral-500">
            The subscription you are trying to checkout does not exist or has expired.
          </p>
          <Link
            to="/tiffins"
            className="inline-block px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-on-brand font-semibold text-xs shadow-card transition-colors"
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
      <div className="min-h-screen bg-surface-page flex items-center justify-center p-4">
        <div className="bg-surface border border-neutral-200 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-neutral-900">Verifying your payment...</h3>
          <p className="text-xs text-neutral-500">
            Please stay on this tab while we confirm your payment receipt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page text-neutral-900 font-sans selection:bg-primary-500/30 selection:text-neutral-900">
      {/* Top Navigation */}
      <header className="border-b border-neutral-200 bg-surface-page/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-surface-alt hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-all flex items-center space-x-1.5 text-xs font-semibold"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Cancel Checkout</span>
          </Link>

          <Link to="/" className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-cta flex items-center justify-center font-black text-on-brand text-sm">
              T
            </span>
            <span className="text-lg font-bold text-neutral-900 tracking-tight">
              Tiffo<span className="text-brand-ink">.</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">Checkout</h1>
          <p className="text-xs text-neutral-500">Complete your tiffin plan subscription payment</p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-surface border border-neutral-200 rounded-2xl p-6 shadow-card-hover space-y-5">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-3">
            Order Summary
          </h2>

          {/* Meal Info */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-alt border border-neutral-200 flex items-center justify-center text-3xl shrink-0">
              🍱
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-base font-bold text-neutral-900">
                {subscription.tiffin?.title || 'Tiffin Meal Plan'}
              </h3>
              <p className="text-xs text-neutral-500">
                by{' '}
                {subscription.partner?.businessName ||
                  subscription.partner?.name ||
                  'Verified Kitchen'}
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-tint text-brand-ink border border-brand-border">
                {subscription.plan} Plan
              </span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-2.5 pt-3 border-t border-neutral-200 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 flex items-center space-x-1.5">
                <CalendarDaysIcon className="w-4 h-4 text-brand" />
                <span>Start Date</span>
              </span>
              <span className="font-semibold text-neutral-900">
                {new Date(subscription.startDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-500 flex items-center space-x-1.5">
                <ClockIcon className="w-4 h-4 text-brand" />
                <span>Delivery Window</span>
              </span>
              <span className="font-semibold text-neutral-900">{subscription.deliveryTime}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-500 flex items-center space-x-1.5">
                <MapPinIcon className="w-4 h-4 text-brand" />
                <span>Delivery Location</span>
              </span>
              <span className="font-semibold text-neutral-900 text-right max-w-xs truncate">
                {subscription.deliveryAddress?.street}, {subscription.deliveryAddress?.city}
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 pt-3 border-t border-neutral-200 text-xs">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>GST ({subscription.gstRate ?? 5}%)</span>
              <span className="font-semibold text-neutral-900">
                ₹{gstAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-base font-bold">
              <span className="text-neutral-900">Total Amount</span>
              <span className="text-brand-ink">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-surface border border-neutral-200 rounded-2xl p-6 shadow-card-hover space-y-4">
          <h2 className="text-base font-bold text-neutral-900">Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pay Online */}
            <button
              type="button"
              disabled
              className="p-5 rounded-2xl border border-neutral-200 bg-surface-alt opacity-60 text-center relative cursor-not-allowed select-none w-full space-y-1"
            >
              <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Coming Soon
              </span>
              <span className="text-3xl block">💳</span>
              <span className="font-bold text-neutral-500 text-sm">Pay Online</span>
              <span className="text-[11px] text-neutral-500 block">UPI, Cards, Net Banking</span>
            </button>

            {/* Cash on Delivery */}
            <button
              type="button"
              onClick={() => setPayMethod('cod')}
              className={`p-5 rounded-2xl border text-center relative transition-all space-y-1 ${
                payMethod === 'cod'
                  ? 'border-brand bg-brand-tint ring-1 ring-brand'
                  : 'border-neutral-200 bg-surface-alt hover:border-neutral-300'
              }`}
            >
              <span className="text-3xl block">💵</span>
              <span className="font-bold text-neutral-900 text-sm">Cash on Delivery</span>
              <span className="text-[11px] text-neutral-500 block">Pay cash on first delivery</span>
              {payMethod === 'cod' && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand text-on-brand flex items-center justify-center text-xs font-bold shadow-card">
                  ✓
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notice Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3">
          <span className="text-xl">💵</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Cash on Delivery Notice:</strong> No upfront payment needed. Pay cash or UPI
            directly to your delivery partner on your first scheduled meal delivery!
          </p>
        </div>

        {/* Submit Action */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="btn-primary w-full py-4 text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95"
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
