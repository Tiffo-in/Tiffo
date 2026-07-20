import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';

import DiscountManager from './DiscountManager';

const HOW_IT_WORKS = [
  {
    icon: '🏷️',
    title: 'Set your offer',
    desc: 'Slide to choose % off for weekly and monthly plans (up to 70%).',
  },
  {
    icon: '✅',
    title: 'Toggle active',
    desc: 'Flip the switch to make the discount live instantly for browsing customers.',
  },
  {
    icon: '💰',
    title: 'Savings at checkout',
    desc: 'Customers see the original price crossed out and their savings amount automatically.',
  },
];

/* Pricing & Discounts tab: per-tiffin discount managers + explainer. */
const PricingDiscountsTab = ({ tiffins, loading, onRefresh, onCreateFirst }) => (
  <motion.div
    key="pricing"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="space-y-8"
  >
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
      <span className="text-3xl shrink-0">🏷️</span>
      <div>
        <h3 className="font-bold text-amber-900 text-lg">Discount Manager</h3>
        <p className="text-amber-700 text-sm mt-1">
          Set weekly and monthly subscription discounts per tiffin. Active discounts appear on the
          tiffin listing and are automatically applied at checkout — customers see their savings in
          real-time.
        </p>
      </div>
    </div>

    {loading ? (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Loading your tiffins...</p>
        </div>
      </div>
    ) : tiffins.length === 0 ? (
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-12 text-center">
        <div className="text-6xl mb-4">🍱</div>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">No tiffins yet</h3>
        <p className="text-neutral-500 mb-6">
          Create a tiffin listing first, then come back here to manage discounts.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateFirst}
          className="btn-primary"
        >
          <PlusIcon className="w-5 h-5 inline mr-2" /> Create Your First Tiffin
        </motion.button>
      </div>
    ) : (
      <>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">Your Tiffins ({tiffins.length})</h2>
          <button
            type="button"
            onClick={onRefresh}
            className="text-sm text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiffins.map((tiffin) => (
            <motion.div key={tiffin._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <DiscountManager tiffin={tiffin} onSaved={onRefresh} />
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6">
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary-500" /> How Discounts Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.title} className="bg-neutral-50 rounded-xl p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-semibold text-neutral-900 mb-1">{item.title}</div>
                <div className="text-neutral-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </>
    )}
  </motion.div>
);

export default PricingDiscountsTab;
