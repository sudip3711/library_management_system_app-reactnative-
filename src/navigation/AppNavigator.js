import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import MembersScreen from '../screens/MembersScreen';
import AddMemberScreen from '../screens/AddMemberScreen';
import BooksScreen from '../screens/BooksScreen';
import AddBookScreen from '../screens/AddBookScreen';
import IssueRecordsScreen from '../screens/IssueRecordsScreen';
import IssueBookScreen from '../screens/IssueBookScreen';
import FinePaymentScreen from '../screens/FinePaymentScreen';

import colors from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#A2A2B0',

        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 9,
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.border,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },

        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Members: focused ? 'people' : 'people-outline',
            Books: focused ? 'book' : 'book-outline',
            Issues: focused ? 'document-text' : 'document-text-outline',
          };

          return (
            <Ionicons name={icons[route.name]} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Members" component={MembersScreen} />
      <Tab.Screen name="Books" component={BooksScreen} />
      <Tab.Screen name="Issues" component={IssueRecordsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="AddMember" component={AddMemberScreen} />
        <Stack.Screen name="AddBook" component={AddBookScreen} />
        <Stack.Screen name="IssueBook" component={IssueBookScreen} />
        <Stack.Screen
  name="Members"
  component={MembersScreen}
/>

<Stack.Screen
  name="FinePayment"
  component={FinePaymentScreen}
  options={{ title: 'Pay Fine' }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}