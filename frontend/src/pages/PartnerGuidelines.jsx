import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, HandThumbUpIcon, SparklesIcon } from '@heroicons/react/24/outline';

const PartnerGuidelines = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-neutral-50 dark:bg-neutral-950">
      <Helmet>
        <title>Partner Guidelines | Tiffo</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 shadow-xl border border-neutral-100 dark:border-neutral-800"
        >
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-4">
              Partner <span className="text-primary-500">Guidelines</span>
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Welcome to the Tiffo family! To maintain the highest quality standards, we require all
              our partners to adhere to the following guidelines.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="mt-1 shrink-0 bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full">
                <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  1. Food Quality & Freshness
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  All meals must be prepared using fresh, high-quality ingredients. No stale or
                  reheated food from previous days is allowed. Taste should be authentic and
                  strictly homemade.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 shrink-0 bg-secondary-100 dark:bg-secondary-900/30 p-3 rounded-full">
                <ShieldCheckIcon className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  2. Hygiene Standards
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Kitchens must be kept clean at all times. Chefs must wear hairnets and gloves
                  during food preparation. Containers used for packaging must be food-grade and
                  securely sealed.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 shrink-0 bg-pink-100 dark:bg-pink-900/30 p-3 rounded-full">
                <HandThumbUpIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  3. Timely Delivery
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Meals must be prepared and ready for dispatch or delivery according to the
                  customer's selected time slot. Delays affect customer experience and may result in
                  penalties.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerGuidelines;
