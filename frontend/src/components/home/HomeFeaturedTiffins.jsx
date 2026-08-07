import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../LoadingSpinner';
import TiffinCard from '../TiffinCard';

// Sample popular tiffins for display when API tiffins aren't available
const popularTiffins = [
  {
    _id: 'p1',
    name: 'South Indian Lunch Combo',
    description: 'Sambar rice, avial, 2 veg sabzi, rasam, curd & pickle',
    price: 120,
    rating: 4.9,
    reviewCount: 234,
    isVeg: true,
    image: '/south.jpeg',
    tag: 'Free Delivery',
    partner: { name: 'Annapurna Kitchen' },
  },
  {
    _id: 'p2',
    name: 'Chicken Dinner Special',
    description: 'Chicken curry, dal, 2 sabzi, steam rice, roti & salad',
    price: 160,
    rating: 4.8,
    reviewCount: 189,
    isVeg: false,
    image: '/north.jpeg',
    tag: 'Free Delivery',
    partner: { name: 'Spice House' },
  },
  {
    _id: 'p3',
    name: 'Idli & Dosa Breakfast',
    description: '4 idli or 2 masala dosa with chutney & sambar',
    price: 80,
    rating: 4.8,
    reviewCount: 112,
    isVeg: true,
    image: '/tiffin.jpeg',
    tag: 'Free Delivery',
    partner: { name: 'Dosa Wala' },
  },
  {
    _id: 'p4',
    name: 'Punjabi Lunch Thali',
    description: 'Dal makhani, paneer, 2 sabzi, roti, salad, pickle & rice',
    price: 130,
    rating: 4.7,
    reviewCount: 98,
    isVeg: true,
    image: '/north.jpeg',
    tag: 'Free Delivery',
    partner: { name: 'Sardar Ji Tiffin' },
  },
  {
    _id: 'p5',
    name: 'Rajasthani Dal Baati',
    description: 'Dal, baati, churma, gatte ki sabzi, pickle & salad',
    price: 120,
    rating: 4.9,
    reviewCount: 67,
    isVeg: false,
    image: '/south.jpeg',
    tag: 'Free Delivery',
    partner: { name: 'Marwari Rasoi' },
  },
  {
    _id: 'p6',
    name: 'Vegan Dinner Bowl',
    description: 'Millet khichdi, dal, roasted veggies, salad & curd',
    price: 140,
    rating: 4.8,
    reviewCount: 145,
    isVeg: true,
    image: '/tiffin.jpeg',
    tag: 'Free Delivery',
    partner: { name: 'Green Bowl Kitchen' },
  },
];

const VISIBLE_COUNT = 5;

const ratingOf = (t) => (typeof t.rating === 'number' ? t.rating : (t.rating?.average ?? null));

const HomeFeaturedTiffins = ({ tiffins, isLoading }) => {
  const displayTiffins = (tiffins && tiffins.length > 0 ? tiffins : popularTiffins).slice(
    0,
    VISIBLE_COUNT
  );

  // Highlight the best-rated card rather than a fixed slot, so the emphasis is
  // driven by real data instead of position.
  const featuredIndex = displayTiffins.reduce(
    (best, t, i) => ((ratingOf(t) ?? -1) > (ratingOf(displayTiffins[best]) ?? -1) ? i : best),
    0
  );

  return (
    <section className="py-20 bg-surface-page relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-10 rounded-full bg-brand-tint flex items-center justify-center shrink-0">
                <StarIcon className="w-5 h-5 text-brand" />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
                Popular <span className="text-primary-600">Tiffins</span>
              </h2>
            </div>
            <p className="text-neutral-600 text-sm">Top-rated meals from our verified kitchens</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              to="/tiffins"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-border px-5 py-2.5 text-sm font-bold text-brand-ink hover:bg-brand-tint hover:border-brand transition-colors group"
            >
              View All Meals
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          // lg:pt-7 leaves room for the featured card, which grows upward by
          // its ribbon's height so all five images stay on one line.
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch lg:pt-7">
            {displayTiffins.map((tiffin, index) => (
              <motion.div
                key={tiffin._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="h-full"
              >
                <TiffinCard
                  tiffin={tiffin}
                  featured={index === featuredIndex && ratingOf(tiffin) != null}
                  featuredLabel="Top Rated"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeFeaturedTiffins;
