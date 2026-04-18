import { View, Text, TextInput, Pressable, Modal, StyleSheet } from 'react-native';
import { useState } from 'react';
import { API_URL } from '@/constants/api';

export function CreateUser({ visible, onClose, onUserCreated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const createUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmail('');
        setPassword('');
        onUserCreated?.();
        onClose();
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Créer un utilisateur</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            placeholder="Mot de passe"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <Pressable
            style={({ pressed }) => [styles.createBtn, (pressed || loading) && styles.btnPressed]}
            onPress={createUser}
            disabled={loading}
          >
            <Text style={styles.createBtnText}>
              {loading ? 'Création...' : 'Créer'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.btnPressed]}
            onPress={onClose}
          >
            <Text style={styles.cancelBtnText}>Annuler</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '88%',
    backgroundColor: '#0F172A',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#ffffff',
  },
  createBtn: {
    backgroundColor: '#60A5FA',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
  cancelBtn: {
    backgroundColor: '#1E293B',
    padding: 13,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  btnPressed: {
    opacity: 0.7,
  },
});