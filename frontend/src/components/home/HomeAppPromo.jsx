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
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF7A18]/20 to-transparent" />

      {/* Background ambient */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF7A18]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#FF7A18]/10 border border-[#FF7A18]/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#FF7A18] animate-pulse" />
              <span className="text-[#FF7A18] text-xs font-bold tracking-wide">COMING SOON</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Tiffo in your <span className="text-[#FF7A18]">pocket.</span>
            </h2>

            <p className="text-[#B5B8C5]/70 text-base leading-relaxed mb-8 max-w-md">
              Track orders in real-time, manage subscriptions instantly, and discover new meals on
              the go.
            </p>

            {/* App store badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-3 bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 opacity-60 cursor-not-allowed">
                <DevicePhoneMobileIcon className="w-6 h-6 text-[#FF7A18]" />
                <div>
                  <p className="text-[10px] text-[#B5B8C5]/50 font-medium">GET IT ON</p>
                  <p className="text-white font-bold text-sm">Google Play</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 opacity-60 cursor-not-allowed">
                <DevicePhoneMobileIcon className="w-6 h-6 text-[#FF7A18]" />
                <div>
                  <p className="text-[10px] text-[#B5B8C5]/50 font-medium">DOWNLOAD ON THE</p>
                  <p className="text-white font-bold text-sm">App Store</p>
                </div>
              </div>
            </div>

            {/* Waitlist form */}
            {isWaitlistSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#FF7A18]/10 border border-[#FF7A18]/30 p-6 rounded-2xl flex items-center gap-4"
              >
                <div>
                  <h3 className="text-white font-black text-lg">You're on the list!</h3>
                  <p className="text-[#B5B8C5]/60 text-sm">
                    We'll notify you when the app launches.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div>
                <p className="text-[#B5B8C5]/40 text-xs font-medium mb-3 uppercase tracking-wider">
                  Get early access
                </p>
                <form onSubmit={handleWaitlistSubmit} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="flex-1 bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] focus:border-[#FF7A18]/50 px-4 py-3 rounded-xl outline-none text-white placeholder:text-[#B5B8C5]/30 text-sm font-medium transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-[#FF7A18] hover:bg-[#FF9F43] text-white font-bold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-[#FF7A18]/25 shrink-0 text-sm"
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
                className="relative w-[240px] h-[500px] bg-[#0F1016] rounded-[3rem] border-[8px] border-[#1B1E27] shadow-2xl shadow-[#FF7A18]/10 overflow-hidden"
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
                    <div className="w-8 h-8 rounded-full bg-[#FF7A18]/20 flex items-center justify-center text-xs font-bold text-[#FF7A18]">
                      T
                    </div>
                  </div>

                  {/* Hero image */}
                  <div className="w-full h-32 rounded-2xl overflow-hidden relative">
                    <img
                      src="/tiffin.jpeg"
                      alt="App preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-3">
                      <p className="text-white text-[10px] font-bold">Today's Special</p>
                      <p className="text-[#FF7A18] text-[10px] font-bold">₹99/day</p>
                    </div>
                  </div>

                  {/* Cards */}
                  {['/north.jpeg', '/south.jpeg'].map((img, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] rounded-xl p-2.5"
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="w-20 h-2 bg-[#181A22] rounded-full" />
                        <div className="w-14 h-2 bg-[#1B1E27] rounded-full mt-1.5" />
                      </div>
                      <div className="w-12 h-5 bg-[#FF7A18]/20 rounded-lg" />
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
                className="absolute bottom-24 -right-14 bg-[#FF7A18] text-white p-3 rounded-2xl shadow-xl flex items-center gap-2.5"
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
