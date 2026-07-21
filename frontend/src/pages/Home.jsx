import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import { getTiffins } from '../store/slices/tiffinSlice';
import AnimatedBackground from '../components/AnimatedBackground';
import HomeHero from '../components/home/HomeHero';
import HomeFeatures from '../components/home/HomeFeatures';
import HomeFeaturedTiffins from '../components/home/HomeFeaturedTiffins';
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
    <div className="min-h-screen relative bg-neutral-50 dark:bg-neutral-950 font-sans selection:bg-primary-200 selection:text-primary-900 overflow-hidden">
      <Helmet>
        <title>Tiffo - Authentic Homemade Tiffin Delivery Service</title>
        <meta
          name="description"
          content="Discover and subscribe to authentic homemade tiffin services near you. Fresh, healthy, and hygienic meals delivered daily."
        />
      </Helmet>
      <AnimatedBackground density="low" />

      <HomeHero user={user} />
      <HomeFeatures />
      <HomeFeaturedTiffins tiffins={tiffins} isLoading={isLoading} />
      <HomeAppPromo />
      <HomeFooter />
    </div>
  );
};

export default Home;
