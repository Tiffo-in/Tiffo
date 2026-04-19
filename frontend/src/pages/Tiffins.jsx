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

const Tiffins = () => {
  const dispatch = useDispatch();
  const { tiffins, isLoading } = useSelector((state) => state.tiffins);
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
      if (!location) return; // Ads usually require location for GEO sorting
      try {
        const res = await api.get('/ads/listings', {
          params: { ...filters, lat: location.lat, lng: location.lng, radius: location.radius, limit: 3 }
        });
        if (isMounted && res.data?.data?.sponsored) {
          setAds(res.data.data.sponsored);
        }
      } catch (err) {
        console.error("Failed to load sponsored tiffins", err);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
            <span className="text-5xl mr-4 animate-food-bounce">🍱</span>
            <span className="bg-gradient-to-r from-maroon-600 via-maroon-700 to-maroon-800 dark:from-maroon-400 dark:via-maroon-500 dark:to-maroon-600 bg-clip-text text-transparent">Browse Tiffins</span>
          </h1>

          {/* Location Picker */}
          <LocationPicker onLocationChange={handleLocationChange} defaultRadius={10} />

          {/* Filters */}
          <div className="glass-card p-6 mb-8 shadow-premium">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-xl mr-2">🔍</span>
              Filter By:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <select
                value={filters.mealType}
                onChange={(e) => handleFilterChange('mealType', e.target.value)}
                className="input-field text-sm font-medium"
              >
                <option value="">All Meal Types 🍴</option>
                <option value="breakfast">Breakfast 🍳</option>
                <option value="lunch">Lunch 🍛</option>
                <option value="dinner">Dinner 🍝</option>
                <option value="snacks">Snacks 🍪</option>
              </select>

              <select
                value={filters.cuisine}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                className="input-field text-sm font-medium"
              >
                <option value="">All Cuisines 🌍</option>
                <option value="North Indian">North Indian</option>
                <option value="South Indian">South Indian</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Bengali">Bengali</option>
              </select>

              <select
                value={filters.dietary}
                onChange={(e) => handleFilterChange('dietary', e.target.value)}
                className="input-field text-sm font-medium"
              >
                <option value="">All Dietary 🥗</option>
                <option value="vegetarian">Vegetarian 🥒</option>
                <option value="vegan">Vegan 🥬</option>
                <option value="non-vegetarian">Non-Vegetarian 🍗</option>
                <option value="jain">Jain</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tiffins Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="large" message="Finding delicious tiffins..." />
          </div>
        ) : tiffins.length > 0 ? (
          <>
            {location && (
              <motion.div
                className="mb-6 glass-card p-4 border-l-4 border-accent-teal-500 shadow-premium"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📍</span>
                  <span className="font-semibold text-accent-teal-700">
                    Showing {tiffins.length} tiffin{tiffins.length !== 1 ? 's' : ''} within {location.radius} km of your location
                  </span>
                </div>
              </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayItems.map((item, index) => {
                const uniqueKey = item.type === 'ad' ? `ad-${item.data._id}` : `org-${item.data._id}`;
                
                if (item.type === 'ad') {
                  return (
                    <motion.div
                      key={uniqueKey}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
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
                    transition={{ delay: index * 0.05 }}
                  >
                    <TiffinCard tiffin={item.data} showDistance={!!location} />
                  </motion.div>
                );
              })}
            </div>
            {/* ─── Load More ─── */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <motion.button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary px-10 py-3.5 font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
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
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="text-8xl mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >🔍</motion.div>
            <p className="text-gray-700 text-xl font-bold mb-2">No tiffins found matching your criteria.</p>
            {location ? (
              <p className="text-gray-500 text-base">
                Try increasing your search radius or adjusting your filters.
              </p>
            ) : (
              <p className="text-gray-500 text-base">
                Try adjusting your filters or enable location to find nearby tiffins.
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