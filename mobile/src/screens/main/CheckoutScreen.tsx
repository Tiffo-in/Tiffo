import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

import { useAlert } from '../../contexts/AlertContext';
import { RootStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Checkout'>;
  route: RouteProp<RootStackParams, 'Checkout'>;
};

const TIMES = ['12:30 PM', '01:00 PM', '01:30 PM', '07:30 PM', '08:00 PM'];

export default function CheckoutScreen({ route, navigation }: Props) {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { success, error, warning } = useAlert();
  const { tiffinId, plan, price } = route.params;
  const [address, setAddress] = useState('');
  const [time, setTime] = useState(TIMES[0]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<'online' | 'cod'>('online');

  const gst = Math.round(price * 0.05);
  const total = price + gst;

  const handleConfirmOrder = async () => {
    if (!address.trim()) {
      warning('Missing Info', 'Please enter your delivery address.');
      return;
    }
    setLoading(true);
    try {
      const subRes = await api.post('/subscriptions', {
        tiffinId,
        plan,
        startDate: new Date().toISOString(),
        deliveryAddress: address,
        deliveryTime: time,
        specialInstructions: instructions,
      });
      const subscriptionId = subRes.data?.data?._id;
      if (!subscriptionId) throw new Error('Failed to create subscription.');

      if (payMethod === 'cod') {
        await api.post('/payments/cod', { subscriptionId });
        success(
          'Order Placed! 🎉',
          'Your subscription is confirmed. Pay cash on first delivery.',
          () => navigation.navigate('MainTabs'),
        );
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, razorpayKey } = (
        await api.post('/payments/create-order', { subscriptionId })
      ).data.data;
      const options = {
        description: `Tiffin - ${plan}`,
        currency,
        key: razorpayKey,
        amount,
        name: 'TIFFO',
        order_id: orderId,
        theme: { color: C.primary },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          try {
            await api.post('/payments/verify', { ...data, subscriptionId });
            success(
              'Payment Successful! 🎉',
              'Your subscription is active. Meals start tomorrow!',
              () => navigation.navigate('MainTabs'),
            );
          } catch {
            error('Verification Failed', 'Contact support.');
          } finally {
            setLoading(false);
          }
        })
        .catch((e: any) => {
          setLoading(false);
          error('Payment Failed', e.description || 'Cancelled.');
        });
    } catch (err: any) {
      setLoading(false);
      error(
        'Order Failed',
        err.response?.data?.message || err.message || 'Could not process order.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Address */}
        <View style={S.card}>
          <View style={S.cardTitleRow}>
            <View style={S.cardIconWrap}>
              <Ionicons name="location-outline" size={18} color={C.primary} />
            </View>
            <Text style={S.cardTitle}>Delivery Address</Text>
          </View>
          <TextInput
            style={[S.input, S.textArea]}
            placeholder="House/Flat No, Street, Landmark, City, Pincode"
            placeholderTextColor={C.textTertiary}
            multiline
            numberOfLines={3}
            value={address}
            onChangeText={setAddress}
            textAlignVertical="top"
          />
        </View>

        {/* Delivery Time */}
        <View style={S.card}>
          <View style={S.cardTitleRow}>
            <View style={S.cardIconWrap}>
              <Ionicons name="time-outline" size={18} color={C.primary} />
            </View>
            <Text style={S.cardTitle}>Preferred Delivery Time</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TIMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[S.timeSlot, time === t && S.timeSlotActive]}
                onPress={() => setTime(t)}
              >
                <Text style={[S.timeText, time === t && S.timeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={S.card}>
          <View style={S.cardTitleRow}>
            <View style={S.cardIconWrap}>
              <Ionicons name="chatbubble-outline" size={18} color={C.primary} />
            </View>
            <Text style={S.cardTitle}>
              Special Instructions{' '}
              <Text style={{ color: C.textTertiary, fontWeight: '400', fontSize: 12 }}>
                (Optional)
              </Text>
            </Text>
          </View>
          <TextInput
            style={S.input}
            placeholder="E.g. Less spicy, no onion, leave at door..."
            placeholderTextColor={C.textTertiary}
            value={instructions}
            onChangeText={setInstructions}
          />
        </View>

        {/* Payment Method */}
        <View style={S.card}>
          <View style={S.cardTitleRow}>
            <View style={S.cardIconWrap}>
              <Ionicons name="wallet-outline" size={18} color={C.primary} />
            </View>
            <Text style={S.cardTitle}>Payment Method</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['online', 'cod'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[S.payOption, payMethod === m && S.payOptionActive]}
                onPress={() => setPayMethod(m)}
              >
                <Ionicons
                  name={m === 'online' ? 'card-outline' : 'cash-outline'}
                  size={22}
                  color={payMethod === m ? C.primary : C.textSecondary}
                />
                <Text style={[S.payLabel, payMethod === m && S.payLabelActive]}>
                  {m === 'online' ? 'Pay Online' : 'Cash on Delivery'}
                </Text>
                <Text style={S.payDesc}>
                  {m === 'online' ? 'UPI, Card, Wallet' : 'Pay when delivered'}
                </Text>
                {payMethod === m && (
                  <View style={S.payCheck}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bill Summary */}
        <View style={S.card}>
          <View style={S.cardTitleRow}>
            <View style={S.cardIconWrap}>
              <Ionicons name="receipt-outline" size={18} color={C.primary} />
            </View>
            <Text style={S.cardTitle}>Bill Summary</Text>
          </View>
          {[
            { label: `Item Total (${plan} plan)`, value: `₹${price}`, special: false },
            { label: 'GST (5%)', value: `₹${gst}`, special: false },
            { label: 'Delivery Fee', value: 'FREE', special: true },
          ].map((r) => (
            <View key={r.label} style={S.billRow}>
              <Text style={S.billLabel}>{r.label}</Text>
              <Text style={[S.billVal, r.special && { color: C.veg, fontWeight: '700' }]}>
                {r.value}
              </Text>
            </View>
          ))}
          <View style={S.divider} />
          <View style={S.billRow}>
            <Text style={S.totalLabel}>Total to Pay</Text>
            <Text style={S.totalVal}>₹{total}</Text>
          </View>
        </View>

        {/* Savings Banner */}
        <View style={S.savingsBanner}>
          <Ionicons name="pricetag-outline" size={16} color={C.veg} />
          <Text style={S.savingsTxt}>
            You save ₹{Math.round(price * 0.1)} with free delivery + no platform fee!
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={S.footer}>
        <View>
          <Text style={S.footerTotal}>₹{total}</Text>
          <Text style={S.footerSub}>
            {payMethod === 'online' ? '🔒 Secure payment' : '💵 Pay on delivery'}
          </Text>
        </View>
        <TouchableOpacity
          style={[S.confirmBtn, loading && S.confirmDisabled]}
          onPress={handleConfirmOrder}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={S.confirmTxt}>{payMethod === 'online' ? 'Pay Now' : 'Place Order'}</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: C.surfaceCard,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    cardIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: C.primaryMuted,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
    input: {
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      color: C.textPrimary,
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    timeSlot: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surface,
    },
    timeSlotActive: { borderColor: C.primary, backgroundColor: C.primaryMuted },
    timeText: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
    timeTextActive: { color: C.primary, fontWeight: '700' },
    payOption: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: C.border,
      padding: 14,
      alignItems: 'center',
      backgroundColor: C.surface,
      position: 'relative',
    },
    payOptionActive: { borderColor: C.primary, backgroundColor: C.primaryMuted },
    payLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: C.textSecondary,
      marginTop: 8,
      textAlign: 'center',
    },
    payLabelActive: { color: C.primary },
    payDesc: { fontSize: 10, color: C.textTertiary, marginTop: 2, textAlign: 'center' },
    payCheck: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: C.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    billLabel: { fontSize: 14, color: C.textSecondary },
    billVal: { fontSize: 14, color: C.textPrimary, fontWeight: '500' },
    divider: { height: 1, backgroundColor: C.divider, marginVertical: 10 },
    totalLabel: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
    totalVal: { fontSize: 18, fontWeight: '800', color: C.primary },
    savingsBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.successBg,
      borderRadius: 12,
      padding: 12,
      gap: 8,
    },
    savingsTxt: { fontSize: 13, color: C.veg, fontWeight: '600', flex: 1 },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: C.surfaceCard,
      padding: 16,
      paddingBottom: 32,
      borderTopWidth: 1,
      borderTopColor: C.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 6,
    },
    footerTotal: { fontSize: 22, fontWeight: '800', color: C.textPrimary },
    footerSub: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
    confirmBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 14,
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
    confirmDisabled: { backgroundColor: C.primaryLight },
    confirmTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  });
