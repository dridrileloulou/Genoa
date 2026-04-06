import { Button } from '@react-navigation/elements';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';


export function Login() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Pressable
        style={({ pressed }) => [
          styles.googleButton,
          { opacity: pressed ? 0.85 : 1 }
        ]}
        onPress={() => {
          openBrowserAsync('https://accounts.google.com/signin', {
            presentationStyle: WebBrowserPresentationStyle.FULLSCREEN,
          });
        }}
      >
        <Text style={styles.googleButtonText}>🔐 Login with Google</Text>
      </Pressable>
      <Text style={styles.label}>Username or Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username or email"
        placeholderTextColor="#4a6b4a"
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#4a6b4a"
        secureTextEntry
      />
      <Pressable
        style={({ pressed }) => [
          styles.loginButton,
          { opacity: pressed ? 0.85 : 1 }
        ]}
        onPress={() => {
          // Handle login logic here
        }}
      >
        <Text style={styles.loginButtonText}>🚀 Login</Text>
      </Pressable>
      <Text style={styles.signupText}>
        Don't have an account? <Link href="/signup" style={styles.link}>Sign up</Link>
      </Text>
      <Text style={styles.signupText}>
        Forgot your password? <Link href="/reset-password" style={styles.link}>Reset it</Link>
      </Text>
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
  googleButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: 0.5,
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