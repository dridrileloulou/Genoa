import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Component } from 'react';
import { Login } from '@/components/authentification/Login';
import { AdminPage } from '@/components/adminPage/AdminPage';

const connected = false; // Simulate a connection status
const isAdmin = false; // Simulate an admin status


export default function ProfileScreen() {
  let content;
  if (!connected) {
    content = (
      <ThemedView style={styles.container_not_connected}>
        <ThemedText type="title" style={styles.title}>
          Profile
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          You are not connected. Please log in to view your profile.
        </ThemedText>
        <Login />
      </ThemedView>
    );
  } else {
    if (isAdmin) {
      content = (
        <AdminPage />
      );
    } else {
    content = (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Profile
        </ThemedText>
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
  bodyText: {
    textAlign: 'justify',
    marginVertical: 10,
    lineHeight: 24,
  },
  adminContainer: {
    backgroundColor: '#f75151',
  },
});