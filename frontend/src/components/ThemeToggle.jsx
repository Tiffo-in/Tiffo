import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Light/dark switch for the nav.
 *
 * The ThemeProvider already persisted a preference to localStorage and toggled
 * `.dark` on <html>, but nothing in the UI ever called `toggleTheme` — the only
 * way to change themes was the OS setting. This is that missing control.
 */
const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const nextTheme = isDark ? 'light' : 'dark';
  const Icon = isDark ? SunIcon : MoonIcon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      // The button's own label must describe the ACTION, not the current state,
      // or screen readers announce the opposite of what pressing it does.
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className={`flex w-10 h-10 items-center justify-center rounded-full border border-neutral-200 bg-surface text-neutral-700 hover:text-brand-ink hover:border-brand-border hover:bg-brand-tint transition-colors ${className}`}
    >
      {/* Cross-fade + quarter turn so the swap reads as one control changing
          state rather than two different buttons. */}
      <span className="relative w-5 h-5 shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? 'sun' : 'moon'}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Icon className="w-5 h-5" />
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
};

export default ThemeToggle;
