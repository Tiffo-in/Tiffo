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
  <section className="py-20 bg-surface-page relative">
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="font-display text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-3">
          Loved by <span className="text-primary-600">Thousands</span>
        </h2>
        <p className="text-neutral-500 text-sm max-w-xl mx-auto">
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
            className="bg-surface border border-neutral-100 hover:border-brand-border rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300"
          >
            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 ${i < t.rating ? 'text-rating' : 'text-neutral-300'}`}
                />
              ))}
            </div>

            {/* Review */}
            <p className="text-neutral-600 text-sm leading-relaxed italic flex-1">{t.review}</p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
              <div className="w-10 h-10 rounded-full bg-brand-tint text-brand-ink font-bold text-xs flex items-center justify-center">
                {t.initials}
              </div>
              <div>
                <p className="text-neutral-900 font-bold text-sm">{t.name}</p>
                <p className="text-neutral-500 text-xs">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HomeTestimonials;
