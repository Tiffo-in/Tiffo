import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AdWalletTopup from '../components/AdWalletTopup';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MegaphoneIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

const PartnerAds = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ads/mine');
      if (res.data.success) {
        setCampaigns(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  const activeCampaign = campaigns.find(c => c.isActive) || campaigns[0];
  const walletBalance = activeCampaign ? activeCampaign.walletBalance : 0;
  const totalImpressions = campaigns.reduce((acc, curr) => acc + curr.impressionsCount, 0);
  const totalClicks = campaigns.reduce((acc, curr) => acc + curr.clicksCount, 0);

  const handleCreateAd = async () => {
    setCreating(true);
    try {
      await api.post('/ads', {
        slot: 'AllDay',
        maxBidPerClick: 5,
        dailyBudget: 100,
        hasTrialMealBoost: false,
        menuOfTheDay: ''
      });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleTopupSuccess = (newBalance) => {
    // Optionally update local state specifically, but we can just refetch
    fetchCampaigns();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pb-20">
      {/* Header element */}
      <div className="bg-gradient-to-r from-fuchsia-700 via-rose-600 to-orange-500 pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 pattern-dots" />
        <div className="max-w-7xl mx-auto relative z-10">
          <button onClick={() => navigate('/partner/dashboard')} className="text-white/80 hover:text-white mb-6 font-medium">
            ← Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center tracking-tight">
                <MegaphoneIcon className="w-10 h-10 mr-3 text-fuchsia-200" />
                Ad Manager <span className="ml-3 bg-white/20 text-xs px-2 py-1 rounded-md uppercase tracking-widest text-fuchsia-100 backdrop-blur-sm border border-white/10">Beta</span>
              </h1>
              <p className="text-rose-100 text-lg max-w-xl">Boost your tiffin visibility and reach new customers with priority sponsored listings.</p>
            </div>
            
            <div className="mt-6 md:mt-0 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl flex items-center space-x-6">
              <div>
                <p className="text-rose-100 text-sm font-medium mb-1">Ad Wallet Balance</p>
                <div className="flex items-center">
                  <span className="text-3xl font-black text-white">₹{walletBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsTopupOpen(true)}
                className="bg-white text-rose-600 px-5 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center"
              >
                <CreditCardIcon className="w-5 h-5 mr-2" /> Top Up
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        {loading ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 shadow-xl flex justify-center">
            <LoadingSpinner message="Loading your ad campaigns..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Stats Column */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-xl border border-neutral-100 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Campaign Performance</h3>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-4">
                      <EyeIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Total Impressions</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalImpressions.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center mr-4">
                      <CursorArrowRaysIcon className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Total Clicks</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalClicks.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mr-4">
                      <ChartBarIcon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">CTR (Click-Through)</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} transition={{delay: 0.1}} className="bg-gradient-to-br from-neutral-900 to-black rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <SparklesIcon className="absolute -bottom-4 -right-4 w-32 h-32 text-neutral-800" />
                <h3 className="text-lg font-bold text-white mb-2 relative z-10">Pro Tips</h3>
                <ul className="space-y-3 text-neutral-300 text-sm relative z-10">
                  <li className="flex items-start">
                    <span className="mr-2">💡</span> Bid higher during peak hours (11am-1pm) to ensure top placement.
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">💡</span> Enable 'Trial Meal Boost' to capture hesitant customers.
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">💡</span> Update 'Menu of the Day' daily to trigger AI recommendations!
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Campaigns Column */}
            <div className="lg:col-span-2 space-y-6">
              {campaigns.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">
                  <div className="w-20 h-20 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-full flex items-center justify-center mb-4">
                    <MegaphoneIcon className="w-10 h-10 text-fuchsia-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">No Active Ads</h3>
                  <p className="text-neutral-500 mb-6 max-w-md">Launch your first campaign today. You'll get 500 free impressions just for starting!</p>
                  <button 
                    onClick={handleCreateAd}
                    disabled={creating}
                    className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-4 rounded-xl font-bold shadow-xl hover:scale-105 transition-all text-lg"
                  >
                    {creating ? 'Creating...' : 'Create First Campaign'}
                  </button>
                </div>
              ) : (
                campaigns.map((campaign, i) => (
                  <motion.div 
                    initial={{opacity:0, x:20}} 
                    animate={{opacity:1,x:0}} 
                    transition={{delay: 0.1 * i}} 
                    key={campaign._id} 
                    className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl overflow-hidden border border-neutral-100 dark:border-neutral-800"
                  >
                    <div className="border-b border-neutral-100 dark:border-neutral-800 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/50">
                      <div className="flex items-center space-x-3">
                        <span className={`w-3 h-3 rounded-full ${campaign.isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-neutral-300'}`} />
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Active General Campaign</h3>
                        {campaign.freeImpressions > 0 && (
                          <span className="bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 text-xs px-3 py-1 rounded-full font-bold ml-3 border border-fuchsia-200 dark:border-fuchsia-800/50">
                            {campaign.freeImpressions} Free Boosts Left!
                          </span>
                        )}
                      </div>
                      <button className="text-fuchsia-600 hover:text-fuchsia-700 font-bold text-sm bg-fuchsia-50 hover:bg-fuchsia-100 px-4 py-2 rounded-lg transition-colors">
                        Edit Settings
                      </button>
                    </div>
                    
                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-1">Time Slot</p>
                        <p className="font-bold text-neutral-900 dark:text-white text-lg">{campaign.slot}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-1">Max Bid</p>
                        <p className="font-bold text-neutral-900 dark:text-white text-lg">₹{campaign.maxBidPerClick}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-1">Daily Limit</p>
                        <p className="font-bold text-neutral-900 dark:text-white text-lg">₹{campaign.dailyBudget}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-1">Spent Today</p>
                        <p className="font-bold text-rose-600 text-lg">₹{campaign.spentToday}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <AdWalletTopup 
        isOpen={isTopupOpen} 
        onClose={() => setIsTopupOpen(false)} 
        onSuccess={handleTopupSuccess} 
      />
    </div>
  );
};

export default PartnerAds;
