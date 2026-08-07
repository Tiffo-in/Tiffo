import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HeartIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const linkClasses =
  'text-neutral-500 hover:text-brand-ink font-medium text-sm transition-colors duration-200';

const columns = [
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/blog', label: 'Blog' },
      { to: '/careers', label: 'Careers' },
      { to: '/press', label: 'Press' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { to: '/support', label: 'Help Center' },
      { to: '/terms', label: 'Terms of Service' },
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/security', label: 'Security' },
    ],
  },
  {
    heading: 'Partner',
    links: [
      { to: '/register?role=partner', label: 'Become Partner' },
      { to: '/partner-guidelines', label: 'Guidelines' },
      { to: '/partner/dashboard', label: 'Partner Login' },
      { to: '/support', label: 'Resources' },
    ],
  },
];

// Brand glyphs kept inline (single path each, currentColor) so the footer has
// no external icon dependency and the social buttons inherit hover color.
const SocialIcon = ({ path }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d={path} />
  </svg>
);

const socials = [
  {
    label: 'Instagram',
    href: '#',
    path: 'M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5.01-4.74.07-.9.04-1.38.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.33-.28.81-.32 1.71-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.04.9.19 1.38.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.33.13.81.28 1.71.32 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.9-.04 1.38-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.33.28-.81.32-1.71.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.9-.19-1.38-.32-1.71a2.85 2.85 0 00-.69-1.06 2.85 2.85 0 00-1.06-.69c-.33-.13-.81-.28-1.71-.32C15.5 4.01 15.15 4 12 4zm0 3.06A4.94 4.94 0 1112 17a4.94 4.94 0 010-9.88zm0 1.8a3.14 3.14 0 100 6.28 3.14 3.14 0 000-6.28zM17.64 6.4a1.15 1.15 0 110 2.3 1.15 1.15 0 010-2.3z',
  },
  {
    label: 'Twitter / X',
    href: '#',
    path: 'M18.9 2H22l-7.5 8.57L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8-9.14L1 2h6.9l4.8 6.36L18.9 2zm-1.2 18h1.9L7.1 4H5.1l12.6 16z',
  },
  {
    label: 'LinkedIn',
    href: '#',
    path: 'M4.98 3.5a2.5 2.5 0 11-.02 5.01A2.5 2.5 0 014.98 3.5zM3 9h4v12H3V9zm7 0h3.8v1.64h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21h-4V9z',
  },
  {
    label: 'YouTube',
    href: '#',
    path: 'M23.5 6.2a3 3 0 00-2.11-2.12C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.39.53A3 3 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3 3 0 002.11 2.12c1.89.53 9.39.53 9.39.53s7.5 0 9.39-.53a3 3 0 002.11-2.12A31.3 31.3 0 0024 12a31.3 31.3 0 00-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z',
  },
];

const HomeFooter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await api.post('/support/newsletter', { email });
      setSubscribed(true);
      setEmail('');
      toast.success('Subscribed to our newsletter!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-surface-section pt-20 pb-10 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
              <img src="/logo.png" alt="Tiffo Logo" className="h-10 w-auto" />
              <span className="text-2xl font-black text-neutral-900 tracking-tight">
                Tiffo<span className="text-brand-ink">.</span>
              </span>
            </Link>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs mb-7">
              Reimagining daily dining by connecting you with passionate home chefs. Authentic,
              hygienic, and delivered with care.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-neutral-500 text-xs font-semibold mb-3 uppercase tracking-wider">
                Subscribe to our newsletter
              </p>
              {subscribed ? (
                <p className="text-brand-ink text-sm font-semibold">
                  🎉 You're subscribed — thanks for joining!
                </p>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 bg-surface border border-neutral-100 focus:border-brand-border focus:ring-4 focus:ring-primary-500/15 px-4 py-2.5 rounded-xl outline-none text-neutral-900 placeholder:text-neutral-400 text-sm transition-all"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-4 py-2.5 text-sm shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Subscribing…' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={`Tiffo on ${social.label}`}
                  className="w-9 h-9 bg-surface border border-neutral-100 hover:border-brand-border hover:bg-primary-500/10 rounded-lg flex items-center justify-center text-neutral-600 hover:text-brand transition-all duration-200"
                >
                  <SocialIcon path={social.path} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-neutral-900 font-black text-sm mb-5 tracking-wide">
                {col.heading}
              </h4>
              <ul className="space-y-3">
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

        {/* Bottom bar */}
        <div className="border-t border-neutral-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-neutral-500 text-xs font-medium">
            © {new Date().getFullYear()} Tiffo Technologies. All rights reserved.
          </p>
          <p className="text-neutral-500 text-xs font-medium flex items-center gap-1.5">
            Made with <HeartIcon className="w-3.5 h-3.5 text-red-500 fill-current" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
