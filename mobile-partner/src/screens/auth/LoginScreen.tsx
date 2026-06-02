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
  Image,
} from 'react-native';

import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParams } from '../../navigation/RootNavigator';

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'Login'> };

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
        err.message || err.response?.data?.message || 'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Tiffo Partner</Text>
          <Text style={styles.tagline}>Kitchen Partner Dashboard</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Partner Sign In</Text>
          <Text style={styles.formSubtitle}>Access your kitchen dashboard</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="partner@example.com"
            placeholderTextColor="#64748B"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Your password"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In to Dashboard</Text>
            )}
          </TouchableOpacity>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              This app is exclusively for registered Tiffo kitchen partners. To join as a partner,
              visit our website.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0F172A' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 36 },
  logoImage: {
    width: 88,
    height: 88,
    marginBottom: 16,
  },
  appName: { fontSize: 28, fontWeight: '800', color: '#F8FAFC' },
  tagline: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formTitle: { fontSize: 20, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  formSubtitle: { fontSize: 13, color: '#94A3B8', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#CBD5E1', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#F8FAFC',
  },
  loginBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
  },
  loginBtnDisabled: { backgroundColor: '#92400E' },
  loginBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  noteBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  noteText: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },
});

export default LoginScreen;
