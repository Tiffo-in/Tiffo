import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../navigation/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Register'>;
};

const RegisterScreen = ({ navigation }: Props) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    try {
      setLoading(true);
      await register(name.trim(), email.trim().toLowerCase(), password, phone.trim());
    } catch (err: any) {
      Alert.alert(
        'Registration Failed',
        err.response?.data?.message || 'Could not create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account 🍱</Text>
          <Text style={styles.subtitle}>Join Tiffo and enjoy homemade meals</Text>
        </View>

        <View style={styles.formCard}>
          {[
            { label: 'Full Name', value: name, setter: setName, placeholder: 'Rishi Pandey', keyboardType: 'default', secure: false },
            { label: 'Email', value: email, setter: setEmail, placeholder: 'you@example.com', keyboardType: 'email-address', secure: false },
            { label: 'Phone', value: phone, setter: setPhone, placeholder: '+91 98765 43210', keyboardType: 'phone-pad', secure: false },
            { label: 'Password', value: password, setter: setPassword, placeholder: 'Min. 8 characters', keyboardType: 'default', secure: true },
          ].map((field) => (
            <View key={field.label} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#9CA3AF"
                keyboardType={field.keyboardType as any}
                autoCapitalize={field.label === 'Full Name' ? 'words' : 'none'}
                secureTextEntry={field.secure}
                value={field.value}
                onChangeText={field.setter}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.submitBtnText}>Create Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchLink}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchCta}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFF7ED' },
  container: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#1C1917' },
  subtitle: { fontSize: 15, color: '#78716C', marginTop: 6 },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#44403C', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#E7E5E4', borderRadius: 12, padding: 14,
    fontSize: 15, color: '#1C1917', backgroundColor: '#FAF9F7',
  },
  submitBtn: {
    backgroundColor: '#F97316', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#F97316', shadowOpacity: 0.4, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  submitBtnDisabled: { backgroundColor: '#FDBA74' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  switchLink: { marginTop: 20, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#78716C' },
  switchCta: { color: '#F97316', fontWeight: '700' },
});

export default RegisterScreen;
