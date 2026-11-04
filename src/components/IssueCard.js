import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function IssueCard({ record }) {
  const overdue = record.status === 'Overdue';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name="book-outline" size={22} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.book}>{record.bookTitle}</Text>
          <Text style={styles.member}>Issued to {record.memberName}</Text>
        </View>

        <View style={[
          styles.badge,
          { backgroundColor: overdue ? colors.dangerLight : colors.successLight },
        ]}>
          <Text style={{
            color: overdue ? colors.danger : colors.success,
            fontSize: 10,
            fontWeight: '800',
          }}>
            {record.status}
          </Text>
        </View>
      </View>

      <View style={styles.dates}>
        <View>
          <Text style={styles.label}>ISSUE DATE</Text>
          <Text style={styles.date}>{record.issueDate}</Text>
        </View>
        <View>
          <Text style={styles.label}>DUE DATE</Text>
          <Text style={[styles.date, overdue && { color: colors.danger }]}>
            {record.dueDate}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  book: {
    fontSize: 14,
    color: colors.navy,
    fontWeight: '800',
  },
  member: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 5,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  dates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 16,
    paddingTop: 14,
  },
  label: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  date: {
    fontSize: 12,
    color: colors.navy,
    fontWeight: '700',
    marginTop: 6,
  },
});