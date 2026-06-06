import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { subscribeNotifications, getUnreadCount } from '../services/notifications';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

import UserHomeScreen from '../screens/user/HomeScreen';
import SearchScreen from '../screens/user/SearchScreen';
import PropertyDetailScreen from '../screens/user/PropertyDetailScreen';
import UserProfileScreen from '../screens/user/ProfileScreen';
import WishlistScreen from '../screens/user/WishlistScreen';
import ChatScreen from '../screens/user/ChatScreen';
import ChatThreadScreen from '../screens/user/ChatThreadScreen';
import FiltersScreen from '../screens/user/FiltersScreen';
import PropertiesListScreen from '../screens/user/PropertiesListScreen';

import DealerDashboardScreen from '../screens/dealer/DashboardScreen';
import MyPropertiesScreen from '../screens/dealer/MyPropertiesScreen';
import AddPropertyScreen from '../screens/dealer/AddPropertyScreen';
import InquiriesScreen from '../screens/dealer/InquiriesScreen';
import NotificationsScreen from '../screens/dealer/NotificationsScreen';

const AuthStack = createNativeStackNavigator();
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

const UserTabs = createBottomTabNavigator();
const UserTabNavigator = () => (
  <UserTabs.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { borderTopColor: colors.border, height: 60, paddingBottom: 8, paddingTop: 6 },
      tabBarLabelStyle: { fontSize: 11, marginTop: 4, fontWeight: '600' },
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, any> = {
          Home: 'home-outline',
          Search: 'search-outline',
          Wishlist: 'heart-outline',
          Contacted: 'call-outline',
          Profile: 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}>
    <UserTabs.Screen name="Home" component={UserHomeScreen} />
    <UserTabs.Screen name="Search" component={SearchScreen} />
    <UserTabs.Screen name="Wishlist" component={WishlistScreen} />
    <UserTabs.Screen name="Contacted" component={require('../screens/user/ContactedScreen').default} />
    <UserTabs.Screen name="Profile" component={UserProfileScreen} />
  </UserTabs.Navigator>
);

const UserStack = createNativeStackNavigator();
const UserNavigator = () => (
  <UserStack.Navigator>
    <UserStack.Screen name="UserTabs" component={UserTabNavigator} options={{ headerShown: false }} />
    <UserStack.Screen
      name="PropertiesList"
      component={PropertiesListScreen}
      options={{ headerShown: false }}
    />
    <UserStack.Screen
      name="Filters"
      component={FiltersScreen}
      options={{ headerShown: false }}
    />
    <UserStack.Screen
      name="ChatThread"
      component={ChatThreadScreen}
      options={{ headerShown: false }}
    />
    <UserStack.Screen
      name="PropertyDetail"
      component={PropertyDetailScreen}
      options={{ headerShown: false }}
    />
  </UserStack.Navigator>
);

const DealerTabs = createBottomTabNavigator();
const DealerTabNavigator = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeNotifications(user.uid, (notifications) => {
      setUnreadCount(getUnreadCount(notifications));
    });
    return unsub;
  }, [user]);

  return (
    <DealerTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, marginTop: 4, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, any> = {
            Dashboard: 'home-outline',
            Listings: 'business-outline',
            Inquiries: 'chatbubbles-outline',
            Notifications: 'notifications-outline',
            Profile: 'person-outline',
          };
          return (
            <View>
              <Ionicons name={icons[route.name]} size={size} color={color} />
              {route.name === 'Notifications' && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
      })}>
      <DealerTabs.Screen name="Dashboard" component={DealerDashboardScreen} />
      <DealerTabs.Screen name="Listings" component={MyPropertiesScreen} />
      <DealerTabs.Screen name="Inquiries" component={InquiriesScreen} />
      <DealerTabs.Screen name="Notifications" component={NotificationsScreen} />
      <DealerTabs.Screen name="Profile" component={UserProfileScreen} />
    </DealerTabs.Navigator>
  );
};

const DealerStack = createNativeStackNavigator();
const DealerNavigator = () => (
  <DealerStack.Navigator>
    <DealerStack.Screen
      name="DealerTabs"
      component={DealerTabNavigator}
      options={{ headerShown: false }}
    />
    <DealerStack.Screen
      name="AddProperty"
      component={AddPropertyScreen}
      options={{ title: 'Add Property', headerShown: true }}
    />
    <DealerStack.Screen
      name="PropertyDetail"
      component={PropertyDetailScreen}
      options={{ headerShown: false }}
    />
  </DealerStack.Navigator>
);

const RootNavigator: React.FC = () => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : user.role === 'dealer' ? (
        <DealerNavigator />
      ) : (
        <UserNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default RootNavigator;
