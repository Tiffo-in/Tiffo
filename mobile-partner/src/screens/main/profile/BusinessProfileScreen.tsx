import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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

import api from '../../../services/api';

const BusinessProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState('5');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/partner/profile');
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setBusinessName(data.businessName || '');
        setDescription(data.description || '');
        setPhone(data.contact?.phone || '');
        setEmail(data.contact?.email || '');
        setWhatsapp(data.contact?.whatsapp || '');
        setStreet(data.address?.street || '');
        setCity(data.address?.city || '');
        setStateName(data.address?.state || '');
        setPincode(data.address?.pincode || '');
        setOpenTime(data.businessHours?.open || '');
        setCloseTime(data.businessHours?.close || '');
        setDeliveryRadius(String(data.deliveryRadius ?? '5'));
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!businessName.trim()) {
      Alert.alert('Validation Error', 'Business Name is required.');
      return;
    }

    try {
      setSaving(true);
      const body = {
        businessName,
        description,
        contact: {
          phone,
          email,
          whatsapp,
        },
        address: {
          street,
          city,
          state: stateName,
          pincode,
        },
        businessHours: {
          open: openTime,
          close: closeTime,
        },
        deliveryRadius: Number(deliveryRadius) || 5,
      };

      const res = await api.put('/partner/profile', body);
      if (res.data?.success) {
        Alert.alert('Success', 'Business Profile updated successfully.');
        navigation.goBack();
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Business Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        >
          {/* Card 1: Basic Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Information</Text>

            <Text style={styles.inputLabel}>Business / Kitchen Name *</Text>
            <TextInput
              style={styles.input}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="e.g. Healthy Bites Kitchen"
              placeholderTextColor="#475569"
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your kitchen, specialities, etc."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Card 2: Contact Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact Details</Text>

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#475569"
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="e.g. kitchen@tiffo.in"
              placeholderTextColor="#475569"
            />

            <Text style={styles.inputLabel}>WhatsApp Number</Text>
            <TextInput
              style={styles.input}
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#475569"
            />
          </View>

          {/* Card 3: Address */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kitchen Address</Text>

            <Text style={styles.inputLabel}>Street / Area</Text>
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="e.g. Flat 101, Main Road"
              placeholderTextColor="#475569"
            />

            <Text style={styles.inputLabel}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Mumbai"
              placeholderTextColor="#475569"
            />

            <Text style={styles.inputLabel}>State</Text>
            <TextInput
              style={styles.input}
              value={stateName}
              onChangeText={setStateName}
              placeholder="e.g. Maharashtra"
              placeholderTextColor="#475569"
            />

            <Text style={styles.inputLabel}>Pincode</Text>
            <TextInput
              style={styles.input}
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              placeholder="e.g. 400001"
              placeholderTextColor="#475569"
            />
          </View>

          {/* Card 4: Operating details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kitchen Operations</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Open Time</Text>
                <TextInput
                  style={styles.input}
                  value={openTime}
                  onChangeText={setOpenTime}
                  placeholder="e.g. 08:00 AM"
                  placeholderTextColor="#475569"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Close Time</Text>
                <TextInput
                  style={styles.input}
                  value={closeTime}
                  onChangeText={setCloseTime}
                  placeholder="e.g. 10:00 PM"
                  placeholderTextColor="#475569"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Delivery Radius (km)</Text>
            <TextInput
              style={styles.input}
              value={deliveryRadius}
              onChangeText={setDeliveryRadius}
              keyboardType="numeric"
              placeholder="e.g. 5"
              placeholderTextColor="#475569"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#0F172A"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
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
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    paddingLeft: 8,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
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

export default BusinessProfileScreen;
