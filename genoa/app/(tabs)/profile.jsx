import { StyleSheet, Pressable, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect } from 'react';
import { Login } from '@/components/authentification/Login';
import { AdminPage } from '@/components/adminPage/AdminPage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext'; // Contexte d'auth global

export default function ProfileScreen() {
  // On utilise le contexte global au lieu de gérer l'auth en local
  const { connected, role, userId, loading, logout, onLoginSuccess } = useAuth();
  const [userEmail, setUserEmail] = useState('');

  // Récupérer l'email de l'utilisateur connecté depuis l'API
  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setUserEmail(data[0].email);
        }
      }
    } catch (error) {
      console.error('Erreur récupération infos utilisateur:', error);
    }
  };

  // Fetch l'email quand on est connecté et qu'on a l'userId
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
        <ThemedText>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  // Pas connecté → afficher le formulaire de login
  if (!connected) {
    return (
      <ThemedView style={styles.container_not_connected}>
        <ThemedText type="title" style={styles.title}>
          Profile
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          You are not connected. Please log in to view your profile.
        </ThemedText>
        <Login onLoginSuccess={onLoginSuccess} />
      </ThemedView>
    );
  }

  // Admin → afficher le dashboard admin (le logout est géré par le header global)
  if (role === 'admin') {
    return <AdminPage />;
  }

  // Utilisateur normal → afficher le profil
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Profile
      </ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>
        Welcome {userEmail || 'User'}
      </ThemedText>
      <ThemedText style={styles.bodyText}>
        This is your profile page.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container_not_connected: {
    backgroundColor: '#f75151',
    flex: 1,
    padding: 20,
  },
  container: {
    backgroundColor: '#2d7a2d',
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 50,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  bodyText: {
    textAlign: 'justify',
    marginVertical: 10,
    lineHeight: 24,
  },
});
