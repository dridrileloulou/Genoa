import { View, Text, StyleSheet, Pressable, Modal, ScrollView, ActivityIndicator } from 'react-native';
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
      if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
      <View style={styles.overlay}>
        <View style={styles.modal}>

          <Text style={styles.modalTitle}>Utilisateurs</Text>

          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.btnPressed]}
            onPress={() => setCreateVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Ajouter un utilisateur</Text>
          </Pressable>

          <CreateUser
            visible={createVisible}
            onClose={() => setCreateVisible(false)}
            onUserCreated={fetchUsers}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#60A5FA" style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {users.length > 0 ? users.map((user) => (
                <View key={user.id} style={styles.card}>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{user.role}</Text>
                    </View>
                    <View style={[styles.badge, user.validé ? styles.badgeValid : styles.badgeInvalid]}>
                      <Text style={styles.badgeText}>{user.validé ? '✓ Validé' : '✗ Non validé'}</Text>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      style={({ pressed }) => [styles.actionBtn, styles.deleteBtn, pressed && styles.btnPressed]}
                      onPress={() => deleteUser(user.id)}
                    >
                      <Text style={styles.actionBtnText}>Supprimer</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.actionBtn, styles.roleBtn, pressed && styles.btnPressed]}
                      onPress={() => toggleAdmin(user.id, user.role)}
                    >
                      <Text style={styles.actionBtnText}>→ {nextRole(user.role)}</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.actionBtn, styles.validateBtn, pressed && styles.btnPressed]}
                      onPress={() => toggleValidation(user.id, user.validé)}
                    >
                      <Text style={styles.actionBtnText}>{user.validé ? 'Invalider' : 'Valider'}</Text>
                    </Pressable>
                  </View>
                </View>
              )) : (
                <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
              )}
            </ScrollView>
          )}

          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && styles.btnPressed]}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>Fermer</Text>
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
    backgroundColor: '#0F172A',
    width: '92%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },

  /* ── Bouton ajout ── */
  addButton: {
    backgroundColor: '#60A5FA',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  addButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },

  /* ── Liste ── */
  list: {
    maxHeight: 320,
  },

  /* ── Carte utilisateur ── */
  card: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  userEmail: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeValid: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  badgeInvalid: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  badgeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  roleBtn: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  validateBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },

  /* ── Bouton fermer ── */
  closeBtn: {
    backgroundColor: '#1E293B',
    padding: 13,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  btnPressed: {
    opacity: 0.7,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
});