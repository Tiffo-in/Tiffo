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

const BankPaymentDetailsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [payoutEnabled, setPayoutEnabled] = useState(false);

  // Secure field toggle
  const [secureAccount, setSecureAccount] = useState(true);

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get('/partner/profile');
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setAccountHolderName(data.bankDetails?.accountHolderName || '');
        setAccountNumber(data.bankDetails?.accountNumber || '');
        setIfscCode(data.bankDetails?.ifscCode || '');
        setIsVerified(!!data.bankDetails?.verified);
        setPayoutEnabled(!!data.payoutEnabled);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch bank details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!accountHolderName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      Alert.alert('Validation Error', 'All bank fields are required.');
      return;
    }

    try {
      setSaving(true);
      const body = {
        bankDetails: {
          accountHolderName,
          accountNumber,
          ifscCode,
        },
      };

      const res = await api.put('/partner/profile', body);
      if (res.data?.success) {
        Alert.alert('Success', 'Bank details updated successfully.');
        navigation.goBack();
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update bank details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading Payment Settings...</Text>
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
          <Text style={styles.headerTitle}>Bank & Payments</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        >
          {/* Card Mockup for Bank Account */}
          <View style={styles.bankCardMockup}>
            <View style={styles.cardHeader}>
              <Text style={styles.bankTag}>TIFFO PARTNER PAYOUTS</Text>
              <Ionicons
                name="wifi"
                size={20}
                color="#F8FAFC"
                style={{ transform: [{ rotate: '90deg' }] }}
              />
            </View>

            <View style={styles.cardNumberSection}>
              <Text style={styles.cardHolderLabel}>ACCOUNT NUMBER</Text>
              <Text style={styles.cardNumberText}>
                {secureAccount
                  ? accountNumber.length > 4
                    ? `•••• •••• •••• ${accountNumber.slice(-4)}`
                    : accountNumber
                  : accountNumber || '•••• •••• •••• ••••'}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardHolderLabel}>ACCOUNT HOLDER</Text>
                <Text style={styles.cardHolderText}>
                  {accountHolderName.toUpperCase() || 'PARTNER NAME'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.cardHolderLabel}>IFSC CODE</Text>
                <Text style={styles.cardHolderText}>{ifscCode.toUpperCase() || 'IFSC CODE'}</Text>
              </View>
            </View>
          </View>

          {/* Status Section */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusItem, isVerified ? styles.verifiedBg : styles.pendingBg]}>
              <Ionicons
                name={isVerified ? 'checkmark-circle-outline' : 'time-outline'}
                size={16}
                color={isVerified ? '#10B981' : '#F59E0B'}
              />
              <Text
                style={[styles.statusText, isVerified ? styles.verifiedText : styles.pendingText]}
              >
                {isVerified ? 'Account Verified' : 'Verification Pending'}
              </Text>
            </View>

            <View style={[styles.statusItem, payoutEnabled ? styles.verifiedBg : styles.pendingBg]}>
              <Ionicons
                name={payoutEnabled ? 'flash-outline' : 'pause-circle-outline'}
                size={16}
                color={payoutEnabled ? '#10B981' : '#F59E0B'}
              />
              <Text
                style={[
                  styles.statusText,
                  payoutEnabled ? styles.verifiedText : styles.pendingText,
                ]}
              >
                {payoutEnabled ? 'Payouts Enabled' : 'Payouts On Hold'}
              </Text>
            </View>
          </View>

          {/* Form fields */}
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Update Bank Details</Text>

            <Text style={styles.inputLabel}>Account Holder Name</Text>
            <TextInput
              style={styles.input}
              value={accountHolderName}
              onChangeText={setAccountHolderName}
              placeholder="e.g. John Doe Kitchens"
              placeholderTextColor="#475569"
            />

            <Text style={styles.inputLabel}>Bank Account Number</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="number-pad"
                secureTextEntry={secureAccount}
                placeholder="e.g. 123456789012"
                placeholderTextColor="#475569"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setSecureAccount(!secureAccount)}
              >
                <Ionicons
                  name={secureAccount ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>IFSC Code</Text>
            <TextInput
              style={styles.input}
              value={ifscCode}
              onChangeText={(val) => setIfscCode(val.toUpperCase())}
              autoCapitalize="characters"
              placeholder="e.g. HDFC0001234"
              placeholderTextColor="#475569"
            />

            <View style={styles.alertNote}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#64748B"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.alertNoteText}>
                Changing bank details will temporarily hold automatic payouts until the new account
                is verified (usually within 24 hours).
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#0F172A"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveButtonText}>Securely Save Account</Text>
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
  bankCardMockup: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 20,
    height: 180,
    marginBottom: 20,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3730A3',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankTag: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  cardNumberSection: {
    marginVertical: 12,
  },
  cardNumberText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolderLabel: {
    color: '#6366F1',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardHolderText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    flex: 0.48,
    justifyContent: 'center',
  },
  verifiedBg: {
    backgroundColor: '#064E3B',
    borderColor: '#065F46',
  },
  verifiedText: {
    color: '#10B981',
  },
  pendingBg: {
    backgroundColor: '#451A03',
    borderColor: '#78350F',
  },
  pendingText: {
    color: '#F59E0B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formSectionTitle: {
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  alertNote: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  alertNoteText: {
    flex: 1,
    color: '#64748B',
    fontSize: 11,
    lineHeight: 15,
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

export default BankPaymentDetailsScreen;
