import { View, Text, TextInput, StyleSheet, Pressable, Modal } from 'react-native';
import { useState } from 'react';
import { API_URL } from '@/constants/api';

export function SignUpModal({ visible, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Compte créé avec succès !');
        setEmail('');
        setPassword('');
        onClose();
      } else {
        alert(data.error || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Créer un compte</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre email"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre mot de passe"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={({ pressed }) => [styles.signupButton, (pressed || loading) && styles.buttonPressed]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? 'Création...' : 'Créer le compte'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && styles.buttonPressed]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Annuler</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 24,
    width: '88%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#ffffff',
  },
  signupButton: {
    backgroundColor: '#60A5FA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});