import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { HeartIcon, TruckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

import api from '../../services/api';

const HomeAppPromo = () => {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isWaitlistSubmitted, setIsWaitlistSubmitted] = useState(false);

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    try {
      await api.post('/waitlist', { email: waitlistEmail, source: 'home_page' });
      setIsWaitlistSubmitted(true);
      toast.success('Thanks for joining the waitlist!');
      setWaitlistEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join waitlist. Please try again.');
    }
  };

  return (
    <section className="py-32 relative overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ y: 40 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          className="bg-neutral-900 dark:bg-neutral-900 rounded-[3rem] p-10 md:p-20 relative overflow-hidden shadow-2xl border border-neutral-800"
        >
          {/* Premium Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-neutral-900 to-secondary-900/40 opacity-80" />
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/30 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-500/30 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="max-w-xl text-center md:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white font-bold text-sm mb-8 border border-white/10 shadow-lg">
                <SparklesIcon className="w-4 h-4 text-primary-400" />
                COMING SOON
              </span>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                Tiffo in your <br />
                pocket.
              </h2>
              <p className="text-xl md:text-2xl text-neutral-300 mb-12 font-medium leading-relaxed">
                Track orders in real-time, manage subscriptions instantly, and discover new meals on
                the go.
              </p>

              {isWaitlistSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-white inline-flex flex-col items-center md:items-start shadow-xl"
                >
                  <span className="text-4xl mb-4 block">🎉</span>
                  <h3 className="text-2xl font-black mb-2">You're on the list!</h3>
                  <p className="text-neutral-300 font-medium">
                    We'll let you know when the app drops.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-5 rounded-2xl outline-none text-white placeholder:text-neutral-400 focus:bg-white/20 focus:border-primary-500/50 transition-all text-lg font-medium shadow-inner"
                  />
                  <button
                    type="submit"
                    className="bg-white text-neutral-900 px-8 py-5 rounded-2xl font-black hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-lg shadow-xl hover:shadow-white/20 transform hover:-translate-y-1"
                  >
                    Get Early Access
                  </button>
                </form>
              )}
            </div>

            {/* Minimal Device Mockup Illustration */}
            <div className="hidden md:flex relative flex-shrink-0">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="w-[320px] h-[640px] bg-neutral-950 rounded-[3.5rem] border-[12px] border-neutral-800 shadow-2xl shadow-black/50 overflow-hidden relative"
              >
                <div className="absolute top-0 inset-x-0 h-7 bg-neutral-800 rounded-b-3xl mx-24 z-20" />
                {/* Mockup Screen Content */}
                <div className="absolute inset-0 bg-neutral-900 p-6 pt-16 flex flex-col gap-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-32 h-6 bg-neutral-800 rounded-full animate-pulse" />
                    <div className="w-10 h-10 bg-neutral-800 rounded-full animate-pulse" />
                  </div>
                  <div className="w-full h-48 bg-gradient-to-br from-primary-900/50 to-neutral-800 rounded-3xl animate-pulse border border-neutral-800" />
                  <div className="space-y-3 mt-4">
                    <div className="w-full h-20 bg-neutral-800 rounded-2xl animate-pulse" />
                    <div className="w-full h-20 bg-neutral-800 rounded-2xl animate-pulse" />
                    <div className="w-full h-20 bg-neutral-800 rounded-2xl animate-pulse" />
                  </div>
                </div>
                {/* Floating Elements over mockup */}
                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [-5, -5, -5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
                  className="absolute top-1/3 -left-12 bg-white/10 backdrop-blur-xl border border-white/20 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
                >
                  <HeartIcon className="w-6 h-6 text-red-400 fill-current" />
                  <span className="font-bold">Loved it!</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [5, 5, 5] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 2 }}
                  className="absolute bottom-1/4 -right-12 bg-primary-500/90 backdrop-blur-xl border border-primary-400/30 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
                >
                  <TruckIcon className="w-6 h-6" />
                  <span className="font-bold">On the way</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeAppPromo;
