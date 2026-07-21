import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import api from '../services/api';
import { ColorScheme } from '../theme/colors';
import { deliveryStatusMeta } from '../theme/deliveryStatus';
import { useTheme } from '../theme/useTheme';

interface TodayDelivery {
  _id: string;
  deliveryTime?: string;
  status: string;
  partner?: { businessName?: string };
  subscription?: { tiffin?: { title?: string; menuItems?: { _id?: string; name: string }[] } };
}

/**
 * "What's for lunch today" — the customer's deliveries scheduled for today
 * (IST) with menu and live status. Stays hidden when nothing is scheduled.
 */
export default function TodaysTiffinCard() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const [deliveries, setDeliveries] = useState<TodayDelivery[]>([]);

  useEffect(() => {
    let active = true;
    api
      .get('/subscriptions/deliveries/today')
      .then(
        (res: { data?: { data?: TodayDelivery[] } }) =>
          active && setDeliveries(res.data?.data || []),
      )
      .catch(() => active && setDeliveries([]));
    return () => {
      active = false;
    };
  }, []);

  if (deliveries.length === 0) return null;

  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={S.heading}>🍱 Today&apos;s Tiffin</Text>
      {deliveries.map((d) => {
        const tiffin = d.subscription?.tiffin;
        const menu = (tiffin?.menuItems || []).slice(0, 3);
        const meta = deliveryStatusMeta(d.status, C);
        return (
          <View key={d._id} style={S.card}>
            <View style={{ flex: 1 }}>
              <Text style={S.title} numberOfLines={1}>
                {tiffin?.title || 'Your tiffin'}
              </Text>
              <Text style={S.sub}>
                {d.partner?.businessName}
                {d.deliveryTime ? ` · ${d.deliveryTime}` : ''}
              </Text>
              {menu.length > 0 && (
                <Text style={S.menu} numberOfLines={1}>
                  {menu.map((m) => m.name).join(' · ')}
                </Text>
              )}
            </View>
            <View style={[S.badge, { backgroundColor: meta.bg }]}>
              <Ionicons name={meta.icon} size={12} color={meta.color} />
              <Text style={[S.badgeTxt, { color: meta.color }]}>{meta.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    heading: { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 10 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surfaceCard,
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
      gap: 10,
    },
    title: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
    sub: { fontSize: 12, color: C.textTertiary, marginTop: 2 },
    menu: { fontSize: 12, color: C.textSecondary, marginTop: 4 },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeTxt: { fontSize: 12, fontWeight: '700' },
  });
