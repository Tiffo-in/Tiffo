import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import paymentSuccessAnimation from '../assets/lottie/payment-success.json';
import api from '../services/api';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 8; // 16 seconds max

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const subscriptionId = searchParams.get('subscription');

    const [confirmed, setConfirmed] = useState(false);
    const [pollsLeft, setPollsLeft]   = useState(MAX_POLLS);

    /* ── Poll until subscription.status === 'active' ── */
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
                // Backend wraps: { data: { subscription, deliveries, deliveryStats } }
                const payload = res.data?.data;
                const sub = payload?.subscription ?? payload ?? res.data;
                if (sub?.status === 'active' && sub?.paymentStatus !== 'pending') {
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
                // Timed out — show success anyway (webhook may still be in-flight)
                setConfirmed(true);
            }
        };

        // Small initial delay so the verify step on Checkout has time to finish first
        timer = setTimeout(poll, 1000);
        return () => clearTimeout(timer);
    }, [subscriptionId]);

    /* ── Auto-redirect after confirmed ── */
    useEffect(() => {
        if (!confirmed) return;
        const timer = setTimeout(() => navigate('/dashboard'), 6000);
        return () => clearTimeout(timer);
    }, [confirmed, navigate]);

    /* ── Confirming state ── */
    if (!confirmed) {
        const progress = ((MAX_POLLS - pollsLeft) / MAX_POLLS) * 100;
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-sm w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
                >
                    {/* Animated pulse */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-60" />
                        <div className="relative w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                            <span className="text-4xl">💳</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">Confirming your payment…</h2>
                    <p className="text-sm text-gray-500 mb-5">This usually takes just a moment. Please don't close this tab.</p>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-green-500 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: POLL_INTERVAL_MS / 1000, ease: 'linear' }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Checking with Razorpay…</p>
                </motion.div>
            </div>
        );
    }

    /* ── Confirmed state ── */
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 flex items-center justify-center px-4">
            {/* Confetti */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            backgroundColor: ['#9f1239', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'][i % 5],
                        }}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: window.innerHeight + 20, opacity: [0, 1, 1, 0], rotate: [0, 360] }}
                        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2, ease: 'linear' }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center relative z-10"
            >
                {/* Lottie */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mb-6"
                >
                    <div className="w-32 h-32 mx-auto">
                        <Lottie animationData={paymentSuccessAnimation} loop={false} autoplay />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6">Your tiffin subscription has been activated.</p>

                    {/* What's Next */}
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-5 mb-6 text-left border border-green-100 dark:border-neutral-700">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="text-xl mr-2">🎉</span> What's Next?
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-700">
                            {[
                                "You'll receive a confirmation email shortly",
                                'Your tiffin provider has been notified',
                                'Delivery will start from your selected date',
                                'Track your order live from the dashboard'
                            ].map((item, i) => (
                                <li key={i} className="flex items-start">
                                    <motion.span
                                        className="text-green-600 mr-2 flex-shrink-0 font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                    >✓</motion.span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <motion.button
                            onClick={() => navigate('/dashboard')}
                            className="w-full btn-primary py-3 rounded-xl font-semibold"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        >
                            Go to Dashboard
                        </motion.button>
                        <motion.button
                            onClick={() => navigate('/tiffins')}
                            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        >
                            Browse More Tiffins
                        </motion.button>
                    </div>

                    <motion.p
                        className="text-xs text-gray-400 mt-4 flex items-center justify-center"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                    >
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                        Redirecting to dashboard in 6 seconds…
                    </motion.p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
