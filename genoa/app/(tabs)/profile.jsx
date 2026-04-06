import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Component } from 'react';
import { Login } from '@/components/authentification/Login';

const connected = false; // Simulate a connection status


export default function ProfileScreen() {
  let content;
  if (!connected) {
    content = (
      <ThemedView style={styles.container}>
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
  
  return content;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f0a0a',
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
