import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

export default function EditProfileScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const nav = useNavigation();
  const { user, updateProfile } = useAuth();
  const { success, error: showCustomError } = useAlert();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(false);
    setLoading(true);
    try {
      await updateProfile(name.trim(), phone.trim(), user?.address);
      success('Success', 'Profile updated successfully!', () => nav.goBack());
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      showCustomError('Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={S.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={S.scroll} keyboardShouldPersistTaps="handled">
          <View style={S.headerTextContainer}>
            <Text style={S.title}>Update Personal Details</Text>
            <Text style={S.subtitle}>Keep your contact information up to date</Text>
          </View>

          {/* Form */}
          <View style={S.formCard}>
            {/* Name Input */}
            <View style={S.inputGroup}>
              <Text style={S.label}>FULL NAME</Text>
              <View style={[S.inputWrapper, errors.name && S.inputWrapperError]}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={C.textSecondary}
                  style={S.inputIcon}
                />
                <TextInput
                  style={S.input}
                  placeholder="Enter full name"
                  placeholderTextColor={C.textTertiary}
                  value={name}
                  onChangeText={(txt: string) => {
                    setName(txt);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.name && <Text style={S.errorText}>{errors.name}</Text>}
            </View>

            {/* Email Input (Read Only) */}
            <View style={S.inputGroup}>
              <Text style={S.label}>EMAIL ADDRESS (READ ONLY)</Text>
              <View style={[S.inputWrapper, S.inputWrapperDisabled]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={C.textTertiary}
                  style={S.inputIcon}
                />
                <TextInput
                  style={[S.input, S.inputDisabled]}
                  value={user?.email}
                  editable={false}
                  selectTextOnFocus={false}
                />
              </View>
              <Text style={S.hintText}>
                Email cannot be changed as it is tied to your account security.
              </Text>
            </View>

            {/* Phone Input */}
            <View style={S.inputGroup}>
              <Text style={S.label}>PHONE NUMBER</Text>
              <View style={[S.inputWrapper, errors.phone && S.inputWrapperError]}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={C.textSecondary}
                  style={S.inputIcon}
                />
                <TextInput
                  style={S.input}
                  placeholder="10-digit phone number"
                  placeholderTextColor={C.textTertiary}
                  value={phone}
                  onChangeText={(txt: string) => {
                    setPhone(txt.replace(/[^0-9]/g, ''));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {errors.phone && <Text style={S.errorText}>{errors.phone}</Text>}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={S.saveButton}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={S.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.background },
    scroll: { padding: 20 },
    headerTextContainer: { marginBottom: 24 },
    title: { fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
    subtitle: { fontSize: 13, color: C.textSecondary },
    formCard: {
      backgroundColor: C.surfaceCard,
      borderRadius: 18,
      padding: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    inputGroup: { marginBottom: 20 },
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: C.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: C.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor: C.background,
      height: 52,
    },
    inputWrapperError: { borderColor: C.error },
    inputWrapperDisabled: { borderColor: C.border, backgroundColor: C.borderLight },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: C.textPrimary, fontSize: 15, fontWeight: '500' },
    inputDisabled: { color: C.textTertiary },
    errorText: { fontSize: 11, color: C.error, marginTop: 6, fontWeight: '600' },
    hintText: { fontSize: 11, color: C.textTertiary, marginTop: 6 },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.primary,
      borderRadius: 14,
      height: 54,
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 6,
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  });
