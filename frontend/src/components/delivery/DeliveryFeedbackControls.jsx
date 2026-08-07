import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

import api from '../../services/api';

const REPORT_REASONS = [
  { value: 'not_delivered', label: "Didn't arrive" },
  { value: 'late', label: 'Too late' },
  { value: 'quality', label: 'Quality issue' },
  { value: 'wrong_item', label: 'Wrong item' },
  { value: 'other', label: 'Other' },
];

/**
 * Rate a delivered meal or report a problem with it. Self-contained: calls the
 * API and invokes onDone() so the parent can refresh.
 */
const DeliveryFeedbackControls = ({ delivery, onDone }) => {
  const [rating, setRating] = useState(delivery.feedback?.rating || 0);
  const [hover, setHover] = useState(0);
  const [reporting, setReporting] = useState(false);
  const [busy, setBusy] = useState(false);

  const alreadyRated = Boolean(delivery.feedback?.rating);
  const hasOpenReport = delivery.report?.status === 'open';

  const submitRating = async (value) => {
    setRating(value);
    setBusy(true);
    try {
      await api.post(`/deliveries/${delivery._id}/feedback`, { rating: value });
      toast.success('Thanks for your feedback!');
      onDone?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save your rating');
    } finally {
      setBusy(false);
    }
  };

  const submitReport = async (reason) => {
    setBusy(true);
    try {
      await api.post(`/deliveries/${delivery._id}/report`, { reason });
      toast.success('Report submitted — our team will look into it.');
      setReporting(false);
      onDone?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit report');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-0.5" role="group" aria-label="Rate this meal">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = (hover || rating) >= n;
          const Icon = filled ? StarIcon : StarOutline;
          return (
            <button
              key={n}
              type="button"
              disabled={busy || alreadyRated}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => submitRating(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className="disabled:cursor-default"
            >
              <Icon className={`w-4 h-4 ${filled ? 'text-rating' : 'text-neutral-300'}`} />
            </button>
          );
        })}
      </div>

      {hasOpenReport ? (
        <span className="text-xs text-red-500 font-medium">Issue reported</span>
      ) : reporting ? (
        <div className="flex flex-wrap justify-end gap-1">
          {REPORT_REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => submitReport(r.value)}
              disabled={busy}
              className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {r.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setReporting(true)}
          className="text-xs text-neutral-500 hover:text-red-500"
        >
          Report an issue
        </button>
      )}
    </div>
  );
};

export default DeliveryFeedbackControls;
