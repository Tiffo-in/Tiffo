import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParams } from '../../navigation/RootNavigator';
import api from '../../services/api';

interface Tiffin {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isVeg?: boolean;
}

const ExploreScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tiffin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (text: string) => {
    if (!text.trim()) { setResults([]); setSearched(false); return; }
    try {
      setLoading(true);
      const res = await api.get(`/tiffins?search=${encodeURIComponent(text.trim())}&status=active`);
      setResults(res.data?.data || []);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const categories = ['All', 'Gujarati', 'Punjabi', 'South Indian', 'Bengali', 'Maharashtrian'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Meals</Text>
        <View style={styles.searchBarRow}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tiffins, cuisines..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={(t) => { setQuery(t); search(t); }}
            returnKeyType="search"
            onSubmitEditing={() => search(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category pills */}
        <View style={styles.pillRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={styles.pill}
              onPress={() => { setQuery(cat === 'All' ? '' : cat); search(cat === 'All' ? '' : cat); }}
            >
              <Text style={styles.pillText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#F97316" size="large" style={{ marginTop: 40 }} />
      ) : searched && results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>No meals found for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => navigation.navigate('TiffinDetail', { tiffinId: item._id })}
            >
              <View style={styles.resultIconArea}>
                <Text style={{ fontSize: 28 }}>🍛</Text>
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultDesc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.resultPrice}>₹{item.price}/day</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#D4D0CC" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !searched ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🍱</Text>
                <Text style={styles.emptyText}>Search for homemade meals near you</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAF9' },
  header: { backgroundColor: '#FAFAF9', paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#1C1917', marginBottom: 14, marginTop: 10 },
  searchBarRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1.5, borderColor: '#E7E5E4',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1C1917' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  pill: {
    backgroundColor: '#FFF7ED', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#FED7AA', marginRight: 8, marginBottom: 8,
  },
  pillText: { fontSize: 12, fontWeight: '600', color: '#EA580C' },
  resultCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 16, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  resultIconArea: {
    width: 56, height: 56, borderRadius: 14, backgroundColor: '#FFF7ED',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  resultContent: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '700', color: '#1C1917', marginBottom: 2 },
  resultDesc: { fontSize: 12, color: '#78716C', marginBottom: 4 },
  resultPrice: { fontSize: 13, fontWeight: '700', color: '#F97316' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#78716C' },
});

export default ExploreScreen;
