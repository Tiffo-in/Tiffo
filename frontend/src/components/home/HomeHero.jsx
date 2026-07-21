import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/solid';

const heroItems = [
  {
    id: 1,
    title: 'North Indian Thali',
    price: 'Starting ₹99/day',
    image: '/north.jpeg',
    alt: 'Delicious North Indian Tiffin',
    offset: false,
  },
  {
    id: 2,
    title: 'Daily Tiffin Service',
    price: 'Starting ₹79/day',
    image: '/tiffin.jpeg',
    alt: 'Fresh Homemade Tiffins',
    offset: true,
  },
  {
    id: 3,
    title: 'South Indian Special',
    price: 'Starting ₹89/day',
    image: '/south.jpeg',
    alt: 'Healthy South Indian Meal',
    offset: false,
  },
];

const partnerCtaClasses =
  'flex items-center justify-center gap-3 w-full px-8 py-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md text-neutral-900 dark:text-white border-2 border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl font-bold transition-all duration-300 text-lg';

const HomeHero = ({ user }) => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const partnerCta = !user
    ? { to: '/register?role=partner', label: 'Become a Partner' }
    : user.role !== 'partner'
      ? { to: '/support?subject=partner', label: 'Become a Partner' }
      : { to: '/partner/dashboard', label: 'Partner Dashboard' };

  return (
    <section className="relative min-h-[95vh] flex flex-col justify-center pt-32 pb-20 overflow-hidden">
      {/* Abstract Background Elements - Premium Soft Blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-neutral-50/80 to-secondary-50/80 dark:from-neutral-950 dark:via-neutral-900/90 dark:to-neutral-950 -z-20 backdrop-blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none -z-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        style={{ y: yHero }}
        className="absolute right-10 top-20 w-[500px] h-[500px] opacity-30 dark:opacity-20 blur-[120px] pointer-events-none -z-10"
      >
        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full" />
      </motion.div>

      <motion.div
        style={{ y: yHero, scale: -1 }}
        className="absolute left-10 bottom-20 w-[400px] h-[400px] opacity-20 dark:opacity-10 blur-[100px] pointer-events-none -z-10"
      >
        <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-primary-300 rounded-full" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 flex flex-col items-center">
        {/* Top Content — mount animation (not scroll-gated) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl text-center flex flex-col items-center relative z-20"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-neutral-900 dark:text-white leading-[1.05] tracking-tight mb-8">
            Homemade Tiffins <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              Delivered Fresh.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-12 leading-relaxed max-w-2xl font-medium">
            Discover authentic homemade meals from local tiffin providers. Fresh, healthy, and
            delivered to your door.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full max-w-lg">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/tiffins"
                className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-2xl font-black shadow-2xl shadow-neutral-900/20 dark:shadow-white/10 transition-all duration-300 text-lg"
              >
                <span>🍱</span>
                <span>Browse Tiffins</span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link to={partnerCta.to} className={partnerCtaClasses}>
                <span>👨‍🍳</span>
                <span>{partnerCta.label}</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Content - Centered Structured Image Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-24 hidden lg:block w-full max-w-5xl relative z-10"
        >
          <div className="grid grid-cols-3 gap-8 mx-auto">
            {heroItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                whileHover={shouldReduceMotion ? {} : { y: -16, scale: 1.03 }}
                className={`relative rounded-[2rem] overflow-hidden shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 group border-4 border-white dark:border-neutral-800 ${item.offset ? '-mt-12 mb-12' : 'mt-0'}`}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  aria-hidden="true"
                />

                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-white text-xs font-bold flex items-center gap-1 shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <SparklesIcon className="w-3 h-3 text-primary-400" /> Premium
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="font-black text-2xl leading-tight mb-1">{item.title}</p>
                  <p className="text-md text-primary-300 font-bold tracking-wide">{item.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeHero;
