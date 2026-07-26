import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

const PAGE_SIZE = 20;

type TxnType = 'payment' | 'transfer' | 'refund' | 'reversal';
type TxnStatus = 'pending' | 'success' | 'failed';

interface Transaction {
  _id: string;
  type: TxnType;
  status: TxnStatus;
  amount: number;
  currency?: string;
  orderId?: string;
  paymentId?: string;
  refundId?: string;
  errorDescription?: string;
  createdAt: string;
  processedAt?: string;
  subscriptionId?: { plan?: string; startDate?: string; endDate?: string } | null;
  partnerId?: { name?: string } | null;
}

interface SummaryStats {
  totalSpent: number;
  totalTransactions: number;
}

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

const titleFor = (t: Transaction) => {
  if (t.type === 'refund' || t.type === 'reversal') return 'Refund';
  const plan = t.subscriptionId?.plan;
  return plan ? `${plan.charAt(0).toUpperCase()}${plan.slice(1)} plan` : 'Subscription payment';
};

const statusMeta = (t: Transaction, C: ColorScheme) => {
  const credit = t.type === 'refund' || t.type === 'reversal';
  if (t.status === 'success') {
    return credit
      ? { label: 'Refunded', color: C.info, bg: C.infoBg, icon: 'arrow-undo' as const }
      : { label: 'Paid', color: C.success, bg: C.successBg, icon: 'checkmark-circle' as const };
  }
  if (t.status === 'failed') {
    return { label: 'Failed', color: C.error, bg: C.errorBg, icon: 'close-circle' as const };
  }
  return { label: 'Pending', color: C.warning, bg: C.warningBg, icon: 'time' as const };
};

export default function PaymentHistoryScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { isAuthenticated } = useAuth();

  const [txns, setTxns] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);

  const fetchPage = useCallback(async (targetPage: number) => {
    const res = await api.get('/payments/history', {
      params: { page: targetPage, limit: PAGE_SIZE },
    });
    return {
      payments: (res.data?.payments || []) as Transaction[],
      summaryStats: res.data?.summaryStats as SummaryStats | undefined,
      pages: res.data?.pagination?.pages ?? 1,
    };
  }, []);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchPage(1);
      setTxns(data.payments);
      if (data.summaryStats) setStats(data.summaryStats);
      setPages(data.pages);
      setPage(1);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchPage, isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const loadMore = async () => {
    if (loadingMore || loading || page >= pages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await fetchPage(next);
      // Guard against duplicates if a new payment lands while paginating.
      setTxns((prev) => {
        const seen = new Set(prev.map((t) => t._id));
        return [...prev, ...data.payments.filter((t) => !seen.has(t._id))];
      });
      setPage(next);
      setPages(data.pages);
    } catch {
      // Keep what we already have; pull-to-refresh recovers.
    } finally {
      setLoadingMore(false);
    }
  };

  const header = (
    <View>
      <View style={S.headerTextContainer}>
        <Text style={S.title}>Payment History</Text>
        <Text style={S.subtitle}>Every transaction on your Tiffo subscriptions</Text>
      </View>

      {stats && txns.length > 0 && (
        <View style={S.statsCard}>
          <View style={S.statItem}>
            <Text style={S.statValue}>{rupees(stats.totalSpent)}</Text>
            <Text style={S.statLabel}>Total spent</Text>
          </View>
          <View style={S.statDivider} />
          <View style={S.statItem}>
            <Text style={S.statValue}>{stats.totalTransactions}</Text>
            <Text style={S.statLabel}>
              {stats.totalTransactions === 1 ? 'Payment' : 'Payments'}
            </Text>
          </View>
        </View>
      )}

      {txns.length > 0 && <Text style={S.sectionTitle}>TRANSACTIONS</Text>}
    </View>
  );

  const renderItem = ({ item }: { item: Transaction }) => {
    const meta = statusMeta(item, C);
    const credit = item.type === 'refund' || item.type === 'reversal';
    const stamp = item.processedAt || item.createdAt;

    return (
      <View style={S.txnRow}>
        <View style={[S.txnIcon, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={18} color={meta.color} />
        </View>

        <View style={S.txnBody}>
          <Text style={S.txnTitle} numberOfLines={1}>
            {titleFor(item)}
          </Text>
          <Text style={S.txnMeta} numberOfLines={1}>
            {formatDate(stamp)} · {formatTime(stamp)}
          </Text>
          {item.partnerId?.name && (
            <Text style={S.txnMeta} numberOfLines={1}>
              {item.partnerId.name}
            </Text>
          )}
          {item.status === 'failed' && item.errorDescription && (
            <Text style={S.txnError} numberOfLines={2}>
              {item.errorDescription}
            </Text>
          )}
        </View>

        <View style={S.txnRight}>
          <Text style={[S.txnAmount, credit && { color: C.info }]}>
            {credit ? '+' : ''}
            {rupees(item.amount)}
          </Text>
          <View style={[S.badge, { backgroundColor: meta.bg }]}>
            <Text style={[S.badgeTxt, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
      </View>
    );
  };

  const empty = () => {
    if (!isAuthenticated) {
      return (
        <View style={S.emptyCard}>
          <Ionicons name="lock-closed-outline" size={32} color={C.textTertiary} />
          <Text style={S.emptyText}>Sign in to view your payments</Text>
        </View>
      );
    }
    if (failed) {
      return (
        <View style={S.emptyCard}>
          <Ionicons name="cloud-offline-outline" size={32} color={C.textTertiary} />
          <Text style={S.emptyText}>Couldn&apos;t load your payments</Text>
          <Text style={S.emptyHint}>Pull down to try again.</Text>
        </View>
      );
    }
    return (
      <View style={S.emptyCard}>
        <Ionicons name="receipt-outline" size={32} color={C.textTertiary} />
        <Text style={S.emptyText}>No payments yet</Text>
        <Text style={S.emptyHint}>Your subscription payments will appear here.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={S.safe} edges={['bottom']}>
      {loading ? (
        <ActivityIndicator color={C.primary} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={txns}
          keyExtractor={(t) => t._id}
          renderItem={renderItem}
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          contentContainerStyle={S.scroll}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary}
              colors={[C.primary]}
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={C.primary} style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.background },
    scroll: { padding: 20, paddingBottom: 40 },
    headerTextContainer: { marginBottom: 20 },
    title: { fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
    subtitle: { fontSize: 13, color: C.textSecondary },

    statsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surfaceCard,
      borderRadius: 18,
      paddingVertical: 18,
      marginBottom: 24,
      shadowColor: C.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 2 },
    statLabel: { fontSize: 11, color: C.textTertiary, fontWeight: '600' },
    statDivider: { width: 1, height: 32, backgroundColor: C.divider },

    sectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: C.textSecondary,
      letterSpacing: 1,
      marginBottom: 12,
    },

    txnRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: C.surfaceCard,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },
    txnIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    txnBody: { flex: 1 },
    txnTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
    txnMeta: { fontSize: 12, color: C.textTertiary, marginTop: 1 },
    txnError: { fontSize: 12, color: C.error, marginTop: 4, lineHeight: 16 },
    txnRight: { alignItems: 'flex-end', marginLeft: 10, gap: 6 },
    txnAmount: { fontSize: 15, fontWeight: '800', color: C.textPrimary },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    badgeTxt: { fontSize: 11, fontWeight: '700' },

    emptyCard: {
      backgroundColor: C.surfaceCard,
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.border,
      borderStyle: 'dashed',
    },
    emptyText: { fontSize: 14, color: C.textSecondary, marginTop: 10, fontWeight: '700' },
    emptyHint: { fontSize: 12, color: C.textTertiary, marginTop: 4, textAlign: 'center' },
  });
