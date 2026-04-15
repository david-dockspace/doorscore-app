import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';

import PropertyListScreen from '../screens/PropertyListScreen';
import AddPropertyScreen from '../screens/AddPropertyScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import EditPropertyScreen from '../screens/EditPropertyScreen';
import PhotoGalleryScreen from '../screens/PhotoGalleryScreen';
import CompareScreen from '../screens/CompareScreen';
import ViewingChecklistScreen from '../screens/ViewingChecklistScreen';

import type { PropertiesStackParamList, CompareStackParamList, RootTabParamList } from './types';

const PropertiesStack = createNativeStackNavigator<PropertiesStackParamList>();
const CompareStack = createNativeStackNavigator<CompareStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function PropertiesNavigator() {
  return (
    <PropertiesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <PropertiesStack.Screen
        name="PropertyList"
        component={PropertyListScreen}
        options={{ title: 'My Properties' }}
      />
      <PropertiesStack.Screen
        name="AddProperty"
        component={AddPropertyScreen}
        options={{ title: 'Add Property', presentation: 'modal' }}
      />
      <PropertiesStack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{ title: '' }}
      />
      <PropertiesStack.Screen
        name="EditProperty"
        component={EditPropertyScreen}
        options={{ title: 'Edit Property' }}
      />
      <PropertiesStack.Screen
        name="PhotoGallery"
        component={PhotoGalleryScreen}
        options={{ title: 'Photos', presentation: 'fullScreenModal' }}
      />
      <PropertiesStack.Screen
        name="ViewingChecklist"
        component={ViewingChecklistScreen}
        options={{ title: 'Viewing Checklist' }}
      />
    </PropertiesStack.Navigator>
  );
}

function CompareNavigator() {
  return (
    <CompareStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <CompareStack.Screen
        name="Compare"
        component={CompareScreen}
        options={{ title: 'Compare' }}
      />
    </CompareStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: React.ComponentProps<typeof Ionicons>['name'];
            if (route.name === 'PropertiesTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else {
              iconName = focused ? 'git-compare' : 'git-compare-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="PropertiesTab"
          component={PropertiesNavigator}
          options={{ tabBarLabel: 'Properties' }}
        />
        <Tab.Screen
          name="CompareTab"
          component={CompareNavigator}
          options={{ tabBarLabel: 'Compare' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
