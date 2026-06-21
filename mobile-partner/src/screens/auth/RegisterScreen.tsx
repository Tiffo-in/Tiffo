import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'Register'> };

const RegisterScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !name.trim() ||
      !businessName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !phone.trim() ||
      !street.trim() ||
      !city.trim() ||
      !stateName.trim() ||
      !pincode.trim()
    ) {
      Alert.alert('Missing Fields', 'Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      const body = {
        name: name.trim(),
        businessName: businessName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        address: {
          street: street.trim(),
          city: city.trim(),
          state: stateName.trim(),
          pincode: pincode.trim(),
        },
      };

      const res = await api.post('/auth/register/partner', body);
      if (res.data?.success) {
        Alert.alert(
          'Registration Successful',
          'Please check your email to verify your partner account before signing in.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Registration Failed',
        err.response?.data?.message || err.message || 'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Partner Registration</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create Kitchen Account</Text>
            <Text style={styles.formSubtitle}>Join the Tiffo partner network</Text>

            {/* Section: Basic info */}
            <Text style={styles.sectionHeader}>Kitchen Details</Text>

            <Text style={styles.label}>Owner Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Business / Kitchen Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Healthy Bites Kitchen"
              placeholderTextColor="#64748B"
              value={businessName}
              onChangeText={setBusinessName}
            />

            {/* Section: Credentials */}
            <Text style={styles.sectionHeader}>Account Credentials</Text>

            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="kitchen@example.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Create password"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Section: Location */}
            <Text style={styles.sectionHeader}>Kitchen Address</Text>

            <Text style={styles.label}>Street / Area *</Text>
            <TextInput
              style={styles.input}
              placeholder="Flat 101, Main Street"
              placeholderTextColor="#64748B"
              value={street}
              onChangeText={setStreet}
            />

            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="Mumbai"
              placeholderTextColor="#64748B"
              value={city}
              onChangeText={setCity}
            />

            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              placeholder="Maharashtra"
              placeholderTextColor="#64748B"
              value={stateName}
              onChangeText={setStateName}
            />

            <Text style={styles.label}>Pincode *</Text>
            <TextInput
              style={styles.input}
              placeholder="400001"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              value={pincode}
              onChangeText={setPincode}
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.registerBtnText}>Submit Registration</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.signInLink}
            >
              <Text style={styles.signInLinkLabel}>Already registered? Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  flex: { flex: 1, backgroundColor: '#0F172A' },
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
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  container: { flexGrow: 1, padding: 20 },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  formSubtitle: { fontSize: 12, color: '#94A3B8', marginBottom: 20 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 20,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    paddingLeft: 6,
  },
  label: { fontSize: 12, fontWeight: '600', color: '#CBD5E1', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#F8FAFC',
  },
  registerBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
    elevation: 4,
  },
  registerBtnDisabled: { backgroundColor: '#92400E' },
  registerBtnText: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  signInLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  signInLinkLabel: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default RegisterScreen;
