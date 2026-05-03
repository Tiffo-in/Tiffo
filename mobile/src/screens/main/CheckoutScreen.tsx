import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParams } from '../../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import api from '../../services/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Checkout'>;
  route: RouteProp<RootStackParams, 'Checkout'>;
};

const TIMES = ['12:30 PM', '01:00 PM', '01:30 PM', '07:30 PM', '08:00 PM'];

const CheckoutScreen = ({ route, navigation }: Props) => {
  const { tiffinId, plan, price } = route.params;

  const [address, setAddress] = useState('');
  const [time, setTime] = useState(TIMES[0]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');

  const gst = Math.round(price * 0.05);
  const total = price + gst;

  const handleConfirmOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Missing Info', 'Please enter your delivery address.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Subscription
      const startDate = new Date().toISOString();
      const subRes = await api.post('/subscriptions', {
        tiffinId,
        plan,
        startDate,
        deliveryAddress: address,
        deliveryTime: time,
        specialInstructions: instructions,
      });

      const subscriptionId = subRes.data?.data?._id;
      if (!subscriptionId) {
        throw new Error('Failed to create subscription record.');
      }

      if (paymentMethod === 'cod') {
        await api.post('/payments/cod', { subscriptionId });
        Alert.alert(
          'Order Placed! 🎉',
          'Your subscription has been created. Please pay cash upon first delivery.',
          [
            {
              text: 'View Subscriptions',
              onPress: () => navigation.navigate('MainTabs'),
            },
          ]
        );
        setLoading(false);
        return;
      }

      // 2. Create Razorpay Order
      const orderRes = await api.post('/payments/create-order', { subscriptionId });
      const { orderId, amount, currency, razorpayKey } = orderRes.data.data;

      // 3. Configure Razorpay Options
      const options = {
        description: `Tiffin Subscription - ${plan}`,
        image: 'https://tiffo.in/logo.png', // Add your logo here
        currency: currency,
        key: razorpayKey,
        amount: amount,
        name: 'TIFFO',
        order_id: orderId,
        theme: { color: '#F97316' }
      };

      // 4. Open Razorpay native checkout
      RazorpayCheckout.open(options).then(async (data: any) => {
        // 5. Verify payment on success
        try {
          await api.post('/payments/verify', {
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
            subscriptionId
          });
          
          Alert.alert(
            'Payment Successful! 🎉',
            'Your subscription is active and your meals have been scheduled.',
            [
              {
                text: 'View Subscriptions',
                onPress: () => navigation.navigate('MainTabs'),
              },
            ]
          );
        } catch (verifyErr: any) {
          Alert.alert('Verification Failed', 'Payment succeeded but verification failed. Please contact support.');
        } finally {
          setLoading(false);
        }
      }).catch((error: any) => {
        // Payment failed or dismissed
        setLoading(false);
        Alert.alert('Payment Failed', error.description || 'Payment was cancelled or failed.');
      });

    } catch (err: any) {
      setLoading(false);
      Alert.alert('Order Failed', err.response?.data?.message || err.message || 'Could not process order.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        
        {/* Delivery Details Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          
          <Text style={styles.label}>Full Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="House/Flat No, Street, Landmark, City, Pincode"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>Preferred Delivery Time</Text>
          <View style={styles.timeGrid}>
            {TIMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.timeSlot, time === t && styles.timeSlotActive]}
                onPress={() => setTime(t)}
              >
                <Text style={[styles.timeText, time === t && styles.timeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Special Instructions (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g. Less spicy, leave at door"
            placeholderTextColor="#9CA3AF"
            value={instructions}
            onChangeText={setInstructions}
          />

          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.paymentMethodContainer}>
            <TouchableOpacity
              style={[styles.paymentBtn, paymentMethod === 'online' && styles.paymentBtnActive]}
              onPress={() => setPaymentMethod('online')}
            >
              <Ionicons name="card-outline" size={20} color={paymentMethod === 'online' ? '#F97316' : '#78716C'} />
              <Text style={[styles.paymentBtnText, paymentMethod === 'online' && styles.paymentBtnTextActive]}>
                Pay Online
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentBtn, paymentMethod === 'cod' && styles.paymentBtnActive]}
              onPress={() => setPaymentMethod('cod')}
            >
              <Ionicons name="cash-outline" size={20} color={paymentMethod === 'cod' ? '#F97316' : '#78716C'} />
              <Text style={[styles.paymentBtnText, paymentMethod === 'cod' && styles.paymentBtnTextActive]}>
                Cash on Delivery
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bill Details Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total ({plan})</Text>
            <Text style={styles.billValue}>₹{price}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes & GST (5%)</Text>
            <Text style={styles.billValue}>₹{gst}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValueGreen}>FREE</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerTotal}>₹{total}</Text>
          <Text style={styles.footerSub}>{paymentMethod === 'online' ? 'Secure Online Payment' : 'Pay via Cash'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          onPress={handleConfirmOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.confirmBtnText}>{paymentMethod === 'online' ? 'Pay Securely' : 'Confirm Order'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FAFAF9' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1C1917', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#44403C', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#FAFAF9', borderWidth: 1, borderColor: '#E7E5E4',
    borderRadius: 12, padding: 12, fontSize: 14, color: '#1C1917',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  timeSlot: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: '#E7E5E4', backgroundColor: '#FAFAF9',
    marginRight: 8, marginBottom: 8,
  },
  timeSlotActive: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  timeText: { fontSize: 13, color: '#78716C', fontWeight: '500' },
  timeTextActive: { color: '#EA580C', fontWeight: '600' },
  paymentMethodContainer: { flexDirection: 'row', gap: 12, marginTop: 4 },
  paymentBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E7E5E4', backgroundColor: '#FAFAF9',
  },
  paymentBtnActive: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  paymentBtnText: { fontSize: 14, fontWeight: '600', color: '#78716C' },
  paymentBtnTextActive: { color: '#EA580C' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontSize: 14, color: '#57534E' },
  billValue: { fontSize: 14, color: '#1C1917', fontWeight: '500' },
  billValueGreen: { fontSize: 14, color: '#16A34A', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E7E5E4', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1C1917' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#F97316' },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', padding: 16, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: '#E7E5E4',
  },
  footerTotal: { fontSize: 20, fontWeight: '800', color: '#1C1917' },
  footerSub: { fontSize: 12, color: '#78716C', marginTop: 2, fontWeight: '500' },
  confirmBtn: {
    backgroundColor: '#F97316', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12,
  },
  confirmBtnDisabled: { backgroundColor: '#FDBA74' },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default CheckoutScreen;
