import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <motion.nav
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
        ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-lg border-b border-neutral-100 dark:border-neutral-800'
        : 'bg-white dark:bg-neutral-900 shadow-md dark:shadow-neutral-900'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-3 group">
              <motion.img
                src="/tiffo-logo.png"
                alt="TIFFO"
                className="h-12 w-12 object-contain"
                whileHover={{ scale: 1.08, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              />
              <motion.span
                className="text-2xl font-black tracking-wide hidden sm:block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="gradient-text">TIFFO</span>
              </motion.span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className="relative text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400 px-4 py-2 text-sm font-semibold transition-colors duration-300 group"
            >
              Home
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
            <Link
              to="/tiffins"
              className="relative text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400 px-4 py-2 text-sm font-semibold transition-colors duration-300 group"
            >
              Browse Tiffins
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
            {user ? (
              <>
                <Link
                  to={user.role === 'partner' ? '/partner/dashboard' : '/dashboard'}
                  className="relative text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400 px-4 py-2 text-sm font-semibold transition-colors duration-300 group"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
                </Link>
                <Link
                  to="/profile"
                  className="relative text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400 px-4 py-2 text-sm font-semibold transition-colors duration-300 group"
                >
                  Profile
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="ml-2 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400 px-4 py-2 text-sm font-semibold transition-colors duration-200"
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="ml-2">
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}

            {/* ── Dark / Light toggle ── */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="ml-2 relative w-10 h-10 flex items-center justify-center rounded-xl
                bg-neutral-100 dark:bg-neutral-800
                hover:bg-neutral-200 dark:hover:bg-neutral-700
                text-neutral-600 dark:text-amber-400
                transition-colors duration-300 border border-neutral-200 dark:border-neutral-700"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.25 }}
                  >
                    <SunIcon className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.25 }}
                  >
                    <MoonIcon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile menu button + toggle */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-amber-400
                transition-colors duration-300"
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div key="sun-m" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <SunIcon className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="moon-m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <MoonIcon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to="/"
                  className="block px-3 py-3 text-base font-medium text-neutral-700 dark:text-neutral-200 hover:text-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/tiffins"
                  className="block px-3 py-3 text-base font-medium text-neutral-700 dark:text-neutral-200 hover:text-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Browse Tiffins
                </Link>
                {user ? (
                  <>
                    <Link
                      to={user.role === 'partner' ? '/partner/dashboard' : '/dashboard'}
                      className="block px-3 py-3 text-base font-medium text-neutral-700 dark:text-neutral-200 hover:text-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-3 py-3 text-base font-medium text-neutral-700 dark:text-neutral-200 hover:text-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-3 py-3 text-base font-medium text-neutral-700 dark:text-neutral-200 hover:text-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-3 text-base font-medium text-neutral-700 dark:text-neutral-200 hover:text-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-3 text-base font-medium text-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors font-semibold"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;