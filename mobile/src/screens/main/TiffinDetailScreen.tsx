import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Tiffin {
  _id: string;
  name: string;
  description?: string;
  price: any;
  category: string;
  isVeg?: boolean;
  availablePlans?: string[];
  images?: string[];
  partnerInfo?: { businessName: string; rating?: number };
  tags?: string[];
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'TiffinDetail'>;
  route: RouteProp<RootStackParams, 'TiffinDetail'>;
};

const PLAN_DURATIONS: Record<string, { days: number; discount: string }> = {
  daily: { days: 1, discount: '' },
  weekly: { days: 7, discount: 'Save 5%' },
  monthly: { days: 30, discount: 'Save 15%' },
};

const TiffinDetailScreen = ({ route, navigation }: Props) => {
  const { tiffinId } = route.params;
  const [tiffin, setTiffin] = useState<Tiffin | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [subscribing, setSubscribing] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    api.get(`/tiffins/${tiffinId}`)
      .then((res) => setTiffin(res.data?.data || res.data?.tiffin))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tiffinId]);

  const handleSubscribe = () => {
    if (!tiffin) return;
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    const base = typeof tiffin.price === 'object' ? (tiffin.price as any)[selectedPlan] || (tiffin.price as any).daily * (PLAN_DURATIONS[selectedPlan]?.days || 1) : tiffin.price * (PLAN_DURATIONS[selectedPlan]?.days || 1);

    navigation.navigate('Checkout', {
      tiffinId: tiffin._id,
      plan: selectedPlan,
      price: base,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#F97316" size="large" />
      </View>
    );
  }

  if (!tiffin) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Tiffin not found</Text>
      </View>
    );
  }

  const availablePlans = tiffin.availablePlans || ['daily', 'weekly', 'monthly'];
  const computedPrice = typeof tiffin.price === 'object' ? (tiffin.price as any)[selectedPlan] || (tiffin.price as any).daily * (PLAN_DURATIONS[selectedPlan]?.days || 1) : tiffin.price * (PLAN_DURATIONS[selectedPlan]?.days || 1);
  const basePricePerDay = typeof tiffin.price === 'object' ? (tiffin.price as any).daily : tiffin.price;

  return (
    <View style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Image Area */}
        <View style={styles.heroArea}>
          <Image 
            source={{ uri: tiffin.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' }} 
            style={styles.heroImage} 
          />
          {tiffin.isVeg && (
            <View style={styles.vegChip}>
              <View style={styles.vegDot} />
              <Text style={styles.vegChipText}>PURE VEG</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.name}>{tiffin.name}</Text>
          <Text style={styles.category}>{tiffin.category}</Text>

          {tiffin.description && (
            <Text style={styles.description}>{tiffin.description}</Text>
          )}

          {/* Tags */}
          {tiffin.tags && tiffin.tags.length > 0 && (
            <View style={styles.tagRow}>
              {tiffin.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Plan Selector */}
          <Text style={styles.sectionLabel}>Choose a Plan</Text>
          <View style={styles.plansRow}>
            {availablePlans.map((plan) => {
              const info = PLAN_DURATIONS[plan];
              const active = selectedPlan === plan;
              return (
                <TouchableOpacity
                  key={plan}
                  style={[styles.planCard, active && styles.planCardActive]}
                  onPress={() => setSelectedPlan(plan)}
                >
                  <Text style={[styles.planName, active && styles.planNameActive]}>
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </Text>
                  <Text style={[styles.planDays, active && styles.planDaysActive]}>
                    {info?.days === 1 ? '1 delivery' : `${info?.days} days`}
                  </Text>
                  {info?.discount ? (
                    <Text style={styles.planDiscount}>{info.discount}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Price summary */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total for {selectedPlan} plan</Text>
            <Text style={styles.priceValue}>₹{computedPrice.toLocaleString('en-IN')}</Text>
          </View>
          <Text style={styles.priceSub}>₹{basePricePerDay}/day (approx)</Text>
        </View>
      </ScrollView>

      {/* Fixed Subscribe CTA */}
      <View style={styles.ctaBar}>
        <View>
          <Text style={styles.ctaPrice}>₹{computedPrice.toLocaleString('en-IN')}</Text>
          <Text style={styles.ctaPlan}>{selectedPlan} plan</Text>
        </View>
        <TouchableOpacity
          style={styles.subscribeBtn}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FAFAF9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF9' },
  heroArea: {
    height: 280, backgroundColor: '#E5E5E5', width: '100%',
  },
  heroImage: { width: '100%', height: '100%' },
  vegChip: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  vegDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A', marginRight: 6 },
  vegChipText: { fontSize: 11, fontWeight: '800', color: '#166534', letterSpacing: 0.5 },
  content: { 
    padding: 24, backgroundColor: '#FAFAF9', 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    marginTop: -30, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
  },
  name: { fontSize: 26, fontWeight: '800', color: '#1C1917', marginBottom: 6, lineHeight: 32 },
  category: { fontSize: 14, color: '#78716C', marginBottom: 16, fontWeight: '500' },
  description: { fontSize: 14, color: '#57534E', lineHeight: 21, marginBottom: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  tag: { backgroundColor: '#F5F5F4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 12, color: '#78716C' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#1C1917', marginBottom: 12 },
  plansRow: { flexDirection: 'row' },
  planCard: {
    flex: 1, borderRadius: 16, borderWidth: 1.5, borderColor: '#E7E5E4',
    padding: 14, alignItems: 'center', backgroundColor: '#FFF', marginRight: 10,
  },
  planCardActive: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  planName: { fontSize: 14, fontWeight: '700', color: '#78716C', marginBottom: 4 },
  planNameActive: { color: '#EA580C' },
  planDays: { fontSize: 11, color: '#A8A29E' },
  planDaysActive: { color: '#C2410C' },
  planDiscount: { fontSize: 10, color: '#16A34A', fontWeight: '700', marginTop: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 14, color: '#78716C' },
  priceValue: { fontSize: 22, fontWeight: '800', color: '#F97316' },
  priceSub: { fontSize: 12, color: '#A8A29E', marginTop: 4 },
  ctaBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
  },
  ctaPrice: { fontSize: 20, fontWeight: '800', color: '#1C1917' },
  ctaPlan: { fontSize: 12, color: '#78716C', marginTop: 2 },
  subscribeBtn: {
    backgroundColor: '#F97316', borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 14,
    shadowColor: '#F97316', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  subscribeBtnLoading: { backgroundColor: '#FDBA74' },
  subscribeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default TiffinDetailScreen;
