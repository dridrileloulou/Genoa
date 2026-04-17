import { StyleSheet, Pressable, Text, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect } from 'react';
import { Login } from '@/components/authentification/Login';
import { AdminPage } from '@/components/adminPage/AdminPage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export default function ProfileScreen() {
  const [connected, setConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Fonction pour vérifier le token et le rôle
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        // Décoder le token pour obtenir les infos utilisateur
        const decoded = jwtDecode(token);
        
        // Vérifier si le token n'est pas expiré
        if (decoded.exp * 1000 > Date.now()) {
          setConnected(true);
          setIsAdmin(decoded.role === 'admin');
          
          // Optionnel : récupérer l'email depuis l'API
          fetchUserInfo(decoded.id, token);
        } else {
          // Token expiré
          await AsyncStorage.removeItem('userToken');
          setConnected(false);
          setIsAdmin(false);
        }
      } else {
        setConnected(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      setConnected(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les infos utilisateur
  const fetchUserInfo = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setUserEmail(data[0].email);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error);
    }
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setConnected(false);
    setIsAdmin(false);
    setUserEmail('');
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  // Fonction appelée après une connexion réussie
  const handleLoginSuccess = () => {
    checkAuth();
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  if (!connected) {
    return (
      <ThemedView style={styles.container_not_connected}>
        <ThemedText type="title" style={styles.title}>
          Profile
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          You are not connected. Please log in to view your profile.
        </ThemedText>
        <Login onLoginSuccess={handleLoginSuccess} />
      </ThemedView>
    );
  }

  if (isAdmin) {
    return <AdminPage onLogout={handleLogout} />;
  }

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
      
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>🚪 Logout</Text>
      </Pressable>
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
  logoutButton: {
    backgroundColor: '#1f5a1f',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});