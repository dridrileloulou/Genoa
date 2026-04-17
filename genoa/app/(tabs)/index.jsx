import { StyleSheet, View, ScrollView, Dimensions, Pressable } from 'react-native';
import {  useState, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Link , useFocusEffect} from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');

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
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.appName}>Genoa</ThemedText>
        <ThemedText style={styles.appTagline}>Arbre généalogique</ThemedText>
        <View style={connected ? styles.pill : styles.pillGuest}>
          <View style={connected ? styles.dot : styles.dotGuest} />
          <ThemedText style={connected ? styles.pillText : styles.pillTextGuest}>
            {connected ? 'Connecté' : 'Mode invité'}
          </ThemedText>
        </View>
      </ThemedView>

      {/* ── Accès ── */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Accès aux arbres</ThemedText>

        <View style={styles.cards}>
          {connected ? (
            <Link href="/tree?mode=mine" asChild>
              <Pressable style={styles.cardPrimary}>
                <View style={styles.cardLeft}>
                  <ThemedText style={styles.cardEmoji}>🌳</ThemedText>
                  <View>
                    <ThemedText style={styles.cardTitle}>Mon arbre</ThemedText>
                    <ThemedText style={styles.cardSub}>Accéder à votre arbre</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.chevron}>›</ThemedText>
              </Pressable>
            </Link>
          ) : (
            <View style={styles.cardDisabled}>
              <View style={styles.cardLeft}>
                <ThemedText style={styles.cardEmoji}>🔒</ThemedText>
                <View>
                  <ThemedText style={styles.cardTitleDisabled}>Mon arbre</ThemedText>
                  <ThemedText style={styles.cardSubDisabled}>Connexion requise</ThemedText>
                </View>
              </View>
            </View>
          )}

          <Link href="/tree?mode=all" asChild>
            <Pressable style={styles.card}>
              <View style={styles.cardLeft}>
                <ThemedText style={styles.cardEmoji}>🌍</ThemedText>
                <View>
                  <ThemedText style={styles.cardTitle}>Explorer</ThemedText>
                  <ThemedText style={styles.cardSub}>Parcourir les arbres publics</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </Pressable>
          </Link>
        </View>
      </ThemedView>

      {/* ── Fonctionnalités ── */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Fonctionnalités</ThemedText>

        <View style={styles.featureList}>
          {FEATURES.map((f, i) => (
            <View key={f.label} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureRowBorder]}>
              <ThemedText style={styles.featureEmoji}>{f.icon}</ThemedText>
              <View style={styles.featureText}>
                <ThemedText style={styles.featureLabel}>{f.label}</ThemedText>
                <ThemedText style={styles.featureDesc}>{f.desc}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ThemedView>

    </ScrollView>
  );
}

const FEATURES = [
  {
    icon: '🔍',
    label: 'Zoom interactif',
    desc: 'Naviguez librement dans l\'arbre avec des gestes fluides',
  },
  {
    icon: '🔗',
    label: 'Relations familiales',
    desc: 'Visualisez les liens entre chaque membre',
  },
  {
    icon: '🧭',
    label: 'Navigation fluide',
    desc: 'Interface pensée pour une lecture rapide',
  },
  {
    icon: '🔐',
    label: 'Accès sécurisé',
    desc: 'Vos données sont protégées et privées',
  },
];

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
    gap: 10,
  },

  /* ── Header ── */
  header: {
    paddingVertical: 28,
    paddingHorizontal: 4,
    gap: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E8F5EC',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 14,
    color: 'rgba(180, 220, 190, 0.55)',
    marginBottom: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(50, 180, 90, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(50, 180, 90, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillGuest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(180, 180, 180, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(180, 180, 180, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5cd980',
  },
  dotGuest: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(180,180,180,0.6)',
  },
  pillText: {
    fontSize: 12,
    color: '#9de8b4',
    fontWeight: '500',
  },
  pillTextGuest: {
    fontSize: 12,
    color: 'rgba(180,180,180,0.7)',
    fontWeight: '500',
  },

  /* ── Sections ── */
  section: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(80, 160, 100, 0.15)',
    backgroundColor: 'rgba(18, 40, 25, 0.5)',
    overflow: 'hidden',
    gap: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: 'rgba(140, 200, 160, 0.5)',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    textTransform: 'uppercase',
  },

  /* ── Cards ── */
  cards: {
    gap: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(80, 160, 100, 0.1)',
  },
  cardPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(80, 160, 100, 0.1)',
    backgroundColor: 'rgba(40, 100, 60, 0.2)',
  },
  cardDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(80, 160, 100, 0.1)',
    opacity: 0.45,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dff0e4',
    marginBottom: 1,
  },
  cardTitleDisabled: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dff0e4',
    marginBottom: 1,
  },
  cardSub: {
    fontSize: 12,
    color: 'rgba(180, 220, 190, 0.5)',
  },
  cardSubDisabled: {
    fontSize: 12,
    color: 'rgba(180, 220, 190, 0.4)',
  },
  chevron: {
    fontSize: 22,
    color: 'rgba(180, 220, 190, 0.3)',
    lineHeight: 26,
  },

  /* ── Features ── */
  featureList: {
    gap: 0,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(80, 160, 100, 0.1)',
  },
  featureEmoji: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dff0e4',
  },
  featureDesc: {
    fontSize: 12,
    color: 'rgba(180, 220, 190, 0.5)',
    lineHeight: 16,
  },
});