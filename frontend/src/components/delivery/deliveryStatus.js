/**
 * Single source of truth for delivery-status presentation, shared across the
 * subscription timeline, calendar, and feedback surfaces so a status always
 * looks the same everywhere.
 */
export const DELIVERY_STATUS = {
  scheduled: {
    label: 'Scheduled',
    emoji: '🗓️',
    badge: 'bg-neutral-100 text-neutral-600',
    dot: 'bg-neutral-400',
  },
  preparing: {
    label: 'Preparing',
    emoji: '👨‍🍳',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    emoji: '🛵',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  delivered: {
    label: 'Delivered',
    emoji: '✅',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  skipped: {
    label: 'Skipped',
    emoji: '⏭️',
    badge: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-400',
  },
  cancelled: {
    label: 'Cancelled',
    emoji: '✖️',
    badge: 'bg-red-100 text-red-600',
    dot: 'bg-red-400',
  },
};

export const getDeliveryStatus = (status) =>
  DELIVERY_STATUS[status] || {
    label: (status || 'unknown').replace(/_/g, ' '),
    emoji: '•',
    badge: 'bg-neutral-100 text-neutral-500',
    dot: 'bg-neutral-300',
  };

// The timestamp field the backend sets for each status (e.g. deliveredAt).
export const statusTimestampField = (status) => `${status}At`;
