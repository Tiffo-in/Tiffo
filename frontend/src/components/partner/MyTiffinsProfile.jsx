import React from 'react';
import { motion } from 'framer-motion';
import { BuildingStorefrontIcon, TrashIcon } from '@heroicons/react/24/outline';
import ImageUpload from '../../components/ImageUpload';

const MyTiffinsProfile = ({ profile, setProfile, loading, handleProfileUpdate }) => {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-5 border-b border-neutral-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <BuildingStorefrontIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Business Profile</h2>
            <p className="text-sm text-neutral-500">Update your tiffin service details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
        <div className="mb-6">
          <ImageUpload
            label="Business Logo"
            value={profile.logo}
            onChange={(url) => setProfile({ ...profile, logo: url })}
            context="logo"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={profile.businessName}
              onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
              className="input-field"
              placeholder="Enter your business name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.contact.phone}
              onChange={(e) =>
                setProfile({ ...profile, contact: { ...profile.contact, phone: e.target.value } })
              }
              className="input-field"
              placeholder="+91 98765 43210"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Description</label>
          <textarea
            value={profile.description}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            rows={3}
            className="input-field resize-none"
            placeholder="Describe your tiffin service..."
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Address</label>
          <input
            type="text"
            value={profile.address.street}
            onChange={(e) =>
              setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })
            }
            className="input-field"
            placeholder="Street address"
            disabled={loading}
          />
        </div>

        <div className="pt-4 border-t border-neutral-100">
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Food Gallery</label>
          <p className="text-sm text-neutral-500 mb-4">
            Upload images of the tiffins you serve to attract more customers.
          </p>
          <div className="flex flex-wrap gap-4 mb-4">
            {profile.foodImages?.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-neutral-200"
              >
                <img src={imgUrl} alt="Food" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      foodImages: profile.foodImages.filter((_, i) => i !== idx),
                    })
                  }
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!profile.foodImages || profile.foodImages.length < 5) && (
              <ImageUpload
                label=""
                value=""
                onChange={(url) =>
                  setProfile({ ...profile, foodImages: [...profile.foodImages, url] })
                }
                context="tiffin"
              />
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="btn-primary w-full md:w-auto"
        >
          {loading ? 'Updating...' : '✨ Update Profile'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default MyTiffinsProfile;
