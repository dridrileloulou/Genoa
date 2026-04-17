import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { useState } from 'react';

export function CreateUser({ visible, onClose, onUserCreated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const createUser = async () => {
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmail('');
        setPassword('');
        onUserCreated?.();
        onClose();
      } else {
        alert(data.error || 'Error');
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
          <Text style={styles.title}>Create User</Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <Pressable style={styles.createBtn} onPress={createUser}>
            <Text style={styles.btnText}>
              {loading ? 'Creating...' : 'Create'}
            </Text>
          </Pressable>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.btnText}>Cancel</Text>
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
    width: '85%',
    backgroundColor: '#0f1115',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d7a2d',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#161b22',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2d7a2d',
  },

  createBtn: {
    backgroundColor: '#2d7a2d',
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },

  closeBtn: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
});
