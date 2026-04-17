import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

// =====================================================
// PAGE LOGS : historique des modifications (admin uniquement)
// Affiche la liste des actions effectuées sur la BDD
// =====================================================

export default function LogsScreen() {
  const { connected, role, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://localhost:3000/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des logs');

      const data = await response.json();
      // Tri par date décroissante (les plus récents en premier)
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && role === 'admin') {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [connected, role]);

  // Couleur selon le type d'action (POST = ajout, PATCH = modif, DELETE = suppression)
  const getActionColor = (action) => {
    if (action === 'POST') return '#22C55E';
    if (action === 'PATCH') return '#F59E0B';
    if (action === 'DELETE') return '#EF4444';
    return '#94A3B8';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading || loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </ThemedView>
    );
  }

  // Accès réservé aux admins
  if (!connected || role !== 'admin') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Logs</ThemedText>
        <ThemedText style={styles.restricted}>Accès réservé aux administrateurs.</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Logs</ThemedText>
        <ThemedText style={styles.error}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Logs</ThemedText>
      <ThemedText style={styles.count}>{logs.length} action(s) enregistrée(s)</ThemedText>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            {/* Badge action coloré */}
            <View style={[styles.badge, { backgroundColor: getActionColor(item.action) }]}>
              <ThemedText style={styles.badgeText}>{item.action}</ThemedText>
            </View>
            <View style={styles.logInfo}>
              {/* Table modifiée + id de l'enregistrement */}
              <ThemedText style={styles.logTable}>
                {item.table_modifiée} #{item.id_enregistrement}
              </ThemedText>
              {/* User + date */}
              <ThemedText style={styles.logMeta}>
                User #{item.id_user} — {formatDate(item.date)}
              </ThemedText>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <ThemedText style={styles.empty}>Aucun log enregistré.</ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#0F172A',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  count: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 13,
    marginBottom: 16,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  logInfo: {
    flex: 1,
  },
  logTable: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  logMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  restricted: {
    textAlign: 'center',
    color: '#F59E0B',
    marginTop: 20,
    fontStyle: 'italic',
  },
  error: {
    textAlign: 'center',
    color: '#EF4444',
    marginTop: 20,
  },
  empty: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
