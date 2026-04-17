import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api';

const BASE_URL = API_URL;

const getToken = async () => AsyncStorage.getItem('userToken');

const authHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res, route) => {
  const text = await res.text();
  console.log(`[API] ${route} → ${res.status}:`, text);
  try { return JSON.parse(text); }
  catch { return text; }
};

// ── Membres ──
export const getMembres = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/membres`, { headers });
  return handleResponse(res, 'GET /membres');
};

export const getMembre = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/membres/${id}`, { headers });
  return handleResponse(res, `GET /membres/${id}`);
};

export const postMembre = async (data) => {
  const headers = await authHeaders();
  const body = {
    "prénom": data.prénom,
    nom: data.nom ?? null,
    sexe: data.sexe ?? null,
    date_naissance: data.date_naissance ?? null,
    "date_décès": data['date_décès'] ?? null,
    id_user: data.id_user ? parseInt(data.id_user) : null,
    "informations_complémentaires": data['informations_complémentaires'] ?? null,
    photo: data.photo ?? null,
    "privé": data['privé'] ?? false,
    id_union: data.id_union ?? null,
    biologique: data.biologique ?? null,
  };
  console.log('[API] postMembre body:', JSON.stringify(body));
  const res = await fetch(`${BASE_URL}/membres`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  return handleResponse(res, 'POST /membres');
};

export const patchMembre = async (id, data) => {
  const headers = await authHeaders();
  const body = {
    "prénom": data['prénom'] || data.prénom,
    nom: data.nom ?? null,
    sexe: data.sexe ?? null,
    date_naissance: data.date_naissance ?? null,
    "date_décès": data['date_décès'] ?? null,
    "informations_complémentaires": data['informations_complémentaires'] ?? null,
    photo: data.photo ?? null,
    "privé": data['privé'] ?? false,
    id_union: data.id_union ?? null,
    biologique: data.biologique ?? null,
  };
  console.log(`[API] patchMembre ${id} body:`, JSON.stringify(body));
  const res = await fetch(`${BASE_URL}/membres/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify(body),
  });
  return handleResponse(res, `PATCH /membres/${id}`);
};

export const deleteMembre = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/membres/${id}`, {
    method: 'DELETE', headers,
  });
  return handleResponse(res, `DELETE /membres/${id}`);
};

// ── Unions ──
export const getUnions = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/unions`, { headers });
  return handleResponse(res, 'GET /unions');
};

export const getUnion = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/unions/${id}`, { headers });
  return handleResponse(res, `GET /unions/${id}`);
};

export const postUnion = async (data) => {
  const headers = await authHeaders();
  const body = {
    id_membre_1: data.id_membre_1 ?? null,
    id_membre_2: data.id_membre_2 ?? null,
    date_union: data.date_union ?? null,
    "date_séparation": data['date_séparation'] ?? null,
  };
  console.log('[API] postUnion body:', JSON.stringify(body));
  const res = await fetch(`${BASE_URL}/unions`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  return handleResponse(res, 'POST /unions');
};

export const patchUnion = async (id, data) => {
  const headers = await authHeaders();
  const body = {
    id_membre_1: data.id_membre_1 ?? null,
    id_membre_2: data.id_membre_2 ?? null,
    date_union: data.date_union ?? null,
    "date_séparation": data['date_séparation'] ?? null,
  };
  console.log(`[API] patchUnion ${id} body:`, JSON.stringify(body));
  const res = await fetch(`${BASE_URL}/unions/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify(body),
  });
  return handleResponse(res, `PATCH /unions/${id}`);
};

// ── Coordonnées ──
export const getCoordonnees = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/coordonnees/${id}`, { headers });
  return handleResponse(res, `GET /coordonnees/${id}`);
};

export const postCoordonnees = async (data) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/coordonnees`, {
    method: 'POST', headers, body: JSON.stringify(data),
  });
  return handleResponse(res, 'POST /coordonnees');
};

export const patchCoordonnees = async (id, data) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/coordonnees/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify(data),
  });
  return handleResponse(res, `PATCH /coordonnees/${id}`);
};

// ── Professions ──
export const getProfessions = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/professions/${id}`, { headers });
  return handleResponse(res, `GET /professions/${id}`);
};

export const postProfession = async (data) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/professions`, {
    method: 'POST', headers, body: JSON.stringify(data),
  });
  return handleResponse(res, 'POST /professions');
};

export const patchProfession = async (id, data) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/professions/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify(data),
  });
  return handleResponse(res, `PATCH /professions/${id}`);
};