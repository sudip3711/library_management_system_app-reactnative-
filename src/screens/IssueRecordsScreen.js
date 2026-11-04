
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import AppHeader from '../components/AppHeader';
import colors from '../constants/colors';

import {
  getAllIssuedBooks,
  returnBook,
} from '../services/issueService';

import { getAllMembers } from '../services/memberService';

export default function IssueRecordsScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);

  const [filter, setFilter] = useState('All');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [returningIsbn, setReturningIsbn] = useState(null);

  // Parse API response
  const parseResponse = (response) => {
    return typeof response === 'string'
      ? JSON.parse(response)
      : response;
  };

  // Load issued books and members
  const loadIssuedBooks = useCallback(async () => {
    try {
      const [issueResponse, memberResponse] = await Promise.all([
        getAllIssuedBooks(),
        getAllMembers(),
      ]);

      const issues = parseResponse(issueResponse);
      const memberData = parseResponse(memberResponse);

      if (issues?.success === false) {
        throw new Error(issues.message || 'Unable to load issued books.');
      }

      if (memberData?.success === false) {
        throw new Error(memberData.message || 'Unable to load members.');
      }

      const issueList = Array.isArray(issues)
        ? issues
        : Array.isArray(issues?.data)
          ? issues.data
          : [];

      const memberList = Array.isArray(memberData)
        ? memberData
        : Array.isArray(memberData?.data)
          ? memberData.data
          : [];

      setRecords(issueList);
      setMembers(memberList);

    } catch (error) {
      console.log('Issue Records Error:', error);

      Alert.alert(
        'Error',
        error.message || 'Unable to load issue records.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload whenever this screen gets focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadIssuedBooks();
    }, [loadIssuedBooks])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadIssuedBooks();
  };

  // Find member using member ID
  const getMember = (memberId) => {
    return members.find(
      (member) => String(member.id) === String(memberId)
    );
  };

  // Check overdue status
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;

    const due = new Date(`${dueDate}T00:00:00`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return !Number.isNaN(due.getTime()) && due < today;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Pay member's total outstanding fine through Razorpay
  const handlePayFine = (memberId) => {
    const member = getMember(memberId);

    if (!member) {
      Alert.alert('Error', 'Member details not found.');
      return;
    }

    const fineAmount = Number(member.fineAmount || 0);

    if (fineAmount <= 0) {
      Alert.alert(
        'No Outstanding Fine',
        'This member has no outstanding fine.'
      );
      return;
    }

    navigation.navigate('FinePayment', {
      member,
    });
  };

  // Return book
  const handleReturn = (item) => {
    Alert.alert(
      'Return Book',
      `Are you sure you want to return "${item.bookTitle}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Return',
          onPress: async () => {
            try {
              setReturningIsbn(item.isbn);

              const response = parseResponse(
                await returnBook(item.isbn)
              );

              if (response?.success === false) {
                throw new Error(
                  response.message || 'Book return failed.'
                );
              }

              Alert.alert(
                'Success',
                response?.message || 'Book returned successfully.'
              );

              await loadIssuedBooks();

            } catch (error) {
              Alert.alert(
                'Return Failed',
                error.message || 'Unable to return this book.'
              );
            } finally {
              setReturningIsbn(null);
            }
          },
        },
      ]
    );
  };

  // Apply filters
  const filteredRecords = records.filter((item) => {
    if (filter === 'Overdue') {
      return isOverdue(item.dueDate);
    }

    if (filter === 'Issued') {
      return !isOverdue(item.dueDate);
    }

    return true;
  });

  // Render issue record
  const renderItem = ({ item }) => {
    const overdue = isOverdue(item.dueDate);

    const member = getMember(item.memberId);

    const isReturning = returningIsbn === item.isbn;

    const memberFine = Number(member?.fineAmount || 0);

    return (
      <View style={styles.card}>

        {/* Book Header */}
        <View style={styles.cardHeader}>
          <View style={styles.bookIcon}>
            <Ionicons
              name="book-outline"
              size={25}
              color={colors.primary}
            />
          </View>

          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>
              {item.bookTitle || 'Unknown Book'}
            </Text>

            <Text style={styles.author}>
              {item.author || 'Unknown Author'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: overdue ? '#FEE2E2' : '#DCFCE7',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: overdue ? '#DC2626' : '#15803D',
                },
              ]}
            >
              {overdue ? 'OVERDUE' : 'ISSUED'}
            </Text>
          </View>
        </View>

        {/* ISBN */}
        <View style={styles.isbnRow}>
          <Ionicons
            name="barcode-outline"
            size={16}
            color={colors.textSecondary}
          />

          <Text style={styles.isbn}>
            ISBN: {item.isbn || 'N/A'}
          </Text>
        </View>

        {/* Member Details */}
        <View style={styles.memberBox}>
          <View style={styles.memberHeader}>
            <Ionicons
              name="person-circle-outline"
              size={19}
              color={colors.primary}
            />

            <Text style={styles.sectionTitle}>
              MEMBER DETAILS
            </Text>
          </View>

          <Text style={styles.memberName}>
            {item.memberName || member?.name || 'Unknown Member'}
          </Text>

          <Text style={styles.detail}>
            Email: {item.memberEmail || member?.email || 'N/A'}
          </Text>

          <Text style={styles.detail}>
            Phone: {item.memberPhone || member?.phone || 'N/A'}
          </Text>

          <Text style={styles.detail}>
            Member ID: {item.memberId ?? 'N/A'}
          </Text>
        </View>

        {/* Issue and Due Dates */}
        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>
              ISSUE DATE
            </Text>

            <Text style={styles.dateValue}>
              {formatDate(item.issueDate)}
            </Text>
          </View>

          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>
              DUE DATE
            </Text>

            <Text
              style={[
                styles.dateValue,
                overdue && { color: '#DC2626' },
              ]}
            >
              {formatDate(item.dueDate)}
            </Text>
          </View>
        </View>

        {/* Fine Details */}
        <View style={styles.fineBox}>
          <View style={styles.fineRow}>
            <Text style={styles.fineLabel}>
              Current Book Fine
            </Text>

            <Text style={styles.bookFine}>
              ₹{Number(item.fine || 0).toFixed(2)}
            </Text>
          </View>

          <View style={styles.fineRow}>
            <Text style={styles.fineLabel}>
              Member Outstanding Fine
            </Text>

            <Text style={styles.totalFine}>
              ₹{memberFine.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomRow}>

          <TouchableOpacity
            style={[
              styles.payButton,
              memberFine <= 0 && styles.disabledButton,
            ]}
            disabled={!member || memberFine <= 0}
            onPress={() => handlePayFine(item.memberId)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="card-outline"
              size={17}
              color="#FFFFFF"
            />

            <Text style={styles.payText}>
              Pay Fine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.returnButton}
            disabled={isReturning}
            onPress={() => handleReturn(item)}
            activeOpacity={0.8}
          >
            {isReturning ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={17}
                  color="#FFFFFF"
                />

                <Text style={styles.returnText}>
                  Return Book
                </Text>
              </>
            )}
          </TouchableOpacity>

        </View>

      </View>
    );
  };

  return (
    <View style={styles.screen}>

      {/* Header */}
      <View style={styles.top}>
        <AppHeader
          title="Issue Records"
          subtitle="Manage issued and overdue books"
        />

        {/* Summary */}
        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryLabel}>
              Currently Issued
            </Text>

            <Text style={styles.summaryValue}>
              {records.length}
            </Text>
          </View>

          <View style={styles.summaryIcon}>
            <Ionicons
              name="library-outline"
              size={35}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {['All', 'Issued', 'Overdue'].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filter,
                filter === item && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.activeFilterText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.heading}>
          Book Transactions
        </Text>
      </View>

      {/* Loading */}
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            Loading issue records...
          </Text>
        </View>
      ) : (

        /* Issue Records List */
        <FlatList
          data={filteredRecords}
          keyExtractor={(item, index) =>
            String(item.id ?? index)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="library-outline"
                size={48}
                color={colors.textSecondary}
              />

              <Text style={styles.emptyTitle}>
                No issued books found
              </Text>

              <Text style={styles.emptySubtitle}>
                There are no records available for this filter.
              </Text>
            </View>
          }
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  top: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  summary: {
    backgroundColor: colors.navy,
    borderRadius: 21,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 19,
  },

  summaryLabel: {
    color: '#C4C3D6',
    fontSize: 12,
    fontWeight: '600',
  },

  summaryValue: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '800',
    marginTop: 6,
  },

  summaryIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: '#FFFFFF22',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filters: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 18,
  },

  filter: {
    paddingHorizontal: 19,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },

  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  activeFilterText: {
    color: '#FFFFFF',
  },

  heading: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 13,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bookIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  bookInfo: {
    flex: 1,
    marginRight: 8,
  },

  bookTitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '800',
  },

  author: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  isbnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },

  isbn: {
    color: colors.textSecondary,
    fontSize: 11,
  },

  memberBox: {
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    padding: 13,
    marginTop: 15,
  },

  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },

  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },

  memberName: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 5,
  },

  detail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  dateBox: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
  },

  dateValue: {
    fontSize: 12,
    color: colors.navy,
    fontWeight: '700',
    marginTop: 5,
  },

  fineBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 12,
    marginTop: 17,
    gap: 9,
  },

  fineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fineLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },

  bookFine: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },

  totalFine: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: '800',
  },

  bottomRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 17,
  },

  payButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingHorizontal: 9,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  disabledButton: {
    backgroundColor: '#A1A1AA',
  },

  payText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  returnButton: {
    flex: 1,
    backgroundColor: '#15803D',
    paddingHorizontal: 9,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  returnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 13,
  },

  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 19,
  },

});
