import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, BanknotesIcon, StarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const HomePartnerCTA = () => (
  <section className="py-20 bg-[#0F1016] relative">
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/north.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1016]/95 via-[#0F1016]/80 to-[#0F1016]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1016]/60 via-transparent to-transparent" />

        {/* Glow effects */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary-500/15 rounded-full blur-[100px]" />

        <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/30 rounded-full px-4 py-1.5 mb-5">
              <span className="text-primary-500 text-xs font-bold tracking-wide uppercase">
                JOIN THE COMMUNITY
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              Become a <span className="text-primary-500">Tiffo Partner</span>
            </h2>
            <p className="text-[#B5B8C5] text-sm leading-relaxed mb-6 max-w-md">
              Turn your passion for cooking into earnings. Join 500+ home chefs and grow with Tiffo.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['Easy Onboarding', 'Grow Your Business', 'Earn More'].map((pill) => (
                <span
                  key={pill}
                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#B5B8C5]/70 text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {pill}
                </span>
              ))}
            </div>

            <Link
              to="/register?role=partner"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-[#FF9F43] text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 text-sm"
            >
              Register Your Kitchen →
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 shrink-0">
            {[
              { value: '500+', label: 'Active Partners', Icon: HomeIcon },
              { value: '₹25K+', label: 'Monthly Earnings', Icon: BanknotesIcon },
              { value: '4.8', label: 'Partner Rating', Icon: StarIcon },
              { value: '15K+', label: 'Customers Reached', Icon: UserGroupIcon },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 text-center backdrop-blur-sm flex flex-col items-center"
              >
                <stat.Icon className="w-6 h-6 text-primary-500 mb-1.5" />
                <div className="text-white font-black text-xl">{stat.value}</div>
                <div className="text-[#B5B8C5]/50 text-[11px] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HomePartnerCTA;
