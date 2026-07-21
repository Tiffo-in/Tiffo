import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/solid';

/**
 * Left-side branding panel for auth pages (hidden below lg). Pass `benefits`
 * to render the "Why join" card; omit it for a plain image/heading panel.
 */
const AuthBrandPanel = ({ image, heading, subheading, benefitsTitle, benefits }) => (
  <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-neutral-900">
    <div
      className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-[20s] ease-out"
      style={{ backgroundImage: `url('${image}')` }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/70 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 to-transparent" />

    <div className="relative z-10 flex flex-col justify-center w-full p-12 lg:p-16 text-white h-full">
      <div className="space-y-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
            {heading}
          </h1>
          <p className="text-xl text-neutral-300 max-w-md leading-relaxed font-medium">
            {subheading}
          </p>
        </motion.div>

        {benefits?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl max-w-md shadow-2xl relative"
          >
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-primary-400" />
              {benefitsTitle}
            </h3>
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <SolidCheckCircleIcon className="w-6 h-6 text-green-400 shrink-0" />
                  <span className="text-neutral-200 font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  </div>
);

export default AuthBrandPanel;
