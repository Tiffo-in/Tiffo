import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch relative">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute bottom-32 right-20 w-80 h-80 bg-white/10 rounded-full"
            animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="text-6xl mb-6">🔐</div>
            <h1 className="text-4xl font-black mb-4 leading-tight">
              Reset your<br />
              <span className="text-white/90">TIFFO password</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Don't worry, it happens to the best of us. Enter your email and we'll send you a reset link.
            </p>
            <div className="mt-8 space-y-3">
              {['Secure reset link sent to your email', 'Link expires in 1 hour', 'Your account stays safe'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-white/80">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-neutral-50 px-6 py-12 relative">
        <div className="absolute top-10 right-10 text-5xl opacity-5">🍱</div>
        <div className="absolute bottom-20 left-10 text-4xl opacity-5">🔐</div>

        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl mb-4 block">🔐</span>
            <h2 className="text-2xl font-bold gradient-text">TIFFO</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            {!sent ? (
              <>
                <div className="mb-8">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 transition-colors mb-6"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to login
                  </Link>
                  <h2 className="text-3xl font-black text-neutral-900 mb-2">Forgot password?</h2>
                  <p className="text-neutral-500">
                    Enter the email associated with your account and we'll send you a password reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="fp-email" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        id="fp-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Enter your email"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary text-lg py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </motion.button>

                  <p className="text-center text-neutral-600 text-sm">
                    Remember your password?{' '}
                    <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                      Sign in
                    </Link>
                  </p>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-black text-neutral-900 mb-3">Check your email</h2>
                <p className="text-neutral-600 mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="font-semibold text-primary-600 mb-6">{email}</p>
                <p className="text-sm text-neutral-500 mb-8">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="text-primary-500 font-semibold hover:text-primary-600"
                  >
                    try again
                  </button>.
                </p>
                <Link
                  to="/login"
                  className="btn-primary inline-block"
                >
                  Back to Login
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
