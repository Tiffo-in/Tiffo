import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import api from '../../services/api';
import DeliveryStatusChip from './DeliveryStatusChip';

/**
 * "What's for lunch today" — the customer's deliveries scheduled for today
 * (IST) with the dish/menu and live status. Predictability is the whole point
 * of subscribing, so this is the first thing they should see.
 */
const TodaysTiffin = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/subscriptions/deliveries/today')
      .then((res) => active && setDeliveries(res.data.data || []))
      .catch(() => active && setDeliveries([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading || deliveries.length === 0) return null; // nothing scheduled today — stay quiet

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
        <span aria-hidden="true">🍱</span> Today&apos;s Tiffin
      </h3>
      {deliveries.map((delivery) => {
        const tiffin = delivery.subscription?.tiffin;
        const menu = (tiffin?.menuItems || []).slice(0, 4);
        return (
          <motion.div
            key={delivery._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-card flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="font-semibold text-neutral-900 truncate">
                {tiffin?.title || 'Your tiffin'}
              </p>
              <p className="text-sm text-neutral-500 mb-2">
                {delivery.partner?.businessName} · {delivery.deliveryTime}
              </p>
              {menu.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {menu.map((item, i) => (
                    <span
                      key={item._id || i}
                      className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <DeliveryStatusChip status={delivery.status} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default TodaysTiffin;
