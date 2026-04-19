import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [userRole, setUserRole] = useState(searchParams.get('role') || 'user');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: userRole
      });

      if (response.data.success) {
        toast.success('Registration successful!');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        navigate(userRole === 'partner' ? '/partner/dashboard' : '/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      id: 'user',
      title: 'Customer',
      description: 'Order delicious homemade tiffins',
      icon: UserGroupIcon,
      emoji: '🍽️',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      features: ['Browse local tiffin services', 'Flexible meal plans', 'Easy online payments']
    },
    {
      id: 'partner',
      title: 'Tiffin Partner',
      description: 'Start your tiffin business',
      icon: BuildingStorefrontIcon,
      emoji: '👨‍🍳',
      color: 'from-primary-500 to-secondary-500',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-300',
      features: ['Manage your menu', 'Track earnings', 'Grow your business']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-xl mb-4"
          >
            <span className="text-4xl">🍱</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Join <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">TIFFO</span>
          </h2>
          <p className="text-neutral-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden">
          {/* Role Selection */}
          <div className="p-6 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary-500" />
              Choose your account type
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {roleOptions.map((option) => {
                const isSelected = userRole === option.id;

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserRole(option.id)}
                    className={`relative p-5 rounded-2xl text-left transition-all duration-300 border-2 ${isSelected
                      ? `${option.borderColor} ${option.bgColor} shadow-lg`
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3"
                      >
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      </motion.div>
                    )}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center mb-3 shadow-lg`}>
                      <span className="text-2xl">{option.emoji}</span>
                    </div>
                    <h4 className="font-bold text-neutral-900 mb-1">{option.title}</h4>
                    <p className="text-sm text-neutral-500">{option.description}</p>
                  </motion.button>
                );
              })}
            </div>

            {/* Role Info Banner */}
            <AnimatePresence mode="wait">
              <motion.div
                key={userRole}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="mt-4"
              >
                {userRole === 'partner' ? (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Partner Verification Required</p>
                      <p className="text-xs text-amber-600 mt-0.5">Business details will be verified before activation.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Quick Customer Registration</p>
                      <p className="text-xs text-blue-600 mt-0.5">You can also sign in with Google for faster access.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form */}
          <form className="p-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-neutral-400" />
                </div>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className={`input-field pl-12 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {errors.name.message}
                </motion.p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="w-5 h-5 text-neutral-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className={`input-field pl-12 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <PhoneIcon className="w-5 h-5 text-neutral-400" />
                </div>
                <input
                  {...register('phone', { required: 'Phone number is required' })}
                  type="tel"
                  className={`input-field pl-12 ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                  placeholder="+91 98765 43210"
                />
              </div>
              {errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {errors.phone.message}
                </motion.p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="w-5 h-5 text-neutral-400" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Min 6 characters',
                      },
                    })}
                    type="password"
                    className={`input-field pl-12 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                    placeholder="Create password"
                  />
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                  >
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="w-5 h-5 text-neutral-400" />
                  </div>
                  <input
                    {...register('confirmPassword', {
                      required: 'Confirm password',
                      validate: (value) =>
                        value === password || 'Passwords don\'t match',
                    })}
                    type="password"
                    className={`input-field pl-12 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                    placeholder="Confirm password"
                  />
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                  >
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
              <input
                type="checkbox"
                {...register('terms', { required: true })}
                className="mt-1 w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
              />
              <p className="text-sm text-neutral-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:underline font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
              ) : (
                <SparklesIcon className="w-5 h-5" />
              )}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </motion.button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500">or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-neutral-50 transition-all font-medium text-neutral-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                <span>🚀</span>
                Quick Demo
              </motion.button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Protected by reCAPTCHA and subject to our{' '}
          <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;