import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

const PLAN_META = [
  { key: 'daily', title: 'Daily', desc: '1 day plan' },
  { key: 'weekly', title: 'Weekly', desc: '7 day plan' },
  { key: 'monthly', title: 'Monthly', desc: '30 day plan' },
];

const TiffinPricingCard = ({
  daily,
  planPrice = {},
  planOriginal = {},
  selectedPlan = 'weekly',
  onSelectPlan,
  gstAmount,
  grandTotal,
  hasCartItem,
  onSubscribe,
  onViewCart,
}) => {
  // Discount % is derived from real effective vs original pricing — never hardcoded.
  const plans = PLAN_META.map((meta) => {
    const price = planPrice[meta.key];
    const original = planOriginal[meta.key];
    const discount =
      original && price && original > price ? Math.round((1 - price / original) * 100) : 0;
    return { ...meta, price, original, discount };
  });

  return (
    <div className="sticky top-24 bg-surface border border-neutral-100 rounded-3xl overflow-hidden shadow-card-hover">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-5 text-on-brand">
        <span className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-0.5">
          Starting from
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black">₹{daily}</span>
          <span className="text-sm font-semibold opacity-90">/day</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Choose a Plan Section */}
        <div>
          <h3 className="text-sm font-bold text-neutral-900 mb-3">Choose a Plan</h3>
          <div className="space-y-2.5">
            {plans.map((p) => {
              const isSelected = selectedPlan === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => onSelectPlan && onSelectPlan(p.key)}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/10 shadow-card shadow-primary-500/20'
                      : 'border-neutral-100 bg-surface-alt hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio Dot */}
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-primary-500 bg-primary-500' : 'border-neutral-300/40'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900">{p.title}</span>
                        {p.discount > 0 && (
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            {p.discount}% OFF
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500 font-medium">{p.desc}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {p.original > p.price && (
                      <span className="block text-[11px] text-neutral-500 line-through">
                        ₹{p.original}
                      </span>
                    )}
                    <span className="text-neutral-900 text-base font-extrabold">₹{p.price}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-2 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-neutral-900 font-semibold">₹{planPrice[selectedPlan]}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span className="text-neutral-900 font-semibold">₹{gstAmount}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-neutral-100">
            <span>Total</span>
            <span className="text-brand-ink text-lg font-black">₹{grandTotal}</span>
          </div>
        </div>

        {/* Subscribe CTA Button */}
        <motion.button
          onClick={onSubscribe}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary-500 hover:bg-primary-600 text-on-brand font-bold py-3.5 rounded-xl text-sm shadow-card shadow-primary-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Subscribe Now</span>
          <span>→</span>
        </motion.button>

        {hasCartItem && (
          <motion.button
            onClick={onViewCart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-surface-alt border border-brand-border text-brand-ink hover:text-neutral-900 hover:bg-primary-500 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            <span>View Cart (1 item)</span>
          </motion.button>
        )}

        {/* Perks Checklist */}
        <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">🌿</span>
            <span>Freshly prepared daily</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-brand-ink">🚚</span>
            <span>Free delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🔄</span>
            <span>Cancel or pause anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">💵</span>
            <span>Pay on delivery (COD)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiffinPricingCard;
