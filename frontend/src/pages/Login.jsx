import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import SuccessAnimation from '../components/SuccessAnimation';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import FormField from '../components/auth/FormField';
import { useTheme } from '../contexts/ThemeContext';
import { login as loginAction } from '../store/slices/authSlice';
import api from '../services/api';

// Build-time value (inlined by Vite), not a runtime lookup — see cloudbuild.yaml.
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleUnavailable, setGoogleUnavailable] = useState(false);
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Handle successful Google token credential verification from Google Identity Services
  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    setIsLoading(true);

    try {
      // Dispatch through Redux so state.auth is updated for all consumers (Navbar, etc.)
      const res = await api.post('/auth/google', {
        idToken: response.credential,
        role: 'user',
      });

      if (res.data.success && res.data.user) {
        // Hydrate store state
        dispatch(loginAction({ user: res.data.user }));
        setUserName(res.data.user.name);
        setShowSuccess(true);
        const redirectPath = getRedirectPath(res.data.user.role);
        setTimeout(() => {
          setShowSuccess(false);
          navigate(redirectPath, { replace: true });
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // No placeholder fallback here on purpose. This value is inlined at build
    // time; when the build arg is missing it collapses to '' and a stand-in
    // client ID would render a button that fails against a nonexistent OAuth
    // client. Better to surface the misconfiguration than to fake it.
    if (!GOOGLE_CLIENT_ID) {
      setGoogleUnavailable(true);
      return;
    }

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });
        const container = document.getElementById('google-signin-button');
        if (!container) return;
        // Re-rendering on theme change would otherwise stack a second button.
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
  }, [isDark]);

  // Get redirect path based on user role
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

  const onSubmit = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      // Dispatch through Redux so state.auth is updated for all consumers (Navbar, etc.)
      const result = await dispatch(
        loginAction({
          email: data.email,
          password: data.password,
        })
      ).unwrap();

      if (result.user) {
        setUserName(result.user.name);
        setShowSuccess(true);
        const redirectPath = getRedirectPath(result.user.role);
        setTimeout(() => {
          setShowSuccess(false);
          navigate(redirectPath, { replace: true });
        }, 3000);
      }
    } catch (err) {
      setError(err || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessComplete = () => {
    // This is now handled in onSubmit with setTimeout
  };

  // quickLogin removed

  return (
    <div className="min-h-screen flex items-stretch bg-surface-page selection:bg-primary-200 selection:text-primary-900">
      {/* Left Panel - Image & Branding (Hidden on Mobile) */}
      <AuthBrandPanel
        image="/login.jpeg"
        heading={
          <>
            Taste the
            <br />
            <span className="text-primary-400">comfort of home.</span>
          </>
        }
        subheading="Log in to manage your daily meals, track deliveries, and discover authentic local tiffins."
      />

      {/* Right Panel - Login Form */}
      {/* pt-28 clears the fixed navbar (~88px) so the form never slides under it */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 pt-28 pb-12 relative">
        {/* Success Overlay */}
        <SuccessAnimation
          show={showSuccess}
          message={`Welcome back, ${userName}!`}
          onComplete={handleSuccessComplete}
        />

        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-3xl font-black tracking-tight text-neutral-900 mb-2"
            >
              <img src="/logo.png" alt="Tiffo Logo" className="h-10 w-auto" /> Tiffo
              <span className="text-brand-ink">.</span>
            </Link>
            <p className="text-neutral-500">Welcome back to authentic dining.</p>
          </div>

          <div className="mb-10 hidden lg:block">
            <h2 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-neutral-500 font-medium">
              Enter your email and password to access your dashboard.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FormField
                label="Email Address"
                icon={EnvelopeIcon}
                type="email"
                placeholder="name@example.com"
                registration={register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email}
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="block text-sm font-bold text-neutral-700">Password</span>
                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <FormField
                label=""
                icon={LockClosedIcon}
                placeholder="••••••••"
                showToggle
                shown={showPassword}
                onToggleShown={() => setShowPassword(!showPassword)}
                registration={register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                error={errors.password}
              />
            </motion.div>

            {/* Remember Me */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center"
            >
              <label htmlFor="login-remember" className="flex items-center cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                  <input
                    id="login-remember"
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
                <span className="text-sm font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">
                  Keep me signed in
                </span>
              </label>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <span>⚠️</span> {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-2"
            >
              <button
                type="submit"
                className="btn-primary w-full text-lg py-4 font-black focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            className="relative my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-sm font-bold">
              <span className="px-4 bg-surface-page text-neutral-400">or continue with</span>
            </div>
          </motion.div>

          {/* Google Login Button container */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {googleUnavailable ? (
              <p className="text-sm text-neutral-500 text-center">
                Google sign-in is unavailable right now. Please use your email and password.
              </p>
            ) : (
              <div id="google-signin-button" className="w-full flex justify-center"></div>
            )}
          </motion.div>

          {/* Sign Up Link */}
          <motion.div
            className="mt-10 text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-neutral-600 font-medium">
              Don't have an account?{''}
              <Link
                to="/register"
                className="font-black text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign up for free
              </Link>
            </p>

            <p className="text-sm font-medium">
              <Link
                to="/register?role=partner"
                className="text-neutral-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-1"
              >
                Want to become a Tiffin Partner? Register here <span>→</span>
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
