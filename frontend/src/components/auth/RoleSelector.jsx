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
    activeColor: 'ring-blue-500 bg-blue-50/50 border-blue-200',
  },
  {
    id: 'partner',
    title: 'Tiffin Partner',
    description: 'Start your food business',
    emoji: '👨‍🍳',
    activeColor: 'ring-primary-500 bg-primary-50/50 border-primary-200',
  },
];

/* Customer/Partner role cards with the partner-verification notice. */
const RoleSelector = ({ value, onChange }) => (
  <div className="space-y-3">
    <label className="block text-sm font-bold text-neutral-700">I want to...</label>
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
     ? `${option.activeColor} ring-2 ring-offset-2`
     : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-500'
 }`}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 text-brand-ink">
                <SolidCheckCircleIcon className="w-6 h-6" />
              </div>
            )}
            <span className="text-3xl mb-3">{option.emoji}</span>
            <h4 className={`font-bold text-base mb-1 ${isSelected ? 'text-neutral-900' : ''}`}>
              {option.title}
            </h4>
            <p className={`text-xs font-medium ${isSelected ? 'text-neutral-700' : ''}`}>
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
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">Partner Verification</p>
              <p className="text-xs font-medium text-amber-700 mt-1">
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
