import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../navigation/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { ColorScheme } from '../../theme/colors';

type Props = { navigation: NativeStackNavigationProp<RootStackParams, 'Register'> };

const FIELDS = [
  { key: 'name',     label: 'Full Name',      placeholder: 'Rishi Pandey',       icon: 'person-outline' as const,      keyboard: 'default' as const,       caps: 'words' as const,  secure: false },
  { key: 'email',    label: 'Email Address',  placeholder: 'you@example.com',    icon: 'mail-outline' as const,        keyboard: 'email-address' as const, caps: 'none' as const,   secure: false },
  { key: 'phone',    label: 'Phone Number',   placeholder: '+91 98765 43210',    icon: 'call-outline' as const,        keyboard: 'phone-pad' as const,     caps: 'none' as const,   secure: false },
  { key: 'password', label: 'Password',       placeholder: 'Min. 8 characters',  icon: 'lock-closed-outline' as const, keyboard: 'default' as const,       caps: 'none' as const,   secure: true },
];

export default function RegisterScreen({ navigation }: Props) {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { register } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');

  const set = (key: string, val: string) => setValues((v) => ({ ...v, [key]: val }));

  const handleRegister = async () => {
    if (!values.name.trim() || !values.email.trim() || !values.password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in Name, Email and Password.'); return;
    }
    if (values.password.length < 8) { Alert.alert('Weak Password', 'Password must be at least 8 characters.'); return; }
    try {
      setLoading(true);
      await register(values.name.trim(), values.email.trim().toLowerCase(), values.password, values.phone.trim());
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Could not create account.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={S.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={S.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={S.topHeader}>
          <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={S.header}>
          <View style={S.logoMini}><Text style={{ fontSize: 28 }}>🍱</Text></View>
          <Text style={S.title}>Create your account</Text>
          <Text style={S.subtitle}>Join thousands enjoying homemade meals daily</Text>
        </View>

        {/* Benefits strip */}
        <View style={S.benefitsRow}>
          {['🍛 Daily fresh', '🚴 Free delivery', '⏸️ Pause anytime'].map((b) => (
            <View key={b} style={S.benefit}>
              <Text style={S.benefitTxt}>{b}</Text>
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
                  onChangeText={(v) => set(f.key, v)}
                  onFocus={() => setFocused(f.key)}
                  onBlur={() => setFocused('')}
                />
                {f.secure && (
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity style={[S.submitBtn, loading && S.submitDisabled]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={S.submitTxt}>Create Account</Text>}
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
  );
}

const createStyles = (C: ColorScheme) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.background },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  topHeader: { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingTop: 12, paddingBottom: 20, paddingHorizontal: 24 },
  logoMini: { width: 60, height: 60, borderRadius: 16, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: C.textSecondary, textAlign: 'center' },
  benefitsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20, gap: 8 },
  benefit: { flex: 1, backgroundColor: C.primaryMuted, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  benefitTxt: { fontSize: 11, fontWeight: '600', color: C.primary, textAlign: 'center' },
  form: { paddingHorizontal: 16 },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: C.textPrimary, marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12 },
  inputFocused: { borderColor: C.primary, backgroundColor: C.primaryMuted },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: C.textPrimary },
  submitBtn: { backgroundColor: C.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  submitDisabled: { backgroundColor: C.primaryLight },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  terms: { fontSize: 12, color: C.textTertiary, textAlign: 'center', marginTop: 16, lineHeight: 18 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  switchTxt: { fontSize: 14, color: C.textSecondary },
  switchCta: { fontSize: 14, color: C.primary, fontWeight: '700' },
});
