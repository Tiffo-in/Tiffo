import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, MapPinIcon, ClockIcon, XMarkIcon, CheckCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { getTiffin } from '../store/slices/tiffinSlice';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import RatingsSummary from '../components/RatingsSummary';

/* ─── Meal type colour palette ─── */
const MEAL_COLORS = {
  breakfast: 'from-amber-400 to-orange-400',
  lunch:     'from-green-400 to-emerald-500',
  dinner:    'from-indigo-400 to-purple-500',
  snacks:    'from-pink-400 to-rose-500',
};

const PLAN_LABELS = {
  daily:   { label: 'Daily',   desc: '1 day plan',   days: 1  },
  weekly:  { label: 'Weekly',  desc: '7 day plan',   days: 7  },
  monthly: { label: 'Monthly', desc: '30 day plan',  days: 30 },
};

const DELIVERY_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM', '1:00 PM', '7:00 PM', '8:00 PM'];

/* ════════════════════════════════════════════════════════════════════ */
const TiffinDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tiffin, isLoading } = useSelector(s => s.tiffins);
  const { user } = useSelector(s => s.auth);

  /* ── subscribe modal state ── */
  const [showModal, setShowModal]       = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('weekly');
  const [startDate, setStartDate]       = useState('');
  const [deliveryTime, setDeliveryTime] = useState(DELIVERY_SLOTS[3]);
  const [address, setAddress]           = useState({ street: '', city: '', state: '', pincode: '' });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [creatingSubscription, setCreatingSubscription] = useState(false);

  /* ── cart drawer state ── */
  const [cartItem, setCartItem]         = useState(null);   // the subscription details once +clicked
  const [showCart, setShowCart]         = useState(false);

  /* ── image ── */
  const [imageLoaded, setImageLoaded]   = useState(false);

  /* ── default start date = tomorrow ── */
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setStartDate(d.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (id) dispatch(getTiffin(id));
  }, [dispatch, id]);

  if (isLoading || !tiffin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" message="Loading tiffin details…" />
      </div>
    );
  }

  /* ─── Pricing helpers ─── */
  const daily = tiffin.price?.daily || 0;

  const effectivePrice = tiffin.effectivePrice || {
    daily,
    weekly:  Math.round(daily * 7  * (1 - (tiffin.discount?.weekly  || 0) / 100)),
    monthly: Math.round(daily * 30 * (1 - (tiffin.discount?.monthly || 0) / 100)),
    weeklyOriginal:  Math.round(daily * 7),
    monthlyOriginal: Math.round(daily * 30),
    weeklyDiscountPercent:  tiffin.discount?.weekly  || 0,
    monthlyDiscountPercent: tiffin.discount?.monthly || 0,
  };

  const planPrice = {
    daily:   effectivePrice.daily,
    weekly:  effectivePrice.weekly,
    monthly: effectivePrice.monthly,
  };

  const planOriginal = {
    daily:   effectivePrice.daily,
    weekly:  effectivePrice.weeklyOriginal,
    monthly: effectivePrice.monthlyOriginal,
  };

  const gstAmount  = Math.round(planPrice[selectedPlan] * 0.05);
  const grandTotal = planPrice[selectedPlan] + gstAmount;

  const discount = tiffin.discount;
  const discountActive = discount?.isActive && (!discount.expiresAt || new Date() < new Date(discount.expiresAt));
  const maxDiscount = discountActive ? Math.max(discount.weekly || 0, discount.monthly || 0) : 0;

  /* ─── Add to cart / open modal ─── */
  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to subscribe to a tiffin service');
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  /* ─── Create subscription → add to cart ─── */
  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.pincode) {
      toast.error('Please fill all required address fields');
      return;
    }
    setCreatingSubscription(true);
    try {
      const res = await api.post('/subscriptions', {
        tiffinId: tiffin._id,
        plan: selectedPlan,
        startDate,
        deliveryAddress: address,
        deliveryTime,
        specialInstructions,
      });
      const sub = res.data?.data || res.data;
      setCartItem({ ...sub, tiffin, plan: selectedPlan, grandTotal, gstAmount, planPrice: planPrice[selectedPlan] });
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

  /* ─── Proceed to checkout ─── */
  const handleCheckout = () => {
    if (!cartItem?._id) return;
    setShowCart(false);
    navigate(`/checkout/${cartItem._id}`);
  };

  /* ─── Food images ─── */
  const foodImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
  ];
  const heroImage = tiffin.images?.[0] || foodImages[Math.abs(tiffin._id?.charCodeAt(0) % foodImages.length) || 0];
  // Only show real menu items from the database — no hardcoded fallbacks
  const menuItems = tiffin.menuItems || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">

      {/* ─── Hero Image ─── */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {!imageLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={heroImage}
          alt={tiffin.title}
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Discount badge */}
        {maxDiscount > 0 && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg"
          >
            🏷️ Up to {maxDiscount}% OFF
          </motion.div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-1 drop-shadow">{tiffin.title}</h1>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                by {tiffin.partner?.businessName || 'Partner'}
              </p>
            </div>
            {/* Rating */}
            <div className="bg-green-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-lg">
              <StarIcon className="h-4 w-4" />
              <span className="font-bold text-lg">{tiffin.rating?.average?.toFixed(1) || '4.0'}</span>
              <span className="text-white/70 text-xs">({tiffin.rating?.count || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: info + menu */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tags row */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-maroon-100 text-maroon-700 dark:bg-maroon-900/40 dark:text-maroon-300 px-3 py-1 rounded-full text-xs font-semibold capitalize">{tiffin.mealType}</span>
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">{tiffin.cuisine}</span>
            {tiffin.dietary?.map(d => (
              <span key={d} className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold capitalize">{d}</span>
            ))}
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-800">
            <h2 className="font-bold text-lg text-gray-900 dark:text-neutral-100 mb-2">About This Tiffin</h2>
            <p className="text-gray-600 dark:text-neutral-400 leading-relaxed">{tiffin.description}</p>

            {/* Availability */}
            {tiffin.availability?.days?.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-maroon-600" />
                <span className="text-sm text-gray-500 dark:text-neutral-400">Available: <strong className="text-gray-700 dark:text-neutral-200">{tiffin.availability.days.join(', ')}</strong></span>
              </div>
            )}
          </div>

          {/* ─── Menu ─── */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-800">
            <h2 className="font-bold text-lg text-gray-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
              🍽️ Today's Menu
            </h2>
            {menuItems.length === 0 ? (
              <div className="text-center py-10 text-gray-400 dark:text-neutral-500">
                <div className="text-5xl mb-3">🍽️</div>
                <p className="font-medium">Menu not added yet</p>
                <p className="text-sm mt-1">The partner hasn't listed today's menu items yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {menuItems.map((item, i) => (
                  <motion.div
                    key={item._id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-neutral-800 hover:bg-maroon-50 dark:hover:bg-maroon-900/20 transition-colors"
                  >
                    {/* Real dish photo or placeholder */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-700 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🍽️</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-neutral-100 text-sm">{item.name}</p>
                      <p className="text-gray-500 dark:text-neutral-400 text-xs">{item.description || item.desc || ''}</p>
                      {item.category && (
                        <span className="inline-block mt-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-full capitalize">{item.category}</span>
                      )}
                      {item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.map((t, ti) => (
                            <span key={ti} className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Nutrition (if available) */}
          {tiffin.nutritionInfo && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-800">
              <h2 className="font-bold text-lg text-gray-900 dark:text-neutral-100 mb-4">Nutrition Info</h2>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Calories', value: tiffin.nutritionInfo.calories, unit: 'kcal', color: 'text-orange-500' },
                  { label: 'Protein',  value: tiffin.nutritionInfo.protein,  unit: 'g',    color: 'text-blue-500'   },
                  { label: 'Carbs',    value: tiffin.nutritionInfo.carbs,    unit: 'g',    color: 'text-yellow-500' },
                  { label: 'Fat',      value: tiffin.nutritionInfo.fat,      unit: 'g',    color: 'text-red-500'    },
                ].map(n => n.value ? (
                  <div key={n.label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-neutral-800">
                    <p className={`text-xl font-bold ${n.color}`}>{n.value}{n.unit}</p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">{n.label}</p>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          {/* ─── Ratings Summary ─── */}
          <RatingsSummary tiffinId={tiffin._id} />

          {/* ─── Reviews ─── */}
          <ReviewList tiffinId={tiffin._id} />

          {/* ─── Leave a Review ─── */}
          <ReviewForm tiffinId={tiffin._id} onReviewSubmitted={() => window.location.reload()} />
        </div>

        {/* ─── Right: Pricing & Subscribe ─── */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-100 dark:border-neutral-800 overflow-hidden">

            {/* Pricing header */}
            <div className={`bg-gradient-to-r ${MEAL_COLORS[tiffin.mealType] || 'from-maroon-500 to-orange-500'} p-5 text-white`}>
              <p className="text-sm opacity-80 mb-1">Starting at</p>
              <p className="text-4xl font-extrabold">₹{daily}<span className="text-lg font-normal opacity-80">/day</span></p>
            </div>

            <div className="p-5 space-y-5">
              {/* Plan selector */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">Choose a Plan</p>
                <div className="space-y-2">
                  {(['daily', 'weekly', 'monthly']).map(plan => {
                    const orig = planOriginal[plan];
                    const eff  = planPrice[plan];
                    const disc = Math.round((1 - eff / orig) * 100);
                    return (
                      <button
                        key={plan}
                        onClick={() => setSelectedPlan(plan)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${selectedPlan === plan ? 'border-maroon-600 bg-maroon-50 dark:bg-maroon-900/30' : 'border-gray-200 dark:border-neutral-700 hover:border-maroon-300'}`}
                      >
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-neutral-100 capitalize">{plan}</p>
                          <p className="text-xs text-gray-500 dark:text-neutral-400">{PLAN_LABELS[plan].desc}</p>
                        </div>
                        <div className="text-right">
                          {disc > 0 && <p className="text-xs text-gray-400 line-through">₹{orig}</p>}
                          <p className="font-bold text-gray-900 dark:text-neutral-100">₹{eff}</p>
                          {disc > 0 && <p className="text-xs text-green-600 font-semibold">{disc}% off</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-1 text-sm border-t pt-4 dark:border-neutral-700">
                <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                  <span>Subtotal</span><span>₹{planPrice[selectedPlan]}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                  <span>GST (5%)</span><span>₹{gstAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-neutral-100 text-base pt-1 border-t dark:border-neutral-700">
                  <span>Total</span><span className="text-maroon-600">₹{grandTotal}</span>
                </div>
              </div>

              {/* + Add to Cart button */}
              <motion.button
                onClick={handleAddToCart}
                className="w-full btn-primary py-3.5 text-base font-bold flex items-center justify-center gap-2 rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-xl">+</span>
                Subscribe Now
              </motion.button>

              {/* View Cart (only visible when cart has item) */}
              {cartItem && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setShowCart(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-maroon-600 text-maroon-600 font-semibold rounded-xl hover:bg-maroon-50 dark:hover:bg-maroon-900/20 transition-colors"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  View Cart (1 item)
                </motion.button>
              )}

              {/* Partner info */}
              <div className="border-t dark:border-neutral-700 pt-4 text-xs text-gray-500 dark:text-neutral-400 space-y-1">
                <p>🏪 {tiffin.partner?.businessName || 'Partner'}</p>
                <p>⏱️ Fresh daily preparation</p>
                <p>🔒 Secure payment via Razorpay</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SUBSCRIBE MODAL
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
            >
              {/* Modal header */}
              <div className={`bg-gradient-to-r ${MEAL_COLORS[tiffin.mealType] || 'from-maroon-500 to-orange-500'} p-6 rounded-t-3xl text-white relative`}>
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                  <XMarkIcon className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold">Subscribe to {tiffin.title}</h2>
                <p className="text-white/80 text-sm mt-1">Fill in the details to get started</p>
              </div>

              <form onSubmit={handleCreateSubscription} className="p-6 space-y-4">

                {/* Plan (read-only summary) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1">Selected Plan</label>
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'monthly']).map(p => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setSelectedPlan(p)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 capitalize transition-all ${selectedPlan === p ? 'bg-maroon-600 border-maroon-600 text-white' : 'border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:border-maroon-400'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">Total: ₹{grandTotal} (incl. 5% GST)</p>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    onChange={e => setStartDate(e.target.value)}
                    required
                    className="input-field w-full"
                  />
                </div>

                {/* Delivery Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1">Delivery Time *</label>
                  <select value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="input-field w-full">
                    {DELIVERY_SLOTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">Delivery Address *</label>
                  <div className="space-y-2">
                    <input placeholder="Street / Flat no / Colony *" required value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))} className="input-field w-full" />
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="City *" required value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} className="input-field" />
                      <input placeholder="State" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} className="input-field" />
                    </div>
                    <input placeholder="Pincode *" required value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))} className="input-field w-full" />
                  </div>
                </div>

                {/* Special instructions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1">Special Instructions (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Allergies, spice level, leave at door, etc."
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    className="input-field w-full resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={creatingSubscription}
                  className="w-full btn-primary py-3.5 font-bold text-base rounded-xl disabled:opacity-60"
                  whileHover={{ scale: creatingSubscription ? 1 : 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {creatingSubscription ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Adding to Cart…
                    </span>
                  ) : (
                    <span>➕ Add to Cart</span>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          CART DRAWER
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCart && cartItem && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-neutral-900 z-50 shadow-2xl flex flex-col"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            >
              {/* Cart header */}
              <div className="flex items-center justify-between p-5 border-b dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="h-6 w-6 text-maroon-600" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100">Your Cart</h2>
                  <span className="bg-maroon-600 text-white text-xs px-2 py-0.5 rounded-full">1</span>
                </div>
                <button onClick={() => setShowCart(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              {/* Cart body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Item card */}
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-4 border border-gray-200 dark:border-neutral-700">
                  <div className="flex items-start gap-3">
                    <div className="bg-maroon-100 dark:bg-maroon-900/40 rounded-xl p-3 text-2xl">🍱</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-neutral-100">{cartItem.tiffin?.title || tiffin.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">by {tiffin.partner?.businessName}</p>
                      <p className="text-xs text-maroon-600 font-semibold mt-1 capitalize">{cartItem.plan} Plan</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                      <span>📅 Start Date</span>
                      <span className="font-medium">{new Date(cartItem.startDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                      <span>⏰ Delivery Time</span>
                      <span className="font-medium">{cartItem.deliveryTime}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                      <span>🏠 Address</span>
                      <span className="font-medium text-right max-w-[55%]">
                        {cartItem.deliveryAddress?.street}, {cartItem.deliveryAddress?.city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-gray-200 dark:border-neutral-700 space-y-2 text-sm">
                  <h4 className="font-semibold text-gray-800 dark:text-neutral-200 mb-2">Price Breakdown</h4>
                  <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                    <span>Subtotal</span>
                    <span>₹{cartItem.totalAmount || cartItem.planPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                    <span>GST (5%)</span>
                    <span>₹{cartItem.gstAmount}</span>
                  </div>
                  {cartItem.discountPercent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{cartItem.discountLabel || `${cartItem.discountPercent}% Discount`}</span>
                      <span>-₹{cartItem.originalAmount - cartItem.totalAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 dark:text-neutral-100 text-base pt-2 border-t dark:border-neutral-600">
                    <span>Total Amount</span>
                    <span className="text-maroon-600">₹{cartItem.grandTotal}</span>
                  </div>
                </div>

                {/* What you get */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4" /> What's Included
                  </h4>
                  <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                    <li>✓ Fresh daily tiffin delivery</li>
                    <li>✓ Complete {PLAN_LABELS[cartItem.plan]?.desc}</li>
                    <li>✓ Order tracking & notifications</li>
                    <li>✓ Pause / cancel anytime</li>
                  </ul>
                </div>
              </div>

              {/* Cart footer */}
              <div className="p-5 border-t dark:border-neutral-700 bg-white dark:bg-neutral-900">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 dark:text-neutral-400 font-medium">Grand Total</span>
                  <span className="text-2xl font-extrabold text-maroon-600">₹{cartItem.grandTotal}</span>
                </div>
                <motion.button
                  onClick={handleCheckout}
                  className="w-full btn-primary py-4 text-lg font-bold rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  💳 Proceed to Pay
                </motion.button>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TiffinDetail;
