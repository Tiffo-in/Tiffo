import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import { login as loginAction } from '../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/solid';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [userRole, setUserRole] = useState(searchParams.get('role') || 'user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm();

  const password = watch('password');
  const [isLoading, setIsLoading] = useState(false);

  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'partner':
        return '/partner/dashboard';
      default:
        return '/dashboard';
    }
  };

  // Handle successful Google token credential verification from Google Identity Services
  const handleGoogleCredentialResponse = async (response) => {
    setIsLoading(true);

    try {
      // Send token and selected role to our backend
      const res = await api.post('/auth/google', {
        idToken: response.credential,
        role: userRole,
      });

      if (res.data.success && res.data.user) {
        toast.success(`Welcome, ${res.data.user.name}!`);
        // Hydrate store state
        dispatch(loginAction({ user: res.data.user }));
        const redirectPath = getRedirectPath(res.data.user.role);
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id:
            process.env.REACT_APP_GOOGLE_CLIENT_ID ||
            '1008719970978-placeholder.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
          theme: 'outline',
          size: 'large',
          width: 220,
        });
      }
    };

    if (window.google) {
      initializeGoogle();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        script.addEventListener('load', initializeGoogle);
      }
    }
  }, [userRole]); // Re-initialize when role changes so backend gets the updated role

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const endpoint = userRole === 'partner' ? '/auth/register/partner' : '/auth/register';
      const response = await api.post(endpoint, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        businessName: data.businessName || data.name,
      });

      if (response.data.success) {
        toast.success('Registration successful!');
        dispatch({ type: 'auth/login', payload: response.data });
        navigate(userRole === 'partner' ? '/partner/dashboard' : '/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          setError(err.field, { type: 'manual', message: err.message });
        });
        toast.error('Please resolve the validation errors.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to register');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      id: 'user',
      title: 'Customer',
      description: 'Order delicious tiffins',
      emoji: '🍽️',
      activeColor:
        'ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    },
    {
      id: 'partner',
      title: 'Tiffin Partner',
      description: 'Start your food business',
      emoji: '👨‍🍳',
      activeColor:
        'ring-primary-500 bg-primary-50/50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
    },
  ];

  return (
    <div className="min-h-screen flex items-stretch bg-neutral-50 dark:bg-neutral-950 selection:bg-primary-200 selection:text-primary-900">
      {/* Left Panel - Image & Branding (Hidden on Mobile/Tablet) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-neutral-900">
        <div
          className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-[20s] ease-out"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 to-transparent" />

        <div className="relative z-10 flex flex-col justify-center w-full p-12 lg:p-16 text-white h-full">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
                Your journey to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                  great food
                </span>{' '}
                begins here.
              </h1>
              <p className="text-xl text-neutral-300 max-w-md leading-relaxed font-medium">
                Join thousands of food lovers enjoying daily authentic meals, or start your own
                tiffin business today.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl max-w-md shadow-2xl relative"
            >
              <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-primary-400" />
                Why join Tiffo?
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <SolidCheckCircleIcon className="w-6 h-6 text-green-400 shrink-0" />
                  <span className="text-neutral-200 font-medium">
                    100% Authentic homemade meals from verified local chefs.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <SolidCheckCircleIcon className="w-6 h-6 text-green-400 shrink-0" />
                  <span className="text-neutral-200 font-medium">
                    Flexible subscriptions — pause or cancel anytime.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <SolidCheckCircleIcon className="w-6 h-6 text-green-400 shrink-0" />
                  <span className="text-neutral-200 font-medium">
                    Empowering local communities and home cooks.
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12 relative dark:bg-neutral-950 overflow-y-auto">
        <motion.div
          className="w-full max-w-[480px] my-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="lg:hidden text-center mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-3xl font-black tracking-tight text-neutral-900 dark:text-white mb-2"
            >
              <img src="/logo.png" alt="Tiffo Logo" className="h-10 w-auto" /> Tiffo
              <span className="text-primary-500">.</span>
            </Link>
            <p className="text-neutral-500 dark:text-neutral-400">
              Join the homemade food revolution.
            </p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight">
              Create an account
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
              Ready for delicious home-cooked meals? Let's get started.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((option) => {
                  const isSelected = userRole === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setUserRole(option.id)}
                      className={`relative flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all duration-200 outline-none
                        ${
                          isSelected
                            ? `${option.activeColor} ring-2 ring-offset-2 dark:ring-offset-neutral-950`
                            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-500 dark:text-neutral-400'
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-primary-500 dark:text-primary-400">
                          <SolidCheckCircleIcon className="w-6 h-6" />
                        </div>
                      )}
                      <span className="text-3xl mb-3">{option.emoji}</span>
                      <h4
                        className={`font-bold text-base mb-1 ${isSelected ? 'text-neutral-900 dark:text-white' : ''}`}
                      >
                        {option.title}
                      </h4>
                      <p
                        className={`text-xs font-medium ${isSelected ? 'text-neutral-700 dark:text-neutral-300' : ''}`}
                      >
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {userRole === 'partner' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                      <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
                          Partner Verification
                        </p>
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-500/80 mt-1">
                          Your business details will be verified by our team before your account is
                          fully activated.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  {userRole === 'partner' ? 'Business Contact Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="w-5 h-5 text-neutral-400" />
                  </div>
                  <input
                    {...register('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                      maxLength: { value: 60, message: 'Name cannot exceed 60 characters' },
                    })}
                    type="text"
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl pl-12 pr-4 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                    <span>⚠️</span> {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
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
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl pl-12 pr-4 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                    <span>⚠️</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <PhoneIcon className="w-5 h-5 text-neutral-400" />
                  </div>
                  <input
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message:
                          'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)',
                      },
                    })}
                    type="tel"
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl pl-12 pr-4 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                    placeholder="9876543210"
                  />
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    Enter a 10-digit number starting with 6-9 (e.g. 9876543210, without country
                    code, spaces, or dashes)
                  </p>
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                    <span>⚠️</span> {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LockClosedIcon className="w-5 h-5 text-neutral-400" />
                    </div>
                    <input
                      {...register('password', {
                        required: 'Required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        pattern: {
                          value: /\d/,
                          message: 'Password must contain at least one number',
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl pl-11 pr-12 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-bold text-xs transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                      <span>⚠️</span> {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LockClosedIcon className="w-5 h-5 text-neutral-400" />
                    </div>
                    <input
                      {...register('confirmPassword', {
                        required: 'Required',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl pl-11 pr-12 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-bold text-xs transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                      <span>⚠️</span> {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="flex items-start cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 mr-3 mt-0.5 shrink-0">
                  <input
                    {...register('terms', { required: true })}
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-neutral-300 dark:border-neutral-700 rounded cursor-pointer checked:bg-primary-500 checked:border-primary-500 transition-colors"
                  />
                  <svg
                    className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                    viewBox="0 0 14 10"
                    fill="none"
                  >
                    <path
                      d="M1 5L4.5 8.5L13 1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold transition-colors"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1 ml-8">
                  <span>⚠️</span> You must accept the terms to continue
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-2"
            >
              <button
                type="submit"
                className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-lg py-4 rounded-xl font-black hover:bg-neutral-800 dark:hover:bg-neutral-100 focus:outline-none focus:ring-4 focus:ring-neutral-900/20 dark:focus:ring-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neutral-900/20 dark:shadow-white/10 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="relative pt-4 pb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="absolute inset-0 flex items-center pt-2">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-bold">
                  or continue with
                </span>
              </div>
            </motion.div>

            {/* Social Login */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {/* GIS Real Sign-In Button */}
              <div id="google-signin-button" className="w-full flex justify-center"></div>
            </motion.div>
          </form>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-black text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
