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
  { label: 'All', icon: 'restaurant-outline' as const },
  { label: 'Gujarati', icon: 'restaurant-outline' as const },
  { label: 'Punjabi', icon: 'flame-outline' as const },
  { label: 'South Indian', icon: 'leaf-outline' as const },
  { label: 'Bengali', icon: 'fish-outline' as const },
  { label: 'Maharashtrian', icon: 'restaurant-outline' as const },
  { label: 'Healthy', icon: 'nutrition-outline' as const },
];

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
    <Animated.View style={[S.card, { opacity: anim }]}>
      <View style={[S.cardImgWrap, { height: 190, backgroundColor: C.skeletonBase }]} />
      <View style={{ padding: 16 }}>
        <View style={[S.skLine, { width: '65%' }]} />
        <View style={[S.skLine, { width: '45%', marginTop: 8 }]} />
        <View style={[S.skLine, { width: '30%', marginTop: 8 }]} />
      </View>
    </Animated.View>
  );
};

const TiffinCard = ({
  item,
  onPress,
  index,
  C,
}: {
  item: Tiffin;
  onPress: () => void;
  index: number;
  C: ColorScheme;
}) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const S = useMemo(() => createStyles(C), [C]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 350,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 350,
        delay: index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pricePerDay = typeof item.price === 'object' ? item.price?.daily : item.price;
  const rating = item.rating?.average || 4.5;

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
        <View style={S.cardImgWrap}>
          <Image
            source={{
              uri:
                item.images?.[0] ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
            }}
            style={S.cardImg}
            resizeMode="cover"
          />
          <View style={S.ratingBadge}>
            <Text style={S.ratingText}>★ {rating.toFixed(1)}</Text>
          </View>
          <View style={[S.vegBox, { borderColor: item.isVeg ? C.veg : C.nonVeg }]}>
            <View style={[S.vegDot, { backgroundColor: item.isVeg ? C.veg : C.nonVeg }]} />
          </View>
          {index === 0 && (
            <View style={[S.offerBadge, { flexDirection: 'row', alignItems: 'center', gap: 3 }]}>
              <Ionicons name="gift" size={11} color="#fff" />
              <Text style={S.offerText}>50% OFF</Text>
            </View>
          )}
        </View>
        <View style={S.cardBody}>
          <Text style={S.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={S.metaRow}>
            <Text style={S.metaText}>{item.category}</Text>
            <Text style={S.bullet}>•</Text>
            <Text style={S.metaText} numberOfLines={1}>
              {item.partner?.businessName || 'Home Kitchen'}
            </Text>
          </View>
          <View style={S.cardDivider} />
          <View style={S.cardFooter}>
            <View>
              <Text style={S.priceLabel}>Starts at</Text>
              <Text style={S.price}>
                ₹{pricePerDay}
                <Text style={S.perDay}>/day</Text>
              </Text>
            </View>
            <TouchableOpacity style={S.viewBtn} onPress={onPress}>
              <Text style={S.viewBtnTxt}>View Plans</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

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

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      const next = (idx + 1) % banners.length;
      ref.current?.scrollToIndex({ index: next, animated: true });
      setIdx(next);
    }, 3200);
    return () => clearInterval(t);
  }, [idx, banners.length]);

  if (isLoading) {
    return (
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 8,
          height: 90,
          backgroundColor: C.surfaceCard,
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={{ marginHorizontal: 16, marginTop: 8 }}>
      <FlatList
        ref={ref}
        data={banners}
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
              backgroundColor: item.bg || '#E23744',
              width: SW - 32,
              borderRadius: 16,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: 90,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                {item.subtitle}
              </Text>
            </View>
            <Ionicons name={(item.icon || 'gift-outline') as any} size={42} color="#fff" />
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 }}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === idx ? 18 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === idx ? '#E23744' : C.border,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { user } = useAuth();
  const { success, error: showError, warning, confirm } = useAlert();
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
      if (stored) {
        setSavedAddresses(JSON.parse(stored));
      } else {
        setSavedAddresses([]);
      }
    } catch (e) {
      console.error('Failed to load saved addresses:', e);
    }
  };

  // Sync with user's primary address on load or profile update
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
        showError(
          'Permission Denied',
          'Location permissions are required to fetch GPS coordinates.',
        );
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
        if (geocode?.city || geocode?.subregion || geocode?.district) {
          const name = geocode.city || geocode.subregion || geocode.district || 'Near You';
          setActiveLocName(`Near ${name} (GPS)`);
          success('Location Set', `Location updated to near ${name}!`);
        } else {
          setActiveLocName('Near You (GPS)');
          success('Location Set', 'Location updated to current GPS position!');
        }
      } catch (err) {
        setActiveLocName('Near You (GPS)');
        success('Location Set', 'Location updated to current GPS position!');
      }
      setLocModalVisible(false);
    } catch (err) {
      console.error(err);
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

  const filterCat = (cat: string) => {
    setActiveCat(cat);
  };

  const greeting = () => {
    const h = new Date().getHours();
    const prefix = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return user?.name ? `${prefix}, ${user.name.split(' ')[0]}` : prefix;
  };

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />
        }
      >
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity
            style={S.locRow}
            onPress={() => {
              loadSavedAddresses();
              setLocModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="location-sharp" size={16} color={C.primary} />
            <Text style={S.locTxt} numberOfLines={1}>
              {activeLocName}
            </Text>
            <Ionicons name="chevron-down" size={14} color={C.textSecondary} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={S.greet}>{greeting()}</Text>
            <View style={S.avatar}>
              <Text style={S.avatarTxt}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <TouchableOpacity
          style={S.search}
          onPress={() => (nav as any).navigate('Explore')}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={18} color={C.textTertiary} />
          <Text style={S.searchTxt}>Search homemade meals...</Text>
          <View style={S.filterBtn}>
            <Ionicons name="options-outline" size={16} color={C.primary} />
          </View>
        </TouchableOpacity>

        <BannerCarousel C={C} />

        {/* Categories */}
        <Text style={S.sectionTitle}>What's your craving?</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 8 }}
        >
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.label}
              style={[S.chip, activeCat === c.label && S.chipActive]}
              onPress={() => filterCat(c.label)}
            >
              <Ionicons
                name={c.icon}
                size={14}
                color={activeCat === c.label ? C.primary : C.textSecondary}
              />
              <Text style={[S.chipTxt, activeCat === c.label && S.chipTxtActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feed */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginHorizontal: 16,
            marginTop: 20,
            marginBottom: 12,
          }}
        >
          <Text style={S.sectionTitle2}>
            {activeCat === 'All' ? 'All Meal Plans' : `${activeCat} Meals`}
          </Text>
          <Text style={{ fontSize: 12, color: C.textTertiary }}>{filtered.length} available</Text>
        </View>

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
                backgroundColor: C.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Try Again</Text>
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
              onPress={() => nav.navigate('TiffinDetail', { tiffinId: t._id })}
            />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal
        visible={locModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLocModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <View style={S.modalContent}>
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>Select delivery location</Text>
              <TouchableOpacity onPress={() => setLocModalVisible(false)}>
                <Ionicons name="close" size={24} color={C.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* GPS Button */}
            <TouchableOpacity
              style={[S.gpsBtn, gpsLoading && S.gpsBtnActive]}
              onPress={handleGPSLocation}
              disabled={gpsLoading}
              activeOpacity={0.8}
            >
              {gpsLoading ? (
                <ActivityIndicator color={C.primary} size="small" />
              ) : (
                <>
                  <Ionicons name="location-outline" size={20} color={C.primary} />
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
                        color={C.primary}
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

const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locTxt: { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginHorizontal: 4 },
    greet: { fontSize: 12, color: C.textSecondary },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: C.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginVertical: 8,
      backgroundColor: C.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: C.border,
    },
    searchTxt: { flex: 1, fontSize: 14, color: C.textTertiary, marginLeft: 8 },
    filterBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: C.primaryMuted,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: C.textPrimary,
      marginLeft: 16,
      marginTop: 20,
      marginBottom: 12,
    },
    sectionTitle2: { fontSize: 17, fontWeight: '700', color: C.textPrimary },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 100,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: C.border,
      gap: 6,
    },
    chipActive: { backgroundColor: C.primaryMuted, borderColor: C.primary },
    chipTxt: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
    chipTxtActive: { color: C.primary },
    card: {
      backgroundColor: C.surfaceCard,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
    cardImgWrap: { position: 'relative', height: 190 },
    cardImg: { width: '100%', height: '100%', backgroundColor: C.surface },
    ratingBadge: {
      position: 'absolute',
      bottom: 10,
      left: 12,
      backgroundColor: C.secondary,
      borderRadius: 100,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    ratingText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    vegBox: {
      position: 'absolute',
      top: 10,
      right: 12,
      width: 18,
      height: 18,
      borderRadius: 3,
      borderWidth: 1.5,
      backgroundColor: C.surfaceCard,
      justifyContent: 'center',
      alignItems: 'center',
    },
    vegDot: { width: 8, height: 8, borderRadius: 4 },
    offerBadge: {
      position: 'absolute',
      top: 10,
      left: 12,
      backgroundColor: C.veg,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    offerText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    cardBody: { padding: 16 },
    cardName: { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    metaText: { fontSize: 12, color: C.textSecondary },
    bullet: { fontSize: 12, color: C.border, marginHorizontal: 6 },
    cardDivider: { height: 1, backgroundColor: C.divider, marginVertical: 12 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceLabel: {
      fontSize: 10,
      color: C.textTertiary,
      fontWeight: '600',
      marginBottom: 2,
      textTransform: 'uppercase',
    },
    price: { fontSize: 20, fontWeight: '800', color: C.textPrimary },
    perDay: { fontSize: 13, fontWeight: '400', color: C.textSecondary },
    viewBtn: {
      backgroundColor: C.primary,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    viewBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
    skLine: { height: 13, backgroundColor: C.skeletonBase, borderRadius: 6 },
    empty: { alignItems: 'center', paddingVertical: 60 },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: C.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: '75%',
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: C.textPrimary,
    },
    modalSubTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: C.textSecondary,
      letterSpacing: 0.5,
    },
    gpsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: C.primary,
      borderRadius: 12,
      height: 48,
      gap: 8,
      backgroundColor: C.primaryMuted,
    },
    gpsBtnActive: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    gpsBtnTxt: {
      color: C.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    modalDivider: {
      height: 1,
      backgroundColor: C.divider,
      marginVertical: 18,
    },
    savedAddressesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    manageAddressesBtnTxt: {
      fontSize: 13,
      fontWeight: '700',
      color: C.primary,
    },
    modalAddressesList: {
      maxHeight: 240,
    },
    emptyAddresses: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    emptyAddressesTxt: {
      fontSize: 13,
      color: C.textSecondary,
    },
    addressItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: C.divider,
      gap: 12,
    },
    addressIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: C.primaryMuted,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addressTypeTxt: {
      fontSize: 14,
      fontWeight: '700',
      color: C.textPrimary,
      marginBottom: 2,
    },
    addressDetailsTxt: {
      fontSize: 12,
      color: C.textSecondary,
      lineHeight: 16,
    },
  });
