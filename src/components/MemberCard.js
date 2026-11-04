
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function MemberCard({
  member,
  onPress,
  navigation,
}) {
  const initials = member.name
    ?.split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const fineAmount = Number(member.fineAmount || 0);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>
            {initials || 'M'}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.id}>
            Member #{member.id}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={19}
          color="#AAAAAA"
        />
      </View>

      <View style={styles.detail}>
        <Ionicons
          name="mail-outline"
          size={16}
          color={colors.textSecondary}
        />
        <Text style={styles.detailText}>
          {member.email}
        </Text>
      </View>

      <View style={styles.detail}>
        <Ionicons
          name="call-outline"
          size={16}
          color={colors.textSecondary}
        />
        <Text style={styles.detailText}>
          {member.phone}
        </Text>
      </View>

      <View style={styles.fine}>
        <Text style={styles.fineLabel}>
          Outstanding Fine
        </Text>

        <Text style={styles.fineValue}>
          ₹{fineAmount.toFixed(2)}
        </Text>
      </View>

      {fineAmount > 0 && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => {
            navigation.navigate('FinePayment', {
              member,
            });
          }}
        >
          <Ionicons
            name="card-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.payButtonText}>
            Pay Fine ₹{fineAmount.toFixed(2)}
          </Text>
        </TouchableOpacity>
      )}
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
    gap: 12,
    marginBottom: 16,
  },

  avatar: {
    height: 48,
    width: 48,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  initials: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  name: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },

  id: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },

  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  fine: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  fineLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  fineValue: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 13,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  payButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
