import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTiffins } from '../store/slices/tiffinSlice';
import TiffinCard from '../components/TiffinCard';
import AnimatedBackground from '../components/AnimatedBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import foodDeliveryAnimation from '../assets/lottie/food-delivery.json';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  DevicePhoneMobileIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import AdRecommenderBubble from '../components/AdRecommenderBubble';
import { toast } from 'react-hot-toast';

const Home = () => {
  const dispatch = useDispatch();
  const { tiffins, isLoading } = useSelector((state) => state.tiffins);
  const { user } = useSelector((state) => state.auth);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isWaitlistSubmitted, setIsWaitlistSubmitted] = useState(false);

  useEffect(() => {
    dispatch(getTiffins({ limit: 6 }));
    
    // SEO Meta Updates
    document.title = 'Tiffo - Authentic Homemade Tiffin Delivery Service';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover and subscribe to authentic homemade tiffin services near you. Fresh, healthy, and hygienic meals delivered daily.');
    }
  }, [dispatch]);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (waitlistEmail) {
      setIsWaitlistSubmitted(true);
      toast.success('Thanks for joining the waitlist!');
      setWaitlistEmail('');
    }
  };

  // Content configuration for easy future updates
  const heroItems = [
    {
      id: 1,
      title: 'North Indian Thali',
      price: 'Starting ₹99/day',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
      alt: 'Delicious North Indian Tiffin',
      offset: false
    },
    {
      id: 2,
      title: 'South Indian Special',
      price: 'Starting ₹89/day',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
      alt: 'Healthy South Indian Meal',
      offset: true
    },
    {
      id: 3,
      title: 'Gujarati Cuisine',
      price: 'Starting ₹79/day',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
      alt: 'Traditional Gujarati Tiffin',
      offset: false
    }
  ];

  const features = [
    {
      icon: MagnifyingGlassIcon,
      title: 'Find Local Tiffins',
      description: 'Discover homemade tiffin services in your area',
      emoji: '🔍'
    },
    {
      icon: ClockIcon,
      title: 'Flexible Plans',
      description: 'Daily, weekly, or monthly subscription options',
      emoji: '⏰'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Partners',
      description: 'All tiffin providers are verified for quality and hygiene',
      emoji: '✅'
    },
    {
      icon: TruckIcon,
      title: 'Timely Delivery',
      description: 'Fresh meals delivered right to your doorstep',
      emoji: '🚚'
    }
  ];

  return (
    <div className="min-h-screen relative bg-neutral-50 dark:bg-neutral-950">
      {/* Animated Background */}
      <AnimatedBackground density="low" />

      {/* Hero Section - Premium Design */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950" />
        
        {/* Dark Mode Dotted Pattern */}
        <div className="absolute inset-0 opacity-0 dark:opacity-10 transition-opacity duration-300" style={{ backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-primary-200/30 to-secondary-200/30 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-secondary-200/40 to-primary-200/40 dark:from-secondary-900/30 dark:to-primary-900/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Floating Food Emojis */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <motion.div
            className="absolute top-24 left-[10%] text-5xl"
            animate={{ y: [0, -20, 0], rotate: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >🍛</motion.div>
          <motion.div
            className="absolute top-40 right-[15%] text-4xl"
            animate={{ y: [0, -15, 0], rotate: [10, -10, 10] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >🥗</motion.div>
          <motion.div
            className="absolute bottom-32 left-[8%] text-4xl"
            animate={{ y: [0, -18, 0], rotate: [5, -15, 5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >🍱</motion.div>
          <motion.div
            className="absolute bottom-40 right-[10%] text-5xl"
            animate={{ y: [0, -22, 0], rotate: [-5, 15, -5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          >🥘</motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-primary-100 px-5 py-2 rounded-full shadow-md mb-8"
            >
              <span className="text-lg mr-2">✨</span>
              <span className="text-sm font-semibold text-primary-600">Trusted by 10,000+ Happy Customers</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-black text-neutral-900 mb-8 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Homemade Tiffins
              <span className="block mt-2">
                <span className="gradient-text">Delivered Fresh</span>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Discover authentic homemade meals from local tiffin providers.
              <span className="text-primary-500 font-medium"> Fresh, healthy, and delivered to your door.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/tiffins" className="btn-primary text-lg px-10 py-4 shadow-xl flex items-center space-x-2">
                  <span>🍱</span>
                  <span>Browse Tiffins</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                {/* Auth-aware CTA: logged-in non-partners go to upgrade page */}
                {user && user.role !== 'partner' ? (
                  <Link to="/support?subject=partner" className="btn-secondary text-lg px-10 py-4 flex items-center space-x-2">
                    <span>👨‍🍳</span>
                    <span>Become a Partner</span>
                  </Link>
                ) : !user ? (
                  <Link to="/register?role=partner" className="btn-secondary text-lg px-10 py-4 flex items-center space-x-2">
                    <span>👨‍🍳</span>
                    <span>Become a Partner</span>
                  </Link>
                ) : (
                  <Link to="/partner/dashboard" className="btn-secondary text-lg px-10 py-4 flex items-center space-x-2">
                    <span>👨‍🍳</span>
                    <span>Partner Dashboard</span>
                  </Link>
                )}
              </motion.div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              className="flex flex-wrap justify-center items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="flex items-center text-neutral-500 text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Verified Providers
              </div>
              <div className="w-px h-4 bg-neutral-300 hidden sm:block" />
              <div className="flex items-center text-neutral-500 text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Hygienic Kitchens
              </div>
              <div className="w-px h-4 bg-neutral-300 hidden sm:block" />
              <div className="flex items-center text-neutral-500 text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Free Cancellation
              </div>
            </motion.div>

            {/* Lottie Food Delivery Animation */}
            <motion.div
              className="mt-8 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <div className="w-80 h-32 opacity-80">
                <Lottie
                  animationData={foodDeliveryAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 hidden lg:block"
          >
            <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
              {heroItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className={`relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group ${item.offset ? '-mt-6' : ''}`}
                >
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-white/80">{item.price}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Premium Design */}
      <section className="py-24 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary-50/50 dark:from-primary-900/20 to-transparent rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block bg-primary-100 text-primary-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Why Choose Us
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6">
              Why Choose <span className="gradient-text">Tiffo</span>?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We connect you with verified local tiffin providers for fresh,
              authentic homemade meals delivered right to your doorstep
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 group border border-neutral-100 dark:border-neutral-700 relative overflow-hidden"
              >
                {/* Gradient accent on top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  <span className="text-3xl">{feature.emoji}</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tiffins */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-950 relative">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <motion.span
                className="inline-block bg-secondary-100 text-secondary-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Popular Choices
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
                Featured <span className="gradient-text">Tiffins</span>
              </h2>
              <p className="text-lg text-neutral-600 max-w-xl">
                Discover top-rated tiffin services loved by our customers
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 md:mt-0"
            >
              <Link to="/tiffins" className="btn-ghost hidden md:inline-flex items-center">
                View All Tiffins
                <span className="ml-2">→</span>
              </Link>
            </motion.div>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <LoadingSpinner size="large" message="Loading delicious tiffins..." />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiffins.map((tiffin, index) => (
                  <motion.div
                    key={tiffin._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <TiffinCard tiffin={tiffin} />
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="text-center mt-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/tiffins" className="btn-primary inline-block">
                    View All Tiffins →
                  </Link>
                </motion.div>
              </motion.div>
            </>
          )}
        </div>
      </section >

      {/* Mobile App Section */}
      <section className="py-16 bg-white dark:bg-neutral-900" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center lg:justify-start"
            >
              <img src="/tiffo-logo.png" alt="Tiffo Logo" className="h-64 w-auto" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get the <span className="tiffo-brand">Tiffo</span> App
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Download our mobile app for the best tiffin ordering experience.
                Available on Android and coming soon to iOS.
              </p>
              <div className="mb-8">
                {isWaitlistSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center"
                  >
                    <span className="text-4xl mb-4 block">🎉</span>
                    <h3 className="text-xl font-bold text-green-800 mb-2">You're on the list!</h3>
                    <p className="text-green-700 font-medium">We'll notify you as soon as the Tiffo app is ready for download.</p>
                  </motion.div>
                ) : (
                  <div className="bg-neutral-50 dark:bg-neutral-800 p-1 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 max-w-md">
                    <form onSubmit={handleWaitlistSubmit} className="flex">
                      <input
                        type="email"
                        required
                        placeholder="Enter your email for early access"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="flex-1 bg-transparent px-6 py-4 outline-none text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400"
                      />
                      <button
                        type="submit"
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                      >
                        Join Waitlist
                        <PaperAirplaneIcon className="h-5 w-5 -rotate-45" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="inline-flex items-center bg-black/5 text-white/50 px-6 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 grayscale">
                  <svg className="w-6 h-6 mr-2 opacity-30" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4482-.9993-.9993s.4482-.9993.9993-.9993.9993.4482.9993.9993-.4482.9993-.9993.9993zm-11.046 0c-.5511 0-.9993-.4482-.9993-.9993s.4482-.9993.9993-.9993.9993.4482.9993.9993-.4482.9993-.9993.9993z" />
                    <path d="M18.6 2.4H5.4C3.52 2.4 2 3.92 2 5.8v12.4c0 1.88 1.52 3.4 3.4 3.4h13.2c1.88 0 3.4-1.52 3.4-3.4V5.8c0-1.88-1.52-3.4-3.4-3.4zM12 19.6c-4.18 0-7.6-3.42-7.6-7.6S7.82 4.4 12 4.4s7.6 3.42 7.6 7.6-3.42 7.6-7.6 7.6z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Launching Soon</div>
                    <div className="text-sm font-semibold text-neutral-400">Google Play</div>
                  </div>
                </div>
                <div className="inline-flex items-center bg-black/5 text-white/50 px-6 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 grayscale">
                  <svg className="w-6 h-6 mr-2 opacity-30" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Launching Soon</div>
                    <div className="text-sm font-semibold text-neutral-400">App Store</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-maroon-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-3xl p-8 text-center">
                <DevicePhoneMobileIcon className="h-24 w-24 text-maroon-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Order on the Go
                </h3>
                <p className="text-gray-600">
                  Easy ordering, real-time tracking, and secure payments
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section >

      {/* Footer Section */}
      < footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 relative overflow-hidden" >
        {/* Subtle pattern overlay */}
        < div className="absolute inset-0 opacity-5" >
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Help & Support</Link></li>
                <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/register?role=partner" className="text-gray-400 hover:text-white transition-colors">Partner Program</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
                <li><Link to="/support?subject=refund" className="text-gray-400 hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Safety</h3>
              <ul className="space-y-2">
                <li><Link to="/report-fraud" className="text-gray-400 hover:text-white transition-colors">Report Fraud</Link></li>
                <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Emergency Support</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Social Links</h3>
              <div className="flex space-x-3">
                <a href="https://twitter.com/tiffo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Follow us on Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://instagram.com/tiffo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Follow us on Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>


          <div className="border-t border-gray-700 mt-12 pt-10 text-center">
            <p className="text-gray-400 text-base font-medium">
              © {new Date().getFullYear()} <span className="tiffo-brand text-maroon-400">Tiffo</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer >
      <AdRecommenderBubble />
    </div >
  );
};

export default Home;