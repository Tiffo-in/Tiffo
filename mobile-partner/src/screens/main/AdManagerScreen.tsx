import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  RefreshControl,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '../../services/api';
import { captureError } from '../../services/observability';
import { Colors } from '../../theme/colors';
import { MIN_TOPUP_INR, formatCurrency, isValidTopUp, remainingBudget } from '../../utils/ads';

interface Campaign {
  _id: string;
  tiffin?: { _id: string; title?: string } | string;
  slot: 'Lunch' | 'Dinner' | 'AllDay';
  maxBidPerClick: number;
  dailyBudget: number;
  spentToday: number;
  totalSpent: number;
  walletBalance: number;
  isActive: boolean;
}

const SLOTS: Campaign['slot'][] = ['Lunch', 'Dinner', 'AllDay'];

function resolveRazorpayKey(): string | undefined {
  const fromEnv = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
  const fromConfig = (Constants.expoConfig?.extra as { razorpayKeyId?: string } | undefined)
    ?.razorpayKeyId;
  return fromEnv || fromConfig || undefined;
}

const AdManagerScreen = () => {
  const navigation = useNavigation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tiffins, setTiffins] = useState<{ _id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Create-campaign form
  const [showForm, setShowForm] = useState(false);
  const [tiffinId, setTiffinId] = useState('');
  const [slot, setSlot] = useState<Campaign['slot']>('AllDay');
  const [maxBid, setMaxBid] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');

  const load = useCallback(async () => {
    try {
      setError(null);
      const [campaignRes, tiffinRes] = await Promise.all([
        api.get('/ads/mine'),
        api.get('/tiffins/mine'),
      ]);
      setCampaigns(Array.isArray(campaignRes.data?.data) ? campaignRes.data.data : []);
      setTiffins(Array.isArray(tiffinRes.data?.data) ? tiffinRes.data.data : []);
    } catch (err: any) {
      captureError(err, { screen: 'AdManager' });
      setError(err.response?.data?.message || 'Could not load your campaigns.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createCampaign = async () => {
    if (!tiffinId) {
      Alert.alert('Pick a tiffin', 'Choose which tiffin this campaign should promote.');
      return;
    }
    const bid = Number(maxBid);
    const budget = Number(dailyBudget);
    if (!Number.isFinite(bid) || bid <= 0 || !Number.isFinite(budget) || budget <= 0) {
      Alert.alert('Check your amounts', 'Enter a bid and daily budget greater than 0.');
      return;
    }
    if (bid > budget) {
      Alert.alert(
        'Bid exceeds budget',
        'Your max bid per click cannot be higher than your daily budget.',
      );
      return;
    }

    try {
      setBusy(true);
      const res = await api.post('/ads', {
        tiffin: tiffinId,
        slot,
        maxBidPerClick: bid,
        dailyBudget: budget,
        isActive: true,
      });
      if (res.data?.success) {
        setShowForm(false);
        setTiffinId('');
        setMaxBid('');
        setDailyBudget('');
        await load();
      }
    } catch (err: any) {
      captureError(err, { screen: 'AdManager', action: 'create' });
      Alert.alert('Could not create campaign', err.response?.data?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const toggleCampaign = async (campaign: Campaign) => {
    try {
      await api.put(`/ads/${campaign._id}`, { isActive: !campaign.isActive });
      setCampaigns((prev) =>
        prev.map((c) => (c._id === campaign._id ? { ...c, isActive: !c.isActive } : c)),
      );
    } catch (err: any) {
      captureError(err, { screen: 'AdManager', action: 'toggle' });
      Alert.alert('Update failed', err.response?.data?.message || 'Could not update the campaign.');
    }
  };

  const topUp = (amountInr: number) => {
    const key = resolveRazorpayKey();
    if (!key) {
      Alert.alert(
        'Payments unavailable',
        'Ad wallet top-up is not configured in this build. Please contact support.',
      );
      return;
    }
    // The backend credits the most recently created ACTIVE campaign and errors
    // if none exists, so block early with a clear message instead.
    if (!campaigns.some((c) => c.isActive)) {
      Alert.alert(
        'No active campaign',
        'Create and activate a campaign before adding wallet funds — top-ups are credited to your active campaign.',
      );
      return;
    }

    Alert.alert('Add funds', `Add ${formatCurrency(amountInr)} to your ad wallet?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', onPress: () => runTopUp(amountInr, key) },
    ]);
  };

  const runTopUp = async (amountInr: number, key: string) => {
    try {
      setBusy(true);
      const orderRes = await api.post('/ads/wallet/create-order', { amount: amountInr });
      const order = orderRes.data?.order;
      if (!order?.id) {
        Alert.alert('Could not start payment', 'Please try again in a moment.');
        return;
      }

      const payment = await RazorpayCheckout.open({
        key,
        order_id: order.id,
        amount: order.amount, // paise, straight from the server's order
        currency: order.currency || 'INR',
        name: 'Tiffo Partner',
        description: 'Ad wallet top-up',
        theme: { color: Colors.primary },
      });

      await api.post('/ads/wallet/verify', {
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
        amountAdded: amountInr,
      });

      Alert.alert('Wallet topped up', `${formatCurrency(amountInr)} added to your ad wallet.`);
      await load();
    } catch (err: any) {
      // Razorpay rejects with a code when the user simply dismisses the sheet;
      // that is a cancellation, not an error worth reporting.
      const cancelled = err?.code === 0 || /cancel/i.test(err?.description || err?.message || '');
      if (cancelled) return;
      captureError(err, { screen: 'AdManager', action: 'topUp' });
      Alert.alert(
        'Payment failed',
        err.response?.data?.message || err?.description || 'The top-up could not be completed.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ad Manager</Text>
        <TouchableOpacity
          onPress={() => setShowForm((s) => !s)}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="New campaign"
        >
          <Ionicons name={showForm ? 'close' : 'add-circle'} size={26} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={40} color="#64748B" />
          <Text style={styles.emptyTitle}>Could not load campaigns</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={Colors.primary}
            />
          }
        >
          {showForm && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>New Campaign</Text>

              <Text style={styles.inputLabel}>Promote which tiffin?</Text>
              {tiffins.length === 0 ? (
                <Text style={styles.emptyText}>
                  You have no tiffins yet. Create one from the Menu tab first.
                </Text>
              ) : (
                <View style={styles.chipRow}>
                  {tiffins.map((t) => (
                    <TouchableOpacity
                      key={t._id}
                      style={[styles.chip, tiffinId === t._id && styles.chipSelected]}
                      onPress={() => setTiffinId(t._id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Promote ${t.title}`}
                    >
                      <Text
                        style={[styles.chipText, tiffinId === t._id && styles.chipTextSelected]}
                        numberOfLines={1}
                      >
                        {t.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.inputLabel}>Slot</Text>
              <View style={styles.chipRow}>
                {SLOTS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, slot === s && styles.chipSelected]}
                    onPress={() => setSlot(s)}
                    accessibilityRole="button"
                    accessibilityLabel={`Slot ${s}`}
                  >
                    <Text style={[styles.chipText, slot === s && styles.chipTextSelected]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Max Bid Per Click (₹)</Text>
              <TextInput
                style={styles.input}
                value={maxBid}
                onChangeText={(t) => setMaxBid(t.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="e.g. 5"
                placeholderTextColor="#475569"
              />

              <Text style={styles.inputLabel}>Daily Budget (₹)</Text>
              <TextInput
                style={styles.input}
                value={dailyBudget}
                onChangeText={(t) => setDailyBudget(t.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="e.g. 200"
                placeholderTextColor="#475569"
              />

              <TouchableOpacity
                style={[styles.primaryButton, busy && styles.buttonDisabled]}
                onPress={createCampaign}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Create campaign"
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#0F172A" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Campaign</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {campaigns.length === 0 && !showForm && (
            <View style={styles.centered}>
              <Ionicons name="megaphone-outline" size={40} color="#64748B" />
              <Text style={styles.emptyTitle}>No campaigns yet</Text>
              <Text style={styles.emptyText}>
                Boost a tiffin so it appears higher in customer search results.
              </Text>
            </View>
          )}

          {campaigns.map((c) => {
            const title =
              typeof c.tiffin === 'object' && c.tiffin?.title ? c.tiffin.title : 'Campaign';
            const left = remainingBudget(c.dailyBudget, c.spentToday);
            return (
              <View key={c._id} style={styles.card}>
                <View style={styles.campaignHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.campaignTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={styles.campaignSlot}>{c.slot}</Text>
                  </View>
                  <Switch
                    value={c.isActive}
                    onValueChange={() => toggleCampaign(c)}
                    trackColor={{ false: '#0F172A', true: `${Colors.primary}30` }}
                    thumbColor={c.isActive ? Colors.primary : '#64748B'}
                    accessibilityLabel={`${c.isActive ? 'Pause' : 'Activate'} ${title}`}
                  />
                </View>

                <View style={styles.metricRow}>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Wallet</Text>
                    <Text style={styles.metricValueAccent}>{formatCurrency(c.walletBalance)}</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Budget left today</Text>
                    <Text style={styles.metricValue}>{formatCurrency(left)}</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Total spent</Text>
                    <Text style={styles.metricValue}>{formatCurrency(c.totalSpent)}</Text>
                  </View>
                </View>
              </View>
            );
          })}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add Wallet Funds</Text>
            <Text style={styles.cardSubtitle}>
              Credited to your most recent active campaign. Minimum {formatCurrency(MIN_TOPUP_INR)}.
            </Text>
            <View style={styles.chipRow}>
              {[100, 500, 1000, 2000].filter(isValidTopUp).map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.chip, styles.topUpChip]}
                  onPress={() => topUp(amt)}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${amt} rupees`}
                >
                  <Text style={styles.chipTextSelected}>{formatCurrency(amt)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '700' },
  centered: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyText: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 6 },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  retryText: { color: Colors.primary, fontWeight: '700' },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  cardSubtitle: { color: '#64748B', fontSize: 12, marginTop: 4, marginBottom: 4 },
  inputLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    maxWidth: 200,
  },
  chipSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}15` },
  topUpChip: { borderColor: Colors.primary },
  chipText: { color: '#94A3B8', fontSize: 12 },
  chipTextSelected: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#0F172A', fontWeight: '800', fontSize: 15 },
  campaignHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  campaignTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  campaignSlot: { color: '#64748B', fontSize: 12, marginTop: 2 },
  metricRow: { flexDirection: 'row', marginTop: 14, gap: 12 },
  metric: { flex: 1 },
  metricLabel: { color: '#64748B', fontSize: 11 },
  metricValue: { color: '#F8FAFC', fontSize: 14, fontWeight: '700', marginTop: 2 },
  metricValueAccent: { color: Colors.primary, fontSize: 14, fontWeight: '700', marginTop: 2 },
});

export default AdManagerScreen;
