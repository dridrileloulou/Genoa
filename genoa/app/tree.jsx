import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import FamilyTree from '@/components/tree/FamilyTree';
import AddMemberModal from '@/components/tree/AddMemberModal';
import { getMembres, postMembre } from '@/components/api/api';

export default function TreeScreen() {
  const [authState, setAuthState] = useState(null); // null = loading
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFirstMemberModal, setShowFirstMemberModal] = useState(false);
  const [firstMemberPrenom, setFirstMemberPrenom] = useState('');
  const [creatingFirst, setCreatingFirst] = useState(false);
  const [treeKey, setTreeKey] = useState(0); // pour forcer le re-render du tree

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) { setAuthState(null); return; }
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        setAuthState({
          userId: decoded.id,
          role: decoded.role,
          token,
        });
        // Vérifier si l'user a déjà un membre
        checkFirstMember(decoded.id);
      } else {
        await AsyncStorage.removeItem('userToken');
        setAuthState(null);
      }
    } catch (e) {
      setAuthState(null);
    }
  };

  const checkFirstMember = async (userId) => {
    try {
      const membres = await getMembres();
      const myMembre = membres.find((m) => m.id_user === userId);
      if (!myMembre) {
        setShowFirstMemberModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFirstMember = async () => {
    if (!firstMemberPrenom.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre prénom.');
      return;
    }
    setCreatingFirst(true);
    try {
      await postMembre({
        prénom: firstMemberPrenom.trim(),
        nom: null,
        sexe: null,
        date_naissance: null,
        date_décès: null,
        id_user: authState.userId,
        informations_complémentaires: null,
        photo: null,
        privé: false,
        id_union: null,
        biologique: null,
      });
      setShowFirstMemberModal(false);
      setTreeKey((k) => k + 1);
    } catch (e) {
      Alert.alert('Erreur', "Impossible de créer votre membre.");
    } finally {
      setCreatingFirst(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

  // Non connecté
  if (!authState) {
    return (
      <View style={styles.gateContainer}>
        <Text style={styles.gateEmoji}>🔒</Text>
        <Text style={styles.gateTitle}>Accès restreint</Text>
        <Text style={styles.gateText}>
          Connectez-vous depuis l'onglet Profil pour accéder à l'arbre.
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Arbre généalogique</Text>
          <View style={styles.headerRight}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{authState.role}</Text>
            </View>
            {(authState.role === 'admin' || authState.role === 'editeur') && (
              <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addBtnText}>+ Ajouter</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Arbre */}
        <FamilyTree
          key={treeKey}
          userId={authState.userId}
          userRole={authState.role}
        />

        {/* Modal premier membre */}
        <Modal
          visible={showFirstMemberModal}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.firstMemberOverlay}>
            <View style={styles.firstMemberModal}>
              <Text style={styles.firstMemberEmoji}>👋</Text>
              <Text style={styles.firstMemberTitle}>Bienvenue sur Genoa</Text>
              <Text style={styles.firstMemberText}>
                Pour commencer, entrez votre prénom. Vous pourrez compléter votre profil ensuite.
              </Text>
              <TextInput
                style={styles.firstMemberInput}
                value={firstMemberPrenom}
                onChangeText={setFirstMemberPrenom}
                placeholder="Votre prénom"
                placeholderTextColor="#5a7a65"
                autoFocus
              />
              <Pressable
                style={[styles.firstMemberBtn, creatingFirst && styles.btnDisabled]}
                onPress={handleCreateFirstMember}
                disabled={creatingFirst}
              >
                {creatingFirst ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.firstMemberBtnText}>Commencer</Text>
                )}
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Modal ajout membre */}
        <AddMemberModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            setTreeKey((k) => k + 1);
          }}
          currentUserId={authState.userId}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f12',
  },

  /* ── Gate (non connecté) ── */
  gateContainer: {
    flex: 1,
    backgroundColor: '#0a1f12',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  gateEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  gateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e0f0e8',
    textAlign: 'center',
  },
  gateText: {
    fontSize: 15,
    color: 'rgba(180,220,190,0.55)',
    textAlign: 'center',
    lineHeight: 22,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(80,160,100,0.12)',
    backgroundColor: '#0a1f12',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e0f0e8',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBadge: {
    backgroundColor: 'rgba(76,218,122,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76,218,122,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 12,
    color: '#4cda7a',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  addBtn: {
    backgroundColor: '#1e5c34',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(76,218,122,0.3)',
  },
  addBtnText: {
    color: '#e0f0e8',
    fontWeight: '700',
    fontSize: 13,
  },

  /* ── Premier membre ── */
  firstMemberOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  firstMemberModal: {
    backgroundColor: '#0e2318',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(80,160,100,0.2)',
  },
  firstMemberEmoji: {
    fontSize: 44,
    marginBottom: 4,
  },
  firstMemberTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e0f0e8',
    textAlign: 'center',
  },
  firstMemberText: {
    fontSize: 14,
    color: 'rgba(180,220,190,0.6)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  firstMemberInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(80,160,100,0.25)',
    borderRadius: 12,
    padding: 14,
    color: '#e0f0e8',
    fontSize: 16,
    textAlign: 'center',
  },
  firstMemberBtn: {
    width: '100%',
    backgroundColor: '#1e5c34',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(76,218,122,0.3)',
  },
  firstMemberBtnText: {
    color: '#e0f0e8',
    fontWeight: '700',
    fontSize: 16,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});