import { StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect } from 'react';
import { Login } from '@/components/authentification/Login';
import { AdminPage } from '@/components/adminPage/AdminPage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/constants/api';

export default function ProfileScreen() {
  const { connected, role, userId, loading, onLoginSuccess } = useAuth();
  const [userEmail, setUserEmail] = useState('');

  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) setUserEmail(data[0].email);
      }
    } catch (error) {
      console.error('Erreur récupération infos utilisateur:', error);
    }
  };

  useEffect(() => {
    if (connected && userId) {
      fetchUserInfo();
    } else {
      setUserEmail('');
    }
  }, [connected, userId]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </ThemedView>
    );
  }

  if (!connected) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Profil</ThemedText>
        <ThemedText style={styles.subtitle}>
          Connectez-vous pour accéder à votre profil.
        </ThemedText>
        <Login onLoginSuccess={onLoginSuccess} />
      </ThemedView>
    );
  }

  if (role === 'admin') {
    return <AdminPage />;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Profil</ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardLabel}>Email</ThemedText>
        <ThemedText style={styles.cardValue}>{userEmail || 'Chargement...'}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardLabel}>Rôle</ThemedText>
        <ThemedText style={styles.cardValue}>{role}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0F172A',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#ffffff',
  },
  subtitle: {
    textAlign: 'center',
    color: '#94A3B8',
    marginBottom: 24,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});