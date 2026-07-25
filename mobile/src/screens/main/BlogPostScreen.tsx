import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';
import { captureError } from '../../services/observability';
import { useTheme } from '../../theme/useTheme';
import { BlogPostDetail, formatPublishedDate, normalizePostDetail } from '../../utils/blog';

type BlogPostRoute = RouteProp<RootStackParams, 'BlogPost'>;

const BlogPostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<BlogPostRoute>();
  const { slug, title } = route.params;
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);

  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/blog/${slug}`);
      const detail = normalizePostDetail(res.data?.data);
      setPost(detail);

      // Fire-and-forget view counter — a failure here must not break reading.
      if (detail._id) {
        api.post(`/blog/${detail._id}/view`).catch(() => undefined);
      }
    } catch (err: any) {
      captureError(err, { screen: 'BlogPost', slug });
      setError(err.response?.data?.message || 'Could not load this article.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

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
        <Text style={S.headerTitle} numberOfLines={1}>
          {post?.title || title || 'Article'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={S.centered}>
          <Ionicons name="cloud-offline-outline" size={40} color={C.textTertiary} />
          <Text style={S.emptyTitle}>Could not load article</Text>
          <Text style={S.emptyText}>{error}</Text>
          <TouchableOpacity style={S.retryButton} onPress={load}>
            <Text style={S.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {!!post?.coverImage && <Image source={{ uri: post.coverImage }} style={S.cover} />}
          <View style={S.body}>
            {!!post?.category && <Text style={S.category}>{post.category.toUpperCase()}</Text>}
            <Text style={S.title}>{post?.title}</Text>
            <View style={S.metaRow}>
              {!!post?.authorName && <Text style={S.meta}>{post.authorName}</Text>}
              {!!post?.publishedAt && (
                <Text style={S.meta}>· {formatPublishedDate(post.publishedAt)}</Text>
              )}
              {!!post?.readMinutes && <Text style={S.meta}>· {post.readMinutes} min read</Text>}
            </View>
            <Text style={S.content}>{post?.content}</Text>
          </View>
        </ScrollView>
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
    headerTitle: { flex: 1, color: C.textPrimary, fontSize: 16, fontWeight: '700' },
    cover: { width: '100%', height: 200 },
    body: { padding: 16 },
    category: { color: C.primary, fontSize: 11, fontWeight: '700', marginBottom: 8 },
    title: { color: C.textPrimary, fontSize: 24, fontWeight: '800', lineHeight: 32 },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, marginBottom: 18 },
    meta: { color: C.textTertiary, fontSize: 12 },
    content: { color: C.textSecondary, fontSize: 15, lineHeight: 25 },
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

export default BlogPostScreen;
