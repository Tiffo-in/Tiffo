import { useEffect, useRef } from 'react';
import api from '../services/api';

/**
 * Custom hook to track Ad impressions using IntersectionObserver
 * Groups observed campaign IDs into a batch and sends them to backend.
 */
const useImpressionTracker = () => {
  const observerRef = useRef(null);
  const pendingCampaignsRef = useRef(new Set());
  const debounceTimerRef = useRef(null);

  const flushImpressions = async () => {
    const campaigns = Array.from(pendingCampaignsRef.current);
    if (campaigns.length === 0) return;

    pendingCampaignsRef.current.clear(); // Clear so we don't send duplicates while request is pending

    try {
      await api.post('/ads/impressions', { campaignIds: campaigns });
    } catch (err) {
      console.error('Failed to log ad impressions', err);
    }
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      let idsAdded = false;

      entries.forEach((entry) => {
        // If the element is more than 50% visible
        if (entry.isIntersecting) {
          const campaignId = entry.target.dataset.campaignId;
          
          if (campaignId && !pendingCampaignsRef.current.has(campaignId)) {
            pendingCampaignsRef.current.add(campaignId);
            idsAdded = true;
            
            // Stop observing this exact element so we don't spam impressions 
            // if they scroll up and down. Backend frequency cap will also protect this.
            observerRef.current.unobserve(entry.target);
          }
        }
      });

      if (idsAdded) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        // Flush after 1.5 seconds of accumulating visible ads
        debounceTimerRef.current = setTimeout(() => {
          flushImpressions();
        }, 1500);
      }
    }, {
      threshold: 0.5 // 50% of the item must be visible
    });

    return () => {
      // Cleanup
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return {
    // This ref callback can be attached to the ad elements
    observeRef: (node) => {
      if (node && observerRef.current) {
        observerRef.current.observe(node);
      }
    }
  };
};

export default useImpressionTracker;
