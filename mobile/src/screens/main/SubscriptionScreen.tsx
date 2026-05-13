import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../navigation/RootNavigator';
import { useTheme } from '../../theme/useTheme';
import { ColorScheme } from '../../theme/colors';

interface Subscription {
  _id: string; plan: string; status: string;
  startDate: string; endDate: string; totalAmount: number;
  tiffin?: { name: string }; partner?: { businessName: string };
}

const STATUS_CFG: Record<string, { icon: keyof typeof Ionicons.glyphMap }> = {
  active:    { icon: 'checkmark-circle' },
  paused:    { icon: 'pause-circle' },
  cancelled: { icon: 'close-circle' },
  expired:   { icon: 'time' },
  pending:   { icon: 'hourglass' },
};

const statusColors = (status: string, C: ColorScheme) => {
  switch (status) {
    case 'active':    return { bg: C.successBg, text: C.success };
    case 'paused':    return { bg: C.warningBg, text: C.warning };
    case 'cancelled': return { bg: C.errorBg,   text: C.error };
    case 'expired':   return { bg: C.surface,    text: C.textTertiary };
    default:          return { bg: C.infoBg,     text: C.info };
  }
};

const SubCard = ({ sub, onPause, onResume, index, C }: {
  sub: Subscription; onPause: () => void; onResume: () => void; index: number; C: ColorScheme;
}) => {
  const S = useMemo(() => createStyles(C), [C]);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 350, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const cfg = STATUS_CFG[sub.status] || STATUS_CFG.pending;
  const sc = statusColors(sub.status, C);
  const endDate   = new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const startDate = new Date(sub.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const daysLeft  = Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000));
  const totalDays = Math.max(1, Math.ceil((new Date(sub.endDate).getTime() - new Date(sub.startDate).getTime()) / 86400000));
  const progress  = Math.min(1, Math.max(0, 1 - daysLeft / totalDays));
  const barColor  = sub.status === 'paused' ? C.warning : C.veg;

  return (
    <Animated.View style={[S.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <View style={S.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={S.mealName} numberOfLines={1}>{sub.tiffin?.name || 'Tiffin Meal'}</Text>
          <Text style={S.partnerName}>by {sub.partner?.businessName || 'Partner Kitchen'}</Text>
        </View>
        <View style={[S.statusBadge, { backgroundColor: sc.bg }]}>
          <Ionicons name={cfg.icon} size={12} color={sc.text} style={{ marginRight: 4 }} />
          <Text style={[S.statusTxt, { color: sc.text }]}>{sub.status.toUpperCase()}</Text>
        </View>
      </View>

      {(sub.status === 'active' || sub.status === 'paused') && (
        <View style={S.progressWrap}>
          <View style={S.progressBg}>
            <View style={[S.progressFill, { width: `${progress * 100}%` as any, backgroundColor: barColor }]} />
          </View>
          <Text style={S.progressTxt}>{daysLeft} days left</Text>
        </View>
      )}

      <View style={S.detailGrid}>
        {[
          { icon: 'calendar-outline' as const, label: 'Plan',    value: sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1) },
          { icon: 'play-forward-outline' as const, label: 'Started', value: startDate },
          { icon: 'flag-outline' as const, label: 'Ends',    value: endDate },
        ].map((d, i) => (
          <React.Fragment key={d.label}>
            {i > 0 && <View style={S.detailDivider} />}
            <View style={S.detailItem}>
              <Ionicons name={d.icon} size={14} color={C.textTertiary} />
              <Text style={S.detailLabel}>{d.label}</Text>
              <Text style={S.detailValue}>{d.value}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <View style={S.priceRow}>
        <Text style={S.priceLabel}>Total charged</Text>
        <Text style={S.priceValue}>₹{sub.totalAmount?.toLocaleString('en-IN')}</Text>
      </View>

      {sub.status === 'active' && (
        <TouchableOpacity style={S.pauseBtn} onPress={onPause} activeOpacity={0.8}>
          <Ionicons name="pause-circle-outline" size={16} color={C.textSecondary} />
          <Text style={S.pauseTxt}>Pause Subscription</Text>
        </TouchableOpacity>
      )}
      {sub.status === 'paused' && (
        <TouchableOpacity style={S.resumeBtn} onPress={onResume} activeOpacity={0.8}>
          <Ionicons name="play-circle-outline" size={16} color={C.veg} />
          <Text style={S.resumeTxt}>Resume Subscription</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default function SubscriptionScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { isAuthenticated } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubs = async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    try { setSubs((await api.get('/subscriptions/my')).data?.data || []); } catch { }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchSubs(); }, [isAuthenticated]);

  const activeCount = subs.filter(s => s.status === 'active').length;
  const totalSpent  = subs.reduce((a, s) => a + (s.totalAmount || 0), 0);

  return (
    <SafeAreaView style={S.safe}>
      <View style={S.pageHeader}>
        <Text style={S.pageTitle}>My Subscriptions</Text>
        {subs.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={S.statBadge}>
              <Text style={S.statNum}>{activeCount}</Text>
              <Text style={S.statLbl}>Active</Text>
            </View>
            <View style={[S.statBadge, { backgroundColor: C.secondaryMuted }]}>
              <Text style={[S.statNum, { color: C.secondary }]}>₹{totalSpent.toLocaleString('en-IN')}</Text>
              <Text style={S.statLbl}>Total Spent</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSubs(); }} tintColor={C.primary} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {!isAuthenticated ? (
          <View style={S.empty}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>🔒</Text>
            <Text style={S.emptyTitle}>Sign in required</Text>
            <Text style={S.emptySub}>Sign in to view and manage your active tiffin subscriptions</Text>
            <TouchableOpacity style={S.actionBtn} onPress={() => nav.navigate('Login')}>
              <Text style={S.actionBtnTxt}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <ActivityIndicator color={C.primary} size="large" style={{ marginTop: 60 }} />
        ) : subs.length === 0 ? (
          <View style={S.empty}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>🍽️</Text>
            <Text style={S.emptyTitle}>No subscriptions yet</Text>
            <Text style={S.emptySub}>Subscribe to daily tiffin plans from local kitchen partners</Text>
            <TouchableOpacity style={S.actionBtn} onPress={() => (nav as any).navigate('Home')}>
              <Text style={S.actionBtnTxt}>Explore Meals</Text>
            </TouchableOpacity>
          </View>
        ) : (
          subs.map((sub, i) => (
            <SubCard key={sub._id} sub={sub} index={i} C={C}
              onPause={async () => { try { await api.patch(`/subscriptions/${sub._id}/pause`); fetchSubs(); } catch { } }}
              onResume={async () => { try { await api.patch(`/subscriptions/${sub._id}/resume`); fetchSubs(); } catch { } }}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  pageHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.borderLight },
  pageTitle: { fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 12 },
  statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primaryMuted, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  statNum: { fontSize: 14, fontWeight: '800', color: C.primary },
  statLbl: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },
  card: { backgroundColor: C.surfaceCard, borderRadius: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  mealName: { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
  partnerName: { fontSize: 12, color: C.textSecondary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  statusTxt: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  progressWrap: { marginBottom: 14 },
  progressBg: { height: 5, backgroundColor: C.surface, borderRadius: 100, marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 100 },
  progressTxt: { fontSize: 11, color: C.textTertiary },
  detailGrid: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 14 },
  detailItem: { flex: 1, alignItems: 'center' },
  detailDivider: { width: 1, backgroundColor: C.border },
  detailLabel: { fontSize: 10, color: C.textTertiary, marginTop: 4, marginBottom: 2 },
  detailValue: { fontSize: 12, fontWeight: '700', color: C.textPrimary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.divider, paddingTop: 12 },
  priceLabel: { fontSize: 12, color: C.textSecondary },
  priceValue: { fontSize: 18, fontWeight: '800', color: C.primary },
  pauseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  pauseTxt: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
  resumeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: C.successBg, borderWidth: 1, borderColor: C.success + '40' },
  resumeTxt: { fontSize: 13, fontWeight: '600', color: C.veg },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 20 },
  actionBtn: { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  actionBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
