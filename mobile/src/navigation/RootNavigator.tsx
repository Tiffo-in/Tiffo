import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main tab screens
import HomeScreen from '../screens/main/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import SubscriptionScreen from '../screens/main/SubscriptionScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Stack screens
import TiffinDetailScreen from '../screens/main/TiffinDetailScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';



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

// Bottom Tab Navigator (authenticated users)
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#F3F4F6',
        height: 60,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: '#F97316',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarIcon: ({ color, size, focused }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          Home: focused ? 'home' : 'home-outline',
          Explore: focused ? 'search' : 'search-outline',
          Subscriptions: focused ? 'receipt' : 'receipt-outline',
          Profile: focused ? 'person' : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Explore" component={ExploreScreen} />
    <Tab.Screen name="Subscriptions" component={SubscriptionScreen} options={{ title: 'My Subs' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Root stack (full-screen pages pushed on top of the main tabs)
const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF7ED' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen
        name="TiffinDetail"
        component={TiffinDetailScreen}
        options={{ headerShown: true, title: 'Meal Details', headerTintColor: '#F97316' }}
      />
      <RootStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: true, title: 'Checkout', headerTintColor: '#F97316' }}
      />
      {!isAuthenticated && (
        <RootStack.Group screenOptions={{ presentation: 'modal' }}>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} />
        </RootStack.Group>
      )}
    </RootStack.Navigator>
  );
};

export default RootNavigator;
