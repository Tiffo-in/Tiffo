import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '../../services/api';

interface Delivery {
  _id: string;
  status: 'scheduled' | 'preparing' | 'out_for_delivery' | 'delivered' | 'failed';
  deliveryDate: string;
  deliveryTime: string;
  subscription?: {
    deliveryAddress?: string;
    user?: { name?: string; phone?: string };
    tiffin?: { name?: string };
  };
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; nextAction?: string; nextStatus?: string }
> = {
  scheduled: {
    label: 'Scheduled',
    color: '#3B82F6',
    bg: '#1E3A5F',
    nextAction: 'Start Preparing',
    nextStatus: 'preparing',
  },
  preparing: {
    label: 'Preparing',
    color: '#F59E0B',
    bg: '#451A03',
    nextAction: 'Out for Delivery',
    nextStatus: 'out_for_delivery',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: '#8B5CF6',
    bg: '#2E1065',
    nextAction: 'Mark Delivered',
    nextStatus: 'delivered',
  },
  delivered: {
    label: 'Delivered',
    color: '#10B981',
    bg: '#064E3B',
    nextAction: undefined,
    nextStatus: undefined,
  },
  failed: {
    label: 'Failed',
    color: '#EF4444',
    bg: '#450A0A',
    nextAction: undefined,
    nextStatus: undefined,
  },
};

const OrdersScreen = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(`/deliveries?date=${today}&limit=50`);
      setDeliveries(res.data?.data || []);
    } catch {
      setDeliveries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const updateStatus = async (deliveryId: string, newStatus: string) => {
    setUpdating(deliveryId);
    try {
      await api.patch(`/deliveries/${deliveryId}/status`, { status: newStatus });
      setDeliveries((prev) =>
        prev.map((d) =>
          d._id === deliveryId ? { ...d, status: newStatus as Delivery['status'] } : d,
        ),
      );
    } catch (err: any) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Could not update status.');
    } finally {
      setUpdating(null);
    }
  };

  const renderItem = ({ item }: { item: Delivery }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.scheduled;
    const isUpdating = updating === item._id;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.customerName} numberOfLines={1}>
            {item.subscription?.user?.name || 'Customer'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <Text style={styles.tiffinName}>{item.subscription?.tiffin?.name || 'Tiffin Meal'}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={13} color="#64748B" />
          <Text style={styles.infoText} numberOfLines={2}>
            {item.subscription?.deliveryAddress || 'Address not available'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={13} color="#64748B" />
          <Text style={styles.infoText}>{item.deliveryTime || '—'}</Text>
          {item.subscription?.user?.phone && (
            <>
              <Ionicons name="call-outline" size={13} color="#64748B" style={{ marginLeft: 12 }} />
              <Text style={styles.infoText}>{item.subscription.user.phone}</Text>
            </>
          )}
        </View>

        {cfg.nextAction && (
          <TouchableOpacity
            style={[styles.actionBtn, isUpdating && styles.actionBtnDisabled]}
            onPress={() => cfg.nextStatus && updateStatus(item._id, cfg.nextStatus)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#0F172A" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>{cfg.nextAction} →</Text>
            )}
          </TouchableOpacity>
        )}

        {item.status === 'delivered' && (
          <View style={styles.doneRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.doneText}>Delivery completed</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Today's Orders</Text>
        <Text style={styles.pageSubtitle}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#F59E0B" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchDeliveries();
              }}
              tintColor="#F59E0B"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>No deliveries scheduled for today</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  pageHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#F8FAFC' },
  pageSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  customerName: { flex: 1, fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginRight: 10 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  tiffinName: { fontSize: 13, color: '#94A3B8', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { fontSize: 12, color: '#64748B', marginLeft: 6, flex: 1 },
  actionBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  actionBtnDisabled: { backgroundColor: '#78350F' },
  actionBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  doneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  doneText: { color: '#10B981', fontSize: 13, fontWeight: '600', marginLeft: 6 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#64748B' },
});

export default OrdersScreen;
