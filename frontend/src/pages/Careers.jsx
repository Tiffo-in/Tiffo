import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const Careers = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-neutral-50">
      <Helmet>
        <title>Careers | Tiffo</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-card-hover border border-neutral-100"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              Join the <span className="text-primary-600">Tiffo</span> Team
            </h1>
            <p className="text-xl text-neutral-600">
              Help us revolutionize the way people eat homemade food.
            </p>
          </div>

          <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">No open roles right now</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              We're always looking for talented individuals. Follow our socials or check back later
              for new opportunities!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Careers;
