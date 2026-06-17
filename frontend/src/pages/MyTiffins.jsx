import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import partnerService from '../services/partnerService';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  BuildingStorefrontIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  TagIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import ImageUpload from '../components/ImageUpload';
import MyTiffinsProfile from '../components/partner/MyTiffinsProfile';
import MyTiffinsMenu from '../components/partner/MyTiffinsMenu';
import DiscountManager from '../components/partner/DiscountManager';

// DiscountManager extracted to components

/* ──────────────────── */
/*  Main Component     */
/* ──────────────────── */
const MyTiffins = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    businessName: '',
    description: '',
    address: { street: '', city: '', state: '', pincode: '' },
    contact: { phone: '', email: '' },
    foodImages: [],
  });
  const [loading, setLoading] = useState(false);

  // For Pricing tab: real tiffins from API
  const [partnerTiffins, setPartnerTiffins] = useState([]);
  const [tiffinsLoading, setTiffinsLoading] = useState(false);

  // For Menu tab: real tiffins with their menuItems, and per-tiffin draft state
  const [menuTiffins, setMenuTiffins] = useState([]);
  const [menuTiffinsLoading, setMenuTiffinsLoading] = useState(false);
  const [selectedMenuTiffin, setSelectedMenuTiffin] = useState(null); // tiffin._id
  const [draftMenuItems, setDraftMenuItems] = useState([]); // editing buffer
  const [menuSaving, setMenuSaving] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    image: '',
    category: 'main',
    tags: '',
  });

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'pricing') loadPartnerTiffins();
    if (activeTab === 'menu') loadMenuTiffins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // When a partner selects a tiffin in the menu tab, seed the draft from its existing menuItems
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
        // Auto-select the first tiffin if none selected
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

  /** Add a new item to the draft (not yet saved to DB) */
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
    setNewMenuItem({ name: '', description: '', image: '', category: 'main', tags: '' });
    toast.success('Item added — click Save Menu to persist');
  };

  /** Remove an item from the draft */
  const handleRemoveDraftItem = (idx) => {
    setDraftMenuItems((prev) => prev.filter((_, i) => i !== idx));
  };

  /** Save the entire draft to the backend */
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
          address: response.data.address || { street: '', city: '', state: '', pincode: '' },
          contact: response.data.contact || { phone: '', email: '' },
          foodImages: response.data.foodImages || [],
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤', description: 'Business details' },
    { id: 'menu', label: 'Menu', icon: '🍽️', description: 'Meal items' },
    { id: 'pricing', label: 'Pricing & Discounts', icon: '🏷️', description: 'Plans & offers' },
    { id: 'payouts', label: 'Payouts', icon: '🏦', description: 'Bank & payments' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
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
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🍱</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-white">My Tiffin Service</h1>
                  <CheckBadgeIcon className="w-6 h-6 text-green-300" />
                </div>
                <p className="text-white/80 text-sm mt-0.5 flex items-center">
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
          className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-2 mb-8 -mt-12"
        >
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-4 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div
                    className={`text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-neutral-400'}`}
                  >
                    {tab.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ─── PROFILE TAB ─── */}
          {activeTab === 'profile' && (
            <MyTiffinsProfile
              profile={profile}
              setProfile={setProfile}
              loading={loading}
              handleProfileUpdate={handleProfileUpdate}
            />
          )}

          {/* ─── MENU TAB ─── */}
          {activeTab === 'menu' && (
            <MyTiffinsMenu
              menuTiffins={menuTiffins}
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

          {/* ─── PRICING & DISCOUNTS TAB ─── */}
          {activeTab === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Info bar */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                <span className="text-3xl shrink-0">🏷️</span>
                <div>
                  <h3 className="font-bold text-amber-900 text-lg">Discount Manager</h3>
                  <p className="text-amber-700 text-sm mt-1">
                    Set weekly and monthly subscription discounts per tiffin. Active discounts
                    appear on the tiffin listing and are automatically applied at checkout —
                    customers see their savings in real-time.
                  </p>
                </div>
              </div>

              {tiffinsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-neutral-500">Loading your tiffins...</p>
                  </div>
                </div>
              ) : partnerTiffins.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-12 text-center">
                  <div className="text-6xl mb-4">🍱</div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">No tiffins yet</h3>
                  <p className="text-neutral-500 mb-6">
                    Create a tiffin listing first, then come back here to manage discounts.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('menu')}
                    className="btn-primary"
                  >
                    <PlusIcon className="w-5 h-5 inline mr-2" /> Create Your First Tiffin
                  </motion.button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900">
                      Your Tiffins ({partnerTiffins.length})
                    </h2>
                    <button
                      type="button"
                      onClick={loadPartnerTiffins}
                      className="text-sm text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1"
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {partnerTiffins.map((tiffin) => (
                      <motion.div
                        key={tiffin._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <DiscountManager tiffin={tiffin} onSaved={loadPartnerTiffins} />
                      </motion.div>
                    ))}
                  </div>

                  {/* How it works */}
                  <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6">
                    <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-primary-500" /> How Discounts Work
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {[
                        {
                          icon: '🏷️',
                          title: 'Set your offer',
                          desc: 'Slide to choose % off for weekly and monthly plans (up to 70%).',
                        },
                        {
                          icon: '✅',
                          title: 'Toggle active',
                          desc: 'Flip the switch to make the discount live instantly for browsing customers.',
                        },
                        {
                          icon: '💰',
                          title: 'Savings at checkout',
                          desc: 'Customers see the original price crossed out and their savings amount automatically.',
                        },
                      ].map((item) => (
                        <div key={item.title} className="bg-neutral-50 rounded-xl p-4">
                          <div className="text-2xl mb-2">{item.icon}</div>
                          <div className="font-semibold text-neutral-900 mb-1">{item.title}</div>
                          <div className="text-neutral-500">{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ─── PAYOUTS TAB ─── */}
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

/* ─────────────────────────────────────────────── */
/*  Payouts & Bank Setup                          */
/* ─────────────────────────────────────────────── */
const PayoutsSetup = () => {
  const [status, setStatus] = useState(null); // null | 'loading' | 'setup' | 'pending'
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    pan: '',
    accountNumber: '',
    confirmAccount: '',
    ifscCode: '',
    accountHolderName: '',
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setStatus('loading');
    try {
      const res = await api.get('/partner/profile');
      const partner = res.data.data;
      setStatus(partner?.razorpayAccountId ? 'setup' : 'pending');
    } catch {
      setStatus('pending');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.accountNumber !== form.confirmAccount) {
      toast.error('Account numbers do not match');
      return;
    }
    if (!form.pan.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) {
      toast.error('Invalid PAN format (e.g. ABCDE1234F)');
      return;
    }
    setSaving(true);
    try {
      await api.post('/payments/setup-partner-account', {
        businessName: form.businessName,
        bankDetails: {
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode.toUpperCase(),
          accountHolderName: form.accountHolderName,
        },
        taxDetails: { pan: form.pan.toUpperCase() },
      });
      toast.success('Payment account setup successfully! Customers can now pay you.');
      setStatus('setup');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'setup') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Payment Account Active</h2>
        <p className="text-neutral-500 mb-6">
          Your Razorpay linked account is set up. Customers can pay for your tiffins and the money
          will be transferred directly to your bank account after each payment.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-left max-w-md mx-auto">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <span>🏦</span> How payouts work
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>✓ When a customer pays, 90% is sent to your account automatically</li>
            <li>✓ 10% is retained by TIFFO as platform commission</li>
            <li>✓ Transfer happens within minutes of payment confirmation</li>
            <li>✓ Track all earnings from the Earnings tab in your dashboard</li>
          </ul>
        </div>
      </div>
    );
  }

  // Pending setup
  return (
    <div className="space-y-6">
      {/* Warning banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
        <span className="text-3xl shrink-0">⚠️</span>
        <div>
          <h3 className="font-bold text-amber-900 text-lg">Payments Not Enabled Yet</h3>
          <p className="text-amber-700 text-sm mt-1">
            Customers <strong>cannot pay</strong> for your tiffins until you complete bank setup.
            This links your Razorpay account so money flows directly to your bank after each
            subscription.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden">
        <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-5 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900">Bank & Payout Setup</h2>
          <p className="text-sm text-neutral-500 mt-1">
            One-time setup · Takes 2 minutes · Required before receiving payments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Business name */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Business / Legal Name
            </label>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              placeholder="As registered with your bank"
              className="input-field"
            />
          </div>

          {/* PAN */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              PAN Number
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={form.pan}
              onChange={(e) => setForm((f) => ({ ...f, pan: e.target.value.toUpperCase() }))}
              placeholder="ABCDE1234F"
              className="input-field uppercase tracking-widest"
            />
            <p className="text-xs text-neutral-400 mt-1">
              Required for tax compliance and Razorpay KYC
            </p>
          </div>

          <div className="border-t border-neutral-100 pt-5">
            <p className="text-sm font-bold text-neutral-700 mb-4">Bank Account Details</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  value={form.accountHolderName}
                  onChange={(e) => setForm((f) => ({ ...f, accountHolderName: e.target.value }))}
                  placeholder="Name on bank account"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={form.ifscCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ifscCode: e.target.value.toUpperCase() }))
                  }
                  placeholder="SBIN0001234"
                  className="input-field uppercase tracking-widest"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Account Number
                </label>
                <input
                  type="password"
                  required
                  inputMode="numeric"
                  value={form.accountNumber}
                  onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                  placeholder="Enter account number"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  value={form.confirmAccount}
                  onChange={(e) => setForm((f) => ({ ...f, confirmAccount: e.target.value }))}
                  placeholder="Re-enter account number"
                  className={`input-field ${
                    form.confirmAccount && form.accountNumber !== form.confirmAccount
                      ? 'border-red-400 bg-red-50'
                      : form.confirmAccount && form.accountNumber === form.confirmAccount
                        ? 'border-green-400 bg-green-50'
                        : ''
                  }`}
                />
                {form.confirmAccount && form.accountNumber !== form.confirmAccount && (
                  <p className="text-xs text-red-500 mt-1">Account numbers don't match</p>
                )}
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl shrink-0">🔒</span>
            <p className="text-sm text-blue-800">
              Your bank details are sent directly to <strong>Razorpay</strong> — India's
              RBI-licensed payment gateway. TIFFO never stores your account number.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3 text-base"
          >
            {saving ? '⏳ Setting up…' : '🏦 Enable Payouts'}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default MyTiffins;
