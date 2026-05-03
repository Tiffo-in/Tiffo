import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface EarningsSummary {
  totalEarnings: number;
  pendingPayouts: number;
  lastPayout?: { amount: number; date: string };
  thisMonth: number;
  lastMonth: number;
}

interface Payout {
  _id: string;
  amount: number;
  status: 'paid' | 'pending' | 'processing';
  createdAt: string;
}

const EarningsScreen = () => {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const [summaryRes, payoutsRes] = await Promise.all([
        api.get('/partner/earnings'),
        api.get('/partner/payouts'),
      ]);
      setSummary(summaryRes.data?.data || summaryRes.data);
      setPayouts(payoutsRes.data?.data || []);
    } catch {
      setSummary({ totalEarnings: 0, pendingPayouts: 0, thisMonth: 0, lastMonth: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const payoutStatus: Record<string, { label: string; color: string }> = {
    paid: { label: 'Paid', color: '#10B981' },
    pending: { label: 'Pending', color: '#F59E0B' },
    processing: { label: 'Processing', color: '#3B82F6' },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor="#F59E0B" />}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Earnings</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#F59E0B" size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Big revenue card */}
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>Total Earnings</Text>
              <Text style={styles.revenueValue}>
                ₹{(summary?.totalEarnings ?? 0).toLocaleString('en-IN')}
              </Text>
              {summary?.pendingPayouts !== undefined && summary.pendingPayouts > 0 && (
                <View style={styles.pendingRow}>
                  <Ionicons name="time-outline" size={14} color="#F59E0B" />
                  <Text style={styles.pendingText}>
                    ₹{summary.pendingPayouts.toLocaleString('en-IN')} pending payout
                  </Text>
                </View>
              )}
            </View>

            {/* Month comparison */}
            <View style={styles.monthsRow}>
              <View style={styles.monthCard}>
                <Text style={styles.monthLabel}>This Month</Text>
                <Text style={styles.monthValue}>₹{(summary?.thisMonth ?? 0).toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.monthCard}>
                <Text style={styles.monthLabel}>Last Month</Text>
                <Text style={styles.monthValue}>₹{(summary?.lastMonth ?? 0).toLocaleString('en-IN')}</Text>
              </View>
            </View>

            {/* Payout history */}
            <Text style={styles.sectionTitle}>Payout History</Text>
            {payouts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>💳</Text>
                <Text style={styles.emptyText}>No payouts yet</Text>
              </View>
            ) : (
              payouts.map((payout) => {
                const cfg = payoutStatus[payout.status] || payoutStatus.pending;
                return (
                  <View key={payout._id} style={styles.payoutRow}>
                    <View style={styles.payoutLeft}>
                      <Ionicons name="cash-outline" size={18} color="#F59E0B" />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.payoutAmount}>₹{payout.amount.toLocaleString('en-IN')}</Text>
                        <Text style={styles.payoutDate}>
                          {new Date(payout.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.color + '20' }]}>
                      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flex: 1 },
  pageHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#F8FAFC' },
  revenueCard: {
    margin: 16, borderRadius: 20, padding: 24,
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#F59E0B40',
    alignItems: 'center',
  },
  revenueLabel: { fontSize: 14, color: '#94A3B8', marginBottom: 8 },
  revenueValue: { fontSize: 40, fontWeight: '800', color: '#F59E0B' },
  pendingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  pendingText: { color: '#F59E0B', fontSize: 13, marginLeft: 6 },
  monthsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 24 },
  monthCard: {
    flex: 1, backgroundColor: '#1E293B', borderRadius: 16, padding: 16,
    marginHorizontal: 4, borderWidth: 1, borderColor: '#334155',
  },
  monthLabel: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  monthValue: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#CBD5E1', paddingHorizontal: 20, marginBottom: 12 },
  payoutRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1E293B', marginHorizontal: 16, marginBottom: 10,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#334155',
  },
  payoutLeft: { flexDirection: 'row', alignItems: 'center' },
  payoutAmount: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginBottom: 2 },
  payoutDate: { fontSize: 12, color: '#64748B' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 11, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#64748B' },
});

export default EarningsScreen;
