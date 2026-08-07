import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

import partnerService from '../services/partnerService';
import api from '../services/api';
import MyTiffinsProfile from '../components/partner/MyTiffinsProfile';
import MyTiffinsMenu from '../components/partner/MyTiffinsMenu';
import PricingDiscountsTab from '../components/partner/PricingDiscountsTab';
import PayoutsSetup from '../components/partner/PayoutsSetup';

const TABS = [
  { id: 'profile', label: 'Profile', icon: '👤', description: 'Business details' },
  { id: 'menu', label: 'Menu', icon: '🍽️', description: 'Meal items' },
  { id: 'pricing', label: 'Pricing & Discounts', icon: '🏷️', description: 'Plans & offers' },
  { id: 'payouts', label: 'Payouts', icon: '🏦', description: 'Bank & payments' },
];

const EMPTY_PROFILE = {
  businessName: '',
  description: '',
  address: { street: '', city: '', state: '', pincode: '' },
  contact: { phone: '', email: '' },
  foodImages: [],
  logo: '',
};

const EMPTY_MENU_ITEM = { name: '', description: '', image: '', category: 'main', tags: '' };

const MyTiffins = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(false);

  // Pricing tab: the partner's tiffins
  const [partnerTiffins, setPartnerTiffins] = useState([]);
  const [tiffinsLoading, setTiffinsLoading] = useState(false);

  // Menu tab: tiffins with menuItems plus a per-tiffin editing buffer
  const [menuTiffins, setMenuTiffins] = useState([]);
  const [menuTiffinsLoading, setMenuTiffinsLoading] = useState(false);
  const [selectedMenuTiffin, setSelectedMenuTiffin] = useState(null);
  const [draftMenuItems, setDraftMenuItems] = useState([]);
  const [menuSaving, setMenuSaving] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState(EMPTY_MENU_ITEM);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'pricing') loadPartnerTiffins();
    if (activeTab === 'menu') loadMenuTiffins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // When a tiffin is selected in the menu tab, seed the draft from its items
  useEffect(() => {
    if (!selectedMenuTiffin) {
      setDraftMenuItems([]);
      return;
    }
    const t = menuTiffins.find((t) => t._id === selectedMenuTiffin);
    setDraftMenuItems(t?.menuItems ? [...t.menuItems] : []);
  }, [selectedMenuTiffin, menuTiffins]);

  const loadMenuTiffins = useCallback(async () => {
    setMenuTiffinsLoading(true);
    try {
      const res = await api.get('/tiffins/mine');
      if (res.data.success) {
        setMenuTiffins(res.data.data);
        if (!selectedMenuTiffin && res.data.data.length > 0) {
          setSelectedMenuTiffin(res.data.data[0]._id);
        }
      }
    } catch {
      setMenuTiffins([]);
    } finally {
      setMenuTiffinsLoading(false);
    }
  }, [selectedMenuTiffin]);

  const handleAddDraftItem = (e) => {
    e.preventDefault();
    if (!newMenuItem.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    const tags = newMenuItem.tags
      ? newMenuItem.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    setDraftMenuItems((prev) => [
      ...prev,
      {
        name: newMenuItem.name.trim(),
        description: newMenuItem.description.trim(),
        image: newMenuItem.image,
        category: newMenuItem.category,
        tags,
      },
    ]);
    setNewMenuItem(EMPTY_MENU_ITEM);
    toast.success('Item added — click Save Menu to persist');
  };

  const handleRemoveDraftItem = (idx) => {
    setDraftMenuItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveMenu = async () => {
    if (!selectedMenuTiffin) return;
    setMenuSaving(true);
    try {
      const res = await api.patch(`/tiffins/${selectedMenuTiffin}/menu`, {
        menuItems: draftMenuItems,
      });
      setMenuTiffins((prev) => prev.map((t) => (t._id === selectedMenuTiffin ? res.data.data : t)));
      toast.success('Menu saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save menu');
    } finally {
      setMenuSaving(false);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getProfile();
      if (response.data) {
        setProfile({
          businessName: response.data.businessName || '',
          description: response.data.description || '',
          address: response.data.address || EMPTY_PROFILE.address,
          contact: response.data.contact || EMPTY_PROFILE.contact,
          foodImages: response.data.foodImages || [],
          logo: response.data.logo || '',
        });
      }
    } catch {
      toast.error('Could not load your business profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await partnerService.updateProfile(profile);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const loadPartnerTiffins = useCallback(async () => {
    setTiffinsLoading(true);
    try {
      const res = await api.get('/tiffins/mine');
      if (res.data.success) setPartnerTiffins(res.data.data);
    } catch {
      setPartnerTiffins([]);
    } finally {
      setTiffinsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-500 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 pt-[110px] pb-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-card">
                <span className="text-3xl">🍱</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-neutral-900">My Tiffin Service</h1>
                  <CheckBadgeIcon className="w-6 h-6 text-green-300" />
                </div>
                <p className="text-neutral-700 text-sm mt-0.5 flex items-center">
                  <SparklesIcon className="w-4 h-4 mr-1" />
                  Manage your menu, pricing and discount offers
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-card border border-neutral-100 p-2 mb-8 -mt-12"
        >
          <div className="flex space-x-2">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-4 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-on-brand shadow-card'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div
                    className={`text-xs ${activeTab === tab.id ? 'text-neutral-700' : 'text-neutral-400'}`}
                  >
                    {tab.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <MyTiffinsProfile
              profile={profile}
              setProfile={setProfile}
              loading={loading}
              handleProfileUpdate={handleProfileUpdate}
            />
          )}

          {activeTab === 'menu' && (
            <MyTiffinsMenu
              menuTiffins={menuTiffins}
              setMenuTiffins={setMenuTiffins}
              menuTiffinsLoading={menuTiffinsLoading}
              selectedMenuTiffin={selectedMenuTiffin}
              setSelectedMenuTiffin={setSelectedMenuTiffin}
              draftMenuItems={draftMenuItems}
              newMenuItem={newMenuItem}
              setNewMenuItem={setNewMenuItem}
              handleAddDraftItem={handleAddDraftItem}
              handleRemoveDraftItem={handleRemoveDraftItem}
              handleSaveMenu={handleSaveMenu}
              menuSaving={menuSaving}
              loadMenuTiffins={loadMenuTiffins}
            />
          )}

          {activeTab === 'pricing' && (
            <PricingDiscountsTab
              tiffins={partnerTiffins}
              loading={tiffinsLoading}
              onRefresh={loadPartnerTiffins}
              onCreateFirst={() => setActiveTab('menu')}
            />
          )}

          {activeTab === 'payouts' && (
            <motion.div
              key="payouts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <PayoutsSetup />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyTiffins;
