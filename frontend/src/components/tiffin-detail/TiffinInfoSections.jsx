import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, CalendarDaysIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

const defaultMenuItems = [
  {
    name: 'Poha / Upma',
    image:
      'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Coconut Chutney',
    image:
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Boiled Eggs (Optional)',
    image:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Seasonal Fruits',
    image:
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Green Tea',
    image:
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80',
  },
];

const mockReviews = [
  {
    id: 1,
    name: 'Rahul Sharma',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    date: '2 days ago',
    rating: 5,
    comment: 'Very fresh and tasty! Perfect start to the day.',
  },
  {
    id: 2,
    name: 'Priya Mehta',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    date: '1 week ago',
    rating: 5,
    comment: 'Loved the poha and chutney. Fruits were always fresh.',
  },
  {
    id: 3,
    name: 'Anil Verma',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    date: '2 weeks ago',
    rating: 5,
    comment: 'Healthy and hygienic. Delivery always on time!',
  },
];

const TiffinInfoSections = ({ tiffin }) => {
  const menuItems =
    tiffin.menuItems && tiffin.menuItems.length > 0 ? tiffin.menuItems : defaultMenuItems;
  const nutrition = tiffin.nutritionInfo || { calories: 350, protein: 10, carbs: 55, fat: 8 };
  const [activeReviewDot, setActiveReviewDot] = useState(0);

  return (
    <div className="space-y-6">
      {/* 1. ABOUT THIS TIFFIN CARD */}
      <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span>👨‍🍳</span>
          <span>About This Tiffin</span>
        </h2>

        <p className="text-[#B5B8C5] text-sm leading-relaxed mb-6">
          {tiffin.description ||
            'A light and healthy breakfast to kickstart your day! Enjoy delicious poha or upma with coconut chutney, boiled eggs (optional), seasonal fruit, and green tea.'}
        </p>

        {/* 4 Feature Pills Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#12141D] border border-[rgba(255,255,255,0.04)] text-xs text-[#B5B8C5]">
            <span className="text-base text-[#FF7A18]">🍳</span>
            <span className="font-semibold text-white">Freshly Prepared</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#12141D] border border-[rgba(255,255,255,0.04)] text-xs text-[#B5B8C5]">
            <span className="text-base text-[#FF7A18]">🧺</span>
            <span className="font-semibold text-white">Hygienic Kitchen</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#12141D] border border-[rgba(255,255,255,0.04)] text-xs text-[#B5B8C5]">
            <span className="text-base text-[#FF7A18]">🚫</span>
            <span className="font-semibold text-white">No Preservatives Added</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#12141D] border border-[rgba(255,255,255,0.04)] text-xs text-[#B5B8C5]">
            <span className="text-base text-[#FF7A18]">🥗</span>
            <span className="font-semibold text-white">Balanced Nutrition</span>
          </div>
        </div>

        {/* Schedule Line */}
        <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-2 text-xs text-[#B5B8C5]">
          <CalendarDaysIcon className="w-4 h-4 text-[#FF7A18]" />
          <span>Available on: </span>
          <span className="font-bold text-[#FF7A18]">
            {tiffin.availability?.days?.join(', ') ||
              'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday'}
          </span>
        </div>
      </div>

      {/* 2. TODAY'S MENU CARD */}
      <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>🍱</span>
          <span>Today's Menu</span>
        </h2>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 shrink-0 bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-3 rounded-2xl w-28 text-center"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden border border-[#FF7A18]/30 shrink-0">
                <img
                  src={
                    item.image ||
                    item.img ||
                    'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-semibold text-white leading-tight line-clamp-2">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. NUTRITION INFO CARD */}
      <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">Nutrition Info (Approx.)</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-[#FF7A18]">{nutrition.calories || 350}</div>
            <div className="text-xs text-[#B5B8C5]/60 font-medium">Calories</div>
          </div>

          <div className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-blue-400">{nutrition.protein || 10}g</div>
            <div className="text-xs text-[#B5B8C5]/60 font-medium">Protein</div>
          </div>

          <div className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-amber-400">{nutrition.carbs || 55}g</div>
            <div className="text-xs text-[#B5B8C5]/60 font-medium">Carbs</div>
          </div>

          <div className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-rose-500">{nutrition.fat || 8}g</div>
            <div className="text-xs text-[#B5B8C5]/60 font-medium">Fat</div>
          </div>
        </div>
      </div>

      {/* 4. DELIVERY & AVAILABILITY CARD */}
      <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">Delivery & Availability</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF7A18]/10 text-[#FF7A18]">
              <ClockIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#B5B8C5]/60 font-medium">Delivery Time</div>
              <div className="text-sm font-bold text-white">7:00 AM – 9:00 AM</div>
            </div>
          </div>

          <div className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF7A18]/10 text-[#FF7A18]">
              <CalendarDaysIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#B5B8C5]/60 font-medium">Available</div>
              <div className="text-sm font-bold text-white">Mon – Sat</div>
            </div>
          </div>

          <div className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF7A18]/10 text-[#FF7A18]">
              <MapPinIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#B5B8C5]/60 font-medium">Delivery Radius</div>
              <div className="text-sm font-bold text-white">Within 5 km</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CUSTOMER REVIEWS CARD */}
      <div className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Customer Reviews</h2>
            <div className="flex items-center gap-1 text-xs font-bold text-white bg-[#12141D] px-2.5 py-1 rounded-lg border border-[rgba(255,255,255,0.06)]">
              <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>4.8</span>
              <span className="text-[#B5B8C5]/60 font-normal">(320 reviews)</span>
            </div>
          </div>

          <button className="text-xs font-bold text-[#FF5216] hover:underline cursor-pointer">
            View All Reviews →
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {mockReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#12141D] border border-[rgba(255,255,255,0.04)] p-4 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{rev.name}</div>
                    <div className="text-[10px] text-[#B5B8C5]/50">{rev.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                  {[...Array(rev.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-[#B5B8C5] leading-relaxed line-clamp-3">
                  "{rev.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center items-center gap-1.5 pt-2">
          {[0, 1, 2, 3].map((dot) => (
            <button
              key={dot}
              onClick={() => setActiveReviewDot(dot)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeReviewDot === dot ? 'w-5 bg-[#FF5216]' : 'w-1.5 bg-[#B5B8C5]/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TiffinInfoSections;
