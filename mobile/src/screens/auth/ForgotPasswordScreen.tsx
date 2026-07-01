import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '../../contexts/AlertContext';
import { RootStackParams } from '../../navigation/RootNavigator';
import authService from '../../services/authService';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

type Props = { navigation: NativeStackNavigationProp<RootStackParams, 'ForgotPassword'> };

export default function ForgotPasswordScreen({ navigation }: Props) {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { error, warning } = useAlert();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [sent]);

  const handleResetRequest = async () => {
    if (!email.trim()) {
      warning('Missing Email', 'Please enter your email address.');
      return;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      warning('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: any) {
      error(
        'Request Failed',
        err.response?.data?.message ||
          err.message ||
          'Failed to send recovery email. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const opacity = anim;

  return (
    <SafeAreaView style={S.safe}>
      <KeyboardAvoidingView style={S.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <StatusBar barStyle={C.background === '#111111' ? 'light-content' : 'dark-content'} />

        <View style={S.topHeader}>
          <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={S.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!sent ? (
            <Animated.View style={[S.container, { transform: [{ scale }], opacity }]}>
              <View style={S.brand}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={S.logoImage}
                  resizeMode="contain"
                />
                <Text style={S.appName}>Forgot Password</Text>
                <Text style={S.tagline}>No worries, we will help you recover it</Text>
              </View>

              <View style={S.form}>
                <Text style={S.formTitle}>Recover Account</Text>
                <Text style={S.formSub}>
                  Enter the email address associated with your account and we'll send you a password
                  reset link.
                </Text>

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

                <TouchableOpacity
                  style={[S.btn, loading && S.btnDisabled]}
                  onPress={handleResetRequest}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={S.btnTxt}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} style={S.backLink}>
                  <Text style={S.backLinkTxt}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            <Animated.View style={[S.successContainer, { transform: [{ scale }], opacity }]}>
              <View style={S.successIconWrap}>
                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
              </View>
              <Text style={S.successTitle}>Check Your Email</Text>
              <Text style={S.successSub}>
                We've sent a password reset link to: {'\n'}
                <Text style={S.successEmail}>{email.toLowerCase()}</Text>
              </Text>
              <Text style={S.successNote}>
                Please click the link in the email to set a new password, then return to the app to
                log in.
              </Text>

              <TouchableOpacity
                style={S.btn}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.85}
              >
                <Text style={S.btnTxt}>Return to Login</Text>
              </TouchableOpacity>

              <TouchableOpacity style={S.resendBtn} onPress={() => setSent(false)}>
                <Text style={S.resendBtnTxt}>Try another email</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
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
    container: { paddingHorizontal: 24, paddingTop: 12 },
    brand: { alignItems: 'center', marginBottom: 28 },
    logoImage: { width: 72, height: 72, marginBottom: 14 },
    appName: { fontSize: 28, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5 },
    tagline: { fontSize: 13, color: C.textSecondary, marginTop: 4 },
    form: {
      backgroundColor: C.surfaceCard,
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 6,
    },
    formTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
    formSub: { fontSize: 13, color: C.textSecondary, marginBottom: 20, lineHeight: 18 },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: C.border,
      paddingHorizontal: 14,
      paddingVertical: 13,
      marginBottom: 20,
    },
    inputFocused: { borderColor: C.primary, backgroundColor: C.primaryMuted },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: C.textPrimary },
    btn: {
      backgroundColor: C.primary,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      width: '100%',
    },
    btnDisabled: { backgroundColor: C.primaryLight },
    btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
    backLink: { marginTop: 18, alignItems: 'center' },
    backLinkTxt: { fontSize: 14, color: C.primary, fontWeight: '600' },

    successContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
    successIconWrap: { marginBottom: 24 },
    successTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: C.textPrimary,
      marginBottom: 12,
      textAlign: 'center',
    },
    successSub: {
      fontSize: 15,
      color: C.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 22,
    },
    successEmail: { fontWeight: '700', color: C.primary },
    successNote: {
      fontSize: 13,
      color: C.textTertiary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 18,
      paddingHorizontal: 12,
    },
    resendBtn: { marginTop: 18, paddingVertical: 8 },
    resendBtnTxt: { fontSize: 14, color: C.textSecondary, fontWeight: '600' },
  });
