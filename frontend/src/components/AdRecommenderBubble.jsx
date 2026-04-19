import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { SparklesIcon, ChatBubbleLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AdRecommenderBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  // Attempt to grab location silently once mounted
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log("Recommender: Location access denied, won't show recommendations.");
        }
      );
    }
  }, []);

  const handleOpenWidget = async () => {
    setIsOpen(!isOpen);
    
    // If opening, and we have location but no recommendation yet, fetch it
    if (!isOpen && location && !recommendation) {
      setLoading(true);
      try {
        const res = await api.get('/ads/recommender', {
          params: { lat: location.lat, lng: location.lng }
        });
        
        if (res.data.success && res.data.data) {
          // Log an impression to charge the partner since this is highly visible
          api.post('/ads/impressions', { campaignIds: [res.data.data.campaignId] });
          setRecommendation(res.data.data);
        }
      } catch (err) {
        console.error("Recommender bot fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClickCapture = () => {
    if (recommendation && recommendation.campaignId) {
      api.post(`/ads/clicks/${recommendation.campaignId}`).catch(()=>null);
    }
  };

  // Only render the floating button if we actually have location context
  // (otherwise it would just open a broken state because we cant suggest without coords)
  if (!location) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end flex-col">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-4 bg-white/60 dark:bg-neutral-900/80 backdrop-blur-xl border border-white dark:border-neutral-800 shadow-2xl rounded-3xl p-5 w-80 relative overflow-hidden"
          >
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-600" />
            
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-neutral-900 dark:text-white">Food Genie AI</h4>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 text-sm text-neutral-700 dark:text-neutral-300">
              {loading ? (
                <div className="flex space-x-1 items-center h-6">
                  <motion.div animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6}} className="w-2 h-2 bg-rose-400 rounded-full"/>
                  <motion.div animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6, delay:0.2}} className="w-2 h-2 bg-rose-400 rounded-full"/>
                  <motion.div animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6, delay:0.4}} className="w-2 h-2 bg-rose-400 rounded-full"/>
                </div>
              ) : recommendation ? (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration: 0.5}}>
                  <p className="leading-relaxed mb-3 font-medium">
                    {recommendation.message}
                  </p>
                  
                  <Link 
                    to={`/partner/${recommendation.partnerId}`} 
                    onClick={handleClickCapture}
                    className="block text-center w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold py-2 rounded-xl text-xs uppercase tracking-wide hover:scale-[1.02] transition-transform shadow-md"
                  >
                    Check it out
                  </Link>
                </motion.div>
              ) : (
                <p>Sorry, I couldn't find any hot recommendations near you right now. 😢 Check the full feed!</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpenWidget}
        className="w-14 h-14 bg-gradient-to-br from-orange-500 to-rose-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] transition-shadow text-white border-2 border-white/20 backdrop-blur-sm"
      >
        {isOpen ? <XMarkIcon className="w-6 h-6" /> : <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default AdRecommenderBubble;
