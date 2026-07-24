import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, HeartIcon, ClockIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

const TiffinCard = React.memo(({ tiffin, showDistance = false, viewMode = 'grid' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Compute discount info
  const discount = tiffin.discount;
  const discountActive =
    discount?.isActive && (!discount.expiresAt || new Date() < new Date(discount.expiresAt));
  const maxDiscount = discountActive
    ? Math.max(discount.weekly || 0, discount.monthly || 0)
    : tiffin.discountPercentage || 0;

  // Daily price computation
  const dailyPrice =
    typeof tiffin.price === 'object' ? tiffin.price?.daily || 0 : tiffin.price || 120;

  // Determine if vegetarian
  const isVeg =
    tiffin.isVeg !== undefined
      ? tiffin.isVeg
      : (tiffin.dietary?.some((d) => ['vegetarian', 'vegan'].includes(d.toLowerCase())) ?? true);

  const kitchenName =
    tiffin.partner?.businessName ||
    tiffin.partner?.name ||
    tiffin.kitchenName ||
    'Verified Kitchen';
  const prepTime = tiffin.prepTime || tiffin.deliveryTime || '25 min';
  const ratingVal = tiffin.rating?.average || tiffin.rating || 4.8;
  const imageSrc = tiffin.images?.[0] || tiffin.image || '/tiffin.jpeg';

  if (viewMode === 'list') {
    return (
      <Link to={`/tiffins/${tiffin.slug || tiffin._id}`}>
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="bg-[#181A24] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] hover:border-primary-500/40 transition-all duration-300 cursor-pointer group flex flex-col md:flex-row shadow-xl"
        >
          {/* Image Left */}
          <div className="relative md:w-64 h-48 md:h-auto overflow-hidden shrink-0 bg-[#0F1016]">
            <img
              src={imageSrc}
              alt={tiffin.title || tiffin.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {maxDiscount > 0 ? (
                <span className="bg-[#FF5216] text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-md uppercase">
                  {maxDiscount}% OFF
                </span>
              ) : (
                <span
                  className={`text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md ${
                    isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {isVeg ? 'Veg' : 'Non-Veg'}
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
            >
              {isFavorite ? (
                <HeartIcon className="w-4 h-4 text-rose-500" />
              ) : (
                <HeartOutline className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Content Right */}
          <div className="p-5 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white text-xl font-bold group-hover:text-primary-500 transition-colors">
                  {tiffin.title || tiffin.name}
                </h3>
                <div className="flex items-center gap-1 bg-[#232736] px-2.5 py-1 rounded-lg">
                  <StarIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-white text-xs font-bold">
                    {Number(ratingVal).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#B5B8C5] mb-3">
                <span className="font-medium">{kitchenName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              </div>

              <p className="text-[#B5B8C5]/70 text-sm line-clamp-2 mb-4">
                {tiffin.description ||
                  'Authentic home-cooked meals made with fresh ingredients and traditional recipes.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-4 text-xs text-[#B5B8C5]">
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5 text-primary-500" />
                  {prepTime}
                </span>
                <span className="text-emerald-400 font-medium">🚚 Free Delivery</span>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[#B5B8C5]/60 text-xs mr-1">From</span>
                  <span className="text-white text-2xl font-black">₹{dailyPrice}</span>
                  <span className="text-[#B5B8C5]/60 text-xs">/day</span>
                </div>
                <span className="bg-primary-500 hover:bg-[#FF9F43] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/20 transition-colors">
                  View Plans
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/tiffins/${tiffin.slug || tiffin._id}`}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-[#181A24] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] hover:border-primary-500/50 transition-all duration-300 cursor-pointer group shadow-xl flex flex-col h-full"
      >
        {/* Image Container */}
        <div className="relative h-52 bg-[#0F1016] overflow-hidden">
          <img
            src={imageSrc}
            alt={tiffin.title || tiffin.name}
            onLoad={() => setImageLoaded(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181A24] via-transparent to-black/30" />

          {/* Top Left Discount / Type Tag */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            {maxDiscount > 0 ? (
              <span className="bg-[#FF5216] text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                {maxDiscount}% OFF
              </span>
            ) : (
              <span
                className={`text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md ${
                  isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                {isVeg ? 'Veg' : 'Non-Veg'}
              </span>
            )}
          </div>

          {/* Top Right Heart Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/70 transition-colors z-10"
          >
            {isFavorite ? (
              <HeartIcon className="w-4 h-4 text-rose-500" />
            ) : (
              <HeartOutline className="w-4 h-4 text-white" />
            )}
          </button>

          {/* Bottom Left Badges Overlay: Veg/Non-Veg & Verified */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
            {/* Veg Badge with Dot */}
            <div className="bg-[#12141D]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-md">
              <span
                className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}
              />
              <span className="text-[11px] font-semibold text-white">
                {isVeg ? 'Veg' : 'Non-Veg'}
              </span>
            </div>

            {/* Verified Badge */}
            <div className="bg-blue-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-md">
              <CheckBadgeIcon className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            {/* Title */}
            <h3 className="text-white text-lg font-bold group-hover:text-primary-500 transition-colors line-clamp-1 mb-1">
              {tiffin.title || tiffin.name}
            </h3>

            {/* Kitchen Name */}
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[#B5B8C5] text-xs font-medium line-clamp-1">{kitchenName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between text-xs text-[#B5B8C5] mb-4 bg-[#12141D] p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-1">
                <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-white font-bold">{Number(ratingVal).toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5 text-primary-500" />
                <span>{prepTime}</span>
              </div>
              <div className="text-emerald-400 font-medium flex items-center gap-1">
                <span>🚚 Free Delivery</span>
              </div>
            </div>
          </div>

          {/* Price & CTA Row */}
          <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <div>
              <span className="text-[#B5B8C5]/60 text-xs mr-1">From</span>
              <span className="text-white text-xl font-black">₹{dailyPrice}</span>
              <span className="text-[#B5B8C5]/60 text-xs">/day</span>
            </div>

            <span className="bg-primary-500 hover:bg-[#FF9F43] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-primary-500/25 transition-all">
              View Plans
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});

export default TiffinCard;
