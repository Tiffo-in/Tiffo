import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { getTiffin } from '../store/slices/tiffinSlice';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import RatingsSummary from '../components/RatingsSummary';
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
  const { tiffin, isLoading } = useSelector((s) => s.tiffins);
  const { user } = useSelector((s) => s.auth);

  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('weekly');
  const [creatingSubscription, setCreatingSubscription] = useState(false);
  const [cartItem, setCartItem] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

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

  const { daily, planPrice, planOriginal } = computePricing(tiffin);
  const gstAmount = Math.round(planPrice[selectedPlan] * GST_RATE);
  const grandTotal = planPrice[selectedPlan] + gstAmount;

  const discount = tiffin.discount;
  const discountActive =
    discount?.isActive && (!discount.expiresAt || new Date() < new Date(discount.expiresAt));
  const maxDiscount = discountActive ? Math.max(discount.weekly || 0, discount.monthly || 0) : 0;

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
      setCartItem({
        ...sub,
        tiffin,
        plan: selectedPlan,
        grandTotal,
        gstAmount,
        planPrice: planPrice[selectedPlan],
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <Helmet>
        <title>{`${tiffin.title} | Tiffo Homemade Tiffins`}</title>
        <meta
          name="description"
          content={`Order ${tiffin.title} by ${tiffin.partner?.businessName || 'local chef'}. Authentic ${tiffin.cuisine} ${tiffin.mealType} starting at ₹${tiffin.price?.daily || ''}/day.`}
        />
        <meta property="og:title" content={`${tiffin.title} - Tiffo`} />
        <meta property="og:image" content={tiffin.images?.[0] || ''} />
      </Helmet>

      <TiffinHero tiffin={tiffin} maxDiscount={maxDiscount} onBack={() => navigate(-1)} />

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <TiffinInfoSections tiffin={tiffin} />

          <RatingsSummary key={`ratings-${reviewRefreshKey}`} tiffinId={tiffin._id} />
          <ReviewList key={`reviews-${reviewRefreshKey}`} tiffinId={tiffin._id} />
          <ReviewForm
            tiffinId={tiffin._id}
            onReviewSubmitted={() => setReviewRefreshKey((k) => k + 1)}
          />
        </div>

        <div className="lg:col-span-1">
          <TiffinPricingCard
            tiffin={tiffin}
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

      <SubscribeModal
        open={showModal}
        tiffin={tiffin}
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
        tiffin={tiffin}
        onClose={() => setShowCart(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default TiffinDetail;
