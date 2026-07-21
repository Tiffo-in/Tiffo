import React from 'react';

import { getDeliveryStatus } from './deliveryStatus';

/** Status-accurate pill for a single delivery. */
const DeliveryStatusChip = ({ status, className = '' }) => {
  const cfg = getDeliveryStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cfg.badge} ${className}`}
    >
      <span aria-hidden="true">{cfg.emoji}</span>
      {cfg.label}
    </span>
  );
};

export default DeliveryStatusChip;
