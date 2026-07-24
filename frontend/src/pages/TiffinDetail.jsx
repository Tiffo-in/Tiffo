import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/outline';

import { getTiffin } from '../store/slices/tiffinSlice';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TiffinHero from '../components/tiffin-detail/TiffinHero';
import TiffinInfoSections from '../components/tiffin-detail/TiffinInfoSections';
import TiffinPricingCard from '../components/tiffin-detail/TiffinPricingCard';
import SubscribeModal from '../components/tiffin-detail/SubscribeModal';
import CartDrawer from '../components/tiffin-detail/CartDrawer';
import { computePricing, GST_RATE } from '../components/tiffin-detail/tiffinPricing';

// Default mock tiffin details for fallback or demo
const defaultMockTiffin = {
  _id: 'm1',
  title: 'Healthy Breakfast Box',
  description:
    'A light and healthy breakfast to kickstart your day! Enjoy delicious poha or upma with coconut chutney, boiled eggs (optional), seasonal fruit, and green tea.',
  mealType: 'breakfast',
  cuisine: 'Healthy',
  isVeg: true,
  rating: { average: 4.8, count: 320 },
  prepTime: '25–30 mins',
  price: { daily: 70 },
  availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
  partner: {
    businessName: "Meena's Kitchen",
    verified: true,
    logo: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80',
  },
  images: [
    'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
  ],
  menuItems: [
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
  ],
  nutritionInfo: { calories: 350, protein: 10, carbs: 55, fat: 8 },
};

// "You May Also Like" carousel data
const recommendedTiffins = [
  {
    _id: 'r1',
    name: 'Oats & Fruits Bowl',
    rating: 4.7,
    price: 80,
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=500&q=80',
  },
  {
    _id: 'r2',
    name: 'South Indian Breakfast',
    rating: 4.8,
    price: 75,
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
  },
  {
    _id: 'r3',
    name: 'Moong Chilla Box',
    rating: 4.6,
    price: 85,
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=80',
  },
  {
    _id: 'r4',
    name: 'Protein Breakfast Box',
    rating: 4.9,
    price: 95,
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=500&q=80',
  },
];

const TiffinDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tiffin: storeTiffin, isLoading } = useSelector((s) => s.tiffins);
  const { user } = useSelector((s) => s.auth);

  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('weekly');
  const [creatingSubscription, setCreatingSubscription] = useState(false);
  const [cartItem, setCartItem] = useState(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (id && !id.startsWith('m') && !id.startsWith('r') && !id.startsWith('p')) {
      dispatch(getTiffin(id));
    }
  }, [dispatch, id]);

  const activeTiffin = storeTiffin || defaultMockTiffin;

  const { daily, planPrice, planOriginal } = computePricing(activeTiffin);
  const effectivePlanPrice =
    planPrice[selectedPlan] ||
    (selectedPlan === 'weekly' ? 431 : selectedPlan === 'monthly' ? 2100 : 70);
  const gstAmount = Math.round(effectivePlanPrice * GST_RATE);
  const grandTotal = effectivePlanPrice + gstAmount;

  const handleSubscribeClick = () => {
    if (!user) {
      toast.error('Please login to subscribe to a tiffin service');
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  const handleCreateSubscription = async ({
    startDate,
    deliveryTime,
    address,
    specialInstructions,
  }) => {
    if (!address?.street || !address?.city || !address?.pincode) {
      toast.error('Please fill all required address fields');
      return;
    }
    setCreatingSubscription(true);
    try {
      const res = await api.post('/subscriptions', {
        tiffinId: activeTiffin._id,
        plan: selectedPlan,
        startDate,
        deliveryAddress: address,
        deliveryTime,
        specialInstructions,
      });
      const sub = res.data?.data || res.data;
      setCartItem({
        ...sub,
        tiffin: activeTiffin,
        plan: selectedPlan,
        grandTotal,
        gstAmount,
        planPrice: effectivePlanPrice,
      });
      setShowModal(false);
      setShowCart(true);
      toast.success('Added to cart! Review and proceed to payment.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create subscription. Please try again.';
      toast.error(msg);
    } finally {
      setCreatingSubscription(false);
    }
  };

  const handleCheckout = () => {
    if (!cartItem?._id) return;
    setShowCart(false);
    navigate(`/checkout/${cartItem._id}`);
  };

  if (isLoading && !storeTiffin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1016] text-white">
        <LoadingSpinner size="large" message="Loading tiffin details…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1016] text-white pt-24 pb-20 font-sans selection:bg-[#FF7A18]/30 selection:text-orange-200">
      <Helmet>
        <title>{`${activeTiffin.title || 'Tiffin Details'} | Tiffo`}</title>
        <meta
          name="description"
          content={`Order ${activeTiffin.title} by ${activeTiffin.partner?.businessName || 'local chef'}.`}
        />
      </Helmet>

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <TiffinHero
          tiffin={activeTiffin}
          onBack={() => navigate(-1)}
          onSubscribe={handleSubscribeClick}
        />

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Column (Stack of Info Cards) */}
          <div className="lg:col-span-8">
            <TiffinInfoSections tiffin={activeTiffin} />
          </div>

          {/* Right Column (Sticky Plan Selector Card) */}
          <div className="lg:col-span-4">
            <TiffinPricingCard
              tiffin={activeTiffin}
              daily={daily || 70}
              planPrice={planPrice}
              planOriginal={planOriginal}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              gstAmount={gstAmount}
              grandTotal={grandTotal}
              hasCartItem={!!cartItem}
              onSubscribe={handleSubscribeClick}
              onViewCart={() => setShowCart(true)}
            />
          </div>
        </div>

        {/* ─── YOU MAY ALSO LIKE CAROUSEL SECTION ─── */}
        <div className="pt-8 border-t border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">You May Also Like</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-[#181A24] border border-[rgba(255,255,255,0.08)] text-[#B5B8C5] hover:text-white transition-colors cursor-pointer">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl bg-[#181A24] border border-[rgba(255,255,255,0.08)] text-[#B5B8C5] hover:text-white transition-colors cursor-pointer">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedTiffins.map((rec) => (
              <Link to={`/tiffins/${rec._id}`} key={rec._id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-[#181A24] border border-[rgba(255,255,255,0.08)] hover:border-[#FF7A18]/50 rounded-2xl overflow-hidden shadow-lg cursor-pointer group transition-all"
                >
                  <div className="relative h-36 bg-[#0F1016] overflow-hidden">
                    <img
                      src={rec.image}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                      Veg
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-white text-sm font-bold group-hover:text-[#FF7A18] transition-colors line-clamp-1 mb-1">
                      {rec.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-[#B5B8C5]">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-white font-bold">{rec.rating}</span>
                      </div>
                      <div className="font-extrabold text-white">₹{rec.price}/day</div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <SubscribeModal
        open={showModal}
        tiffin={activeTiffin}
        selectedPlan={selectedPlan}
        onSelectPlan={setSelectedPlan}
        grandTotal={grandTotal}
        creating={creatingSubscription}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateSubscription}
      />

      <CartDrawer
        open={showCart}
        cartItem={cartItem}
        tiffin={activeTiffin}
        onClose={() => setShowCart(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default TiffinDetail;
