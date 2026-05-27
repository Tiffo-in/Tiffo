import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTiffins } from '../store/slices/tiffinSlice';
import TiffinCard from '../components/TiffinCard';
import AnimatedBackground from '../components/AnimatedBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import AdRecommenderBubble from '../components/AdRecommenderBubble';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const Home = () => {
  const dispatch = useDispatch();
  const { tiffins, isLoading } = useSelector((state) => state.tiffins);
  const { user } = useSelector((state) => state.auth);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isWaitlistSubmitted, setIsWaitlistSubmitted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => {
    dispatch(getTiffins({ limit: 6 }));
  }, [dispatch]);

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

  const heroItems = [
    {
      id: 1,
      title: 'North Indian Thali',
      price: 'Starting ₹99/day',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
      alt: 'Delicious North Indian Tiffin',
      offset: false,
    },
    {
      id: 2,
      title: 'South Indian Special',
      price: 'Starting ₹89/day',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
      alt: 'Healthy South Indian Meal',
      offset: true,
    },
    {
      id: 3,
      title: 'Gujarati Cuisine',
      price: 'Starting ₹79/day',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
      alt: 'Traditional Gujarati Tiffin',
      offset: false,
    },
  ];

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

  return (
    <div className="min-h-screen relative bg-neutral-50 dark:bg-neutral-950 font-sans selection:bg-primary-200 selection:text-primary-900 overflow-hidden">
      <Helmet>
        <title>Tiffo - Authentic Homemade Tiffin Delivery Service</title>
        <meta
          name="description"
          content="Discover and subscribe to authentic homemade tiffin services near you. Fresh, healthy, and hygienic meals delivered daily."
        />
      </Helmet>
      <AnimatedBackground density="low" />

      {/* Hero Section - Centered Layout */}
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
          {/* Top Content */}
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
                {user && user.role !== 'partner' ? (
                  <Link
                    to="/support?subject=partner"
                    className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md text-neutral-900 dark:text-white border-2 border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl font-bold transition-all duration-300 text-lg"
                  >
                    <span>👨‍🍳</span>
                    <span>Become a Partner</span>
                  </Link>
                ) : !user ? (
                  <Link
                    to="/register?role=partner"
                    className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md text-neutral-900 dark:text-white border-2 border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl font-bold transition-all duration-300 text-lg"
                  >
                    <span>👨‍🍳</span>
                    <span>Become a Partner</span>
                  </Link>
                ) : (
                  <Link
                    to="/partner/dashboard"
                    className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md text-neutral-900 dark:text-white border-2 border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl font-bold transition-all duration-300 text-lg"
                  >
                    <span>👨‍🍳</span>
                    <span>Partner Dashboard</span>
                  </Link>
                )}
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

                  {/* Premium floating badge */}
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

      {/* Features Section - Premium 2x2 Grid */}
      <section className="py-32 relative overflow-hidden bg-white dark:bg-neutral-950">
        {/* Decorative background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-50/40 via-transparent to-transparent dark:from-primary-900/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white mb-6 tracking-tight"
            >
              Why Choose{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
                Tiffo
              </span>
              ?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-neutral-50 dark:bg-neutral-900/50 backdrop-blur-xl p-10 lg:p-12 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 group border-2 border-neutral-200/50 dark:border-neutral-800/50 relative overflow-hidden"
              >
                {/* Ambient glow on hover */}
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

      {/* Featured Tiffins - Enhanced Display */}
      <section className="py-32 bg-neutral-100/50 dark:bg-neutral-900/30 border-y border-neutral-200/50 dark:border-neutral-800/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-4 tracking-tight">
                Featured <span className="text-primary-600">Tiffins</span>
              </h2>
              <p className="text-xl text-neutral-500 dark:text-neutral-400 font-medium">
                Discover top-rated tiffin services loved by our customers
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link
                to="/tiffins"
                className="group inline-flex items-center gap-2 text-lg font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors bg-primary-50 dark:bg-primary-900/20 px-6 py-3 rounded-xl"
              >
                View All Catalog
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </motion.div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tiffins.map((tiffin, index) => (
                  <motion.div
                    key={tiffin._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="h-full"
                  >
                    <div className="h-full bg-white dark:bg-neutral-900 rounded-[2rem] p-3 shadow-xl hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 border border-neutral-100 dark:border-neutral-800 group">
                      <TiffinCard tiffin={tiffin} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Modern App Download Section */}
      <section className="py-32 relative overflow-hidden bg-white dark:bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
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
                  Track orders in real-time, manage subscriptions instantly, and discover new meals
                  on the go.
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
                  <div className="absolute top-0 inset-x-0 h-7 bg-neutral-800 rounded-b-3xl mx-24 z-20" />{' '}
                  {/* Notch */}
                  {/* Mockup Screen Content */}
                  <div className="absolute inset-0 bg-neutral-900 p-6 pt-16 flex flex-col gap-4">
                    {/* Header bar */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-32 h-6 bg-neutral-800 rounded-full animate-pulse" />
                      <div className="w-10 h-10 bg-neutral-800 rounded-full animate-pulse" />
                    </div>
                    {/* Featured card */}
                    <div className="w-full h-48 bg-gradient-to-br from-primary-900/50 to-neutral-800 rounded-3xl animate-pulse border border-neutral-800" />
                    {/* List items */}
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

      {/* Footer Section - Premium Minimal */}
      <footer className="bg-neutral-50 dark:bg-neutral-950 pt-24 pb-12 relative overflow-hidden border-t border-neutral-200 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <Link
                to="/"
                className="inline-flex items-center text-4xl font-black tracking-tight text-neutral-900 dark:text-white mb-6"
              >
                <img src="/logo.png" alt="Tiffo Logo" className="h-12 w-auto mr-2" />
                Tiffo<span className="text-primary-500">.</span>
              </Link>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-8 leading-relaxed font-medium">
                Reimagining daily dining by connecting you with passionate home chefs. Authentic,
                hygienic, and delivered with care.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-12 h-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-white hover:bg-neutral-900 dark:hover:bg-primary-600 hover:border-transparent transition-all shadow-sm"
                >
                  𝕏
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-white hover:bg-pink-600 hover:border-transparent transition-all shadow-sm"
                >
                  IG
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-neutral-900 dark:text-white font-black text-lg mb-6 tracking-wide">
                Company
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/about"
                    className="text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-neutral-900 dark:text-white font-black text-lg mb-6 tracking-wide">
                Support
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/support"
                    className="text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-neutral-900 dark:text-white font-black text-lg mb-6 tracking-wide">
                Partner
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/register?role=partner"
                    className="text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  >
                    Become a Chef
                  </Link>
                </li>
                <li>
                  <Link
                    to="/partner-guidelines"
                    className="text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  >
                    Guidelines
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 dark:text-neutral-500 text-sm font-medium">
              © {new Date().getFullYear()} Tiffo Technologies. All rights reserved.
            </p>
            <p className="text-neutral-500 dark:text-neutral-500 text-sm font-medium flex items-center gap-1.5">
              Made with <HeartIcon className="w-4 h-4 text-red-500 fill-current" /> in India
            </p>
          </div>
        </div>
      </footer>
      <AdRecommenderBubble />
    </div>
  );
};

export default Home;
