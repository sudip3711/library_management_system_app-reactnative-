import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, StyleSheet,
} from 'react-native';

import AppHeader from '../components/AppHeader';
import colors from '../constants/colors';
import globalStyles from '../styles/globalStyles';
import { issueBook } from '../services/issueService';

export default function IssueBookScreen({ navigation }) {
  const [memberId, setMemberId] = useState('');
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!memberId.trim() || !isbn.trim()) {
      Alert.alert('Required fields', 'Enter member ID and book ISBN.');
      return;
    }

    if (!/^[0-9]+$/.test(memberId.trim())) {
      Alert.alert('Invalid member ID', 'Member ID must be a number.');
      return;
    }

    try {
      setLoading(true);

      await issueBook({
        member: {
          id: Number(memberId),
        },
        books: [
          {
            isbn: isbn.trim(),
          },
        ],
      });

      Alert.alert('Success', 'Book issued successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Issue failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppHeader
        title="Issue Book"
        subtitle="Assign a book to a library member"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>New Book Issue</Text>
        <Text style={styles.bannerText}>
          Enter the member and book details to create an issue record.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Issue Information</Text>

        <Text style={styles.label}>MEMBER ID</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter member ID"
          keyboardType="number-pad"
          value={memberId}
          onChangeText={setMemberId}
        />

        <Text style={styles.label}>BOOK ISBN</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter book ISBN"
          value={isbn}
          onChangeText={setIsbn}
        />

        <View style={styles.info}>
          <Text style={styles.infoTitle}>Issue policy</Text>
          <Text style={styles.infoText}>
            • Maximum 5 books per member.
          </Text>
          <Text style={styles.infoText}>
            • Issue duration: 10 days.
          </Text>
          <Text style={styles.infoText}>
            • Late fine: ₹10 per day.
          </Text>
        </View>

        <TouchableOpacity
          style={globalStyles.primaryButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={globalStyles.primaryButtonText}>Confirm Issue</Text>
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
  bannerText: { color: '#C4C3D6', fontSize: 12, marginTop: 8, lineHeight: 19 },
  form: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 19, borderWidth: 1, borderColor: colors.border },
  formTitle: { color: colors.navy, fontSize: 17, fontWeight: '800', marginBottom: 20 },
  label: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 9, marginTop: 17 },
  info: { backgroundColor: colors.primaryLight, borderRadius: 14, padding: 15, marginTop: 22, marginBottom: 20 },
  infoTitle: { fontSize: 13, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  infoText: { fontSize: 12, color: colors.textSecondary, marginTop: 5 },
});