import React from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: MagnifyingGlassIcon,
    title: 'Find Local Tiffins',
    description:
      'Discover homemade tiffin services in your area effortlessly. Explore menus and read reviews.',
    emoji: '🔍',
  },
  {
    icon: ClockIcon,
    title: 'Flexible Plans',
    description:
      'Choose from daily, weekly, or monthly subscription options that fit your lifestyle.',
    emoji: '⏰',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Verified Partners',
    description:
      'All tiffin providers are strictly verified for food quality, taste, and kitchen hygiene.',
    emoji: '✅',
  },
  {
    icon: TruckIcon,
    title: 'Timely Delivery',
    description:
      'Enjoy hot, fresh meals delivered right to your doorstep exactly when you need them.',
    emoji: '🚚',
  },
];

// Scroll-reveal animates TRANSFORM ONLY — content must never be gated behind
// opacity: an IntersectionObserver that fails to fire (prerenderers, slow
// devices) would otherwise leave the section permanently invisible.
const reveal = {
  initial: { y: 24 },
  whileInView: { y: 0 },
  viewport: { once: true },
};

const HomeFeatures = () => (
  <section className="py-32 relative overflow-hidden bg-neutral-50 dark:bg-neutral-950">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-50/40 via-transparent to-transparent dark:from-primary-900/10 pointer-events-none" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-20">
        <motion.h2
          {...reveal}
          className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white mb-6 tracking-tight"
        >
          Why Choose{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
            Tiffo
          </span>
          ?
        </motion.h2>
        <motion.p
          {...reveal}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 max-w-3xl mx-auto font-medium"
        >
          Experience the best of authentic homemade food with our carefully crafted delivery
          ecosystem.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ y: 40 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className="bg-white dark:bg-neutral-900/50 backdrop-blur-xl p-10 lg:p-12 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 group border-2 border-neutral-200/50 dark:border-neutral-800/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-3xl flex items-center justify-center shrink-0 shadow-lg border border-neutral-100 dark:border-neutral-700 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <span className="text-4xl">{feature.emoji}</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HomeFeatures;
