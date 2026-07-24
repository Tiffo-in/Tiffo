import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

const categories = [
  { label: 'Breakfast', image: '/south.jpeg' },
  { label: 'Lunch', image: '/north.jpeg' },
  { label: 'Dinner', image: '/tiffin.jpeg' },
  { label: 'Healthy', image: '/south.jpeg' },
  { label: 'Jain', image: '/north.jpeg' },
  { label: 'North Indian', image: '/tiffin.jpeg' },
  { label: 'South Indian', image: '/south.jpeg' },
  { label: 'Punjabi', image: '/north.jpeg' },
  { label: 'Gujarati', image: '/tiffin.jpeg' },
];

const HomeHero = ({ user }) => {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/tiffins');
  };

  const partnerCta = !user
    ? { to: '/register?role=partner', label: 'Become a Partner' }
    : user.role !== 'partner'
      ? { to: '/support?subject=partner', label: 'Become a Partner' }
      : { to: '/partner/dashboard', label: 'Partner Dashboard' };

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-0 overflow-hidden bg-[#0F1016]">
      {/* Background grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute top-20 right-[10%] w-[600px] h-[600px] bg-[#FF7A18]/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-[#FF9F43]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* LEFT: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Heading */}
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-[4.2rem] font-black text-white leading-[1.08] tracking-tight">
                Homemade Tiffins
                <br />
                <span className="text-[#FF7A18]">Delivered Fresh.</span>
              </h1>
              <p className="mt-5 text-base text-[#B5B8C5] leading-relaxed max-w-xl">
                Discover authentic homemade meals from verified local kitchens. Healthy, hygienic
                and delivered right to your door.
              </p>
            </div>

            {/* Available in cities badge */}
            <div className="inline-flex items-center gap-2 self-start">
              <MapPinIcon className="w-4 h-4 text-[#FF7A18]" />
              <span className="text-[#B5B8C5] text-sm">
                Available in <span className="text-[#FF7A18] font-semibold">Bhopal, Indore</span> &
                12+ cities
              </span>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-[#181A22] border border-[rgba(255,255,255,0.08)] rounded-2xl p-2 max-w-lg shadow-2xl"
            >
              <div className="flex-1 flex items-center gap-3 px-3">
                <MapPinIcon className="w-5 h-5 text-[#B5B8C5] shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your delivery location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-[#B5B8C5]/50 outline-none text-sm font-medium py-2"
                />
              </div>
              <button
                type="submit"
                className="bg-[#FF7A18] hover:bg-[#FF9F43] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-[#FF7A18]/30 shrink-0 flex items-center gap-2"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Search
              </button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/tiffins"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF7A18] hover:bg-[#FF9F43] text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-[#FF7A18]/25"
                >
                  Browse Tiffins
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={partnerCta.to}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] text-white rounded-xl font-bold text-sm transition-all duration-200"
                >
                  {partnerCta.label}
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT: Hero image extra large */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-7 flex items-center justify-center lg:justify-end relative w-full lg:translate-x-12"
          >
            <div className="relative w-full flex items-center justify-center lg:justify-end">
              <img
                src="/home.png"
                alt="Homemade Tiffins Delivered Fresh"
                className="w-full h-auto object-contain scale-135 lg:scale-175 origin-center lg:origin-right transition-transform duration-300 drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-16 pb-12"
        >
          <div className="flex items-center gap-5 overflow-x-auto pb-2 scrollbar-hide justify-between">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={`/tiffins?category=${encodeURIComponent(cat.label)}`}
                className="flex flex-col items-center gap-2.5 shrink-0 group"
              >
                <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-[rgba(255,255,255,0.08)] group-hover:border-[#FF7A18]/60 transition-all duration-300 shadow-lg group-hover:shadow-[#FF7A18]/20">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs text-[#B5B8C5] group-hover:text-[#FF7A18] font-medium transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}

            {/* More button */}
            <Link to="/tiffins" className="flex flex-col items-center gap-2.5 shrink-0 group">
              <div className="w-[72px] h-[72px] rounded-full border-2 border-[rgba(255,255,255,0.08)] group-hover:border-[#FF7A18]/60 bg-[#1B1E27] flex items-center justify-center transition-all duration-300">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-[#B5B8C5] group-hover:text-[#FF7A18] transition-colors"
                >
                  <rect
                    x="3"
                    y="3"
                    width="8"
                    height="8"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="13"
                    y="3"
                    width="8"
                    height="8"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="3"
                    y="13"
                    width="8"
                    height="8"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="13"
                    y="13"
                    width="8"
                    height="8"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <span className="text-xs text-[#B5B8C5] group-hover:text-[#FF7A18] font-medium transition-colors">
                More
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeHero;
