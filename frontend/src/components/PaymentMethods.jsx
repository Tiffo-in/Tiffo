import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  success: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircleIcon, label: 'Success' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: ClockIcon,        label: 'Pending' },
  failed:  { bg: 'bg-red-100',   text: 'text-red-700',   icon: XCircleIcon,      label: 'Failed'  },
  refunded:{ bg: 'bg-blue-100',  text: 'text-blue-700',  icon: ArrowPathIcon,    label: 'Refunded'},
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] ?? {
    bg: 'bg-neutral-100', text: 'text-neutral-600',
    icon: InformationCircleIcon, label: status ?? 'Unknown'
  };

const fmt = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-16 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200"
  >
    <div className="text-6xl mb-4">💳</div>
    <h3 className="text-xl font-semibold text-neutral-700 mb-2">No transactions yet</h3>
    <p className="text-neutral-500">Your payment history will appear here after your first subscription.</p>
  </motion.div>
);

// ─── Transaction row ──────────────────────────────────────────────────────────
const TransactionRow = ({ payment, index }) => {
  const cfg = getStatusConfig(payment.status);
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md border border-neutral-100 transition-shadow"
    >
      <div className="flex items-center space-x-4">
        {/* Type icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          payment.type === 'refund'
            ? 'bg-blue-50 text-blue-500'
            : 'bg-primary-50 text-primary-500'
        }`}>
          {payment.type === 'refund'
            ? <ArrowPathIcon className="w-6 h-6" />
            : <CreditCardIcon className="w-6 h-6" />}
        </div>

        <div>
          <p className="font-semibold text-neutral-900">
            {payment.type === 'refund' ? 'Refund' : 'Subscription Payment'}
          </p>
          {payment.subscriptionId && (
            <p className="text-sm text-neutral-500 capitalize">
              {payment.subscriptionId.plan
                ? `${payment.subscriptionId.plan} plan`
                : payment.orderId || payment.paymentId || '—'}
            </p>
          )}
          <p className="text-xs text-neutral-400 mt-0.5">{fmt(payment.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:flex-row-reverse">
        <p className={`text-xl font-bold ${payment.type === 'refund' ? 'text-blue-600' : 'text-neutral-900'}`}>
          {payment.type === 'refund' ? '−' : ''}₹{(payment.amount ?? 0).toLocaleString('en-IN')}
        </p>
        <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{cfg.label}</span>
        </span>
      </div>
    </motion.div>
  );
};

// ─── "How payments work" info panel ──────────────────────────────────────────
const HowItWorks = () => (
  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
    <div className="flex items-center space-x-2 text-blue-700 font-semibold">
      <InformationCircleIcon className="w-5 h-5" />
      <span>How Payments Work on Tiffo</span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-800">
      <div className="flex items-start space-x-2">
        <CreditCardIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
        <div>
          <p className="font-medium">Cards</p>
          <p className="text-blue-600">Visa, Mastercard, RuPay accepted securely via Razorpay.</p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <DevicePhoneMobileIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
        <div>
          <p className="font-medium">UPI</p>
          <p className="text-blue-600">Pay with any UPI app — GPay, PhonePe, Paytm & more.</p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <ShieldCheckIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
        <div>
          <p className="font-medium">Secure & Encrypted</p>
          <p className="text-blue-600">PCI-DSS compliant. We never store card details.</p>
        </div>
      </div>
    </div>
  </div>
);

// ─── Summary stats ────────────────────────────────────────────────────────────
const SummaryStats = ({ payments }) => {
  const successful = payments.filter(p => p.status === 'success' && p.type !== 'refund');
  const refunded   = payments.filter(p => p.type === 'refund');
  const failed     = payments.filter(p => p.status === 'failed');
  const totalSpent = successful.reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        { label: 'Total Spent',    value: `₹${totalSpent.toLocaleString('en-IN')}`, color: 'text-primary-600', bg: 'bg-primary-50' },
        { label: 'Transactions',   value: successful.length, color: 'text-green-600',   bg: 'bg-green-50'   },
        { label: 'Refunds',        value: refunded.length,   color: 'text-blue-600',    bg: 'bg-blue-50'    },
        { label: 'Failed',         value: failed.length,     color: 'text-red-600',     bg: 'bg-red-50'     },
      ].map(({ label, value, color, bg }) => (
        <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-neutral-500 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const PaymentMethods = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = { limit: 10, page };
      if (filter !== 'all') {
        if (['success', 'pending', 'failed'].includes(filter)) params.status = filter;
        if (['payment', 'refund'].includes(filter)) params.type = filter;
      }
      const res = await api.get('/payments/history', { params });
      setPayments(res.data.payments ?? []);
      setPagination(res.data.pagination ?? { total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to load payment history:', err);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments; // server-side filtered

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Payments & Billing</h2>
          <p className="text-neutral-500 mt-1">Your complete transaction history</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="input-field py-2 px-4 text-sm"
          >
            <option value="all">All Transactions</option>
            <option value="success">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refund">Refunds</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchPayments()}
            className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 text-neutral-500 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-100 rounded-xl">
        <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <ShieldCheckIcon className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">Your payments are secure</p>
          <p className="text-xs text-green-600">All transactions are processed via Razorpay — PCI-DSS Level 1 certified</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-48">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-primary-200 rounded-full" />
            <div className="absolute top-0 w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="mt-4 text-neutral-500 text-sm">Loading transactions…</p>
        </div>
      ) : (
        <>
          {/* Summary cards — only show when we have data */}
          {payments.length > 0 && <SummaryStats payments={payments} />}

          {/* Transaction list */}
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((payment, index) => (
                  <TransactionRow key={payment._id} payment={payment} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-3 pt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm text-neutral-500">
                Page {page} of {pagination.pages}
              </span>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Info panel — always visible */}
      <HowItWorks />
    </div>
  );
};

export default PaymentMethods;