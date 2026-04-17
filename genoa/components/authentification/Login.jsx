import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { SignUpModal } from './SignUpModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Stocker le token
        await AsyncStorage.setItem('userToken', data.token);
        
        alert('Connexion réussie !');
        setEmail('');
        setPassword('');
        
        // Appeler le callback pour mettre à jour l'état de connexion
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        alert(data.error || "Identifiants incorrects ou compte non validé");
      }
    } catch (error) {
      console.error(error);
      alert('Erreur de connexion : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#4a6b4a"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#4a6b4a"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={({ pressed }) => [
          styles.loginButton,
          { opacity: pressed || loading ? 0.6 : 1 }
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {loading ? '⏳ Connexion...' : '🚀 Login'}
        </Text>
      </Pressable>

      <Text style={styles.signupText}>
        Don't have an account?{' '}
        <Pressable onPress={() => setModalVisible(true)}>
          <Text style={styles.link}>Sign up</Text>
        </Pressable>
      </Text>

      <SignUpModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 28,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f6f8f6',
    marginBottom: 24,
    letterSpacing: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f6f8f6',
    marginTop: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#2d7a2d',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#e8f5e8',
  },
  signupText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  link: {
    color: '#2d7a2d',
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: '#2d7a2d',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#1f5a1f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});