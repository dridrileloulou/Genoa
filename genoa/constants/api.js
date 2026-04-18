import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  // ✅ Pour émulateur Android
  if (Platform.OS === 'android' && !Constants.isDevice) {
    return 'http://10.0.2.2:3000/api'; // ✅ AVEC /api
  }

  // ✅ En développement
  if (__DEV__) {
    const debuggerHost =
      Constants.expoConfig?.hostUri ??
      Constants.manifest?.debuggerHost;

    const ip = debuggerHost?.split(':')[0];

    if (!ip) {
      console.warn('⚠️ Impossible de détecter l\'IP, fallback sur localhost');
      return 'http://localhost:3000/api'; // ✅ AVEC /api
    }

    return `http://${ip}:3000/api`; // ✅ AVEC /api
  }

  // ✅ En production
  return 'https://api.tondomaine.com/api'; // ✅ AVEC /api
};

export const API_URL = getApiUrl();

// ✅ Log pour vérifier
console.log('🌐 API_URL configurée:', API_URL);