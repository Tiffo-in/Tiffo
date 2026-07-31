import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  HomeIcon,
  CalendarDaysIcon,
  TruckIcon,
  CheckBadgeIcon,
  MapPinIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    Icon: ShieldCheckIcon,
    title: 'Hygienic & Safe',
    description: 'Prepared in hygienic kitchens with quality ingredients.',
    color: 'from-[#2ECC71]/15 to-transparent',
    borderColor: 'border-[#2ECC71]/15',
    iconBg: 'bg-[#2ECC71]/10',
    iconColor: 'text-[#2ECC71]',
  },
  {
    Icon: HomeIcon,
    title: 'Homemade Taste',
    description: 'Enjoy the taste of home-cooked meals every day.',
    color: 'from-primary-500/15 to-transparent',
    borderColor: 'border-primary-500/15',
    iconBg: 'bg-primary-500/10',
    iconColor: 'text-primary-500',
  },
  {
    Icon: CalendarDaysIcon,
    title: 'Flexible Plans',
    description: 'Daily, weekly or monthly plans that fit your lifestyle.',
    color: 'from-blue-500/15 to-transparent',
    borderColor: 'border-blue-500/15',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    Icon: TruckIcon,
    title: 'On-time Delivery',
    description: 'Have our fresh meals delivered right to your door on time.',
    color: 'from-purple-500/15 to-transparent',
    borderColor: 'border-purple-500/15',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
  },
  {
    Icon: CheckBadgeIcon,
    title: 'Verified Kitchens',
    description: 'All kitchens are verified and audited for your safety.',
    color: 'from-teal-500/15 to-transparent',
    borderColor: 'border-teal-500/15',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-400',
  },
];

const steps = [
  {
    step: '01',
    Icon: MapPinIcon,
    title: 'Choose Location',
    description: 'Enter your location and see tiffins near you.',
  },
  {
    step: '02',
    Icon: SparklesIcon,
    title: 'Browse Meals',
    description: 'Explore a variety of homemade meals.',
  },
  {
    step: '03',
    Icon: ClipboardDocumentCheckIcon,
    title: 'Choose a Plan',
    description: 'Select daily, weekly or monthly plans.',
  },
  {
    step: '04',
    Icon: TruckIcon,
    title: 'Get it Delivered',
    description: 'Fresh meals delivered right to your door.',
  },
];

const HomeFeatures = () => (
  <>
    {/* HOW IT WORKS */}
    <section className="py-24 bg-[#0F1016] relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            How It <span className="text-primary-500">Works</span>
          </h2>
          <p className="text-[#B5B8C5]/70 text-sm max-w-xl mx-auto">
            Getting your favourite homemade tiffin is simple and easy
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary-500/30 via-primary-500/50 to-primary-500/30" />

          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
              className="flex flex-col items-center text-center group"
            >
              {/* Step circle */}
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-2xl bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] group-hover:border-primary-500/40 transition-all duration-300 flex items-center justify-center text-primary-500 shadow-xl group-hover:shadow-primary-500/10">
                  <step.Icon className="w-8 h-8" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-500 text-[#0F1016] text-xs font-black flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-white font-bold text-base mb-1.5 group-hover:text-primary-500 transition-colors">
                {step.title}
              </h3>
              <p className="text-[#B5B8C5]/70 text-xs leading-relaxed max-w-[160px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* WHY CHOOSE TIFFO */}
    <section className="py-24 bg-[#0F1016] relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            Why Choose <span className="text-primary-500">Tiffo?</span>
          </h2>
          <p className="text-[#B5B8C5]/70 text-sm max-w-xl mx-auto">
            We're committed to delivering the best homemade food experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className={`bg-gradient-to-b ${feature.color} bg-[#1B1E27] border ${feature.borderColor} rounded-2xl p-6 flex flex-col items-start gap-3 transition-all duration-300 hover:shadow-xl`}
            >
              <div
                className={`w-11 h-11 ${feature.iconBg} rounded-xl flex items-center justify-center`}
              >
                <feature.Icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{feature.title}</h3>
                <p className="text-[#B5B8C5]/70 text-xs leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default HomeFeatures;
