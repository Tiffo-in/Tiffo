import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon, ClockIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

const TiffinCard = React.memo(({ tiffin, showDistance = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Compute discount info
  const discount = tiffin.discount;
  const discountActive =
    discount?.isActive && (!discount.expiresAt || new Date() < new Date(discount.expiresAt));
  const maxDiscount = discountActive ? Math.max(discount.weekly || 0, discount.monthly || 0) : 0;

  // Use effectivePrice if present (set by backend virtual), else fallback
  const dailyPrice = tiffin.price?.daily || 0;

  // Determine if vegetarian or vegan
  const isVeg =
    tiffin.isVeg || tiffin.dietary?.some((d) => ['vegetarian', 'vegan'].includes(d.toLowerCase()));

  return (
    <Link to={`/tiffins/${tiffin.slug || tiffin._id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-neutral-100 dark:border-neutral-700"
      >
        {/* Image Container */}
        <div className="relative overflow-hidden h-56 bg-neutral-900">
          {/* Shimmer Loading Effect */}
          {!imageLoaded && tiffin.images?.[0] && <div className="absolute inset-0 skeleton" />}

          {tiffin.images?.[0] ? (
            <motion.img
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              src={tiffin.images[0]}
              alt={tiffin.title}
              onLoad={() => setImageLoaded(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 flex flex-col items-center justify-center relative">
              {/* Minimal kitchen grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none text-white"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
              <span className="text-4xl mb-2 select-none filter drop-shadow">🍱</span>
              {/* Partner Logo Circle inside Card */}
              <div className="w-9 h-9 rounded-full border border-white/20 bg-white/10 dark:bg-neutral-800/80 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-md">
                {tiffin.partner?.logo ? (
                  <img
                    src={tiffin.partner.logo}
                    alt={tiffin.partner.businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-white select-none">
                    {(tiffin.partner?.businessName?.[0] || 'T').toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges Container */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-2">
              {/* Veg/Non-veg Indicator */}
              <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-md flex items-center space-x-1.5">
                <div
                  className={`w-4 h-4 border-2 ${isVeg ? 'border-green-600' : 'border-red-600'} rounded-sm flex items-center justify-center`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}
                  ></div>
                </div>
                <span
                  className={`text-xs font-medium ${isVeg ? 'text-green-700' : 'text-red-700'}`}
                >
                  {isVeg ? 'Veg' : 'Non-Veg'}
                </span>
              </div>

              {/* Verified Badge */}
              {tiffin.partner?.verified && (
                <div className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg shadow-md flex items-center space-x-1 font-semibold">
                  <CheckBadgeIcon className="h-3.5 w-3.5 fill-current" />
                  <span className="text-[10px] uppercase tracking-wider">Verified</span>
                </div>
              )}
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
            <span className="text-sm font-bold">{tiffin.rating?.average?.toFixed(1) || '4.0'}</span>
          </motion.div>

          {/* Price Tag */}
          <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
            <span className="text-lg font-bold text-neutral-900">₹{dailyPrice}</span>
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
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </motion.span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});

export default TiffinCard;
