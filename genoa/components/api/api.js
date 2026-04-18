import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api'; // ✅ Import depuis constants/api.js

// ✅ Log de l'URL au démarrage
console.log('🌐 API_URL importée depuis constants/api.js:', API_URL);

// ==================== MEMBRES ====================

export async function getMembres() {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log('📡 GET /membres');
    
    const response = await fetch(`${API_URL}/membres`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    console.log('📥 Réponse GET /membres:', response.status);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erreur getMembres:', error);
    throw error;
  }
}

export async function postMembre(membreData) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log('📡 POST /membres avec:', membreData);
    console.log('🔑 Token présent:', !!token);
    console.log('🌐 URL complète:', `${API_URL}/membres`);
    
    const response = await fetch(`${API_URL}/membres`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(membreData),
    });

    console.log('📥 Réponse POST /membres:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur serveur:', error);
      throw new Error(`Erreur ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Membre créé:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur postMembre:', error.message);
    throw error;
  }
}

export async function patchMembre(id, membreData) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log(`📡 PATCH /membres/${id}`);
    
    const response = await fetch(`${API_URL}/membres/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(membreData),
    });

    console.log(`📥 Réponse PATCH /membres/${id}:`, response.status);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erreur patchMembre:', error);
    throw error;
  }
}

export async function deleteMembre(id) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log(`📡 DELETE /membres/${id}`);
    
    const response = await fetch(`${API_URL}/membres/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    console.log(`📥 Réponse DELETE /membres/${id}:`, response.status);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erreur deleteMembre:', error);
    throw error;
  }
}

// ==================== UNIONS ====================

export async function getUnions() {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log('📡 GET /unions');
    
    const response = await fetch(`${API_URL}/unions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    console.log('📥 Réponse GET /unions:', response.status);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erreur getUnions:', error);
    throw error;
  }
}

export async function postUnion(unionData) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log('📡 POST /unions avec:', unionData);
    
    const response = await fetch(`${API_URL}/unions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(unionData),
    });

    console.log('📥 Réponse POST /unions:', response.status);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Union créée:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur postUnion:', error);
    throw error;
  }
}

export async function patchUnion(id, unionData) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log(`📡 PATCH /unions/${id}`);
    
    const response = await fetch(`${API_URL}/unions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(unionData),
    });

    console.log(`📥 Réponse PATCH /unions/${id}:`, response.status);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erreur patchUnion:', error);
    throw error;
  }
}

export async function deleteUnion(id) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log(`📡 DELETE /unions/${id}`);
    
    const response = await fetch(`${API_URL}/unions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    console.log(`📥 Réponse DELETE /unions/${id}:`, response.status);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erreur deleteUnion:', error);
    throw error;
  }
}

// ==================== AUTH ====================

export async function login(email, password) {
  try {
    console.log('📡 POST /login');
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('📥 Réponse POST /login:', response.status);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Connexion réussie');
    return result;
  } catch (error) {
    console.error('❌ Erreur login:', error);
    throw error;
  }
}

export async function register(email, password) {
  try {
    console.log('📡 POST /users (register)');
    
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('📥 Réponse POST /users:', response.status);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Inscription réussie');
    return result;
  } catch (error) {
    console.error('❌ Erreur register:', error);
    throw error;
  }
}