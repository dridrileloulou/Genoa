import { View, Text, TextInput, StyleSheet, Pressable, Modal } from 'react-native';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useState } from 'react';
import { useRouter } from 'expo-router'; // pour rediriger après login
import AsyncStorage from '@react-native-async-storage/async-storage'; // pour stocker le token
import { jwtDecode } from 'jwt-decode'; // pour décoder le token et récupérer id_user
import socket from '../../constants/socket'; // notre socket
import { SignUpModal } from './SignUpModal';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(''); // pour afficher les erreurs à l'utilisateur
  const router = useRouter(); // hook pour naviguer entre les pages

  const handleLogin = async () => {
    try {
      // 1. on envoie email + password au serveur
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // si le serveur répond avec une erreur (401 etc.)
        setError(data);
        return;
      }

      // 2. on stocke le token dans AsyncStorage (comme un localStorage)
      await AsyncStorage.setItem('token', data.token);

      // 3. on décode le token pour récupérer id_user sans refaire un fetch
      const decoded = jwtDecode(data.token); // decoded = { id: 42, role: 'admin', ... }
      await AsyncStorage.setItem('id_user', String(decoded.id)); // on stocke aussi l'id

      // 4. on prévient le serveur socket de qui on est
      socket.emit('identifier', { id_user: decoded.id });

      // 5. on redirige vers la page principale
      router.replace('/(tabs)');

    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Pressable
        style={({ pressed }) => [styles.googleButton, { opacity: pressed ? 0.85 : 1 }]}
        onPress={() => {
          openBrowserAsync('https://accounts.google.com/signin', {
            presentationStyle: WebBrowserPresentationStyle.FULLSCREEN,
          });
        }}
      >
        <Text style={styles.googleButtonText}>🔐 Login with Google</Text>
      </Pressable>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#4a6b4a"
        value={email}                        // relié au state
        onChangeText={setEmail}              // met à jour le state à chaque frappe
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#4a6b4a"
        secureTextEntry
        value={password}                     // relié au state
        onChangeText={setPassword}           // met à jour le state à chaque frappe
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.loginButton, { opacity: pressed ? 0.85 : 1 }]}
        onPress={handleLogin}               // appelle notre fonction
      >
        <Text style={styles.loginButtonText}>🚀 Login</Text>
      </Pressable>

      <Text style={styles.signupText}>
        Don't have an account?{' '}
        <Pressable onPress={() => setModalVisible(true)}>
          <Text style={styles.link}>Sign up</Text>
        </Pressable>
      </Text>
      <SignUpModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 28, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#f6f8f6', marginBottom: 24, letterSpacing: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#f6f8f6', marginTop: 16, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#2d7a2d', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 14, fontSize: 15, color: '#e8f5e8' },
  error: { color: '#ff4444', fontSize: 13, marginTop: 8, textAlign: 'center' },
  signupText: { color: '#888', fontSize: 14, textAlign: 'center', marginTop: 20, marginBottom: 8 },
  link: { color: '#2d7a2d', fontWeight: '700' },
  googleButton: { backgroundColor: '#ffffff', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#e0e0e0' },
  googleButtonText: { fontSize: 16, fontWeight: '700', color: '#1f2937', letterSpacing: 0.5 },
  loginButton: { backgroundColor: '#2d7a2d', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  loginButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
});