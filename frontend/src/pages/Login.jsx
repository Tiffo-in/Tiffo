import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import SuccessAnimation from '../components/SuccessAnimation';
import { login as loginAction } from '../store/slices/authSlice';

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
      const result = await dispatch(loginAction({
        email: data.email,
        password: data.password
      })).unwrap();

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

  const quickLogin = async (role = 'user') => {
    const credentials = {
      admin:   { email: 'admin@tiffo.com',    password: 'admin123' },
      partner: { email: 'partner1@tiffo.com', password: 'partner123' },
      user:    { email: 'priya@example.com',  password: 'priya123' },
    };

    setError('');
    setIsLoading(true);

    try {
      const result = await dispatch(loginAction(credentials[role])).unwrap();
      if (result.user) {
        setUserName(result.user.name);
        const redirectPath = getRedirectPath(result.user.role);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate(redirectPath, { replace: true });
        }, 3000);
      }
    } catch (err) {
      setError(`Quick login failed: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch relative">
      {/* Left Panel - Promotional */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 relative overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-32 right-20 w-80 h-80 bg-white/10 rounded-full"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-black mb-6 leading-tight">
              Welcome back to<br />
              <span className="text-white/90">TIFFO</span>
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Your gateway to authentic homemade meals from trusted local providers.
            </p>

            {/* Stats */}
            <div className="flex space-x-8 mt-8">
              <div>
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-white/70 text-sm">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-white/70 text-sm">Tiffin Partners</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-white/70 text-sm">Meals Delivered</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-neutral-50 px-6 py-12 relative">
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 text-5xl opacity-5">🍱</div>
        <div className="absolute bottom-20 left-10 text-4xl opacity-5">🥘</div>

        {/* Success Animation */}
        <SuccessAnimation
          show={showSuccess}
          message={`Welcome back, ${userName}!`}
          onComplete={handleSuccessComplete}
        />

        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo - Mobile Only */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl mb-4 block">🍱</span>
            <h2 className="text-2xl font-bold gradient-text">TIFFO</h2>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-neutral-900 mb-2">
                Sign in
              </h2>
              <p className="text-neutral-500">
                Welcome back! Please enter your details.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="login-email" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email address
                </label>
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
                  className="input-field"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <motion.p
                    className="mt-2 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="login-password" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
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
                    className="input-field pr-16"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-neutral-700 font-medium text-sm transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    className="mt-2 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              <div className="flex items-center justify-between">
                <label htmlFor="login-remember" className="flex items-center">
                  <input id="login-remember" type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-400" />
                  <span className="ml-2 text-sm text-neutral-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                className="space-y-4 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  type="submit"
                  className="w-full btn-primary text-lg py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </motion.button>

                {/* Demo Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    type="button"
                    onClick={() => quickLogin('user')}
                    className="flex items-center justify-center gap-1 py-2.5 px-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors text-sm font-semibold border border-green-100"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>👤</span> User
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => quickLogin('partner')}
                    className="flex items-center justify-center gap-1 py-2.5 px-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors text-sm font-semibold border border-purple-100"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>👨‍🍳</span> Partner
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => quickLogin('admin')}
                    className="flex items-center justify-center gap-1 py-2.5 px-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>👑</span> Admin
                  </motion.button>
                </div>
              </motion.div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-500">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In — Coming Soon */}
              <motion.button
                type="button"
                disabled
                className="w-full flex justify-center items-center px-4 py-3 border-2 border-neutral-200 rounded-xl shadow-sm text-sm font-semibold text-neutral-400 bg-neutral-50 cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-3 opacity-50" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google (Coming Soon)
              </motion.button>

              {/* Sign Up Link */}
              <p className="text-center text-neutral-600 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                  Sign up for free
                </Link>
              </p>

              <p className="text-center text-xs text-neutral-400 mt-4">
                <Link to="/register?role=partner" className="text-primary-500 hover:text-primary-600 font-medium">
                  Want to become a Tiffin Partner? Register here →
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;