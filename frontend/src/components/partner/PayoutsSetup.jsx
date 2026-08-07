import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import api from '../../services/api';

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
      <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8 text-center">
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

      <div className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
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
            <p className="text-xs text-neutral-500 mt-1">
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

export default PayoutsSetup;
