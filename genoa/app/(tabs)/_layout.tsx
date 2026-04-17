import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext'; // Contexte d'auth pour le bouton logout

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { connected, userEmail, role, logout } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#ffffff',
        // Email + rôle affichés à gauche du header (si connecté)
        headerLeft: () =>
          connected && userEmail ? (
            <View style={headerStyles.userInfo}>
              <Text style={headerStyles.email} numberOfLines={1}>{userEmail}</Text>
              <Text style={headerStyles.role}>{role}</Text>
            </View>
          ) : null,
        // Bouton logout affiché à droite du header (si connecté)
        headerRight: () =>
          connected ? (
            <Pressable onPress={logout} style={headerStyles.logoutButton}>
              <Text style={headerStyles.logoutText}>Déconnexion</Text>
            </Pressable>
          ) : null,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="recherche"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />

    </Tabs>
  );
}

// Styles du header (info utilisateur + bouton déconnexion)
const headerStyles = StyleSheet.create({
  userInfo: {
    marginLeft: 14,
    maxWidth: 180,
  },
  email: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  role: {
    color: '#94A3B8',
    fontSize: 11,
  },
  logoutButton: {
    marginRight: 14,
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
