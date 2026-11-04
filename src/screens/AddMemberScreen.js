import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, StyleSheet, ActivityIndicator,
} from 'react-native';

import AppHeader from '../components/AppHeader';
import colors from '../constants/colors';
import globalStyles from '../styles/globalStyles';
import { addMember } from '../services/memberService';

export default function AddMemberScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Required fields', 'Please fill in all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      Alert.alert('Invalid phone', 'Enter a valid 10-digit phone number.');
      return;
    }

    try {
      setLoading(true);

      await addMember({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      Alert.alert('Success', 'Member added successfully.', [
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
        title="Add Member"
        subtitle="Create a new library member profile"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>New Member Registration</Text>
        <Text style={styles.bannerText}>
          Enter the member's information below.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Personal Information</Text>

        <Text style={styles.label}>FULL NAME</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter member name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>PHONE NUMBER</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter 10-digit phone number"
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
        />

        <TouchableOpacity
          style={globalStyles.primaryButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={globalStyles.primaryButtonText}>Create Member</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 22, paddingBottom: 40 },
  banner: {
    backgroundColor: colors.navy, borderRadius: 20,
    padding: 21, marginBottom: 20,
  },
  bannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  bannerText: { color: '#C4C3D6', fontSize: 12, marginTop: 8 },
  form: {
    backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 19, borderWidth: 1, borderColor: colors.border,
  },
  formTitle: { color: colors.navy, fontSize: 17, fontWeight: '800', marginBottom: 20 },
  label: {
    color: colors.textSecondary, fontSize: 10,
    fontWeight: '800', letterSpacing: 1, marginBottom: 9, marginTop: 17,
  },
});