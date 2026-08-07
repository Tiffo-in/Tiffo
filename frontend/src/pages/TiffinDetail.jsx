import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';

import { getTiffin } from '../store/slices/tiffinSlice';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TiffinHero from '../components/tiffin-detail/TiffinHero';
import TiffinInfoSections from '../components/tiffin-detail/TiffinInfoSections';
import TiffinPricingCard from '../components/tiffin-detail/TiffinPricingCard';
import SubscribeModal from '../components/tiffin-detail/SubscribeModal';
import CartDrawer from '../components/tiffin-detail/CartDrawer';
import { computePricing, GST_RATE } from '../components/tiffin-detail/tiffinPricing';

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
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    if (id) dispatch(getTiffin(id));
  }, [dispatch, id]);

  const activeTiffin = storeTiffin;

  // Real "You May Also Like" — same cuisine, excluding the current tiffin.
  useEffect(() => {
    if (!activeTiffin?._id) return;
    let cancelled = false;
    api
      .get('/tiffins', { params: { cuisine: activeTiffin.cuisine, limit: 5 } })
      .then((res) => {
        if (cancelled) return;
        const items = (res.data?.data || []).filter((t) => t._id !== activeTiffin._id).slice(0, 4);
        setRecommended(items);
      })
      .catch(() => !cancelled && setRecommended([]));
    return () => {
      cancelled = true;
    };
  }, [activeTiffin?._id, activeTiffin?.cuisine]);

  const { daily, planPrice, planOriginal } = computePricing(activeTiffin || {});
  const effectivePlanPrice = planPrice[selectedPlan] || 0;
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

  if (isLoading || (!activeTiffin && !storeTiffin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page text-neutral-900">
        <LoadingSpinner size="large" message="Loading tiffin details…" />
      </div>
    );
  }

  if (!activeTiffin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-page text-neutral-900 px-6 text-center">
        <div className="text-5xl mb-4">🍱</div>
        <h1 className="text-2xl font-black mb-2">Tiffin not found</h1>
        <p className="text-neutral-600 mb-6">This tiffin may no longer be available.</p>
        <Link
          to="/tiffins"
          className="px-6 py-3 bg-primary-500 text-on-brand rounded-xl font-bold hover:bg-primary-600 transition-colors"
        >
          Browse Tiffins
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page text-neutral-900 pt-24 pb-20 font-sans selection:bg-primary-500/30 selection:text-orange-200">
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
              daily={daily}
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

        {/* ─── YOU MAY ALSO LIKE (real tiffins, same cuisine) ─── */}
        {recommended.length > 0 && (
          <div className="pt-8 border-t border-neutral-100">
            <h2 className="text-xl font-black text-neutral-900 mb-6">You May Also Like</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommended.map((rec) => (
                <Link to={`/tiffins/${rec.slug || rec._id}`} key={rec._id}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-surface-alt border border-neutral-100 hover:border-brand-border rounded-2xl overflow-hidden shadow-card cursor-pointer group transition-all"
                  >
                    <div className="relative h-36 bg-surface-page overflow-hidden flex items-center justify-center">
                      {rec.images?.[0] ? (
                        <img
                          src={rec.images[0]}
                          alt={rec.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-4xl opacity-40">🍱</span>
                      )}
                      {rec.dietary?.includes('veg') && (
                        <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-neutral-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-card">
                          Veg
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="text-neutral-900 text-sm font-bold group-hover:text-brand-ink transition-colors line-clamp-1 mb-1">
                        {rec.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-neutral-600">
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-3.5 h-3.5 text-rating fill-amber-400" />
                          <span className="text-neutral-900 font-bold">
                            {rec.rating?.average?.toFixed(1) || 'New'}
                          </span>
                        </div>
                        {rec.price?.daily != null && (
                          <div className="font-extrabold text-neutral-900">
                            ₹{rec.price.daily}/day
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
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
