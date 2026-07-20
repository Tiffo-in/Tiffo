import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/solid';

const ROLE_OPTIONS = [
  {
    id: 'user',
    title: 'Customer',
    description: 'Order delicious tiffins',
    emoji: '🍽️',
    activeColor:
      'ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'partner',
    title: 'Tiffin Partner',
    description: 'Start your food business',
    emoji: '👨‍🍳',
    activeColor:
      'ring-primary-500 bg-primary-50/50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
  },
];

/* Customer/Partner role cards with the partner-verification notice. */
const RoleSelector = ({ value, onChange }) => (
  <div className="space-y-3">
    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">
      I want to...
    </label>
    <div className="grid grid-cols-2 gap-3">
      {ROLE_OPTIONS.map((option) => {
        const isSelected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`relative flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all duration-200 outline-none
              ${
                isSelected
                  ? `${option.activeColor} ring-2 ring-offset-2 dark:ring-offset-neutral-950`
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-500 dark:text-neutral-400'
              }`}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 text-primary-500 dark:text-primary-400">
                <SolidCheckCircleIcon className="w-6 h-6" />
              </div>
            )}
            <span className="text-3xl mb-3">{option.emoji}</span>
            <h4
              className={`font-bold text-base mb-1 ${isSelected ? 'text-neutral-900 dark:text-white' : ''}`}
            >
              {option.title}
            </h4>
            <p
              className={`text-xs font-medium ${isSelected ? 'text-neutral-700 dark:text-neutral-300' : ''}`}
            >
              {option.description}
            </p>
          </button>
        );
      })}
    </div>

    <AnimatePresence mode="wait">
      {value === 'partner' && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
                Partner Verification
              </p>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-500/80 mt-1">
                Your business details will be verified by our team before your account is fully
                activated.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default RoleSelector;
