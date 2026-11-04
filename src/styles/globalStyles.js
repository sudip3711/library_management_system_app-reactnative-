import { StyleSheet } from 'react-native';
import colors from '../constants/colors';

const globalStyles = StyleSheet.create({
  screen: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 35,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 13,
  },

  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.text,
  },

  primaryButton: {
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default globalStyles;