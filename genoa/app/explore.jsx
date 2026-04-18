import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { getMembres } from '@/components/api/api';

export default function ExploreScreen() {
  const router = useRouter();
  const [authState, setAuthState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTrees, setUserTrees] = useState([]);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setAuthState(null);
        setLoading(false);
        return;
      }
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        setAuthState({
          userId: decoded.id,
          role: decoded.role,
          token,
        });
        await loadUserTrees(decoded.id);
      } else {
        await AsyncStorage.removeItem('userToken');
        setAuthState(null);
        setLoading(false);
      }
    } catch (e) {
      setAuthState(null);
      setLoading(false);
    }
  };

  const loadUserTrees = async (currentUserId) => {
    setLoading(true);
    try {
      const membres = await getMembres();
      
      // Grouper les membres par id_user
      const userMap = {};
      membres.forEach((m) => {
        if (m.id_user) {
          if (!userMap[m.id_user]) {
            userMap[m.id_user] = {
              userId: m.id_user,
              membres: [],
              isOwner: m.id_user === currentUserId,
            };
          }
          userMap[m.id_user].membres.push(m);
        }
      });

      // Convertir en tableau et trier (l'utilisateur connecté en premier)
      const trees = Object.values(userMap).sort((a, b) => {
        if (a.isOwner) return -1;
        if (b.isOwner) return 1;
        return 0;
      });

      setUserTrees(trees);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

  const handleTreePress = (userId, isOwner) => {
    router.push(`/tree?userId=${userId}&mode=${isOwner ? 'mine' : 'explore'}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4cda7a" size="large" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorer les arbres</Text>
        {authState && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{authState.role}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {userTrees.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌳</Text>
            <Text style={styles.emptyText}>Aucun arbre disponible</Text>
          </View>
        ) : (
          userTrees.map((tree) => (
            <Pressable
              key={tree.userId}
              style={({ pressed }) => [
                styles.treeCard,
                tree.isOwner && styles.treeCardOwner,
                pressed && styles.treeCardPressed,
              ]}
              onPress={() => handleTreePress(tree.userId, tree.isOwner)}
            >
              <View style={styles.treeCardHeader}>
                <Text style={styles.treeCardEmoji}>
                  {tree.isOwner ? '🏠' : '👥'}
                </Text>
                <View style={styles.treeCardBody}>
                  <Text style={styles.treeCardTitle}>
                    {tree.isOwner ? 'Mon arbre familial' : `Arbre de l'utilisateur #${tree.userId}`}
                  </Text>
                  <Text style={styles.treeCardCount}>
                    {tree.membres.length} membre{tree.membres.length > 1 ? 's' : ''}
                  </Text>
                  {tree.membres.length > 0 && (
                    <Text style={styles.treeCardPreview}>
                      {tree.membres.slice(0, 3).map((m) => m.prénom).join(', ')}
                      {tree.membres.length > 3 && '...'}
                    </Text>
                  )}
                </View>
              </View>
              
              {tree.isOwner && (
                <View style={styles.ownerBadge}>
                  <Text style={styles.ownerBadgeText}>Votre arbre</Text>
                </View>
              )}
              
              <View style={styles.treeCardFooter}>
                <Text style={styles.treeCardAccess}>
                  {authState?.role === 'lecteur' && !tree.isOwner
                    ? '👁️ Lecture seule'
                    : tree.isOwner || authState?.role === 'admin' || authState?.role === 'editeur'
                    ? '✏️ Modification autorisée'
                    : '👁️ Lecture seule'}
                </Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f12',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a1f12',
    gap: 12,
  },
  loadingText: {
    color: 'rgba(180,220,190,0.5)',
    fontSize: 14,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(180,220,190,0.5)',
  },
  treeCard: {
    backgroundColor: '#122b1c',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76,218,122,0.15)',
    padding: 16,
    gap: 12,
  },
  treeCardOwner: {
    backgroundColor: 'rgba(30,92,52,0.3)',
    borderColor: 'rgba(76,218,122,0.35)',
  },
  treeCardPressed: {
    backgroundColor: 'rgba(30,92,52,0.5)',
  },
  treeCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  treeCardEmoji: {
    fontSize: 32,
  },
  treeCardBody: {
    flex: 1,
    gap: 4,
  },
  treeCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e0f0e8',
  },
  treeCardCount: {
    fontSize: 13,
    color: '#4cda7a',
    fontWeight: '600',
  },
  treeCardPreview: {
    fontSize: 12,
    color: 'rgba(180,220,190,0.5)',
    marginTop: 4,
  },
  ownerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(76,218,122,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76,218,122,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerBadgeText: {
    fontSize: 11,
    color: '#4cda7a',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  treeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(80,160,100,0.1)',
  },
  treeCardAccess: {
    fontSize: 12,
    color: 'rgba(180,220,190,0.6)',
  },
  chevron: {
    fontSize: 20,
    color: '#475569',
  },
});