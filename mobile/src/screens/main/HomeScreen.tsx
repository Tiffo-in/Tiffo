import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image, Animated, Dimensions, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParams } from '../../navigation/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useTheme } from '../../theme/useTheme';
import { ColorScheme } from '../../theme/colors';

const { width: SW } = Dimensions.get('window');

interface Tiffin {
  _id: string; name: string; description?: string; price: any;
  category: string; images?: string[];
  rating?: { average: number; count: number };
  isVeg?: boolean; partner?: { businessName: string };
}

const CATEGORIES = [
  { label: 'All', icon: '🍽️' }, { label: 'Gujarati', icon: '🫕' },
  { label: 'Punjabi', icon: '🍛' }, { label: 'South Indian', icon: '🥘' },
  { label: 'Bengali', icon: '🐟' }, { label: 'Maharashtrian', icon: '🌶️' },
  { label: 'Healthy', icon: '🥗' },
];

const BANNERS = [
  { id: '1', title: '50% OFF', subtitle: 'On your first subscription', bg: '#E23744', emoji: '🎉' },
  { id: '2', title: 'FREE delivery', subtitle: 'On all monthly plans', bg: '#FC8019', emoji: '🛵' },
  { id: '3', title: 'Fresh daily', subtitle: 'Cooked with love every morning', bg: '#257E3E', emoji: '🍱' },
];

const SkeletonCard = ({ C }: { C: ColorScheme }) => {
  const anim = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const S = useMemo(() => createStyles(C), [C]);
  return (
    <Animated.View style={[S.card, { opacity: anim }]}>
      <View style={[S.cardImgWrap, { height: 190, backgroundColor: C.skeletonBase }]} />
      <View style={{ padding: 16 }}>
        <View style={[S.skLine, { width: '65%' }]} />
        <View style={[S.skLine, { width: '45%', marginTop: 8 }]} />
        <View style={[S.skLine, { width: '30%', marginTop: 8 }]} />
      </View>
    </Animated.View>
  );
};

const TiffinCard = ({ item, onPress, index, C }: { item: Tiffin; onPress: () => void; index: number; C: ColorScheme }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const S = useMemo(() => createStyles(C), [C]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, delay: index * 70, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 350, delay: index * 70, useNativeDriver: true }),
    ]).start();
  }, []);

  const pricePerDay = typeof item.price === 'object' ? item.price?.daily : item.price;
  const rating = item.rating?.average || 4.5;

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }, { scale }] }}>
      <TouchableOpacity
        style={S.card} onPress={onPress} activeOpacity={1}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }).start()}
      >
        <View style={S.cardImgWrap}>
          <Image
            source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' }}
            style={S.cardImg} resizeMode="cover"
          />
          <View style={S.ratingBadge}>
            <Text style={S.ratingText}>★ {rating.toFixed(1)}</Text>
          </View>
          <View style={[S.vegBox, { borderColor: item.isVeg ? C.veg : C.nonVeg }]}>
            <View style={[S.vegDot, { backgroundColor: item.isVeg ? C.veg : C.nonVeg }]} />
          </View>
          {index === 0 && (
            <View style={S.offerBadge}><Text style={S.offerText}>🎁 50% OFF</Text></View>
          )}
        </View>
        <View style={S.cardBody}>
          <Text style={S.cardName} numberOfLines={1}>{item.name}</Text>
          <View style={S.metaRow}>
            <Text style={S.metaText}>{item.category}</Text>
            <Text style={S.bullet}>•</Text>
            <Text style={S.metaText} numberOfLines={1}>{item.partner?.businessName || 'Home Kitchen'}</Text>
          </View>
          <View style={S.cardDivider} />
          <View style={S.cardFooter}>
            <View>
              <Text style={S.priceLabel}>Starts at</Text>
              <Text style={S.price}>₹{pricePerDay}<Text style={S.perDay}>/day</Text></Text>
            </View>
            <TouchableOpacity style={S.viewBtn} onPress={onPress}>
              <Text style={S.viewBtnTxt}>View Plans</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const BannerCarousel = ({ C }: { C: ColorScheme }) => {
  const [idx, setIdx] = useState(0);
  const ref = useRef<FlatList>(null);
  useEffect(() => {
    const t = setInterval(() => {
      const next = (idx + 1) % BANNERS.length;
      ref.current?.scrollToIndex({ index: next, animated: true });
      setIdx(next);
    }, 3200);
    return () => clearInterval(t);
  }, [idx]);
  return (
    <View style={{ marginHorizontal: 16, marginTop: 8 }}>
      <FlatList
        ref={ref} data={BANNERS} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / (SW - 32)))}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: item.bg, width: SW - 32, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', minHeight: 90 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{item.subtitle}</Text>
            </View>
            <Text style={{ fontSize: 42 }}>{item.emoji}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 }}>
        {BANNERS.map((_, i) => (
          <View key={i} style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? '#E23744' : C.border }} />
        ))}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { user } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [tiffins, setTiffins] = useState<Tiffin[]>([]);
  const [filtered, setFiltered] = useState<Tiffin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCat, setActiveCat] = useState('All');

  const fetchTiffins = async () => {
    try {
      const res = await api.get('/tiffins?limit=20&status=active');
      const d = res.data?.data || [];
      setTiffins(d); setFiltered(d);
    } catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchTiffins(); }, []);

  const filterCat = (cat: string) => {
    setActiveCat(cat);
    setFiltered(cat === 'All' ? tiffins : tiffins.filter(t => t.category?.toLowerCase().includes(cat.toLowerCase())));
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? '🌅 Good morning' : h < 17 ? '☀️ Good afternoon' : '🌙 Good evening';
  };

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTiffins(); }} tintColor={C.primary} />}
      >
        {/* Header */}
        <View style={S.header}>
          <View style={S.locRow}>
            <Ionicons name="location-sharp" size={16} color={C.primary} />
            <Text style={S.locTxt}>Home</Text>
            <Ionicons name="chevron-down" size={14} color={C.textSecondary} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={S.greet}>{greeting()}</Text>
            <View style={S.avatar}>
              <Text style={S.avatarTxt}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <TouchableOpacity style={S.search} onPress={() => (nav as any).navigate('Explore')} activeOpacity={0.8}>
          <Ionicons name="search-outline" size={18} color={C.textTertiary} />
          <Text style={S.searchTxt}>Search homemade meals...</Text>
          <View style={S.filterBtn}>
            <Ionicons name="options-outline" size={16} color={C.primary} />
          </View>
        </TouchableOpacity>

        <BannerCarousel C={C} />

        {/* Categories */}
        <Text style={S.sectionTitle}>What's your craving?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 8 }}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c.label} style={[S.chip, activeCat === c.label && S.chipActive]} onPress={() => filterCat(c.label)}>
              <Text style={{ fontSize: 14 }}>{c.icon}</Text>
              <Text style={[S.chipTxt, activeCat === c.label && S.chipTxtActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feed */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 12 }}>
          <Text style={S.sectionTitle2}>{activeCat === 'All' ? 'All Meal Plans' : `${activeCat} Meals`}</Text>
          <Text style={{ fontSize: 12, color: C.textTertiary }}>{filtered.length} available</Text>
        </View>

        {loading ? (<><SkeletonCard C={C} /><SkeletonCard C={C} /><SkeletonCard C={C} /></>) :
          filtered.length === 0 ? (
            <View style={S.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🍽️</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.textPrimary }}>No meals found</Text>
              <Text style={{ fontSize: 14, color: C.textSecondary, marginTop: 8 }}>Try a different category</Text>
            </View>
          ) : filtered.map((t, i) => (
            <TiffinCard key={t._id} item={t} index={i} C={C} onPress={() => nav.navigate('TiffinDetail', { tiffinId: t._id })} />
          ))
        }
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locTxt: { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginHorizontal: 4 },
  greet: { fontSize: 12, color: C.textSecondary },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
  search: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 8, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: C.border },
  searchTxt: { flex: 1, fontSize: 14, color: C.textTertiary, marginLeft: 8 },
  filterBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: C.primaryMuted, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginLeft: 16, marginTop: 20, marginBottom: 12 },
  sectionTitle2: { fontSize: 17, fontWeight: '700', color: C.textPrimary },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border, gap: 6 },
  chipActive: { backgroundColor: C.primaryMuted, borderColor: C.primary },
  chipTxt: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
  chipTxtActive: { color: C.primary },
  card: { backgroundColor: C.surfaceCard, marginHorizontal: 16, marginBottom: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  cardImgWrap: { position: 'relative', height: 190 },
  cardImg: { width: '100%', height: '100%', backgroundColor: C.surface },
  ratingBadge: { position: 'absolute', bottom: 10, left: 12, backgroundColor: C.secondary, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 4 },
  ratingText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  vegBox: { position: 'absolute', top: 10, right: 12, width: 18, height: 18, borderRadius: 3, borderWidth: 1.5, backgroundColor: C.surfaceCard, justifyContent: 'center', alignItems: 'center' },
  vegDot: { width: 8, height: 8, borderRadius: 4 },
  offerBadge: { position: 'absolute', top: 10, left: 12, backgroundColor: C.veg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  offerText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardBody: { padding: 16 },
  cardName: { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  metaText: { fontSize: 12, color: C.textSecondary },
  bullet: { fontSize: 12, color: C.border, marginHorizontal: 6 },
  cardDivider: { height: 1, backgroundColor: C.divider, marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 10, color: C.textTertiary, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
  price: { fontSize: 20, fontWeight: '800', color: C.textPrimary },
  perDay: { fontSize: 13, fontWeight: '400', color: C.textSecondary },
  viewBtn: { backgroundColor: C.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  viewBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  skLine: { height: 13, backgroundColor: C.skeletonBase, borderRadius: 6 },
  empty: { alignItems: 'center', paddingVertical: 60 },
});
