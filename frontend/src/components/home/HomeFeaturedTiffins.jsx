import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import TiffinCard from '../TiffinCard';
import LoadingSpinner from '../LoadingSpinner';

// Transform-only reveals — see HomeFeatures.jsx for why opacity is never gated.
const HomeFeaturedTiffins = ({ tiffins, isLoading }) => (
  <section className="py-32 bg-neutral-50 dark:bg-neutral-950 border-y border-neutral-200/50 dark:border-neutral-800/50 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <motion.div initial={{ x: -20 }} whileInView={{ x: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-4 tracking-tight">
            Featured <span className="text-primary-600">Tiffins</span>
          </h2>
          <p className="text-xl text-neutral-500 dark:text-neutral-400 font-medium">
            Discover top-rated tiffin services loved by our customers
          </p>
        </motion.div>
        <motion.div initial={{ x: 20 }} whileInView={{ x: 0 }} viewport={{ once: true }}>
          <Link
            to="/tiffins"
            className="group inline-flex items-center gap-2 text-lg font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors bg-primary-50 dark:bg-primary-900/20 px-6 py-3 rounded-xl"
          >
            View All Catalog
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiffins.map((tiffin, index) => (
            <motion.div
              key={tiffin._id}
              initial={{ y: 30 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="h-full"
            >
              <TiffinCard tiffin={tiffin} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </section>
);

export default HomeFeaturedTiffins;
