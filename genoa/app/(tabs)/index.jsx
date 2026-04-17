import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Link, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) { setConnected(false); return; }
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        setConnected(true);
      } else {
        await AsyncStorage.removeItem('userToken');
        setConnected(false);
      }
    } catch (e) {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

  if (loading) return null;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <ThemedText style={styles.appName}>Genoa</ThemedText>
        <ThemedText style={styles.appTagline}>Arbre généalogique</ThemedText>
        <View style={connected ? styles.pill : styles.pillGuest}>
          <View style={connected ? styles.dot : styles.dotGuest} />
          <ThemedText style={connected ? styles.pillText : styles.pillTextGuest}>
            {connected ? 'Connecté' : 'Mode invité'}
          </ThemedText>
        </View>
      </View>

      {/* ── Accès ── */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Accès aux arbres</ThemedText>

        {connected ? (
          <Link href="/tree?mode=mine" asChild>
            <Pressable style={({ pressed }) => [pressed && styles.rowPressed]}>
              <View style={[styles.row, styles.rowPrimary]}>
                <ThemedText style={styles.rowEmoji}>🌳</ThemedText>
                <View style={styles.rowText}>
                  <ThemedText style={styles.rowLabel}>Mon arbre</ThemedText>
                  <ThemedText style={styles.rowDesc}>Accéder à votre arbre</ThemedText>
                </View>
                <ThemedText style={styles.chevron}>›</ThemedText>
              </View>
            </Pressable>
          </Link>
        ) : (
          <View style={[styles.row, styles.rowDisabled]}>
            <ThemedText style={styles.rowEmoji}>🔒</ThemedText>
            <View style={styles.rowText}>
              <ThemedText style={styles.rowLabel}>Mon arbre</ThemedText>
              <ThemedText style={styles.rowDesc}>Connexion requise</ThemedText>
            </View>
          </View>
        )}

        <View style={styles.separator} />

        <Link href="/tree?mode=all" asChild>
          <Pressable style={({ pressed }) => [pressed && styles.rowPressed]}>
            <View style={styles.row}>
              <ThemedText style={styles.rowEmoji}>🌍</ThemedText>
              <View style={styles.rowText}>
                <ThemedText style={styles.rowLabel}>Explorer</ThemedText>
                <ThemedText style={styles.rowDesc}>Parcourir les arbres publics</ThemedText>
              </View>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </View>
          </Pressable>
        </Link>
      </View>

      {/* ── Fonctionnalités ── */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Fonctionnalités</ThemedText>
        {FEATURES.map((f, i) => (
          <View key={f.label}>
            <View style={styles.row}>
              <ThemedText style={styles.rowEmoji}>{f.icon}</ThemedText>
              <View style={styles.rowText}>
                <ThemedText style={styles.rowLabel}>{f.label}</ThemedText>
                <ThemedText style={styles.rowDesc}>{f.desc}</ThemedText>
              </View>
            </View>
            {i < FEATURES.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const FEATURES = [
  { icon: '🔍', label: 'Zoom interactif', desc: "Naviguez librement dans l'arbre avec des gestes fluides" },
  { icon: '🔗', label: 'Relations familiales', desc: 'Visualisez les liens entre chaque membre' },
  { icon: '🧭', label: 'Navigation fluide', desc: 'Interface pensée pour une lecture rapide' },
  { icon: '🔐', label: 'Accès sécurisé', desc: 'Vos données sont protégées et privées' },
];

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    gap: 12,
  },

  /* ── Header ── */
  header: {
    marginBottom: 8,
    gap: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillGuest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  dotGuest: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748B',
  },
  pillText: {
    fontSize: 12,
    color: '#86efac',
    fontWeight: '500',
  },
  pillTextGuest: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },

  /* ── Section ── */
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },

  /* ── Ligne universelle ── */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 14,
  },
  rowPrimary: {
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowEmoji: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  rowDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  chevron: {
    fontSize: 20,
    color: '#475569',
    lineHeight: 24,
  },

  /* ── Séparateur ── */
  separator: {
    height: 1,
    backgroundColor: '#334155',
    marginHorizontal: 16,
  },
});