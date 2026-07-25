import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
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

import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { captureError } from '../../services/observability';
import { useTheme } from '../../theme/useTheme';
import {
  FRAUD_TYPES,
  FraudType,
  MAX_DESCRIPTION,
  MAX_EVIDENCE,
  validateFraudReport,
} from '../../utils/fraud';

const ReportFraudScreen = () => {
  const navigation = useNavigation();
  const C = useTheme();
  const { user } = useAuth();
  const S = useMemo(() => createStyles(C), [C]);

  // Prefill from the signed-in account — the endpoint accepts anonymous
  // reports, but a signed-in user should not retype what we already know.
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [fraudType, setFraudType] = useState<FraudType | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const result = validateFraudReport({ name, email, fraudType, description });
    if (!result.valid) {
      Alert.alert('Check your report', result.message);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/fraud', {
        reporterName: name.trim(),
        reporterEmail: email.trim(),
        reporterPhone: phone.trim(),
        fraudType,
        partnerName: partnerName.trim(),
        orderId: orderId.trim(),
        description: description.trim(),
        evidence: evidence.trim(),
      });
      if (res.data?.success) {
        Alert.alert(
          'Report submitted',
          'Thank you. Our trust and safety team will review this and may contact you for more detail.',
          [{ text: 'Done', onPress: () => navigation.goBack() }],
        );
      }
    } catch (err: any) {
      captureError(err, { screen: 'ReportFraud' });
      Alert.alert(
        'Could not submit',
        err.response?.data?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={S.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={S.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={S.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Report an Issue</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={S.notice}>
            <Ionicons name="shield-checkmark-outline" size={18} color={C.primary} />
            <Text style={S.noticeText}>
              Reports are reviewed by our trust and safety team. For emergencies, contact local
              authorities first.
            </Text>
          </View>

          <Text style={S.sectionTitle}>What happened? *</Text>
          <View style={S.chipRow}>
            {FRAUD_TYPES.map((t) => {
              const selected = fraudType === t.value;
              return (
                <TouchableOpacity
                  key={t.value}
                  style={[S.chip, selected && S.chipSelected]}
                  onPress={() => setFraudType(t.value)}
                  accessibilityRole="button"
                  accessibilityLabel={t.label}
                >
                  <Text style={[S.chipText, selected && S.chipTextSelected]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={S.label}>Description *</Text>
          <TextInput
            style={[S.input, S.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what happened, with dates and details where possible."
            placeholderTextColor={C.textTertiary}
            multiline
            maxLength={MAX_DESCRIPTION}
          />
          <Text style={S.counter}>
            {description.length}/{MAX_DESCRIPTION}
          </Text>

          <Text style={S.label}>Kitchen / Partner name</Text>
          <TextInput
            style={S.input}
            value={partnerName}
            onChangeText={setPartnerName}
            placeholder="Which kitchen is this about?"
            placeholderTextColor={C.textTertiary}
          />

          <Text style={S.label}>Order ID</Text>
          <TextInput
            style={S.input}
            value={orderId}
            onChangeText={setOrderId}
            placeholder="If this relates to a specific order"
            placeholderTextColor={C.textTertiary}
            autoCapitalize="characters"
          />

          <Text style={S.label}>Supporting details</Text>
          <TextInput
            style={[S.input, S.textArea]}
            value={evidence}
            onChangeText={setEvidence}
            placeholder="Anything else that helps us investigate."
            placeholderTextColor={C.textTertiary}
            multiline
            maxLength={MAX_EVIDENCE}
          />

          <Text style={S.sectionTitle}>Your details</Text>
          <Text style={S.label}>Name *</Text>
          <TextInput
            style={S.input}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor={C.textTertiary}
          />

          <Text style={S.label}>Email *</Text>
          <TextInput
            style={S.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={C.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={S.label}>Phone</Text>
          <TextInput
            style={S.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Optional"
            placeholderTextColor={C.textTertiary}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[S.submitButton, submitting && S.buttonDisabled]}
            onPress={submit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Submit report"
          >
            {submitting ? (
              <ActivityIndicator size="small" color={C.textInverse} />
            ) : (
              <Text style={S.submitText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    notice: {
      flexDirection: 'row',
      gap: 10,
      padding: 12,
      borderRadius: 10,
      backgroundColor: C.primaryMuted,
      marginBottom: 8,
    },
    noticeText: { flex: 1, color: C.textSecondary, fontSize: 12, lineHeight: 17 },
    sectionTitle: {
      color: C.textPrimary,
      fontSize: 15,
      fontWeight: '700',
      marginTop: 20,
      marginBottom: 10,
    },
    label: {
      color: C.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 14,
      marginBottom: 6,
    },
    input: {
      backgroundColor: C.surfaceCard,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: C.border,
      color: C.textPrimary,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 14,
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    counter: { color: C.textTertiary, fontSize: 11, textAlign: 'right', marginTop: 4 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surfaceCard,
      minHeight: 44,
      justifyContent: 'center',
    },
    chipSelected: { borderColor: C.primary, backgroundColor: C.primaryMuted },
    chipText: { color: C.textSecondary, fontSize: 13 },
    chipTextSelected: { color: C.primary, fontWeight: '700' },
    submitButton: {
      backgroundColor: C.primary,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 28,
    },
    buttonDisabled: { opacity: 0.6 },
    submitText: { color: C.textInverse, fontWeight: '800', fontSize: 15 },
  });

export default ReportFraudScreen;
