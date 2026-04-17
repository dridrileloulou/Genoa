import { StyleSheet, View, TextInput, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================================================
// PAGE RECHERCHE & NAVIGATION FAMILIALE
// - Barre de recherche par nom/prénom
// - Résultats cliquables → affiche la fiche d'un membre
// - Navigation : parents, enfants, fratrie, conjoints
// =====================================================

export default function RechercheScreen() {
  const [query, setQuery] = useState('');           // texte tapé dans la barre de recherche
  const [results, setResults] = useState([]);        // résultats de la recherche
  const [loading, setLoading] = useState(false);     // spinner pendant le fetch
  const [selectedMembre, setSelectedMembre] = useState(null); // membre sélectionné pour voir sa famille
  const [famille, setFamille] = useState(null);      // { parents, enfants, fratrie, conjoints }
  const [loadingFamille, setLoadingFamille] = useState(false);

  // ---- Recherche par nom/prénom ----
  // Appelé à chaque frappe dans la barre de recherche
  const handleSearch = async (text) => {
    setQuery(text);

    // On ne lance la recherche qu'à partir de 2 caractères
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://localhost:3000/recherche?q=${encodeURIComponent(text)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Erreur recherche:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Chargement de la famille d'un membre ----
  // Quand on clique sur un résultat, on fetch parents + enfants + fratrie + conjoints en parallèle
  const handleSelectMembre = async (membre) => {
    setSelectedMembre(membre);
    setLoadingFamille(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      // On lance les 4 requêtes en parallèle pour gagner du temps
      const [parentsRes, enfantsRes, fratrieRes, conjointsRes] = await Promise.all([
        fetch(`http://localhost:3000/recherche/${membre.id}/parents`, { headers }),
        fetch(`http://localhost:3000/recherche/${membre.id}/enfants`, { headers }),
        fetch(`http://localhost:3000/recherche/${membre.id}/fratrie`, { headers }),
        fetch(`http://localhost:3000/recherche/${membre.id}/conjoints`, { headers }),
      ]);

      const [parents, enfants, fratrie, conjoints] = await Promise.all([
        parentsRes.json(),
        enfantsRes.json(),
        fratrieRes.json(),
        conjointsRes.json(),
      ]);

      setFamille({ parents, enfants, fratrie, conjoints });
    } catch (err) {
      console.error('Erreur chargement famille:', err);
    } finally {
      setLoadingFamille(false);
    }
  };

  // ---- Retour à la liste de résultats ----
  const handleBack = () => {
    setSelectedMembre(null);
    setFamille(null);
  };

  // ---- Formater une date pour l'affichage ----
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  // ---- Composant : carte d'un membre (réutilisé partout) ----
  // onPress optionnel : si fourni, la carte est cliquable (navigation vers ce membre)
  const MembreCard = ({ membre, onPress }) => (
    <Pressable
      style={styles.membreCard}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Indicateur de sexe : bleu pour H, rose pour F */}
      <View style={[styles.sexeIndicator, { backgroundColor: membre.sexe === 'M' ? '#2563eb' : '#db2777' }]} />
      <View style={styles.membreInfo}>
        <ThemedText style={styles.membreName}>
          {membre.prénom} {membre.nom}
        </ThemedText>
        <ThemedText style={styles.membreDates}>
          {formatDate(membre.date_naissance) || '?'}
          {membre.date_décès ? ` — ${formatDate(membre.date_décès)}` : ''}
        </ThemedText>
      </View>
    </Pressable>
  );

  // ---- Composant : section famille (parents, enfants, etc.) ----
  const FamilleSection = ({ title, membres }) => {
    if (!membres || membres.length === 0) return null;
    return (
      <View style={styles.familleSection}>
        <ThemedText style={styles.familleSectionTitle}>{title}</ThemedText>
        {membres.map((m) => (
          // Chaque membre de la famille est cliquable → on navigue vers sa fiche
          <MembreCard key={m.id} membre={m} onPress={() => handleSelectMembre(m)} />
        ))}
      </View>
    );
  };

  // =====================================================
  // VUE FICHE MEMBRE (quand on a cliqué sur un résultat)
  // =====================================================
  if (selectedMembre) {
    return (
      <ThemedView style={styles.container}>
        {/* Bouton retour vers les résultats */}
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>← Retour</ThemedText>
        </Pressable>

        {/* En-tête : nom du membre sélectionné */}
        <View style={styles.ficheHeader}>
          <View style={[styles.ficheAvatar, { backgroundColor: selectedMembre.sexe === 'M' ? '#2563eb' : '#db2777' }]}>
            <ThemedText style={styles.ficheAvatarText}>
              {selectedMembre.prénom?.[0]}{selectedMembre.nom?.[0]}
            </ThemedText>
          </View>
          <ThemedText type="title" style={styles.ficheName}>
            {selectedMembre.prénom} {selectedMembre.nom}
          </ThemedText>
          <ThemedText style={styles.ficheDates}>
            {formatDate(selectedMembre.date_naissance) || '?'}
            {selectedMembre.date_décès ? ` — ${formatDate(selectedMembre.date_décès)}` : ''}
          </ThemedText>
        </View>

        {/* Liens familiaux */}
        {loadingFamille ? (
          <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 30 }} />
        ) : famille ? (
          <FlatList
            data={[1]} // astuce pour wrapper le contenu scrollable dans un FlatList
            renderItem={() => (
              <View>
                <FamilleSection title="Parents" membres={famille.parents} />
                <FamilleSection title="Conjoint(s)" membres={famille.conjoints} />
                <FamilleSection title="Enfants" membres={famille.enfants} />
                <FamilleSection title="Fratrie" membres={famille.fratrie} />

                {/* Message si aucun lien familial trouvé */}
                {famille.parents.length === 0 && famille.conjoints.length === 0 &&
                 famille.enfants.length === 0 && famille.fratrie.length === 0 && (
                  <ThemedText style={styles.emptyText}>
                    Aucun lien familial enregistré pour ce membre.
                  </ThemedText>
                )}
              </View>
            )}
            keyExtractor={() => 'famille'}
          />
        ) : null}
      </ThemedView>
    );
  }

  // =====================================================
  // VUE RECHERCHE (barre de recherche + résultats)
  // =====================================================
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Recherche</ThemedText>

      {/* Barre de recherche */}
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher par nom ou prénom..."
        placeholderTextColor="#64748B"
        value={query}
        onChangeText={handleSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Spinner pendant la recherche */}
      {loading && <ActivityIndicator size="small" color="#ffffff" style={{ marginTop: 10 }} />}

      {/* Liste des résultats */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MembreCard membre={item} onPress={() => handleSelectMembre(item)} />
        )}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <ThemedText style={styles.emptyText}>Aucun résultat pour "{query}"</ThemedText>
          ) : null
        }
        style={styles.resultsList}
      />
    </ThemedView>
  );
}

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0F172A',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },

  // -- Barre de recherche --
  searchInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
  },

  // -- Liste des résultats --
  resultsList: {
    marginTop: 12,
  },

  // -- Carte membre (utilisée dans résultats et dans la fiche famille) --
  membreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  sexeIndicator: {
    width: 6,
    height: '100%',
    borderRadius: 3,
    marginRight: 12,
    minHeight: 36,
  },
  membreInfo: {
    flex: 1,
  },
  membreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  membreDates: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },

  // -- Bouton retour --
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: '600',
  },

  // -- Fiche membre (en-tête) --
  ficheHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ficheAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ficheAvatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  ficheName: {
    textAlign: 'center',
  },
  ficheDates: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },

  // -- Sections famille (parents, enfants, etc.) --
  familleSection: {
    marginBottom: 20,
  },
  familleSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },

  // -- Message vide --
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
