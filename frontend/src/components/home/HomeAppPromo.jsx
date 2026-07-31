import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { HeartIcon, TruckIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
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
    <section className="py-24 bg-[#0F1016] relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

      {/* Background ambient */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-primary-500 text-xs font-bold tracking-wide">COMING SOON</span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Tiffo in your <span className="text-primary-500">pocket.</span>
            </h2>

            <p className="text-[#B5B8C5]/70 text-base leading-relaxed mb-8 max-w-md">
              Track orders in real-time, manage subscriptions instantly, and discover new meals on
              the go.
            </p>

            {/* App store badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-3 bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 opacity-60 cursor-not-allowed">
                <DevicePhoneMobileIcon className="w-6 h-6 text-primary-500" />
                <div>
                  <p className="text-xs text-[#B5B8C5]/70 font-medium">GET IT ON</p>
                  <p className="text-white font-bold text-sm">Google Play</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 opacity-60 cursor-not-allowed">
                <DevicePhoneMobileIcon className="w-6 h-6 text-primary-500" />
                <div>
                  <p className="text-xs text-[#B5B8C5]/70 font-medium">DOWNLOAD ON THE</p>
                  <p className="text-white font-bold text-sm">App Store</p>
                </div>
              </div>
            </div>

            {/* Waitlist form */}
            {isWaitlistSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary-500/10 border border-primary-500/30 p-6 rounded-2xl flex items-center gap-4"
              >
                <div>
                  <h3 className="text-white font-black text-lg">You're on the list!</h3>
                  <p className="text-[#B5B8C5]/70 text-sm">
                    We'll notify you when the app launches.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div>
                <label
                  htmlFor="app-waitlist-email"
                  className="block text-[#B5B8C5]/70 text-xs font-medium mb-3 uppercase tracking-wider"
                >
                  Get early access
                </label>
                <form onSubmit={handleWaitlistSubmit} className="flex gap-2 max-w-md">
                  <input
                    id="app-waitlist-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email address"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="flex-1 min-w-0 bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] focus:border-primary-500/50 px-4 min-h-[44px] rounded-xl outline-none text-white placeholder:text-[#B5B8C5]/70 text-sm font-medium transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-primary-500 hover:bg-[#FF9F43] text-[#0F1016] font-bold px-5 min-h-[44px] rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25 shrink-0 text-sm"
                  >
                    Notify Me
                  </button>
                </form>
              </div>
            )}
          </motion.div>

          {/* Right: Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Phone frame */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="relative w-[240px] h-[500px] bg-[#0F1016] rounded-[3rem] border-[8px] border-[#1B1E27] shadow-2xl shadow-primary-500/10 overflow-hidden"
              >
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-[#181A22] rounded-b-2xl mx-16 z-20" />

                {/* Screen content */}
                <div className="absolute inset-0 bg-[#0F1016] p-4 pt-12 flex flex-col gap-3">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="w-16 h-2 bg-[#1B1E27] rounded-full" />
                      <div className="w-24 h-3 bg-[#181A22] rounded-full mt-1.5" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-500">
                      T
                    </div>
                  </div>

                  {/* Hero image */}
                  <div className="w-full h-32 rounded-2xl overflow-hidden relative">
                    <img
                      src="/tiffin.jpeg"
                      alt=""
                      width={320}
                      height={128}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-3">
                      <p className="text-white text-xs font-bold">Today's Special</p>
                      <p className="text-primary-500 text-xs font-bold">₹99/day</p>
                    </div>
                  </div>

                  {/* Cards */}
                  {['/north.jpeg', '/south.jpeg'].map((img, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] rounded-xl p-2.5"
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={img}
                          alt=""
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="w-20 h-2 bg-[#181A22] rounded-full" />
                        <div className="w-14 h-2 bg-[#1B1E27] rounded-full mt-1.5" />
                      </div>
                      <div className="w-12 h-5 bg-primary-500/20 rounded-xl" />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, 10, 0], rotate: [-3, -3, -3] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
                className="absolute top-16 -left-14 bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-2xl shadow-xl flex items-center gap-2.5"
              >
                <HeartIcon className="w-5 h-5 text-red-400 fill-current" />
                <span className="font-bold text-sm">Loved it!</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0], rotate: [3, 3, 3] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 2 }}
                className="absolute bottom-24 -right-14 bg-primary-500 text-[#0F1016] p-3 rounded-2xl shadow-xl flex items-center gap-2.5"
              >
                <TruckIcon className="w-5 h-5" />
                <span className="font-bold text-sm">On the way</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeAppPromo;
