import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPartnerCustomers, fetchCustomerCalendar, setSelectedCustomer } from '../store/slices/customerSlice';
import DeliveryStatusModal from './DeliveryStatusModal';
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const CustomerCalendar = () => {
  const dispatch = useDispatch();
  const { customers, selectedCustomer, calendars, loading } = useSelector(state => state.customers);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch customers on component mount
  useEffect(() => {
    dispatch(fetchPartnerCustomers());
  }, [dispatch]);

  // Fetch calendar when customer or month changes
  useEffect(() => {
    if (selectedCustomer) {
      dispatch(fetchCustomerCalendar({
        customerId: selectedCustomer.id,
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear()
      }));
    }
  }, [dispatch, selectedCustomer, currentMonth]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getDeliveryData = (day) => {
    if (!selectedCustomer || !day) return null;

    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendars[selectedCustomer.id]?.[dateStr];
  };

  const handleDateClick = (day) => {
    if (!day || !selectedCustomer) return;

    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const deliveries = calendars[selectedCustomer.id]?.[dateStr];

    if (deliveries && Object.keys(deliveries).length > 0) {
      setSelectedDate({ date: dateStr, deliveries });
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (selectedCustomer) {
      dispatch(fetchCustomerCalendar({
        customerId: selectedCustomer.id,
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear()
      }));
    }
  };

  const getDayStatusSummary = (deliveries) => {
    if (!deliveries) return null;

    const meals = Object.keys(deliveries);
    const delivered = meals.filter(meal => deliveries[meal].status === 'delivered').length;
    const cancelled = meals.filter(meal => deliveries[meal].status === 'cancelled').length;
    const pending = meals.filter(meal => deliveries[meal].status === 'pending').length;

    if (delivered === meals.length) return 'delivered';
    if (cancelled === meals.length) return 'cancelled';
    if (pending > 0) return 'pending';
    return 'mixed';
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'delivered': return { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', icon: '✓' };
      case 'pending': return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: '⏳' };
      case 'scheduled': return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: '📅' };
      case 'cancelled': return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: '✕' };
      case 'mixed': return { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', icon: '◐' };
      default: return { bg: 'bg-neutral-50', border: 'border-neutral-200', text: 'text-neutral-500', icon: '' };
    }
  };

  const getMealIcons = (deliveries) => {
    if (!deliveries) return null;
    const icons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
    return Object.keys(deliveries).map(meal => icons[meal]).join(' ');
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-2">
            <div className="h-80 bg-neutral-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Selection */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Select Customer
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {customers.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-xl">
                <p className="text-neutral-500">No customers available</p>
              </div>
            ) : (
              customers.map(customer => {
                const isSelected = selectedCustomer?.id === customer.id;
                return (
                  <motion.button
                    key={customer.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => dispatch(setSelectedCustomer(customer))}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${isSelected ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                        {customer.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-neutral-900 truncate">{customer.name}</div>
                        <div className="text-xs text-neutral-500 capitalize">{customer.plan} Plan</div>
                      </div>
                      {isSelected && (
                        <CheckCircleIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          {selectedCustomer ? (
            <div className="bg-neutral-50 rounded-2xl p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {selectedCustomer.name}'s Deliveries
                  </h3>
                  <p className="text-sm text-neutral-500">{selectedCustomer.phone}</p>
                </div>
                <div className="flex items-center space-x-2 bg-white rounded-xl p-1 shadow-sm border border-neutral-200">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-neutral-600" />
                  </motion.button>
                  <span className="font-semibold text-neutral-800 min-w-[140px] text-center">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-neutral-600" />
                  </motion.button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 bg-neutral-50 border-b border-neutral-200">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7">
                  {getDaysInMonth(currentMonth).map((day, index) => {
                    const deliveries = getDeliveryData(day);
                    const status = getDayStatusSummary(deliveries);
                    const statusStyles = status ? getStatusStyles(status) : null;
                    const isToday = day &&
                      new Date().getDate() === day &&
                      new Date().getMonth() === currentMonth.getMonth() &&
                      new Date().getFullYear() === currentMonth.getFullYear();

                    return (
                      <motion.div
                        key={index}
                        whileHover={day ? { scale: 1.05 } : {}}
                        whileTap={day ? { scale: 0.95 } : {}}
                        onClick={() => handleDateClick(day)}
                        className={`p-2 min-h-[70px] border-b border-r border-neutral-100 transition-all ${!day ? 'bg-neutral-50' :
                            isToday ? 'bg-primary-50 ring-2 ring-primary-500 ring-inset' :
                              status ? `${statusStyles?.bg} cursor-pointer hover:opacity-80` :
                                'hover:bg-neutral-50 cursor-pointer'
                          }`}
                      >
                        {day && (
                          <>
                            <div className={`text-sm font-medium ${isToday ? 'text-primary-600' : 'text-neutral-700'
                              }`}>
                              {day}
                            </div>
                            {deliveries && (
                              <div className="mt-1 space-y-1">
                                <div className="text-xs">{getMealIcons(deliveries)}</div>
                                <div className={`text-xs font-bold ${statusStyles?.text}`}>
                                  {statusStyles?.icon}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {[
                  { status: 'delivered', label: 'Delivered' },
                  { status: 'pending', label: 'Pending' },
                  { status: 'mixed', label: 'Mixed' },
                  { status: 'cancelled', label: 'Cancelled' }
                ].map(item => {
                  const styles = getStatusStyles(item.status);
                  return (
                    <div key={item.status} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 ${styles.bg} border ${styles.border} rounded`} />
                      <span className="text-neutral-600">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-neutral-400">
                🌅 Breakfast • ☀️ Lunch • 🌙 Dinner | Click on dates to update delivery status
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">Select a Customer</h3>
              <p className="text-neutral-500 text-center max-w-xs">
                Choose a customer from the list to view and manage their delivery calendar
              </p>
            </div>
          )}
        </div>
      </div>

      <DeliveryStatusModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        deliveries={selectedDate?.deliveries || {}}
        date={selectedDate?.date}
        customerName={selectedCustomer?.name}
      />
    </div>
  );
};

export default CustomerCalendar;