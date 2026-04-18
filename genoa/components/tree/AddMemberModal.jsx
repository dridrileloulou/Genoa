import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { getMembres, getUnions, postMembre, postUnion } from '@/components/api/api';

export default function AddMemberModal({ visible, onClose, onSuccess, currentUserId }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [membres, setMembres] = useState([]);
  const [unions, setUnions] = useState([]);

  const [prénom, setPrénom] = useState('');
  const [nom, setNom] = useState('');
  const [sexe, setSexe] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');

  const [parent1Id, setParent1Id] = useState('');
  const [parent2Id, setParent2Id] = useState('');
  const [searchParent1, setSearchParent1] = useState('');
  const [searchParent2, setSearchParent2] = useState('');
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);

  useEffect(() => {
    if (visible) { loadData(); resetForm(); }
  }, [visible]);

  const loadData = async () => {
    try {
      const [m, u] = await Promise.all([getMembres(), getUnions()]);
      const allMembres = Array.isArray(m) ? m : [];
      const allUnions = Array.isArray(u) ? u : [];
      
      // Filtrer les membres par currentUserId pour n'afficher que ceux de l'arbre actuel
      const filteredMembres = currentUserId 
        ? allMembres.filter((membre) => membre.id_user === currentUserId)
        : allMembres;
      
      // Créer un Set des IDs de membres de cet arbre
      const membreIdsSet = new Set(filteredMembres.map(m => m.id));
      
      // Filtrer les unions : une union appartient à l'arbre si au moins un de ses membres y appartient
      const filteredUnions = allUnions.filter((union) => 
        membreIdsSet.has(union.id_membre_1) || membreIdsSet.has(union.id_membre_2)
      );
      
      setMembres(filteredMembres);
      setUnions(filteredUnions);
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setStep(1); setPrénom(''); setNom(''); setSexe(''); setDateNaissance('');
    setParent1Id(''); setParent2Id(''); setSearchParent1(''); setSearchParent2('');
  };

  const findExistingUnion = (p1, p2) => unions.find(
    (u) => (u.id_membre_1 === p1 && u.id_membre_2 === p2) || (u.id_membre_1 === p2 && u.id_membre_2 === p1)
  );

  const handleSubmit = async () => {
    if (!prénom.trim()) { 
      Alert.alert('Erreur', 'Le prénom est obligatoire.'); 
      return; 
    }

    if (!currentUserId) {
      Alert.alert('Erreur', 'Impossible de déterminer le propriétaire de l\'arbre.');
      return;
    }
    
    setLoading(true);
    
    try {
      let id_union = null;
      
      if (parent1Id || parent2Id) {
        const p1 = parent1Id ? parseInt(parent1Id) : null;
        const p2 = parent2Id ? parseInt(parent2Id) : null;
        const existing = p1 && p2 ? findExistingUnion(p1, p2) : null;
        
        if (existing) {
          id_union = existing.id;
          console.log('✅ Union existante trouvée:', id_union);
        } else {
          console.log('🔗 Création nouvelle union:', { p1, p2 });
          const newUnionResult = await postUnion({ 
            id_membre_1: p1, 
            id_membre_2: p2
          });
          
          // Si l'API retourne l'union créée avec son ID
          if (newUnionResult && newUnionResult.id) {
            id_union = newUnionResult.id;
          } else {
            // Sinon, on récupère la dernière union créée
            const updatedUnions = await getUnions();
            const newUnion = updatedUnions.filter(
              (u) =>
                (u.id_membre_1 === p1 && u.id_membre_2 === p2) ||
                (u.id_membre_1 === p2 && u.id_membre_2 === p1) ||
                (p1 && !p2 && u.id_membre_1 === p1 && u.id_membre_2 === null) ||
                (!p1 && p2 && u.id_membre_2 === p2 && u.id_membre_1 === null)
            ).sort((a, b) => b.id - a.id)[0];
            id_union = newUnion?.id ?? null;
          }
          console.log('✅ Nouvelle union créée:', id_union);
        }
      }

      console.log('👤 Création membre avec:', {
        prénom: prénom.trim(),
        nom: nom.trim() || null,
        id_union,
        id_user: currentUserId
      });

      const newMembre = await postMembre({
        prénom: prénom.trim(),
        nom: nom.trim() || null,
        sexe: sexe || null,
        date_naissance: dateNaissance || null,
        date_décès: null,
        id_user: currentUserId,
        informations_complémentaires: null,
        photo: null,
        privé: false,
        id_union: id_union,
        biologique: true,
      });

      console.log('✅ Membre créé avec succès:', newMembre);
      
      onSuccess();
      onClose();
      
    } catch (e) {
      console.error('❌ Erreur création membre:', e);
      Alert.alert('Erreur', "Impossible d'ajouter le membre. Vérifiez les données.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembres1 = membres.filter((m) =>
    `${m['prénom']} ${m.nom}`.toLowerCase().includes(searchParent1.toLowerCase())
  );
  const filteredMembres2 = membres.filter((m) =>
    `${m['prénom']} ${m.nom}`.toLowerCase().includes(searchParent2.toLowerCase())
  );

  const getMembreName = (id) => {
    const m = membres.find((m) => m.id === parseInt(id));
    return m ? `${m['prénom']} ${m.nom || ''}`.trim() : '';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Ajouter un membre</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.steps}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          </View>
          <View style={styles.stepsLabels}>
            <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Identité</Text>
            <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Parents</Text>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {step === 1 && (
              <View style={styles.form}>
                <Text style={styles.label}>Prénom *</Text>
                <TextInput style={styles.input} value={prénom} onChangeText={setPrénom} placeholder="Prénom" placeholderTextColor="#5a7a65" />

                <Text style={styles.label}>Nom</Text>
                <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Nom de famille" placeholderTextColor="#5a7a65" />

                <Text style={styles.label}>Sexe</Text>
                <View style={styles.sexeRow}>
                  {['M', 'F', 'Autre'].map((s) => (
                    <Pressable key={s} style={[styles.sexeBtn, sexe === s && styles.sexeBtnActive]} onPress={() => setSexe(s)}>
                      <Text style={[styles.sexeBtnText, sexe === s && styles.sexeBtnTextActive]}>{s}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>Date de naissance</Text>
                <TextInput style={styles.input} value={dateNaissance} onChangeText={setDateNaissance} placeholder="YYYY-MM-DD" placeholderTextColor="#5a7a65" />
              </View>
            )}

            {step === 2 && (
              <View style={styles.form}>
                <Text style={styles.sectionNote}>
                  Optionnel — indiquez un ou deux parents. Si l'union n'existe pas, elle sera créée.
                </Text>

                {/* Parent 1 */}
                <Text style={styles.label}>Parent 1</Text>
                {parent1Id ? (
                  <View style={styles.selectedMembre}>
                    <Text style={styles.selectedMembreText}>{getMembreName(parent1Id)}</Text>
                    <Pressable onPress={() => { setParent1Id(''); setSearchParent1(''); }}>
                      <Text style={styles.removeText}>✕</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <TextInput
                      style={styles.input}
                      value={searchParent1}
                      onChangeText={(t) => { setSearchParent1(t); setShowDropdown1(true); }}
                      onFocus={() => setShowDropdown1(true)}
                      placeholder="Rechercher un membre..."
                      placeholderTextColor="#5a7a65"
                    />
                    {showDropdown1 && filteredMembres1.length > 0 && (
                      <View style={styles.dropdown}>
                        <ScrollView
                          style={styles.dropdownScroll}
                          nestedScrollEnabled={true}
                          keyboardShouldPersistTaps="handled"
                        >
                          {filteredMembres1.map((m) => (
                            <Pressable key={m.id} style={styles.dropdownItem} onPress={() => { setParent1Id(String(m.id)); setShowDropdown1(false); }}>
                              <Text style={styles.dropdownText}>{m['prénom']} {m.nom || ''}</Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </>
                )}

                {/* Parent 2 */}
                <Text style={[styles.label, { marginTop: 16 }]}>Parent 2</Text>
                {parent2Id ? (
                  <View style={styles.selectedMembre}>
                    <Text style={styles.selectedMembreText}>{getMembreName(parent2Id)}</Text>
                    <Pressable onPress={() => { setParent2Id(''); setSearchParent2(''); }}>
                      <Text style={styles.removeText}>✕</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <TextInput
                      style={styles.input}
                      value={searchParent2}
                      onChangeText={(t) => { setSearchParent2(t); setShowDropdown2(true); }}
                      onFocus={() => setShowDropdown2(true)}
                      placeholder="Rechercher un membre..."
                      placeholderTextColor="#5a7a65"
                    />
                    {showDropdown2 && filteredMembres2.length > 0 && (
                      <View style={styles.dropdown}>
                        <ScrollView
                          style={styles.dropdownScroll}
                          nestedScrollEnabled={true}
                          keyboardShouldPersistTaps="handled"
                        >
                          {filteredMembres2.map((m) => (
                            <Pressable key={m.id} style={styles.dropdownItem} onPress={() => { setParent2Id(String(m.id)); setShowDropdown2(false); }}>
                              <Text style={styles.dropdownText}>{m['prénom']} {m.nom || ''}</Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {step === 2 && (
              <Pressable style={styles.btnSecondary} onPress={() => setStep(1)}>
                <Text style={styles.btnSecondaryText}>← Retour</Text>
              </Pressable>
            )}
            {step === 1 && (
              <Pressable style={styles.btnPrimary} onPress={() => { if (!prénom.trim()) { Alert.alert('Erreur', 'Le prénom est obligatoire.'); return; } setStep(2); }}>
                <Text style={styles.btnPrimaryText}>Suivant →</Text>
              </Pressable>
            )}
            {step === 2 && (
              <Pressable style={[styles.btnPrimary, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Ajouter</Text>}
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#0e2318',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderColor: 'rgba(80,160,100,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(80,160,100,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e0f0e8',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(80,160,100,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#a0c8b0',
    fontSize: 14,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 0,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(80,160,100,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(80,160,100,0.3)',
  },
  stepDotActive: {
    backgroundColor: '#4cda7a',
    borderColor: '#4cda7a',
  },
  stepLine: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(80,160,100,0.2)',
    marginHorizontal: 8,
  },
  stepsLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 60,
    paddingBottom: 12,
    paddingTop: 6,
  },
  stepLabel: {
    fontSize: 11,
    color: 'rgba(140,200,160,0.4)',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#4cda7a',
  },
  body: {
    paddingHorizontal: 20,
  },
  form: {
    paddingVertical: 12,
    gap: 4,
  },
  sectionNote: {
    fontSize: 13,
    color: 'rgba(180,220,190,0.5)',
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(140,200,160,0.6)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(80,160,100,0.2)',
    borderRadius: 10,
    padding: 12,
    color: '#e0f0e8',
    fontSize: 15,
  },
  sexeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sexeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(80,160,100,0.2)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  sexeBtnActive: {
    backgroundColor: 'rgba(76,218,122,0.15)',
    borderColor: '#4cda7a',
  },
  sexeBtnText: {
    color: 'rgba(180,220,190,0.5)',
    fontWeight: '600',
  },
  sexeBtnTextActive: {
    color: '#4cda7a',
  },
  dropdown: {
    backgroundColor: '#0e2318',
    borderWidth: 1,
    borderColor: 'rgba(80,160,100,0.2)',
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 150,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(80,160,100,0.1)',
  },
  dropdownText: {
    color: '#c0deca',
    fontSize: 14,
  },
  selectedMembre: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(76,218,122,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76,218,122,0.3)',
    borderRadius: 10,
    padding: 12,
  },
  selectedMembreText: {
    color: '#4cda7a',
    fontWeight: '600',
    fontSize: 15,
  },
  removeText: {
    color: 'rgba(76,218,122,0.6)',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(80,160,100,0.1)',
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#1e5c34',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76,218,122,0.3)',
  },
  btnPrimaryText: {
    color: '#e0f0e8',
    fontWeight: '700',
    fontSize: 15,
  },
  btnSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(80,160,100,0.2)',
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: 'rgba(180,220,190,0.7)',
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});