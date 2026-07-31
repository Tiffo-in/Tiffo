import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

// Skeletons preserve the card footprint so the grid doesn't jump when data lands.
const CardSkeleton = () => (
  <div className="bg-[#1B1E27] rounded-2xl overflow-hidden flex flex-col min-w-[180px] animate-pulse">
    <div className="h-44 bg-white/5" />
    <div className="p-4 flex flex-col gap-3">
      <div className="h-4 bg-white/5 rounded w-3/4" />
      <div className="h-3 bg-white/5 rounded w-full" />
      <div className="h-3 bg-white/5 rounded w-2/3" />
      <div className="h-6 bg-white/5 rounded w-1/3 mt-1" />
      <div className="h-10 bg-white/5 rounded-xl mt-1" />
    </div>
  </div>
);

// Compact tiffin card matching the reference design
const PopularCard = ({ tiffin, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
    whileHover={{ y: -6 }}
    className="bg-[#1B1E27] rounded-2xl overflow-hidden group hover:ring-1 hover:ring-primary-500/40 transition-all duration-300 flex flex-col min-w-[180px]"
  >
    {/* Image */}
    <div className="relative h-44 overflow-hidden">
      <img
        src={tiffin.image || '/tiffin.jpeg'}
        alt={tiffin.name}
        width={400}
        height={176}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Veg/Non-veg pill badge — dark text; white on either fill fails contrast */}
      <div
        className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg ${
          tiffin.isVeg ? 'bg-[#2ECC71] text-[#0F1016]' : 'bg-primary-500 text-[#0F1016]'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${tiffin.isVeg ? 'bg-green-900' : 'bg-orange-900'}`}
        />
        {tiffin.isVeg ? 'Veg' : 'Non-Veg'}
      </div>

      {/* Star rating badge — omitted entirely when a tiffin has no rating yet,
          rather than showing an invented default. */}
      {typeof tiffin.rating === 'number' && tiffin.rating > 0 && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-xl">
          <StarIcon className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <span className="text-white text-xs font-bold">{tiffin.rating.toFixed(1)}</span>
        </div>
      )}
    </div>

    {/* Content */}
    <div className="p-4 flex flex-col flex-1">
      <h3 className="text-white font-bold text-sm leading-snug mb-1.5 group-hover:text-primary-500 transition-colors line-clamp-1">
        {tiffin.name}
      </h3>
      <p className="text-[#B5B8C5]/70 text-xs leading-relaxed mb-4 flex-1 line-clamp-2">
        {tiffin.description}
      </p>

      {/* Price */}
      <div className="mb-1">
        <span className="text-white font-black text-xl">₹{tiffin.price}</span>
        <span className="text-[#B5B8C5]/70 text-xs">/day</span>
      </div>

      {/* Free Delivery tag */}
      <div className="flex items-center gap-1 mb-4">
        <span className="text-[#2ECC71] text-xs font-medium">Free Delivery</span>
      </div>

      {/* View Plans button */}
      <Link
        to={`/tiffins/${tiffin._id}`}
        className="w-full flex items-center justify-center bg-transparent hover:bg-primary-500 border border-primary-500 text-primary-500 hover:text-[#0F1016] text-xs font-bold px-4 min-h-[44px] rounded-xl transition-all duration-200"
      >
        View Plans
      </Link>
    </div>
  </motion.div>
);

const HomeFeaturedTiffins = ({ tiffins, isLoading, isError }) => {
  const displayTiffins = tiffins || [];

  return (
    <section className="py-20 bg-[#0F1016] relative">
      {/* Subtle divider glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-2">
              <h2 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight">
                Popular <span className="text-primary-500">Tiffins</span>
              </h2>
            </div>
            <p className="text-[#B5B8C5]/70 text-sm italic">
              Top-rated meals loved by our customers
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              to="/tiffins"
              className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-primary-500 hover:text-[#FF9F43] transition-colors group"
            >
              View All Meals
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </div>

        {/* Four states: loading, error, empty, and the real grid. Never a
            hardcoded stand-in — a fake menu is worse than an honest blank. */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1B1E27] px-6 py-12 text-center">
            <p className="text-white font-bold text-base">
              We couldn&apos;t load today&apos;s menu
            </p>
            <p className="text-[#B5B8C5]/70 text-sm mt-2 max-w-md mx-auto">
              Something went wrong at our end. Please refresh, or browse the full list of kitchens.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-5 min-h-[44px] bg-primary-500 hover:bg-[#FF9F43] text-[#0F1016] rounded-xl font-bold text-sm transition-colors"
              >
                Try again
              </button>
              <Link
                to="/tiffins"
                className="inline-flex items-center justify-center px-5 min-h-[44px] border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.06)] text-white rounded-xl font-bold text-sm transition-colors"
              >
                Browse all tiffins
              </Link>
            </div>
          </div>
        ) : displayTiffins.length === 0 ? (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1B1E27] px-6 py-12 text-center">
            <p className="text-white font-bold text-base">No tiffins listed yet</p>
            <p className="text-[#B5B8C5]/70 text-sm mt-2 max-w-md mx-auto">
              We&apos;re still onboarding kitchens in your area. Run a search to see what&apos;s
              available nearby, or register your own kitchen.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/tiffins"
                className="inline-flex items-center justify-center px-5 min-h-[44px] bg-primary-500 hover:bg-[#FF9F43] text-[#0F1016] rounded-xl font-bold text-sm transition-colors"
              >
                Search kitchens
              </Link>
              <Link
                to="/register?role=partner"
                className="inline-flex items-center justify-center px-5 min-h-[44px] border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.06)] text-white rounded-xl font-bold text-sm transition-colors"
              >
                Register your kitchen
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayTiffins.slice(0, 6).map((tiffin, index) => (
              <PopularCard
                key={tiffin._id}
                index={index}
                tiffin={{
                  ...tiffin,
                  name: tiffin.title || tiffin.name,
                  price: tiffin.price?.daily || tiffin.price || 0,
                  rating: tiffin.rating?.average ?? tiffin.rating ?? null,
                  isVeg:
                    tiffin.isVeg ||
                    tiffin.dietary?.some((d) => ['vegetarian', 'vegan'].includes(d.toLowerCase())),
                  image: tiffin.images?.[0] || tiffin.image || '/tiffin.jpeg',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeFeaturedTiffins;
