import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, HeartIcon, ClockIcon, FireIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

const MAX_VISIBLE_INGREDIENTS = 4;

/**
 * Veg / non-veg pill. The bright semantic color is the DOT; the label uses the
 * ink token — #2DBE60 on its own tint is only 2.4:1 and fails AA as text.
 */
const DietPill = ({ isVeg }) => (
  <span className={isVeg ? 'badge-veg' : 'badge-nonveg'}>
    <span
      className={`w-2 h-2 rounded-full shrink-0 ${isVeg ? 'bg-veg' : 'bg-nonveg'}`}
      aria-hidden="true"
    />
    {isVeg ? 'Veg' : 'Non-Veg'}
  </span>
);

const TiffinCard = React.memo(
  ({
    tiffin,
    showDistance = false,
    viewMode = 'grid',
    featured = false,
    // The reference mockup labels the highlighted card "Most Ordered", but no
    // order-volume data is exposed anywhere in the API. Callers pass a label
    // they can actually substantiate; the default reflects rating, which is.
    featuredLabel = 'Top Rated',
  }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    // Compute discount info
    const discount = tiffin.discount;
    const discountActive =
      discount?.isActive && (!discount.expiresAt || new Date() < new Date(discount.expiresAt));
    const maxDiscount = discountActive
      ? Math.max(discount.weekly || 0, discount.monthly || 0)
      : tiffin.discountPercentage || 0;

    const dailyPrice =
      typeof tiffin.price === 'object' ? tiffin.price?.daily || 0 : tiffin.price || 0;

    // `isVeg` is not a schema field — `dietary` is. Only trust isVeg if a
    // caller explicitly passed it.
    const isVeg =
      tiffin.isVeg !== undefined
        ? tiffin.isVeg
        : (tiffin.dietary?.some((d) => ['vegetarian', 'vegan'].includes(d.toLowerCase())) ?? true);

    const kitchenName = tiffin.partner?.businessName || tiffin.partner?.name || tiffin.kitchenName;

    // Everything below renders only when the API actually returned it. The
    // card previously defaulted to a 4.8 rating and a "25 min" prep time,
    // which invented data the backend never sent.
    const ratingVal =
      tiffin.rating?.average ?? (typeof tiffin.rating === 'number' ? tiffin.rating : null);
    const ratingCount = tiffin.rating?.count ?? null;
    const prepTime = tiffin.prepTime || tiffin.deliveryTime || null;
    const ingredients = Array.isArray(tiffin.ingredients) ? tiffin.ingredients : [];
    const imageSrc = tiffin.images?.[0] || tiffin.image || '/tiffin.jpeg';
    const title = tiffin.title || tiffin.name;
    const href = `/tiffins/${tiffin.slug || tiffin._id}`;

    const FavoriteButton = () => (
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsFavorite(!isFavorite);
        }}
        aria-label={isFavorite ? 'Remove from favourites' : 'Save to favourites'}
        aria-pressed={isFavorite}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-surface/95 backdrop-blur-sm shadow-card flex items-center justify-center transition-colors hover:bg-surface"
      >
        {isFavorite ? (
          <HeartIcon className="w-[18px] h-[18px] text-nonveg" />
        ) : (
          <HeartOutline className="w-[18px] h-[18px] text-neutral-600" />
        )}
      </button>
    );

    // Rating chip that overlaps the bottom edge of the image, per the reference.
    const RatingChip = () =>
      ratingVal == null ? null : (
        <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 bg-surface/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-card">
          <StarIcon className="w-3.5 h-3.5 text-rating" />
          <span className="text-xs font-bold text-neutral-900">{Number(ratingVal).toFixed(1)}</span>
          {ratingCount ? <span className="text-xs text-neutral-500">({ratingCount})</span> : null}
        </div>
      );

    if (viewMode === 'list') {
      return (
        <Link to={href} className="block">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-card overflow-hidden border border-neutral-100 hover:border-brand-border shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer group flex flex-col md:flex-row"
          >
            <div className="relative md:w-64 h-48 md:h-auto shrink-0 p-2">
              <div className="relative w-full h-full rounded-media overflow-hidden bg-surface-alt">
                <img
                  src={imageSrc}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute top-3 left-3 flex gap-2 z-10">
                <DietPill isVeg={isVeg} />
                {maxDiscount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-cta text-on-brand">
                    {maxDiscount}% OFF
                  </span>
                )}
              </div>
              <FavoriteButton />
              <RatingChip />
            </div>

            <div className="p-5 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-neutral-900 text-xl font-bold group-hover:text-brand-ink transition-colors">
                  {title}
                </h3>
                {kitchenName && <p className="text-sm text-neutral-500 mt-1">{kitchenName}</p>}
                {tiffin.description && (
                  <p className="text-neutral-600 text-sm line-clamp-2 mt-3">{tiffin.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100 gap-4">
                {prepTime && (
                  <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {prepTime}
                  </span>
                )}
                <div className="flex items-center gap-4 ml-auto">
                  <div className="flex items-baseline gap-1">
                    <span className="text-neutral-900 text-2xl font-black">₹{dailyPrice}</span>
                    <span className="text-neutral-500 text-xs">/day</span>
                  </div>
                  <span className="inline-flex items-center bg-transparent hover:bg-brand hover:text-on-brand text-brand-ink font-semibold py-2.5 px-5 text-sm rounded-xl transition-all duration-200 border border-brand">
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
      <Link to={href} className="block h-full">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative bg-surface rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer group flex flex-col h-full ${
            featured
              ? // The ribbon is in normal flow, so without this it would push
                // the featured card's image, rating and price ~28px below its
                // siblings' and break the row's alignment. Instead the card
                // grows upward by exactly the ribbon's height, so every card's
                // image starts on the same line and the featured one reads as
                // deliberately breaking the grid (as in the reference).
                'border-2 border-brand lg:-mt-7 lg:h-[calc(100%+1.75rem)]'
              : 'border border-neutral-100 hover:border-brand-border'
          }`}
          style={featured ? { background: 'var(--grad-featured)' } : undefined}
        >
          {featured && (
            <div className="bg-gradient-cta text-on-brand text-xs font-bold py-1.5 flex items-center justify-center gap-1.5 shrink-0">
              <FireIcon className="w-3.5 h-3.5" />
              {featuredLabel}
            </div>
          )}

          {/* Image, inset from the card edge with its own radius */}
          <div className="relative p-2">
            <div className="relative aspect-[4/3] rounded-media overflow-hidden bg-surface-alt">
              <img
                src={imageSrc}
                alt={title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
              <DietPill isVeg={isVeg} />
              {maxDiscount > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-cta text-on-brand">
                  {maxDiscount}% OFF
                </span>
              )}
            </div>

            <FavoriteButton />
            <RatingChip />
          </div>

          <div className="px-4 pb-4 pt-2 flex flex-col flex-1">
            {/* Two lines, always reserved. line-clamp-1 truncated real titles
                ("South Indian Lunch Combo" -> "South Indian Lunch…") and, since
                some titles wrap and others don't, left each card's price on a
                different baseline. */}
            <h3 className="text-neutral-900 text-base font-bold group-hover:text-brand-ink transition-colors line-clamp-2 min-h-[3rem]">
              {title}
            </h3>

            {/* Ingredient chips, capped with a +N overflow like the reference.
                Two rows are reserved so a one-row card doesn't sit its price
                higher than its neighbours'. */}
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1 min-h-[2.75rem] content-start">
                {ingredients.slice(0, MAX_VISIBLE_INGREDIENTS).map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded-full bg-surface-alt text-neutral-600 text-[11px] font-medium"
                  >
                    {item}
                  </span>
                ))}
                {ingredients.length > MAX_VISIBLE_INGREDIENTS && (
                  <span className="px-2 py-0.5 rounded-full bg-surface-alt text-neutral-500 text-[11px] font-medium">
                    +{ingredients.length - MAX_VISIBLE_INGREDIENTS}
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-1 mt-3">
              <span
                className={`text-[22px] font-black leading-none ${
                  featured ? 'text-brand-ink' : 'text-neutral-900'
                }`}
              >
                ₹{dailyPrice}
              </span>
              <span className="text-neutral-500 text-xs">/day</span>
            </div>

            {/* Meta row — only renders what the API actually returned */}
            {(prepTime || kitchenName || showDistance) && (
              <div className="flex items-center gap-2 mt-2 text-[11px] text-neutral-500">
                {prepTime && (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {prepTime}
                  </span>
                )}
                {prepTime && kitchenName && <span aria-hidden="true">·</span>}
                {kitchenName && <span className="line-clamp-1">{kitchenName}</span>}
                {showDistance && tiffin.distance != null && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{tiffin.distance} km</span>
                  </>
                )}
              </div>
            )}

            {/* CTA — outlined by default, filled only on the featured card, so
                one card per row carries the visual weight. `mt-auto` on the
                wrapper keeps CTAs on one baseline when sibling cards have
                different numbers of ingredient chips. */}
            <div className="mt-auto pt-4">
              <span
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  featured
                    ? 'bg-gradient-cta text-on-brand shadow-card group-hover:shadow-card-hover'
                    : 'border border-brand-border text-brand-ink group-hover:bg-brand-tint group-hover:border-brand'
                }`}
              >
                {featured ? 'Order Now' : 'Choose Plan'}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }
);

TiffinCard.displayName = 'TiffinCard';

export default TiffinCard;
