import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline';

// Qualities we can actually stand behind. Deliberately no delivery-time or
// order-count claims — there is no public stats endpoint backing those, and
// inventing them here is what the mobile card had to be corrected for.
const trustChips = [
  { icon: SparklesIcon, title: 'Freshly Cooked', sub: 'Made to order' },
  { icon: ShieldCheckIcon, title: 'Hygienic & Safe', sub: 'Verified kitchens' },
];

const HomeHero = ({ user }) => {
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // The Tiffins page filters by GPS coordinates (not free text), so only the
    // "use my location" coordinates carry a real query through; the typed text
    // is a visual hint until a text-search backend exists.
    if (coords) {
      navigate(`/tiffins?lat=${coords.lat}&lng=${coords.lng}&radius=10`);
    } else {
      navigate('/tiffins');
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setCoords({ lat: c.latitude, lng: c.longitude });
        setLocation(`${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const partnerCta = !user
    ? { to: '/register?role=partner', label: 'Become a Partner' }
    : user.role !== 'partner'
      ? { to: '/support?subject=partner', label: 'Become a Partner' }
      : { to: '/partner/dashboard', label: 'Partner Dashboard' };

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-28 pb-16 overflow-hidden bg-gradient-hero">
      {/* Ambient warm glow — brand tint, so it reads on both themes */}
      <div className="absolute top-20 right-[10%] w-[600px] h-[600px] bg-brand/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* LEFT: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Cities pill */}
            <div className="inline-flex items-center gap-2 self-start bg-surface border border-neutral-100 rounded-full pl-3 pr-4 py-2 shadow-card">
              <MapPinIcon className="w-4 h-4 text-brand" />
              <span className="text-neutral-600 text-sm">
                Available in <span className="text-neutral-900 font-semibold">Bhopal, Indore</span>{' '}
                & 12+ cities
              </span>
            </div>

            {/* Heading. The accent line uses primary-600 (#E86800): the flat
                brand orange is only 2.6:1 on warm white and misses even the
                3:1 large-text floor, while #E86800 clears it at 3.2:1. */}
            <div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-[4.2rem] font-black text-neutral-900 leading-[1.08] tracking-tight">
                Homemade Tiffins
                <br />
                <span className="text-primary-600">Delivered Fresh.</span>
              </h1>
              <p className="mt-5 text-base text-neutral-600 leading-relaxed max-w-xl">
                Discover authentic homemade meals from verified local kitchens. Healthy, hygienic
                and delivered right to your door.
              </p>
            </div>

            {/* Search capsule — one white card holding input + locate + submit */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-surface border border-neutral-100 rounded-2xl p-2 max-w-2xl shadow-card"
            >
              {/* min-w-0 lets this flex child actually shrink instead of
                  forcing the input to clip its placeholder. */}
              <div className="flex-1 min-w-0 flex items-center gap-3 px-3">
                <MapPinIcon className="w-5 h-5 text-neutral-500 shrink-0" />
                <label htmlFor="hero-location" className="sr-only">
                  Delivery location
                </label>
                <input
                  id="hero-location"
                  type="text"
                  placeholder="Enter delivery location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent text-neutral-900 placeholder:text-neutral-400 outline-none text-sm font-medium py-2 w-full"
                />
              </div>

              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locating}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-brand-ink hover:bg-brand-tint transition-colors shrink-0 disabled:opacity-60"
              >
                <ViewfinderCircleIcon className="w-4 h-4" />
                {locating ? 'Locating…' : 'Use my location'}
              </button>

              <button
                type="submit"
                className="bg-gradient-cta text-on-brand font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-card hover:shadow-card-hover shrink-0 flex items-center justify-center gap-2"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Search Meals
              </button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/tiffins"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-cta text-on-brand rounded-xl font-bold text-sm transition-all duration-200 shadow-card hover:shadow-card-hover"
                >
                  Browse Tiffins
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={partnerCta.to}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-surface hover:bg-surface-alt border border-neutral-200 hover:border-brand-border text-neutral-900 rounded-xl font-bold text-sm transition-all duration-200"
                >
                  {partnerCta.label}
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT: Hero image with floating trust chips */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-7 flex items-center justify-center lg:justify-end relative w-full lg:translate-x-12"
          >
            <div className="relative w-full flex items-center justify-center lg:justify-end">
              {/* Soft spotlight behind the subject so it emerges from light
                  instead of sitting flat on the gradient. */}
              <div className="absolute inset-0 flex items-center justify-center lg:justify-end pointer-events-none">
                <div className="w-[70%] aspect-square rounded-full bg-brand/20 blur-[90px]" />
              </div>

              {/* Continuous slow float + a real drop shadow gives the image
                  depth so it lifts off the page rather than reading as pasted. */}
              <motion.img
                src="https://res.cloudinary.com/dtqxljodl/image/upload/v1785792269/home_vblcf0.png"
                alt="Homemade Tiffins Delivered Fresh"
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
                className="relative w-full h-auto object-contain scale-110 lg:scale-175 origin-center lg:origin-right [filter:drop-shadow(0_30px_45px_rgba(80,40,10,0.28))]"
              />

              {/* Floating chips, hidden on small screens where they'd collide */}
              {trustChips.map((chip, i) => (
                <motion.div
                  key={chip.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}
                  className={`hidden lg:flex absolute items-center gap-2.5 bg-surface border border-neutral-100 rounded-2xl px-4 py-3 shadow-card ${
                    i === 0 ? 'top-[12%] left-0' : 'top-[38%] right-0'
                  }`}
                >
                  <span className="w-9 h-9 rounded-xl bg-brand-tint flex items-center justify-center shrink-0">
                    <chip.icon className="w-5 h-5 text-brand" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-sm font-bold text-neutral-900">{chip.title}</span>
                    <span className="text-xs text-neutral-500">{chip.sub}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
