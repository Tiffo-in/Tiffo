import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const PRESET_COLORS = [
  { name: 'Red', hex: '#E23744' },
  { name: 'Orange', hex: '#FC8019' },
  { name: 'Green', hex: '#2D9A47' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Purple', hex: '#8B5CF6' },
];

const PRESET_ICONS = [
  { label: 'Gift Box', value: 'gift-outline' },
  { label: 'Bicycle Delivery', value: 'bicycle-outline' },
  { label: 'Restaurant / Chef', value: 'restaurant-outline' },
  { label: 'Sparkles', value: 'sparkles-outline' },
  { label: 'Star Rating', value: 'star-outline' },
  { label: 'Notification Bell', value: 'notifications-outline' },
];

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Form states
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    bg: '#E23744',
    icon: 'gift-outline',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/banners');
      if (res.data.success) {
        setBanners(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setForm({
      title: '',
      subtitle: '',
      bg: '#E23744',
      icon: 'gift-outline',
      order: banners.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      bg: banner.bg,
      icon: banner.icon,
      order: banner.order,
      isActive: banner.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subtitle.trim()) {
      toast.error('Title and subtitle are required');
      return;
    }

    try {
      if (editingBanner) {
        const res = await api.put(`/admin/banners/${editingBanner._id}`, form);
        if (res.data.success) {
          toast.success('Banner updated successfully');
          loadBanners();
          setShowModal(false);
        }
      } else {
        const res = await api.post('/admin/banners', form);
        if (res.data.success) {
          toast.success('Banner created successfully');
          loadBanners();
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const toggleActive = async (banner) => {
    try {
      const res = await api.put(`/admin/banners/${banner._id}`, {
        isActive: !banner.isActive,
      });
      if (res.data.success) {
        toast.success(`Banner status updated`);
        loadBanners();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      const res = await api.delete(`/admin/banners/${id}`);
      if (res.data.success) {
        toast.success('Banner deleted successfully');
        loadBanners();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/dashboard"
              className="p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                App Banners
              </h1>
              <p className="text-sm text-neutral-500">
                Manage promotional slides displayed on the mobile app home screen
              </p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="mt-4 md:mt-0 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Banner</span>
          </button>
        </div>

        {/* Banners Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center border border-neutral-100 dark:border-neutral-800">
            <p className="text-neutral-500">No banners found. Click "Add Banner" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <motion.div
                key={banner._id}
                layout
                className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col"
              >
                {/* Visual Preview */}
                <div
                  className="p-6 text-white flex flex-row items-center justify-between min-h-[110px]"
                  style={{ backgroundColor: banner.bg }}
                >
                  <div className="flex-1 pr-4">
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-75">
                      Order: {banner.order}
                    </span>
                    <h3 className="text-xl font-bold line-clamp-1">{banner.title}</h3>
                    <p className="text-xs text-white/80 line-clamp-2 mt-1">{banner.subtitle}</p>
                  </div>
                  <div className="text-white/90 bg-white/10 p-2.5 rounded-xl border border-white/20">
                    <span className="text-xs font-mono">{banner.icon}</span>
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-neutral-500">Status</span>
                    <button
                      onClick={() => toggleActive(banner)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        banner.isActive
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                      }`}
                    >
                      {banner.isActive ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-4 h-4" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex space-x-3 mt-auto">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="flex-1 flex items-center justify-center space-x-1.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200 dark:border-neutral-600 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-neutral-900/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-neutral-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-neutral-500 hover:text-neutral-750 dark:hover:text-white"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white focus:ring-2 focus:ring-red-500"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white focus:ring-2 focus:ring-red-500"
                      value={form.subtitle}
                      onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                      Background Color
                    </label>
                    <div className="flex flex-wrap gap-2.5 mb-3">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, bg: c.hex }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            form.bg === c.hex
                              ? 'border-neutral-900 dark:border-white scale-110 shadow-md'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="#HEXCOLOR"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-mono focus:ring-2 focus:ring-red-500"
                      value={form.bg}
                      onChange={(e) => setForm((f) => ({ ...f, bg: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Icon Name (Expo/Ionicons compatible)
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white focus:ring-2 focus:ring-red-500"
                      value={form.icon}
                      onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    >
                      {PRESET_ICONS.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label} ({icon.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Order
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white focus:ring-2 focus:ring-red-500"
                        value={form.order}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Visibility
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white focus:ring-2 focus:ring-red-500"
                        value={form.isActive ? 'yes' : 'no'}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, isActive: e.target.value === 'yes' }))
                        }
                      >
                        <option value="yes">Visible</option>
                        <option value="no">Hidden</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl shadow-md transition-colors"
                  >
                    {editingBanner ? 'Save Changes' : 'Create Banner'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
