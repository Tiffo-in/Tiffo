import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

export default function PrivacyPolicyScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);

  return (
    <SafeAreaView style={S.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={S.headerTextContainer}>
          <Text style={S.title}>Privacy Policy</Text>
          <Text style={S.subtitle}>Last updated: June 1, 2026</Text>
        </View>

        <View style={S.card}>
          <Text style={S.bodyTxt}>
            At Tiffo, accessible from tiffo.in and our mobile application, one of our main
            priorities is the privacy of our visitors and users. This Privacy Policy document
            contains types of information that is collected and recorded by Tiffo and how we use it.
          </Text>

          <Text style={S.sectionTitle}>1. INFORMATION WE COLLECT</Text>
          <Text style={S.bodyTxt}>
            We collect several different types of information for various purposes to provide and
            improve our service to you:
          </Text>
          <View style={S.bulletBox}>
            <Text style={S.bulletItem}>
              • <Text style={S.bulletBold}>Personal Identifiable Information:</Text> While using our
              service, we may ask you to provide us with certain personally identifiable information
              that can be used to contact or identify you, including your Name, Email address, Phone
              number, and Delivery Address.
            </Text>
            <Text style={S.bulletItem}>
              • <Text style={S.bulletBold}>Location Data:</Text> We may use and store information
              about your location if you give us permission to do so. We use this data to calculate
              delivery coverage, coordinate deliveries, and provide customized menu listings.
            </Text>
            <Text style={S.bulletItem}>
              • <Text style={S.bulletBold}>Usage Data:</Text> Information on how the service is
              accessed and used, such as device identifiers, IP addresses, browser types, and
              application performance logs.
            </Text>
          </View>

          <Text style={S.sectionTitle}>2. HOW WE USE YOUR DATA</Text>
          <Text style={S.bodyTxt}>
            Tiffo uses the collected data for various essential purposes:
          </Text>
          <View style={S.bulletBox}>
            <Text style={S.bulletItem}>
              • To provide, maintain, and deliver our daily tiffin services.
            </Text>
            <Text style={S.bulletItem}>
              • To manage subscriptions, handle dispatches, and coordinate active deliveries.
            </Text>
            <Text style={S.bulletItem}>
              • To notify you about changes to our services or active meal packages.
            </Text>
            <Text style={S.bulletItem}>
              • To provide premium customer support and ticket assistance.
            </Text>
            <Text style={S.bulletItem}>
              • To detect, prevent, and address technical issues or fraudulent activities.
            </Text>
          </View>

          <Text style={S.sectionTitle}>3. PAYMENT & SECURITY</Text>
          <Text style={S.bodyTxt}>
            We do not store or collect your payment card details. That information is provided
            directly to our third-party payment processors (such as Razorpay) whose use of your
            personal information is governed by their Privacy Policy. These payment processors
            adhere to the standards set by PCI-DSS.
          </Text>
          <Text style={S.bodyTxt}>
            The security of your data is extremely important to us, but remember that no method of
            transmission over the Internet or method of electronic storage is 100% secure. While we
            strive to use commercially acceptable means to protect your Personal Data, we cannot
            guarantee its absolute security.
          </Text>

          <Text style={S.sectionTitle}>4. THIRD-PARTY DISCLOSURES</Text>
          <Text style={S.bodyTxt}>
            We may share your information with trusted third-party service providers (like our
            delivery partners or chef kitchen networks) only to the extent necessary to perform
            their services. We do not sell or trade your personal information to third-party
            marketers.
          </Text>

          <Text style={S.sectionTitle}>5. YOUR RIGHTS</Text>
          <Text style={S.bodyTxt}>
            Depending on your location, you may have rights regarding your personal information,
            including the right to request access, correction, deletion, or restriction of your
            personal data. You can perform many of these updates directly in this app (e.g. updating
            profile details or deleting saved addresses), or by emailing our support desk at{' '}
            <Text style={S.link}>help@tiffo.in</Text>.
          </Text>
        </View>

        <View style={S.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={C.primary}
            style={{ marginBottom: 8 }}
          />
          <Text style={S.footerTxt}>Tiffo Secure Policy Guard</Text>
          <Text style={S.footerSub}>Ensuring a secure, healthy, and premium service.</Text>
        </View>
      </ScrollView>
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
    card: {
      backgroundColor: C.surfaceCard,
      borderRadius: 18,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      marginBottom: 24,
    },
    bodyTxt: { fontSize: 13, color: C.textSecondary, lineHeight: 20, marginBottom: 16 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: C.textPrimary,
      marginTop: 18,
      marginBottom: 10,
      letterSpacing: 0.5,
    },
    bulletBox: { paddingLeft: 6, marginBottom: 16, gap: 10 },
    bulletItem: { fontSize: 13, color: C.textSecondary, lineHeight: 18 },
    bulletBold: { fontWeight: '700', color: C.textPrimary },
    link: { color: C.primary, fontWeight: '700' },
    footer: { alignItems: 'center', marginVertical: 16, marginBottom: 32 },
    footerTxt: { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
    footerSub: { fontSize: 11, color: C.textTertiary },
  });
