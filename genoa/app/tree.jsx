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
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import FamilyTree from '@/components/tree/FamilyTree';
import AddMemberModal from '@/components/tree/AddMemberModal';
import { getMembres, postMembre } from '@/components/api/api';

export default function TreeScreen() {
  const params = useLocalSearchParams();
  const targetUserId = params.userId ? parseInt(params.userId) : null;
  const mode = params.mode || 'mine';

  const [authState, setAuthState] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFirstMemberModal, setShowFirstMemberModal] = useState(false);
  const [firstMemberPrenom, setFirstMemberPrenom] = useState('');
  const [creatingFirst, setCreatingFirst] = useState(false);
  const [treeKey, setTreeKey] = useState(0);

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
        if (!targetUserId || targetUserId === decoded.id) {
          checkFirstMember(decoded.id);
        }
      } else {
        await AsyncStorage.removeItem('userToken');
        setAuthState(null);
      }
    } catch (e) {
      console.error('Erreur checkAuth:', e);
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
      console.error('Erreur checkFirstMember:', e);
    }
  };

  const handleCreateFirstMember = async () => {
    const prenom = firstMemberPrenom.trim();
    
    if (!prenom) {
      Alert.alert('Erreur', 'Veuillez entrer votre prénom.');
      return;
    }

    setCreatingFirst(true);
    
    try {
      console.log('🌱 Création du premier membre avec:', { prenom, userId: authState.userId });

      // Créer le membre (racine de l'arbre)
      const newMembre = await postMembre({
        prénom: prenom,
        nom: prenom,
        sexe: null,
        date_naissance: null,
        date_décès: null,
        id_user: authState.userId,
        informations_complémentaires: null,
        photo: null,
        privé: false,
        id_union: null, // Racine de l'arbre = pas de parents
        biologique: null,
      });

      console.log('✅ Membre créé:', newMembre);

      // Fermer le modal et rafraîchir
      setShowFirstMemberModal(false);
      setFirstMemberPrenom('');
      setTreeKey((k) => k + 1);
      
      Alert.alert(
        'Succès ! 🎉',
        `Bienvenue ${prenom} ! Votre arbre généalogique a été créé.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('❌ Erreur création premier membre:', error);
      Alert.alert(
        'Erreur',
        `Impossible de créer votre profil.\n\nDétails: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setCreatingFirst(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

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

  const displayUserId = targetUserId || authState.userId;
  const isMyTree = displayUserId === authState.userId;
  const canEdit = isMyTree || authState.role === 'admin' || authState.role === 'editeur';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              {isMyTree ? 'Mon arbre' : `Arbre utilisateur #${displayUserId}`}
            </Text>
            <Text style={styles.headerSubtitle}>
              {canEdit ? 'Modification autorisée' : 'Lecture seule'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{authState.role}</Text>
            </View>
            {canEdit && (
              <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addBtnText}>+ Ajouter</Text>
              </Pressable>
            )}
          </View>
        </View>

        <FamilyTree
          key={treeKey}
          userId={authState.userId}
          userRole={authState.role}
          targetUserId={displayUserId}
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
                Pour commencer votre arbre généalogique, entrez votre prénom. 
                Cela créera le sommet de votre arbre familial.
              </Text>
              <TextInput
                style={styles.firstMemberInput}
                value={firstMemberPrenom}
                onChangeText={setFirstMemberPrenom}
                placeholder="Votre prénom"
                placeholderTextColor="#5a7a65"
                autoFocus
                editable={!creatingFirst}
              />
              <Pressable
                style={[styles.firstMemberBtn, creatingFirst && styles.btnDisabled]}
                onPress={handleCreateFirstMember}
                disabled={creatingFirst}
              >
                {creatingFirst ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.firstMemberBtnText}>Créer mon arbre 🌳</Text>
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
          currentUserId={displayUserId}
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
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(140,200,160,0.5)',
    marginTop: 2,
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
  firstMemberOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  firstMemberModal: {
    backgroundColor: '#0e2318',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
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
    color: 'rgba(180,220,190,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
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