import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface Tiffin {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isVeg?: boolean;
  isActive: boolean;
}

const MenuScreen = () => {
  const [tiffins, setTiffins] = useState<Tiffin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/partner/tiffins');
      setTiffins(res.data?.data || []);
    } catch {
      setTiffins([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  const toggleActive = async (tiffinId: string, currentValue: boolean) => {
    setToggling(tiffinId);
    try {
      await api.patch(`/tiffins/${tiffinId}`, { isActive: !currentValue });
      setTiffins((prev) =>
        prev.map((t) => t._id === tiffinId ? { ...t, isActive: !currentValue } : t)
      );
    } catch (err: any) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Could not update tiffin.');
    } finally {
      setToggling(null);
    }
  };

  const renderItem = ({ item }: { item: Tiffin }) => (
    <View style={[styles.card, !item.isActive && styles.cardInactive]}>
      <View style={styles.cardLeft}>
        <View style={styles.iconArea}>
          <Text style={{ fontSize: 28 }}>{item.isVeg ? '🥦' : '🍗'}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, !item.isActive && styles.cardNameInactive]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <Text style={styles.cardPrice}>₹{item.price}/day</Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        {toggling === item._id ? (
          <ActivityIndicator color="#F59E0B" size="small" />
        ) : (
          <Switch
            value={item.isActive}
            onValueChange={() => toggleActive(item._id, item.isActive)}
            trackColor={{ false: '#334155', true: '#065F46' }}
            thumbColor={item.isActive ? '#10B981' : '#94A3B8'}
          />
        )}
        <Text style={[styles.toggleLabel, { color: item.isActive ? '#10B981' : '#64748B' }]}>
          {item.isActive ? 'Active' : 'Paused'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>My Menu</Text>
        <Text style={styles.pageSubtitle}>{tiffins.filter((t) => t.isActive).length} of {tiffins.length} items active</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#F59E0B" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tiffins}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMenu(); }} tintColor="#F59E0B" />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyTitle}>No tiffins found</Text>
              <Text style={styles.emptyText}>Add tiffin plans from the Tiffo web dashboard.</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1E293B', borderRadius: 16, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#334155',
  },
  cardInactive: { opacity: 0.55 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconArea: {
    width: 56, height: 56, borderRadius: 12, backgroundColor: '#0F172A',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#F8FAFC', marginBottom: 2 },
  cardNameInactive: { color: '#64748B' },
  cardCategory: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#F59E0B' },
  cardRight: { alignItems: 'center', marginLeft: 12 },
  toggleLabel: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
});

export default MenuScreen;
