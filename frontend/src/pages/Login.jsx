import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessAnimation from '../components/SuccessAnimation';
import { login as loginAction } from '../store/slices/authSlice';
import { StarIcon } from '@heroicons/react/24/solid';
import api from '../services/api';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
          width: 440,
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
  }, []);

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
    <div className="min-h-screen flex items-stretch bg-neutral-50 dark:bg-neutral-950 selection:bg-primary-200 selection:text-primary-900">
      {/* Left Panel - Image & Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-neutral-900">
        {/* Beautiful Food Background */}
        <div
          className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-[20s] ease-out"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=2000&auto=format&fit=crop')",
          }}
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 to-transparent" />

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 lg:p-16 text-white">
          {/* Logo Area */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-3xl font-black tracking-tight hover:text-primary-400 transition-colors"
            >
              <span className="text-4xl">🍱</span> Tiffo<span className="text-primary-500">.</span>
            </Link>
          </motion.div>

          {/* Main Copy & Testimonial */}
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
                Taste the
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                  comfort of home.
                </span>
              </h1>
              <p className="text-xl text-neutral-300 max-w-md leading-relaxed font-medium">
                Log in to manage your daily meals, track deliveries, and discover authentic local
                tiffins.
              </p>
            </motion.div>

            {/* Glassmorphism Testimonial Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-md shadow-2xl relative"
            >
              <div className="absolute -top-4 -left-4 text-4xl opacity-50 text-primary-400">"</div>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                ))}
              </div>
              <p className="text-neutral-200 italic mb-4 text-sm leading-relaxed">
                "Tiffo has completely changed my work week. The food is incredibly authentic, fresh,
                and exactly like what my mom used to make. The daily delivery is perfectly on time!"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/100?img=47"
                  alt="Customer"
                  className="w-10 h-10 rounded-full border-2 border-primary-500/50"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">Rahul Sharma</h4>
                  <p className="text-xs text-primary-300">Software Engineer</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12 relative dark:bg-neutral-950">
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
              className="inline-flex items-center gap-2 text-3xl font-black tracking-tight text-neutral-900 dark:text-white mb-2"
            >
              <span className="text-4xl">🍱</span> Tiffo<span className="text-primary-500">.</span>
            </Link>
            <p className="text-neutral-500 dark:text-neutral-400">
              Welcome back to authentic dining.
            </p>
          </div>

          <div className="mb-10 hidden lg:block">
            <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
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
              <label
                htmlFor="login-email"
                className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative group">
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="w-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                  <span>⚠️</span> {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-bold text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3.5 pr-16 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-bold text-sm transition-colors"
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
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 transition-colors">
                  Keep me signed in
                </span>
              </label>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
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
                className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-lg py-4 rounded-xl font-black hover:bg-neutral-800 dark:hover:bg-neutral-100 focus:outline-none focus:ring-4 focus:ring-neutral-900/20 dark:focus:ring-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neutral-900/20 dark:shadow-white/10"
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
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-sm font-bold">
              <span className="px-4 bg-neutral-50 dark:bg-neutral-950 text-neutral-400">
                OR CONTINUE WITH
              </span>
            </div>
          </motion.div>

          {/* Google Login Button container */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div id="google-signin-button" className="w-full flex justify-center"></div>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div
            className="mt-10 text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-black text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                Sign up for free
              </Link>
            </p>

            <p className="text-sm font-medium">
              <Link
                to="/register?role=partner"
                className="text-neutral-500 hover:text-primary-600 dark:text-neutral-500 dark:hover:text-primary-400 transition-colors flex items-center justify-center gap-1"
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
