import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  StatusBar,
  Image,
} from 'react-native';

import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParams } from '../../navigation/RootNavigator';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

type Props = { navigation: NativeStackNavigationProp<RootStackParams, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { login } = useAuth();
  const { error, warning } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const logoAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(logoAnim, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      warning('Missing Fields', 'Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      error(
        'Login Failed',
        err.response?.data?.message || 'Please check your credentials and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const logoScale = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const logoOpacity = logoAnim;

  return (
    <KeyboardAvoidingView style={S.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={C.background === '#111111' ? 'light-content' : 'dark-content'} />

      <Animated.View style={[S.brand, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <Image
          source={require('../../../assets/logo.png')}
          style={S.logoImage}
          resizeMode="contain"
        />
        <Text style={S.appName}>tiffo</Text>
        <Text style={S.tagline}>Homemade meals, delivered daily</Text>
      </Animated.View>

      <View style={S.form}>
        <Text style={S.formTitle}>Welcome back</Text>
        <Text style={S.formSub}>Sign in to continue to your account</Text>

        <View style={[S.inputWrap, emailFocused && S.inputFocused]}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={emailFocused ? C.primary : C.textTertiary}
            style={S.inputIcon}
          />
          <TextInput
            style={S.input}
            placeholder="Email address"
            placeholderTextColor={C.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>

        <View style={[S.inputWrap, passFocused && S.inputFocused]}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={passFocused ? C.primary : C.textTertiary}
            style={S.inputIcon}
          />
          <TextInput
            style={S.input}
            placeholder="Password"
            placeholderTextColor={C.textTertiary}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPassFocused(true)}
            onBlur={() => setPassFocused(false)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={C.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={S.forgot}>
          <Text style={S.forgotTxt}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[S.loginBtn, loading && S.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={S.loginBtnTxt}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/*
        <View style={S.dividerRow}>
          <View style={S.dividerLine} />
          <Text style={S.dividerTxt}>or continue with</Text>
          <View style={S.dividerLine} />
        </View>
        */}

        {/* TODO: Implement Google Auth
        <TouchableOpacity style={S.socialBtn}>
          <Ionicons name="logo-google" size={20} color={C.textPrimary} />
          <Text style={S.socialTxt}>Continue with Google</Text>
        </TouchableOpacity>
        */}

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={S.switchRow}>
          <Text style={S.switchTxt}>Don't have an account? </Text>
          <Text style={S.switchCta}>Create one</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: C.background },
    brand: { alignItems: 'center', paddingTop: 64, paddingBottom: 32 },
    logoImage: {
      width: 72,
      height: 72,
      marginBottom: 14,
    },
    appName: { fontSize: 34, fontWeight: '800', color: C.textPrimary, letterSpacing: -1 },
    tagline: { fontSize: 13, color: C.textSecondary, marginTop: 4 },
    form: {
      flex: 1,
      backgroundColor: C.surfaceCard,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 28,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 8,
    },
    formTitle: { fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
    formSub: { fontSize: 13, color: C.textSecondary, marginBottom: 24 },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: C.border,
      paddingHorizontal: 14,
      paddingVertical: 13,
      marginBottom: 12,
    },
    inputFocused: { borderColor: C.primary, backgroundColor: C.primaryMuted },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: C.textPrimary },
    forgot: { alignSelf: 'flex-end', marginBottom: 20 },
    forgotTxt: { fontSize: 13, color: C.primary, fontWeight: '600' },
    loginBtn: {
      backgroundColor: C.primary,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    loginBtnDisabled: { backgroundColor: C.primaryLight },
    loginBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: C.divider },
    dividerTxt: { fontSize: 12, color: C.textTertiary, marginHorizontal: 12 },
    socialBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: C.border,
      padding: 14,
      marginBottom: 24,
    },
    socialTxt: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
    switchRow: { flexDirection: 'row', justifyContent: 'center' },
    switchTxt: { fontSize: 14, color: C.textSecondary },
    switchCta: { fontSize: 14, color: C.primary, fontWeight: '700' },
  });
