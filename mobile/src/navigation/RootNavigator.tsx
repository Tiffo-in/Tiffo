import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform } from 'react-native';

import { useAuth } from '../contexts/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main tab screens
import CheckoutScreen from '../screens/main/CheckoutScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SubscriptionScreen from '../screens/main/SubscriptionScreen';

// Stack screens
import TiffinDetailScreen from '../screens/main/TiffinDetailScreen';
import { useTheme } from '../theme/useTheme';

export type MainTabParams = {
  Home: undefined;
  Explore: undefined;
  Subscriptions: undefined;
  Profile: undefined;
};

export type RootStackParams = {
  MainTabs: undefined;
  TiffinDetail: { tiffinId: string };
  Checkout: { tiffinId: string; plan: string; price: number };
  Login: undefined;
  Register: undefined;
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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.tabBackground,
          borderTopColor: C.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 82 : 64,
          paddingBottom: Platform.OS === 'ios' ? 22 : 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
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
          <Text style={{ fontSize: 36 }}>🍱</Text>
        </View>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ fontSize: 14, color: C.textSecondary, marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen name="TiffinDetail" component={TiffinDetailScreen} />
      <RootStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          headerShown: true,
          title: 'Checkout',
          headerTintColor: C.primary,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerStyle: { backgroundColor: C.background },
          headerShadowVisible: false,
        }}
      />
      {!isAuthenticated && (
        <RootStack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} />
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
