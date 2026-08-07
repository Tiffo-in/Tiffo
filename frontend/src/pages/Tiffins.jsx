import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

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
  const filterRef = useRef(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 12;

  // Seed location from ?lat=&lng=&radius= (e.g. the home hero's "use my
  // location" search) so results are pre-filtered to the user's coordinates.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const lat = parseFloat(p.get('lat'));
    const lng = parseFloat(p.get('lng'));
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      const radius = parseFloat(p.get('radius')) || 10;
      setLocation({ lat, lng, radius });
    }
  }, []);

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

  // Close the consolidated filter dropdown on outside click or Escape.
  useEffect(() => {
    if (!showFilterDrawer) return undefined;
    const handlePointer = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterDrawer(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowFilterDrawer(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showFilterDrawer]);

  // Number of non-default filters, shown as a badge on the Filters button.
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.cuisine) count += 1;
    if (filters.mealType) count += 1;
    if (filters.dietary) count += 1;
    if (filters.priceRange) count += 1;
    if (filters.minRating) count += 1;
    if (filters.sortBy && filters.sortBy !== 'recommended') count += 1;
    return count;
  }, [filters]);

  // Real store tiffins only — an empty result shows the empty state, never fake data.
  const sourceTiffins = useMemo(() => tiffins || [], [tiffins]);

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
    <div className="min-h-screen bg-gradient-hero text-neutral-900 pt-24 pb-20 relative overflow-hidden font-sans">
      {/* Single ambient warm glow, matching the home hero. The SVG fractal-noise
          grain overlay that used to sit here was tuned for the old near-black
          hero — over warm white it just reads as dirt — and the second blur blob
          only muddied the first. */}
      <div className="absolute top-20 left-[-5%] w-[500px] h-[500px] bg-brand/10 rounded-full blur-[140px] pointer-events-none" />

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
              {/* Solid primary-600, same as the home hero. A three-stop
                  bg-clip-text gradient can't be contrast-checked and read as a
                  different brand from the rest of the site. */}
              <span className="text-primary-600">Perfect Tiffin</span>
            </h1>

            <p className="text-neutral-600 text-base md:text-lg max-w-xl font-normal leading-relaxed">
              Discover authentic, home-cooked meals prepared by passionate local chefs near you.
            </p>
          </motion.div>

          {/* Right Column: Floating Location Card */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="bg-surface-alt border border-neutral-100 rounded-2xl p-5 md:p-6 shadow-card relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                  <div className="p-2 rounded-xl bg-primary-500/10 text-brand-ink">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-neutral-500 uppercase tracking-wider font-medium">
                      Delivering to
                    </span>
                    <button className="flex items-center gap-1 text-neutral-900 font-bold text-sm hover:text-brand-ink transition-colors">
                      <span>{userCity}</span>
                      <ChevronDownIcon className="w-4 h-4 text-neutral-600" />
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-brand hover:bg-brand-hover text-on-brand font-bold py-3.5 px-4 rounded-xl text-sm transition-all duration-200 shadow-card  flex items-center justify-center gap-2.5 mb-3"
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

              <p className="text-[11px] text-neutral-500 text-center font-medium">
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
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tiffins, cuisines, or kitchens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-alt text-neutral-900 placeholder:text-neutral-400 border border-neutral-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-card"
              />
            </div>

            {/* Consolidated Filter Dropdown — all filters in one control */}
            <div className="relative shrink-0" ref={filterRef}>
              <button
                onClick={() => setShowFilterDrawer((v) => !v)}
                aria-expanded={showFilterDrawer}
                aria-haspopup="dialog"
                className="bg-surface-alt border border-neutral-100 hover:bg-surface text-neutral-900 text-sm font-bold px-5 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-card"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-brand" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand text-on-brand text-[11px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDownIcon
                  className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                    showFilterDrawer ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {showFilterDrawer && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    role="dialog"
                    aria-label="Filter tiffins"
                    className="absolute right-0 mt-2 w-[min(92vw,26rem)] bg-surface border border-neutral-100 rounded-2xl shadow-card-hover p-5 z-30 origin-top-right"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black text-neutral-900">Filters</h3>
                      {activeFilterCount > 0 && (
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {activeFilterCount} active
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Cuisine */}
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Cuisine
                        </span>
                        <select
                          value={filters.cuisine}
                          onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                          className="w-full bg-surface-alt text-neutral-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-neutral-100 outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="">All Cuisines</option>
                          <option value="North Indian">North Indian</option>
                          <option value="South Indian">South Indian</option>
                          <option value="Gujarati">Gujarati</option>
                          <option value="Punjabi">Punjabi</option>
                          <option value="Rajasthani">Rajasthani</option>
                          <option value="Jain">Jain</option>
                        </select>
                      </label>

                      {/* Meal Type */}
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Meal Type
                        </span>
                        <select
                          value={filters.mealType}
                          onChange={(e) => handleFilterChange('mealType', e.target.value)}
                          className="w-full bg-surface-alt text-neutral-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-neutral-100 outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="">All Meals</option>
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                        </select>
                      </label>

                      {/* Veg / Non-Veg */}
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Dietary
                        </span>
                        <select
                          value={filters.dietary}
                          onChange={(e) => handleFilterChange('dietary', e.target.value)}
                          className="w-full bg-surface-alt text-neutral-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-neutral-100 outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="">All</option>
                          <option value="vegetarian">Pure Veg 🥬</option>
                          <option value="non-vegetarian">Non-Veg 🍗</option>
                        </select>
                      </label>

                      {/* Price */}
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Price
                        </span>
                        <select
                          value={filters.priceRange}
                          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                          className="w-full bg-surface-alt text-neutral-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-neutral-100 outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="">Any Price</option>
                          <option value="under100">Under ₹100</option>
                          <option value="100-150">₹100 - ₹150</option>
                          <option value="above150">Above ₹150</option>
                        </select>
                      </label>

                      {/* Rating */}
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Rating
                        </span>
                        <select
                          value={filters.minRating}
                          onChange={(e) => handleFilterChange('minRating', e.target.value)}
                          className="w-full bg-surface-alt text-neutral-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-neutral-100 outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="">Any Rating</option>
                          <option value="4.5">4.5+ ⭐</option>
                          <option value="4.0">4.0+ ⭐</option>
                        </select>
                      </label>

                      {/* Sort By — full width */}
                      <label className="flex flex-col gap-1.5 sm:col-span-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Sort By
                        </span>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                          className="w-full bg-surface-alt text-neutral-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-neutral-100 outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="recommended">Recommended</option>
                          <option value="rating">Highest Rated</option>
                          <option value="priceLow">Price: Low to High</option>
                          <option value="priceHigh">Price: High to Low</option>
                        </select>
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-neutral-100">
                      <button
                        onClick={handleResetFilters}
                        className="text-brand-ink text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors py-1 px-2"
                      >
                        <span>Reset all</span>
                        <ArrowPathIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setShowFilterDrawer(false)}
                        className="bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-card"
                      >
                        Show {filteredTiffins.length} results
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                      ? 'bg-brand text-on-brand shadow-card  border border-brand'
                      : 'bg-surface-alt text-neutral-600 hover:text-on-brand border border-neutral-100 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── 3. SECTION HEADER & VIEW SWITCHER ─── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">All Tiffins</h2>
            <p className="text-neutral-500 text-xs font-medium mt-0.5">
              {filteredTiffins.length === 1
                ? 'Showing 1 meal'
                : `Showing ${filteredTiffins.length} meals`}
            </p>
          </div>

          {/* Grid vs List View Switcher */}
          <div className="bg-surface-alt border border-neutral-100 p-1 rounded-xl flex items-center gap-1 shadow-card">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-brand text-on-brand'
                  : 'text-neutral-600 hover:text-on-brand'
              }`}
              title="Grid View"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-brand text-on-brand'
                  : 'text-neutral-600 hover:text-on-brand'
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
            className="text-center py-16 bg-surface-alt rounded-3xl border border-neutral-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-neutral-900 text-xl font-bold mb-2">Unable to load tiffins</p>
            <p className="text-neutral-600 text-sm mb-6 max-w-md mx-auto">
              There was a problem connecting to the server. Please check your connection and try
              again.
            </p>
            <button
              onClick={() => dispatch(getTiffins({ ...filters, limit: LIMIT, page: 1 }))}
              className="bg-primary-500 text-on-brand px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-hover transition-colors"
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
                  className="bg-surface-alt hover:bg-surface-alt border border-neutral-200 text-neutral-900 px-8 py-3.5 rounded-full font-bold text-sm shadow-card-hover flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin text-brand" />
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
            className="text-center py-20 bg-surface-alt rounded-3xl border border-neutral-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-neutral-900 text-2xl font-bold mb-2">No tiffins found</h3>
            <p className="text-neutral-600 text-sm max-w-md mx-auto mb-6">
              Try adjusting your search term or filters to find what you are looking for.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-primary-500 text-on-brand px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-hover transition-colors"
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
