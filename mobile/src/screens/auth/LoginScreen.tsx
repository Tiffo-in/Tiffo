import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../navigation/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Login'>;
};

const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      Alert.alert(
        'Login Failed',
        err.response?.data?.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo / Branding */}
        <View style={styles.brandArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🍱</Text>
          </View>
          <Text style={styles.appName}>Tiffo</Text>
          <Text style={styles.tagline}>Homemade meals, delivered daily</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formSubtitle}>Sign in to your account</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.loginBtnText}>Sign In</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.switchLink}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchCta}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFF7ED' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brandArea: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, shadowColor: '#F97316', shadowOpacity: 0.35,
    shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: 32, fontWeight: '800', color: '#1C1917' },
  tagline: { fontSize: 14, color: '#78716C', marginTop: 4 },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  formTitle: { fontSize: 22, fontWeight: '700', color: '#1C1917', marginBottom: 4 },
  formSubtitle: { fontSize: 14, color: '#78716C', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#44403C', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#E7E5E4', borderRadius: 12, padding: 14,
    fontSize: 15, color: '#1C1917', backgroundColor: '#FAF9F7',
  },
  loginBtn: {
    backgroundColor: '#F97316', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#F97316', shadowOpacity: 0.4, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  loginBtnDisabled: { backgroundColor: '#FDBA74' },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  switchLink: { marginTop: 20, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#78716C' },
  switchCta: { color: '#F97316', fontWeight: '700' },
});

export default LoginScreen;
