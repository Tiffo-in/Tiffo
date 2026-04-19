import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FunnelIcon,
    XMarkIcon,
    CalendarDaysIcon,
    MapPinIcon,
    CurrencyRupeeIcon,
    CheckCircleIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';

const SearchFilters = ({
    filters,
    onFilterChange,
    onClear,
    filterConfig = {}
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters || {});

    const defaultConfig = {
        showDateRange: true,
        showStatus: true,
        showPriceRange: false,
        showLocation: false,
        showPlan: false,
        statusOptions: ['all', 'active', 'pending', 'completed', 'cancelled'],
        planOptions: ['daily', 'weekly', 'monthly'],
        ...filterConfig
    };

    const handleChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const handleClear = () => {
        setLocalFilters({});
        onClear?.();
    };

    const activeFilterCount = Object.values(localFilters).filter(v => v && v !== 'all').length;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden">
            {/* Filter Header */}
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-xl">
                        <FunnelIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-neutral-900">Filters</h3>
                        <p className="text-sm text-neutral-500">
                            {activeFilterCount > 0 ? `${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}` : 'No filters applied'}
                        </p>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDownIcon className="w-5 h-5 text-neutral-400" />
                </motion.div>
            </motion.button>

            {/* Filter Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-neutral-100"
                    >
                        <div className="p-4 space-y-4">
                            {/* Date Range */}
                            {defaultConfig.showDateRange && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center gap-1">
                                            <CalendarDaysIcon className="w-4 h-4" />
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={localFilters.startDate || ''}
                                            onChange={(e) => handleChange('startDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center gap-1">
                                            <CalendarDaysIcon className="w-4 h-4" />
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={localFilters.endDate || ''}
                                            onChange={(e) => handleChange('endDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Status Filter */}
                            {defaultConfig.showStatus && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-1">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Status
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {defaultConfig.statusOptions.map((status) => (
                                            <motion.button
                                                key={status}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleChange('status', status)}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${(localFilters.status || 'all') === status
                                                        ? 'bg-primary-500 text-white shadow-md'
                                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                    }`}
                                            >
                                                {status}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Plan Filter */}
                            {defaultConfig.showPlan && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Plan Type
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleChange('plan', 'all')}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!localFilters.plan || localFilters.plan === 'all'
                                                    ? 'bg-primary-500 text-white shadow-md'
                                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                }`}
                                        >
                                            All Plans
                                        </motion.button>
                                        {defaultConfig.planOptions.map((plan) => (
                                            <motion.button
                                                key={plan}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleChange('plan', plan)}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${localFilters.plan === plan
                                                        ? 'bg-primary-500 text-white shadow-md'
                                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                    }`}
                                            >
                                                {plan}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price Range */}
                            {defaultConfig.showPriceRange && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center gap-1">
                                            <CurrencyRupeeIcon className="w-4 h-4" />
                                            Min Price
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={localFilters.minPrice || ''}
                                            onChange={(e) => handleChange('minPrice', e.target.value)}
                                            className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center gap-1">
                                            <CurrencyRupeeIcon className="w-4 h-4" />
                                            Max Price
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="10000"
                                            value={localFilters.maxPrice || ''}
                                            onChange={(e) => handleChange('maxPrice', e.target.value)}
                                            className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            {defaultConfig.showLocation && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center gap-1">
                                        <MapPinIcon className="w-4 h-4" />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter city or area"
                                        value={localFilters.location || ''}
                                        onChange={(e) => handleChange('location', e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleClear}
                                    className="flex-1 py-2.5 px-4 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                    Clear All
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsExpanded(false)}
                                    className="flex-1 py-2.5 px-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                                >
                                    Apply Filters
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchFilters;
