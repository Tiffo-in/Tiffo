import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import EarningsScreen from '../screens/main/EarningsScreen';
import MenuScreen from '../screens/main/MenuScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import PartnerProfileScreen from '../screens/main/PartnerProfileScreen';

export type AuthStackParams = { Login: undefined };
export type MainTabParams = {
  Dashboard: undefined;
  Orders: undefined;
  Menu: undefined;
  Earnings: undefined;
  Profile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const Tab = createBottomTabNavigator<MainTabParams>();

const MainTabs = () => {
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
          backgroundColor: '#1E293B',
          borderRadius: 32,
          height: 64,
          paddingBottom: 5,
          paddingTop: 5,
          borderWidth: 1,
          borderColor: '#334155',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#475569',
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Orders: focused ? 'list' : 'list-outline',
            Menu: focused ? 'restaurant' : 'restaurant-outline',
            Earnings: focused ? 'cash' : 'cash-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={PartnerProfileScreen} />
    </Tab.Navigator>
  );
};

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0F172A',
        }}
      >
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return isAuthenticated ? <MainTabs /> : <AuthNavigator />;
};

export default RootNavigator;
