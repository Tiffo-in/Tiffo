import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../LoadingSpinner';

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
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Veg/Non-veg pill badge */}
      <div
        className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg ${
          tiffin.isVeg ? 'bg-[#2ECC71] text-white' : 'bg-primary-500 text-white'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${tiffin.isVeg ? 'bg-green-300' : 'bg-orange-300'}`}
        />
        {tiffin.isVeg ? 'Veg' : 'Non-Veg'}
      </div>

      {/* Star rating badge - bottom left of image */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
        <StarIcon className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-white text-xs font-bold">{tiffin.rating?.toFixed(1) || '4.5'}</span>
      </div>
    </div>

    {/* Content */}
    <div className="p-4 flex flex-col flex-1">
      <h3 className="text-white font-bold text-[15px] leading-snug mb-1.5 group-hover:text-primary-500 transition-colors line-clamp-1">
        {tiffin.name}
      </h3>
      <p className="text-[#B5B8C5]/60 text-xs leading-relaxed mb-4 flex-1 line-clamp-2">
        {tiffin.description}
      </p>

      {/* Price */}
      <div className="mb-1">
        <span className="text-white font-black text-xl">₹{tiffin.price}</span>
        <span className="text-[#B5B8C5]/50 text-xs">/day</span>
      </div>

      {/* Free Delivery tag */}
      <div className="flex items-center gap-1 mb-4">
        <span className="text-[#2ECC71] text-[11px] font-medium">Free Delivery</span>
      </div>

      {/* View Plans button */}
      <Link
        to={`/tiffins/${tiffin._id}`}
        className="w-full block text-center bg-transparent hover:bg-primary-500 border border-primary-500 text-primary-500 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200"
      >
        View Plans
      </Link>
    </div>
  </motion.div>
);

const HomeFeaturedTiffins = ({ tiffins, isLoading }) => {
  const displayTiffins = tiffins && tiffins.length > 0 ? tiffins : popularTiffins;

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
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Popular <span className="text-primary-500">Tiffins</span>
              </h2>
            </div>
            <p className="text-[#B5B8C5]/60 text-sm italic">
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
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-500 hover:text-[#FF9F43] transition-colors group"
            >
              View All Meals
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </div>

        {/* Horizontal scrollable grid of 6 cards */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {displayTiffins.slice(0, 6).map((tiffin, index) =>
              tiffin._id?.startsWith('p') ? (
                <PopularCard key={tiffin._id} tiffin={tiffin} index={index} />
              ) : (
                <motion.div
                  key={tiffin._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <PopularCard
                    tiffin={{
                      ...tiffin,
                      name: tiffin.title || tiffin.name,
                      price: tiffin.price?.daily || tiffin.price || 0,
                      rating: tiffin.rating?.average || tiffin.rating || 4.5,
                      isVeg:
                        tiffin.isVeg ||
                        tiffin.dietary?.some((d) =>
                          ['vegetarian', 'vegan'].includes(d.toLowerCase())
                        ),
                      image: tiffin.images?.[0] || tiffin.image || '/tiffin.jpeg',
                      tag: 'Free Delivery',
                    }}
                    index={index}
                  />
                </motion.div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeFeaturedTiffins;
