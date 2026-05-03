import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTiffins } from '../store/slices/tiffinSlice';
import TiffinCard from '../components/TiffinCard';
import LocationPicker from '../components/LocationPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import api from '../services/api';
import AdTiffinCard from '../components/AdTiffinCard';
import useImpressionTracker from '../hooks/useImpressionTracker';
import AdRecommenderBubble from '../components/AdRecommenderBubble';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Tiffins = () => {
  useDocumentTitle('Browse Tiffins');
  const dispatch = useDispatch();
  const { tiffins, isLoading, isError } = useSelector((state) => state.tiffins);
  const [filters, setFilters] = useState({
    mealType: '',
    cuisine: '',
    dietary: '',
  });
  const [location, setLocation] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 12;
  
  // -- ADS STATE & OBSERVER --
  const [ads, setAds] = useState([]);
  const { observeRef } = useImpressionTracker();

  // Fetch Ads independently of redux when location/filters change
  useEffect(() => {
    let isMounted = true;
    const fetchAds = async () => {
      if (!location) return;
      try {
        const res = await api.get('/ads/listings', {
          params: { ...filters, lat: location.lat, lng: location.lng, radius: location.radius, limit: 3 }
        });
        if (isMounted && res.data?.data?.sponsored) {
          setAds(res.data.data.sponsored);
        }
      } catch {
        // Ads are non-critical — silently ignore failures
      }
    };
    fetchAds();
    return () => { isMounted = false; };
  }, [filters, location]);

  // Merge ads sequentially into the organic tiffins list (e.g. ad at index 0, 3, 6...)
  const displayItems = [];
  let adIndex = 0;
  
  if (tiffins) {
    tiffins.forEach((tiffin, index) => {
      // Inject an ad every 4th item, if we have ads remaining
      if (index > 0 && index % 4 === 0 && adIndex < ads.length) {
        displayItems.push({ type: 'ad', data: ads[adIndex] });
        adIndex++;
      }
      displayItems.push({ type: 'organic', data: tiffin });
    });
  }
  // If we still have an ad but tiffins length is small (e.g. 1 tiffin), prepend the first ad
  if (adIndex === 0 && ads.length > 0) {
    displayItems.unshift({ type: 'ad', data: ads[0] });
  }

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
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLocationChange = (locationData) => {
    setLocation(locationData);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-28 pb-16 relative overflow-hidden transition-colors duration-500">
      
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 dark:bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary-500/10 dark:bg-secondary-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-black text-neutral-900 dark:text-white tracking-tight mb-3">
                Find Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600">
                  Perfect Tiffin
                </span>
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl font-medium">
                Discover authentic, home-cooked meals prepared by passionate local chefs near you.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <LocationPicker onLocationChange={handleLocationChange} defaultRadius={10} />
            </div>
          </div>

          {/* Premium Filters Card */}
          <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl border border-white/50 dark:border-neutral-800/50 p-6 lg:p-8 rounded-[2rem] shadow-xl shadow-neutral-200/50 dark:shadow-none">
            <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Refine Search
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="relative group">
                <select
                  value={filters.mealType}
                  onChange={(e) => handleFilterChange('mealType', e.target.value)}
                  className="w-full appearance-none bg-neutral-100 dark:bg-neutral-800/80 border-none rounded-2xl px-5 py-4 text-neutral-900 dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-primary-500 outline-none transition-all group-hover:bg-neutral-200 dark:group-hover:bg-neutral-800"
                >
                  <option value="">All Meal Types 🍴</option>
                  <option value="breakfast">Breakfast 🍳</option>
                  <option value="lunch">Lunch 🍛</option>
                  <option value="dinner">Dinner 🍝</option>
                  <option value="snacks">Snacks 🍪</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-neutral-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div className="relative group">
                <select
                  value={filters.cuisine}
                  onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                  className="w-full appearance-none bg-neutral-100 dark:bg-neutral-800/80 border-none rounded-2xl px-5 py-4 text-neutral-900 dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-primary-500 outline-none transition-all group-hover:bg-neutral-200 dark:group-hover:bg-neutral-800"
                >
                  <option value="">All Cuisines 🌍</option>
                  <option value="North Indian">North Indian</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Bengali">Bengali</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-neutral-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div className="relative group">
                <select
                  value={filters.dietary}
                  onChange={(e) => handleFilterChange('dietary', e.target.value)}
                  className="w-full appearance-none bg-neutral-100 dark:bg-neutral-800/80 border-none rounded-2xl px-5 py-4 text-neutral-900 dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-primary-500 outline-none transition-all group-hover:bg-neutral-200 dark:group-hover:bg-neutral-800"
                >
                  <option value="">All Dietary 🥗</option>
                  <option value="vegetarian">Vegetarian 🥒</option>
                  <option value="vegan">Vegan 🥬</option>
                  <option value="non-vegetarian">Non-Vegetarian 🍗</option>
                  <option value="jain">Jain</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-neutral-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tiffins Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="large" message="Finding delicious tiffins..." />
          </div>
        ) : isError ? (
          <motion.div
            className="text-center py-20 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl rounded-[3rem] border border-neutral-200 dark:border-neutral-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-6">⚠️</div>
            <p className="text-neutral-900 dark:text-white text-2xl font-black mb-3">Unable to load tiffins</p>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto">There was a problem connecting to the server. Please check your connection and try again.</p>
            <button
              onClick={() => dispatch(getTiffins({ ...filters, limit: LIMIT, page: 1 }))}
              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
            >
              Try Again
            </button>
          </motion.div>
        ) : tiffins.length > 0 ? (
          <>
            {location && (
              <motion.div
                className="mb-8 inline-flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-5 py-3 rounded-2xl border border-primary-100 dark:border-primary-800/30"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-bold">
                  Showing {tiffins.length} tiffin{tiffins.length !== 1 ? 's' : ''} within {location.radius} km
                </span>
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayItems.map((item, index) => {
                const uniqueKey = item.type === 'ad' ? `ad-${item.data._id}` : `org-${item.data._id}`;
                
                if (item.type === 'ad') {
                  return (
                    <motion.div
                      key={uniqueKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
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
                    transition={{ delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <TiffinCard tiffin={item.data} showDistance={!!location} />
                  </motion.div>
                );
              })}
            </div>
            
            {/* ─── Load More ─── */}
            {hasMore && (
              <div className="flex justify-center mt-16">
                <motion.button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-10 py-4 rounded-full font-bold shadow-lg shadow-neutral-900/20 dark:shadow-white/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3 transition-all"
                >
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </>
                  ) : 'Load More Tiffins ↓'}
                </motion.button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            className="text-center py-24 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl rounded-[3rem] border border-neutral-200 dark:border-neutral-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="text-7xl mb-8"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >🔍</motion.div>
            <h3 className="text-neutral-900 dark:text-white text-3xl font-black mb-3">No tiffins found</h3>
            {location ? (
              <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-md mx-auto">
                Try increasing your search radius or adjusting your filters to see more delicious options.
              </p>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-md mx-auto">
                Try adjusting your filters or enabling location services to find nearby tiffins.
              </p>
            )}
          </motion.div>
        )}
      </div>
      <AdRecommenderBubble />
    </div>
  );
};

export default Tiffins;