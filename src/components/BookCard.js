import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function BookCard({ book }) {
  const available = book.available === true;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.bookIcon}>
          <Ionicons name="book" size={25} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>by {book.author}</Text>
        </View>

        <View style={[
          styles.badge,
          { backgroundColor: available ? colors.successLight : colors.warningLight },
        ]}>
          <Text style={{
            color: available ? colors.success : colors.warning,
            fontSize: 10,
            fontWeight: '800',
          }}>
            {available ? 'Available' : 'Issued'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.isbn}>ISBN: {book.isbn}</Text>
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 19,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  bookIcon: {
    width: 48,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
  },
  author: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 5,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 15,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  isbn: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});