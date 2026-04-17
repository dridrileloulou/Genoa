import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';

export default function StatsScreen() {
  const { connected, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [connected]);

  if (authLoading || loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </ThemedView>
    );
  }

  if (!connected) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Statistiques</ThemedText>
        <ThemedText style={styles.error}>Connectez-vous pour voir les statistiques.</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Statistiques</ThemedText>
        <ThemedText style={styles.error}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Statistiques</ThemedText>

      <View style={styles.card}>
        <ThemedText style={styles.cardLabel}>Membres total</ThemedText>
        <ThemedText style={styles.cardValue}>{stats.total}</ThemedText>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard, { backgroundColor: '#2563eb' }]}>
          <ThemedText style={styles.cardLabel}>Hommes</ThemedText>
          <ThemedText style={styles.cardValue}>{stats.hommes}</ThemedText>
        </View>
        <View style={[styles.card, styles.halfCard, { backgroundColor: '#db2777' }]}>
          <ThemedText style={styles.cardLabel}>Femmes</ThemedText>
          <ThemedText style={styles.cardValue}>{stats.femmes}</ThemedText>
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText style={styles.cardLabel}>Espérance de vie moyenne</ThemedText>
        <ThemedText style={styles.cardValue}>
          {stats.esperance_vie !== null ? `${stats.esperance_vie} ans` : 'N/A'}
        </ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText style={styles.cardLabel}>Nombre de générations</ThemedText>
        <ThemedText style={styles.cardValue}>{stats.generations}</ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText style={styles.cardLabel}>Enfants par union (moyenne)</ThemedText>
        <ThemedText style={styles.cardValue}>
          {stats.moyenne_enfants !== null ? stats.moyenne_enfants : 'N/A'}
        </ThemedText>
      </View>
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
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  halfCard: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 20,
  },
});
