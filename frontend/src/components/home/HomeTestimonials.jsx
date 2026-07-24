import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer',
    initials: 'PS',
    rating: 5,
    review:
      '"Tiffo has made my life so easy! The food is always fresh, tasty and feels just like home."',
  },
  {
    name: 'Rahul Verma',
    role: 'Product Manager',
    initials: 'RV',
    rating: 5,
    review: '"Great variety of meals and super reliable delivery. Highly recommended!"',
  },
  {
    name: 'Anjali Mehta',
    role: 'Doctor',
    initials: 'AM',
    rating: 4,
    review: '"Healthy, delicious and affordable meals. Tiffo is my everyday comfort."',
  },
];

const HomeTestimonials = () => (
  <section className="py-24 bg-[#0F1016] relative">
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF7A18]/20 to-transparent" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
          Loved by <span className="text-[#FF7A18]">Thousands</span>
        </h2>
        <p className="text-[#B5B8C5]/60 text-sm max-w-xl mx-auto">
          Here's what our happy customers have to say
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((t, index) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12, duration: 0.6 }}
            whileHover={{ y: -6 }}
            className="bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] hover:border-[#FF7A18]/30 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300"
          >
            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 ${i < t.rating ? 'text-amber-400' : 'text-[#181A22]'}`}
                />
              ))}
            </div>

            {/* Review */}
            <p className="text-[#B5B8C5] text-sm leading-relaxed italic flex-1">{t.review}</p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-2 border-t border-[rgba(255,255,255,0.08)]">
              <div className="w-10 h-10 rounded-full bg-[#FF7A18]/15 text-[#FF7A18] font-bold text-xs flex items-center justify-center">
                {t.initials}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t.name}</p>
                <p className="text-[#B5B8C5]/50 text-xs">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-8">
        <div className="w-6 h-2 rounded-full bg-[#FF7A18]" />
        <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.08)]" />
        <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.08)]" />
      </div>
    </div>
  </section>
);

export default HomeTestimonials;
