import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Stats {
  activeSubscriptions: number;
  todayDeliveries: number;
  completedToday: number;
  monthlyRevenue: number;
  pendingPayouts: number;
}

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/partner/stats');
      setStats(res.data?.data || res.data);
    } catch {
      // Show zeros if the endpoint isn't available yet
      setStats({ activeSubscriptions: 0, todayDeliveries: 0, completedToday: 0, monthlyRevenue: 0, pendingPayouts: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard = ({ icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor="#F59E0B" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👨‍🍳</Text>
            <Text style={styles.partnerName}>{user?.name}</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Status banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Kitchen is Active</Text>
        </View>

        {/* Stats */}
        {loading ? (
          <ActivityIndicator color="#F59E0B" size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.statsGrid}>
              <StatCard icon="people-outline" label="Active Subs" value={stats?.activeSubscriptions ?? 0} color="#3B82F6" />
              <StatCard icon="bicycle-outline" label="Deliveries" value={stats?.todayDeliveries ?? 0} color="#F59E0B" sub="due today" />
              <StatCard icon="checkmark-circle-outline" label="Completed" value={stats?.completedToday ?? 0} color="#10B981" sub="today" />
              <StatCard icon="wallet-outline" label="Revenue" value={`₹${(stats?.monthlyRevenue ?? 0).toLocaleString('en-IN')}`} color="#8B5CF6" sub="this month" />
            </View>

            {stats?.pendingPayouts !== undefined && stats.pendingPayouts > 0 && (
              <View style={styles.payoutAlert}>
                <Ionicons name="alert-circle-outline" size={18} color="#F59E0B" />
                <Text style={styles.payoutAlertText}>
                  ₹{stats.pendingPayouts.toLocaleString('en-IN')} payout pending from Tiffo
                </Text>
              </View>
            )}
          </>
        )}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {[
            { icon: 'list-outline', label: "Today's Orders" },
            { icon: 'restaurant-outline', label: 'My Menu' },
            { icon: 'cash-outline', label: 'Earnings' },
          ].map((action) => (
            <TouchableOpacity key={action.label} style={styles.actionCard}>
              <Ionicons name={action.icon as any} size={24} color="#F59E0B" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  greeting: { fontSize: 14, color: '#94A3B8' },
  partnerName: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', marginTop: 2 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F59E0B',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#064E3B',
    marginHorizontal: 16, borderRadius: 12, padding: 12, marginBottom: 20,
    borderWidth: 1, borderColor: '#065F46',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  statusText: { color: '#6EE7B7', fontWeight: '600', fontSize: 13 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: '#CBD5E1',
    paddingHorizontal: 20, marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, marginBottom: 20,
  },
  statCard: {
    width: '46%', backgroundColor: '#1E293B', borderRadius: 16,
    padding: 16, margin: '2%', borderTopWidth: 3,
    borderWidth: 1, borderColor: '#334155',
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  statSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  payoutAlert: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#451A03',
    marginHorizontal: 16, borderRadius: 12, padding: 12, marginBottom: 20,
    borderWidth: 1, borderColor: '#78350F',
  },
  payoutAlertText: { color: '#FCD34D', fontSize: 13, marginLeft: 8, fontWeight: '500' },
  actionsRow: {
    flexDirection: 'row', paddingHorizontal: 16, marginBottom: 30,
  },
  actionCard: {
    flex: 1, backgroundColor: '#1E293B', borderRadius: 14, padding: 16,
    alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#334155',
  },
  actionLabel: { color: '#CBD5E1', fontSize: 11, fontWeight: '600', marginTop: 8, textAlign: 'center' },
});

export default DashboardScreen;
