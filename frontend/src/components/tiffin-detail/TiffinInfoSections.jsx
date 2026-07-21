import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/solid';

const NUTRITION_FIELDS = [
  { label: 'Calories', key: 'calories', unit: 'kcal', color: 'text-orange-500' },
  { label: 'Protein', key: 'protein', unit: 'g', color: 'text-blue-500' },
  { label: 'Carbs', key: 'carbs', unit: 'g', color: 'text-yellow-500' },
  { label: 'Fat', key: 'fat', unit: 'g', color: 'text-red-500' },
];

/* Tags row + description + menu + nutrition — the left-column info stack. */
const TiffinInfoSections = ({ tiffin }) => {
  const menuItems = tiffin.menuItems || [];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <span className="bg-maroon-100 text-maroon-700 dark:bg-maroon-900/40 dark:text-maroon-300 px-3 py-1 rounded-full text-xs font-semibold capitalize">
          {tiffin.mealType}
        </span>
        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
          {tiffin.cuisine}
        </span>
        {tiffin.dietary?.map((d) => (
          <span
            key={d}
            className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold capitalize"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-800">
        <h2 className="font-bold text-lg text-gray-900 dark:text-neutral-100 mb-2">
          About This Tiffin
        </h2>
        <p className="text-gray-600 dark:text-neutral-400 leading-relaxed">{tiffin.description}</p>

        {tiffin.availability?.days?.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-maroon-600" />
            <span className="text-sm text-gray-500 dark:text-neutral-400">
              Available:{' '}
              <strong className="text-gray-700 dark:text-neutral-200">
                {tiffin.availability.days.join(', ')}
              </strong>
            </span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-800">
        <h2 className="font-bold text-lg text-gray-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          🍽️ Today's Menu
        </h2>
        {menuItems.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-neutral-500">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="font-medium">Menu not added yet</p>
            <p className="text-sm mt-1">The partner hasn't listed today's menu items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {menuItems.map((item, i) => (
              <motion.div
                key={item._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-neutral-800 hover:bg-maroon-50 dark:hover:bg-maroon-900/20 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-700 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🍽️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-neutral-100 text-sm">
                    {item.name}
                  </p>
                  <p className="text-gray-500 dark:text-neutral-400 text-xs">
                    {item.description || item.desc || ''}
                  </p>
                  {item.category && (
                    <span className="inline-block mt-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-full capitalize">
                      {item.category}
                    </span>
                  )}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.map((t, ti) => (
                        <span
                          key={ti}
                          className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {tiffin.nutritionInfo && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-800">
          <h2 className="font-bold text-lg text-gray-900 dark:text-neutral-100 mb-4">
            Nutrition Info
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {NUTRITION_FIELDS.map((n) =>
              tiffin.nutritionInfo[n.key] ? (
                <div key={n.label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-neutral-800">
                  <p className={`text-xl font-bold ${n.color}`}>
                    {tiffin.nutritionInfo[n.key]}
                    {n.unit}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">{n.label}</p>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TiffinInfoSections;
