import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import { getTiffins } from '../store/slices/tiffinSlice';
import HomeHero from '../components/home/HomeHero';
import HomeFeaturedTiffins from '../components/home/HomeFeaturedTiffins';
import HomeTestimonials from '../components/home/HomeTestimonials';
import HomePartnerCTA from '../components/home/HomePartnerCTA';
import HomeAppPromo from '../components/home/HomeAppPromo';
import HomeFooter from '../components/home/HomeFooter';

const Home = () => {
  const dispatch = useDispatch();
  const { tiffins, isLoading } = useSelector((state) => state.tiffins);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTiffins({ limit: 6 }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-surface-page font-sans selection:bg-primary-500/30 selection:text-neutral-900">
      <Helmet>
        <title>Tiffo - Authentic Homemade Tiffin Delivery Service</title>
        <meta
          name="description"
          content="Discover and subscribe to authentic homemade tiffin services near you. Fresh, healthy, and hygienic meals delivered daily from verified home kitchens."
        />
      </Helmet>

      <HomeHero user={user} />
      <HomeFeaturedTiffins tiffins={tiffins} isLoading={isLoading} />
      <HomeTestimonials />
      <HomePartnerCTA />
      <HomeAppPromo />
      <HomeFooter />
    </div>
  );
};

export default Home;
