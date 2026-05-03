import { useEffect } from 'react';

/**
 * useDocumentTitle
 * Sets document.title on mount and restores the default on unmount.
 * 
 * @param {string} title - The page-specific title (e.g. "Browse Tiffins")
 * @param {boolean} [restoreOnUnmount=true] - Whether to reset to default on unmount
 */
const DEFAULT_TITLE = 'Tiffo — Homemade Tiffin Delivery';

const useDocumentTitle = (title, restoreOnUnmount = true) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | Tiffo` : DEFAULT_TITLE;

    return () => {
      if (restoreOnUnmount) {
        document.title = previousTitle;
      }
    };
  }, [title, restoreOnUnmount]);
};

export default useDocumentTitle;
