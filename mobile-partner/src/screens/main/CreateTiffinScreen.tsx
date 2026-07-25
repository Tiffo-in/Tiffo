import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  Switch,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '../../services/api';
import { Colors } from '../../theme/colors';
import {
  MAX_DISCOUNT_PERCENT,
  clampDiscount,
  computeEffectivePrice,
  expiryFromDays,
} from '../../utils/pricing';

const CreateTiffinScreen = () => {
  const navigation = useNavigation();
  const [saving, setSaving] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceDaily, setPriceDaily] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch');
  const [cuisine, setCuisine] = useState('');
  const [dietary, setDietary] = useState<string[]>(['vegetarian']);

  // Discount configuration (PATCH /tiffins/:id/discount after create)
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [weeklyDiscount, setWeeklyDiscount] = useState('');
  const [monthlyDiscount, setMonthlyDiscount] = useState('');
  const [saleLabel, setSaleLabel] = useState('');
  const [saleDurationDays, setSaleDurationDays] = useState<number | null>(null);

  const saleDurations = [
    { label: 'No expiry', value: null },
    { label: '7 days', value: 7 },
    { label: '14 days', value: 14 },
    { label: '30 days', value: 30 },
  ];

  // Live preview of what customers will actually pay. Mirrors the server's
  // effectivePrice virtual so the partner sees real numbers before saving.
  const pricePreview = useMemo(
    () =>
      computeEffectivePrice(Number(priceDaily), {
        weekly: Number(weeklyDiscount) || 0,
        monthly: Number(monthlyDiscount) || 0,
        isActive: discountEnabled,
        expiresAt: null, // preview shows the discount as if live now
      }),
    [priceDaily, weeklyDiscount, monthlyDiscount, discountEnabled],
  );

  const mealTypes = [
    { label: 'Breakfast', value: 'breakfast' as const },
    { label: 'Lunch', value: 'lunch' as const },
    { label: 'Dinner', value: 'dinner' as const },
    { label: 'Snacks', value: 'snacks' as const },
  ];

  const dietaryOptions = [
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Non-Vegetarian', value: 'non-vegetarian' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Jain', value: 'jain' },
    { label: 'Gluten-Free', value: 'gluten-free' },
  ];

  const toggleDietary = (val: string) => {
    if (dietary.includes(val)) {
      setDietary(dietary.filter((d) => d !== val));
    } else {
      setDietary([...dietary, val]);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !priceDaily.trim() || !cuisine.trim()) {
      Alert.alert('Validation Error', 'Please complete all required fields (*).');
      return;
    }

    const priceNum = Number(priceDaily);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price greater than 0.');
      return;
    }

    try {
      setSaving(true);
      const body = {
        title: title.trim(),
        description: description.trim(),
        price: {
          daily: priceNum,
          weekly: priceNum * 7,
          monthly: priceNum * 30,
        },
        mealType,
        cuisine: cuisine.trim(),
        dietary,
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          maxOrders: 100,
        },
        isActive: true,
      };

      const res = await api.post('/tiffins', body);
      if (!res.data?.success) return;

      // Discounts are a separate, server-validated endpoint (0-70%), so they
      // are applied after the tiffin exists.
      const tiffinId = res.data?.data?._id || res.data?.data?.id;
      if (discountEnabled && tiffinId) {
        try {
          await api.patch(`/tiffins/${tiffinId}/discount`, {
            weekly: clampDiscount(Number(weeklyDiscount) || 0),
            monthly: clampDiscount(Number(monthlyDiscount) || 0),
            isActive: true,
            label: saleLabel.trim(),
            expiresAt: expiryFromDays(saleDurationDays),
          });
        } catch (discountErr: any) {
          // The tiffin was created — don't lose that. Report the partial
          // failure so the partner knows to set the discount from the menu.
          Alert.alert(
            'Tiffin created, discount not applied',
            discountErr.response?.data?.message ||
              'Your tiffin was saved, but the discount could not be applied. You can set it again from the menu.',
          );
          navigation.goBack();
          return;
        }
      }

      Alert.alert('Success', 'Tiffin Plan created successfully.');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'Error',
        err.response?.data?.message || err.message || 'Failed to create tiffin.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Tiffin Plan</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        >
          {/* Card: Basic Details */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Tiffin Information</Text>

            <Text style={styles.inputLabel}>Tiffin Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Premium North Indian Executive Lunch"
              placeholderTextColor="#475569"
            />

            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the items in this tiffin plan (e.g. 4 Roti, 1 Paneer Sabji, Dal Tadka, Jeera Rice, Salad, Pickle)..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Card: Pricing & Operations */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Pricing & Cuisine</Text>

            <Text style={styles.inputLabel}>Daily Price (₹) *</Text>
            <TextInput
              style={styles.input}
              value={priceDaily}
              onChangeText={setPriceDaily}
              keyboardType="numeric"
              placeholder="e.g. 150"
              placeholderTextColor="#475569"
            />
            <Text style={styles.priceHelpText}>
              Weekly and monthly rates are calculated as 7x and 30x the daily price.
            </Text>

            <Text style={styles.inputLabel}>Cuisine Category *</Text>
            <TextInput
              style={styles.input}
              value={cuisine}
              onChangeText={setCuisine}
              placeholder="e.g. North Indian, South Indian, Bengali"
              placeholderTextColor="#475569"
            />
          </View>

          {/* Card: Promotional Discount */}
          <View style={styles.card}>
            <View style={styles.discountHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardSectionTitle}>Promotional Discount</Text>
                <Text style={styles.cardSubtitle}>Run a sale on weekly and monthly plans.</Text>
              </View>
              <Switch
                value={discountEnabled}
                onValueChange={setDiscountEnabled}
                trackColor={{ false: '#0F172A', true: `${Colors.primary}30` }}
                thumbColor={discountEnabled ? Colors.primary : '#64748B'}
                accessibilityLabel="Enable promotional discount"
              />
            </View>

            {discountEnabled && (
              <>
                <Text style={styles.inputLabel}>Weekly Discount (%)</Text>
                <TextInput
                  style={styles.input}
                  value={weeklyDiscount}
                  onChangeText={(t) => setWeeklyDiscount(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder={`0 - ${MAX_DISCOUNT_PERCENT}`}
                  placeholderTextColor="#475569"
                  maxLength={2}
                />

                <Text style={styles.inputLabel}>Monthly Discount (%)</Text>
                <TextInput
                  style={styles.input}
                  value={monthlyDiscount}
                  onChangeText={(t) => setMonthlyDiscount(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder={`0 - ${MAX_DISCOUNT_PERCENT}`}
                  placeholderTextColor="#475569"
                  maxLength={2}
                />

                <Text style={styles.inputLabel}>Sale Label (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={saleLabel}
                  onChangeText={setSaleLabel}
                  placeholder="e.g. Summer Offer"
                  placeholderTextColor="#475569"
                  maxLength={40}
                />

                <Text style={styles.inputLabel}>Sale Duration</Text>
                <View style={styles.selectorRow}>
                  {saleDurations.map((d) => {
                    const isSelected = saleDurationDays === d.value;
                    return (
                      <TouchableOpacity
                        key={d.label}
                        style={[styles.selectorChip, isSelected && styles.selectorChipSelected]}
                        onPress={() => setSaleDurationDays(d.value)}
                        accessibilityRole="button"
                        accessibilityLabel={`Sale duration ${d.label}`}
                      >
                        <Text
                          style={[
                            styles.selectorChipText,
                            isSelected && styles.selectorChipTextSelected,
                          ]}
                        >
                          {d.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Live preview — mirrors the server's effectivePrice math */}
                {pricePreview.daily > 0 && (
                  <View style={styles.pricePreview}>
                    <Text style={styles.pricePreviewTitle}>Customer pays</Text>
                    <View style={styles.pricePreviewRow}>
                      <Text style={styles.pricePreviewLabel}>Weekly</Text>
                      <View style={styles.pricePreviewValues}>
                        {pricePreview.weeklyDiscountPercent > 0 && (
                          <Text style={styles.priceStrikethrough}>
                            ₹{pricePreview.weeklyOriginal}
                          </Text>
                        )}
                        <Text style={styles.priceFinal}>₹{pricePreview.weekly}</Text>
                      </View>
                    </View>
                    <View style={styles.pricePreviewRow}>
                      <Text style={styles.pricePreviewLabel}>Monthly</Text>
                      <View style={styles.pricePreviewValues}>
                        {pricePreview.monthlyDiscountPercent > 0 && (
                          <Text style={styles.priceStrikethrough}>
                            ₹{pricePreview.monthlyOriginal}
                          </Text>
                        )}
                        <Text style={styles.priceFinal}>₹{pricePreview.monthly}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Card: Meal Type Select */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Meal Schedule</Text>
            <Text style={styles.cardSubtitle}>Select when this tiffin is served:</Text>

            <View style={styles.selectorRow}>
              {mealTypes.map((type) => {
                const isSelected = mealType === type.value;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.selectorChip, isSelected && styles.selectorChipSelected]}
                    onPress={() => setMealType(type.value)}
                  >
                    <Text
                      style={[
                        styles.selectorChipText,
                        isSelected && styles.selectorChipTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Card: Dietary Info Checkbox */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Dietary Classifications</Text>
            <Text style={styles.cardSubtitle}>Select all tags that apply:</Text>

            <View style={styles.dietaryGrid}>
              {dietaryOptions.map((opt) => {
                const isChecked = dietary.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.checkboxRow, isChecked && styles.checkboxRowChecked]}
                    onPress={() => toggleDietary(opt.value)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isChecked ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isChecked ? '#FF7A18' : '#64748B'}
                    />
                    <Text style={[styles.checkboxLabel, isChecked && styles.checkboxLabelChecked]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleCreate} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <>
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color="#0F172A"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveButtonText}>Publish Tiffin Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF7A18',
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF7A18',
    paddingLeft: 8,
  },
  cardSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#F8FAFC',
  },
  priceHelpText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  discountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pricePreview: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pricePreviewTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pricePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  pricePreviewLabel: {
    color: '#F8FAFC',
    fontSize: 13,
  },
  pricePreviewValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceStrikethrough: {
    color: '#64748B',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  priceFinal: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  selectorChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    margin: 4,
  },
  selectorChipSelected: {
    borderColor: '#FF7A18',
    backgroundColor: '#FF7A1815',
  },
  selectorChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  selectorChipTextSelected: {
    color: '#FF7A18',
  },
  dietaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: 8,
  },
  checkboxRowChecked: {},
  checkboxLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    marginLeft: 8,
  },
  checkboxLabelChecked: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF7A18',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#FF7A18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default CreateTiffinScreen;
