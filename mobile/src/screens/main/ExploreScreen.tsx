import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Animated, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';
import { useTheme } from '../../theme/useTheme';
import { ColorScheme } from '../../theme/colors';

interface Tiffin {
  _id: string; name: string; description?: string;
  price: number; category: string; isVeg?: boolean;
  images?: string[]; rating?: { average: number; count: number };
  partner?: { businessName: string };
}

const FILTER_CATS = ['All', 'Gujarati', 'Punjabi', 'South Indian', 'Bengali', 'Maharashtrian', 'Healthy'];

const TRENDING = [
  { label: 'Dal Baati', emoji: '🍛' }, { label: 'Rajma Rice', emoji: '🫘' },
  { label: 'Sambar', emoji: '🥘' }, { label: 'Poha', emoji: '🍚' },
  { label: 'Khichdi', emoji: '🍲' },
];

const CAT_TILES = [
  { label: 'Gujarati', emoji: '🫕', bg: '#FEF3E2', bgDark: '#281800' },
  { label: 'Punjabi', emoji: '🍛', bg: '#FFECEE', bgDark: '#2D0B0E' },
  { label: 'South Indian', emoji: '🥘', bg: '#E9F5EE', bgDark: '#0A2015' },
  { label: 'Bengali', emoji: '🐟', bg: '#E8F0FE', bgDark: '#0D1C33' },
  { label: 'Maharashtrian', emoji: '🌶️', bg: '#FEF3E2', bgDark: '#281800' },
  { label: 'Healthy', emoji: '🥗', bg: '#E9F5EE', bgDark: '#0A2015' },
];

export default function ExploreScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const isDark = C.background === '#111111';

  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tiffin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeCat, setActiveCat] = useState('All');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const doSearch = useCallback(async (text: string, cat?: string) => {
    const q = text.trim();
    const c = cat ?? activeCat;
    if (!q && c === 'All') { setResults([]); setSearched(false); return; }
    try {
      setLoading(true);
      const params = [];
      if (q) params.push(`search=${encodeURIComponent(q)}`);
      if (c !== 'All') params.push(`category=${encodeURIComponent(c)}`);
      params.push('status=active');
      const res = await api.get(`/tiffins?${params.join('&')}`);
      setResults(res.data?.data || []);
      setSearched(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } catch { } finally { setLoading(false); }
  }, [activeCat]);

  const handleCat = (cat: string) => { setActiveCat(cat); doSearch(query, cat); };
  const clearSearch = () => { setQuery(''); setResults([]); setSearched(false); setActiveCat('All'); fadeAnim.setValue(0); };
  const pricePerDay = (p: any) => typeof p === 'object' ? p?.daily : p;

  return (
    <SafeAreaView style={S.safe}>
      <View style={S.header}>
        <Text style={S.title}>Explore Meals</Text>
        <View style={S.searchWrap}>
          <Ionicons name="search-outline" size={18} color={C.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            style={S.input}
            placeholder="Search tiffins, cuisines, kitchens..."
            placeholderTextColor={C.textTertiary}
            value={query}
            onChangeText={(t) => { setQuery(t); doSearch(t); }}
            returnKeyType="search"
            onSubmitEditing={() => doSearch(query)}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={18} color={C.textTertiary} />
            </TouchableOpacity>
          ) : (
            <View style={S.microFilter}><Ionicons name="options-outline" size={16} color={C.primary} /></View>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.chipRow}>
          {FILTER_CATS.map((c) => (
            <TouchableOpacity key={c} style={[S.chip, activeCat === c && S.chipActive]} onPress={() => handleCat(c)}>
              <Text style={[S.chipTxt, activeCat === c && S.chipTxtActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={S.center}>
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={{ fontSize: 13, color: C.textTertiary, marginTop: 12 }}>Finding meals for you...</Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={S.center}>
          <Text style={{ fontSize: 40, marginBottom: 14 }}>🔍</Text>
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.textPrimary }}>No results found</Text>
          <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 6 }}>Try a different category</Text>
        </View>
      ) : !searched ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text style={S.trendHeading}>🔥 Trending Searches</Text>
          <View style={S.trendRow}>
            {TRENDING.map((t) => (
              <TouchableOpacity key={t.label} style={S.trendChip} onPress={() => { setQuery(t.label); doSearch(t.label); }}>
                <Text style={{ fontSize: 16, marginRight: 6 }}>{t.emoji}</Text>
                <Text style={S.trendTxt}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[S.trendHeading, { marginTop: 24 }]}>🍱 Browse Categories</Text>
          <View style={S.catGrid}>
            {CAT_TILES.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={[S.catTile, { backgroundColor: isDark ? cat.bgDark : cat.bg }]}
                onPress={() => handleCat(cat.label)}
              >
                <Text style={{ fontSize: 28, marginBottom: 6 }}>{cat.emoji}</Text>
                <Text style={S.catTileLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={results}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={{ fontSize: 13, color: C.textTertiary, marginBottom: 12 }}>{results.length} results found</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={S.resultCard} onPress={() => nav.navigate('TiffinDetail', { tiffinId: item._id })} activeOpacity={0.85}>
                <Image
                  source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' }}
                  style={S.resultImg}
                />
                <View style={S.resultBody}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={[S.vegIndicator, { borderColor: item.isVeg ? C.veg : C.nonVeg }]}>
                      <View style={[S.vegDot, { backgroundColor: item.isVeg ? C.veg : C.nonVeg }]} />
                    </View>
                    <Text style={S.resultName} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <Text style={S.resultMeta} numberOfLines={1}>{item.category} • {item.partner?.businessName || 'Home Kitchen'}</Text>
                  {item.rating && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Text style={{ fontSize: 11, color: C.secondary, fontWeight: '700' }}>★ {item.rating.average.toFixed(1)}</Text>
                      {item.rating.count > 0 && <Text style={{ fontSize: 10, color: C.textTertiary, marginLeft: 4 }}>({item.rating.count})</Text>}
                    </View>
                  )}
                  <Text style={S.resultPrice}>₹{pricePerDay(item.price)}/day</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.border} />
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (C: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  header: { backgroundColor: C.background, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.borderLight },
  title: { fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 12, marginTop: 8 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: C.border },
  input: { flex: 1, fontSize: 14, color: C.textPrimary },
  microFilter: { width: 30, height: 30, borderRadius: 8, backgroundColor: C.primaryMuted, justifyContent: 'center', alignItems: 'center' },
  chipRow: { paddingTop: 12, paddingBottom: 4, gap: 8 },
  chip: { backgroundColor: C.surface, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.primaryMuted, borderColor: C.primary },
  chipTxt: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
  chipTxtActive: { color: C.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  trendHeading: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 12 },
  trendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trendChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  trendTxt: { fontSize: 13, fontWeight: '500', color: C.textSecondary },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catTile: { width: '47%', borderRadius: 14, padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 90 },
  catTileLabel: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceCard, borderRadius: 14, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  resultImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: C.surface },
  resultBody: { flex: 1, marginHorizontal: 12 },
  resultName: { fontSize: 15, fontWeight: '700', color: C.textPrimary, flex: 1 },
  resultMeta: { fontSize: 12, color: C.textSecondary, marginTop: 3 },
  resultPrice: { fontSize: 14, fontWeight: '700', color: C.primary, marginTop: 4 },
  vegIndicator: { width: 14, height: 14, borderRadius: 2, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginRight: 6, marginTop: 2 },
  vegDot: { width: 6, height: 6, borderRadius: 3 },
});
