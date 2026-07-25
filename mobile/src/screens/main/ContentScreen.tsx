import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParams } from '../../navigation/RootNavigator';
import { useTheme } from '../../theme/useTheme';
import { CONTENT_PAGES, ContentPageKey } from '../../utils/content';

type ContentRoute = RouteProp<RootStackParams, 'Content'>;

/**
 * One screen serving every static legal/corporate page (Terms, About, Careers,
 * Partner Guidelines). The audit listed these as four separate gaps, but they
 * are content rather than engineering — a single renderer plus a content map
 * covers all of them, and adding another page is a data change.
 */
const ContentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ContentRoute>();
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);

  const key: ContentPageKey = route.params?.page ?? 'terms';
  const page = CONTENT_PAGES[key] ?? CONTENT_PAGES.terms;

  return (
    <SafeAreaView style={S.safeArea}>
      <View style={S.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={S.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>{page.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        {!!page.intro && <Text style={S.intro}>{page.intro}</Text>}

        {page.sections.map((section) => (
          <View key={section.heading} style={S.section}>
            <Text style={S.heading}>{section.heading}</Text>
            {section.body.map((paragraph, i) => (
              <Text key={i} style={S.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        {!!page.contactEmail && (
          <TouchableOpacity
            style={S.contactButton}
            onPress={() => Linking.openURL(`mailto:${page.contactEmail}`)}
            accessibilityRole="button"
            accessibilityLabel={`Email ${page.contactEmail}`}
          >
            <Ionicons name="mail-outline" size={18} color={C.primary} />
            <Text style={S.contactText}>{page.contactEmail}</Text>
          </TouchableOpacity>
        )}

        <Text style={S.updated}>Last updated {page.lastUpdated}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (C: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { color: C.textPrimary, fontSize: 17, fontWeight: '700' },
    intro: { color: C.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 8 },
    section: { marginTop: 22 },
    heading: { color: C.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 8 },
    paragraph: { color: C.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 10 },
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 24,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: C.primary,
      alignSelf: 'flex-start',
    },
    contactText: { color: C.primary, fontWeight: '700', fontSize: 14 },
    updated: { color: C.textTertiary, fontSize: 12, marginTop: 24 },
  });

export default ContentScreen;
