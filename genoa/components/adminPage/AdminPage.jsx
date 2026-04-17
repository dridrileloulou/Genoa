import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { SeeUser } from './SeeUsers';

export function AdminPage() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Gérez votre application facilement</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>UTILISATEURS</Text>
        <Text style={styles.cardTitle}>Gestion des comptes</Text>
        <Text style={styles.cardText}>
          Voir et gérer tous les utilisateurs enregistrés
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Voir les utilisateurs</Text>
        </Pressable>
      </View>

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
    backgroundColor: '#0F172A',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#60A5FA',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
});