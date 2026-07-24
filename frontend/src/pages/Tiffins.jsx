import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTiffins } from '../store/slices/tiffinSlice';
import TiffinCard from '../components/TiffinCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import AdTiffinCard from '../components/AdTiffinCard';
import useImpressionTracker from '../hooks/useImpressionTracker';
import useDocumentTitle from '../hooks/useDocumentTitle';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  Bars3Icon,
  ShieldCheckIcon,
  CubeIcon,
  UserGroupIcon,
  StarIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// Mock Tiffins matching screenshot reference design
const mockTiffins = [
  {
    _id: 'm1',
    title: 'South Indian Lunch Combo',
    partner: { businessName: "Meena's Tiffin Corner", verified: true },
    rating: { average: 4.9 },
    prepTime: '25 min',
    price: { daily: 120 },
    discountPercentage: 50,
    isVeg: true,
    cuisine: 'South Indian',
    mealType: 'lunch',
    images: [
      'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Sambar rice, avial, 2 veg sabzi, rasam, curd & pickle',
  },
  {
    _id: 'm2',
    title: 'Chicken Dinner Special',
    partner: { businessName: 'Tasty Kitchen', verified: true },
    rating: { average: 4.8 },
    prepTime: '30 min',
    price: { daily: 160 },
    isVeg: false,
    cuisine: 'North Indian',
    mealType: 'dinner',
    images: [
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Chicken curry, dal, 2 sabzi, steam rice, roti & salad',
  },
  {
    _id: 'm3',
    title: 'Idli & Dosa Breakfast',
    partner: { businessName: 'Sharma Ji Kitchen', verified: true },
    rating: { average: 4.8 },
    prepTime: '20 min',
    price: { daily: 80 },
    isVeg: true,
    cuisine: 'South Indian',
    mealType: 'breakfast',
    images: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    ],
    description: '4 steamed idlis, 2 masala dosas served with 3 chutneys & sambar',
  },
  {
    _id: 'm4',
    title: 'Punjabi Lunch Thali',
    partner: { businessName: 'Punjabi Tadka', verified: true },
    rating: { average: 4.7 },
    prepTime: '30 min',
    price: { daily: 130 },
    isVeg: true,
    cuisine: 'Punjabi',
    mealType: 'lunch',
    images: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Dal makhani, shahi paneer, 2 seasonal sabzi, butter roti & jeera rice',
  },
  {
    _id: 'm5',
    title: 'Rajasthani Dal-Baati',
    partner: { businessName: 'Rajasthan Rasoi', verified: true },
    rating: { average: 4.7 },
    prepTime: '35 min',
    price: { daily: 170 },
    isVeg: true,
    cuisine: 'Rajasthani',
    mealType: 'lunch',
    images: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Panchmel dal, 4 ghee baatis, churma, gatte ki sabzi & garlic chutney',
  },
  {
    _id: 'm6',
    title: 'Vegan Dinner Bowl',
    partner: { businessName: 'Green Bowl Kitchen', verified: true },
    rating: { average: 4.6 },
    prepTime: '25 min',
    price: { daily: 140 },
    isVeg: true,
    isHealthy: true,
    cuisine: 'Healthy',
    mealType: 'dinner',
    images: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Quinoa khichdi, yellow dal, roasted veggies, avocado salad & plant yogurt',
  },
  {
    _id: 'm7',
    title: 'Gujarati Thali',
    partner: { businessName: 'Rasoi Ghar', verified: true },
    rating: { average: 4.5 },
    prepTime: '30 min',
    price: { daily: 150 },
    isVeg: true,
    cuisine: 'Gujarati',
    mealType: 'lunch',
    images: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Sweet Gujarati dal, kadhi, 2 shaak, phulka rotlis, dhokla & basundi',
  },
  {
    _id: 'm8',
    title: 'Healthy Breakfast Box',
    partner: { businessName: 'Healthy Bites', verified: true },
    rating: { average: 4.4 },
    prepTime: '20 min',
    price: { daily: 70 },
    isVeg: true,
    isHealthy: true,
    cuisine: 'Healthy',
    mealType: 'breakfast',
    images: [
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Sprouted moong salad, poha or oats khichdi, boiled eggs/paneer & fresh juice',
  },
  {
    _id: 'm9',
    title: 'Jain Lunch Box',
    partner: { businessName: 'Jain Rasoi', verified: true },
    rating: { average: 4.2 },
    prepTime: '30 min',
    price: { daily: 135 },
    isVeg: true,
    cuisine: 'Jain',
    mealType: 'lunch',
    images: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'No onion, no garlic pure Jain dal, paneer sabzi, roti, rice & sweet',
  },
];

const categoryTabs = [
  { id: 'all', label: 'All Meals', icon: '🟧' },
  { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'lunch', label: 'Lunch', icon: '🍲' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'healthy', label: 'Healthy', icon: '🍃' },
  { id: 'thali', label: 'Thali', icon: '🍛' },
  { id: 'weekly', label: 'Weekly Plans', icon: '📅' },
];

const Tiffins = () => {
  useDocumentTitle('Browse Tiffins');
  const dispatch = useDispatch();
  const { tiffins, isLoading, isError } = useSelector((state) => state.tiffins);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState({
    mealType: '',
    cuisine: '',
    dietary: '',
    priceRange: '',
    minRating: '',
    sortBy: 'recommended',
  });

  const [location, setLocation] = useState(null);
  const [userCity, setUserCity] = useState('Bhopal, Madhya Pradesh');
  const [isLocating, setIsLocating] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 12;

  // -- ADS STATE & OBSERVER --
  const [ads, setAds] = useState([]);
  const { observeRef } = useImpressionTracker();

  // Fetch Ads independently
  useEffect(() => {
    let isMounted = true;
    const fetchAds = async () => {
      if (!location) return;
      try {
        const res = await api.get('/ads/listings', {
          params: {
            ...filters,
            lat: location.lat,
            lng: location.lng,
            radius: location.radius,
            limit: 3,
          },
        });
        if (isMounted && res.data?.data?.sponsored) {
          setAds(res.data.data.sponsored);
        }
      } catch {
        // Ads non-critical
      }
    };
    fetchAds();
    return () => {
      isMounted = false;
    };
  }, [filters, location]);

  useEffect(() => {
    const params = { ...filters, limit: LIMIT, page: 1 };
    if (location) {
      params.lat = location.lat;
      params.lng = location.lng;
      params.radius = location.radius;
    }
    setPage(1);
    setHasMore(true);
    dispatch(getTiffins(params));
  }, [dispatch, filters, location]);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radius: 10,
        };
        setLocation(loc);
        setUserCity('Near Current Location');
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert('Could not fetch location. Please check browser permissions.');
      }
    );
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const params = { ...filters, limit: LIMIT, page: nextPage };
    if (location) {
      params.lat = location.lat;
      params.lng = location.lng;
      params.radius = location.radius;
    }
    try {
      const result = await dispatch(getTiffins(params)).unwrap();
      if (!result || result.length < LIMIT) setHasMore(false);
      setPage(nextPage);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setFilters({
      mealType: '',
      cuisine: '',
      dietary: '',
      priceRange: '',
      minRating: '',
      sortBy: 'recommended',
    });
  };

  // Combine real store tiffins or fallback to mock tiffins
  const sourceTiffins = useMemo(() => {
    return tiffins && tiffins.length > 0 ? tiffins : mockTiffins;
  }, [tiffins]);

  // Client side search and category filter
  const filteredTiffins = useMemo(() => {
    return sourceTiffins.filter((item) => {
      const title = (item.title || item.name || '').toLowerCase();
      const kitchen = (item.partner?.businessName || item.partner?.name || '').toLowerCase();
      const cuisine = (item.cuisine || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      // Search matching
      if (
        query &&
        !title.includes(query) &&
        !kitchen.includes(query) &&
        !cuisine.includes(query) &&
        !desc.includes(query)
      ) {
        return false;
      }

      // Category tab matching
      if (activeCategory === 'breakfast' && (item.mealType || '').toLowerCase() !== 'breakfast')
        return false;
      if (activeCategory === 'lunch' && (item.mealType || '').toLowerCase() !== 'lunch')
        return false;
      if (activeCategory === 'dinner' && (item.mealType || '').toLowerCase() !== 'dinner')
        return false;
      if (
        activeCategory === 'healthy' &&
        !item.isHealthy &&
        !(item.cuisine || '').toLowerCase().includes('healthy')
      )
        return false;
      if (activeCategory === 'thali' && !title.includes('thali') && !desc.includes('thali'))
        return false;

      // Dropdown filters matching
      if (
        filters.mealType &&
        (item.mealType || '').toLowerCase() !== filters.mealType.toLowerCase()
      )
        return false;
      if (
        filters.cuisine &&
        !(item.cuisine || '').toLowerCase().includes(filters.cuisine.toLowerCase())
      )
        return false;
      if (filters.dietary) {
        if (filters.dietary === 'vegetarian' && !item.isVeg) return false;
        if (filters.dietary === 'non-vegetarian' && item.isVeg) return false;
      }

      return true;
    });
  }, [sourceTiffins, searchQuery, activeCategory, filters]);

  // Inject Ads into listings
  const displayItems = useMemo(() => {
    const list = [];
    let adIndex = 0;
    filteredTiffins.forEach((tiffin, index) => {
      if (index > 0 && index % 4 === 0 && adIndex < ads.length) {
        list.push({ type: 'ad', data: ads[adIndex] });
        adIndex++;
      }
      list.push({ type: 'organic', data: tiffin });
    });
    if (adIndex === 0 && ads.length > 0) {
      list.unshift({ type: 'ad', data: ads[0] });
    }
    return list;
  }, [filteredTiffins, ads]);

  return (
    <div className="min-h-screen bg-[#0F1016] text-white pt-24 pb-20 relative overflow-hidden font-sans selection:bg-[#FF7A18]/30 selection:text-orange-200">
      {/* Background grain & ambient glow blobs */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute top-20 left-[-5%] w-[500px] h-[500px] bg-[#FF7A18]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-80 right-[-10%] w-[450px] h-[450px] bg-[#FF5216]/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── 1. HERO HEADER SECTION ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
          {/* Left Column: Title & Social Proof */}
          <motion.div
            className="lg:col-span-7 flex flex-col gap-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Find Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A18] via-[#FF5216] to-[#FF3B00]">
                Perfect Tiffin
              </span>
            </h1>

            <p className="text-[#B5B8C5] text-base md:text-lg max-w-xl font-normal leading-relaxed">
              Discover authentic, home-cooked meals prepared by passionate local chefs near you.
            </p>

            {/* Social Proof / Avatars */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex -space-x-2.5 overflow-hidden">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0F1016] object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Customer"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0F1016] object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Customer"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0F1016] object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Customer"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#B5B8C5]">
                <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white text-sm">4.8</span>
                <span>(15K+ Happy Customers)</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Floating Location Card */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 text-xs text-[#B5B8C5]">
                  <div className="p-2 rounded-xl bg-[#FF7A18]/10 text-[#FF7A18]">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#B5B8C5]/60 uppercase tracking-wider font-medium">
                      Delivering to
                    </span>
                    <button className="flex items-center gap-1 text-white font-bold text-sm hover:text-[#FF7A18] transition-colors">
                      <span>{userCity}</span>
                      <ChevronDownIcon className="w-4 h-4 text-[#B5B8C5]" />
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#FF5216] hover:bg-[#E04410] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-[#FF5216]/30 flex items-center justify-center gap-2.5 mb-3"
              >
                {isLocating ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="8" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" />
                    </svg>
                    <span>Use My Current Location</span>
                  </>
                )}
              </motion.button>

              <p className="text-[11px] text-[#B5B8C5]/60 text-center font-medium">
                We'll show tiffins available near your location
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── 2. SEARCH & FILTER CONTROLS ─── */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Top Row: Search Input & Filters Button */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B8C5]/60 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tiffins, cuisines, or kitchens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#181A24] text-white placeholder:text-[#B5B8C5]/40 border border-[rgba(255,255,255,0.08)] rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-[#FF7A18] focus:ring-1 focus:ring-[#FF7A18] transition-all shadow-lg"
              />
            </div>

            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] hover:bg-[#202330] text-white text-sm font-bold px-5 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-lg shrink-0"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-[#FF7A18]" />
              <span>Filters</span>
            </button>
          </div>

          {/* Second Row: Category Pill Tabs */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide pt-1">
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#FF5216] text-white shadow-lg shadow-[#FF5216]/30 border border-[#FF5216]'
                      : 'bg-[#181A24] text-[#B5B8C5] hover:text-white border border-[rgba(255,255,255,0.08)] hover:border-white/20'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Third Row: Dropdown Filters Bar */}
          <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Cuisine Select */}
              <select
                value={filters.cuisine}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                className="bg-[#12141D] text-[#B5B8C5] text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.06)] outline-none focus:border-[#FF7A18] cursor-pointer"
              >
                <option value="">Cuisine ∨</option>
                <option value="North Indian">North Indian</option>
                <option value="South Indian">South Indian</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Rajasthani">Rajasthani</option>
                <option value="Jain">Jain</option>
              </select>

              {/* Meal Type Select */}
              <select
                value={filters.mealType}
                onChange={(e) => handleFilterChange('mealType', e.target.value)}
                className="bg-[#12141D] text-[#B5B8C5] text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.06)] outline-none focus:border-[#FF7A18] cursor-pointer"
              >
                <option value="">Meal Type ∨</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>

              {/* Veg / Non-Veg Select */}
              <select
                value={filters.dietary}
                onChange={(e) => handleFilterChange('dietary', e.target.value)}
                className="bg-[#12141D] text-[#B5B8C5] text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.06)] outline-none focus:border-[#FF7A18] cursor-pointer"
              >
                <option value="">Veg / Non-Veg ∨</option>
                <option value="vegetarian">Pure Veg 🥬</option>
                <option value="non-vegetarian">Non-Veg 🍗</option>
              </select>

              {/* Price Select */}
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="bg-[#12141D] text-[#B5B8C5] text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.06)] outline-none focus:border-[#FF7A18] cursor-pointer"
              >
                <option value="">Price ∨</option>
                <option value="under100">Under ₹100</option>
                <option value="100-150">₹100 - ₹150</option>
                <option value="above150">Above ₹150</option>
              </select>

              {/* Rating Select */}
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="bg-[#12141D] text-[#B5B8C5] text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.06)] outline-none focus:border-[#FF7A18] cursor-pointer"
              >
                <option value="">Rating ∨</option>
                <option value="4.5">4.5+ ⭐</option>
                <option value="4.0">4.0+ ⭐</option>
              </select>

              {/* Sort By Select */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="bg-[#12141D] text-[#B5B8C5] text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.06)] outline-none focus:border-[#FF7A18] cursor-pointer"
              >
                <option value="recommended">Sort By ∨</option>
                <option value="rating">Highest Rated</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="text-[#FF5216] hover:text-[#FF7A18] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 py-1 px-2"
            >
              <span>Reset</span>
              <ArrowPathIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* ─── 3. TRUST METRIC STATS BAR ─── */}
        <motion.div
          className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] p-4 rounded-2xl flex items-center gap-3.5 shadow-lg">
            <div className="p-3 rounded-xl bg-[#FF7A18]/10 text-[#FF7A18] shrink-0">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white text-lg font-black leading-tight">500+</div>
              <div className="text-[#B5B8C5]/60 text-xs font-medium">Verified Kitchens</div>
            </div>
          </div>

          <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] p-4 rounded-2xl flex items-center gap-3.5 shadow-lg">
            <div className="p-3 rounded-xl bg-[#FF7A18]/10 text-[#FF7A18] shrink-0">
              <CubeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white text-lg font-black leading-tight">40K+</div>
              <div className="text-[#B5B8C5]/60 text-xs font-medium">Meals Delivered</div>
            </div>
          </div>

          <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] p-4 rounded-2xl flex items-center gap-3.5 shadow-lg">
            <div className="p-3 rounded-xl bg-[#FF7A18]/10 text-[#FF7A18] shrink-0">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white text-lg font-black leading-tight">15K+</div>
              <div className="text-[#B5B8C5]/60 text-xs font-medium">Happy Customers</div>
            </div>
          </div>

          <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] p-4 rounded-2xl flex items-center gap-3.5 shadow-lg">
            <div className="p-3 rounded-xl bg-[#FF7A18]/10 text-[#FF7A18] shrink-0">
              <StarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white text-lg font-black leading-tight">4.8</div>
              <div className="text-[#B5B8C5]/60 text-xs font-medium">Average Rating</div>
            </div>
          </div>
        </motion.div>

        {/* ─── 4. SECTION HEADER & VIEW SWITCHER ─── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">All Tiffins</h2>
            <p className="text-[#B5B8C5]/60 text-xs font-medium mt-0.5">
              Showing {filteredTiffins.length} of 86 meals
            </p>
          </div>

          {/* Grid vs List View Switcher */}
          <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] p-1 rounded-xl flex items-center gap-1 shadow-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#FF5216] text-white' : 'text-[#B5B8C5] hover:text-white'
              }`}
              title="Grid View"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-[#FF5216] text-white' : 'text-[#B5B8C5] hover:text-white'
              }`}
              title="List View"
            >
              <Bars3Icon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── 5. TIFFINS GRID / LIST CONTENT ─── */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[350px]">
            <LoadingSpinner size="large" message="Finding delicious tiffins..." />
          </div>
        ) : isError ? (
          <motion.div
            className="text-center py-16 bg-[#181A24] rounded-3xl border border-[rgba(255,255,255,0.08)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-white text-xl font-bold mb-2">Unable to load tiffins</p>
            <p className="text-[#B5B8C5] text-sm mb-6 max-w-md mx-auto">
              There was a problem connecting to the server. Please check your connection and try
              again.
            </p>
            <button
              onClick={() => dispatch(getTiffins({ ...filters, limit: LIMIT, page: 1 }))}
              className="bg-[#FF7A18] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#FF9F43] transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : filteredTiffins.length > 0 ? (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-5'
              }
            >
              {displayItems.map((item, index) => {
                const uniqueKey =
                  item.type === 'ad' ? `ad-${item.data._id}` : `org-${item.data._id}`;

                if (item.type === 'ad') {
                  return (
                    <motion.div
                      key={uniqueKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <AdTiffinCard campaign={item.data} observeRef={observeRef} />
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={uniqueKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <TiffinCard tiffin={item.data} showDistance={!!location} viewMode={viewMode} />
                  </motion.div>
                );
              })}
            </div>

            {/* ─── LOAD MORE BUTTON ─── */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <motion.button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#181A24] hover:bg-[#202330] border border-[rgba(255,255,255,0.1)] text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin text-[#FF7A18]" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Tiffins</span>
                      <span>⬇</span>
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            className="text-center py-20 bg-[#181A24] rounded-3xl border border-[rgba(255,255,255,0.08)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-white text-2xl font-bold mb-2">No tiffins found</h3>
            <p className="text-[#B5B8C5] text-sm max-w-md mx-auto mb-6">
              Try adjusting your search term or filters to find what you are looking for.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-[#FF7A18] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#FF9F43] transition-colors"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Tiffins;
