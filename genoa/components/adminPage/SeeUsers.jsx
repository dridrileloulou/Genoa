import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView
} from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateUser } from './CreateUser';
import { API_URL } from '@/constants/api';

export function SeeUser({ visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [createVisible, setCreateVisible] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        alert(data.error || 'Erreur lors de la récupération');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) fetchUsers();
  }, [visible]);

  const deleteUser = async (id) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cycle des rôles : lecteur → éditeur → admin → lecteur
  const nextRole = (current) => {
    if (current === 'lecteur') return 'éditeur';
    if (current === 'éditeur') return 'admin';
    return 'lecteur';
  };

  const toggleAdmin = async (id, currentRole) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const newRole = nextRole(currentRole);
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        // Le back retourne l'user mis à jour, on remplace dans la liste locale
        setUsers(prev => prev.map(u => (u.id === id ? data : u)));
      } else {
        alert(data.error || data.erreur || 'Erreur lors du changement de rôle');
      }
    } catch (err) {
      console.error('Erreur toggleAdmin:', err);
      alert('Erreur réseau');
    }
  };

  const toggleValidation = async (id, current) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ valide: !current }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => (u.id === id ? data : u)));
      } else {
        alert(data.error || data.erreur || 'Erreur lors de la validation');
      }
    } catch (err) {
      console.error('Erreur toggleValidation:', err);
      alert('Erreur réseau');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>

          <Text style={styles.modalTitle}>Users</Text>

          <Pressable
            style={styles.addUserButton}
            onPress={() => setCreateVisible(true)}
          >
            <Text style={styles.addUserText}>+ Add User</Text>
          </Pressable>

          <CreateUser
            visible={createVisible}
            onClose={() => setCreateVisible(false)}
            onUserCreated={fetchUsers}
          />

          {loading ? (
            <Text style={styles.loading}>Loading...</Text>
          ) : (
            <ScrollView style={{ maxHeight: 260 }}>
              {users.length > 0 ? (
                users.map((user) => (
                  <View key={user.id} style={styles.card}>
                    <Text style={styles.name}>{user.email}</Text>
                    <Text style={styles.role}>Role: {user.role}</Text>
                    <Text style={styles.role}>Validé: {user.validé ? '✅ Oui' : '❌ Non'}</Text>
                    <View style={styles.actions}>
                      <Pressable style={styles.deleteBtn} onPress={() => deleteUser(user.id)}>
                        <Text style={styles.btnText}>Delete</Text>
                      </Pressable>
                      <Pressable style={styles.roleBtn} onPress={() => toggleAdmin(user.id, user.role)}>
                        <Text style={styles.btnText}>→ {nextRole(user.role)}</Text>
                      </Pressable>
                      <Pressable style={styles.roleBtn} onPress={() => toggleValidation(user.id, user.validé)}>
                        <Text style={styles.btnText}>{user.validé ? 'Invalidate' : 'Validate'}</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.loading}>No users found</Text>
              )}
            </ScrollView>
          )}

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.btnText}>Close</Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#0f1115',
    width: '90%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2d7a2d',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#161b22',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: { color: '#fff', fontWeight: '700' },
  role: { color: '#aaa', marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 10 },
  deleteBtn: { backgroundColor: '#b91c1c', padding: 8, borderRadius: 6 },
  roleBtn: { backgroundColor: '#2563eb', padding: 8, borderRadius: 6 },
  addUserButton: {
    backgroundColor: '#2d7a2d',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  addUserText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  closeBtn: { backgroundColor: '#333', padding: 10, borderRadius: 8, marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  loading: { color: '#aaa', textAlign: 'center', marginVertical: 10 },
});