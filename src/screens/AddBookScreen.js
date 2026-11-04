import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, StyleSheet,
} from 'react-native';

import AppHeader from '../components/AppHeader';
import colors from '../constants/colors';
import globalStyles from '../styles/globalStyles';
import { addBook } from '../services/bookService';

export default function AddBookScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !author.trim() || !isbn.trim()) {
      Alert.alert('Required fields', 'Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);

      await addBook({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
      });

      Alert.alert('Success', 'Book added successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppHeader
        title="Add New Book"
        subtitle="Expand your library collection"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>New Book Details</Text>
        <Text style={styles.bannerText}>
          Add a new book to your library database.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Book Information</Text>

        <Text style={styles.label}>BOOK TITLE</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter book title"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>AUTHOR NAME</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter author name"
          value={author}
          onChangeText={setAuthor}
        />

        <Text style={styles.label}>ISBN NUMBER</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter ISBN"
          value={isbn}
          onChangeText={setIsbn}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={globalStyles.primaryButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={globalStyles.primaryButtonText}>Save Book</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 22, paddingBottom: 40 },
  banner: { backgroundColor: colors.navy, borderRadius: 20, padding: 21, marginBottom: 20 },
  bannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  bannerText: { color: '#C4C3D6', fontSize: 12, marginTop: 8 },
  form: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 19, borderWidth: 1, borderColor: colors.border },
  formTitle: { color: colors.navy, fontSize: 17, fontWeight: '800', marginBottom: 20 },
  label: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 9, marginTop: 17 },
});
