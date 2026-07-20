import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';

const linkClasses =
  'text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors';

const columns = [
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/blog', label: 'Blog' },
      { to: '/careers', label: 'Careers' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { to: '/support', label: 'Help Center' },
      { to: '/terms', label: 'Terms of Service' },
      { to: '/privacy', label: 'Privacy Policy' },
    ],
  },
  {
    heading: 'Partner',
    links: [
      { to: '/register?role=partner', label: 'Become Partner' },
      { to: '/partner-guidelines', label: 'Guidelines' },
    ],
  },
];

const HomeFooter = () => (
  <footer className="bg-neutral-50 dark:bg-neutral-950 pt-24 pb-12 relative overflow-hidden border-t border-neutral-200 dark:border-neutral-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
        <div className="col-span-2 lg:col-span-2">
          <Link
            to="/"
            className="inline-flex items-center text-4xl font-black tracking-tight text-neutral-900 dark:text-white mb-6"
          >
            <img src="/logo.png" alt="Tiffo Logo" className="h-12 w-auto mr-2" />
            Tiffo<span className="text-primary-500">.</span>
          </Link>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-8 leading-relaxed font-medium">
            Reimagining daily dining by connecting you with passionate home chefs. Authentic,
            hygienic, and delivered with care.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="Tiffo on X"
              className="w-12 h-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-white hover:bg-neutral-900 dark:hover:bg-primary-600 hover:border-transparent transition-all shadow-sm"
            >
              𝕏
            </a>
            <a
              href="#"
              aria-label="Tiffo on Instagram"
              className="w-12 h-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-white hover:bg-pink-600 hover:border-transparent transition-all shadow-sm"
            >
              IG
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <h4 className="text-neutral-900 dark:text-white font-black text-lg mb-6 tracking-wide">
              {col.heading}
            </h4>
            <ul className="space-y-4">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={linkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-neutral-500 dark:text-neutral-500 text-sm font-medium">
          © {new Date().getFullYear()} Tiffo Technologies. All rights reserved.
        </p>
        <p className="text-neutral-500 dark:text-neutral-500 text-sm font-medium flex items-center gap-1.5">
          Made with <HeartIcon className="w-4 h-4 text-red-500 fill-current" /> in India
        </p>
      </div>
    </div>
  </footer>
);

export default HomeFooter;
