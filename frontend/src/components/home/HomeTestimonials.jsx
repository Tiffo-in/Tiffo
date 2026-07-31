import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

/**
 * Renders real customer reviews only. There is deliberately no hardcoded
 * fallback: inventing named testimonials misrepresents the product and is an
 * advertising-standards problem, so with no data the section renders nothing.
 *
 * To populate it, pass reviews fetched from the API. The current review routes
 * are per-resource (`/reviews/tiffin/:id`, `/reviews/partner/:id`) — a
 * platform-wide "featured reviews" endpoint needs to exist before this section
 * can be filled from live data.
 */
const HomeTestimonials = ({ testimonials = [] }) => {
  if (testimonials.length === 0) return null;

  return (
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
            What our <span className="text-primary-500">customers say</span>
          </h2>
          <p className="text-[#B5B8C5]/70 text-sm max-w-xl mx-auto">
            Verified reviews from Tiffo subscribers
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
              className="bg-[#1B1E27] border border-[rgba(255,255,255,0.08)] hover:border-primary-500/30 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5" role="img" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    aria-hidden="true"
                    className={`w-4 h-4 ${i < t.rating ? 'text-amber-400' : 'text-[#181A22]'}`}
                  />
                ))}
              </div>

              {/* Review */}
              <p className="text-[#B5B8C5] text-sm leading-relaxed italic flex-1">{t.review}</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                <div className="w-10 h-10 rounded-full bg-primary-500/15 text-primary-500 font-bold text-xs flex items-center justify-center">
                  {t.initials}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-[#B5B8C5]/70 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeTestimonials;
