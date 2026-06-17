import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import MapLocationPicker from '../components/MapLocationPicker';
import BankDetailsForm from '../components/BankDetailsForm';
import ImageUpload from '../components/ImageUpload';

const PartnerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    businessName: '',
    description: '',
    logo: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      coordinates: null,
    },
    contact: {
      phone: '',
      whatsapp: '',
      email: '',
    },
    businessHours: {
      open: '09:00',
      close: '21:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    deliveryRadius: 10,
  });

  // Fetch partner profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/partner/profile');
        if (res.data.success && res.data.data) {
          const p = res.data.data;
          setProfileData({
            businessName: p.businessName || '',
            description: p.description || '',
            logo: p.logo || '',
            address: {
              street: p.address?.street || '',
              city: p.address?.city || '',
              state: p.address?.state || '',
              pincode: p.address?.pincode || '',
              coordinates: p.address?.coordinates || null,
            },
            contact: {
              phone: p.contact?.phone || '',
              whatsapp: p.contact?.whatsapp || '',
              email: p.contact?.email || '',
            },
            businessHours: {
              open: p.businessHours?.open || '09:00',
              close: p.businessHours?.close || '21:00',
              workingDays: p.businessHours?.workingDays || [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ],
            },
            deliveryRadius: p.deliveryRadius || 10,
          });
        }
      } catch (err) {
        console.error('Failed to load partner profile:', err);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleContactChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  const handleLocationSelect = (location) => {
    setProfileData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        coordinates: location,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    if (!profileData.address.coordinates) {
      toast.error('Please set your business location on the map');
      setIsSaving(false);
      return;
    }

    try {
      const res = await api.put('/partner/profile', profileData);
      if (res.data.success) {
        toast.success('Profile saved successfully!');
        setIsEditing(false);
      } else {
        toast.error(res.data.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.message || 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleWorkingDay = (day) => {
    setProfileData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        workingDays: prev.businessHours.workingDays.includes(day)
          ? prev.businessHours.workingDays.filter((d) => d !== day)
          : [...prev.businessHours.workingDays, day],
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-primary-200 rounded-full" />
          <div className="absolute top-0 w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[110px] pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
              <span className="text-5xl mr-4 animate-bounce-slow">🏪</span>
              <span className="bg-gradient-to-r from-maroon-600 via-maroon-700 to-maroon-800 dark:from-maroon-400 dark:via-maroon-500 dark:to-maroon-600 bg-clip-text text-transparent">
                Partner Profile
              </span>
            </h1>
            {activeTab === 'profile' && !isEditing ? (
              <motion.button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Edit Profile
              </motion.button>
            ) : activeTab === 'profile' && isEditing ? (
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary disabled:bg-gray-400"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            ) : null}
          </div>

          {/* Tabs */}
          <div className="mb-8 border-b-2 border-gray-200 relative">
            <nav className="-mb-0.5 flex space-x-8 relative">
              <button
                onClick={() => setActiveTab('profile')}
                className={`relative py-4 px-1 font-bold text-base transition-colors duration-300 ${
                  activeTab === 'profile' ? 'text-maroon-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Business Profile
                {activeTab === 'profile' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-maroon-600 via-maroon-700 to-maroon-800 dark:from-maroon-400 dark:via-maroon-500 dark:to-maroon-600"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`relative py-4 px-1 font-bold text-base transition-colors duration-300 ${
                  activeTab === 'payment' ? 'text-maroon-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Payment Account
                {activeTab === 'payment' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-maroon-600 via-maroon-700 to-maroon-800 dark:from-maroon-400 dark:via-maroon-500 dark:to-maroon-600"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' ? (
            <>
              {/* Business Information */}
              <div className="glass-card mb-8 p-8 shadow-premium">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                  <span className="text-2xl mr-3">🏢</span>
                  Business Information
                </h2>

                {isEditing && (
                  <div className="mb-6">
                    <ImageUpload
                      label="Business Logo"
                      value={profileData.logo}
                      onChange={(url) => handleInputChange('logo', url)}
                      context="logo"
                    />
                  </div>
                )}

                {!isEditing && profileData.logo && (
                  <div className="mb-6 w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-neutral-200">
                    <img
                      src={profileData.logo}
                      alt="Business Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      disabled={!isEditing}
                      className="input-field"
                      placeholder="e.g., Delhi Home Kitchen"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={profileData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={!isEditing}
                      rows="3"
                      className="input-field"
                      placeholder="Describe your tiffin service..."
                    />
                  </div>
                </div>
              </div>

              {/* Business Location */}
              <div className="glass-card mb-8 p-8 shadow-premium">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                  <span className="text-3xl mr-3">📍</span>
                  Business Location *
                </h2>

                {isEditing && (
                  <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-l-4 border-yellow-400 rounded-lg p-4">
                    <p className="text-sm text-yellow-900 font-medium">
                      <strong>⚠️ Important:</strong> Setting your exact location helps customers
                      find you when searching for nearby tiffin services.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={profileData.address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={profileData.address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="New Delhi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={profileData.address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="Delhi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={profileData.address.pincode}
                        onChange={(e) => handleAddressChange('pincode', e.target.value)}
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="110001"
                      />
                    </div>
                  </div>

                  {/* Map Location Picker */}
                  {isEditing && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Set Location on Map *
                      </label>
                      <MapLocationPicker
                        onLocationSelect={handleLocationSelect}
                        initialLocation={profileData.address.coordinates}
                      />
                    </div>
                  )}

                  {!isEditing && profileData.address.coordinates && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800 mb-2">✅ Location Set</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Latitude:</span>
                          <span className="ml-2 font-mono font-semibold text-gray-900">
                            {profileData.address.coordinates.lat.toFixed(6)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Longitude:</span>
                          <span className="ml-2 font-mono font-semibold text-gray-900">
                            {profileData.address.coordinates.lng.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="glass-card mb-8 p-8 shadow-premium">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                  <span className="text-2xl mr-3">📞</span>
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={profileData.contact.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="input-field"
                      placeholder="+91-9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.contact.whatsapp}
                      onChange={(e) => handleContactChange('whatsapp', e.target.value)}
                      disabled={!isEditing}
                      className="input-field"
                      placeholder="+91-9876543210"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileData.contact.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="input-field"
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="glass-card mb-8 p-8 shadow-premium">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                  <span className="text-2xl mr-3">🕒</span>
                  Business Hours
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opening Time
                      </label>
                      <input
                        type="time"
                        value={profileData.businessHours.open}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            businessHours: { ...prev.businessHours, open: e.target.value },
                          }))
                        }
                        disabled={!isEditing}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Closing Time
                      </label>
                      <input
                        type="time"
                        value={profileData.businessHours.close}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            businessHours: { ...prev.businessHours, close: e.target.value },
                          }))
                        }
                        disabled={!isEditing}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => isEditing && toggleWorkingDay(day)}
                          disabled={!isEditing}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            profileData.businessHours.workingDays.includes(day)
                              ? 'bg-maroon-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          } ${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="glass-card p-8 shadow-premium">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                  <span className="text-2xl mr-3">🚚</span>
                  Delivery Settings
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Radius:{' '}
                    <span className="text-maroon-600 font-bold">
                      {profileData.deliveryRadius} km
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={profileData.deliveryRadius}
                    onChange={(e) => handleInputChange('deliveryRadius', Number(e.target.value))}
                    disabled={!isEditing}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-maroon-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <BankDetailsForm
              onSuccess={() => alert('Bank details saved! You can now receive payments.')}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerProfile;
