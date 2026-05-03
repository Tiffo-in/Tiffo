import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  LockClosedIcon,
  CheckCircleIcon,
  PencilIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { loginAction } from '../store/slices/authSlice';
import ImageUpload from '../components/ImageUpload';

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden"
  >
    <div className="flex items-center space-x-3 px-6 py-4 border-b border-neutral-100 bg-neutral-50">
      <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary-600" />
      </div>
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

// ─── Password field with eye toggle ──────────────────────────────────────────
const PasswordInput = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input-field pr-12"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ProfilePage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [pwSaving, setPwSaving]   = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', avatar: '',
    address: { street: '', city: '', state: '', pincode: '' }
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          const u = res.data.user;
          setProfile({
            name:  u.name  || '',
            email: u.email || '',
            phone: u.phone || '',
            avatar: u.avatar || '',
            address: {
              street:  u.address?.street  || '',
              city:    u.address?.city    || '',
              state:   u.address?.state   || '',
              pincode: u.address?.pincode || ''
            }
          });
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Save profile ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    try {
      setSaving(true);
      const res = await api.put('/auth/me', {
        name:    profile.name,
        phone:   profile.phone,
        avatar:  profile.avatar,
        address: profile.address
      });
      if (res.data.success) {
        // Update Redux store with fresh user data from API (no localStorage needed)
        dispatch(loginAction({ user: res.data.user }));
        toast.success('Profile updated!');
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match'); return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    try {
      setPwSaving(true);
      const res = await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full" />
          <div className="absolute top-0 w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-500 dark:from-primary-900 dark:via-primary-800 dark:to-secondary-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-4 py-10 relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl text-4xl overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.name?.[0]?.toUpperCase() || '👤'
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{profile.name || 'Your Profile'}</h1>
              <p className="text-white/75 mt-1">{profile.email}</p>
              {profile.phone && <p className="text-white/60 text-sm">{profile.phone}</p>}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── Personal Info ─────────────────────────────────────────────── */}
        <Section icon={UserIcon} title="Personal Information">
          <div className="space-y-4">
            
            {isEditing && (
              <ImageUpload
                label="Profile Picture"
                value={profile.avatar}
                onChange={(url) => setProfile({ ...profile, avatar: url })}
                context="avatar"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="input-field opacity-60 cursor-not-allowed"
                  placeholder="email@example.com"
                />
                <p className="text-xs text-neutral-400 mt-1">Email cannot be changed</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <PhoneIcon className="w-4 h-4 inline mr-1" />Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                disabled={!isEditing}
                className="input-field"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {isEditing ? (
                <>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors text-sm font-medium"
                  >
                    <XMarkIcon className="w-4 h-4" /> Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 text-sm"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    {saving ? 'Saving…' : 'Save Changes'}
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl border border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors text-sm font-medium"
                >
                  <PencilIcon className="w-4 h-4" /> Edit Profile
                </motion.button>
              )}
            </div>
          </div>
        </Section>

        {/* ── Delivery Address ───────────────────────────────────────────── */}
        <Section icon={MapPinIcon} title="Delivery Address">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'street',  label: 'Street Address', placeholder: '123 Main Road', span: true },
              { key: 'city',    label: 'City',           placeholder: 'New Delhi' },
              { key: 'state',   label: 'State',          placeholder: 'Delhi' },
              { key: 'pincode', label: 'Pincode',        placeholder: '110001' },
            ].map(({ key, label, placeholder, span }) => (
              <div key={key} className={span ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={profile.address[key]}
                  onChange={e => setProfile(p => ({
                    ...p, address: { ...p.address, [key]: e.target.value }
                  }))}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Change Password ────────────────────────────────────────────── */}
        <Section icon={LockClosedIcon} title="Change Password">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordInput
              label="Current Password"
              value={passwords.currentPassword}
              onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Enter current password"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PasswordInput
                label="New Password"
                value={passwords.newPassword}
                onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min. 6 characters"
              />
              <PasswordInput
                label="Confirm New Password"
                value={passwords.confirmPassword}
                onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password"
              />
            </div>
            <div className="flex justify-end pt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={pwSaving || !passwords.currentPassword || !passwords.newPassword}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-neutral-800 to-neutral-900 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm"
              >
                <LockClosedIcon className="w-4 h-4" />
                {pwSaving ? 'Updating…' : 'Update Password'}
              </motion.button>
            </div>
          </form>
        </Section>

      </div>
    </div>
  );
};

export default ProfilePage;
