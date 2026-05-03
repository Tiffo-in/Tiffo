import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../navigation/RootNavigator';

const ProfileScreen = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: 'person-outline' as const, label: 'Edit Profile', onPress: () => {} },
    { icon: 'location-outline' as const, label: 'Saved Addresses', onPress: () => {} },
    { icon: 'card-outline' as const, label: 'Payment Methods', onPress: () => {} },
    { icon: 'notifications-outline' as const, label: 'Notifications', onPress: () => {} },
    { icon: 'help-circle-outline' as const, label: 'Help & Support', onPress: () => {} },
    { icon: 'document-text-outline' as const, label: 'Privacy Policy', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {!isAuthenticated ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👤</Text>
            <Text style={styles.emptyTitle}>Sign in to your profile</Text>
            <Text style={styles.emptyText}>Create an account or log in to manage your addresses, payment methods, and settings.</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginBtnText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Avatar & Name */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase()}</Text>
              </View>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              {[
                { label: 'Subscriptions', value: '—' },
                { label: 'Deliveries', value: '—' },
                { label: 'Reviews', value: '—' },
              ].map((s) => (
                <View key={s.label} style={styles.statItem}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Menu items */}
            <View style={styles.menuCard}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuRow, index < menuItems.length - 1 && styles.menuRowBorder]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconWrap}>
                    <Ionicons name={item.icon} size={20} color="#F97316" />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#D4D0CC" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        )}
        <Text style={styles.version}>Tiffo v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAF9' },
  scroll: { flex: 1 },
  avatarSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#F97316',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: '#F97316', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  avatarInitial: { color: '#FFF', fontSize: 36, fontWeight: '800' },
  userName: { fontSize: 22, fontWeight: '800', color: '#1C1917', marginBottom: 4 },
  userEmail: { fontSize: 13, color: '#78716C', marginBottom: 10 },
  roleBadge: {
    backgroundColor: '#FFF7ED', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: '#FED7AA',
  },
  roleText: { fontSize: 11, fontWeight: '700', color: '#EA580C', letterSpacing: 1 },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 20,
    padding: 20, marginBottom: 16, justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#F97316', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#78716C' },
  menuCard: {
    backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 20, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, overflow: 'hidden',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF7ED',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1C1917' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 16,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
  version: { textAlign: 'center', fontSize: 12, color: '#D4D0CC', marginBottom: 32 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1917', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#78716C', textAlign: 'center', lineHeight: 20 },
  loginBtn: {
    backgroundColor: '#F97316', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
    marginTop: 20, shadowColor: '#F97316', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  loginBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

export default ProfileScreen;
