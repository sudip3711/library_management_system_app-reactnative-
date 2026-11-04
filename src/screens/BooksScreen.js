import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import AppHeader from '../components/AppHeader';
import BookCard from '../components/BookCard';
import colors from '../constants/colors';
import { getAllBooks } from '../services/bookService';

export default function BooksScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBooks = async () => {
    try {
      setError('');
      const response = await getAllBooks();
      setBooks(Array.isArray(response) ? response : response?.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  const filtered = books.filter((book) => {
    const matchesSearch =
      `${book.title} ${book.author} ${book.isbn}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === 'All' ||
      (filter === 'Available' && book.available) ||
      (filter === 'Issued' && !book.available);

    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <AppHeader title="Books" subtitle="Manage your book collection" />

        <View style={styles.search}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Search books or authors..."
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
        </View>

        <View style={styles.filters}>
          {['All', 'Available', 'Issued'].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={[styles.filter, filter === item && styles.activeFilter]}
            >
              <Text style={[
                styles.filterText,
                filter === item && styles.activeFilterText,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.heading}>Book Collection ({filtered.length})</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 35 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <BookCard book={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No books found.</Text>}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddBook')}
      >
        <Ionicons name="add" size={22} color="#FFFFFF" />
        <Text style={styles.addText}>Add New Book</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: 20, paddingTop: 22 },
  search: {
    height: 53, backgroundColor: '#FFFFFF', borderRadius: 15,
    paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center',
    gap: 10, borderWidth: 1, borderColor: colors.border,
  },
  input: { flex: 1, fontSize: 13, color: colors.text },
  filters: { flexDirection: 'row', gap: 9, marginVertical: 19 },
  filter: {
    paddingHorizontal: 17, paddingVertical: 10, borderRadius: 11,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border,
  },
  activeFilter: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 11, color: colors.textSecondary, fontWeight: '700' },
  activeFilterText: { color: '#FFFFFF' },
  heading: { fontSize: 17, color: colors.navy, fontWeight: '800', marginBottom: 13 },
  list: { paddingHorizontal: 20, paddingBottom: 95 },
  addButton: {
    position: 'absolute', bottom: 17, left: 20, right: 20,
    height: 54, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
  },
  addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  error: { color: colors.danger, textAlign: 'center', marginTop: 35 },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 35 },
});