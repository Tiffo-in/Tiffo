import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const navLinks = [
    { name: 'Browse Meals', path: '/tiffins' },
    { name: 'Become a Partner', path: '/register?role=partner' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-surface/95 backdrop-blur-xl shadow-card border-b border-neutral-100 py-3'
          : 'bg-surface/70 backdrop-blur-md py-5'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo Area */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 group outline-none">
              <img
                src="/logo.png"
                alt="Tiffo Logo"
                className="h-10 w-auto group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-2xl font-black tracking-tight text-neutral-900">
                Tiffo<span className="text-brand">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Primary Links */}
            <div className="flex items-center space-x-1 mr-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive ? 'text-brand-ink' : 'text-neutral-600 hover:text-neutral-900'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Auth / User Actions */}
            <div className="flex items-center gap-3 ml-2">
              <ThemeToggle />
              {user ? (
                <>
                  <Link
                    to={user.role === 'partner' ? '/partner/dashboard' : '/dashboard'}
                    className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 px-3 py-2 text-sm font-semibold transition-colors"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-neutral-600 hover:text-error px-3 py-2 text-sm font-semibold transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-neutral-600 hover:text-neutral-900 px-4 py-2 text-sm font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-cta text-on-brand text-sm font-bold px-5 py-2.5 rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Controls */}
          <div className="md:hidden flex items-center gap-3">
            {/* Sits outside the collapsed menu so the theme can be changed
                without opening it. */}
            <ThemeToggle />

            {/* Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-alt border border-neutral-100 text-neutral-900 shadow-card"
              aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 w-full bg-surface/98 backdrop-blur-xl border-b border-neutral-100 shadow-card-hover"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 py-8 flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-4 rounded-xl text-base font-semibold transition-colors ${
                      isActive
                        ? 'bg-brand-tint text-brand-ink'
                        : 'text-neutral-600 hover:bg-surface-alt hover:text-neutral-900'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <div className="my-4 h-px bg-neutral-200 w-full" />

              {user ? (
                <>
                  <Link
                    to={user.role === 'partner' ? '/partner/dashboard' : '/dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-semibold text-neutral-600 hover:bg-surface-alt transition-colors"
                  >
                    <UserCircleIcon className="w-6 h-6" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-4 rounded-xl text-base font-semibold text-error hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-6 h-6" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-4 rounded-xl text-base font-semibold text-neutral-700 border border-neutral-200 transition-colors hover:bg-surface-alt"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-4 rounded-xl text-base font-bold text-on-brand bg-gradient-cta transition-colors shadow-card"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
