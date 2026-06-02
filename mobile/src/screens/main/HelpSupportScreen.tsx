import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function HelpSupportScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { user } = useAuth();
  const { success, error, warning } = useAlert();

  // FAQs Accordion states
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      id: 'f1',
      question: 'How do I pause my daily tiffin delivery?',
      answer:
        'You can easily pause deliveries from the "Subscriptions" tab. Tap your active plan and select the dates you wish to pause. Make sure to request pauses before 10:00 PM for the following day\'s breakfast/lunch.',
    },
    {
      id: 'f2',
      question: 'What are the standard delivery timings?',
      answer:
        'Breakfast is delivered between 7:30 AM and 9:00 AM. Lunch is delivered between 12:00 PM and 1:30 PM. Dinner is delivered between 7:30 PM and 9:00 PM.',
    },
    {
      id: 'f3',
      question: 'Are Tiffo food containers microwave-safe?',
      answer:
        'Yes, our premium, 100% biodegradable outer tiffin trays are fully microwave-safe. However, please remove any aluminum foils or lid seal films before reheating.',
    },
    {
      id: 'f4',
      question: 'How do I cancel my weekly/monthly package?',
      answer:
        'To cancel a subscription, navigate to the "Subscriptions" tab, tap your active package, and click "Cancel Subscription". Refunds for unused meals will be credited back to your original payment method within 5-7 business days.',
    },
  ]);

  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Form Fields
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      warning('Validation Error', 'Please complete both the Subject and Message fields.');
      return;
    }

    setSubmitting(true);
    try {
      // Direct integration with backend support ticket API endpoint!
      await api.post('/support', {
        name: user?.name || 'Customer App User',
        email: user?.email || 'app@user.com',
        subject: subject.trim(),
        message: message.trim(),
      });

      success(
        'Ticket Submitted',
        'Thank you! Our support team will get in touch with you shortly.',
        () => {
          setSubject('');
          setMessage('');
        },
      );
    } catch (err: any) {
      console.error('Support ticket submission error:', err);
      error('Submission Failed', 'Could not submit support request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={S.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
          <View style={S.headerTextContainer}>
            <Text style={S.title}>Tiffo Help Center</Text>
            <Text style={S.subtitle}>Browse FAQs or open a direct customer care ticket</Text>
          </View>

          {/* Section: Accordion FAQs */}
          <Text style={S.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
          <View style={S.faqContainer}>
            {faqs.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <View key={faq.id} style={[S.faqItem, isExpanded && S.faqItemActive]}>
                  <TouchableOpacity
                    style={S.faqHeader}
                    onPress={() => toggleFaq(faq.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={S.faqQuestion}>{faq.question}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={isExpanded ? C.primary : C.textSecondary}
                    />
                  </TouchableOpacity>
                  {isExpanded && (
                    <View style={S.faqAnswerBox}>
                      <Text style={S.faqAnswer}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Section: Direct Ticket Form */}
          <Text style={[S.sectionTitle, { marginTop: 24 }]}>SUBMIT A SUPPORT TICKET</Text>
          <View style={S.formCard}>
            <Text style={S.formLabel}>NAME & EMAIL (PREFILLED)</Text>
            <View style={S.prefilledBox}>
              <Text style={S.prefilledTxt}>
                {user?.name} ({user?.email})
              </Text>
            </View>

            <Text style={S.formLabel}>SUBJECT</Text>
            <TextInput
              style={S.input}
              placeholder="e.g. Delivery Delay, Meal Quality, Cancellation"
              placeholderTextColor={C.textTertiary}
              value={subject}
              onChangeText={setSubject}
            />

            <Text style={S.formLabel}>DETAILED MESSAGE</Text>
            <TextInput
              style={[S.input, S.textarea]}
              placeholder="Describe your query in detail..."
              placeholderTextColor={C.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={S.submitBtn}
              onPress={handleSubmitTicket}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="paper-plane-outline"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={S.submitBtnTxt}>Submit Ticket</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    sectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: C.textSecondary,
      letterSpacing: 1,
      marginBottom: 12,
    },
    faqContainer: { gap: 12 },
    faqItem: {
      backgroundColor: C.surfaceCard,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: C.border,
      overflow: 'hidden',
    },
    faqItemActive: { borderColor: C.primary },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    faqQuestion: {
      fontSize: 14,
      fontWeight: '700',
      color: C.textPrimary,
      flex: 1,
      marginRight: 16,
    },
    faqAnswerBox: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: C.divider,
      paddingTop: 12,
    },
    faqAnswer: { fontSize: 12, color: C.textSecondary, lineHeight: 18 },

    // Form
    formCard: {
      backgroundColor: C.surfaceCard,
      borderRadius: 18,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      marginBottom: 32,
    },
    formLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: C.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    prefilledBox: {
      backgroundColor: C.borderLight,
      borderRadius: 10,
      paddingHorizontal: 14,
      height: 44,
      justifyContent: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: C.border,
    },
    prefilledTxt: { fontSize: 13, color: C.textSecondary, fontWeight: '600' },
    input: {
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
    textarea: {
      height: 120,
      paddingTop: 12,
      paddingBottom: 12,
    },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.primary,
      borderRadius: 12,
      height: 50,
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    submitBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  });
