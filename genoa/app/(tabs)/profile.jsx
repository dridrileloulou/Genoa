import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Login } from '@/components/authentification/Login';
import { AdminPage } from '@/components/adminPage/AdminPage';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [connected, setConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setConnected(true);
        const role = await AsyncStorage.getItem('role');
        if (role === 'admin') setIsAdmin(true);
      }
    };
    checkToken();
  }, []);

  let content;
  if (!connected) {
    content = (
      <ThemedView style={styles.container_not_connected}>
        <ThemedText type="title" style={styles.title}>Profile</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          You are not connected. Please log in to view your profile.
        </ThemedText>
        <Login />
      </ThemedView>
    );
  } else {
    if (isAdmin) {
      content = <AdminPage />;
    } else {
      content = (
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>Profile</ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            This is your profile page.
          </ThemedText>
        </ThemedView>
      );
    }
  }

  return content;
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
});