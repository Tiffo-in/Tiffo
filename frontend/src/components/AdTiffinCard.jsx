import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import TiffinCard from './TiffinCard';
import api from '../services/api';

const AdTiffinCard = ({ campaign, observeRef }) => {
  // Extract the tiffin object from the campaign structure.
  // Assuming the backend populates `tiffin` or `partner` info we can pass down.
  // Wait: our adController returns campaign where `campaign.partner` is populated,
  // but it might not have the full Tiffin document. 
  // Wait, if the ad is a "General Campaign", we might just want to show the partner profile OR we need the user to link a specific tiffin to the ad.
  // Actually, let's assume `campaign.tiffin` is populated, OR we format the campaign to look like a Tiffin.
  // Let's format the campaign data to match what TiffinCard expects if tiffin is null.
  
  const formattedTiffin = campaign.tiffin || {
    _id: campaign.partner._id, // fallback to partner profile
    title: campaign.menuOfTheDay ? `Special: ${campaign.menuOfTheDay}` : `${campaign.partner.businessName} Signature`,
    description: campaign.hasTrialMealBoost 
                  ? `Try our 1-day trial for ₹${campaign.trialMealPrice}!` 
                  : `Premium tiffin service from ${campaign.partner.businessName}`,
    price: { 
      daily: campaign.trialMealPrice || 150,
      weekly: 0,
      monthly: 0
    },
    images: campaign.partner.logo ? [campaign.partner.logo] : [], // fallback image
    rating: campaign.partner.rating || { average: 5, count: 10 + Math.floor(Math.random() * 50) },
    partner: campaign.partner,
    distance: campaign.distance,
    mealType: campaign.slot.toLowerCase()
  };

  const handleClickCapture = () => {
    // Fire click metric async, but don't prevent navigation
    api.post(`/ads/clicks/${campaign._id}`).catch(err => console.error('Click logging failed', err));
  };

  return (
    <div 
      ref={observeRef} 
      data-campaign-id={campaign._id}
      onClickCapture={handleClickCapture}
      className="relative rounded-2xl group transition-all duration-300"
    >
      {/* Golden gradient aura behind the card */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 rounded-[1.2rem] blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
      
      {/* "Sponsored" Premium Tag */}
      <div className="absolute -top-3 -right-3 z-20 flex items-center bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-neutral-900">
        <SparklesIcon className="w-3 h-3 text-yellow-100 mr-1" /> Sponsored
      </div>

      {campaign.hasTrialMealBoost && (
        <div className="absolute -bottom-3 -left-3 z-20 flex items-center bg-gradient-to-r from-fuchsia-600 to-rose-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-neutral-900">
          🔥 Trial Meal ₹{campaign.trialMealPrice}
        </div>
      )}
      
      {/* Inner Tiffin Card - Rendered exactly as standard */}
      <div className="relative z-10 bg-white rounded-2xl h-full border border-amber-200 dark:border-amber-900 overflow-hidden">
        <TiffinCard tiffin={formattedTiffin} showDistance={campaign.distance !== undefined} />
      </div>
    </div>
  );
};

export default AdTiffinCard;
