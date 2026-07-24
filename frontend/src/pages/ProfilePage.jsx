import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  LockClosedIcon,
  CheckCircleIcon,
  PencilIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  BellIcon,
  SparklesIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { loginAction } from '../store/slices/authSlice';
import ImageUpload from '../components/ImageUpload';

// ─── Dark Section Card Wrapper ──────────────────────────────────────────────
const Section = ({ icon: Icon, title, subtitle, children, rightAction }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#14151e] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden"
  >
    <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-[#161722]">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

// ─── Password Field with Eye Toggle ──────────────────────────────────────────
const PasswordInput = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-11 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {show ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    address: { street: '', city: '', state: '', pincode: '' },
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    deliveryUpdates: true,
    emailPromos: false,
    whatsappAlerts: true,
  });

  // ── Fetch Profile ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          const u = res.data.user;
          setProfile({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            avatar: u.avatar || '',
            address: {
              street: u.address?.street || '',
              city: u.address?.city || '',
              state: u.address?.state || '',
              pincode: u.address?.pincode || '',
            },
          });
        }
      } catch (err) {
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Save Profile ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!profile.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      setSaving(true);
      const res = await api.put('/auth/me', {
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar,
        address: profile.address,
      });
      if (res.data.success) {
        dispatch(loginAction({ user: res.data.user }));
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Change Password ───────────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setPwSaving(true);
      const res = await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (res.data.success) {
        toast.success('Password updated successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header / Sub-Navbar */}
      <header className="border-b border-zinc-800/80 bg-[#111218]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center space-x-1.5 text-xs font-semibold"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <Link to="/" className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white text-sm">
              T
            </span>
            <span className="text-lg font-bold text-white tracking-tight">
              Tiffo<span className="text-orange-500">.</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Banner Header */}
      <div className="relative bg-gradient-to-r from-[#171622] via-[#1a1928] to-[#251d20] border-b border-zinc-800/80">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&auto=format&fit=crop&q=80"
            alt="Header backdrop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#171622] via-[#171622]/90 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              {/* Avatar Box */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-zinc-900 border-2 border-orange-500/40 shadow-2xl flex items-center justify-center text-4xl overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-extrabold text-orange-500">
                      {profile.name?.[0]?.toUpperCase() || '👤'}
                    </span>
                  )}
                </div>

                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg border-2 border-[#171622]">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {profile.name || 'User Profile'}
                  </h1>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <span>👑 Gold Member</span>
                  </span>
                </div>

                <p className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start space-x-2">
                  <EnvelopeIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{profile.email}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </p>

                {profile.phone && (
                  <p className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start space-x-2">
                    <PhoneIcon className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{profile.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-all flex items-center space-x-1.5"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center space-x-1.5 disabled:opacity-60"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center space-x-1.5 active:scale-95"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── 1. PERSONAL INFORMATION ────────────────────────────────────────────── */}
        <Section
          icon={UserIcon}
          title="Personal Information"
          subtitle="Update your basic contact details and public avatar."
        >
          <div className="space-y-5">
            {isEditing && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <ImageUpload
                  label="Profile Picture Avatar"
                  value={profile.avatar}
                  onChange={(url) => setProfile({ ...profile, avatar: url })}
                  context="avatar"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  disabled={!isEditing}
                  className={`w-full bg-zinc-900 border rounded-xl px-4 py-2.5 text-sm text-white transition-all ${
                    isEditing
                      ? 'border-zinc-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                      : 'border-zinc-800/80 opacity-75 cursor-not-allowed'
                  }`}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-zinc-400 opacity-60 cursor-not-allowed"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Email is linked to your primary account
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                disabled={!isEditing}
                className={`w-full bg-zinc-900 border rounded-xl px-4 py-2.5 text-sm text-white transition-all ${
                  isEditing
                    ? 'border-zinc-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                    : 'border-zinc-800/80 opacity-75 cursor-not-allowed'
                }`}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </Section>

        {/* ── 2. DELIVERY ADDRESS ───────────────────────────────────────────────── */}
        <Section
          icon={MapPinIcon}
          title="Delivery Address"
          subtitle="Your primary location for automated tiffin deliveries."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  key: 'street',
                  label: 'Street Address',
                  placeholder: '123 Main Road, Apartment 402',
                  span: true,
                },
                { key: 'city', label: 'City', placeholder: 'Bengaluru' },
                { key: 'state', label: 'State', placeholder: 'Karnataka' },
                { key: 'pincode', label: 'Pincode', placeholder: '560103' },
              ].map(({ key, label, placeholder, span }) => (
                <div key={key} className={span ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={profile.address[key]}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        address: { ...p.address, [key]: e.target.value },
                      }))
                    }
                    disabled={!isEditing}
                    className={`w-full bg-zinc-900 border rounded-xl px-4 py-2.5 text-sm text-white transition-all ${
                      isEditing
                        ? 'border-zinc-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                        : 'border-zinc-800/80 opacity-75 cursor-not-allowed'
                    }`}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            {/* Address Preview Card */}
            <div className="bg-zinc-900/80 border border-orange-500/30 rounded-2xl p-4 flex items-start space-x-3 mt-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPinIcon className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Default Delivery Location
                </span>
                <p className="text-xs font-semibold text-white pt-1">
                  {profile.address.street || 'No street specified'}
                </p>
                <p className="text-xs text-zinc-400">
                  {profile.address.city || 'City'}, {profile.address.state || 'State'} -{' '}
                  {profile.address.pincode || 'Pincode'}
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 3. SECURITY & CHANGE PASSWORD ──────────────────────────────────────── */}
        <Section
          icon={LockClosedIcon}
          title="Security & Password"
          subtitle="Ensure your account remains protected with a strong password."
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordInput
              label="Current Password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Enter your current password"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordInput
                label="New Password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Minimum 6 characters"
              />
              <PasswordInput
                label="Confirm New Password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <div className="flex items-center space-x-2 text-xs text-zinc-400">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                <span>Two-factor encryption enabled</span>
              </div>

              <button
                type="submit"
                disabled={pwSaving || !passwords.currentPassword || !passwords.newPassword}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 active:scale-95"
              >
                <LockClosedIcon className="w-4 h-4" />
                <span>{pwSaving ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </Section>

        {/* ── 4. NOTIFICATION PREFERENCES ────────────────────────────────────────── */}
        <Section
          icon={BellIcon}
          title="Notification Preferences"
          subtitle="Choose how you receive delivery tracking alerts and partner offers."
        >
          <div className="space-y-3">
            {[
              {
                key: 'deliveryUpdates',
                title: 'Live Delivery Updates',
                desc: 'Real-time SMS & Push alerts when delivery boy is on the way',
              },
              {
                key: 'whatsappAlerts',
                title: 'WhatsApp Order Updates',
                desc: 'Get meal menus and delivery time receipts via WhatsApp',
              },
              {
                key: 'emailPromos',
                title: 'Promotional Offers & News',
                desc: 'Special discount codes, referral rewards, and seasonal thali menus',
              },
            ].map((item) => (
              <div
                key={item.key}
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                }
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                </div>

                <div
                  className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${
                    notifications[item.key]
                      ? 'bg-orange-500 justify-end'
                      : 'bg-zinc-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default ProfilePage;
