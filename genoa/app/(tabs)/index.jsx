import { Image } from 'expo-image';
import { Platform, StyleSheet, Pressable, Text } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#0F172A', dark: '#0B1220' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      {/* HERO */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Genoa</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Bienvenue 👋</ThemedText>
        <ThemedText>
          Genoa est une application interactive pour explorer votre arbre généalogique en temps réel.
        </ThemedText>
      </ThemedView>

      {/* CTA */}
      <ThemedView style={styles.stepContainer}>
        <Link href="../tree" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>🌳 Explorer l'arbre</Text>
          </Pressable>
        </Link>
      </ThemedView>

      {/* FEATURES */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Fonctionnalités</ThemedText>
        <ThemedText>• Visualisation interactive de l'arbre</ThemedText>
        <ThemedText>• Zoom & déplacement fluide</ThemedText>
        <ThemedText>• Navigation entre générations</ThemedText>
        <ThemedText>• Mise à jour dynamique des données</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    backgroundColor: '#2d7a2d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});