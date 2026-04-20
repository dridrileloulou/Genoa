import {
  Modal, View, Text, TextInput, Pressable,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import {
  patchMembre, deleteMembre,
  getMembres, getUnions, postUnion, patchUnion,
} from '@/components/api/api';
import socket from '@/constants/socket';

export default function MemberModal({ visible, membre, onClose, onSuccess, canEdit, isAdmin, currentUserId, treeOwnerId }) {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('infos');

  const [prénom, setPrénom] = useState('');
  const [nom, setNom] = useState('');
  const [sexe, setSexe] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [dateDécès, setDateDécès] = useState('');
  const [infos, setInfos] = useState('');

  const [allMembres, setAllMembres] = useState([]);
  const [allUnions, setAllUnions] = useState([]);
  const [parents, setParents] = useState([]);
  const [unionParentale, setUnionParentale] = useState(null);
  const [enfants, setEnfants] = useState([]);
  const [searchParent, setSearchParent] = useState('');
  const [searchEnfant, setSearchEnfant] = useState('');
  const [showDropParent, setShowDropParent] = useState(false);
  const [showDropEnfant, setShowDropEnfant] = useState(false);
  const [familleLoading, setFamilleLoading] = useState(false);

  // Déterminer l'id_user du propriétaire de l'arbre
  const effectiveTreeOwnerId = treeOwnerId || currentUserId || membre?.id_user;

  useEffect(() => {
    if (membre && visible) {
      setPrénom(membre['prénom'] || '');
      setNom(membre.nom || '');
      setSexe(membre.sexe || '');
      setDateNaissance(membre.date_naissance || '');
      setDateDécès(membre['date_décès'] || '');
      setInfos(membre['informations_complémentaires'] || '');
      setTab('infos');
      loadExtra(membre.id);
      if (canEdit && currentUserId) {
        socket.emit('verrouiller_membre', { id_membre: membre.id, id_user: currentUserId });
      }
    }
    return () => {
      if (membre && canEdit && currentUserId) {
        socket.emit('liberer_membre', { id_membre: membre.id, id_user: currentUserId });
      }
    };
  }, [membre, visible]);

  const loadExtra = async (membreId) => {
    try {
      const [ms, us] = await Promise.all([
        getMembres(),
        getUnions(),
      ]);

      const allMembresData = Array.isArray(ms) ? ms : [];
      const allUnionsData = Array.isArray(us) ? us : [];
      
      // Filtrer les membres par treeOwnerId pour n'afficher que ceux de l'arbre actuel
      const filteredMembres = effectiveTreeOwnerId
        ? allMembresData.filter((m) => m.id_user === effectiveTreeOwnerId)
        : allMembresData;
      
      // Créer un Set des IDs de membres de cet arbre
      const membreIdsSet = new Set(filteredMembres.map(m => m.id));
      
      // Filtrer les unions : une union appartient à l'arbre si au moins un de ses membres y appartient
      const filteredUnions = allUnionsData.filter((union) => 
        membreIdsSet.has(union.id_membre_1) || membreIdsSet.has(union.id_membre_2)
      );

      setAllMembres(filteredMembres);
      setAllUnions(filteredUnions);

      const membreCourant = filteredMembres.find(m => m.id === membreId);

      if (membreCourant?.id_union) {
        const unionP = filteredUnions.find(u => u.id === membreCourant.id_union);
        if (unionP) {
          setUnionParentale(unionP);
          const ps = [];
          if (unionP.id_membre_1) { const p = filteredMembres.find(m => m.id === unionP.id_membre_1); if (p) ps.push(p); }
          if (unionP.id_membre_2) { const p = filteredMembres.find(m => m.id === unionP.id_membre_2); if (p) ps.push(p); }
          setParents(ps);
        } else {
          setUnionParentale(null); setParents([]);
        }
      } else {
        setUnionParentale(null); setParents([]);
      }

      const mesUnions = filteredUnions.filter(u => u.id_membre_1 === membreId || u.id_membre_2 === membreId);
      const mesEnfants = filteredMembres.filter(m => mesUnions.some(u => u.id === m.id_union));
      setEnfants(mesEnfants);

    } catch (e) {
      console.error('[MemberModal] loadExtra error:', e);
    }
  };

  const handleAddParent = async (parentChoisi) => {
    if (parents.length >= 2) { Alert.alert('Info', 'Ce membre a déjà deux parents.'); return; }
    setFamilleLoading(true);
    try {
      const membreCourant = allMembres.find(m => m.id === membre.id);
      if (unionParentale) {
        const updatedUnion = {
          id_membre_1: unionParentale.id_membre_1,
          id_membre_2: unionParentale.id_membre_2,
          date_union: unionParentale.date_union,
          'date_séparation': unionParentale['date_séparation'],
        };
        if (!unionParentale.id_membre_1) updatedUnion.id_membre_1 = parentChoisi.id;
        else if (!unionParentale.id_membre_2) updatedUnion.id_membre_2 = parentChoisi.id;
        else { Alert.alert('Info', 'Ce membre a déjà deux parents.'); return; }
        await patchUnion(unionParentale.id, updatedUnion);
      } else {
        const newUnionResult = await postUnion({ id_membre_1: parentChoisi.id, id_membre_2: null });
        
        let newUnionId;
        if (newUnionResult && newUnionResult.id) {
          newUnionId = newUnionResult.id;
        } else {
          const updatedUnions = await getUnions();
          const newUnion = [...updatedUnions].sort((a, b) => b.id - a.id)[0];
          newUnionId = newUnion.id;
        }
        
        await patchMembre(membre.id, { 
          ...membreCourant, 
          id_union: newUnionId,
          id_user: membreCourant.id_user
        });
      }
      await loadExtra(membre.id);
      onSuccess();
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'ajouter le parent.");
      console.error(e);
    } finally {
      setFamilleLoading(false);
      setSearchParent('');
      setShowDropParent(false);
    }
  };

  const handleAddEnfant = async (enfantChoisi) => {
    setFamilleLoading(true);
    try {
      const unionExistante = allUnions.find(u => u.id_membre_1 === membre.id || u.id_membre_2 === membre.id);
      let unionId;
      if (unionExistante) {
        unionId = unionExistante.id;
      } else {
        const newUnionResult = await postUnion({ id_membre_1: membre.id, id_membre_2: null });
        
        if (newUnionResult && newUnionResult.id) {
          unionId = newUnionResult.id;
        } else {
          const updatedUnions = await getUnions();
          const newUnion = [...updatedUnions].sort((a, b) => b.id - a.id)[0];
          unionId = newUnion.id;
        }
      }
      const enfantData = allMembres.find(m => m.id === enfantChoisi.id);
      await patchMembre(enfantChoisi.id, { 
        ...enfantData, 
        id_union: unionId,
        id_user: enfantData.id_user
      });
      await loadExtra(membre.id);
      onSuccess();
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'ajouter l'enfant.");
      console.error(e);
    } finally {
      setFamilleLoading(false);
      setSearchEnfant('');
      setShowDropEnfant(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const membreCourant = allMembres.find(m => m.id === membre.id) || membre;
      await patchMembre(membre.id, {
        'prénom': prénom.trim(),
        nom: nom.trim() || null,
        sexe: sexe || null,
        date_naissance: dateNaissance || null,
        'date_décès': dateDécès || null,
        'informations_complémentaires': infos || null,
        photo: membreCourant.photo ?? null,
        'privé': membreCourant['privé'] ?? false,
        id_union: membreCourant.id_union ?? null,
        biologique: membreCourant.biologique ?? null,
        id_user: membreCourant.id_user ?? effectiveTreeOwnerId,
      });
      if (canEdit && currentUserId) {
        socket.emit('liberer_membre', { id_membre: membre.id, id_user: currentUserId });
      }
      onSuccess();
      onClose();
    } catch (e) {
      Alert.alert('Erreur', 'La modification a échoué.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer ce membre', `Voulez-vous vraiment supprimer ${membre?.['prénom']} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await deleteMembre(membre.id);
            onSuccess();
            onClose();
          } catch (e) {
            Alert.alert('Erreur', 'La suppression a échoué.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const membreName = (m) => `${m['prénom']} ${m.nom || ''}`.trim();

  const availableParents = allMembres.filter(m =>
    m.id !== membre?.id &&
    !parents.find(p => p.id === m.id) &&
    `${m['prénom']} ${m.nom || ''}`.toLowerCase().includes(searchParent.toLowerCase())
  );

  const availableEnfants = allMembres.filter(m =>
    m.id !== membre?.id &&
    !enfants.find(e => e.id === m.id) &&
    `${m['prénom']} ${m.nom || ''}`.toLowerCase().includes(searchEnfant.toLowerCase())
  );

  if (!membre) return null;

  const TABS = [
    { key: 'infos', label: 'Identité' },
    { key: 'famille', label: 'Famille' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{membre['prénom']} {membre.nom || ''}</Text>
              <Text style={styles.subtitle}>{canEdit ? 'Modifier le membre' : 'Détails'}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabs}>
              {TABS.map(t => (
                <Pressable key={t.key} style={[styles.tab, tab === t.key && styles.tabActive]} onPress={() => setTab(t.key)}>
                  <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">

            {tab === 'infos' && (
              <View style={styles.form}>
                <Field label="Prénom *" value={prénom} onChange={setPrénom} editable={canEdit} />
                <Field label="Nom" value={nom} onChange={setNom} editable={canEdit} />
                <Text style={styles.label}>Sexe</Text>
                <View style={styles.sexeRow}>
                  {['M', 'F', 'Autre'].map(s => (
                    <Pressable key={s} style={[styles.sexeBtn, sexe === s && styles.sexeBtnActive]} onPress={() => canEdit && setSexe(s)}>
                      <Text style={[styles.sexeBtnText, sexe === s && styles.sexeBtnTextActive]}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
                <Field label="Date de naissance" value={dateNaissance} onChange={setDateNaissance} editable={canEdit} placeholder="YYYY-MM-DD" />
                <Field label="Date de décès" value={dateDécès} onChange={setDateDécès} editable={canEdit} placeholder="YYYY-MM-DD" />
                <Field label="Informations complémentaires" value={infos} onChange={setInfos} editable={canEdit} multiline />
              </View>
            )}

            {tab === 'famille' && (
              <View style={styles.form}>
                <Text style={styles.familleSection}>Parents ({parents.length}/2)</Text>

                {parents.length === 0 && <Text style={styles.emptyHint}>Aucun parent enregistré</Text>}
                {parents.map(p => (
                  <View key={p.id} style={styles.familleCard}>
                    <Text style={styles.familleCardEmoji}>👤</Text>
                    <View style={styles.familleCardBody}>
                      <Text style={styles.familleCardName}>{membreName(p)}</Text>
                      {p.date_naissance && <Text style={styles.familleCardSub}>Né(e) le {p.date_naissance}</Text>}
                    </View>
                  </View>
                ))}

                {canEdit && parents.length < 2 && (
                  <>
                    <Text style={[styles.label, { marginTop: 12 }]}>
                      {parents.length === 0 ? 'Ajouter un parent' : 'Ajouter le 2ème parent'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={searchParent}
                      onChangeText={(t) => { setSearchParent(t); setShowDropParent(true); }}
                      onFocus={() => setShowDropParent(true)}
                      placeholder="Rechercher un membre..."
                      placeholderTextColor="#5a7a65"
                    />
                    {showDropParent && availableParents.length > 0 && (
                      <View style={styles.dropdown}>
                        <ScrollView
                          style={styles.dropdownScroll}
                          nestedScrollEnabled={true}
                          keyboardShouldPersistTaps="handled"
                        >
                          {availableParents.map(m => (
                            <Pressable key={m.id} style={styles.dropdownItem} onPress={() => handleAddParent(m)}>
                              <Text style={styles.dropdownText}>{membreName(m)}</Text>
                              {m.date_naissance && <Text style={styles.dropdownSub}>{m.date_naissance}</Text>}
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </>
                )}

                <View style={styles.separator} />

                <Text style={styles.familleSection}>Enfants ({enfants.length})</Text>

                {enfants.length === 0 && <Text style={styles.emptyHint}>Aucun enfant enregistré</Text>}
                {enfants.map(e => (
                  <View key={e.id} style={styles.familleCard}>
                    <Text style={styles.familleCardEmoji}>👶</Text>
                    <View style={styles.familleCardBody}>
                      <Text style={styles.familleCardName}>{membreName(e)}</Text>
                      {e.date_naissance && <Text style={styles.familleCardSub}>Né(e) le {e.date_naissance}</Text>}
                    </View>
                  </View>
                ))}

                {canEdit && (
                  <>
                    <Text style={[styles.label, { marginTop: 12 }]}>Ajouter un enfant</Text>
                    <TextInput
                      style={styles.input}
                      value={searchEnfant}
                      onChangeText={(t) => { setSearchEnfant(t); setShowDropEnfant(true); }}
                      onFocus={() => setShowDropEnfant(true)}
                      placeholder="Rechercher un membre..."
                      placeholderTextColor="#5a7a65"
                    />
                    {showDropEnfant && availableEnfants.length > 0 && (
                      <View style={styles.dropdown}>
                        <ScrollView
                          style={styles.dropdownScroll}
                          nestedScrollEnabled={true}
                          keyboardShouldPersistTaps="handled"
                        >
                          {availableEnfants.map(m => (
                            <Pressable key={m.id} style={styles.dropdownItem} onPress={() => handleAddEnfant(m)}>
                              <Text style={styles.dropdownText}>{membreName(m)}</Text>
                              {m.date_naissance && <Text style={styles.dropdownSub}>{m.date_naissance}</Text>}
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </>
                )}

                {familleLoading && (
                  <View style={styles.familleLoading}>
                    <ActivityIndicator color="#4cda7a" />
                    <Text style={styles.familleLoadingText}>Mise à jour...</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {canEdit && tab !== 'famille' && (
            <View style={styles.footer}>
              {isAdmin && (
                <Pressable style={styles.btnDanger} onPress={handleDelete} disabled={loading}>
                  <Text style={styles.btnDangerText}>Supprimer</Text>
                </Pressable>
              )}
              <Pressable style={[styles.btnPrimary, loading && styles.btnDisabled]} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Enregistrer</Text>}
              </Pressable>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChange, editable = true, placeholder, multiline = false }) {
  return (
    <>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, multiline && fieldStyles.inputMulti, !editable && fieldStyles.inputDisabled]}
        value={value ?? ''}
        onChangeText={onChange}
        editable={editable}
        placeholder={placeholder || label}
        placeholderTextColor="#5a7a65"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </>
  );
}

const fieldStyles = StyleSheet.create({
  label: {
    fontSize: 12, fontWeight: '600', color: 'rgba(140,200,160,0.6)',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6, marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
    borderColor: 'rgba(80,160,100,0.2)', borderRadius: 10, padding: 12,
    color: '#e0f0e8', fontSize: 15,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  inputDisabled: { opacity: 0.5 },
});

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#0e2318', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '92%', borderTopWidth: 1, borderColor: 'rgba(80,160,100,0.2)',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(80,160,100,0.1)',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#e0f0e8' },
  subtitle: { fontSize: 13, color: 'rgba(140,200,160,0.5)', marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(80,160,100,0.1)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#a0c8b0', fontSize: 14 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(80,160,100,0.1)' },
  tab: { paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4cda7a' },
  tabText: { fontSize: 13, color: 'rgba(140,200,160,0.4)', fontWeight: '500' },
  tabTextActive: { color: '#4cda7a', fontWeight: '700' },
  body: { paddingHorizontal: 20, maxHeight: 420 },
  form: { paddingVertical: 8 },
  label: {
    fontSize: 12, fontWeight: '600', color: 'rgba(140,200,160,0.6)',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6, marginTop: 12,
  },
  sexeRow: { flexDirection: 'row', gap: 8 },
  sexeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(80,160,100,0.2)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)',
  },
  sexeBtnActive: { backgroundColor: 'rgba(76,218,122,0.15)', borderColor: '#4cda7a' },
  sexeBtnText: { color: 'rgba(180,220,190,0.5)', fontWeight: '600' },
  sexeBtnTextActive: { color: '#4cda7a' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
    borderColor: 'rgba(80,160,100,0.2)', borderRadius: 10, padding: 12,
    color: '#e0f0e8', fontSize: 15,
  },
  dropdown: {
    backgroundColor: '#0a1f12', borderWidth: 1,
    borderColor: 'rgba(80,160,100,0.2)', borderRadius: 10, marginTop: 4, overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(80,160,100,0.08)' },
  dropdownText: { color: '#c0deca', fontSize: 14 },
  dropdownSub: { color: 'rgba(140,200,160,0.4)', fontSize: 11, marginTop: 2 },
  familleSection: {
    fontSize: 13, fontWeight: '700', color: 'rgba(140,200,160,0.7)',
    marginTop: 8, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1,
  },
  familleCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(80,160,100,0.15)', borderRadius: 10, padding: 12, marginBottom: 8, gap: 10,
  },
  familleCardEmoji: { fontSize: 20 },
  familleCardBody: { flex: 1 },
  familleCardName: { fontSize: 15, fontWeight: '600', color: '#dff0e4' },
  familleCardSub: { fontSize: 12, color: 'rgba(180,220,190,0.45)', marginTop: 2 },
  separator: { height: 1, backgroundColor: 'rgba(80,160,100,0.1)', marginVertical: 16 },
  emptyHint: { fontSize: 13, color: 'rgba(140,200,160,0.3)', fontStyle: 'italic', marginBottom: 8 },
  familleLoading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'center' },
  familleLoadingText: { color: 'rgba(140,200,160,0.5)', fontSize: 13 },
  footer: { flexDirection: 'row', gap: 10, padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(80,160,100,0.1)' },
  btnPrimary: {
    flex: 1, backgroundColor: '#1e5c34', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(76,218,122,0.3)',
  },
  btnPrimaryText: { color: '#e0f0e8', fontWeight: '700', fontSize: 15 },
  btnDanger: {
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(200,80,80,0.3)', alignItems: 'center',
  },
  btnDangerText: { color: '#c87070', fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },
});