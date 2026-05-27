import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-neutral-50 dark:bg-neutral-950">
      <Helmet>
        <title>About Us | Tiffo</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 shadow-xl border border-neutral-100 dark:border-neutral-800"
        >
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-6">
            About <span className="text-primary-500">Tiffo</span>
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            At Tiffo, we believe that everyone deserves a hot, fresh, and nutritious homemade meal,
            no matter how busy their schedule. We are on a mission to connect food lovers with
            passionate home chefs in their neighborhood.
          </p>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            Our platform empowers local cooks to share their culinary heritage while providing
            customers with an authentic, healthy alternative to restaurant food. We ensure the
            highest standards of hygiene, quality, and taste.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Mission</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                To make authentic homemade food accessible to everyone while empowering local
                culinary talent.
              </p>
            </div>
            <div className="p-6 bg-secondary-50 dark:bg-secondary-900/20 rounded-2xl">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Quality</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Strict hygiene standards and regular quality checks to ensure the best dining
                experience.
              </p>
            </div>
            <div className="p-6 bg-pink-50 dark:bg-pink-900/20 rounded-2xl">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Community</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Building a network of food lovers and talented home chefs, fostering local
                connections.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
