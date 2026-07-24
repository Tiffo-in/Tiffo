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
          ? 'bg-[#0F1016]/95 backdrop-blur-xl shadow-lg border-b border-[rgba(255,255,255,0.08)] py-3'
          : 'bg-[#0F1016]/60 backdrop-blur-md py-5'
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
              <span className="text-2xl font-black tracking-tight text-white">
                Tiffo<span className="text-orange-500">.</span>
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
                      isActive ? 'text-orange-400' : 'text-neutral-400 hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Auth / User Actions */}
            <div className="flex items-center gap-3 ml-2">
              {user ? (
                <>
                  <Link
                    to={user.role === 'partner' ? '/partner/dashboard' : '/dashboard'}
                    className="flex items-center gap-2 text-neutral-400 hover:text-white px-3 py-2 text-sm font-semibold transition-colors"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-neutral-500 hover:text-red-400 px-3 py-2 text-sm font-semibold transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-neutral-400 hover:text-white px-4 py-2 text-sm font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Controls */}
          <div className="md:hidden flex items-center gap-3">
            {/* Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm"
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
            className="md:hidden absolute top-full left-0 w-full bg-[#0d0d0d]/98 backdrop-blur-xl border-b border-neutral-800 shadow-2xl"
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
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <div className="my-4 h-px bg-neutral-800 w-full" />

              {user ? (
                <>
                  <Link
                    to={user.role === 'partner' ? '/partner/dashboard' : '/dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-semibold text-neutral-300 hover:bg-neutral-900 transition-colors"
                  >
                    <UserCircleIcon className="w-6 h-6" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-4 rounded-xl text-base font-semibold text-red-400 hover:bg-red-900/20 transition-colors"
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
                    className="block text-center px-4 py-4 rounded-xl text-base font-semibold text-neutral-300 border border-neutral-800 transition-colors hover:bg-neutral-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-4 rounded-xl text-base font-bold text-white bg-orange-500 hover:bg-orange-400 transition-colors shadow-lg"
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
