import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '../../contexts/AlertContext';
import { RootStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';
import { ColorScheme } from '../../theme/colors';
import { deliveryStatusMeta } from '../../theme/deliveryStatus';
import { useTheme } from '../../theme/useTheme';

interface Delivery {
  _id: string;
  deliveryDate: string;
  deliveryTime?: string;
  status: string;
  deliveredAt?: string;
  feedback?: { rating?: number };
  report?: { status?: string };
}

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'not_delivered', label: "Didn't arrive" },
  { value: 'late', label: 'Too late' },
  { value: 'quality', label: 'Quality issue' },
  { value: 'wrong_item', label: 'Wrong item' },
];

// Mirror the server rule: skippable while scheduled and before 8 PM IST the day before.
const canSkip = (d: Delivery) => {
  if (d.status !== 'scheduled') return false;
  const day = new Date(d.deliveryDate);
  day.setHours(0, 0, 0, 0);
  return Date.now() < day.getTime() - 4 * 60 * 60 * 1000;
};

const Stars = ({
  value,
  onRate,
  C,
}: {
  value: number;
  onRate: (n: number) => void;
  C: ColorScheme;
}) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <TouchableOpacity key={n} disabled={value > 0} onPress={() => onRate(n)} hitSlop={6}>
        <Ionicons name={n <= value ? 'star' : 'star-outline'} size={18} color={C.warning} />
      </TouchableOpacity>
    ))}
  </View>
);

export default function DeliveryTimelineScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const route = useRoute<RouteProp<RootStackParams, 'DeliveryTimeline'>>();
  const { subscriptionId, title } = route.params;
  const { confirm, success, error: showError } = useAlert();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get(`/subscriptions/${subscriptionId}/deliveries`);
      setDeliveries(res.data?.deliveries || []);
    } catch {
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionId]);

  const call = async (fn: () => Promise<{ data: { message?: string } }>, id: string) => {
    setBusyId(id);
    try {
      const res = await fn();
      success('Done', res.data?.message || 'Updated');
      await load();
    } catch (e: any) {
      showError('Something went wrong', e?.response?.data?.message || 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const onSkip = (d: Delivery) =>
    confirm(
      'Skip this day?',
      'A make-up delivery is added to the end of your plan — you never lose a meal.',
      () => call(() => api.patch(`/deliveries/${d._id}/skip`), d._id),
      undefined,
      'Skip day',
    );

  const rate = (d: Delivery, n: number) =>
    call(() => api.post(`/deliveries/${d._id}/feedback`, { rating: n }), d._id);

  const report = (d: Delivery, reason: string) => {
    setReportingId(null);
    call(() => api.post(`/deliveries/${d._id}/report`, { reason }), d._id);
  };

  return (
    <SafeAreaView style={S.safe}>
      <View style={S.header}>
        <TouchableOpacity onPress={() => nav.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={S.headerTitle} numberOfLines={1}>
          {title || 'Deliveries'}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={C.primary} size="large" style={{ marginTop: 60 }} />
      ) : deliveries.length === 0 ? (
        <View style={S.empty}>
          <Ionicons name="cube-outline" size={44} color={C.textSecondary} />
          <Text style={S.emptyTxt}>No deliveries scheduled yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {deliveries.map((d) => {
            const meta = deliveryStatusMeta(d.status, C);
            const dateLabel = new Date(d.deliveryDate).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });
            const busy = busyId === d._id;
            return (
              <View key={d._id} style={S.row}>
                <View style={{ flex: 1 }}>
                  <Text style={S.date}>{dateLabel}</Text>
                  {d.status === 'delivered' && d.deliveredAt && (
                    <Text style={S.sub}>
                      Delivered ·{' '}
                      {new Date(d.deliveredAt).toLocaleTimeString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}

                  {d.status === 'delivered' && (
                    <View style={{ marginTop: 6 }}>
                      <Stars value={d.feedback?.rating || 0} onRate={(n) => rate(d, n)} C={C} />
                      {d.report?.status === 'open' ? (
                        <Text style={S.reported}>Issue reported</Text>
                      ) : reportingId === d._id ? (
                        <View style={S.reasonRow}>
                          {REPORT_REASONS.map((r) => (
                            <TouchableOpacity
                              key={r.value}
                              style={S.reasonChip}
                              disabled={busy}
                              onPress={() => report(d, r.value)}
                            >
                              <Text style={S.reasonTxt}>{r.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : (
                        <TouchableOpacity onPress={() => setReportingId(d._id)}>
                          <Text style={S.link}>Report an issue</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[S.badge, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={12} color={meta.color} />
                    <Text style={[S.badgeTxt, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                  {canSkip(d) && (
                    <TouchableOpacity disabled={busy} onPress={() => onSkip(d)}>
                      <Text style={S.link}>Skip</Text>
                    </TouchableOpacity>
                  )}
                  {d.status === 'skipped' && (
                    <TouchableOpacity
                      disabled={busy}
                      onPress={() => call(() => api.patch(`/deliveries/${d._id}/unskip`), d._id)}
                    >
                      <Text style={S.link}>Undo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
          <Text style={S.footnote}>
            Skipping a day adds a make-up delivery to the end of your plan. Up to 4 skips per month.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: C.borderLight,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      color: C.textPrimary,
    },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
    emptyTxt: { color: C.textSecondary, fontSize: 14 },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      backgroundColor: C.surfaceCard,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },
    date: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
    sub: { fontSize: 12, color: C.textTertiary, marginTop: 2 },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeTxt: { fontSize: 12, fontWeight: '700' },
    link: { fontSize: 13, fontWeight: '700', color: C.primary },
    reported: { fontSize: 12, color: C.error, fontWeight: '600', marginTop: 4 },
    reasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
    reasonChip: {
      backgroundColor: C.background,
      borderWidth: 1,
      borderColor: C.borderLight,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    reasonTxt: { fontSize: 12, color: C.textSecondary },
    footnote: { fontSize: 12, color: C.textTertiary, marginTop: 8, lineHeight: 17 },
  });
