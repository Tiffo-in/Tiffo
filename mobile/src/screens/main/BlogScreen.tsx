import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';
import { captureError } from '../../services/observability';
import { useTheme } from '../../theme/useTheme';
import { BlogPostSummary, formatPublishedDate, normalizePostList } from '../../utils/blog';

const ALL = 'all';

const BlogScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);

  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (category: string) => {
    try {
      setError(null);
      const [postRes, catRes] = await Promise.all([
        api.get('/blog', { params: category !== ALL ? { category } : {} }),
        api.get('/blog/categories').catch(() => null), // categories are a nicety
      ]);
      setPosts(normalizePostList(postRes.data?.data));
      if (catRes?.data?.data && Array.isArray(catRes.data.data)) {
        setCategories(catRes.data.data.map((c: unknown) => String(c)).filter(Boolean));
      }
    } catch (err: any) {
      captureError(err, { screen: 'Blog' });
      setError(err.response?.data?.message || 'Could not load articles.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(activeCategory);
  }, [load, activeCategory]);

  const renderItem = ({ item }: { item: BlogPostSummary }) => (
    <TouchableOpacity
      style={S.card}
      onPress={() => navigation.navigate('BlogPost', { slug: item.slug, title: item.title })}
      accessibilityRole="button"
      accessibilityLabel={`Read ${item.title}`}
    >
      {!!item.coverImage && <Image source={{ uri: item.coverImage }} style={S.cover} />}
      <View style={S.cardBody}>
        {!!item.category && <Text style={S.category}>{item.category.toUpperCase()}</Text>}
        <Text style={S.title} numberOfLines={2}>
          {item.title}
        </Text>
        {!!item.excerpt && (
          <Text style={S.excerpt} numberOfLines={2}>
            {item.excerpt}
          </Text>
        )}
        <View style={S.metaRow}>
          <Text style={S.meta}>{formatPublishedDate(item.publishedAt)}</Text>
          {!!item.readMinutes && <Text style={S.meta}>· {item.readMinutes} min read</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={S.safeArea}>
      <View style={S.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={S.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Tiffo Stories</Text>
        <View style={{ width: 40 }} />
      </View>

      {categories.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[ALL, ...categories]}
          keyExtractor={(c) => c}
          contentContainerStyle={S.categoryRow}
          renderItem={({ item }) => {
            const selected = activeCategory === item;
            return (
              <TouchableOpacity
                style={[S.chip, selected && S.chipSelected]}
                onPress={() => setActiveCategory(item)}
                accessibilityRole="button"
                accessibilityLabel={`Filter ${item}`}
              >
                <Text style={[S.chipText, selected && S.chipTextSelected]}>
                  {item === ALL ? 'All' : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={S.centered}>
          <Ionicons name="cloud-offline-outline" size={40} color={C.textTertiary} />
          <Text style={S.emptyTitle}>Could not load articles</Text>
          <Text style={S.emptyText}>{error}</Text>
          <TouchableOpacity style={S.retryButton} onPress={() => load(activeCategory)}>
            <Text style={S.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.slug || item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(activeCategory);
              }}
              tintColor={C.primary}
            />
          }
          ListEmptyComponent={
            <View style={S.centered}>
              <Ionicons name="newspaper-outline" size={40} color={C.textTertiary} />
              <Text style={S.emptyTitle}>Nothing here yet</Text>
              <Text style={S.emptyText}>New articles will appear here as they are published.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (C: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { color: C.textPrimary, fontSize: 17, fontWeight: '700' },
    categoryRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surfaceCard,
      marginRight: 8,
    },
    chipSelected: { borderColor: C.primary, backgroundColor: C.primaryMuted },
    chipText: { color: C.textSecondary, fontSize: 12, textTransform: 'capitalize' },
    chipTextSelected: { color: C.primary, fontWeight: '700' },
    card: {
      backgroundColor: C.surfaceCard,
      borderRadius: 14,
      marginBottom: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: C.border,
    },
    cover: { width: '100%', height: 160 },
    cardBody: { padding: 14 },
    category: { color: C.primary, fontSize: 10, fontWeight: '700', marginBottom: 6 },
    title: { color: C.textPrimary, fontSize: 16, fontWeight: '700', lineHeight: 22 },
    excerpt: { color: C.textSecondary, fontSize: 13, marginTop: 6, lineHeight: 19 },
    metaRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
    meta: { color: C.textTertiary, fontSize: 11 },
    centered: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
    emptyTitle: { color: C.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 12 },
    emptyText: { color: C.textTertiary, fontSize: 13, textAlign: 'center', marginTop: 6 },
    retryButton: {
      marginTop: 16,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: C.primary,
    },
    retryText: { color: C.primary, fontWeight: '700' },
  });

export default BlogScreen;
