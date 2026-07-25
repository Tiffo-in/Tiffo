import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';
import { Tiffin, ApiResponse } from '../../types';

const { width: SW } = Dimensions.get('window');

const CATEGORIES = [
  { label: 'All', emoji: '🍽️' },
  { label: 'Healthy', emoji: '🥗' },
  { label: 'Gujarati', emoji: '🍛' },
  { label: 'Punjabi', emoji: '🌶️' },
  { label: 'South Indian', emoji: '🥥' },
  { label: 'Bengali', emoji: '🐟' },
  { label: 'Maharashtrian', emoji: '🫓' },
];

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = ({ C }: { C: ColorScheme }) => {
  const anim = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  const S = useMemo(() => createStyles(C), [C]);
  return (
    <Animated.View style={[S.card, { opacity: anim, flexDirection: 'row', height: 140 }]}>
      <View style={{ width: 130, backgroundColor: C.skeletonBase, borderRadius: 12 }} />
      <View style={{ flex: 1, padding: 14, gap: 8 }}>
        <View style={[S.skLine, { width: '70%' }]} />
        <View style={[S.skLine, { width: '45%' }]} />
        <View style={[S.skLine, { width: '55%' }]} />
        <View style={[S.skLine, { width: '35%', marginTop: 4 }]} />
      </View>
    </Animated.View>
  );
};

// ─── Horizontal Tiffin Card ───────────────────────────────────────────────────
const TiffinCard = ({
  item,
  onPress,
  index,
  C,
  kitchensNear,
}: {
  item: Tiffin;
  onPress: () => void;
  index: number;
  C: ColorScheme;
  kitchensNear: number;
}) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const S = useMemo(() => createStyles(C), [C]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 340,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 340,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pricePerDay = typeof item.price === 'object' ? item.price?.daily : item.price;
  const rating = item.rating?.average || 4.5;
  const deliveryTime = (item as any).deliveryTime || 20 + index * 5;
  const discountPct = index === 0 ? 50 : index === 1 ? 30 : null;
  const isVeg = item.isVeg !== false;
  const distanceKm = (1.2 + index * 0.6 + Math.random()).toFixed(1);
  const dishCount = (item as any).dishCount || 10 + index * 2;

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }, { scale }] }}>
      <TouchableOpacity
        style={S.card}
        onPress={onPress}
        activeOpacity={1}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }).start()
        }
      >
        {/* Left — Image */}
        <View style={S.cardImageCol}>
          <Image
            source={{
              uri:
                item.images?.[0] ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
            }}
            style={S.cardImg}
            resizeMode="cover"
          />
          {/* Discount badge */}
          {discountPct && (
            <View style={S.discountBadge}>
              <Text style={S.discountText}>{discountPct}% OFF</Text>
            </View>
          )}
          {/* Rating + time row at bottom */}
          <View style={S.imgBottomRow}>
            <View style={S.ratingPill}>
              <Ionicons name="star" size={9} color="#fff" />
              <Text style={S.ratingPillTxt}> {rating.toFixed(1)}</Text>
            </View>
            <View style={S.timePill}>
              <Ionicons name="time-outline" size={9} color="#fff" />
              <Text style={S.timePillTxt}> {deliveryTime} min</Text>
            </View>
          </View>
        </View>

        {/* Right — Info */}
        <View style={S.cardBody}>
          {/* Title + Veg badge */}
          <View style={S.cardTitleRow}>
            <Text style={S.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={S.vegBadge}>
              <View style={[S.vegDot, { backgroundColor: isVeg ? '#22c55e' : '#ef4444' }]} />
              <Text style={[S.vegBadgeTxt, { color: isVeg ? '#22c55e' : '#ef4444' }]}>
                {isVeg ? 'Veg' : 'Non-Veg'}
              </Text>
            </View>
          </View>

          {/* Subtitle */}
          <Text style={S.cardSubtitle} numberOfLines={1}>
            {item.category || 'Homemade'} • {item.partner?.businessName || 'Home Kitchen'}
          </Text>

          {/* Tags row */}
          <View style={S.tagsRow}>
            <View style={S.tag}>
              <Ionicons name="bicycle-outline" size={10} color={C.textSecondary} />
              <Text style={S.tagTxt}> Free Delivery</Text>
            </View>
            <View style={S.tag}>
              <Ionicons name="shield-checkmark-outline" size={10} color={C.textSecondary} />
              <Text style={S.tagTxt}> No Minimum</Text>
            </View>
          </View>

          {/* Dishes + Distance */}
          <View style={S.metaRow}>
            <Ionicons name="layers-outline" size={11} color={C.textTertiary} />
            <Text style={S.metaTxt}> {dishCount}+ Dishes</Text>
            <Text style={S.metaDot}> </Text>
            <Ionicons name="location-outline" size={11} color={C.textTertiary} />
            <Text style={S.metaTxt}> {distanceKm} km away</Text>
          </View>

          {/* Price + CTA */}
          <View style={S.cardFooter}>
            <View>
              <Text style={S.fromLabel}>From</Text>
              <Text style={S.price}>
                ₹{pricePerDay}
                <Text style={S.perDay}>/day</Text>
              </Text>
            </View>
            <TouchableOpacity style={S.viewBtn} onPress={onPress}>
              <Text style={S.viewBtnTxt}>View Plans </Text>
              <Ionicons name="arrow-forward" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Banner Carousel ──────────────────────────────────────────────────────────
const BannerCarousel = ({ C }: { C: ColorScheme }) => {
  const [idx, setIdx] = useState(0);
  const ref = useRef<FlatList>(null);

  const { data: banners = [], isLoading } = useQuery<any[]>({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await api.get('/banners');
      return res.data?.data || [];
    },
  });

  const fallbackBanners = [
    {
      _id: 'fb1',
      title: 'FREE Delivery',
      subtitle: 'Save ₹400 every month\non all monthly plans',
      bg: '#FF7A18',
      cta: 'Browse Plans',
      icon: 'bicycle-outline',
    },
    {
      _id: 'fb2',
      title: '₹50 OFF',
      subtitle: 'On your first order\nUse code: TIFFO50',
      bg: '#1a6b3a',
      cta: 'Order Now',
      icon: 'gift-outline',
    },
    {
      _id: 'fb3',
      title: 'Try Monthly',
      subtitle: 'Best value meal plans\nStarting ₹99/day',
      bg: '#1A73E8',
      cta: 'Explore',
      icon: 'calendar-outline',
    },
  ];

  const displayBanners = banners.length > 0 ? banners : fallbackBanners;

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const t = setInterval(() => {
      const next = (idx + 1) % displayBanners.length;
      ref.current?.scrollToIndex({ index: next, animated: true });
      setIdx(next);
    }, 3500);
    return () => clearInterval(t);
  }, [idx, displayBanners.length]);

  if (isLoading) {
    return (
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 12,
          height: 140,
          backgroundColor: C.surfaceCard,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={C.secondary} />
      </View>
    );
  }

  return (
    <View style={{ marginHorizontal: 16, marginTop: 12 }}>
      <FlatList
        ref={ref}
        data={displayBanners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e: any) =>
          setIdx(Math.round(e.nativeEvent.contentOffset.x / (SW - 32)))
        }
        keyExtractor={(b: any) => b._id || b.id}
        renderItem={({ item }: { item: any }) => (
          <View
            style={{
              backgroundColor: item.bg || '#FF7A18',
              width: SW - 32,
              borderRadius: 20,
              padding: 20,
              paddingRight: 12,
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: 140,
              overflow: 'hidden',
            }}
          >
            {/* Decorative circle */}
            <View
              style={{
                position: 'absolute',
                right: -30,
                top: -30,
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                right: 60,
                bottom: -50,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 30 }}>
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.88)',
                  marginTop: 6,
                  lineHeight: 19,
                }}
              >
                {item.subtitle}
              </Text>
              <TouchableOpacity
                style={{
                  marginTop: 14,
                  backgroundColor: '#fff',
                  alignSelf: 'flex-start',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 7,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ color: item.bg || '#FF7A18', fontWeight: '700', fontSize: 12 }}>
                  {item.cta || 'Browse Plans'}
                </Text>
                <Ionicons name="arrow-forward" size={12} color={item.bg || '#FF7A18'} />
              </TouchableOpacity>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center', width: 100 }}>
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name={(item.icon || 'bicycle-outline') as any} size={48} color="#fff" />
              </View>
            </View>
          </View>
        )}
      />
      {/* Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 }}>
        {displayBanners.map((_, i) => (
          <View
            key={i}
            style={
              {
                width: i === idx ? 20 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === idx ? C.secondary : C.border,
                transition: 'width 0.3s',
              } as any
            }
          />
        ))}
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { user } = useAuth();
  const { success, error: showError } = useAlert();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [activeCat, setActiveCat] = useState('All');

  const [activeLocCoords, setActiveLocCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeLocName, setActiveLocName] = useState<string>('Home');
  const [locModalVisible, setLocModalVisible] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);

  const loadSavedAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem('saved_addresses');
      setSavedAddresses(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.error('Failed to load saved addresses:', e);
    }
  };

  useEffect(() => {
    if (user?.address?.city) {
      setActiveLocName(user.address.city);
      if (user.address.coordinates?.lat && user.address.coordinates?.lng) {
        setActiveLocCoords({
          lat: user.address.coordinates.lat,
          lng: user.address.coordinates.lng,
        });
      } else {
        setActiveLocCoords(null);
      }
    } else {
      setActiveLocName('Select Location...');
      setActiveLocCoords(null);
    }
    loadSavedAddresses();
  }, [user]);

  const handleGPSLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showError('Permission Denied', 'Location permissions are required.');
        setGpsLoading(false);
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
      setActiveLocCoords(coords);
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        const name = geocode?.city || geocode?.subregion || geocode?.district || 'Near You';
        setActiveLocName(`Near ${name} (GPS)`);
        success('Location Set', `Location updated to near ${name}!`);
      } catch {
        setActiveLocName('Near You (GPS)');
        success('Location Set', 'Location updated to current GPS position!');
      }
      setLocModalVisible(false);
    } catch (err) {
      showError('GPS Failed', 'Could not retrieve your current GPS coordinates.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSelectAddress = (addr: any) => {
    setActiveLocName(
      addr.street ? `${addr.type}: ${addr.street.split(',')[0]}` : `${addr.type}: ${addr.city}`,
    );
    if (addr.coordinates?.lat && addr.coordinates?.lng) {
      setActiveLocCoords({ lat: addr.coordinates.lat, lng: addr.coordinates.lng });
    } else {
      setActiveLocCoords(null);
    }
    success('Address Selected', `Active location set to ${addr.type}!`);
    setLocModalVisible(false);
  };

  const {
    data: tiffins = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<Tiffin[]>({
    queryKey: ['tiffins', 'active', activeLocCoords?.lat, activeLocCoords?.lng],
    queryFn: async () => {
      let url = '/tiffins?limit=20&status=active';
      if (activeLocCoords?.lat && activeLocCoords?.lng) {
        url += `&lat=${activeLocCoords.lat}&lng=${activeLocCoords.lng}&radius=15`;
      }
      const res = await api.get<ApiResponse<Tiffin[]>>(url);
      return res.data?.data || [];
    },
  });

  const filtered = useMemo(() => {
    if (activeCat === 'All') return tiffins;
    return tiffins.filter((t) => t.category?.toLowerCase().includes(activeCat.toLowerCase()));
  }, [tiffins, activeCat]);

  const kitchensNear = filtered.length || 11;

  const greeting = () => {
    const h = new Date().getHours();
    const emoji = h < 12 ? '👋' : h < 17 ? '☀️' : '🌙';
    const prefix = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    const name = user?.name?.split(' ')[0];
    return { text: name ? `${prefix}, ${name}` : prefix, emoji };
  };

  const { text: greetText, emoji: greetEmoji } = greeting();

  // Derive city + state from user address or location name
  const locationDisplay = (() => {
    if (user?.address?.city) {
      const state = user.address.state || (user.address as any)?.stateName || 'MP';
      return `${user.address.city}, ${state}`;
    }
    return activeLocName;
  })();

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.secondary} />
        }
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={S.header}>
          {/* Location row */}
          <View style={S.headerLeft}>
            <TouchableOpacity
              style={S.locRow}
              onPress={() => {
                loadSavedAddresses();
                setLocModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="location-sharp" size={15} color={C.secondary} />
              <Text style={S.locTxt} numberOfLines={1}>
                {locationDisplay}
              </Text>
              <Ionicons name="chevron-down" size={14} color={C.textSecondary} />
            </TouchableOpacity>
            {/* Greeting */}
            <Text style={S.greetTxt}>
              {greetText} {greetEmoji}
            </Text>
            <Text style={S.greetSub}>Let's find your perfect meal</Text>
          </View>

          {/* Right — Bell + Avatar */}
          <View style={S.headerRight}>
            <TouchableOpacity
              style={S.notifBtn}
              onPress={() => (nav as any).navigate('Notifications')}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={22} color={C.textPrimary} />
              <View style={S.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={S.avatarWrap}
              onPress={() => (nav as any).navigate('Profile')}
              activeOpacity={0.85}
            >
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={S.avatarImg} />
              ) : (
                <View style={S.avatarFallback}>
                  <Text style={S.avatarFallbackTxt}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Search ────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={S.search}
          onPress={() => (nav as any).navigate('Explore')}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={18} color={C.textTertiary} />
          <Text style={S.searchTxt}>Search homemade meals, tiffins...</Text>
          <View style={S.filterBtn}>
            <Ionicons name="options-outline" size={14} color={C.secondary} />
            <Text style={S.filterBtnTxt}>Filters</Text>
          </View>
        </TouchableOpacity>

        {/* ── Banner ────────────────────────────────────────────────────── */}
        <BannerCarousel C={C} />

        {/* ── Categories ────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 8, marginTop: 20 }}
        >
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.label}
              style={[S.chip, activeCat === c.label && S.chipActive]}
              onPress={() => setActiveCat(c.label)}
            >
              <Text style={S.chipEmoji}>{c.emoji}</Text>
              <Text style={[S.chipTxt, activeCat === c.label && S.chipTxtActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Section header ────────────────────────────────────────────── */}
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Popular Meal Plans</Text>
          <Text style={S.sectionBadge}>{kitchensNear} kitchens near you</Text>
        </View>

        {/* ── Feed ──────────────────────────────────────────────────────── */}
        {isLoading ? (
          <>
            <SkeletonCard C={C} />
            <SkeletonCard C={C} />
            <SkeletonCard C={C} />
          </>
        ) : isError ? (
          <View style={S.empty}>
            <Ionicons
              name="warning-outline"
              size={48}
              color={C.textSecondary}
              style={{ marginBottom: 12 }}
            />
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.textPrimary }}>
              Oops! Something went wrong
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: C.textSecondary,
                marginTop: 8,
                textAlign: 'center',
                paddingHorizontal: 32,
              }}
            >
              {(error as any)?.message || 'Failed to load meals.'}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={{
                marginTop: 16,
                backgroundColor: C.secondary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={S.empty}>
            <Ionicons
              name="restaurant-outline"
              size={48}
              color={C.textSecondary}
              style={{ marginBottom: 12 }}
            />
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.textPrimary }}>
              No meals found
            </Text>
            <Text style={{ fontSize: 14, color: C.textSecondary, marginTop: 8 }}>
              Try a different category
            </Text>
          </View>
        ) : (
          filtered.map((t, i) => (
            <TiffinCard
              key={t._id}
              item={t}
              index={i}
              C={C}
              kitchensNear={kitchensNear}
              onPress={() => nav.navigate('TiffinDetail', { tiffinId: t._id })}
            />
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Location Modal ────────────────────────────────────────────────── */}
      <Modal
        visible={locModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLocModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <View style={S.modalContent}>
            <View style={S.modalHandle} />
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>Select delivery location</Text>
              <TouchableOpacity onPress={() => setLocModalVisible(false)}>
                <Ionicons name="close" size={24} color={C.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[S.gpsBtn, gpsLoading && S.gpsBtnActive]}
              onPress={handleGPSLocation}
              disabled={gpsLoading}
              activeOpacity={0.8}
            >
              {gpsLoading ? (
                <ActivityIndicator color={C.secondary} size="small" />
              ) : (
                <>
                  <Ionicons name="location-outline" size={20} color={C.secondary} />
                  <Text style={S.gpsBtnTxt}>Use current location (GPS)</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={S.modalDivider} />

            <View style={S.savedAddressesHeader}>
              <Text style={S.modalSubTitle}>SAVED ADDRESSES</Text>
              <TouchableOpacity
                onPress={() => {
                  setLocModalVisible(false);
                  nav.navigate('SavedAddresses');
                }}
              >
                <Text style={S.manageAddressesBtnTxt}>Manage</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={S.modalAddressesList} showsVerticalScrollIndicator={false}>
              {savedAddresses.length === 0 ? (
                <View style={S.emptyAddresses}>
                  <Text style={S.emptyAddressesTxt}>No saved addresses found.</Text>
                </View>
              ) : (
                savedAddresses.map((addr) => (
                  <TouchableOpacity
                    key={addr.id}
                    style={S.addressItem}
                    onPress={() => handleSelectAddress(addr)}
                    activeOpacity={0.7}
                  >
                    <View style={S.addressIconWrap}>
                      <Ionicons
                        name={
                          addr.type === 'Home'
                            ? 'home-outline'
                            : addr.type === 'Work'
                              ? 'business-outline'
                              : 'location-outline'
                        }
                        size={18}
                        color={C.secondary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={S.addressTypeTxt}>{addr.type}</Text>
                      <Text style={S.addressDetailsTxt} numberOfLines={2}>
                        {addr.street}, {addr.city}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.background },

    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 4,
    },
    headerLeft: { flex: 1, gap: 2 },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingTop: 2,
    },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 },
    locTxt: { fontSize: 15, fontWeight: '700', color: C.textPrimary, maxWidth: 180 },
    greetTxt: {
      fontSize: 22,
      fontWeight: '800',
      color: C.textPrimary,
      lineHeight: 28,
      marginTop: 2,
    },
    greetSub: { fontSize: 13, color: C.textSecondary, marginTop: 1 },

    // Avatar + Notif
    notifBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: C.surface,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      borderWidth: 1,
      borderColor: C.border,
    },
    notifDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: C.secondary,
      borderWidth: 1.5,
      borderColor: C.background,
    },
    avatarWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: C.secondary,
    },
    avatarImg: { width: '100%', height: '100%' },
    avatarFallback: {
      width: '100%',
      height: '100%',
      backgroundColor: C.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarFallbackTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },

    // Search
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 14,
      backgroundColor: C.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderWidth: 1,
      borderColor: C.border,
    },
    searchTxt: { flex: 1, fontSize: 14, color: C.textTertiary, marginLeft: 8 },
    filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surfaceCard,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 4,
      borderWidth: 1,
      borderColor: C.border,
    },
    filterBtnTxt: { fontSize: 12, fontWeight: '700', color: C.secondary },

    // Category chips
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 100,
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: C.border,
      gap: 5,
    },
    chipActive: {
      backgroundColor: C.primaryMuted,
      borderColor: C.secondary,
      borderWidth: 1.5,
    },
    chipEmoji: { fontSize: 14 },
    chipTxt: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
    chipTxtActive: { color: C.secondary },

    // Section header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 22,
      marginBottom: 14,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: C.textPrimary },
    sectionBadge: { fontSize: 12, fontWeight: '600', color: C.secondary },

    // ── Horizontal Card ──────────────────────────────────────────────────
    card: {
      backgroundColor: C.surfaceCard,
      marginHorizontal: 16,
      marginBottom: 14,
      borderRadius: 18,
      overflow: 'hidden',
      flexDirection: 'row',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
      minHeight: 150,
    },
    cardImageCol: {
      width: 130,
      position: 'relative',
    },
    cardImg: {
      width: '100%',
      height: '100%',
      backgroundColor: C.surface,
    },
    discountBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: '#22c55e',
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 4,
    },
    discountText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    imgBottomRow: {
      position: 'absolute',
      bottom: 10,
      left: 8,
      right: 8,
      flexDirection: 'row',
      gap: 5,
    },
    ratingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.secondary,
      borderRadius: 20,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    ratingPillTxt: { color: '#fff', fontSize: 9, fontWeight: '700' },
    timePill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderRadius: 20,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    timePillTxt: { color: '#fff', fontSize: 9, fontWeight: '600' },

    // Card body (right)
    cardBody: {
      flex: 1,
      padding: 12,
      justifyContent: 'space-between',
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 6,
    },
    cardName: {
      fontSize: 15,
      fontWeight: '800',
      color: C.textPrimary,
      flex: 1,
      lineHeight: 20,
    },
    vegBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      marginTop: 2,
    },
    vegDot: { width: 7, height: 7, borderRadius: 4 },
    vegBadgeTxt: { fontSize: 10, fontWeight: '700' },
    cardSubtitle: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
      marginTop: 7,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: C.border,
    },
    tagTxt: { fontSize: 10, color: C.textSecondary, fontWeight: '500' },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    metaTxt: { fontSize: 10, color: C.textTertiary },
    metaDot: { fontSize: 10, color: C.textTertiary },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    fromLabel: {
      fontSize: 10,
      color: C.textTertiary,
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: 1,
    },
    price: { fontSize: 18, fontWeight: '900', color: C.textPrimary },
    perDay: { fontSize: 12, fontWeight: '400', color: C.textSecondary },
    viewBtn: {
      backgroundColor: C.secondary,
      borderRadius: 10,
      paddingHorizontal: 11,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewBtnTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },

    // Skeleton
    skLine: { height: 12, backgroundColor: C.skeletonBase, borderRadius: 6, marginBottom: 2 },
    empty: { alignItems: 'center', paddingVertical: 60 },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: C.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 24,
      maxHeight: '75%',
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: C.border,
      alignSelf: 'center',
      marginBottom: 16,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: C.textPrimary },
    modalSubTitle: { fontSize: 12, fontWeight: '800', color: C.textSecondary, letterSpacing: 0.5 },
    gpsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: C.secondary,
      borderRadius: 14,
      height: 50,
      gap: 8,
      backgroundColor: C.secondaryMuted,
    },
    gpsBtnActive: { backgroundColor: C.secondary, borderColor: C.secondary },
    gpsBtnTxt: { color: C.secondary, fontSize: 14, fontWeight: '700' },
    modalDivider: { height: 1, backgroundColor: C.divider, marginVertical: 18 },
    savedAddressesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    manageAddressesBtnTxt: { fontSize: 13, fontWeight: '700', color: C.secondary },
    modalAddressesList: { maxHeight: 240 },
    emptyAddresses: { paddingVertical: 20, alignItems: 'center' },
    emptyAddressesTxt: { fontSize: 13, color: C.textSecondary },
    addressItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: C.divider,
      gap: 12,
    },
    addressIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: C.secondaryMuted,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addressTypeTxt: { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
    addressDetailsTxt: { fontSize: 12, color: C.textSecondary, lineHeight: 16 },
  });
