import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import api from '../services/api';
import { login as loginAction } from '../store/slices/authSlice';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import RoleSelector from '../components/auth/RoleSelector';
import FormField from '../components/auth/FormField';
import { useTheme } from '../contexts/ThemeContext';

const REGISTER_BENEFITS = [
  '100% Authentic homemade meals from verified local chefs.',
  'Flexible subscriptions — pause or cancel anytime.',
  'Empowering local communities and home cooks.',
];

const Register = () => {
  const [searchParams] = useSearchParams();
  const [userRole, setUserRole] = useState(searchParams.get('role') || 'user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useTheme();
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

  // Google Sign-In issues a real session immediately (no email verification
  // step), so hydrating the store and redirecting is correct here.
  const handleGoogleCredentialResponse = async (response) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/google', {
        idToken: response.credential,
        role: userRole,
      });
      if (res.data.success && res.data.user) {
        dispatch(loginAction({ user: res.data.user }));
        toast.success(`Welcome, ${res.data.user.name}!`);
        navigate(getRedirectPath(res.data.user.role), { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-up failed. Please try again.');
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
        const container = document.getElementById('google-signin-button');
        if (!container) return;
        // Re-rendering on role/theme change would otherwise stack a second button.
        container.innerHTML = '';
        // GSI buttons render at a fixed pixel width (Google caps it at 400)
        // and never shrink, so a hardcoded width overflows small screens —
        // derive the width from the container instead.
        window.google.accounts.id.renderButton(container, {
          theme: isDark ? 'filled_black' : 'outline',
          size: 'large',
          width: Math.min(400, container.offsetWidth || 400),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, isDark]); // Re-initialize when role or theme changes

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
        // Email/password registration issues NO session — the account must be
        // email-verified first, so send the user to Login with the message.
        toast.success(
          response.data.message ||
            'Registration successful! Please check your email to verify your account.',
          { duration: 6000 }
        );
        navigate('/login');
      }
    } catch (error) {
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

  return (
    <div className="min-h-screen flex items-stretch bg-surface-page selection:bg-primary-200 selection:text-primary-900">
      <AuthBrandPanel
        image="/register.jpeg"
        heading={
          <>
            Your journey to <br />
            <span className="text-primary-400">great food</span>
            {''}
            begins here.
          </>
        }
        subheading="Join thousands of food lovers enjoying daily authentic meals, or start your own tiffin business today."
        benefitsTitle="Why join Tiffo?"
        benefits={REGISTER_BENEFITS}
      />

      {/* No justify-center here: with overflow-y-auto it would clip the top of an
 overflowing form and make it unscrollable — the card's my-auto centers it
 when it fits. pt-28 clears the fixed navbar (~88px). */}
      <div className="flex-1 flex flex-col items-center px-6 sm:px-12 pt-28 pb-12 relative overflow-y-auto">
        <motion.div
          className="w-full max-w-[440px] my-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="lg:hidden text-center mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-3xl font-black tracking-tight text-neutral-900 mb-2"
            >
              <img src="/logo.png" alt="Tiffo Logo" className="h-10 w-auto" /> Tiffo
              <span className="text-brand-ink">.</span>
            </Link>
            <p className="text-neutral-500">Join the homemade food revolution.</p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">
              Create an account
            </h2>
            <p className="text-neutral-500 font-medium">
              Ready for delicious home-cooked meals? Let's get started.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <RoleSelector value={userRole} onChange={setUserRole} />

            <div className="space-y-5">
              <FormField
                label={userRole === 'partner' ? 'Business Contact Name' : 'Full Name'}
                icon={UserIcon}
                placeholder="John Doe"
                registration={register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 60, message: 'Name cannot exceed 60 characters' },
                })}
                error={errors.name}
              />

              <FormField
                label="Email Address"
                icon={EnvelopeIcon}
                type="email"
                placeholder="name@example.com"
                registration={register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                })}
                error={errors.email}
              />

              <FormField
                label="Phone Number"
                icon={PhoneIcon}
                type="tel"
                placeholder="9876543210"
                helperText="Enter a 10-digit number starting with 6-9 (e.g. 9876543210, without country code, spaces, or dashes)"
                registration={register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message:
                      'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)',
                  },
                })}
                error={errors.phone}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  label="Password"
                  icon={LockClosedIcon}
                  placeholder="••••••••"
                  showToggle
                  shown={showPassword}
                  onToggleShown={() => setShowPassword((s) => !s)}
                  registration={register('password', {
                    required: 'Required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: { value: /\d/, message: 'Password must contain at least one number' },
                  })}
                  error={errors.password}
                />

                <FormField
                  label="Confirm Password"
                  icon={LockClosedIcon}
                  placeholder="••••••••"
                  showToggle
                  shown={showConfirmPassword}
                  onToggleShown={() => setShowConfirmPassword((s) => !s)}
                  registration={register('confirmPassword', {
                    required: 'Required',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  error={errors.confirmPassword}
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 mr-3 mt-0.5 shrink-0">
                  <input
                    {...register('terms', { required: true })}
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-neutral-300 rounded cursor-pointer checked:bg-primary-500 checked:border-primary-500 transition-colors"
                  />
                  <svg
                    className="absolute w-3 h-3 text-on-brand opacity-0 peer-checked:opacity-100 pointer-events-none"
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
                <span className="text-sm font-medium text-neutral-600 leading-relaxed">
                  I agree to the{''}
                  <Link
                    to="/terms"
                    className="text-primary-600 hover:text-primary-700 font-bold transition-colors"
                  >
                    Terms of Service
                  </Link>
                  {''}
                  and{''}
                  <Link
                    to="/privacy"
                    className="text-primary-600 hover:text-primary-700 font-bold transition-colors"
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
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary w-full text-lg py-4 font-black focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </div>

            <div className="relative pt-4 pb-2">
              <div className="absolute inset-0 flex items-center pt-2">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface-page text-neutral-500 font-bold">
                  or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div id="google-signin-button" className="w-full flex justify-center"></div>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-neutral-600 font-medium">
              Already have an account?{''}
              <Link
                to="/login"
                className="font-black text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
