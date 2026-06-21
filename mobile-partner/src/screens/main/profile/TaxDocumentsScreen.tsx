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

const TaxDocumentsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [fssai, setFssai] = useState('');
  const [gst, setGst] = useState('');
  const [pan, setPan] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/partner/profile');
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setFssai(data.documents?.fssai || '');
        setGst(data.documents?.gst || '');
        setPan(data.documents?.pan || '');
        setVerified(!!data.verified);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch tax documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fssai.trim() && !pan.trim()) {
      Alert.alert('Validation Error', 'FSSAI License and PAN are required for verification.');
      return;
    }

    try {
      setSaving(true);
      const body = {
        documents: {
          fssai,
          gst,
          pan,
        },
      };

      const res = await api.put('/partner/profile', body);
      if (res.data?.success) {
        Alert.alert('Success', 'Tax documents updated successfully.');
        navigation.goBack();
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update documents.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading Documents...</Text>
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
          <Text style={styles.headerTitle}>Tax Documents</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        >
          {/* Doc Header Status Banner */}
          <View style={[styles.docBanner, verified ? styles.verifiedBg : styles.pendingBg]}>
            <Ionicons
              name={verified ? 'shield-checkmark' : 'shield-outline'}
              size={24}
              color={verified ? '#10B981' : '#F59E0B'}
            />
            <View style={styles.docBannerContent}>
              <Text
                style={[styles.docBannerTitle, verified ? styles.verifiedText : styles.pendingText]}
              >
                {verified ? 'FSSAI & KYC Approved' : 'KYC Under Verification'}
              </Text>
              <Text style={styles.docBannerSub}>
                {verified
                  ? 'Your kitchen is legally verified and active for customer orders.'
                  : 'Submit your FSSAI license and PAN card to activate order payments.'}
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Verify Identities</Text>

            {/* FSSAI */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>FSSAI License Number *</Text>
                {fssai.length === 14 && (
                  <View style={styles.inlineVerifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    <Text style={styles.inlineVerifiedText}>14 Digits</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={styles.input}
                value={fssai}
                onChangeText={setFssai}
                keyboardType="number-pad"
                maxLength={14}
                placeholder="14-digit FSSAI License Number"
                placeholderTextColor="#475569"
              />
              <Text style={styles.inputHelpText}>Required to serve cooked meals commercially.</Text>
            </View>

            {/* PAN Card */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Permanent Account Number (PAN) *</Text>
                {pan.length === 10 && (
                  <View style={styles.inlineVerifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    <Text style={styles.inlineVerifiedText}>Valid Format</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={[styles.input, { textTransform: 'uppercase' }]}
                value={pan}
                onChangeText={(val) => setPan(val.toUpperCase())}
                maxLength={10}
                autoCapitalize="characters"
                placeholder="10-character PAN Card Number"
                placeholderTextColor="#475569"
              />
              <Text style={styles.inputHelpText}>
                Required for tax deductions and payout invoicing.
              </Text>
            </View>

            {/* GST (Optional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>GSTIN (Optional)</Text>
              <TextInput
                style={[styles.input, { textTransform: 'uppercase' }]}
                value={gst}
                onChangeText={(val) => setGst(val.toUpperCase())}
                maxLength={15}
                autoCapitalize="characters"
                placeholder="15-character GST Registration Number"
                placeholderTextColor="#475569"
              />
              <Text style={styles.inputHelpText}>
                Provide GST details to claim input credit if registered.
              </Text>
            </View>
          </View>

          {/* Secure note */}
          <View style={styles.secureDetailsBox}>
            <Ionicons
              name="lock-closed"
              size={16}
              color="#64748B"
              style={{ marginRight: 8, marginTop: 2 }}
            />
            <Text style={styles.secureDetailsText}>
              All document numbers are encrypted and processed through secured channels. We share
              KYC data only with certified validation authorities.
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={20}
                  color="#0F172A"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveButtonText}>Submit Documents</Text>
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
  docBanner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  verifiedBg: {
    backgroundColor: '#064E3B',
    borderColor: '#065F46',
  },
  pendingBg: {
    backgroundColor: '#451A03',
    borderColor: '#78350F',
  },
  docBannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  docBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  verifiedText: {
    color: '#10B981',
  },
  pendingText: {
    color: '#F59E0B',
  },
  docBannerSub: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
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
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    paddingLeft: 8,
  },
  inputContainer: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  inlineVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inlineVerifiedText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 3,
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
  inputHelpText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  secureDetailsBox: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20,
  },
  secureDetailsText: {
    flex: 1,
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

export default TaxDocumentsScreen;
