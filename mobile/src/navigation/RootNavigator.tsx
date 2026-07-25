// Root Navigation Flow for Tiffo Mobile Application
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSocket } from 'shared-mobile';

import { useAuth } from '../contexts/AuthContext';

// Auth screens
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main tab screens
import BlogPostScreen from '../screens/main/BlogPostScreen';
import BlogScreen from '../screens/main/BlogScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import ContentScreen from '../screens/main/ContentScreen';
import DeliveryTimelineScreen from '../screens/main/DeliveryTimelineScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import HelpSupportScreen from '../screens/main/HelpSupportScreen';
import HomeScreen from '../screens/main/HomeScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import PaymentMethodsScreen from '../screens/main/PaymentMethodsScreen';
import PrivacyPolicyScreen from '../screens/main/PrivacyPolicyScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ReportFraudScreen from '../screens/main/ReportFraudScreen';
import SavedAddressesScreen from '../screens/main/SavedAddressesScreen';
import SubscriptionScreen from '../screens/main/SubscriptionScreen';

// Stack screens
import TiffinDetailScreen from '../screens/main/TiffinDetailScreen';
import { registerForNotifications, showLocalNotification } from '../services/notificationService';
import { ColorScheme } from '../theme/colors';
import { useTheme } from '../theme/useTheme';
import { ContentPageKey } from '../utils/content';

// Shared native-stack header styling for every pushed screen.
const stackHeaderOptions = (C: ColorScheme, title: string) => ({
  headerShown: true,
  title,
  headerTintColor: C.primary,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: 17 },
  headerStyle: { backgroundColor: C.background },
  headerShadowVisible: false,
});

export type MainTabParams = {
  Home: undefined;
  Explore: undefined;
  Subscriptions: undefined;
  Profile: undefined;
};

export type RootStackParams = {
  MainTabs: undefined;
  TiffinDetail: { tiffinId: string };
  DeliveryTimeline: { subscriptionId: string; title?: string };
  Checkout: { tiffinId: string; plan: string; price: number };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EditProfile: undefined;
  SavedAddresses: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  HelpSupport: undefined;
  PrivacyPolicy: undefined;
  ReportFraud: undefined;
  Blog: undefined;
  BlogPost: { slug: string; title?: string };
  Content: { page: ContentPageKey };
};

const Tab = createBottomTabNavigator<MainTabParams>();
const RootStack = createNativeStackNavigator<RootStackParams>();

const TAB_CONFIG: Record<
  string,
  {
    activeIcon: keyof typeof Ionicons.glyphMap;
    inactiveIcon: keyof typeof Ionicons.glyphMap;
    label: string;
  }
> = {
  Home: { activeIcon: 'home', inactiveIcon: 'home-outline', label: 'Home' },
  Explore: { activeIcon: 'search', inactiveIcon: 'search-outline', label: 'Explore' },
  Subscriptions: { activeIcon: 'receipt', inactiveIcon: 'receipt-outline', label: 'My Subs' },
  Profile: { activeIcon: 'person', inactiveIcon: 'person-outline', label: 'Profile' },
};

const MainTabs = () => {
  const C = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const isIOS = Platform.OS === 'ios';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomInset > 0 ? bottomInset + 10 : 16,
          left: 16,
          right: 16,
          backgroundColor: C.tabBackground,
          borderRadius: 32,
          height: 64,
          paddingBottom: 5,
          paddingTop: 5,
          borderWidth: 1,
          borderColor: C.borderLight,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: C.tabActive,
        tabBarInactiveTintColor: C.tabInactive,
        tabBarIcon: ({ color, focused }) => {
          const cfg = TAB_CONFIG[route.name];
          return (
            <View style={[tabStyles.iconWrap, focused && { backgroundColor: C.primaryMuted }]}>
              <Ionicons
                name={focused ? cfg.activeIcon : cfg.inactiveIcon}
                size={focused ? 22 : 20}
                color={color}
              />
            </View>
          );
        },
        tabBarLabel: ({ focused, color }) => (
          <Text style={{ fontSize: 11, fontWeight: focused ? '700' : '500', color }}>
            {TAB_CONFIG[route.name].label}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Subscriptions" component={SubscriptionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const C = useTheme();

  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Request/verify notification permissions on mount
    registerForNotifications().catch((err) => {
      console.warn('Failed to register notifications:', err);
    });

    // 2. Setup socket notification listener
    let timeoutId: NodeJS.Timeout;
    const setupSocketListener = () => {
      const socket = getSocket();
      if (socket) {
        socket.on('notification', async (data: any) => {
          console.log('Real-time socket notification received:', data);
          try {
            // Trigger local system tray notification banner
            await showLocalNotification(data.title || 'Notification', data.body || '', data);

            // Read history from AsyncStorage, append new notification, save back
            const stored = await AsyncStorage.getItem('notifications_history');
            const history = stored ? JSON.parse(stored) : [];
            const newNotif = {
              id: data.id || Date.now().toString(),
              type: data.type || 'system',
              title: data.title || 'Notification',
              body: data.body || '',
              time: new Date().toISOString(),
              read: false,
            };
            history.unshift(newNotif);
            await AsyncStorage.setItem('notifications_history', JSON.stringify(history));
          } catch (e) {
            console.error('Failed to process incoming socket notification:', e);
          }
        });
      } else {
        // Socket connection may still be initializing, check again in 1s
        timeoutId = setTimeout(setupSocketListener, 1000);
      }
    };

    setupSocketListener();

    return () => {
      clearTimeout(timeoutId);
      const socket = getSocket();
      if (socket) {
        socket.off('notification');
      }
    };
  }, [isAuthenticated]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: C.background,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            backgroundColor: C.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Ionicons name="restaurant-outline" size={36} color="#fff" />
        </View>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ fontSize: 14, color: C.textSecondary, marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen name="ReportFraud" component={ReportFraudScreen} />
      <RootStack.Screen name="Blog" component={BlogScreen} />
      <RootStack.Screen name="BlogPost" component={BlogPostScreen} />
      <RootStack.Screen name="Content" component={ContentScreen} />
      <RootStack.Screen name="TiffinDetail" component={TiffinDetailScreen} />
      <RootStack.Screen name="DeliveryTimeline" component={DeliveryTimelineScreen} />
      <RootStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={stackHeaderOptions(C, 'Checkout')}
      />
      <RootStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={stackHeaderOptions(C, 'Edit Profile')}
      />
      <RootStack.Screen
        name="SavedAddresses"
        component={SavedAddressesScreen}
        options={stackHeaderOptions(C, 'Saved Addresses')}
      />
      <RootStack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={stackHeaderOptions(C, 'Payment Methods')}
      />
      <RootStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={stackHeaderOptions(C, 'Notifications')}
      />
      <RootStack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={stackHeaderOptions(C, 'Help & Support')}
      />
      <RootStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={stackHeaderOptions(C, 'Privacy Policy')}
      />
      {!isAuthenticated && (
        <RootStack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} />
          <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </RootStack.Group>
      )}
    </RootStack.Navigator>
  );
};

const tabStyles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;
