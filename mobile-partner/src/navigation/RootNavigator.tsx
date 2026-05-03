import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import MenuScreen from '../screens/main/MenuScreen';
import EarningsScreen from '../screens/main/EarningsScreen';
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

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#1E293B',
        borderTopColor: '#334155',
        height: 62,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: '#F59E0B',
      tabBarInactiveTintColor: '#475569',
      tabBarIcon: ({ color, size, focused }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          Dashboard: focused ? 'grid' : 'grid-outline',
          Orders:    focused ? 'list' : 'list-outline',
          Menu:      focused ? 'restaurant' : 'restaurant-outline',
          Earnings:  focused ? 'cash' : 'cash-outline',
          Profile:   focused ? 'person' : 'person-outline',
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

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return isAuthenticated ? <MainTabs /> : <AuthNavigator />;
};

export default RootNavigator;
