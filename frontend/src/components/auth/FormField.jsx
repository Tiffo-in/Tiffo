import React from 'react';

const inputClasses = (hasToggle) =>
  `w-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl pl-12 ${hasToggle ? 'pr-12' : 'pr-4'} py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium`;

/**
 * Labeled input with a leading icon, react-hook-form registration, error
 * display, optional helper text, and an optional SHOW/HIDE toggle.
 */
const FormField = ({
  label,
  icon: Icon,
  registration,
  error,
  helperText,
  type = 'text',
  placeholder,
  showToggle,
  shown,
  onToggleShown,
}) => (
  <div>
    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="w-5 h-5 text-neutral-400" />
      </div>
      <input
        {...registration}
        type={showToggle ? (shown ? 'text' : 'password') : type}
        className={inputClasses(showToggle)}
        placeholder={placeholder}
      />
      {showToggle && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-bold text-xs transition-colors"
          onClick={onToggleShown}
        >
          {shown ? 'HIDE' : 'SHOW'}
        </button>
      )}
      {helperText && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{helperText}</p>
      )}
    </div>
    {error && (
      <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
        <span>⚠️</span> {error.message}
      </p>
    )}
  </div>
);

export default FormField;
