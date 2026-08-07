import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
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

const TiffinHero = ({ tiffin, onBack, onSubscribe }) => {
  const images = tiffin.images && tiffin.images.length > 0 ? tiffin.images : [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const titleParts = (tiffin.title || tiffin.name || 'Tiffin').split(' ');
  const mainTitle = titleParts[0];
  const highlightedTitle = titleParts.slice(1).join(' ');

  const partnerName = tiffin.partner?.businessName || tiffin.partner?.name || 'Partner Kitchen';
  const dailyPrice = typeof tiffin.price === 'object' ? tiffin.price?.daily : tiffin.price;
  const ratingCount = tiffin.rating?.count ?? 0;
  const ratingVal = tiffin.rating?.average;
  const isVeg = tiffin.dietary?.includes('veg') ?? tiffin.isVeg;
  const isVerified = Boolean(tiffin.partner?.verified);

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
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
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
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight mb-4 leading-tight">
              {mainTitle} <span className="text-primary-600">{highlightedTitle}</span>
            </h1>

            {/* Tags Row — driven by real tiffin fields */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {isVeg !== undefined && (
                <span className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {isVeg ? 'Vegetarian' : 'Non-Veg'}
                </span>
              )}

              {tiffin.mealType && (
                <span className="inline-flex items-center gap-1 bg-rose-950/80 border border-rose-800/60 text-rose-300 px-3 py-1 rounded-full text-xs font-bold">
                  <span>🍽️</span>
                  <span className="capitalize">{tiffin.mealType}</span>
                </span>
              )}

              {tiffin.cuisine && (
                <span className="inline-flex items-center gap-1 bg-orange-950/80 border border-orange-800/60 text-orange-400 px-3 py-1 rounded-full text-xs font-bold">
                  <span>🟧</span>
                  <span>{tiffin.cuisine}</span>
                </span>
              )}
            </div>

            {/* Chef / Kitchen Info */}
            <div className="flex items-center gap-3 mb-6 bg-surface p-3 rounded-2xl border border-neutral-100 self-start max-w-sm">
              {tiffin.partner?.logo ? (
                <img
                  src={tiffin.partner.logo}
                  alt={partnerName}
                  className="w-10 h-10 rounded-full object-cover border border-brand-border shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-tint border border-brand-border shrink-0 flex items-center justify-center text-sm font-black text-brand-ink">
                  {partnerName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-900">
                  <span>by {partnerName}</span>
                  {isVerified && <CheckBadgeIcon className="w-4 h-4 text-blue-500" />}
                </div>
                {isVerified && (
                  <div className="text-xs text-neutral-500 font-medium">Verified Kitchen</div>
                )}
              </div>
            </div>

            {/* Rating & Meta Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 mb-6">
              <div className="flex items-center gap-1 text-neutral-900 font-bold">
                <StarIcon className="w-4 h-4 text-rating" />
                {ratingCount > 0 ? (
                  <>
                    <span>{Number(ratingVal).toFixed(1)}</span>
                    <span className="text-neutral-500 font-normal">
                      ({ratingCount} review{ratingCount === 1 ? '' : 's'})
                    </span>
                  </>
                ) : (
                  <span className="text-neutral-500 font-normal">New</span>
                )}
              </div>
              <span className="text-neutral-400">•</span>
              <div className="flex items-center gap-1 text-emerald-400 font-medium">
                <TruckIcon className="w-4 h-4" />
                <span>Free Delivery</span>
              </div>
            </div>

            {/* Starting Price & Quick CTA Bar */}
            <div className="flex items-center gap-4 pt-2">
              <div>
                <span className="block text-[11px] text-neutral-500 font-medium">
                  Starting from
                </span>
                <div className="flex items-baseline">
                  <span className="text-neutral-900 text-3xl font-black">₹{dailyPrice}</span>
                  <span className="text-neutral-500 text-xs font-semibold ml-1">/day</span>
                </div>
              </div>

              <motion.button
                onClick={onSubscribe}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-primary-500 hover:bg-primary-600 text-on-brand font-bold px-6 py-3.5 rounded-xl text-sm shadow-card shadow-primary-500/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Subscribe Now</span>
                <span>→</span>
              </motion.button>

              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-3 rounded-xl bg-surface border border-neutral-100 hover:bg-surface-alt text-neutral-900 transition-colors cursor-pointer"
              >
                {isFavorite ? (
                  <HeartSolid className="w-5 h-5 text-rose-500" />
                ) : (
                  <HeartOutline className="w-5 h-5 text-neutral-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Image & Thumbnail Carousel */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Main Large Hero Image Box */}
          <div className="relative h-72 md:h-80 rounded-3xl overflow-hidden bg-surface border border-neutral-100 shadow-card-hover group flex items-center justify-center">
            {images.length > 0 ? (
              <>
                <img
                  src={images[selectedImageIndex] || images[0]}
                  alt={tiffin.title || 'Food dish'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </>
            ) : (
              <span className="text-7xl opacity-30 select-none">🍱</span>
            )}
          </div>

          {/* Thumbnail Carousel Controls — only when there are multiple images */}
          {images.length > 1 && (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrevImage}
                className="p-2 rounded-xl bg-surface border border-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
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
                          ? 'border-primary-500 shadow-card shadow-primary-500/30 scale-105'
                          : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextImage}
                className="p-2 rounded-xl bg-surface border border-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TiffinHero;
