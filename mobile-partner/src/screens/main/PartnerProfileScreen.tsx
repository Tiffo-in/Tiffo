import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const PartnerProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: 'storefront-outline' as const, label: 'Business Profile' },
    { icon: 'card-outline' as const, label: 'Bank & Payment Details' },
    { icon: 'document-text-outline' as const, label: 'Tax Documents (PAN/GST)' },
    { icon: 'notifications-outline' as const, label: 'Notifications' },
    { icon: 'help-circle-outline' as const, label: 'Help & Support' },
    { icon: 'shield-checkmark-outline' as const, label: 'Partner Agreement' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.partnerName}>{user?.name}</Text>
          <Text style={styles.partnerEmail}>{user?.email}</Text>
          <View style={styles.partnerBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#10B981" />
            <Text style={styles.partnerBadgeText}>Verified Partner</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="storefront-outline" size={16} color="#F59E0B" />
            <Text style={styles.infoLabel}>Kitchen Name</Text>
            <Text style={styles.infoValue}>{user?.businessName || user?.name}</Text>
          </View>
          <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: '#334155', marginTop: 12, paddingTop: 12 }]}>
            <Ionicons name="mail-outline" size={16} color="#F59E0B" />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, i < menuItems.length - 1 && styles.menuRowBorder]}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={18} color="#F59E0B" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#334155" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Tiffo Partner v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flex: 1 },
  avatarSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#F59E0B',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: '#F59E0B', shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  avatarInitial: { color: '#0F172A', fontSize: 36, fontWeight: '800' },
  partnerName: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', marginBottom: 4 },
  partnerEmail: { fontSize: 13, color: '#64748B', marginBottom: 10 },
  partnerBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#064E3B',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#065F46',
  },
  partnerBadgeText: { fontSize: 12, fontWeight: '600', color: '#10B981', marginLeft: 5 },
  infoCard: {
    backgroundColor: '#1E293B', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#334155',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { flex: 1, fontSize: 13, color: '#64748B', marginLeft: 10 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#F8FAFC' },
  menuCard: {
    backgroundColor: '#1E293B', marginHorizontal: 16, borderRadius: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#334155', overflow: 'hidden',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: '#334155' },
  menuIconWrap: {
    width: 34, height: 34, borderRadius: 9, backgroundColor: '#0F172A',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 14, color: '#CBD5E1', fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 16,
    backgroundColor: '#450A0A', borderWidth: 1, borderColor: '#7F1D1D',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444', marginLeft: 8 },
  version: { textAlign: 'center', fontSize: 12, color: '#334155', marginBottom: 32 },
});

export default PartnerProfileScreen;
