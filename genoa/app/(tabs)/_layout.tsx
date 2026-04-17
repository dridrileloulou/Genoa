import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext'; // Contexte d'auth pour le bouton logout

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { connected, logout } = useAuth(); // état de connexion + fonction de déconnexion

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Header visible avec bouton logout à droite (si connecté)
        headerShown: true,
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#ffffff',
        // Bouton logout affiché dans le coin supérieur droit de toutes les pages
        headerRight: () =>
          connected ? (
            <Pressable onPress={logout} style={logoutStyles.button}>
              <Text style={logoutStyles.text}>Déconnexion</Text>
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
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />

    </Tabs>
  );
}

// Styles du bouton de déconnexion dans le header
const logoutStyles = StyleSheet.create({
  button: {
    marginRight: 14,
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
