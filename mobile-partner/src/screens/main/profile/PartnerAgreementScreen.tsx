import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '../../../services/api';

const PartnerAgreementScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState('');
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/partner/profile');
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setPartnerName(data.businessName || data.user?.name || 'Partner Kitchen');
        setVerifiedAt(data.verifiedAt || data.createdAt || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading Agreement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Agreement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      >
        {/* Document Header */}
        <View style={styles.docHeaderCard}>
          <View style={styles.badgeRow}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE AGREEMENT</Text>
            </View>
            <Ionicons name="document-text" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.docTitle}>Tiffo Kitchen Partner Agreement</Text>
          <Text style={styles.docDetails}>
            This agreement is legally binding between **Tiffo Food Delivery Platform** and **
            {partnerName}**.
          </Text>
          <View style={styles.signatureBox}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.signatureText}>
              Digitally signed and accepted on {getFormattedDate(verifiedAt)}.
            </Text>
          </View>
        </View>

        {/* Legal Text */}
        <View style={styles.legalBody}>
          <Text style={styles.legalHeading}>1. Scope of Services</Text>
          <Text style={styles.legalParagraph}>
            The Kitchen Partner agrees to prepare and package meals (referred to as "Tiffin
            Packages") in compliance with food safety regulations, specifically maintaining an
            active FSSAI registration throughout the duration of this partnership. Tiffo agrees to
            list the Kitchen Partner's menu details, manage customer orders, handle digital payment
            collection, and coordinate delivery services.
          </Text>

          <Text style={styles.legalHeading}>2. Standards and Quality Control</Text>
          <Text style={styles.legalParagraph}>
            The Kitchen Partner is solely responsible for procuring fresh, high-quality ingredients,
            preparing meals under hygienic kitchen conditions, and ensuring robust food packaging
            that prevents leakage during transit. Tiffo reserves the right to audit the kitchen
            premises or request FSSAI compliance documents at any time. Consistent poor ratings
            (below 3.5 stars) may lead to account suspension.
          </Text>

          <Text style={styles.legalHeading}>3. Commissions and Fees</Text>
          <Text style={styles.legalParagraph}>
            Tiffo charges a platform commission fee of 10% on the gross value of all orders and
            active subscription plans generated via the platform. This commission rate is
            automatically deducted at the time of order payment processing. The commission is
            subject to change with a 30-day prior written notice.
          </Text>

          <Text style={styles.legalHeading}>4. Payouts & Settlement</Text>
          <Text style={styles.legalParagraph}>
            Earnings generated from subscriber meals delivered are accumulated and settled on a
            weekly basis. Standard settlements are initiated on Monday of every calendar week for
            all deliveries completed in the preceding week (Monday to Sunday). Payouts are
            dispatched to the Kitchen Partner's verified bank account registered in the Tiffo
            Partner Portal.
          </Text>

          <Text style={styles.legalHeading}>5. Term & Termination</Text>
          <Text style={styles.legalParagraph}>
            Either party may terminate this agreement at any time by providing 15 days of written
            notice. Upon termination notice, the Kitchen Partner is obligated to fulfill all
            remaining active subscriptions. Failure to fulfill active meal subscriptions without
            valid reasons will result in penalty deductions from accumulated earnings.
          </Text>
        </View>

        {/* Closing note */}
        <Text style={styles.legalFooter}>
          Tiffo Food Platforms Pvt. Ltd. • Contact: legal@tiffo.in
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  docHeaderCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#065F46',
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  docDetails: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  signatureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
  },
  signatureText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  legalBody: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  legalHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 12,
    marginBottom: 6,
  },
  legalParagraph: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'justify',
  },
  legalFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: '#475569',
    marginTop: 8,
    marginBottom: 20,
  },
});

export default PartnerAgreementScreen;
