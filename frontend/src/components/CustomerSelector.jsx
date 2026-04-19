import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { partnerService } from '../services/partnerService';
import {
  EnvelopeIcon,
  CalendarDaysIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const CustomerSelector = ({ onCustomerSelect, selectedCustomerId }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getCustomers();
      setCustomers(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.tiffin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-neutral-100 rounded-xl animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchCustomers}
          className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
        >
          Try Again
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search customers by name, email, or tiffin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />
      </div>

      {/* Customer Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          <span className="font-semibold text-neutral-700">{filteredCustomers.length}</span> active customers
        </p>
        <select className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option>Sort by Name</option>
          <option>Sort by Plan</option>
          <option>Sort by Recent</option>
        </select>
      </div>

      {filteredCustomers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200"
        >
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-neutral-700 mb-2">
            {searchTerm ? 'No customers found' : 'No active customers yet'}
          </h3>
          <p className="text-neutral-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Customers will appear here once they subscribe'}
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredCustomers.map((customer, index) => {
            const isSelected = selectedCustomerId === customer.id;

            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onCustomerSelect(customer)}
                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-lg'
                    : 'border-neutral-100 bg-white hover:border-primary-200 hover:shadow-md'
                  }`}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center shadow-md"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-white" />
                  </motion.div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-inner ${isSelected ? 'bg-primary-100' : 'bg-gradient-to-br from-neutral-100 to-neutral-200'
                      }`}>
                      {customer.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    <div className="flex-1">
                      <h4 className={`font-bold text-lg mb-1 ${isSelected ? 'text-primary-700' : 'text-neutral-900 group-hover:text-primary-600'
                        } transition-colors`}>
                        {customer.name}
                      </h4>

                      <div className="flex items-center text-sm text-neutral-500 mb-2">
                        <EnvelopeIcon className="w-4 h-4 mr-1.5" />
                        {customer.email}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                          🍱 {customer.tiffin}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold capitalize">
                          📦 {customer.plan}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side Info */}
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="flex items-center justify-end text-sm font-semibold text-neutral-700 mb-1">
                      <ClockIcon className="w-4 h-4 mr-1.5 text-neutral-400" />
                      {customer.deliveryTime}
                    </div>
                    <div className="flex items-center justify-end text-xs text-neutral-500">
                      <CalendarDaysIcon className="w-4 h-4 mr-1.5" />
                      Until {new Date(customer.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;