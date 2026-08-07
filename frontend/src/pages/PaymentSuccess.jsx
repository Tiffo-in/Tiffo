import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import paymentSuccessAnimation from '../assets/lottie/payment-success.json';
import api from '../services/api';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 8;

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get('subscription');

  const [confirmed, setConfirmed] = useState(false);
  const [pollsLeft, setPollsLeft] = useState(MAX_POLLS);

  useEffect(() => {
    if (!subscriptionId) {
      setConfirmed(true);
      return;
    }

    let attempts = 0;
    let timer;

    const poll = async () => {
      try {
        const res = await api.get(`/subscriptions/${subscriptionId}`);
        const payload = res.data?.data;
        const sub = payload?.subscription ?? payload ?? res.data;
        if (
          sub?.status === 'active' &&
          (sub?.paymentStatus !== 'pending' || sub?.paymentMethod === 'cod')
        ) {
          setConfirmed(true);
          return;
        }
      } catch {
        // ignore and keep polling
      }

      attempts += 1;
      setPollsLeft(MAX_POLLS - attempts);

      if (attempts < MAX_POLLS) {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } else {
        setConfirmed(true);
      }
    };

    timer = setTimeout(poll, 1000);
    return () => clearTimeout(timer);
  }, [subscriptionId]);

  useEffect(() => {
    if (!confirmed) return;
    const timer = setTimeout(() => navigate('/dashboard'), 6000);
    return () => clearTimeout(timer);
  }, [confirmed, navigate]);

  if (!confirmed) {
    const progress = ((MAX_POLLS - pollsLeft) / MAX_POLLS) * 100;
    return (
      <div className="min-h-screen bg-surface-page text-neutral-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full bg-surface border border-neutral-200 rounded-3xl shadow-card-hover p-8 text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-60" />
            <div className="relative w-24 h-24 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center">
              <span className="text-4xl">💳</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-2">Confirming your order...</h2>
          <p className="text-xs text-neutral-500 mb-5">
            This usually takes just a moment. Please keep this window open.
          </p>

          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: POLL_INTERVAL_MS / 1000, ease: 'linear' }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">Syncing payment status...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page text-neutral-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#f97316', '#eab308', '#10b981', '#a855f7', '#3b82f6'][i % 5],
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: window.innerHeight + 20, opacity: [0, 1, 1, 0], rotate: [0, 360] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-surface border border-neutral-200 rounded-3xl shadow-card-hover p-8 text-center relative z-10 space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-2"
        >
          <div className="w-32 h-32 mx-auto">
            <Lottie animationData={paymentSuccessAnimation} loop={false} autoplay />
          </div>
        </motion.div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">Order Confirmed!</h1>
          <p className="text-xs text-neutral-500">
            Your tiffin subscription has been activated successfully.
          </p>
        </div>

        {/* What's Next Card */}
        <div className="bg-surface-alt border border-neutral-200 rounded-2xl p-5 text-left space-y-3">
          <h3 className="font-bold text-sm text-neutral-900 flex items-center space-x-2">
            <span>🎉</span>
            <span>What happens next?</span>
          </h3>
          <ul className="space-y-2 text-xs text-neutral-600">
            {[
              'You will receive a confirmation receipt shortly',
              'Your kitchen partner has received your order',
              'Meals will be delivered according to your schedule',
              'Track live status anytime from your Dashboard',
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Link
            to="/dashboard"
            className="btn-primary w-full py-3 text-xs flex items-center justify-center space-x-2 active:scale-95"
          >
            <span>Go to Dashboard</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <p className="text-[11px] text-neutral-500">Auto redirecting in 6 seconds...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
