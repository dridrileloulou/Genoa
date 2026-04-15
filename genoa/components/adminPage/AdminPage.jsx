import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { SeeUser } from './SeeUsers';

export function AdminPage() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>
          Manage your application easily
        </Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Users</Text>
        <Text style={styles.cardText}>
          View and manage all registered users
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>See users</Text>
        </Pressable>
      </View>

      {/* MODAL */}
      <SeeUser
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
    padding: 20,
  },

  header: {
    marginTop: 40,
    marginBottom: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 6,
  },

  card: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2d7a2d',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },

  cardText: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 16,
  },

  button: {
    backgroundColor: '#2d7a2d',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
