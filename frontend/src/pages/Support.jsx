import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, ClockIcon, ChatBubbleLeftRightIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import api from '../services/api';

const faqs = [
  { q: 'How do I cancel my subscription?', a: 'Go to your Dashboard → My Subscriptions → click "Manage" on the plan you want to cancel. Changes apply from the next billing cycle.' },
  { q: 'What if my food is late?', a: 'Contact our support immediately via this form or call us. For delays over 30 minutes, you are eligible for a partial refund or credit.' },
  { q: 'How do refunds work?', a: 'Refunds are processed within 5–7 business days to your original payment method. Partial refunds for missed deliveries are credited to your wallet instantly.' },
  { q: 'Can I pause my subscription?', a: 'Yes! From your Dashboard, you can pause your subscription for up to 15 days per month without any charges.' },
  { q: 'How do I become a tiffin partner?', a: 'Register on our platform with the "Partner" role. Once your documents are verified (1–2 business days), you can start listing tiffins.' },
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
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Help & Support</h1>
                <p className="text-white/80 text-sm mt-0.5">We're here to help · Mon–Sun 8AM–10PM</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-100 dark:border-neutral-800 overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <EnvelopeIcon className="w-5 h-5 text-primary-600" />
                  Contact Us
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">We respond within 2–4 hours on business days.</p>
              </div>

              {submitted ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-9 h-9 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Request Submitted!</h3>
                  <p className="text-neutral-500 mb-6">We've received your message and will respond within 2–4 hours.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-primary"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field w-full"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field w-full"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Subject *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="input-field w-full"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="order">Order Issue</option>
                      <option value="payment">Payment Problem</option>
                      <option value="delivery">Delivery Issue</option>
                      <option value="subscription">Subscription Help</option>
                      <option value="partner">Partner Inquiry</option>
                      <option value="account">Account Help</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Message *</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="input-field w-full resize-none"
                      placeholder="Describe your issue in detail..."
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3.5 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : 'Submit Request'}
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-100 dark:border-neutral-800 mt-6 overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-primary-600" />
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <span className="font-medium text-neutral-800 dark:text-neutral-200 pr-4">{faq.q}</span>
                      <span className={`text-2xl text-primary-500 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-6 pb-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-100 dark:border-neutral-800 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary-600 to-secondary-500 p-5 text-white">
                <h3 className="font-bold text-lg">Contact Information</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <EnvelopeIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Email</p>
                    <a href="mailto:support@tiffo.com" className="text-neutral-800 dark:text-neutral-200 font-medium hover:text-primary-600 transition-colors">
                      support@tiffo.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <PhoneIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Phone</p>
                    <a href="tel:+919876543210" className="text-neutral-800 dark:text-neutral-200 font-medium hover:text-primary-600 transition-colors">
                      +91 98765 43210
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Business Hours</p>
                    <p className="text-neutral-800 dark:text-neutral-200 font-medium">Mon–Sun</p>
                    <p className="text-neutral-500 text-sm">8:00 AM – 10:00 PM IST</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl border border-primary-100 dark:border-primary-900/30 p-5"
            >
              <p className="font-bold text-primary-900 dark:text-primary-200 mb-1">⚡ Average Response Time</p>
              <p className="text-primary-700 dark:text-primary-300 text-sm">We typically respond within <strong>2–4 hours</strong> during business hours.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;