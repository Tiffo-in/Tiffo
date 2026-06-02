import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParams } from '../../navigation/RootNavigator';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

const MENU_ITEMS = [
  {
    icon: 'person-outline' as const,
    label: 'Edit Profile',
    sublabel: 'Update name, phone & preferences',
    route: 'EditProfile' as const,
  },
  {
    icon: 'location-outline' as const,
    label: 'Saved Addresses',
    sublabel: 'Home, work and other addresses',
    route: 'SavedAddresses' as const,
  },
  {
    icon: 'card-outline' as const,
    label: 'Payment Methods',
    sublabel: 'Cards, UPI and wallets',
    route: 'PaymentMethods' as const,
  },
  {
    icon: 'notifications-outline' as const,
    label: 'Notifications',
    sublabel: 'Manage delivery alerts',
    route: 'Notifications' as const,
  },
  {
    icon: 'help-circle-outline' as const,
    label: 'Help & Support',
    sublabel: '24/7 customer care',
    route: 'HelpSupport' as const,
  },
  {
    icon: 'document-text-outline' as const,
    label: 'Privacy Policy',
    sublabel: 'Read our data practices',
    route: 'PrivacyPolicy' as const,
  },
];

const MenuRow = ({
  item,
  index,
  total,
  C,
}: {
  item: (typeof MENU_ITEMS)[0];
  index: number;
  total: number;
  C: ColorScheme;
}) => {
  const S = useMemo(() => createStyles(C), [C]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[S.menuRow, index < total - 1 && S.menuBorder]}
        onPress={() => nav.navigate(item.route)}
        onPressIn={() =>
          Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, friction: 8 }).start()
        }
        onPressOut={() =>
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start()
        }
        activeOpacity={1}
      >
        <View style={S.iconWrap}>
          <Ionicons name={item.icon} size={20} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.menuLabel}>{item.label}</Text>
          <Text style={S.menuSub}>{item.sublabel}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={C.border} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { user, logout, isAuthenticated } = useAuth();
  const { confirm } = useAlert();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();

  const handleLogout = () => {
    confirm(
      'Sign Out',
      'Are you sure you want to sign out?',
      logout,
      undefined,
      'Sign Out',
      'Cancel',
    );
  };

  if (!isAuthenticated)
    return (
      <SafeAreaView style={S.safe}>
        <View style={S.guestContainer}>
          <View style={S.guestIllustration}>
            <Text style={{ fontSize: 64 }}>👤</Text>
          </View>
          <Text style={S.guestTitle}>Welcome to Tiffo</Text>
          <Text style={S.guestSubtitle}>
            Sign in to view your profile, manage subscriptions, and track deliveries
          </Text>
          <TouchableOpacity style={S.signInBtn} onPress={() => nav.navigate('Login')}>
            <Text style={S.signInTxt}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.registerBtn} onPress={() => nav.navigate('Register')}>
            <Text style={S.registerTxt}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <View style={S.hero}>
          <View style={S.avatarWrap}>
            <View style={S.avatar}>
              <Text style={S.avatarTxt}>{user?.name?.[0]?.toUpperCase()}</Text>
            </View>
            <View style={S.editBadge}>
              <Ionicons name="pencil" size={10} color="#fff" />
            </View>
          </View>
          <Text style={S.userName}>{user?.name}</Text>
          <Text style={S.userEmail}>{user?.email}</Text>
          <View style={S.rolePill}>
            <Text style={S.roleTxt}>{user?.role?.toUpperCase() || 'CUSTOMER'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={S.statsCard}>
          {[
            { label: 'Subscriptions', value: '—', icon: 'receipt-outline' as const },
            { label: 'Deliveries', value: '—', icon: 'bicycle-outline' as const },
            { label: 'Reviews', value: '—', icon: 'star-outline' as const },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={S.statDivider} />}
              <View style={S.statItem}>
                <Ionicons name={s.icon} size={18} color={C.primary} style={{ marginBottom: 6 }} />
                <Text style={S.statVal}>{s.value}</Text>
                <Text style={S.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Menu */}
        <View style={S.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <MenuRow key={item.label} item={item} index={i} total={MENU_ITEMS.length} C={C} />
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={S.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color={C.primary} />
          <Text style={S.logoutTxt}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={S.version}>Tiffo v1.0.0 • Made with ❤️ in India</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.background },
    guestContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      paddingTop: 80,
    },
    guestIllustration: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: C.primaryMuted,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    guestTitle: { fontSize: 24, fontWeight: '800', color: C.textPrimary, marginBottom: 10 },
    guestSubtitle: {
      fontSize: 14,
      color: C.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 32,
    },
    signInBtn: {
      backgroundColor: C.primary,
      width: '100%',
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    signInTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
    registerBtn: {
      width: '100%',
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: C.primary,
    },
    registerTxt: { color: C.primary, fontSize: 16, fontWeight: '700' },
    hero: {
      alignItems: 'center',
      paddingTop: 32,
      paddingBottom: 24,
      backgroundColor: C.surfaceMuted,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    avatarWrap: { position: 'relative', marginBottom: 14 },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: C.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    avatarTxt: { color: '#fff', fontSize: 36, fontWeight: '800' },
    editBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: C.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: C.background,
    },
    userName: { fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
    userEmail: { fontSize: 13, color: C.textSecondary, marginBottom: 10 },
    rolePill: {
      backgroundColor: C.primaryMuted,
      borderRadius: 100,
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: C.primary + '40',
    },
    roleTxt: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 1 },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: C.surfaceCard,
      marginHorizontal: 16,
      borderRadius: 18,
      padding: 20,
      marginTop: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, backgroundColor: C.divider },
    statVal: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 2 },
    statLabel: { fontSize: 11, color: C.textTertiary },
    menuCard: {
      backgroundColor: C.surfaceCard,
      marginHorizontal: 16,
      borderRadius: 18,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      overflow: 'hidden',
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    menuBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
      backgroundColor: C.primaryMuted,
    },
    menuLabel: { fontSize: 15, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
    menuSub: { fontSize: 11, color: C.textTertiary },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 16,
      borderRadius: 14,
      backgroundColor: C.primaryMuted,
      borderWidth: 1,
      borderColor: C.primary + '40',
    },
    logoutTxt: { fontSize: 15, fontWeight: '700', color: C.primary },
    version: { textAlign: 'center', fontSize: 12, color: C.textTertiary, marginBottom: 32 },
  });
