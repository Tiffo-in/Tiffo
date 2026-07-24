import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  ClockIcon,
  TruckIcon,
  HeartIcon as HeartSolid,
  CheckBadgeIcon,
} from '@heroicons/react/24/solid';
import {
  HeartIcon as HeartOutline,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const defaultThumbnails = [
  'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
];

const TiffinHero = ({ tiffin, onBack, onSubscribe }) => {
  const images = tiffin.images && tiffin.images.length > 0 ? tiffin.images : defaultThumbnails;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const titleParts = (tiffin.title || tiffin.name || 'Healthy Breakfast Box').split(' ');
  const mainTitle = titleParts[0];
  const highlightedTitle = titleParts.slice(1).join(' ') || 'Breakfast Box';

  const partnerName = tiffin.partner?.businessName || tiffin.partner?.name || "Meena's Kitchen";
  const dailyPrice =
    typeof tiffin.price === 'object' ? tiffin.price?.daily || 70 : tiffin.price || 70;
  const ratingVal = tiffin.rating?.average || tiffin.rating || 4.8;
  const ratingCount = tiffin.rating?.count || tiffin.reviewCount || 320;
  const prepTime = tiffin.prepTime || tiffin.deliveryTime || '25–30 mins';

  const isVeg = tiffin.isVeg !== undefined ? tiffin.isVeg : true;

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mb-8">
      {/* Top Back Link */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#B5B8C5] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to all tiffins</span>
        </button>
      </div>

      {/* Hero Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Information Stack */}
        <div className="lg:col-span-6 flex flex-col justify-between h-full">
          <div>
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              {mainTitle} <span className="text-[#FF5216]">{highlightedTitle}</span>
            </h1>

            {/* Tags Row */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {isVeg ? 'Vegetarian' : 'Non-Veg'}
              </span>

              <span className="inline-flex items-center gap-1 bg-rose-950/80 border border-rose-800/60 text-rose-300 px-3 py-1 rounded-full text-xs font-bold">
                <span>🌸</span>
                <span className="capitalize">{tiffin.mealType || 'Breakfast'}</span>
              </span>

              <span className="inline-flex items-center gap-1 bg-orange-950/80 border border-orange-800/60 text-orange-400 px-3 py-1 rounded-full text-xs font-bold">
                <span>🟧</span>
                <span>Healthy</span>
              </span>
            </div>

            {/* Chef / Kitchen Info */}
            <div className="flex items-center gap-3 mb-6 bg-[#181A24] p-3 rounded-2xl border border-[rgba(255,255,255,0.06)] self-start max-w-sm">
              <img
                src={
                  tiffin.partner?.logo ||
                  'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80'
                }
                alt={partnerName}
                className="w-10 h-10 rounded-full object-cover border border-primary-500/40 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <span>by {partnerName}</span>
                  <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xs text-[#B5B8C5]/60 font-medium">
                  Verified Kitchen • 2.5K+ Orders
                </div>
              </div>
            </div>

            {/* Rating & Meta Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#B5B8C5] mb-6">
              <div className="flex items-center gap-1 text-white font-bold">
                <StarIcon className="w-4 h-4 text-amber-400" />
                <span>{Number(ratingVal).toFixed(1)}</span>
                <span className="text-[#B5B8C5]/60 font-normal">({ratingCount} reviews)</span>
              </div>
              <span className="text-[#B5B8C5]/40">•</span>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4 text-primary-500" />
                <span>{prepTime}</span>
              </div>
              <span className="text-[#B5B8C5]/40">•</span>
              <div className="flex items-center gap-1 text-emerald-400 font-medium">
                <TruckIcon className="w-4 h-4" />
                <span>Free Delivery</span>
              </div>
            </div>

            {/* Starting Price & Quick CTA Bar */}
            <div className="flex items-center gap-4 pt-2">
              <div>
                <span className="block text-[11px] text-[#B5B8C5]/60 font-medium">
                  Starting from
                </span>
                <div className="flex items-baseline">
                  <span className="text-white text-3xl font-black">₹{dailyPrice}</span>
                  <span className="text-[#B5B8C5]/60 text-xs font-semibold ml-1">/day</span>
                </div>
              </div>

              <motion.button
                onClick={onSubscribe}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#FF5216] hover:bg-[#E04410] text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-lg shadow-[#FF5216]/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Subscribe Now</span>
                <span>→</span>
              </motion.button>

              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-3 rounded-xl bg-[#181A24] border border-[rgba(255,255,255,0.08)] hover:bg-[#202330] text-white transition-colors cursor-pointer"
              >
                {isFavorite ? (
                  <HeartSolid className="w-5 h-5 text-rose-500" />
                ) : (
                  <HeartOutline className="w-5 h-5 text-[#B5B8C5]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Image & Thumbnail Carousel */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Main Large Hero Image Box */}
          <div className="relative h-72 md:h-80 rounded-3xl overflow-hidden bg-[#181A24] border border-[rgba(255,255,255,0.08)] shadow-2xl group">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={tiffin.title || 'Food Dish'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Thumbnail Carousel Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevImage}
              className="p-2 rounded-xl bg-[#181A24] border border-[rgba(255,255,255,0.08)] text-[#B5B8C5] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-4 gap-3 flex-1">
              {images.slice(0, 4).map((img, idx) => {
                const isSelected = selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-16 md:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF5216] shadow-lg shadow-[#FF5216]/30 scale-105'
                        : 'border-[rgba(255,255,255,0.1)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextImage}
              className="p-2 rounded-xl bg-[#181A24] border border-[rgba(255,255,255,0.08)] text-[#B5B8C5] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiffinHero;
