import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

const TiffinHero = ({ tiffin, maxDiscount, onBack }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const heroImage = tiffin.images?.[0] || null;

  return (
    <div className="relative h-72 md:h-96 overflow-hidden bg-neutral-900">
      {heroImage ? (
        <>
          {!imageLoaded && <div className="absolute inset-0 skeleton" />}
          <img
            src={heroImage}
            alt={tiffin.title}
            onLoad={() => setImageLoaded(true)}
            className="w-full h-full object-cover"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '28px 28px',
              color: '#ffffff',
            }}
          />
          <div className="text-white/20 text-8xl md:text-9xl font-bold select-none">🍱</div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      <button
        onClick={onBack}
        className="absolute top-[110px] left-4 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
      >
        ← Back
      </button>

      {maxDiscount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-[110px] right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg"
        >
          🏷️ Up to {maxDiscount}% OFF
        </motion.div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl border-4 border-white/90 bg-white dark:bg-neutral-800 overflow-hidden flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-105">
                {tiffin.partner?.logo ? (
                  <img
                    src={tiffin.partner.logo}
                    alt={tiffin.partner.businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-neutral-800 dark:text-white select-none">
                    {(tiffin.partner?.businessName?.[0] || 'T').toUpperCase()}
                  </span>
                )}
              </div>
              {tiffin.partner?.verified && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-800 rounded-full p-0.5 shadow-md">
                  <CheckBadgeIcon className="h-6 w-6 text-blue-500 fill-current" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold mb-1.5 drop-shadow-md tracking-tight">
                {tiffin.title}
              </h1>
              <p className="text-white/95 text-sm font-semibold flex items-center gap-1.5 drop-shadow-sm">
                <MapPinIcon className="h-4.5 w-4.5 text-primary-400 fill-current" />
                by {tiffin.partner?.businessName || 'Partner'}
                {tiffin.partner?.verified && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90 border border-blue-400/30 flex items-center gap-0.5">
                    Verified
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="bg-green-600 text-white px-3 py-2 rounded-xl flex items-center gap-1 shadow-lg shrink-0">
            <StarIcon className="h-4 w-4" />
            <span className="font-bold text-lg leading-none">
              {tiffin.rating?.average?.toFixed(1) || '4.0'}
            </span>
            <span className="text-white/70 text-xs font-semibold">({tiffin.rating?.count || 0})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiffinHero;
