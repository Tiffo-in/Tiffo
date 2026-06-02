import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '../../contexts/AlertContext';
import { ColorScheme } from '../../theme/colors';
import { useTheme } from '../../theme/useTheme';

interface NotificationItem {
  id: string;
  type: 'order' | 'promo' | 'system';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const C = useTheme();
  const S = useMemo(() => createStyles(C), [C]);
  const { confirm } = useAlert();

  // Preferences Toggles
  const [prefOrder, setPrefOrder] = useState(true);
  const [prefPromo, setPrefPromo] = useState(false);
  const [prefSystem, setPrefSystem] = useState(true);

  // Historical notifications
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: 'n1',
      type: 'order',
      title: '🍱 Lunch Dispatched',
      body: 'Your North Indian Veg Lunch meal pack is out for delivery. Tracker active!',
      time: '2 hrs ago',
      read: false,
    },
    {
      id: 'n2',
      type: 'promo',
      title: '🎉 20% Weekly Meal Package Discount',
      body: 'Use code MEAL20 to unlock huge savings on subscriptions this week!',
      time: 'Yesterday',
      read: true,
    },
    {
      id: 'n3',
      type: 'system',
      title: '✅ Subscription Pause Confirmed',
      body: 'Your tiffin delivery is paused for June 2nd, as requested.',
      time: '3 days ago',
      read: true,
    },
  ]);

  const handleClearAll = () => {
    confirm(
      'Clear History',
      'Are you sure you want to clear all notifications?',
      () => setItems([]),
      undefined,
      'Clear All',
      'Cancel',
    );
  };

  const getIconName = (type: NotificationItem['type']) => {
    if (type === 'order') return 'basket-outline';
    if (type === 'promo') return 'gift-outline';
    return 'settings-outline';
  };

  return (
    <SafeAreaView style={S.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={S.headerTextContainer}>
          <Text style={S.title}>Alerts & Inbox</Text>
          <Text style={S.subtitle}>Manage your push alerts and browse past notifications</Text>
        </View>

        {/* Section: Notification Preferences */}
        <Text style={S.sectionTitle}>PREFERENCES</Text>
        <View style={S.card}>
          {/* Item 1 */}
          <View style={S.prefRow}>
            <View style={S.prefInfo}>
              <View style={S.prefIconBox}>
                <Ionicons name="basket-outline" size={18} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.prefTitle}>Order & Delivery Updates</Text>
                <Text style={S.prefDesc}>
                  Receive push alerts on tiffin dispatches, delays & drop-offs.
                </Text>
              </View>
            </View>
            <Switch
              value={prefOrder}
              onValueChange={setPrefOrder}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor={Platform.OS === 'android' ? C.primaryLight : undefined}
            />
          </View>

          {/* Item 2 */}
          <View style={[S.prefRow, S.prefBorder]}>
            <View style={S.prefInfo}>
              <View style={S.prefIconBox}>
                <Ionicons name="gift-outline" size={18} color={C.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.prefTitle}>Promo Deals & Offers</Text>
                <Text style={S.prefDesc}>
                  Get alerts about weekly menus, discounts & cashback rewards.
                </Text>
              </View>
            </View>
            <Switch
              value={prefPromo}
              onValueChange={setPrefPromo}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor={Platform.OS === 'android' ? C.primaryLight : undefined}
            />
          </View>

          {/* Item 3 */}
          <View style={[S.prefRow, S.prefBorder]}>
            <View style={S.prefInfo}>
              <View style={S.prefIconBox}>
                <Ionicons name="settings-outline" size={18} color={C.info} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.prefTitle}>Account & System Alerts</Text>
                <Text style={S.prefDesc}>
                  Get confirmations about package pauses, cancellations & profile changes.
                </Text>
              </View>
            </View>
            <Switch
              value={prefSystem}
              onValueChange={setPrefSystem}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor={Platform.OS === 'android' ? C.primaryLight : undefined}
            />
          </View>
        </View>

        {/* Section: Inbox Log */}
        <View style={S.inboxHeader}>
          <Text style={S.sectionTitle}>NOTIFICATION INBOX</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={S.clearBtnTxt}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          <View style={S.emptyInbox}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🔔</Text>
            <Text style={S.emptyInboxTitle}>Inbox is Empty</Text>
            <Text style={S.emptyInboxDesc}>
              When you receive notifications, they will be archived here for easy viewing.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} style={[S.notifItem, !item.read && S.notifUnread]}>
              <View style={S.notifIconWrap}>
                <Ionicons name={getIconName(item.type)} size={18} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={S.notifRow}>
                  <Text style={S.notifTitle}>{item.title}</Text>
                  <Text style={S.notifTime}>{item.time}</Text>
                </View>
                <Text style={S.notifBody}>{item.body}</Text>
              </View>
            </View>
          ))
        )}
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
    sectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: C.textSecondary,
      letterSpacing: 1,
      marginBottom: 12,
    },
    card: {
      backgroundColor: C.surfaceCard,
      borderRadius: 18,
      paddingHorizontal: 16,
      marginBottom: 28,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    prefRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    prefBorder: { borderTopWidth: 1, borderTopColor: C.divider },
    prefInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 },
    prefIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: C.primaryMuted,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    prefTitle: { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 3 },
    prefDesc: { fontSize: 11, color: C.textSecondary, lineHeight: 15 },

    // Inbox
    inboxHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    clearBtnTxt: { fontSize: 12, fontWeight: '700', color: C.primary },
    emptyInbox: {
      backgroundColor: C.surfaceCard,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: C.border,
      borderStyle: 'dashed',
      padding: 32,
      alignItems: 'center',
    },
    emptyInboxTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 6 },
    emptyInboxDesc: { fontSize: 12, color: C.textSecondary, textAlign: 'center', lineHeight: 18 },
    notifItem: {
      flexDirection: 'row',
      backgroundColor: C.surfaceCard,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: C.border,
    },
    notifUnread: {
      borderColor: C.primary + '20',
      backgroundColor: C.primaryMuted + '20',
    },
    notifIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 8,
      backgroundColor: C.primaryMuted,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    notifRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    notifTitle: { fontSize: 14, fontWeight: '700', color: C.textPrimary, flex: 1, marginRight: 8 },
    notifTime: { fontSize: 10, color: C.textTertiary },
    notifBody: { fontSize: 12, color: C.textSecondary, lineHeight: 16 },
  });
