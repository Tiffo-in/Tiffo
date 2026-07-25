import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '../../services/api';
import { captureError } from '../../services/observability';
import { Colors } from '../../theme/colors';
import {
  AnalyticsSummary,
  barFraction,
  chartMax,
  dayLabel,
  isEmptyDataset,
  normalizeSummary,
} from '../../utils/analytics';

const CHART_HEIGHT = 140;

const StatCard = ({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: keyof typeof Ionicons.glyphMap;
}) => (
  <View style={styles.statCard} accessible accessibilityLabel={`${label}: ${value}`}>
    <Ionicons name={icon} size={18} color={Colors.primary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {!!sub && <Text style={styles.statSub}>{sub}</Text>}
  </View>
);

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get('/partner/analytics');
      setData(normalizeSummary(res.data?.data));
    } catch (err: any) {
      captureError(err, { screen: 'Analytics' });
      setError(err.response?.data?.message || 'Could not load analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const max = chartMax(data?.chartData ?? []);
  const empty = !!data && isEmptyDataset(data.chartData);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={40} color="#64748B" />
          <Text style={styles.emptyTitle}>Could not load analytics</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={styles.statRow}>
            <StatCard
              label="Listing Visits"
              value={data?.totalVisits ?? 0}
              sub={`${data?.todayVisits ?? 0} today`}
              icon="eye-outline"
            />
            <StatCard
              label="Subscriptions"
              value={data?.totalSubscriptions ?? 0}
              sub={`${data?.todaySubscriptions ?? 0} today`}
              icon="people-outline"
            />
          </View>

          {/* Conversion */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Conversion Rate</Text>
            <Text style={styles.cardSubtitle}>
              Share of listing visits that became paid subscriptions.
            </Text>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionValue}>{data?.conversionRate ?? 0}%</Text>
              <View style={styles.conversionTrack}>
                <View
                  style={[
                    styles.conversionFill,
                    { width: `${Math.min(100, data?.conversionRate ?? 0)}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* 7-day chart */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Last 7 Days</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: '#334155' }]} />
                <Text style={styles.legendText}>Visits</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: Colors.primary }]} />
                <Text style={styles.legendText}>Subscriptions</Text>
              </View>
            </View>

            {empty ? (
              <View style={styles.chartEmpty}>
                <Ionicons name="bar-chart-outline" size={32} color="#64748B" />
                <Text style={styles.emptyText}>
                  No visits or subscriptions recorded in the last 7 days yet.
                </Text>
              </View>
            ) : (
              <View style={styles.chart}>
                {(data?.chartData ?? []).map((point) => (
                  <View key={point.date} style={styles.chartColumn}>
                    <View style={styles.barGroup}>
                      <View
                        style={[
                          styles.bar,
                          styles.barVisits,
                          { height: barFraction(point.visits, max) * CHART_HEIGHT },
                        ]}
                        accessible
                        accessibilityLabel={`${dayLabel(point.date)}: ${point.visits} visits`}
                      />
                      <View
                        style={[
                          styles.bar,
                          styles.barSubs,
                          { height: barFraction(point.subscriptions, max) * CHART_HEIGHT },
                        ]}
                        accessible
                        accessibilityLabel={`${dayLabel(point.date)}: ${point.subscriptions} subscriptions`}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{dayLabel(point.date)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Accessible tabular fallback — charts alone are not readable by
                screen readers, and the raw numbers are often what partners want. */}
            {!empty && (
              <View style={styles.table}>
                {(data?.chartData ?? []).map((point) => (
                  <View key={`row-${point.date}`} style={styles.tableRow}>
                    <Text style={styles.tableDay}>{dayLabel(point.date)}</Text>
                    <Text style={styles.tableCell}>{point.visits} visits</Text>
                    <Text style={[styles.tableCell, styles.tableCellAccent]}>
                      {point.subscriptions} subs
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '700' },
  centered: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyText: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 6 },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  retryText: { color: Colors.primary, fontWeight: '700' },
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: { color: '#F8FAFC', fontSize: 24, fontWeight: '800', marginTop: 8 },
  statLabel: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  statSub: { color: Colors.primary, fontSize: 11, fontWeight: '600', marginTop: 4 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  cardSubtitle: { color: '#64748B', fontSize: 12, marginTop: 4 },
  conversionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  conversionValue: { color: Colors.primary, fontSize: 28, fontWeight: '800' },
  conversionTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  conversionFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 5 },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 10, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { color: '#94A3B8', fontSize: 11 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_HEIGHT + 24,
  },
  chartColumn: { flex: 1, alignItems: 'center' },
  barGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: CHART_HEIGHT },
  bar: { width: 9, borderTopLeftRadius: 3, borderTopRightRadius: 3, minHeight: 2 },
  barVisits: { backgroundColor: '#334155' },
  barSubs: { backgroundColor: Colors.primary },
  chartLabel: { color: '#64748B', fontSize: 10, marginTop: 6 },
  chartEmpty: { alignItems: 'center', paddingVertical: 32 },
  table: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10 },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  tableDay: { color: '#94A3B8', fontSize: 12, width: 44 },
  tableCell: { color: '#94A3B8', fontSize: 12 },
  tableCellAccent: { color: Colors.primary, fontWeight: '600' },
});

export default AnalyticsScreen;
