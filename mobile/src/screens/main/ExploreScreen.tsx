import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { RootStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';
import { Tiffin as SharedTiffin } from '../../types';

const { width: SW } = Dimensions.get('window');

// Field names must match the API (`title`/`cuisine`/`dietary`), so use the
// shared type rather than a local copy that can drift out of sync.
type Tiffin = SharedTiffin;

/** `isVeg` is a virtual the list endpoint drops via `.lean()`; derive it. */
const isVegTiffin = (t: Tiffin) =>
  typeof t.isVeg === 'boolean'
    ? t.isVeg
    : (t.dietary ?? []).some((d) => d === 'vegetarian' || d === 'vegan');

const vegIsKnown = (t: Tiffin) => typeof t.isVeg === 'boolean' || (t.dietary ?? []).length > 0;

// ─── Data ─────────────────────────────────────────────────────────────────────
const CAT_ICONS = [
  {
    label: 'All',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=70',
    active: true,
  },
  {
    label: 'Gujarati',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=70',
  },
  {
    label: 'Punjabi',
    image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=200&q=70',
  },
  {
    label: 'South Indian',
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=200&q=70',
  },
  {
    label: 'Healthy',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=70',
  },
  {
    label: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200&q=70',
  },
  { label: 'More', image: null },
];

const TRENDING = [
  {
    label: 'Dal Baati',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=70',
  },
  {
    label: 'Rajma Rice',
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=300&q=70',
  },
  {
    label: 'Idli Sambar',
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&q=70',
  },
  {
    label: 'Poha',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=70',
  },
  {
    label: 'Khichdi',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300&q=70',
  },
];

const CAT_TILES = [
  {
    label: 'Gujarati',
    count: 125,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=70',
  },
  {
    label: 'Punjabi',
    count: 98,
    image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&q=70',
  },
  {
    label: 'South Indian',
    count: 114,
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=70',
  },
  {
    label: 'Bengali',
    count: 86,
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&q=70',
  },
  {
    label: 'Maharashtrian',
    count: 102,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=70',
  },
  {
    label: 'Healthy',
    count: 132,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=70',
  },
];

const RECOMMENDED_FALLBACK = [
  {
    _id: 'r1',
    name: "Meena's Tiffin Corner",
    images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=70'],
    rating: { average: 4.8, count: 120 },
    price: 120,
    isVeg: true,
    distance: '2 km',
    discount: 50,
    partner: { businessName: "Meena's" },
    category: 'Gujarati',
  },
  {
    _id: 'r2',
    name: 'Sharma Ji Kitchen',
    images: ['https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&q=70'],
    rating: { average: 4.7, count: 85 },
    price: 110,
    isVeg: true,
    distance: '1.8 km',
    discount: null,
    partner: { businessName: 'Sharma Ji' },
    category: 'Punjabi',
  },
  {
    _id: 'r3',
    name: 'Desi Tiffin Service',
    images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=70'],
    rating: { average: 4.6, count: 65 },
    price: 100,
    isVeg: true,
    distance: '2.3 km',
    discount: null,
    partner: { businessName: 'Desi' },
    category: 'Healthy',
  },
  {
    _id: 'r4',
    name: 'The Healthy Bowl',
    images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=70'],
    rating: { average: 4.9, count: 200 },
    price: 130,
    isVeg: true,
    distance: '1.5 km',
    discount: null,
    partner: { businessName: 'Healthy Bowl' },
    category: 'Healthy',
  },
];

// ─── Recommended Card ─────────────────────────────────────────────────────────
const RecommendedCard = ({
  item,
  onPress,
  C,
}: {
  item: any;
  onPress: () => void;
  C: ColorScheme;
}) => {
  const [liked, setLiked] = useState(false);
  const priceVal = typeof item.price === 'object' ? (item.price as any)?.daily : item.price;
  return (
    <TouchableOpacity
      style={{ width: 155, marginRight: 12 }}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: C.surfaceCard }}>
        <View style={{ position: 'relative' }}>
          <Image
            source={{
              uri:
                item.images?.[0] ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=70',
            }}
            style={{ width: '100%', height: 120 }}
            resizeMode="cover"
          />
          {item.discount && (
            <View
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: '#22c55e',
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>
                {item.discount}% OFF
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: 'rgba(0,0,0,0.45)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => setLiked(!liked)}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={14}
              color={liked ? '#ef4444' : '#fff'}
            />
          </TouchableOpacity>
        </View>
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary }} numberOfLines={1}>
            {item.title || item.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="star" size={10} color="#FF7A18" />
              <Text style={{ fontSize: 10, fontWeight: '700', color: C.textSecondary }}>
                {item.rating?.average?.toFixed(1) || '4.5'}
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: C.textTertiary }}>{item.distance || '2 km'}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 5,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: C.textPrimary }}>
              From <Text style={{ color: '#FF7A18' }}>₹{priceVal}</Text>/day
            </Text>
            <View
              style={{
                backgroundColor: '#22c55e',
                borderRadius: 4,
                paddingHorizontal: 5,
                paddingVertical: 2,
              }}
            >
              <Text style={{ fontSize: 8, fontWeight: '800', color: '#fff' }}>Veg</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { user } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tiffin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeCat, setActiveCat] = useState('All');
  const [recommended, setRecommended] = useState<any[]>(RECOMMENDED_FALLBACK);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const doSearch = useCallback(
    async (text: string, cat?: string) => {
      const q = text.trim();
      const c = cat ?? activeCat;
      if (!q && c === 'All') {
        setResults([]);
        setSearched(false);
        return;
      }
      try {
        setLoading(true);
        const params = [];
        if (q) params.push(`search=${encodeURIComponent(q)}`);
        // The API filters on `cuisine`; a `category` param is silently ignored.
        if (c !== 'All') params.push(`cuisine=${encodeURIComponent(c)}`);
        params.push('status=active');
        const res = await api.get(`/tiffins?${params.join('&')}`);
        setResults(res.data?.data || []);
        setSearched(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [activeCat],
  );

  // Fetch recommended on mount
  useEffect(() => {
    api
      .get('/tiffins?limit=6&status=active')
      .then((res) => {
        const data = res.data?.data;
        if (data && data.length > 0) setRecommended(data);
      })
      .catch(() => {});
  }, []);

  const handleCat = (cat: string) => {
    setActiveCat(cat);
    doSearch(query, cat);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setActiveCat('All');
    fadeAnim.setValue(0);
  };

  const pricePerDay = (p: any) => (typeof p === 'object' ? p?.daily : p);

  const greeting = () => {
    const h = new Date().getHours();
    const emoji = h < 12 ? '👋' : h < 17 ? '☀️' : '🌙';
    const prefix = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    const name = user?.name?.split(' ')[0];
    return `${prefix}${name ? `, ${name}` : ''} ${emoji}`;
  };

  const locationDisplay = (() => {
    if (user?.address?.city) {
      const state = (user.address as any)?.state || 'MP';
      return `${user.address.city}, ${state}`;
    }
    return 'Near You';
  })();

  // ─── Discovery View (no search active) ─────────────────────────────────────
  const DiscoveryView = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Category Icon Row ─────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, gap: 16 }}
      >
        {CAT_ICONS.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            style={{ alignItems: 'center', gap: 6 }}
            onPress={() =>
              cat.label !== 'More' && handleCat(cat.label === 'All' ? 'All' : cat.label)
            }
          >
            <View
              style={[
                S.catIconWrap,
                activeCat === cat.label && { borderColor: '#FF7A18', borderWidth: 2.5 },
              ]}
            >
              {cat.image ? (
                <Image source={{ uri: cat.image }} style={S.catIconImg} />
              ) : (
                <View
                  style={[
                    S.catIconImg,
                    { backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center' },
                  ]}
                >
                  <Ionicons name="chevron-down" size={22} color={C.textSecondary} />
                </View>
              )}
            </View>
            <Text
              style={[
                S.catIconLabel,
                activeCat === cat.label && { color: '#FF7A18', fontWeight: '700' },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Trending Searches ──────────────────────────────────────── */}
      <View style={S.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="flame" size={17} color="#FF7A18" />
          <Text style={S.sectionTitle}>Trending Searches</Text>
        </View>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Text style={S.viewAllTxt}>View All</Text>
          <Ionicons name="chevron-forward" size={13} color="#FF7A18" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 10 }}
      >
        {TRENDING.map((t) => (
          <TouchableOpacity
            key={t.label}
            style={S.trendCard}
            onPress={() => {
              setQuery(t.label);
              doSearch(t.label);
            }}
          >
            <Image source={{ uri: t.image }} style={S.trendImg} resizeMode="cover" />
            {/* Dark gradient overlay */}
            <View style={S.trendOverlay} />
            {/* Search icon */}
            <View style={S.trendSearchIcon}>
              <Ionicons name="search-outline" size={12} color="#fff" />
            </View>
            <Text style={S.trendLabel} numberOfLines={1}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Browse Categories ──────────────────────────────────────── */}
      <View style={S.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="grid" size={16} color={C.textPrimary} />
          <Text style={S.sectionTitle}>Browse Categories</Text>
        </View>
      </View>

      <View style={S.catGrid}>
        {CAT_TILES.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            style={S.catTile}
            onPress={() => handleCat(cat.label)}
            activeOpacity={0.88}
          >
            <Image
              source={{ uri: cat.image }}
              style={StyleSheet.absoluteFillObject as any}
              resizeMode="cover"
            />
            <View style={S.catTileGradient} />
            <View style={S.catTileBottom}>
              <View style={{ flex: 1 }}>
                <Text style={S.catTileLabel}>{cat.label}</Text>
                <Text style={S.catTileCount}>{cat.count} Meals</Text>
              </View>
              <View style={S.catTileArrow}>
                <Ionicons name="chevron-forward" size={13} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Recommended Near You ───────────────────────────────────── */}
      <View style={S.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="star" size={16} color="#FF7A18" />
          <Text style={S.sectionTitle}>Recommended near you</Text>
        </View>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Text style={S.viewAllTxt}>View All</Text>
          <Ionicons name="chevron-forward" size={13} color="#FF7A18" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
      >
        {recommended.map((item) => (
          <RecommendedCard
            key={item._id}
            item={item}
            C={C}
            onPress={() => nav.navigate('TiffinDetail', { tiffinId: item._id })}
          />
        ))}
      </ScrollView>
    </ScrollView>
  );

  // ─── Search Results View ────────────────────────────────────────────────────
  const ResultsView = () => (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={{ fontSize: 13, color: C.textTertiary, marginBottom: 12 }}>
            {results.length} results found
          </Text>
        }
        ListEmptyComponent={
          <View style={S.center}>
            <Ionicons
              name="search-outline"
              size={48}
              color={C.textSecondary}
              style={{ marginBottom: 14 }}
            />
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.textPrimary }}>
              No results found
            </Text>
            <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 6 }}>
              Try a different category or keyword
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={S.resultCard}
            onPress={() => nav.navigate('TiffinDetail', { tiffinId: item._id })}
            activeOpacity={0.85}
          >
            <View style={{ position: 'relative' }}>
              <Image
                source={{
                  uri:
                    item.images?.[0] ||
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
                }}
                style={S.resultImg}
              />
              {vegIsKnown(item) && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    left: 5,
                    backgroundColor: isVegTiffin(item) ? '#22c55e' : '#ef4444',
                    borderRadius: 4,
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ fontSize: 7, fontWeight: '800', color: '#fff' }}>
                    {isVegTiffin(item) ? 'Veg' : 'Non-Veg'}
                  </Text>
                </View>
              )}
            </View>
            <View style={S.resultBody}>
              <Text style={S.resultName} numberOfLines={1}>
                {item.title || item.name}
              </Text>
              <Text style={S.resultMeta} numberOfLines={1}>
                {item.cuisine || item.category} • {item.partner?.businessName || 'Home Kitchen'}
              </Text>
              {item.rating && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                  <Ionicons name="star" size={11} color="#FF7A18" />
                  <Text style={{ fontSize: 11, color: C.textSecondary, fontWeight: '700' }}>
                    {item.rating.average.toFixed(1)}
                  </Text>
                  {item.rating.count > 0 && (
                    <Text style={{ fontSize: 10, color: C.textTertiary }}>
                      ({item.rating.count})
                    </Text>
                  )}
                </View>
              )}
              <Text style={S.resultPrice}>₹{pricePerDay(item.price)}/day</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.border} />
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView style={S.safe}>
      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <View style={S.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={S.greetTxt}>{greeting()}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={S.pageTitle}>Explore </Text>
            <Text style={[S.pageTitle, { color: '#FF7A18' }]}>Meals</Text>
            <Text style={{ fontSize: 24 }}>🔥</Text>
          </View>
          <Text style={S.pageSubtitle}>Find authentic homemade tiffins near you</Text>
        </View>
        {/* Location + Bell */}
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <TouchableOpacity style={S.locPill}>
            <Ionicons name="location-sharp" size={12} color="#FF7A18" />
            <Text style={S.locPillTxt} numberOfLines={1}>
              {locationDisplay}
            </Text>
            <Ionicons name="chevron-down" size={11} color={C.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={S.bellBtn}>
            <Ionicons name="notifications-outline" size={18} color={C.textPrimary} />
            <View style={S.bellDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search Row ─────────────────────────────────────────────────────── */}
      <View style={S.searchRow}>
        <View style={S.searchWrap}>
          <Ionicons name="search-outline" size={17} color={C.textTertiary} />
          <TextInput
            style={S.input}
            placeholder="Search tiffins, cuisines, kitchens..."
            placeholderTextColor={C.textTertiary}
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              doSearch(t);
            }}
            returnKeyType="search"
            onSubmitEditing={() => doSearch(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={17} color={C.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={S.locationBtn}>
          <Ionicons name="location-outline" size={13} color={C.textSecondary} />
          <Text style={S.locationBtnTxt}>Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={S.filtersBtn}>
          <Ionicons name="options-outline" size={14} color="#fff" />
          <Text style={S.filtersBtnTxt}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={S.center}>
          <ActivityIndicator color="#FF7A18" size="large" />
          <Text style={{ fontSize: 13, color: C.textTertiary, marginTop: 12 }}>
            Finding meals for you...
          </Text>
        </View>
      ) : searched ? (
        <ResultsView />
      ) : (
        <DiscoveryView />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.background },

    // Top header
    topHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 4,
      gap: 8,
    },
    greetTxt: { fontSize: 13, color: C.textSecondary, marginBottom: 2 },
    pageTitle: { fontSize: 28, fontWeight: '900', color: C.textPrimary, lineHeight: 34 },
    pageSubtitle: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
    locPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: C.border,
      gap: 4,
      maxWidth: 130,
    },
    locPillTxt: { fontSize: 11, fontWeight: '700', color: C.textPrimary, flex: 1 },
    bellBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    bellDot: {
      position: 'absolute',
      top: 7,
      right: 7,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#FF7A18',
      borderWidth: 1,
      borderColor: C.background,
    },

    // Search row
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
      gap: 8,
    },
    searchWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 11,
      borderWidth: 1,
      borderColor: C.border,
      gap: 8,
    },
    input: { flex: 1, fontSize: 13, color: C.textPrimary },
    locationBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 11,
      borderWidth: 1,
      borderColor: C.border,
      gap: 4,
    },
    locationBtnTxt: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
    filtersBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF7A18',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      gap: 5,
    },
    filtersBtnTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },

    // Category icon row
    catIconWrap: {
      width: 60,
      height: 60,
      borderRadius: 30,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    catIconImg: { width: '100%', height: '100%' },
    catIconLabel: { fontSize: 11, fontWeight: '600', color: C.textSecondary, textAlign: 'center' },

    // Section header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 22,
      marginBottom: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: C.textPrimary },
    viewAllTxt: { fontSize: 12, fontWeight: '700', color: '#FF7A18' },

    // Trending cards
    trendCard: {
      width: 110,
      height: 100,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    trendImg: { width: '100%', height: '100%' },
    trendOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.38)',
    },
    trendSearchIcon: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    trendLabel: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      right: 8,
      fontSize: 11,
      fontWeight: '700',
      color: '#fff',
    },

    // Category grid (2-column photo tiles)
    catGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      gap: 10,
    },
    catTile: {
      width: (SW - 42) / 3,
      height: 100,
      borderRadius: 14,
      overflow: 'hidden',
      position: 'relative',
      justifyContent: 'flex-end',
    },
    catTileGradient: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    catTileBottom: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding: 8,
    },
    catTileLabel: { fontSize: 11, fontWeight: '800', color: '#fff' },
    catTileCount: { fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
    catTileArrow: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Search results
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
    resultCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surfaceCard,
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    resultImg: { width: 72, height: 72, borderRadius: 12, backgroundColor: C.surface },
    resultBody: { flex: 1, marginHorizontal: 12 },
    resultName: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
    resultMeta: { fontSize: 12, color: C.textSecondary, marginTop: 3 },
    resultPrice: { fontSize: 14, fontWeight: '700', color: '#FF7A18', marginTop: 4 },
  });
