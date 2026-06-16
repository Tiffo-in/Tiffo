import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

interface SavedAddress {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const geocodeCity = (city: string) => {
  const c = city.trim().toLowerCase();
  if (c.includes('delhi')) return { lat: 28.6139, lng: 77.209 };
  if (c.includes('pune')) return { lat: 18.5204, lng: 73.8567 };
  if (c.includes('mumbai') || c.includes('bombay')) return { lat: 19.076, lng: 72.8777 };
  if (c.includes('bangalore') || c.includes('bengaluru')) return { lat: 12.9716, lng: 77.5946 };
  if (c.includes('chennai') || c.includes('madras')) return { lat: 13.0827, lng: 80.2707 };
  if (c.includes('kolkata') || c.includes('calcutta')) return { lat: 22.5726, lng: 88.3639 };
  if (c.includes('hyderabad')) return { lat: 17.385, lng: 78.4867 };
  if (c.includes('ahmedabad')) return { lat: 23.0225, lng: 72.5714 };
  if (c.includes('jaipur')) return { lat: 26.9124, lng: 75.7873 };
  if (c.includes('noida')) return { lat: 28.5355, lng: 77.391 };
  if (c.includes('gurgaon') || c.includes('gurugram')) return { lat: 28.4595, lng: 77.0266 };
  return { lat: 20.5937, lng: 78.9629 };
};

export default function SavedAddressesScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { user, updateProfile } = useAuth();
  const { success, error, warning, confirm } = useAlert();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Form Fields
  const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Load addresses from AsyncStorage
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const stored = await AsyncStorage.getItem('saved_addresses');
        let parsed: SavedAddress[] = stored ? JSON.parse(stored) : [];

        // If no addresses saved, but user has an address on backend, seed it!
        if (parsed.length === 0 && user?.address?.street) {
          const seeded: SavedAddress = {
            id: 'backend_default',
            type: 'Home',
            street: user.address.street,
            city: user.address.city || '',
            state: user.address.state || '',
            pincode: user.address.pincode || '',
            isDefault: true,
          };
          parsed = [seeded];
          await AsyncStorage.setItem('saved_addresses', JSON.stringify(parsed));
        }

        setAddresses(parsed);
      } catch (e) {
        console.error('Failed to load addresses:', e);
      } finally {
        setLoading(false);
      }
    };
    loadAddresses();
  }, [user]);

  const saveToStorage = async (newAddresses: SavedAddress[]) => {
    await AsyncStorage.setItem('saved_addresses', JSON.stringify(newAddresses));
    setAddresses(newAddresses);
  };

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setType('Home');
    setStreet('');
    setCity('');
    setStateName('');
    setPincode('');
    setGpsCoords(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setType(addr.type);
    setStreet(addr.street);
    setCity(addr.city);
    setStateName(addr.state);
    setPincode(addr.pincode);
    setGpsCoords(addr.coordinates || null);
    setModalVisible(true);
  };

  const handleSaveAddress = async () => {
    if (!street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      warning('Validation Error', 'All fields are required.');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      warning('Validation Error', 'Pincode must be a 6-digit number.');
      return;
    }

    setSaving(true);
    try {
      let updatedList = [...addresses];
      const resolvedCoords = gpsCoords || geocodeCity(city);

      if (editingAddress) {
        // Edit existing
        updatedList = updatedList.map((addr) =>
          addr.id === editingAddress.id
            ? {
                ...addr,
                type,
                street: street.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim(),
                coordinates: resolvedCoords,
              }
            : addr,
        );
      } else {
        // Create new
        const newAddr: SavedAddress = {
          id: Date.now().toString(),
          type,
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          isDefault: addresses.length === 0, // default if first one
          coordinates: resolvedCoords,
        };
        updatedList.push(newAddr);
      }

      await saveToStorage(updatedList);

      // If this address is set as default (or it's the only one), sync with backend!
      const activeDefault = updatedList.find((a) => a.isDefault);
      if (activeDefault) {
        await updateProfile(user?.name || '', user?.phone || '', {
          street: activeDefault.street,
          city: activeDefault.city,
          state: activeDefault.state,
          pincode: activeDefault.pincode,
          coordinates: activeDefault.coordinates,
        });
      }

      setModalVisible(false);
    } catch (err) {
      error('Error', 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updatedList = addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }));

      await saveToStorage(updatedList);

      // Sync the new default address with the backend!
      const newDefault = updatedList.find((addr) => addr.id === id);
      if (newDefault) {
        await updateProfile(user?.name || '', user?.phone || '', {
          street: newDefault.street,
          city: newDefault.city,
          state: newDefault.state,
          pincode: newDefault.pincode,
          coordinates: newDefault.coordinates,
        });
      }
    } catch (err) {
      error('Error', 'Failed to update primary address on server.');
    }
  };

  const handleDeleteAddress = (id: string) => {
    confirm(
      'Confirm Delete',
      'Are you sure you want to delete this address?',
      async () => {
        const toDelete = addresses.find((a) => a.id === id);
        const updatedList = addresses.filter((addr) => addr.id !== id);

        // If we deleted the default address, set another one as default
        if (toDelete?.isDefault && updatedList.length > 0) {
          updatedList[0].isDefault = true;
        }

        await saveToStorage(updatedList);

        // Sync default or clear backend address if none left
        const activeDefault = updatedList.find((a) => a.isDefault);
        await updateProfile(
          user?.name || '',
          user?.phone || '',
          activeDefault
            ? {
                street: activeDefault.street,
                city: activeDefault.city,
                state: activeDefault.state,
                pincode: activeDefault.pincode,
                coordinates: activeDefault.coordinates,
              }
            : undefined,
        );
      },
      undefined,
      'Delete',
      'Cancel',
    );
  };

  const fetchGPS = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        error(
          'Permission Denied',
          'Location permissions are required to fetch current GPS coordinates.',
        );
        setGpsLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setGpsCoords(coords);

      // Auto-geocode to fill out the form
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (geocode) {
          if (geocode.city || geocode.subregion) {
            setCity(geocode.city || geocode.subregion || '');
          }
          if (geocode.region) {
            setStateName(geocode.region);
          }
          if (geocode.postalCode) {
            setPincode(geocode.postalCode);
          }
          const streetParts = [geocode.name, geocode.street, geocode.district].filter(Boolean);
          if (streetParts.length > 0) {
            setStreet(streetParts.join(', '));
          }
        }
      } catch (geoErr) {
        console.warn('Reverse geocoding failed:', geoErr);
      }

      success('GPS Success', 'Accurate GPS coordinates and address loaded successfully!');
    } catch (err) {
      console.error(err);
      error(
        'GPS Location Failed',
        'Could not retrieve GPS location coordinates. Please enter details manually.',
      );
    } finally {
      setGpsLoading(false);
    }
  };

  const getIconName = (t: 'Home' | 'Work' | 'Other') => {
    if (t === 'Home') return 'home-outline';
    if (t === 'Work') return 'business-outline';
    return 'location-outline';
  };

  return (
    <SafeAreaView style={S.safe} edges={['bottom']}>
      {loading ? (
        <View style={S.center}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={S.scroll}>
            <View style={S.headerTextContainer}>
              <Text style={S.title}>Manage Saved Addresses</Text>
              <Text style={S.subtitle}>Choose your default delivery location</Text>
            </View>

            {addresses.length === 0 ? (
              <View style={S.emptyCard}>
                <Ionicons
                  name="location-outline"
                  size={48}
                  color={C.textSecondary}
                  style={{ marginBottom: 12 }}
                />
                <Text style={S.emptyText}>No Saved Addresses Found</Text>
                <Text style={S.emptySubtext}>
                  Add an address to easily place orders and manage deliveries.
                </Text>
              </View>
            ) : (
              addresses.map((addr) => (
                <View key={addr.id} style={[S.card, addr.isDefault && S.cardActive]}>
                  <View style={S.cardHeader}>
                    <View style={S.typeRow}>
                      <View style={S.iconBox}>
                        <Ionicons name={getIconName(addr.type)} size={18} color={C.primary} />
                      </View>
                      <Text style={S.cardType}>{addr.type}</Text>
                      {addr.isDefault && (
                        <View style={S.defaultBadge}>
                          <Text style={S.defaultBadgeTxt}>PRIMARY</Text>
                        </View>
                      )}
                    </View>
                    <View style={S.actionRow}>
                      <TouchableOpacity style={S.iconBtn} onPress={() => handleOpenEditModal(addr)}>
                        <Ionicons name="pencil-outline" size={18} color={C.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={S.iconBtn}
                        onPress={() => handleDeleteAddress(addr.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color={C.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={S.cardStreet}>{addr.street}</Text>
                  <Text style={S.cardLocation}>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </Text>

                  {!addr.isDefault && (
                    <TouchableOpacity style={S.setBtn} onPress={() => handleSetDefault(addr.id)}>
                      <Ionicons
                        name="checkmark-outline"
                        size={14}
                        color={C.textSecondary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={S.setBtnTxt}>Set as Primary Address</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          {/* Add Address Floating Button */}
          <View style={S.bottomContainer}>
            <TouchableOpacity style={S.addBtn} onPress={handleOpenAddModal} activeOpacity={0.85}>
              <Ionicons name="add" size={22} color="#fff" style={{ marginRight: 6 }} />
              <Text style={S.addBtnTxt}>Add New Address</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Form */}
          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={S.modalOverlay}>
              <View style={S.modalContent}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>
                    {editingAddress ? 'Edit Address' : 'Add Address'}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={C.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled">
                  {/* GPS Locator Button */}
                  <TouchableOpacity
                    style={[S.gpsBtn, gpsCoords && S.gpsBtnActive]}
                    onPress={fetchGPS}
                    disabled={gpsLoading}
                    activeOpacity={0.85}
                  >
                    {gpsLoading ? (
                      <ActivityIndicator color={gpsCoords ? '#fff' : C.primary} size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name={gpsCoords ? 'location' : 'location-outline'}
                          size={18}
                          color={gpsCoords ? '#fff' : C.primary}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[S.gpsBtnTxt, gpsCoords && S.gpsBtnTxtActive]}>
                          {gpsCoords
                            ? `GPS Coordinates Loaded: ${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}`
                            : 'Use Current GPS Coordinates'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Location Type Selector */}
                  <Text style={S.formLabel}>ADDRESS TYPE</Text>
                  <View style={S.typeSelector}>
                    {(['Home', 'Work', 'Other'] as const).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[S.typeSelectorItem, type === t && S.typeSelectorItemActive]}
                        onPress={() => setType(t)}
                      >
                        <Ionicons
                          name={getIconName(t)}
                          size={16}
                          color={type === t ? '#fff' : C.textSecondary}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[S.typeSelectorTxt, type === t && S.typeSelectorTxtActive]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Street Input */}
                  <Text style={S.formLabel}>STREET / BUILDING / APARTMENT</Text>
                  <TextInput
                    style={S.modalInput}
                    placeholder="Enter street address"
                    placeholderTextColor={C.textTertiary}
                    value={street}
                    onChangeText={setStreet}
                  />

                  {/* City Input */}
                  <Text style={S.formLabel}>CITY</Text>
                  <TextInput
                    style={S.modalInput}
                    placeholder="Enter City"
                    placeholderTextColor={C.textTertiary}
                    value={city}
                    onChangeText={setCity}
                  />

                  {/* State Input */}
                  <Text style={S.formLabel}>STATE</Text>
                  <TextInput
                    style={S.modalInput}
                    placeholder="Enter State"
                    placeholderTextColor={C.textTertiary}
                    value={state}
                    onChangeText={setStateName}
                  />

                  {/* Pincode Input */}
                  <Text style={S.formLabel}>PINCODE</Text>
                  <TextInput
                    style={S.modalInput}
                    placeholder="6-digit pincode"
                    placeholderTextColor={C.textTertiary}
                    value={pincode}
                    onChangeText={(txt: string) => setPincode(txt.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </ScrollView>

                {/* Save Form Button */}
                <TouchableOpacity
                  style={S.saveFormBtn}
                  onPress={handleSaveAddress}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={S.saveFormBtnTxt}>Save Address</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: 20, paddingBottom: 100 },
    headerTextContainer: { marginBottom: 20 },
    title: { fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
    subtitle: { fontSize: 13, color: C.textSecondary },
    emptyCard: {
      backgroundColor: C.surfaceCard,
      borderRadius: 18,
      padding: 32,
      alignItems: 'center',
      marginTop: 20,
      borderWidth: 1,
      borderColor: C.border,
      borderStyle: 'dashed',
    },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 6 },
    emptySubtext: { fontSize: 12, color: C.textSecondary, textAlign: 'center', lineHeight: 18 },
    card: {
      backgroundColor: C.surfaceCard,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: C.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    cardActive: { borderColor: C.primary },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    typeRow: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: C.primaryMuted,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    cardType: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
    defaultBadge: {
      backgroundColor: C.successBg,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginLeft: 10,
    },
    defaultBadgeTxt: { fontSize: 9, fontWeight: '800', color: C.success },
    actionRow: { flexDirection: 'row', gap: 6 },
    iconBtn: { padding: 4 },
    cardStreet: {
      fontSize: 14,
      color: C.textPrimary,
      fontWeight: '500',
      marginBottom: 4,
      lineHeight: 20,
    },
    cardLocation: { fontSize: 12, color: C.textSecondary, marginBottom: 14 },
    setBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: C.divider,
      paddingTop: 12,
    },
    setBtnTxt: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
    bottomContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: C.background,
      borderTopWidth: 1,
      borderTopColor: C.divider,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.primary,
      borderRadius: 14,
      height: 52,
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    addBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // Modal
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
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: C.textPrimary },
    formLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: C.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    typeSelectorItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: C.border,
      borderRadius: 10,
      height: 40,
    },
    typeSelectorItemActive: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    typeSelectorTxt: { fontSize: 12, fontWeight: '700', color: C.textSecondary },
    typeSelectorTxtActive: { color: '#fff' },
    modalInput: {
      borderWidth: 1.5,
      borderColor: C.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 48,
      color: C.textPrimary,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 16,
      backgroundColor: C.surface,
    },
    saveFormBtn: {
      backgroundColor: C.primary,
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    saveFormBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
    gpsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: C.primary,
      borderRadius: 12,
      height: 46,
      marginBottom: 20,
      backgroundColor: C.primaryMuted,
    },
    gpsBtnActive: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    gpsBtnTxt: {
      color: C.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    gpsBtnTxtActive: {
      color: '#fff',
    },
  });
