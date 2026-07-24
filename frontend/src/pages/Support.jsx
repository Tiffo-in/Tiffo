import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

const faqs = [
  {
    q: 'How do I cancel or pause my subscription?',
    a: 'Go to your Dashboard → My Subscriptions → click "Manage" or "Pause Plan" on the active subscription. You can pause your subscription for up to 15 days per month without any charges.',
  },
  {
    q: 'What if my food delivery is delayed?',
    a: 'We strive for 100% on-time delivery within your selected slot. If your delivery is delayed past 30 minutes, contact our live support hotline for an automatic wallet credit refund.',
  },
  {
    q: 'How do refunds work?',
    a: 'Refunds for canceled orders or missed deliveries are processed within 2–4 hours to your Tiffo Wallet or 3–5 business days to your original bank payment method.',
  },
  {
    q: 'Can I change my delivery address mid-subscription?',
    a: 'Yes! Navigate to your Dashboard → Addresses or Profile Settings to update your delivery location at least 3 hours before your scheduled meal window.',
  },
  {
    q: 'How do I become a Tiffo kitchen partner?',
    a: 'Click "Become a Partner" in the top menu or register with the Partner role. After document verification (1–2 business days), you can start listing custom meal plans.',
  },
];

const Support = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/support', formData);
      if (response.data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success('Support ticket submitted successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header / Sub-Navbar */}
      <header className="border-b border-zinc-800/80 bg-[#111218]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
            alt="Support Backdrop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#171622] via-[#171622]/90 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-xl flex-shrink-0">
                <ChatBubbleLeftRightIcon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Help & Support</h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  We're here for you 24/7 · Mon–Sun 8:00 AM – 10:00 PM IST
                </p>
              </div>
            </div>

            {/* Quick Response Badge */}
            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl px-4 py-2.5 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <BoltIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Response Time
                </p>
                <p className="text-xs font-semibold text-white">Within 2–4 Hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT 8 COLS: Contact Form & FAQ */}
          <div className="lg:col-span-8 space-y-8">
            {/* Contact Form Card */}
            <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800/80 bg-[#161722] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <EnvelopeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Send Us a Message</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Fill out your issue details below.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  Online
                </span>
              </div>

              {submitted ? (
                <div className="p-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircleIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Request Submitted!</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    We've received your ticket and assigned a support agent. Expect a detailed
                    response in your email within 2–4 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                  >
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Subject / Category *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                      required
                    >
                      <option value="">Select a issue category</option>
                      <option value="order">🍱 Order & Delivery Issue</option>
                      <option value="payment">💳 Payment & Refund Query</option>
                      <option value="delivery">📍 Address / Delivery Slot Change</option>
                      <option value="subscription">📦 Pause / Resume Subscription</option>
                      <option value="partner">🧑‍🍳 Partner / Kitchen Inquiry</option>
                      <option value="account">⚙️ Profile & Account Help</option>
                      <option value="other">❓ Other Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                      placeholder="Describe your query or problem in detail..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95"
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Ticket...</span>
                      </span>
                    ) : (
                      <span>Submit Support Ticket</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* FAQ Accordion Card */}
            <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800/80 bg-[#161722] flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <QuestionMarkCircleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Frequently Asked Questions</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Quick answers to common questions.</p>
                </div>
              </div>

              <div className="divide-y divide-zinc-800/80">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors group"
                    >
                      <span className="font-semibold text-sm text-zinc-200 group-hover:text-white pr-4">
                        {faq.q}
                      </span>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-orange-400 transition-transform duration-200 flex-shrink-0 ${
                          openFaq === i ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-4 text-xs text-zinc-400 leading-relaxed bg-zinc-950/40"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLS: Contact Info Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Direct Channels Card */}
            <div className="bg-[#14151e] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-5 text-white">
                <h3 className="font-bold text-base">Direct Channels</h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Reach out via email or phone hotline.
                </p>
              </div>

              <div className="p-5 space-y-4">
                {/* Email */}
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
                    <EnvelopeIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Email Support
                    </p>
                    <a
                      href="mailto:support@tiffo.in"
                      className="text-xs font-semibold text-white hover:text-orange-400 transition-colors"
                    >
                      support@tiffo.in
                    </a>
                  </div>
                </div>

                {/* Phone — only shown when a real support number is configured */}
                {process.env.REACT_APP_SUPPORT_PHONE && (
                  <div className="flex items-start space-x-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <PhoneIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Phone Support
                      </p>
                      <a
                        href={`tel:${process.env.REACT_APP_SUPPORT_PHONE}`}
                        className="text-xs font-semibold text-white hover:text-emerald-400 transition-colors"
                      >
                        {process.env.REACT_APP_SUPPORT_PHONE}
                      </a>
                    </div>
                  </div>
                )}

                {/* Operating Hours */}
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Support Hours
                    </p>
                    <p className="text-xs font-semibold text-white">Mon – Sun</p>
                    <p className="text-[11px] text-zinc-400">8:00 AM – 10:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Chat Feature Widget */}
            <div className="bg-gradient-to-br from-[#1b1a26] via-[#161522] to-[#12111a] border border-orange-500/20 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Priority Concierge</h4>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                As a registered user, your support requests automatically receive high priority
                routing for instant resolution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
