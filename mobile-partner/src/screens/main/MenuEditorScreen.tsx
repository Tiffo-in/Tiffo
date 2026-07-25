import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';
import { captureError } from '../../services/observability';
import { Colors } from '../../theme/colors';
import {
  DISH_CATEGORIES,
  DISH_TAGS,
  DishCategory,
  MenuItem,
  createEmptyDish,
  fromServerItem,
  moveItem,
  toPayload,
  validateMenuItems,
} from '../../utils/menu';

type MenuEditorRoute = RouteProp<MenuStackParams, 'MenuEditor'>;

let dishCounter = 0;
const nextDishId = () => `dish-${Date.now()}-${dishCounter++}`;

const MenuEditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<MenuEditorRoute>();
  const { tiffinId, tiffinTitle } = route.params;

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadMenu = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await api.get(`/tiffins/${tiffinId}`);
      const raw = res.data?.data?.menuItems;
      setItems(Array.isArray(raw) ? raw.map((r) => fromServerItem(r, nextDishId())) : []);
    } catch (err: any) {
      captureError(err, { screen: 'MenuEditor', tiffinId });
      setLoadError(err.response?.data?.message || 'Could not load this menu. Pull to retry.');
    } finally {
      setLoading(false);
    }
  }, [tiffinId]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const updateItem = (id: string, patch: Partial<MenuItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    setDirty(true);
  };

  const addDish = () => {
    setItems((prev) => [...prev, createEmptyDish(nextDishId())]);
    setDirty(true);
  };

  const removeDish = (id: string) => {
    const dish = items.find((i) => i.id === id);
    Alert.alert('Remove dish', `Remove ${dish?.name?.trim() || 'this dish'} from the menu?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setItems((prev) => prev.filter((it) => it.id !== id));
          setDirty(true);
        },
      },
    ]);
  };

  const reorder = (index: number, direction: -1 | 1) => {
    setItems((prev) => moveItem(prev, index, index + direction));
    setDirty(true);
  };

  const toggleTag = (id: string, tag: string) => {
    const dish = items.find((i) => i.id === id);
    if (!dish) return;
    const tags = dish.tags.includes(tag) ? dish.tags.filter((t) => t !== tag) : [...dish.tags, tag];
    updateItem(id, { tags });
  };

  const pickPhoto = async (id: string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Allow photo access to add dish images. You can enable it in Settings.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7, // resize before upload — dish photos do not need full res
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    try {
      setUploadingId(id);
      const form = new FormData();
      form.append('file', {
        uri: asset.uri,
        name: asset.fileName || `dish-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      } as unknown as Blob);
      form.append('context', 'tiffin');

      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.url) {
        updateItem(id, { image: res.data.url });
      } else {
        Alert.alert('Upload failed', res.data?.message || 'Could not upload that photo.');
      }
    } catch (err: any) {
      captureError(err, { screen: 'MenuEditor', action: 'upload' });
      Alert.alert('Upload failed', err.response?.data?.message || 'Could not upload that photo.');
    } finally {
      setUploadingId(null);
    }
  };

  const save = async () => {
    // The server rejects the whole array if any dish lacks a name, so check
    // first rather than losing the partner's work to a 400.
    const validation = validateMenuItems(items);
    if (!validation.valid) {
      Alert.alert('Incomplete menu', validation.message);
      return;
    }

    try {
      setSaving(true);
      const res = await api.patch(`/tiffins/${tiffinId}/menu`, { menuItems: toPayload(items) });
      if (res.data?.success) {
        setDirty(false);
        Alert.alert('Menu saved', 'Your dish list has been updated.');
        navigation.goBack();
      }
    } catch (err: any) {
      captureError(err, { screen: 'MenuEditor', action: 'save', tiffinId });
      Alert.alert('Save failed', err.response?.data?.message || 'Could not save the menu.');
    } finally {
      setSaving(false);
    }
  };

  const confirmBack = () => {
    if (!dirty) {
      navigation.goBack();
      return;
    }
    Alert.alert('Discard changes?', 'Your menu edits have not been saved.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={confirmBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Edit Menu
            </Text>
            {!!tiffinTitle && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {tiffinTitle}
              </Text>
            )}
          </View>
        </View>

        {loadError ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={40} color="#64748B" />
            <Text style={styles.emptyTitle}>Could not load menu</Text>
            <Text style={styles.emptyText}>{loadError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadMenu}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          >
            {items.length === 0 && (
              <View style={styles.centered}>
                <Ionicons name="restaurant-outline" size={40} color="#64748B" />
                <Text style={styles.emptyTitle}>No dishes yet</Text>
                <Text style={styles.emptyText}>
                  Add the individual dishes included in this tiffin so customers know what they are
                  getting.
                </Text>
              </View>
            )}

            {items.map((dish, index) => (
              <View key={dish.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.dishIndex}>Dish {index + 1}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => reorder(index, -1)}
                      disabled={index === 0}
                      accessibilityRole="button"
                      accessibilityLabel={`Move dish ${index + 1} up`}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name="chevron-up"
                        size={18}
                        color={index === 0 ? '#334155' : '#94A3B8'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => reorder(index, 1)}
                      disabled={index === items.length - 1}
                      accessibilityRole="button"
                      accessibilityLabel={`Move dish ${index + 1} down`}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={18}
                        color={index === items.length - 1 ? '#334155' : '#94A3B8'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeDish(dish.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove dish ${index + 1}`}
                      style={styles.iconButton}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.photoBox}
                  onPress={() => pickPhoto(dish.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add photo for dish ${index + 1}`}
                >
                  {uploadingId === dish.id ? (
                    <ActivityIndicator color={Colors.primary} />
                  ) : dish.image ? (
                    <Image source={{ uri: dish.image }} style={styles.photo} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="camera-outline" size={22} color="#64748B" />
                      <Text style={styles.photoText}>Add photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Dish Name *</Text>
                <TextInput
                  style={styles.input}
                  value={dish.name}
                  onChangeText={(t) => updateItem(dish.id, { name: t })}
                  placeholder="e.g. Paneer Butter Masala"
                  placeholderTextColor="#475569"
                  maxLength={80}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={dish.description}
                  onChangeText={(t) => updateItem(dish.id, { description: t })}
                  placeholder="Short description of this dish"
                  placeholderTextColor="#475569"
                  multiline
                  maxLength={200}
                />

                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.chipRow}>
                  {DISH_CATEGORIES.map((cat: DishCategory) => {
                    const selected = dish.category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.chip, selected && styles.chipSelected]}
                        onPress={() => updateItem(dish.id, { category: cat })}
                        accessibilityRole="button"
                        accessibilityLabel={`Category ${cat}`}
                      >
                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.inputLabel}>Tags</Text>
                <View style={styles.chipRow}>
                  {DISH_TAGS.map((tag) => {
                    const selected = dish.tags.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        style={[styles.chip, selected && styles.chipSelected]}
                        onPress={() => toggleTag(dish.id, tag)}
                        accessibilityRole="button"
                        accessibilityLabel={`Tag ${tag}`}
                      >
                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={addDish}
              accessibilityRole="button"
              accessibilityLabel="Add dish"
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add Dish</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, (saving || !dirty) && styles.saveButtonDisabled]}
            onPress={save}
            disabled={saving || !dirty}
            accessibilityRole="button"
            accessibilityLabel="Save menu"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <Text style={styles.saveButtonText}>
                {dirty ? `Save Menu (${items.length})` : 'Saved'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '700' },
  headerSubtitle: { color: '#64748B', fontSize: 12, marginTop: 2 },
  scroll: { flex: 1 },
  centered: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyText: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 6 },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  retryText: { color: Colors.primary, fontWeight: '700' },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dishIndex: { color: Colors.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBox: {
    height: 120,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center' },
  photoText: { color: '#64748B', fontSize: 12, marginTop: 6 },
  inputLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: { height: 70, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
  },
  chipSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}15` },
  chipText: { color: '#94A3B8', fontSize: 12, textTransform: 'capitalize' },
  chipTextSelected: { color: Colors.primary, fontWeight: '700' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  addButtonText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#0F172A', fontWeight: '800', fontSize: 15 },
});

export default MenuEditorScreen;
