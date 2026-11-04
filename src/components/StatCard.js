import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function StatCard({ title, value, icon, color, background }) {
  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: background }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 140,
    backgroundColor: colors.surface,
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.navy,
  },
  title: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 5,
  },
});