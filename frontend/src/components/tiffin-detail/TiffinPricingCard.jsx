import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

const TiffinPricingCard = ({
  tiffin,
  daily = 70,
  planPrice = { daily: 70, weekly: 431, monthly: 2100 },
  planOriginal = { daily: 70, weekly: 490, monthly: 2400 },
  selectedPlan = 'weekly',
  onSelectPlan,
  gstAmount = 22,
  grandTotal = 453,
  hasCartItem,
  onSubscribe,
  onViewCart,
}) => {
  const plans = [
    {
      key: 'daily',
      title: 'Daily',
      desc: '1 day plan',
      price: planPrice.daily || daily,
      original: planOriginal.daily,
      discount: 0,
    },
    {
      key: 'weekly',
      title: 'Weekly',
      desc: '7 day plan',
      price: planPrice.weekly || 431,
      original: planOriginal.weekly || 490,
      discount: 14,
    },
    {
      key: 'monthly',
      title: 'Monthly',
      desc: '30 day plan',
      price: planPrice.monthly || 2100,
      original: planOriginal.monthly || 2400,
      discount: 12,
    },
  ];

  return (
    <div className="sticky top-24 bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-3xl overflow-hidden shadow-2xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-[#FF5216] p-5 text-white">
        <span className="block text-xs font-medium text-white/80 uppercase tracking-wider mb-0.5">
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
          <h3 className="text-sm font-bold text-white mb-3">Choose a Plan</h3>
          <div className="space-y-2.5">
            {plans.map((p) => {
              const isSelected = selectedPlan === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => onSelectPlan && onSelectPlan(p.key)}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#FF5216] bg-[#FF5216]/10 shadow-lg shadow-[#FF5216]/20'
                      : 'border-[rgba(255,255,255,0.08)] bg-[#12141D] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio Dot */}
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#FF5216] bg-[#FF5216]' : 'border-[#B5B8C5]/40'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{p.title}</span>
                        {p.discount > 0 && (
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            {p.discount}% OFF
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#B5B8C5]/60 font-medium">{p.desc}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {p.original > p.price && (
                      <span className="block text-[11px] text-[#B5B8C5]/50 line-through">
                        ₹{p.original}
                      </span>
                    )}
                    <span className="text-white text-base font-extrabold">₹{p.price}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-2 pt-3 border-t border-[rgba(255,255,255,0.06)] text-xs text-[#B5B8C5]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-white font-semibold">₹{planPrice[selectedPlan] || 431}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span className="text-white font-semibold">₹{gstAmount}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <span>Total</span>
            <span className="text-[#FF5216] text-lg font-black">₹{grandTotal}</span>
          </div>
        </div>

        {/* Subscribe CTA Button */}
        <motion.button
          onClick={onSubscribe}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#FF5216] hover:bg-[#E04410] text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-[#FF5216]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Subscribe Now</span>
          <span>→</span>
        </motion.button>

        {hasCartItem && (
          <motion.button
            onClick={onViewCart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#12141D] border border-primary-500/50 text-primary-500 hover:text-white hover:bg-primary-500 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            <span>View Cart (1 item)</span>
          </motion.button>
        )}

        {/* Perks Checklist */}
        <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] space-y-2 text-xs text-[#B5B8C5]">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">🌿</span>
            <span>Freshly prepared daily</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary-500">🚚</span>
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
