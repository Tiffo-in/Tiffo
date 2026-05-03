import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../navigation/RootNavigator';

interface Subscription {
  _id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  tiffin?: { name: string };
  partner?: { businessName: string };
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: '#DCFCE7', text: '#166534' },
  paused: { bg: '#FEF9C3', text: '#854D0E' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  expired: { bg: '#F3F4F6', text: '#6B7280' },
  pending: { bg: '#DBEAFE', text: '#1E40AF' },
};

const SubscriptionScreen = () => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubs = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/subscriptions/my');
      setSubs(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSubs(); }, [isAuthenticated]);

  const handlePause = async (id: string) => {
    try {
      await api.patch(`/subscriptions/${id}/pause`);
      fetchSubs();
    } catch (err: any) {
      console.error('Pause failed', err.response?.data?.message);
    }
  };

  const handleResume = async (id: string) => {
    try {
      await api.patch(`/subscriptions/${id}/resume`);
      fetchSubs();
    } catch (err: any) {
      console.error('Resume failed', err.response?.data?.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>My Subscriptions</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSubs(); }} tintColor="#F97316" />}
      >
        {!isAuthenticated ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔒</Text>
            <Text style={styles.emptyTitle}>Sign in to view subscriptions</Text>
            <Text style={styles.emptyText}>You need to be logged in to view your active meal plans.</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <ActivityIndicator color="#F97316" size="large" style={{ marginTop: 40 }} />
        ) : subs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No Active Subscriptions</Text>
            <Text style={styles.emptyText}>Go to the Home tab to find and subscribe to a tiffin plan.</Text>
          </View>
        ) : (
          subs.map((sub) => {
            const colors = STATUS_COLORS[sub.status] || STATUS_COLORS.pending;
            const endDate = new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
              <View key={sub._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.mealName} numberOfLines={1}>{sub.tiffin?.name || 'Tiffin Meal'}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>{sub.status.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={styles.partnerText}>by {sub.partner?.businessName || 'Partner Kitchen'}</Text>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={13} color="#78716C" />
                    <Text style={styles.detailText}>{sub.plan} plan</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={13} color="#78716C" />
                    <Text style={styles.detailText}>Ends {endDate}</Text>
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Total charged</Text>
                  <Text style={styles.priceValue}>₹{sub.totalAmount?.toLocaleString('en-IN')}</Text>
                </View>

                {/* Actions */}
                {sub.status === 'active' && (
                  <TouchableOpacity style={styles.pauseBtn} onPress={() => handlePause(sub._id)}>
                    <Ionicons name="pause-circle-outline" size={16} color="#78716C" />
                    <Text style={styles.pauseBtnText}>Pause Subscription</Text>
                  </TouchableOpacity>
                )}
                {sub.status === 'paused' && (
                  <TouchableOpacity style={styles.resumeBtn} onPress={() => handleResume(sub._id)}>
                    <Ionicons name="play-circle-outline" size={16} color="#166534" />
                    <Text style={styles.resumeBtnText}>Resume Subscription</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAF9' },
  pageHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1C1917' },
  scroll: { flex: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1917', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#78716C', textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: '#FFF', borderRadius: 20, marginHorizontal: 16, marginBottom: 16, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  mealName: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1C1917', marginRight: 12 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  partnerText: { fontSize: 12, color: '#78716C', marginBottom: 12 },
  detailRow: { flexDirection: 'row', marginBottom: 14 },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  detailText: { fontSize: 12, color: '#78716C' },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 2,
  },
  priceLabel: { fontSize: 12, color: '#78716C' },
  priceValue: { fontSize: 17, fontWeight: '800', color: '#F97316' },
  pauseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginRight: 6, marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
  },
  pauseBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  resumeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginRight: 6, marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0',
  },
  resumeBtnText: { fontSize: 13, fontWeight: '600', color: '#166534' },
  loginBtn: {
    backgroundColor: '#F97316', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
    marginTop: 20, shadowColor: '#F97316', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  loginBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

export default SubscriptionScreen;
