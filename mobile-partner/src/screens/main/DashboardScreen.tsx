import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { DashboardStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';
import { exportOrdersCsv } from '../../services/exportService';
import { Stats, ApiResponse } from '../../types';

const DashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<DashboardStackParams>>();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const result = await exportOrdersCsv();
    setExporting(false);
    // A successful export hands off to the OS share sheet — no alert needed.
    if (!result.ok) {
      Alert.alert(
        result.reason === 'empty' ? 'Nothing to export' : 'Export failed',
        result.message,
      );
    }
  };

  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<Stats>({
    queryKey: ['partner', 'stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Stats>>('/partner/stats');
      return res.data?.data || (res.data as unknown as Stats);
    },
  });

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard = ({
    icon,
    label,
    value,
    color,
    sub,
  }: {
    icon: any;
    label: string;
    value: string | number;
    color: string;
    sub?: string;
  }) => (
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
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF7A00" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
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

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Analytics')}
            accessibilityRole="button"
            accessibilityLabel="Open business analytics"
          >
            <Ionicons name="bar-chart-outline" size={20} color="#FF7A00" />
            <Text style={styles.quickActionText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('AdManager')}
            accessibilityRole="button"
            accessibilityLabel="Open ad manager"
          >
            <Ionicons name="megaphone-outline" size={20} color="#FF7A00" />
            <Text style={styles.quickActionText}>Ads</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleExport}
            disabled={exporting}
            accessibilityRole="button"
            accessibilityLabel="Export orders as CSV"
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#FF7A00" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#FF7A00" />
            )}
            <Text style={styles.quickActionText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {isLoading ? (
          <ActivityIndicator color="#FF7A00" size="large" style={{ marginTop: 40 }} />
        ) : isError ? (
          <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 20 }}>
            <Ionicons name="warning-outline" size={48} color="#EF4444" />
            <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginTop: 12 }}>
              Failed to load stats
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
              {(error as any)?.message || 'There was a problem reaching our servers.'}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={{
                marginTop: 16,
                backgroundColor: '#FF7A00',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#0F172A', fontWeight: '700' }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.statsGrid}>
              <StatCard
                icon="people-outline"
                label="Active Subs"
                value={stats?.activeSubscriptions ?? 0}
                color="#3B82F6"
              />
              <StatCard
                icon="bicycle-outline"
                label="Deliveries"
                value={stats?.todayDeliveries ?? 0}
                color="#FF7A00"
                sub="due today"
              />
              <StatCard
                icon="checkmark-circle-outline"
                label="Completed"
                value={stats?.completedToday ?? 0}
                color="#10B981"
                sub="today"
              />
              <StatCard
                icon="wallet-outline"
                label="Revenue"
                value={`₹${(stats?.monthlyRevenue ?? 0).toLocaleString('en-IN')}`}
                color="#8B5CF6"
                sub="this month"
              />
            </View>

            {stats?.pendingPayouts !== undefined && stats.pendingPayouts > 0 && (
              <View style={styles.payoutAlert}>
                <Ionicons name="alert-circle-outline" size={18} color="#FF7A00" />
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
              <Ionicons name={action.icon as any} size={24} color="#FF7A00" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: { fontSize: 14, color: '#94A3B8' },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 44,
  },
  quickActionText: { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
  partnerName: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', marginTop: 2 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF7A00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#065F46',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  statusText: { color: '#6EE7B7', fontWeight: '600', fontSize: 13 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CBD5E1',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '46%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    margin: '2%',
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  statSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  payoutAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451A03',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#78350F',
  },
  payoutAlertText: { color: '#FCD34D', fontSize: 13, marginLeft: 8, fontWeight: '500' },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;
