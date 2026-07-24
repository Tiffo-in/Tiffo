import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';

const linkClasses =
  'text-[#B5B8C5]/60 hover:text-[#FF7A18] font-medium text-sm transition-colors duration-200';

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

const HomeFooter = () => (
  <footer className="bg-[#0F1016] pt-20 pb-10 relative border-t border-[rgba(255,255,255,0.08)]">
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF7A18]/20 to-transparent" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-14">
        {/* Brand */}
        <div className="col-span-2 lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
            <img src="/logo.png" alt="Tiffo Logo" className="h-10 w-auto" />
            <span className="text-2xl font-black text-white tracking-tight">
              Tiffo<span className="text-[#FF7A18]">.</span>
            </span>
          </Link>
          <p className="text-[#B5B8C5]/60 text-sm leading-relaxed max-w-xs mb-7">
            Reimagining daily dining by connecting you with passionate home chefs. Authentic,
            hygienic, and delivered with care.
          </p>

          {/* Newsletter */}
          <div>
            <p className="text-[#B5B8C5]/50 text-xs font-semibold mb-3 uppercase tracking-wider">
              Subscribe to our newsletter
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] focus:border-[#FF7A18]/50 px-4 py-2.5 rounded-xl outline-none text-white placeholder:text-[#B5B8C5]/30 text-sm transition-colors"
              />
              <button className="bg-[#FF7A18] hover:bg-[#FF9F43] text-white font-bold px-4 py-2.5 rounded-xl transition-all text-sm shrink-0">
                Subscribe
              </button>
            </div>
          </div>

          {/* Social */}
          <div className="flex gap-3 mt-6">
            {[
              { label: 'Instagram', text: 'IG', href: '#' },
              { label: 'Twitter / X', text: 'X', href: '#' },
              { label: 'LinkedIn', text: 'IN', href: '#' },
              { label: 'YouTube', text: 'YT', href: '#' },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={`Tiffo on ${social.label}`}
                className="w-9 h-9 bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] hover:border-[#FF7A18]/40 hover:bg-[#FF7A18]/10 rounded-lg flex items-center justify-center text-xs font-bold text-[#B5B8C5] hover:text-[#FF7A18] transition-all duration-200"
              >
                {social.text}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {columns.map((col) => (
          <div key={col.heading}>
            <h4 className="text-white font-black text-sm mb-5 tracking-wide">{col.heading}</h4>
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
      <div className="border-t border-[rgba(255,255,255,0.08)] pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-[#B5B8C5]/40 text-xs font-medium">
          © {new Date().getFullYear()} Tiffo Technologies. All rights reserved.
        </p>
        <p className="text-[#B5B8C5]/40 text-xs font-medium flex items-center gap-1.5">
          Made with <HeartIcon className="w-3.5 h-3.5 text-red-500 fill-current" /> in India
        </p>
      </div>
    </div>
  </footer>
);

export default HomeFooter;
