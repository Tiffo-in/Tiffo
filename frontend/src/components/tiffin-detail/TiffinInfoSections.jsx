import React, { useEffect, useState } from 'react';
import { StarIcon, CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';

import api from '../../services/api';

const FEATURE_PILLS = [
  { emoji: '🍳', label: 'Freshly Prepared' },
  { emoji: '🧺', label: 'Hygienic Kitchen' },
  { emoji: '🚫', label: 'No Preservatives Added' },
  { emoji: '🥗', label: 'Balanced Nutrition' },
];

const NUTRITION_FIELDS = [
  { key: 'calories', label: 'Calories', suffix: '', color: 'text-primary-500' },
  { key: 'protein', label: 'Protein', suffix: 'g', color: 'text-blue-400' },
  { key: 'carbs', label: 'Carbs', suffix: 'g', color: 'text-amber-400' },
  { key: 'fat', label: 'Fat', suffix: 'g', color: 'text-rose-500' },
];

const relativeDate = (iso) => {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const TiffinInfoSections = ({ tiffin }) => {
  const menuItems = tiffin.menuItems || [];
  const nutrition = tiffin.nutritionInfo || {};
  const nutritionFields = NUTRITION_FIELDS.filter((f) => nutrition[f.key] != null);
  const availableDays = tiffin.availability?.days || [];
  const deliveryRadius = tiffin.partner?.deliveryRadius;
  const rating = tiffin.rating || {};

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!tiffin?._id) return;
    let cancelled = false;
    api
      .get(`/reviews/tiffin/${tiffin._id}`, { params: { limit: 6 } })
      .then((res) => !cancelled && setReviews(res.data?.reviews || []))
      .catch(() => !cancelled && setReviews([]));
    return () => {
      cancelled = true;
    };
  }, [tiffin?._id]);

  return (
    <div className="space-y-6">
      {/* 1. ABOUT THIS TIFFIN */}
      <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span>👨‍🍳</span>
          <span>About This Tiffin</span>
        </h2>

        {tiffin.description && (
          <p className="text-[#B5B8C5] text-sm leading-relaxed mb-6">{tiffin.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURE_PILLS.map((pill) => (
            <div
              key={pill.label}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#12141D] border border-[rgba(255,255,255,0.04)] text-xs text-[#B5B8C5]"
            >
              <span className="text-base text-primary-500">{pill.emoji}</span>
              <span className="font-semibold text-white">{pill.label}</span>
            </div>
          ))}
        </div>

        {availableDays.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-2 text-xs text-[#B5B8C5]">
            <CalendarDaysIcon className="w-4 h-4 text-primary-500" />
            <span>Available on: </span>
            <span className="font-bold text-primary-500 capitalize">
              {availableDays.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* 2. WHAT'S INSIDE (menu) */}
      <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>🍱</span>
          <span>What's Inside</span>
        </h2>

        {menuItems.length === 0 ? (
          <p className="text-sm text-[#B5B8C5]/60">The kitchen hasn't listed the menu items yet.</p>
        ) : (
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {menuItems.map((item, idx) => (
              <div
                key={item._id || idx}
                className="flex flex-col items-center gap-2 shrink-0 bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-3 rounded-2xl w-28 text-center"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border border-primary-500/30 shrink-0 flex items-center justify-center bg-[#181A24]">
                  {item.image || item.img ? (
                    <img
                      src={item.image || item.img}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">🍽️</span>
                  )}
                </div>
                <span className="text-xs font-semibold text-white leading-tight line-clamp-2">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. NUTRITION — only when the partner has provided it */}
      {nutritionFields.length > 0 && (
        <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">Nutrition Info (Approx.)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nutritionFields.map((f) => (
              <div
                key={f.key}
                className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl text-center"
              >
                <div className={`text-2xl font-black ${f.color}`}>
                  {nutrition[f.key]}
                  {f.suffix}
                </div>
                <div className="text-xs text-[#B5B8C5]/60 font-medium">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DELIVERY & AVAILABILITY — real fields only */}
      {(availableDays.length > 0 || deliveryRadius) && (
        <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">Delivery & Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDays.length > 0 && (
              <div className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500">
                  <CalendarDaysIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#B5B8C5]/60 font-medium">Available Days</div>
                  <div className="text-sm font-bold text-white capitalize">
                    {availableDays.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {deliveryRadius && (
              <div className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#B5B8C5]/60 font-medium">Delivery Radius</div>
                  <div className="text-sm font-bold text-white">Within {deliveryRadius} km</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CUSTOMER REVIEWS — real data */}
      <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-white">Customer Reviews</h2>
          {rating.count > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-white bg-[#12141D] px-2.5 py-1 rounded-lg border border-[rgba(255,255,255,0.06)]">
              <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{Number(rating.average).toFixed(1)}</span>
              <span className="text-[#B5B8C5]/60 font-normal">
                ({rating.count} review{rating.count === 1 ? '' : 's'})
              </span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-[#B5B8C5]/60">
            No reviews yet — be the first to review this tiffin after your first delivery.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center text-xs font-black shrink-0">
                    {(rev.user?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {rev.user?.name || 'Anonymous'}
                    </div>
                    <div className="text-[10px] text-[#B5B8C5]/50">
                      {relativeDate(rev.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                  {[...Array(Math.round(rev.rating || 0))].map((_, i) => (
                    <StarIcon key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>

                {rev.comment && (
                  <p className="text-xs text-[#B5B8C5] leading-relaxed line-clamp-4">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TiffinInfoSections;
