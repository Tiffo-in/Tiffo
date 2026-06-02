import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '../../contexts/AlertContext';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

interface CreditCard {
  id: string;
  brand: 'Visa' | 'Mastercard';
  number: string;
  holder: string;
  expiry: string;
  bgGradient: [string, string];
}

interface UpiId {
  id: string;
  address: string;
  provider: 'GPay' | 'PhonePe' | 'Paytm' | 'UPI';
}

export default function PaymentMethodsScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { success, error, warning, confirm } = useAlert();

  const [cards, setCards] = useState<CreditCard[]>([
    {
      id: 'c1',
      brand: 'Visa',
      number: '•••• •••• •••• 4892',
      holder: 'RISHI PANDEY',
      expiry: '08/29',
      bgGradient: ['#E23744', '#B7122A'], // Red gradient matching Tiffo
    },
    {
      id: 'c2',
      brand: 'Mastercard',
      number: '•••• •••• •••• 9012',
      holder: 'RISHI PANDEY',
      expiry: '11/30',
      bgGradient: ['#1A1A1A', '#3A3A3A'], // Sleek black/dark-grey gradient
    },
  ]);

  const [upis, setUpis] = useState<UpiId[]>([
    { id: 'u1', address: 'rishipandey@okaxis', provider: 'GPay' },
    { id: 'u2', address: 'rishipandey@ybl', provider: 'PhonePe' },
  ]);

  // Modal controls
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [upiModalVisible, setUpiModalVisible] = useState(false);

  // Card form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // UPI form state
  const [upiAddress, setUpiAddress] = useState('');

  const handleAddUpi = () => {
    if (!upiAddress.trim()) {
      error('Error', 'Please enter a UPI ID.');
      return;
    }
    const cleanUpi = upiAddress.trim();
    if (!/^[\w.-]+@[\w.-]+$/.test(cleanUpi)) {
      warning('Validation Error', 'Please enter a valid UPI ID (e.g. user@okaxis).');
      return;
    }

    let provider: UpiId['provider'] = 'UPI';
    if (cleanUpi.includes('ok')) provider = 'GPay';
    else if (cleanUpi.includes('ybl') || cleanUpi.includes('ibl')) provider = 'PhonePe';
    else if (cleanUpi.includes('paytm')) provider = 'Paytm';

    const newUpi: UpiId = {
      id: Date.now().toString(),
      address: cleanUpi,
      provider,
    };

    setUpis([...upis, newUpi]);
    setUpiAddress('');
    setUpiModalVisible(false);
    success('Success', 'UPI ID linked successfully!');
  };

  const handleAddCard = () => {
    const cleanNumber = cardNumber.replace(/\s?/g, '');
    if (cleanNumber.length < 16) {
      warning('Validation Error', 'Card number must be 16 digits.');
      return;
    }
    if (!cardHolder.trim()) {
      warning('Validation Error', 'Cardholder name is required.');
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry.trim())) {
      warning('Validation Error', 'Expiry must be in MM/YY format.');
      return;
    }
    if (cardCvv.length < 3) {
      warning('Validation Error', 'CVV must be 3 or 4 digits.');
      return;
    }

    const brand: CreditCard['brand'] = cleanNumber.startsWith('4') ? 'Visa' : 'Mastercard';
    const maskedNumber = `•••• •••• •••• ${cleanNumber.slice(-4)}`;

    // Beautiful random gradient for cards
    const gradients: [string, string][] = [
      ['#257E3E', '#165727'], // Green veg gradient
      ['#FC8019', '#E06500'], // Orange secondary gradient
      ['#1A73E8', '#0D47A1'], // Blue info gradient
    ];
    const bgGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const newCard: CreditCard = {
      id: Date.now().toString(),
      brand,
      number: maskedNumber,
      holder: cardHolder.toUpperCase().trim(),
      expiry: cardExpiry.trim(),
      bgGradient,
    };

    setCards([...cards, newCard]);
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
    setCardCvv('');
    setCardModalVisible(false);
    success('Success', 'Card linked successfully!');
  };

  const handleDeleteCard = (id: string) => {
    confirm(
      'Delete Card',
      'Are you sure you want to remove this card?',
      () => setCards(cards.filter((c) => c.id !== id)),
      undefined,
      'Remove',
      'Cancel',
    );
  };

  const handleDeleteUpi = (id: string) => {
    confirm(
      'Remove UPI',
      'Are you sure you want to unlink this UPI ID?',
      () => setUpis(upis.filter((u) => u.id !== id)),
      undefined,
      'Unlink',
      'Cancel',
    );
  };

  const getProviderIcon = (p: UpiId['provider']) => {
    if (p === 'GPay') return 'logo-google';
    if (p === 'PhonePe') return 'wallet-outline';
    return 'phone-portrait-outline';
  };

  return (
    <SafeAreaView style={S.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={S.headerTextContainer}>
          <Text style={S.title}>Payments & Wallets</Text>
          <Text style={S.subtitle}>Manage your saved credit cards and UPI IDs</Text>
        </View>

        {/* Section: Saved Cards */}
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>SAVED CARDS</Text>
          <TouchableOpacity style={S.headerLink} onPress={() => setCardModalVisible(true)}>
            <Text style={S.headerLinkTxt}>+ Add Card</Text>
          </TouchableOpacity>
        </View>

        {cards.length === 0 ? (
          <View style={S.emptyCard}>
            <Ionicons name="card-outline" size={32} color={C.textTertiary} />
            <Text style={S.emptyText}>No Cards Saved</Text>
          </View>
        ) : (
          cards.map((card) => (
            <View key={card.id} style={S.cardContainer}>
              <View style={[S.creditCard, { backgroundColor: card.bgGradient[0] }]}>
                {/* Brand & Delete */}
                <View style={S.cardRow}>
                  <Text style={S.cardBrand}>{card.brand}</Text>
                  <TouchableOpacity onPress={() => handleDeleteCard(card.id)}>
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Chip */}
                <View style={S.chip}>
                  <Ionicons name="cellular-outline" size={24} color="#ffd700" />
                </View>

                {/* Number */}
                <Text style={S.cardNumber}>{card.number}</Text>

                {/* Footer Details */}
                <View style={S.cardFooter}>
                  <View>
                    <Text style={S.cardFieldLabel}>CARD HOLDER</Text>
                    <Text style={S.cardFieldVal}>{card.holder}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={S.cardFieldLabel}>EXPIRES</Text>
                    <Text style={S.cardFieldVal}>{card.expiry}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Section: UPI IDs */}
        <View style={[S.sectionHeader, { marginTop: 24 }]}>
          <Text style={S.sectionTitle}>UPI ACCOUNTS</Text>
          <TouchableOpacity style={S.headerLink} onPress={() => setUpiModalVisible(true)}>
            <Text style={S.headerLinkTxt}>+ Add UPI ID</Text>
          </TouchableOpacity>
        </View>

        <View style={S.upiCard}>
          {upis.length === 0 ? (
            <View style={S.emptyCard}>
              <Ionicons name="wallet-outline" size={32} color={C.textTertiary} />
              <Text style={S.emptyText}>No UPI IDs Linked</Text>
            </View>
          ) : (
            upis.map((upi, index) => (
              <View key={upi.id} style={[S.upiRow, index < upis.length - 1 && S.upiBorder]}>
                <View style={S.upiInfo}>
                  <View style={S.upiIconBox}>
                    <Ionicons name={getProviderIcon(upi.provider)} size={18} color={C.primary} />
                  </View>
                  <View>
                    <Text style={S.upiAddress}>{upi.address}</Text>
                    <Text style={S.upiProvider}>{upi.provider} Account</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteUpi(upi.id)}>
                  <Ionicons name="close-circle-outline" size={20} color={C.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal: Add Card */}
      <Modal visible={cardModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={S.modalOverlay}
        >
          <View style={S.modalContent}>
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>Link New Card</Text>
              <TouchableOpacity onPress={() => setCardModalVisible(false)}>
                <Ionicons name="close" size={24} color={C.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              {/* Card preview representation */}
              <View style={[S.creditCard, { backgroundColor: '#1E1E1E', marginBottom: 20 }]}>
                <View style={S.cardRow}>
                  <Text style={S.cardBrand}>
                    {cardNumber.startsWith('4') ? 'Visa' : 'Mastercard'}
                  </Text>
                  <Ionicons name="card-outline" size={20} color="#fff" />
                </View>
                <View style={S.chip}>
                  <Ionicons name="cellular-outline" size={24} color="#ffd700" />
                </View>
                <Text style={S.cardNumber}>
                  {cardNumber
                    ? cardNumber
                        .replace(/\s?/g, '')
                        .replace(/(\d{4})/g, '$1 ')
                        .trim()
                    : '•••• •••• •••• ••••'}
                </Text>
                <View style={S.cardFooter}>
                  <View>
                    <Text style={S.cardFieldLabel}>CARD HOLDER</Text>
                    <Text style={S.cardFieldVal}>
                      {cardHolder ? cardHolder.toUpperCase() : 'YOUR NAME'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={S.cardFieldLabel}>EXPIRES</Text>
                    <Text style={S.cardFieldVal}>{cardExpiry || 'MM/YY'}</Text>
                  </View>
                </View>
              </View>

              {/* Form inputs */}
              <Text style={S.formLabel}>CARD NUMBER</Text>
              <TextInput
                style={S.modalInput}
                placeholder="4000 1234 5678 9010"
                placeholderTextColor={C.textTertiary}
                value={cardNumber}
                onChangeText={(txt: string) => setCardNumber(txt.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={16}
              />

              <Text style={S.formLabel}>CARDHOLDER NAME</Text>
              <TextInput
                style={S.modalInput}
                placeholder="Name on Card"
                placeholderTextColor={C.textTertiary}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="characters"
              />

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={S.formLabel}>EXPIRY DATE</Text>
                  <TextInput
                    style={S.modalInput}
                    placeholder="MM/YY"
                    placeholderTextColor={C.textTertiary}
                    value={cardExpiry}
                    onChangeText={(txt: string) => {
                      // Format MM/YY automatically
                      let clean = txt.replace(/[^0-9]/g, '');
                      if (clean.length > 2) {
                        clean = `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
                      }
                      setCardExpiry(clean);
                    }}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.formLabel}>CVV</Text>
                  <TextInput
                    style={S.modalInput}
                    placeholder="123"
                    placeholderTextColor={C.textTertiary}
                    value={cardCvv}
                    onChangeText={(txt: string) => setCardCvv(txt.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity style={S.saveFormBtn} onPress={handleAddCard} activeOpacity={0.85}>
                <Text style={S.saveFormBtnTxt}>Link Card</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: Add UPI */}
      <Modal visible={upiModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={S.modalOverlay}
        >
          <View style={S.modalContent}>
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>Link UPI ID</Text>
              <TouchableOpacity onPress={() => setUpiModalVisible(false)}>
                <Ionicons name="close" size={24} color={C.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={S.formLabel}>ENTER UPI ID</Text>
            <TextInput
              style={S.modalInput}
              placeholder="e.g. name@okaxis"
              placeholderTextColor={C.textTertiary}
              value={upiAddress}
              onChangeText={setUpiAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={S.hintText}>
              A validation request will be sent to link this UPI ID with your Tiffo wallet.
            </Text>

            <TouchableOpacity style={S.saveFormBtn} onPress={handleAddUpi} activeOpacity={0.85}>
              <Text style={S.saveFormBtnTxt}>Verify & Link</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (C: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.background },
    scroll: { padding: 20 },
    headerTextContainer: { marginBottom: 24 },
    title: { fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
    subtitle: { fontSize: 13, color: C.textSecondary },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    sectionTitle: { fontSize: 11, fontWeight: '800', color: C.textSecondary, letterSpacing: 1 },
    headerLink: { padding: 4 },
    headerLinkTxt: { fontSize: 13, color: C.primary, fontWeight: '700' },
    emptyCard: {
      backgroundColor: C.surfaceCard,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.border,
      borderStyle: 'dashed',
    },
    emptyText: { fontSize: 13, color: C.textTertiary, marginTop: 8, fontWeight: '600' },
    cardContainer: {
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 6,
    },
    creditCard: {
      borderRadius: 18,
      padding: 20,
      height: 180,
      justifyContent: 'space-between',
      position: 'relative',
    },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardBrand: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
    chip: { marginTop: 4 },
    cardNumber: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 3,
      marginVertical: 8,
    },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    cardFieldLabel: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 8,
      fontWeight: '800',
      marginBottom: 2,
      letterSpacing: 0.5,
    },
    cardFieldVal: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

    // UPI
    upiCard: {
      backgroundColor: C.surfaceCard,
      borderRadius: 18,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    upiRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    upiBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
    upiInfo: { flexDirection: 'row', alignItems: 'center' },
    upiIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: C.primaryMuted,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    upiAddress: { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
    upiProvider: { fontSize: 11, color: C.textTertiary },

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
    hintText: { fontSize: 11, color: C.textSecondary, marginBottom: 16, lineHeight: 16 },
    saveFormBtn: {
      backgroundColor: C.primary,
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    saveFormBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  });
