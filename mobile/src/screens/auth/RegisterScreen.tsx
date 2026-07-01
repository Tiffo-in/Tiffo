import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParams } from '../../navigation/RootNavigator';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

type Props = { navigation: NativeStackNavigationProp<RootStackParams, 'Register'> };

const FIELDS = [
  {
    key: 'name',
    label: 'Full Name',
    placeholder: 'Rishi Pandey',
    icon: 'person-outline' as const,
    keyboard: 'default' as const,
    caps: 'words' as const,
    secure: false,
  },
  {
    key: 'email',
    label: 'Email Address',
    placeholder: 'you@example.com',
    icon: 'mail-outline' as const,
    keyboard: 'email-address' as const,
    caps: 'none' as const,
    secure: false,
  },
  {
    key: 'phone',
    label: 'Phone Number',
    placeholder: '+91 98765 43210',
    icon: 'call-outline' as const,
    keyboard: 'phone-pad' as const,
    caps: 'none' as const,
    secure: false,
  },
  {
    key: 'password',
    label: 'Password',
    placeholder: 'Min. 8 characters',
    icon: 'lock-closed-outline' as const,
    keyboard: 'default' as const,
    caps: 'none' as const,
    secure: true,
  },
];

export default function RegisterScreen({ navigation }: Props) {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { register } = useAuth();
  const { error, warning } = useAlert();
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');

  const set = (key: string, val: string) => setValues((v) => ({ ...v, [key]: val }));

  const handleRegister = async () => {
    const nameTrim = values.name.trim();
    const emailTrim = values.email.trim().toLowerCase();
    const phoneTrim = values.phone.trim();
    const password = values.password;

    if (!nameTrim || !emailTrim || !password) {
      warning('Missing Fields', 'Please fill in Name, Email and Password.');
      return;
    }
    if (nameTrim.length < 2) {
      warning('Invalid Name', 'Name must be at least 2 characters long.');
      return;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(emailTrim)) {
      warning('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (phoneTrim && !phoneRegex.test(phoneTrim)) {
      warning('Invalid Phone', 'Please enter a valid 10-digit Indian phone number.');
      return;
    }
    if (password.length < 8) {
      warning('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    try {
      setLoading(true);
      await register(nameTrim, emailTrim, password, phoneTrim);
    } catch (err: any) {
      error(
        'Registration Failed',
        err.response?.data?.message || err.message || 'Could not create account.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={S.safe}>
      <KeyboardAvoidingView style={S.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={S.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={S.topHeader}>
            <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={S.header}>
            <Image
              source={require('../../../assets/logo.png')}
              style={S.logoImage}
              resizeMode="contain"
            />
            <Text style={S.title}>Create your account</Text>
            <Text style={S.subtitle}>Join thousands enjoying homemade meals daily</Text>
          </View>

          {/* Benefits strip */}
          <View style={S.benefitsRow}>
            {[
              { label: 'Daily fresh', icon: 'restaurant-outline' as const },
              { label: 'Free delivery', icon: 'bicycle-outline' as const },
              { label: 'Pause anytime', icon: 'pause-circle-outline' as const },
            ].map((b) => (
              <View
                key={b.label}
                style={[
                  S.benefit,
                  { flexDirection: 'row', gap: 4, justifyContent: 'center', alignItems: 'center' },
                ]}
              >
                <Ionicons name={b.icon} size={12} color={C.primary} />
                <Text style={S.benefitTxt}>{b.label}</Text>
              </View>
            ))}
          </View>

          <View style={S.form}>
            {FIELDS.map((f) => (
              <View key={f.key} style={S.fieldWrap}>
                <Text style={S.label}>{f.label}</Text>
                <View style={[S.inputWrap, focused === f.key && S.inputFocused]}>
                  <Ionicons
                    name={f.icon}
                    size={18}
                    color={focused === f.key ? C.primary : C.textTertiary}
                    style={S.inputIcon}
                  />
                  <TextInput
                    style={S.input}
                    placeholder={f.placeholder}
                    placeholderTextColor={C.textTertiary}
                    keyboardType={f.keyboard}
                    autoCapitalize={f.caps}
                    secureTextEntry={f.secure && !showPass}
                    value={(values as any)[f.key]}
                    onChangeText={(v: string) => set(f.key, v)}
                    onFocus={() => setFocused(f.key)}
                    onBlur={() => setFocused('')}
                  />
                  {f.secure && (
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                      <Ionicons
                        name={showPass ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={C.textTertiary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[S.submitBtn, loading && S.submitDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={S.submitTxt}>Create Account</Text>
              )}
            </TouchableOpacity>

            <Text style={S.terms}>
              By creating an account, you agree to our{' '}
              <Text style={{ color: C.primary }}>Terms</Text> &{' '}
              <Text style={{ color: C.primary }}>Privacy Policy</Text>
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={S.switchRow}>
              <Text style={S.switchTxt}>Already have an account? </Text>
              <Text style={S.switchCta}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.background },
    flex: { flex: 1 },
    scroll: { flexGrow: 1, paddingBottom: 40 },
    topHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: C.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: { alignItems: 'center', paddingTop: 12, paddingBottom: 20, paddingHorizontal: 24 },
    logoImage: {
      width: 60,
      height: 60,
      marginBottom: 14,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: C.textPrimary,
      textAlign: 'center',
      marginBottom: 6,
    },
    subtitle: { fontSize: 13, color: C.textSecondary, textAlign: 'center' },
    benefitsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20, gap: 8 },
    benefit: {
      flex: 1,
      backgroundColor: C.primaryMuted,
      borderRadius: 10,
      paddingVertical: 8,
      alignItems: 'center',
    },
    benefitTxt: { fontSize: 11, fontWeight: '600', color: C.primary, textAlign: 'center' },
    form: { paddingHorizontal: 16 },
    fieldWrap: { marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '600', color: C.textPrimary, marginBottom: 6 },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: C.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    inputFocused: { borderColor: C.primary, backgroundColor: C.primaryMuted },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: C.textPrimary },
    submitBtn: {
      backgroundColor: C.primary,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    submitDisabled: { backgroundColor: C.primaryLight },
    submitTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
    terms: {
      fontSize: 12,
      color: C.textTertiary,
      textAlign: 'center',
      marginTop: 16,
      lineHeight: 18,
    },
    switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    switchTxt: { fontSize: 14, color: C.textSecondary },
    switchCta: { fontSize: 14, color: C.primary, fontWeight: '700' },
  });
