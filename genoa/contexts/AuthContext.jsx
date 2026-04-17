// =====================================================
// CONTEXTE D'AUTHENTIFICATION GLOBAL
// Permet à toutes les pages d'accéder à l'état de connexion
// et de déclencher la déconnexion depuis n'importe où
// =====================================================

import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '@/constants/api';

// Création du contexte (valeur par défaut = null, sera fournie par le Provider)
const AuthContext = createContext(null);

// =====================================================
// PROVIDER : enveloppe l'app pour fournir l'état d'auth partout
// =====================================================
export function AuthProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [role, setRole] = useState(null);       // 'admin', 'éditeur', 'lecteur'
  const [userId, setUserId] = useState(null);    // id de l'utilisateur connecté
  const [userEmail, setUserEmail] = useState(null); // email de l'utilisateur connecté
  const [loading, setLoading] = useState(true);  // true tant qu'on vérifie le token au démarrage

  // Vérifie le token stocké dans AsyncStorage au lancement de l'app
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (token) {
        const decoded = jwtDecode(token);

        // Vérifier si le token n'est pas expiré
        if (decoded.exp * 1000 > Date.now()) {
          setConnected(true);
          setRole(decoded.role);
          setUserId(decoded.id);
          // Récupérer l'email de l'utilisateur depuis l'API
          fetchEmail(decoded.id, token);
        } else {
          // Token expiré → on le supprime
          await AsyncStorage.removeItem('userToken');
          resetState();
        }
      } else {
        resetState();
      }
    } catch (error) {
      console.error('Erreur vérification token:', error);
      resetState();
    } finally {
      setLoading(false);
    }
  };

  // Récupère l'email de l'utilisateur connecté depuis l'API
  const fetchEmail = async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) setUserEmail(data[0].email);
      }
    } catch (err) {
      console.error('Erreur récupération email:', err);
    }
  };

  // Remet tout à zéro (état déconnecté)
  const resetState = () => {
    setConnected(false);
    setRole(null);
    setUserId(null);
    setUserEmail(null);
  };

  // Fonction de déconnexion — appelable depuis n'importe quel composant via useAuth()
  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    resetState();
  };

  // Fonction appelée après un login réussi — relit le token pour mettre à jour l'état
  const onLoginSuccess = () => {
    checkAuth();
  };

  // Vérification au montage du Provider (= au lancement de l'app)
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ connected, role, userId, userEmail, loading, logout, onLoginSuccess }}>
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// HOOK : raccourci pour utiliser le contexte dans un composant
// Usage : const { connected, logout } = useAuth();
// =====================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  }
  return context;
}
