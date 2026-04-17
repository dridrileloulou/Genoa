import Constants from 'expo-constants';

const getApiUrl = () => {
  // En production, on utilise la vraie URL
  if (!__DEV__) {
    return 'https://api.tondomaine.com';
  }

  // Expo connaît l'IP de ton PC (ex: "192.168.1.51:8081")
  // On récupère juste la partie IP, et on met notre port à nous (3000)
  const debuggerHost =
    Constants.expoConfig?.hostUri ??   // SDK 46+
    Constants.manifest?.debuggerHost;  // SDK < 46 (fallback)

  const ip = debuggerHost?.split(':')[0];

  if (!ip) {
    console.warn('Impossible de détecter l\'IP, fallback sur localhost');
    return 'http://localhost:3000';
  }

  return `http://${ip}:3000`;
};

export const API_URL = getApiUrl();