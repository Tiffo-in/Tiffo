import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import MySubscriptions from '../components/MySubscriptions';
import OrderHistory from '../components/OrderHistory';
import PaymentHistory from '../components/PaymentHistory';
import toast from 'react-hot-toast';
import {
  Squares2X2Icon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  GiftIcon,
  MapPinIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckCircleIcon,
  StarIcon,
  BoltIcon,
  ClockIcon,
  ChevronRightIcon,
  PhoneIcon,
  ShareIcon,
  CalendarDaysIcon,
  TruckIcon,
  ShieldCheckIcon,
  TagIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    activeSubscriptions: 2,
    mealsThisMonth: 18,
    totalSpent: 980,
    loyaltyPoints: 1250,
  });

  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [recommendedTiffins, setRecommendedTiffins] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);

  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const displayUser = user || { name: 'Rishi Pandey' };
  const firstName = displayUser.name ? displayUser.name.split(' ')[0] : 'User';

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);
        setLoadingContent(true);

        const [statsRes, todayRes, subsRes, tiffinsRes] = await Promise.allSettled([
          api.get('/subscriptions/stats'),
          api.get('/subscriptions/deliveries/today'),
          api.get('/subscriptions'),
          api.get('/tiffins?limit=6'),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
          setStatsData((prev) => ({
            ...prev,
            ...statsRes.value.data.data,
          }));
        }

        if (todayRes.status === 'fulfilled' && todayRes.value.data?.success) {
          setTodayDeliveries(todayRes.value.data.data || []);
        }

        if (subsRes.status === 'fulfilled' && subsRes.value.data?.success) {
          setUserSubscriptions(subsRes.value.data.data || []);
        }

        if (tiffinsRes.status === 'fulfilled' && tiffinsRes.value.data?.success) {
          const tiffinsList =
            tiffinsRes.value.data.data?.tiffins || tiffinsRes.value.data.data || [];
          setRecommendedTiffins(tiffinsList);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setStatsLoading(false);
        setLoadingContent(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('TIFFO-REF-300');
    toast.success('Referral code copied to clipboard! Share & earn ₹300 credits.');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon },
    { id: 'subscriptions', label: 'My Subscriptions', icon: ArchiveBoxIcon },
    { id: 'orders', label: 'Order History', icon: ClipboardDocumentListIcon },
    { id: 'payments', label: 'Payments', icon: CreditCardIcon },
    { id: 'rewards', label: 'Rewards', icon: GiftIcon, badge: 'NEW' },
    { id: 'addresses', label: 'Addresses', icon: MapPinIcon },
    { id: 'profile', label: 'Profile Settings', icon: UserCircleIcon },
    { id: 'support', label: 'Support', icon: QuestionMarkCircleIcon },
  ];

  // Default recommendations if API fails or yields empty
  const defaultRecommendations = [
    {
      _id: 'rec1',
      title: 'Protein Breakfast Box',
      price: 95,
      rating: 4.7,
      image: '/north.jpeg',
    },
    {
      _id: 'rec2',
      title: 'Oats & Fruits Bowl',
      price: 80,
      rating: 4.6,
      image: '/tiffin.jpeg',
    },
    {
      _id: 'rec3',
      title: 'High Protein Thali',
      price: 110,
      rating: 4.8,
      image: '/south.jpeg',
    },
    {
      _id: 'rec4',
      title: 'Gujarati Thali',
      price: 100,
      rating: 4.7,
      image: '/north.jpeg',
    },
  ];

  const displayRecommendations =
    recommendedTiffins.length > 0 ? recommendedTiffins : defaultRecommendations;

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header / Sub-Navbar */}
      <header className="border-b border-zinc-800/80 bg-[#111218]/90 backdrop-blur-md sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-lg">T</span>
              </span>
              <span className="text-xl font-bold text-white tracking-tight">
                Tiffo<span className="text-orange-500">.</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-zinc-400">
              <Link to="/tiffins" className="hover:text-white transition-colors">
                Browse Meals
              </Link>
              <Link to="/partner/register" className="hover:text-white transition-colors">
                Become a Partner
              </Link>
              <Link to="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button
              onClick={() => toast('No new unread notifications', { icon: '🔔' })}
              className="relative p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              aria-label="Notifications"
            >
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            {/* User Profile Quick Badge */}
            <Link
              to="/profile"
              className="flex items-center space-x-3 bg-zinc-900 border border-zinc-800/80 rounded-full px-3 py-1.5 hover:border-zinc-700 transition-all group"
            >
              <img
                src={
                  displayUser.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={displayUser.name}
                className="w-8 h-8 rounded-full object-cover border border-orange-500/40"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white group-hover:text-orange-400 transition-colors">
                  {displayUser.name || 'Rishi Pandey'}
                </p>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-semibold text-amber-400">Gold Member</span>
                  <span className="text-[10px]">👑</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── LEFT SIDEBAR NAVIGATION ────────────────────────────────────────────── */}
          <aside className="lg:col-span-3 flex flex-col space-y-6">
            <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-3 shadow-xl space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'profile') navigate('/profile');
                      else if (tab.id === 'support') navigate('/support');
                      else setActiveTab(tab.id);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? 'text-white' : 'text-zinc-400 group-hover:text-orange-400'
                        } transition-colors`}
                      />
                      <span>{tab.label}</span>
                    </div>

                    {tab.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Refer & Earn Sidebar Banner */}
            <div className="bg-gradient-to-br from-[#1b1a26] via-[#161522] to-[#12111a] border border-orange-500/20 rounded-2xl p-5 relative overflow-hidden shadow-xl">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <GiftIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Refer & Earn</h4>
                  <p className="text-[11px] text-zinc-400">Earn ₹300 credits per friend</p>
                </div>
              </div>
              <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                Invite your friends and earn up to ₹300 Tiffo credits on their first plan order!
              </p>
              <button
                onClick={handleCopyReferral}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center space-x-2"
              >
                <ShareIcon className="w-4 h-4" />
                <span>Invite Now</span>
              </button>
            </div>

            {/* Need Help Box */}
            <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <PhoneIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Need Help?</h4>
                  <p className="text-[11px] text-zinc-400">We're here for you 24/7</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/support')}
                className="w-full py-2 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>Contact Support</span>
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT AREA ────────────────────────────────────────────────── */}
          <main className="lg:col-span-9 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* 1. GREETING HERO BANNER */}
                  <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#171622] via-[#1a1928] to-[#251d20] border border-zinc-800/80 shadow-2xl p-6 sm:p-8">
                    {/* Background image & gradient overlay */}
                    <div className="absolute top-0 right-0 w-full sm:w-1/2 h-full opacity-35 sm:opacity-50 pointer-events-none mix-blend-luminosity">
                      <img
                        src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80"
                        alt="Indian Food Thali"
                        className="w-full h-full object-cover object-right"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#171622] via-[#171622]/80 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-xl space-y-5">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">👋</span>
                          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            {getGreeting()}, {firstName}! 👋
                          </h1>
                        </div>
                        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                          Your tiffin journey continues. Eat healthy, stay happy!
                        </p>
                      </div>

                      {/* Stats Inline Badges */}
                      <div className="flex flex-wrap gap-3 pt-1">
                        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-semibold text-zinc-200">
                            {statsData.activeSubscriptions} Active Plans
                          </span>
                        </div>
                        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-xs font-semibold text-zinc-200">
                            {statsData.mealsThisMonth} Meals Left
                          </span>
                        </div>
                        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-xs font-semibold text-zinc-200">
                            ₹{statsData.totalSpent} Saved This Month
                          </span>
                        </div>
                        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center space-x-2">
                          <span className="text-xs">👑</span>
                          <span className="text-xs font-semibold text-amber-300">
                            Gold Membership
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link
                          to="/tiffins"
                          className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center space-x-2 active:scale-95"
                        >
                          <span>Browse Meals</span>
                          <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => navigate('/tiffins')}
                          className="px-5 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-sm transition-all flex items-center space-x-2 active:scale-95"
                        >
                          <BoltIcon className="w-4 h-4 text-amber-400" />
                          <span>Quick Order</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. STATS METRICS CARDS (4 CARDS GRID) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Active Subscriptions */}
                    <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-5 flex items-center space-x-4 shadow-xl hover:border-zinc-700 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <ArchiveBoxIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-400">Active Subscriptions</p>
                        <h3 className="text-2xl font-black text-white mt-0.5">
                          {statsLoading ? '—' : statsData.activeSubscriptions}
                        </h3>
                        <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                          +1 this month
                        </p>
                      </div>
                    </div>

                    {/* Meals Remaining */}
                    <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-5 flex items-center space-x-4 shadow-xl hover:border-zinc-700 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                        <ClockIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-400">Meals Remaining</p>
                        <h3 className="text-2xl font-black text-white mt-0.5">
                          {statsLoading ? '—' : statsData.mealsThisMonth}
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Across all plans</p>
                      </div>
                    </div>

                    {/* Total Spent */}
                    <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-5 flex items-center space-x-4 shadow-xl hover:border-zinc-700 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                        <CreditCardIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-400">Total Spent</p>
                        <h3 className="text-2xl font-black text-white mt-0.5">
                          {statsLoading ? '—' : `₹${statsData.totalSpent.toLocaleString('en-IN')}`}
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">This month</p>
                      </div>
                    </div>

                    {/* Loyalty Points */}
                    <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-5 flex items-center space-x-4 shadow-xl hover:border-zinc-700 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                        <StarIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-400">Loyalty Points</p>
                        <h3 className="text-2xl font-black text-white mt-0.5">
                          {statsLoading ? '—' : `${statsData.loyaltyPoints} XP`}
                        </h3>
                        <p className="text-[11px] text-purple-400 font-semibold mt-0.5">
                          Gold Member
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. TODAY'S DELIVERY & UPCOMING DELIVERIES (MIDDLE ROW GRID) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* TODAY'S DELIVERY CARD */}
                    <div className="lg:col-span-7 bg-[#14151e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">📋</span>
                          <h3 className="text-base font-bold text-white">Today's Delivery</h3>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>On Track</span>
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
                        <img
                          src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80"
                          alt="Healthy Breakfast Box"
                          className="w-full sm:w-32 h-32 rounded-xl object-cover border border-zinc-700/60 flex-shrink-0"
                        />

                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <h4 className="text-base font-bold text-white">
                              Healthy Breakfast Box
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                              Veg
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start space-x-1">
                            <span>by Meena's Kitchen</span>
                            <CheckCircleIcon className="w-3.5 h-3.5 text-blue-400 inline" />
                          </p>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-zinc-400 pt-1">
                            <span className="flex items-center space-x-1">
                              <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
                              <span>12:30 PM - 1:00 PM</span>
                            </span>
                            <span className="text-zinc-500">Order #TF123456</span>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => {
                                toast.success(
                                  'Live Tracking Activated: Delivery Boy is on the way!'
                                );
                              }}
                              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all shadow-md shadow-orange-500/20 flex items-center justify-center sm:justify-start space-x-1.5 mx-auto sm:mx-0 active:scale-95"
                            >
                              <span>Track Order</span>
                              <ArrowRightIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* UPCOMING DELIVERIES CARD */}
                    <div className="lg:col-span-5 bg-[#14151e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-base font-bold text-white">Upcoming Deliveries</h3>
                          <button
                            onClick={() =>
                              toast('Calendar view synced with your subscription schedule')
                            }
                            className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                          >
                            View Calendar
                          </button>
                        </div>

                        <div className="space-y-3">
                          {/* Item 1 */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                            <div className="flex items-center space-x-3">
                              <img
                                src="/south.jpeg"
                                alt="Tomorrow Lunch"
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-white">Tomorrow</h5>
                                <p className="text-[11px] text-zinc-400">Lunch Plan</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs font-medium text-zinc-300">
                              <span>12:30 PM</span>
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                            </div>
                          </div>

                          {/* Item 2 */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                            <div className="flex items-center space-x-3">
                              <img
                                src="/north.jpeg"
                                alt="Dinner Plan"
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-white">Wed, 9 Jul</h5>
                                <p className="text-[11px] text-zinc-400">Dinner Plan</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs font-medium text-zinc-300">
                              <span>7:30 PM</span>
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                            <div className="flex items-center space-x-3">
                              <img
                                src="/tiffin.jpeg"
                                alt="Breakfast Plan"
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-white">Thu, 10 Jul</h5>
                                <p className="text-[11px] text-zinc-400">Breakfast Plan</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs font-medium text-zinc-300">
                              <span>8:00 AM</span>
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. MY SUBSCRIPTIONS & REWARDS (MIDDLE LOWER GRID) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* MY SUBSCRIPTIONS SUMMARY SECTION */}
                    <div className="lg:col-span-8 bg-[#14151e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">📋</span>
                          <h3 className="text-base font-bold text-white">My Subscriptions</h3>
                        </div>
                        <Link
                          to="/tiffins"
                          className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors flex items-center space-x-1"
                        >
                          <span>+ New Subscription</span>
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sub 1 */}
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-4 hover:border-zinc-700 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                src="/north.jpeg"
                                alt="Bhojnalaya"
                                className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-white">Bhojnalaya</h4>
                                <p className="text-[11px] text-zinc-400">
                                  North Indian • Vegetarian
                                </p>
                                <div className="flex items-center space-x-1 mt-0.5">
                                  <StarSolidIcon className="w-3 h-3 text-amber-400" />
                                  <span className="text-xs font-bold text-zinc-200">4.8</span>
                                  <span className="text-[10px] text-zinc-500">(320 reviews)</span>
                                </div>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Paused
                            </span>
                          </div>

                          {/* Stats 4-box grid */}
                          <div className="grid grid-cols-4 gap-2 bg-zinc-950/60 p-2.5 rounded-xl text-center border border-zinc-800/60">
                            <div>
                              <p className="text-xs font-bold text-white">18</p>
                              <p className="text-[9px] text-zinc-500 uppercase">Delivered</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">12</p>
                              <p className="text-[9px] text-zinc-500 uppercase">Remaining</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-amber-400">₹50</p>
                              <p className="text-[9px] text-zinc-500 uppercase">Per Day</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-purple-400">Weekly</p>
                              <p className="text-[9px] text-zinc-500 uppercase">Plan</p>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-zinc-400">Meal Progress</span>
                              <span className="text-zinc-300 font-semibold">
                                18 of 30 meals › 60%
                              </span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full w-[60%]" />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 pt-1">
                            <button
                              onClick={() => toast.success('Subscription Resumed')}
                              className="flex-1 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all text-center"
                            >
                              Resume Plan
                            </button>
                            <button
                              onClick={() => setActiveTab('subscriptions')}
                              className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all"
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => setActiveTab('subscriptions')}
                              className="text-xs text-zinc-400 hover:text-white px-2 py-2"
                            >
                              View Details ›
                            </button>
                          </div>
                        </div>

                        {/* Sub 2 */}
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-4 hover:border-zinc-700 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                src="/south.jpeg"
                                alt="South Indian Thali"
                                className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-white">South Indian Thali</h4>
                                <p className="text-[11px] text-zinc-400">South Indian • Veg</p>
                                <div className="flex items-center space-x-1 mt-0.5">
                                  <StarSolidIcon className="w-3 h-3 text-amber-400" />
                                  <span className="text-xs font-bold text-zinc-200">4.6</span>
                                  <span className="text-[10px] text-zinc-500">(180 reviews)</span>
                                </div>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          </div>

                          {/* Stats 4-box grid */}
                          <div className="grid grid-cols-4 gap-2 bg-zinc-950/60 p-2.5 rounded-xl text-center border border-zinc-800/60">
                            <div>
                              <p className="text-xs font-bold text-white">10</p>
                              <p className="text-[9px] text-zinc-500 uppercase">Delivered</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">20</p>
                              <p className="text-[9px] text-zinc-500 uppercase">Remaining</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-amber-400">₹70</p>
                              <p className="text-[9px] text-zinc-500 uppercase">Per Day</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-purple-400">Monthly</p>
                              <p className="text-[9px] text-zinc-500 uppercase">Plan</p>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-zinc-400">Meal Progress</span>
                              <span className="text-zinc-300 font-semibold">
                                10 of 30 meals › 33%
                              </span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[33%]" />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 pt-1">
                            <button
                              onClick={() => setActiveTab('subscriptions')}
                              className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-all text-center"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => setActiveTab('subscriptions')}
                              className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* REWARDS & BENEFITS CARD */}
                    <div className="lg:col-span-4 bg-[#14151e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-lg">👑</span>
                          <h3 className="text-base font-bold text-white">Rewards & Benefits</h3>
                        </div>

                        {/* Gold Member Highlight Box */}
                        <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900 to-amber-600/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg">
                              👑
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">Gold Member</h4>
                              <p className="text-[11px] text-amber-300 font-medium">
                                You have saved ₹2,450 so far!
                              </p>
                            </div>
                          </div>

                          {/* XP Progress Bar */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-[11px] text-zinc-400 font-medium">
                              <span>1250 / 2000 XP</span>
                              <span className="text-amber-400">750 XP to Platinum</span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full w-[62.5%]" />
                            </div>
                          </div>
                        </div>

                        {/* Benefits Icons Grid */}
                        <div className="space-y-3 pt-4">
                          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <TruckIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">Free Delivery</h5>
                              <p className="text-[10px] text-zinc-400">
                                All active subscription plans
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                              <ShieldCheckIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">Priority Support</h5>
                              <p className="text-[10px] text-zinc-400">Dedicated 24/7 hotline</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                              <TagIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">Exclusive Offers</h5>
                              <p className="text-[10px] text-zinc-400">
                                Special seasonal discounts
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('rewards')}
                        className="w-full py-2.5 text-center text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors border-t border-zinc-800 pt-3"
                      >
                        View All Rewards ›
                      </button>
                    </div>
                  </div>

                  {/* 5. YOU MIGHT ALSO LIKE (BOTTOM HORIZONTAL RECOMMENDATIONS) */}
                  <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">You Might Also Like</h3>
                      <Link
                        to="/tiffins"
                        className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        View All
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                      {displayRecommendations.slice(0, 4).map((item) => {
                        const ratingVal =
                          typeof item.rating === 'object' && item.rating !== null
                            ? item.rating.average || 4.7
                            : item.rating || 4.7;

                        const priceVal =
                          typeof item.price === 'object' && item.price !== null
                            ? item.price.daily || item.price.weekly || 95
                            : item.price || 95;

                        return (
                          <div
                            key={item._id}
                            onClick={() => navigate(`/tiffins/${item._id || item.slug}`)}
                            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 space-y-3 cursor-pointer hover:border-orange-500/50 hover:bg-zinc-900 transition-all group"
                          >
                            <div className="relative rounded-xl overflow-hidden h-32">
                              <img
                                src={item.images?.[0] || item.image || '/north.jpeg'}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 right-2 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center space-x-1 text-[11px] font-bold text-amber-400 border border-zinc-800">
                                <StarSolidIcon className="w-3 h-3 text-amber-400" />
                                <span>{ratingVal}</span>
                              </div>
                            </div>

                            <div className="space-y-1 px-1">
                              <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                                {item.title}
                              </h4>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-xs font-extrabold text-orange-400">
                                  ₹{priceVal}
                                  <span className="text-[10px] text-zinc-500 font-normal">
                                    /day
                                  </span>
                                </span>
                                <span className="text-[10px] font-semibold text-zinc-400 group-hover:translate-x-0.5 transition-transform">
                                  Explore ›
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 📦 MY SUBSCRIPTIONS TAB */}
              {activeTab === 'subscriptions' && (
                <motion.div
                  key="subscriptions-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl"
                >
                  <MySubscriptions />
                </motion.div>
              )}

              {/* 📋 ORDER HISTORY TAB */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl"
                >
                  <OrderHistory />
                </motion.div>
              )}

              {/* 💳 PAYMENTS TAB */}
              {activeTab === 'payments' && (
                <motion.div
                  key="payments-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl"
                >
                  <PaymentHistory />
                </motion.div>
              )}

              {/* ⭐ REWARDS TAB */}
              {activeTab === 'rewards' && (
                <motion.div
                  key="rewards-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-8 shadow-xl space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                        <span>👑</span>
                        <span>Tiffo Loyalty & Rewards</span>
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Earn XP on every order and unlock exclusive partner discounts!
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-400">1,250 XP</span>
                      <p className="text-[11px] text-zinc-400">Gold Member Level</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-2">
                      <span className="text-2xl">⚡</span>
                      <h4 className="text-sm font-bold text-white">Free Delivery</h4>
                      <p className="text-xs text-zinc-400">
                        Zero delivery fee applied on all plan renewals automatically.
                      </p>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-2">
                      <span className="text-2xl">🎁</span>
                      <h4 className="text-sm font-bold text-white">₹300 Referral Bonus</h4>
                      <p className="text-xs text-zinc-400">
                        Earn ₹300 for every friend who subscribes to a weekly or monthly plan.
                      </p>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-2">
                      <span className="text-2xl">🎧</span>
                      <h4 className="text-sm font-bold text-white">Priority Concierge</h4>
                      <p className="text-xs text-zinc-400">
                        Direct VIP support line for quick delivery adjustments and meal swaps.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 📍 ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#14151e] border border-zinc-800/80 rounded-2xl p-8 shadow-xl space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                        <MapPinIcon className="w-6 h-6 text-orange-500" />
                        <span>Saved Addresses</span>
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Manage your home, office, and delivery locations.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/profile')}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all"
                    >
                      + Add New Address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/80 border border-orange-500/40 rounded-2xl p-5 space-y-2 relative">
                      <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        Default Home
                      </span>
                      <h4 className="text-sm font-bold text-white">Home Address</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Flat 402, Sunshine Apartments, Green Glen Layout, Bellandur, Bengaluru -
                        560103
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
