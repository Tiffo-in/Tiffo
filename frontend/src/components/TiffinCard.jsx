import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/solid';

const TiffinCard = ({ tiffin, showDistance = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const foodImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
  ];

  const randomImage = foodImages[Math.floor(Math.random() * foodImages.length)];

  // Compute discount info
  const discount = tiffin.discount;
  const discountActive = discount?.isActive &&
    (!discount.expiresAt || new Date() < new Date(discount.expiresAt));
  const maxDiscount = discountActive
    ? Math.max(discount.weekly || 0, discount.monthly || 0)
    : 0;

  // Use effectivePrice if present (set by backend virtual), else fallback
  const dailyPrice = tiffin.price?.daily || 0;

  return (
    <Link to={`/tiffins/${tiffin._id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-neutral-100 dark:border-neutral-700"
      >
        {/* Image Container */}
        <div className="relative overflow-hidden h-56">
          {/* Shimmer Loading Effect */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}

          <motion.img
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src={tiffin.images?.[0] || randomImage}
            alt={tiffin.title}
            onLoad={() => setImageLoaded(true)}
            className="w-full h-full object-cover"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges Container */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {/* Veg/Non-veg Indicator */}
            <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-md flex items-center space-x-1.5">
              <div className={`w-4 h-4 border-2 ${tiffin.dietary?.includes('Vegetarian') ? 'border-green-600' : 'border-red-600'} rounded-sm flex items-center justify-center`}>
                <div className={`w-2 h-2 rounded-full ${tiffin.dietary?.includes('Vegetarian') ? 'bg-green-600' : 'bg-red-600'}`}></div>
              </div>
              <span className={`text-xs font-medium ${tiffin.dietary?.includes('Vegetarian') ? 'text-green-700' : 'text-red-700'}`}>
                {tiffin.dietary?.includes('Vegetarian') ? 'Veg' : 'Non-Veg'}
              </span>
            </div>

            {/* Right side: Distance OR Discount badge */}
            <div className="flex flex-col items-end gap-1.5">
              {/* Distance Badge */}
              {showDistance && tiffin.distance !== undefined && (
                <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 shadow-md flex items-center">
                  <MapPinIcon className="h-3.5 w-3.5 mr-1.5 text-primary-500" />
                  {tiffin.distance.toFixed(1)} km
                </div>
              )}
              {/* Discount badge */}
              {maxDiscount > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2.5 py-1 rounded-lg shadow-md text-xs font-bold flex items-center gap-1"
                >
                  🏷️ {maxDiscount}% OFF
                </motion.div>
              )}
            </div>
          </div>

          {/* Rating Badge */}
          <motion.div
            className="absolute bottom-3 right-3 bg-green-600 text-white px-2.5 py-1 rounded-lg shadow-lg flex items-center space-x-1"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
          >
            <StarIcon className="h-3.5 w-3.5" />
            <span className="text-sm font-bold">
              {tiffin.rating?.average?.toFixed(1) || '4.0'}
            </span>
          </motion.div>

          {/* Price Tag */}
          <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
            <span className="text-lg font-bold text-neutral-900">
              ₹{dailyPrice}
            </span>
            <span className="text-neutral-500 text-xs ml-1">/day</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors duration-300 line-clamp-1 mb-2">
            {tiffin.title}
          </h3>

          {/* Description */}
          <p className="text-neutral-500 text-sm line-clamp-2 mb-4 leading-relaxed">
            {tiffin.description}
          </p>

          {/* Info Tags */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-medium capitalize">
              {tiffin.mealType}
            </span>
            <span className="bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 px-3 py-1 rounded-full text-xs font-medium">
              {tiffin.cuisine}
            </span>
          </div>

          {/* CTA Row */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center text-neutral-500 text-xs">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Fresh Daily</span>
            </div>
            <motion.span
              className="text-primary-500 font-semibold text-sm flex items-center group/cta"
              whileHover={{ x: 3 }}
            >
              View Details
              <motion.span
                className="inline-block ml-1"
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </motion.span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default TiffinCard;