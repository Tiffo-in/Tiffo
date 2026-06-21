import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
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
      if (res.data?.success) {
        Alert.alert('Success', 'Tiffin Plan created successfully.');
        navigation.goBack();
      }
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
              Weekly and monthly rates will automatically calculate standard savings rates.
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
                      color={isChecked ? '#F59E0B' : '#64748B'}
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
    color: '#F59E0B',
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
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
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B15',
  },
  selectorChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  selectorChipTextSelected: {
    color: '#F59E0B',
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
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#F59E0B',
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
