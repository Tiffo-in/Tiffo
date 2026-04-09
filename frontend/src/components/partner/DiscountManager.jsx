import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  TagIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const DiscountManager = ({ tiffin, onSaved }) => {
  const [form, setForm] = useState({
    weekly:    tiffin.discount?.weekly    ?? 0,
    monthly:   tiffin.discount?.monthly   ?? 0,
    isActive:  tiffin.discount?.isActive  ?? false,
    label:     tiffin.discount?.label     ?? '',
    expiresAt: tiffin.discount?.expiresAt
      ? new Date(tiffin.discount.expiresAt).toISOString().split('T')[0]
      : ''
  });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const dailyPrice = tiffin.price?.daily || 0;

  const previewWeekly  = Math.round(dailyPrice * 7  * (1 - form.weekly  / 100));
  const previewMonthly = Math.round(dailyPrice * 30 * (1 - form.monthly / 100));
  const origWeekly     = Math.round(dailyPrice * 7);
  const origMonthly    = Math.round(dailyPrice * 30);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/tiffins/${tiffin._id}/discount`, {
        weekly:    Number(form.weekly),
        monthly:   Number(form.monthly),
        isActive:  form.isActive,
        label:     form.label,
        expiresAt: form.expiresAt || null
      });
      toast.success(`Discount saved for "${tiffin.title}"!`);
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save discount');
    } finally {
      setSaving(false);
    }
  };

  const isDiscountExpired = form.expiresAt && new Date(form.expiresAt) < new Date();

  return (
    <motion.div
      layout
      className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        form.isActive && !isDiscountExpired
          ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
          : 'border-neutral-200 bg-white'
      }`}
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-neutral-900 text-base truncate">{tiffin.title}</h3>
            <p className="text-sm text-neutral-500 mt-0.5 capitalize">
              {tiffin.mealType} · {tiffin.cuisine}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-primary-600">₹{dailyPrice}</span>
              <span className="text-xs text-neutral-400">/day base price</span>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                form.isActive ? 'bg-green-500' : 'bg-neutral-300'
              }`}
            >
              <motion.span
                layout
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                animate={{ left: form.isActive ? '28px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-xs font-semibold ${form.isActive ? 'text-green-600' : 'text-neutral-400'}`}>
              {form.isActive ? 'Active' : 'Off'}
            </span>
          </div>
        </div>

        {/* Status pill */}
        {form.isActive && (
          <div className="mt-3">
            {isDiscountExpired ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                <XCircleIcon className="w-3.5 h-3.5" /> Expired
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                {form.weekly > 0 || form.monthly > 0 ? 'Discount Live' : 'Active (no discount set)'}
              </span>
            )}
          </div>
        )}

        {/* Expand/collapse settings */}
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="mt-4 w-full text-sm text-primary-600 font-semibold flex items-center justify-center gap-1 hover:text-primary-700"
        >
          {expanded ? '▲ Hide settings' : '▼ Configure discount'}
        </button>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="settings"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-neutral-100 overflow-hidden"
          >
            <div className="p-5 space-y-5">

              {/* Percentages */}
              <div className="grid grid-cols-2 gap-4">
                {/* Weekly */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Weekly discount
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0" max="70" step="1"
                      value={form.weekly}
                      onChange={e => setForm(f => ({ ...f, weekly: Number(e.target.value) }))}
                      className="flex-1 accent-primary-500"
                    />
                    <span className="w-10 text-center font-bold text-primary-600 text-sm">{form.weekly}%</span>
                  </div>
                  {form.weekly > 0 && (
                    <div className="mt-1 text-xs text-green-600 font-medium">
                      ₹{origWeekly} → <span className="font-bold">₹{previewWeekly}</span>/week
                    </div>
                  )}
                </div>

                {/* Monthly */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Monthly discount
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0" max="70" step="1"
                      value={form.monthly}
                      onChange={e => setForm(f => ({ ...f, monthly: Number(e.target.value) }))}
                      className="flex-1 accent-primary-500"
                    />
                    <span className="w-10 text-center font-bold text-primary-600 text-sm">{form.monthly}%</span>
                  </div>
                  {form.monthly > 0 && (
                    <div className="mt-1 text-xs text-green-600 font-medium">
                      ₹{origMonthly} → <span className="font-bold">₹{previewMonthly}</span>/month
                    </div>
                  )}
                </div>
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5 flex items-center gap-1">
                  <TagIcon className="w-4 h-4" /> Offer label (optional)
                </label>
                <input
                  type="text"
                  value={form.label}
                  maxLength={40}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder='e.g. "Summer Sale", "Festival Offer"'
                  className="input-field text-sm"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5 flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" /> Offer expires on (optional)
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="input-field text-sm"
                />
                {form.expiresAt && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, expiresAt: '' }))}
                    className="text-xs text-neutral-400 hover:text-red-500 mt-1"
                  >
                    Clear expiry
                  </button>
                )}
              </div>

              {/* Price preview */}
              {(form.weekly > 0 || form.monthly > 0) && (
                <div className="bg-primary-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-primary-700 mb-2 uppercase tracking-wider">Price Preview</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Daily</div>
                      <div className="font-bold text-neutral-900">₹{dailyPrice}</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Weekly</div>
                      {form.weekly > 0 ? (
                        <>
                          <div className="text-xs text-neutral-400 line-through">₹{origWeekly}</div>
                          <div className="font-bold text-green-600">₹{previewWeekly}</div>
                        </>
                      ) : (
                        <div className="font-bold text-neutral-900">₹{origWeekly}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Monthly</div>
                      {form.monthly > 0 ? (
                        <>
                          <div className="text-xs text-neutral-400 line-through">₹{origMonthly}</div>
                          <div className="font-bold text-green-600">₹{previewMonthly}</div>
                        </>
                      ) : (
                        <div className="font-bold text-neutral-900">₹{origMonthly}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Save */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? '⏳ Saving...' : '💾 Save Discount Settings'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiscountManager;
