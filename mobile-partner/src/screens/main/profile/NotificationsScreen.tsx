import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [orderPush, setOrderPush] = useState(true);
  const [orderEmail, setOrderEmail] = useState(true);
  const [payoutSms, setPayoutSms] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsStr = await AsyncStorage.getItem('partner_notification_settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        setOrderPush(settings.orderPush ?? true);
        setOrderEmail(settings.orderEmail ?? true);
        setPayoutSms(settings.payoutSms ?? true);
        setWeeklyReports(settings.weeklyReports ?? false);
        setSystemAlerts(settings.systemAlerts ?? true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const settings = {
        orderPush,
        orderEmail,
        payoutSms,
        weeklyReports,
        systemAlerts,
      };
      await AsyncStorage.setItem('partner_notification_settings', JSON.stringify(settings));
      Alert.alert('Success', 'Notification preferences saved successfully.');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading Settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Preference Settings</Text>
          <Text style={styles.sectionHeaderSub}>
            Configure when and how you want to be alerted.
          </Text>
        </View>

        {/* Card: Order Alerts */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Order Alerts</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>New Order Sound Alert</Text>
              <Text style={styles.settingDesc}>
                Play notification sound when a customer places an order.
              </Text>
            </View>
            <Switch
              value={orderPush}
              onValueChange={setOrderPush}
              trackColor={{ false: '#0F172A', true: '#F59E0B30' }}
              thumbColor={orderPush ? '#F59E0B' : '#64748B'}
            />
          </View>

          <View style={[styles.settingRow, styles.borderTop]}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>Email Order Receipts</Text>
              <Text style={styles.settingDesc}>
                Send copies of customer active subscriptions to kitchen email.
              </Text>
            </View>
            <Switch
              value={orderEmail}
              onValueChange={setOrderEmail}
              trackColor={{ false: '#0F172A', true: '#F59E0B30' }}
              thumbColor={orderEmail ? '#F59E0B' : '#64748B'}
            />
          </View>
        </View>

        {/* Card: Financials */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Payout & Reports</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>SMS Payout Notifications</Text>
              <Text style={styles.settingDesc}>
                Receive instant text message upon bank deposit credit.
              </Text>
            </View>
            <Switch
              value={payoutSms}
              onValueChange={setPayoutSms}
              trackColor={{ false: '#0F172A', true: '#F59E0B30' }}
              thumbColor={payoutSms ? '#F59E0B' : '#64748B'}
            />
          </View>

          <View style={[styles.settingRow, styles.borderTop]}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>Weekly Performance Digests</Text>
              <Text style={styles.settingDesc}>
                Email summary analytics of earnings and reviews.
              </Text>
            </View>
            <Switch
              value={weeklyReports}
              onValueChange={setWeeklyReports}
              trackColor={{ false: '#0F172A', true: '#F59E0B30' }}
              thumbColor={weeklyReports ? '#F59E0B' : '#64748B'}
            />
          </View>
        </View>

        {/* Card: Maintenance */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>System Alerts</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>Security & Critical Errors</Text>
              <Text style={styles.settingDesc}>
                Notify about password changes, security updates and API locks.
              </Text>
            </View>
            <Switch
              value={systemAlerts}
              onValueChange={setSystemAlerts}
              disabled
              trackColor={{ false: '#0F172A', true: '#10B98130' }}
              thumbColor="#10B981"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color="#0F172A" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  sectionHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    paddingLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginTop: 8,
    paddingTop: 16,
  },
  settingTextContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  settingDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default NotificationsScreen;
