import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../navigation/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Tiffin {
  _id: string;
  name: string;
  description?: string;
  price: any;
  category: string;
  images?: string[];
  rating?: { average: number; count: number };
  reviews?: number;
  isVeg?: boolean;
  partner?: { businessName: string };
}

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [tiffins, setTiffins] = useState<Tiffin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTiffins = async () => {
    try {
      const res = await api.get('/tiffins?limit=10&status=active');
      setTiffins(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch tiffins:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTiffins(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTiffins();
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subheading}>What would you like to eat today?</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🍱 Fresh & Homemade</Text>
          <Text style={styles.bannerSub}>Subscribe to daily tiffin plans from local kitchen partners.</Text>
        </View>

        {/* Tiffin List */}
        <Text style={styles.sectionTitle}>Available Meals</Text>

        {loading ? (
          <ActivityIndicator color="#F97316" size="large" style={{ marginTop: 40 }} />
        ) : tiffins.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyText}>No meals available right now</Text>
          </View>
        ) : (
          tiffins.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.tiffinCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('TiffinDetail', { tiffinId: item._id })}
            >
                <Image 
                  source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' }} 
                  style={styles.cardImage} 
                />
                
                {/* Floating Veg/Non-Veg Badge */}
                {item.isVeg && (
                  <View style={styles.floatingBadge}>
                    <View style={styles.vegDot} />
                    <Text style={styles.vegBadgeText}>PURE VEG</Text>
                  </View>
                )}

              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.ratingPill}>
                    <Text style={{ fontSize: 12 }}>⭐</Text>
                    <Text style={styles.ratingText}>{item.rating?.average || '4.5'}</Text>
                  </View>
                </View>
                
                <Text style={styles.categoryText}>{item.category} • by {item.partner?.businessName || 'Partner Kitchen'}</Text>
                
                {item.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                )}
                
                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardPriceLabel}>Starts at</Text>
                    <Text style={styles.cardPrice}>
                      ₹{typeof item.price === 'object' ? (item.price as any).daily : item.price}
                      <Text style={styles.perDay}> / day</Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => navigation.navigate('TiffinDetail', { tiffinId: item._id })}
                  >
                    <Text style={styles.viewBtnText}>View Menu</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAF9' },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: '#1C1917' },
  subheading: { fontSize: 13, color: '#78716C', marginTop: 2 },
  avatarCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  banner: {
    margin: 16, borderRadius: 20, backgroundColor: '#FFF7ED',
    padding: 20, borderWidth: 1, borderColor: '#FED7AA',
  },
  bannerTitle: { fontSize: 17, fontWeight: '700', color: '#9A3412' },
  bannerSub: { fontSize: 13, color: '#C2410C', marginTop: 6, lineHeight: 18 },
  sectionTitle: {
    fontSize: 17, fontWeight: '700', color: '#1C1917',
    paddingHorizontal: 20, marginBottom: 12,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#78716C' },
  tiffinCard: {
    backgroundColor: '#FFF', borderRadius: 24, marginHorizontal: 20,
    marginBottom: 24, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  cardImage: {
    width: '100%', height: 180, backgroundColor: '#F3F4F6',
  },
  floatingBadge: {
    position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  vegDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A', marginRight: 6 },
  vegBadgeText: { fontSize: 10, color: '#166534', fontWeight: '800', letterSpacing: 0.5 },
  cardContent: { padding: 18 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardName: { flex: 1, fontSize: 19, fontWeight: '800', color: '#1C1917', marginRight: 12, lineHeight: 24 },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF08A',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#854D0E', marginLeft: 4 },
  categoryText: { fontSize: 13, color: '#78716C', marginBottom: 10, fontWeight: '500' },
  cardDesc: { fontSize: 14, color: '#57534E', lineHeight: 20, marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPriceLabel: { fontSize: 11, color: '#A8A29E', fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
  cardPrice: { fontSize: 20, fontWeight: '800', color: '#1C1917' },
  perDay: { fontSize: 14, fontWeight: '500', color: '#78716C' },
  viewBtn: {
    backgroundColor: '#F97316', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12,
    shadowColor: '#F97316', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  viewBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});

export default HomeScreen;
