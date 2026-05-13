import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Dimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../theme/useTheme';
import { ColorScheme } from '../../theme/colors';

const { width: SW } = Dimensions.get('window');

interface Tiffin {
  _id: string; name: string; description?: string; price: any;
  category: string; isVeg?: boolean; availablePlans?: string[];
  images?: string[]; partnerInfo?: { businessName: string; rating?: number };
  tags?: string[]; rating?: { average: number; count: number };
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'TiffinDetail'>;
  route: RouteProp<RootStackParams, 'TiffinDetail'>;
};

const PLANS: Record<string, { days: number; discount: string; label: string }> = {
  daily:   { days: 1,  discount: '',        label: '1 meal'  },
  weekly:  { days: 7,  discount: 'Save 5%', label: '7 days'  },
  monthly: { days: 30, discount: 'Save 15%',label: '30 days' },
};

const NUTRIENTS = [
  { label: 'Calories', value: '~450 kcal', icon: '🔥' },
  { label: 'Protein',  value: '18g',       icon: '💪' },
  { label: 'Carbs',    value: '55g',       icon: '🌾' },
  { label: 'Fresh',    value: 'Daily',     icon: '✅' },
];

export default function TiffinDetailScreen({ route, navigation }: Props) {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { tiffinId } = route.params;
  const [tiffin, setTiffin] = useState<Tiffin | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const { isAuthenticated } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    api.get(`/tiffins/${tiffinId}`)
      .then((r) => setTiffin(r.data?.data || r.data?.tiffin))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tiffinId]);

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 200], outputRange: [0, 1], extrapolate: 'clamp' });
  const imageScale  = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.15, 1], extrapolate: 'clamp' });

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background }}>
      <ActivityIndicator color={C.primary} size="large" />
    </View>
  );
  if (!tiffin) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background }}>
      <Text style={{ fontSize: 40 }}>😕</Text>
      <Text style={{ fontSize: 16, color: C.textSecondary, marginTop: 12 }}>Meal not found</Text>
    </View>
  );

  const plans = tiffin.availablePlans || ['daily', 'weekly', 'monthly'];
  const computedPrice = typeof tiffin.price === 'object'
    ? (tiffin.price as any)[selectedPlan] || (tiffin.price as any).daily * (PLANS[selectedPlan]?.days || 1)
    : tiffin.price * (PLANS[selectedPlan]?.days || 1);
  const basePriceDay = typeof tiffin.price === 'object' ? (tiffin.price as any).daily : tiffin.price;
  const rating = tiffin.rating?.average || 4.5;

  const handleSubscribe = () => {
    if (!isAuthenticated) { navigation.navigate('Login'); return; }
    navigation.navigate('Checkout', { tiffinId: tiffin._id, plan: selectedPlan, price: computedPrice });
  };

  const pressCTA = () => {
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true, friction: 6 }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start(handleSubscribe);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      {/* Fading header */}
      <Animated.View style={[S.headerOverlay, { opacity: headerOpacity }]}>
        <Text style={S.headerTitle} numberOfLines={1}>{tiffin.name}</Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false} bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={S.heroWrap}>
          <Animated.Image
            source={{ uri: tiffin.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' }}
            style={[S.heroImg, { transform: [{ scale: imageScale }] }]}
            resizeMode="cover"
          />
          <View style={S.heroGradient} />
          <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          {tiffin.isVeg !== undefined && (
            <View style={[S.vegChip, { borderColor: tiffin.isVeg ? C.veg : C.nonVeg }]}>
              <View style={[S.vegDot, { backgroundColor: tiffin.isVeg ? C.veg : C.nonVeg }]} />
              <Text style={[S.vegText, { color: tiffin.isVeg ? C.veg : C.nonVeg }]}>
                {tiffin.isVeg ? 'Pure Veg' : 'Non-Veg'}
              </Text>
            </View>
          )}
          <View style={S.heroRating}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>★ {rating.toFixed(1)}</Text>
            {(tiffin.rating?.count ?? 0) > 0 && (
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginLeft: 4 }}>({tiffin.rating!.count})</Text>
            )}
          </View>
        </View>

        {/* Sheet */}
        <View style={S.sheet}>
          <Text style={S.name}>{tiffin.name}</Text>
          <View style={S.metaRow}>
            <Text style={S.meta}>{tiffin.category}</Text>
            {tiffin.partnerInfo?.businessName && (
              <><Text style={S.bullet}>•</Text><Text style={S.meta}>{tiffin.partnerInfo.businessName}</Text></>
            )}
          </View>

          {tiffin.description && <Text style={S.desc}>{tiffin.description}</Text>}

          {/* Nutrition row */}
          <View style={S.nutriRow}>
            {NUTRIENTS.map((n) => (
              <View key={n.label} style={S.nutriItem}>
                <Text style={{ fontSize: 20 }}>{n.icon}</Text>
                <Text style={S.nutriVal}>{n.value}</Text>
                <Text style={S.nutriLabel}>{n.label}</Text>
              </View>
            ))}
          </View>

          {tiffin.tags && tiffin.tags.length > 0 && (
            <View style={S.tagRow}>
              {tiffin.tags.map((tag) => (
                <View key={tag} style={S.tag}><Text style={S.tagTxt}>{tag}</Text></View>
              ))}
            </View>
          )}

          <View style={S.divider} />

          {/* Plan Selector */}
          <Text style={S.sectionLabel}>Choose Your Plan</Text>
          <View style={S.plansRow}>
            {plans.map((plan) => {
              const info = PLANS[plan];
              const active = selectedPlan === plan;
              const planPrice = typeof tiffin.price === 'object'
                ? (tiffin.price as any)[plan] || (tiffin.price as any).daily * (info?.days || 1)
                : tiffin.price * (info?.days || 1);
              return (
                <TouchableOpacity key={plan} style={[S.planCard, active && S.planCardActive]} onPress={() => setSelectedPlan(plan)} activeOpacity={0.8}>
                  {active && <View style={S.planCheck}><Ionicons name="checkmark" size={10} color="#fff" /></View>}
                  <Text style={[S.planName, active && S.planNameActive]}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</Text>
                  <Text style={[S.planDays, active && { color: C.primary }]}>{info?.label}</Text>
                  <Text style={[S.planPrice, active && { color: C.primary }]}>₹{planPrice}</Text>
                  {info?.discount ? (
                    <View style={S.discountPill}><Text style={S.discountTxt}>{info.discount}</Text></View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={S.divider} />

          <View style={S.priceSummary}>
            <View>
              <Text style={S.summaryLabel}>Total for {selectedPlan} plan</Text>
              <Text style={S.summaryBase}>₹{basePriceDay}/day approx</Text>
            </View>
            <Text style={S.summaryTotal}>₹{computedPrice.toLocaleString('en-IN')}</Text>
          </View>

          <View style={S.deliveryRow}>
            <Ionicons name="bicycle-outline" size={16} color={C.veg} />
            <Text style={S.deliveryTxt}>Free delivery • Delivered by 1 PM daily</Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* CTA Bar */}
      <View style={S.ctaBar}>
        <View>
          <Text style={S.ctaPrice}>₹{computedPrice.toLocaleString('en-IN')}</Text>
          <Text style={S.ctaPlan}>{selectedPlan} plan • Free delivery</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity style={S.ctaBtn} onPress={pressCTA} activeOpacity={1}>
            <Text style={S.ctaBtnTxt}>Proceed to Checkout</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const createStyles = (C: ColorScheme) => StyleSheet.create({
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: C.background, paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  heroWrap: { height: 300, position: 'relative', backgroundColor: C.surface },
  heroImg: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, backgroundColor: 'rgba(0,0,0,0.25)' },
  backBtn: { position: 'absolute', top: 52, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  vegChip: { position: 'absolute', top: 52, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceCard, borderRadius: 8, borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 5 },
  vegDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  vegText: { fontSize: 11, fontWeight: '700' },
  heroRating: { position: 'absolute', bottom: 14, left: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: C.secondary, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  sheet: { backgroundColor: C.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, padding: 20, paddingBottom: 40 },
  name: { fontSize: 24, fontWeight: '800', color: C.textPrimary, lineHeight: 30, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  meta: { fontSize: 13, color: C.textSecondary },
  bullet: { fontSize: 13, color: C.border, marginHorizontal: 6 },
  desc: { fontSize: 14, color: C.textSecondary, lineHeight: 21, marginBottom: 16 },
  nutriRow: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 14, padding: 14, justifyContent: 'space-between', marginBottom: 16 },
  nutriItem: { alignItems: 'center', flex: 1 },
  nutriVal: { fontSize: 13, fontWeight: '700', color: C.textPrimary, marginTop: 4 },
  nutriLabel: { fontSize: 10, color: C.textTertiary, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8, gap: 8 },
  tag: { backgroundColor: C.surface, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  tagTxt: { fontSize: 12, color: C.textSecondary },
  divider: { height: 1, backgroundColor: C.divider, marginVertical: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 14 },
  plansRow: { flexDirection: 'row', gap: 10 },
  planCard: { flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, padding: 14, alignItems: 'center', backgroundColor: C.surfaceCard, position: 'relative' },
  planCardActive: { borderColor: C.primary, backgroundColor: C.primaryMuted },
  planCheck: { position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' },
  planName: { fontSize: 14, fontWeight: '700', color: C.textSecondary, marginBottom: 4 },
  planNameActive: { color: C.primary },
  planDays: { fontSize: 11, color: C.textTertiary, marginBottom: 6 },
  planPrice: { fontSize: 16, fontWeight: '800', color: C.textPrimary },
  discountPill: { marginTop: 6, backgroundColor: C.successBg, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  discountTxt: { fontSize: 10, color: C.success, fontWeight: '700' },
  priceSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: C.textSecondary, fontWeight: '500' },
  summaryBase: { fontSize: 12, color: C.textTertiary, marginTop: 3 },
  summaryTotal: { fontSize: 24, fontWeight: '800', color: C.primary },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.successBg, borderRadius: 10, padding: 12, gap: 8 },
  deliveryTxt: { fontSize: 13, color: C.success, fontWeight: '600' },
  ctaBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.surfaceCard, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8 },
  ctaPrice: { fontSize: 22, fontWeight: '800', color: C.textPrimary },
  ctaPlan: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  ctaBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
