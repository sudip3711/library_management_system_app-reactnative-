
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import AppHeader from '../components/AppHeader';
import StatCard from '../components/StatCard';
import colors from '../constants/colors';

import { getAllMembers } from '../services/memberService';
import { getAllBooks } from '../services/bookService';
import { getAllIssuedBooks } from '../services/issueService';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalBooks: 0,
    issuedBooks: 0,
    overdueBooks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Parse API response, including JSON strings
  const parseResponse = (response) => {
    return typeof response === 'string'
      ? JSON.parse(response)
      : response;
  };

  // Extract array from API response
  const extractArray = (response) => {
    const parsed = parseResponse(response);

    if (parsed?.success === false) {
      throw new Error(parsed.message || 'Unable to fetch data.');
    }

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (Array.isArray(parsed?.data)) {
      return parsed.data;
    }

    return [];
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError('');

      const [
        memberResponse,
        bookResponse,
        issuedResponse,
      ] = await Promise.all([
        getAllMembers(),
        getAllBooks(),
        getAllIssuedBooks(),
      ]);

      const members = extractArray(memberResponse);
      const books = extractArray(bookResponse);
      const issued = extractArray(issuedResponse);

      // Calculate overdue books
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = issued.filter((item) => {
        if (!item.dueDate) return false;

        const dueDate = new Date(`${item.dueDate}T00:00:00`);

        return (
          !Number.isNaN(dueDate.getTime()) &&
          dueDate < today
        );
      });

      // Update dashboard statistics
      setStats({
        totalMembers: members.length,
        totalBooks: books.length,
        issuedBooks: issued.length,
        overdueBooks: overdue.length,
      });

    } catch (err) {
      console.error('Dashboard API Error:', err);

      setError(
        err.message || 'Unable to load dashboard data. Please try again.'
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Automatically refresh whenever Dashboard becomes active
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData(true);
    }, [fetchDashboardData])
  );

  // Manual pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(false);
  };

  // Dashboard cards
  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers.toString(),
      icon: 'people-outline',
      color: colors.primary,
      background: colors.primaryLight,
    },
    {
      title: 'Total Books',
      value: stats.totalBooks.toString(),
      icon: 'book-outline',
      color: colors.blue,
      background: colors.blueLight,
    },
    {
      title: 'Issued Books',
      value: stats.issuedBooks.toString(),
      icon: 'bookmark-outline',
      color: colors.success,
      background: colors.successLight,
    },
    {
      title: 'Overdue Books',
      value: stats.overdueBooks.toString(),
      icon: 'time-outline',
      color: colors.danger,
      background: colors.dangerLight,
    },
  ];

  // Quick actions
  const actions = [
    {
      title: 'Add Member',
      icon: 'person-add-outline',
      screen: 'AddMember',
    },
    {
      title: 'Add Book',
      icon: 'book-outline',
      screen: 'AddBook',
    },
    {
      title: 'Issue Book',
      icon: 'swap-horizontal-outline',
      screen: 'IssueBook',
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {/* Header */}
      <AppHeader
        title="Dashboard"
        subtitle="Welcome back, Admin 👋"
      />

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>
          LIBRARY MANAGEMENT
        </Text>

        <Text style={styles.heroTitle}>
          Manage your library smarter.
        </Text>

        <Text style={styles.heroSubtitle}>
          Everything you need, in one place.
        </Text>

        <View style={styles.heroIcon}>
          <Ionicons
            name="library"
            size={34}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.circle} />
      </View>

      {/* Overview */}
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>
          Overview
        </Text>

        <Text style={styles.month}>
          Live Data
        </Text>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loaderText}>
            Updating dashboard...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            onPress={() => fetchDashboardData(true)}
          >
            <Text style={styles.retryText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard {...statCards[0]} />
            <StatCard {...statCards[1]} />
          </View>

          <View style={styles.statsRow}>
            <StatCard {...statCards[2]} />
            <StatCard {...statCards[3]} />
          </View>
        </>
      )}

      {/* Quick Actions */}
      <Text style={[
        styles.sectionTitle,
        styles.quickActionsTitle,
      ]}>
        Quick Actions
      </Text>

      <View style={styles.actions}>
        {actions.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.actionCard}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={colors.primary}
            />

            <Text style={styles.actionTitle}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingTop: 22,
    paddingBottom: 35,
  },

  hero: {
    backgroundColor: colors.navy,
    borderRadius: 23,
    padding: 22,
    minHeight: 180,
    marginBottom: 25,
    overflow: 'hidden',
  },

  heroLabel: {
    color: '#BDB5FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    maxWidth: 230,
    marginTop: 14,
  },

  heroSubtitle: {
    color: '#C4C3D6',
    fontSize: 12,
    marginTop: 9,
  },

  heroIcon: {
    position: 'absolute',
    right: 20,
    top: 55,
    width: 60,
    height: 60,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    right: -70,
    bottom: -95,
  },

  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },

  month: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 13,
    marginBottom: 13,
  },

  loader: {
    paddingVertical: 35,
    alignItems: 'center',
  },

  loaderText: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 13,
  },

  errorContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
  },

  errorText: {
    color: colors.danger,
    fontSize: 13,
  },

  retryText: {
    color: colors.primary,
    fontWeight: '700',
    marginTop: 10,
  },

  quickActionsTitle: {
    marginTop: 13,
    marginBottom: 15,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },

  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 13,
    minHeight: 95,
    justifyContent: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },

  actionTitle: {
    fontSize: 11,
    color: colors.navy,
    fontWeight: '800',
  },
});
