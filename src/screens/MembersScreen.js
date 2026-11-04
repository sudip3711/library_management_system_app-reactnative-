
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import AppHeader from '../components/AppHeader';
import MemberCard from '../components/MemberCard';
import colors from '../constants/colors';
import { getAllMembers } from '../services/memberService';

export default function MembersScreen({ navigation }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');


const loadMembers = useCallback(async () => {
  try {
    setError('');

    let response = await getAllMembers();

    // Convert JSON string into JavaScript object
    if (typeof response === 'string') {
      response = JSON.parse(response);
    }

    console.log('Parsed Members Response:', response);

    if (response?.success === false) {
      throw new Error(response.message || 'Failed to fetch members');
    }

    const memberList = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : [];

    setMembers(memberList);

  } catch (error) {
    console.log('Members Error:', error);
    setError(error.message || 'Unable to load members');
    setMembers([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);


  // Reload whenever Members screen gets focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadMembers();
    }, [loadMembers])
  );

  // Pull down to refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadMembers();
  };

  // Search members by name, email or phone
  const filteredMembers = members.filter((member) => {
    const searchText = search.toLowerCase();

    const memberDetails = [
      member.name,
      member.email,
      member.phone,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return memberDetails.includes(searchText);
  });

  // Render each member
const renderMember = ({ item }) => (
  <MemberCard
    member={item}
    navigation={navigation}
  />
);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.top}>
        <AppHeader
          title="Members"
          subtitle={`${members.length} registered members`}
        />

        {/* Search */}
        <View style={styles.search}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
          />

          <TextInput
            placeholder="Search members..."
            placeholderTextColor="#A2A2B0"
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Section heading */}
        <View style={styles.headingRow}>
          <Text style={styles.heading}>All Members</Text>

          <Text style={styles.count}>
            {filteredMembers.length} found
          </Text>
        </View>
      </View>

      {/* Member List */}
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator
            color={colors.primary}
            size="large"
          />
          <Text style={styles.infoText}>
            Loading members...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={45}
            color={colors.danger}
          />

          <Text style={styles.error}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              loadMembers();
            }}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={(item, index) =>
            String(item.id ?? index)
          }
          renderItem={renderMember}
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
                name="people-outline"
                size={45}
                color={colors.textSecondary}
              />

              <Text style={styles.emptyTitle}>
                {search ? 'No members found' : 'No members available'}
              </Text>

              <Text style={styles.emptySubtitle}>
                {search
                  ? 'Try searching with another name, email or phone.'
                  : 'Add your first member to get started.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Add Member Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddMember')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={22} color="#FFFFFF" />

        <Text style={styles.addText}>Add Member</Text>
      </TouchableOpacity>
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

  search: {
    height: 53,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 22,
  },

  input: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },

  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },

  count: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },

  error: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
  },

  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 18,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginTop: 13,
  },

  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 19,
  },

  addButton: {
    position: 'absolute',
    bottom: 17,
    left: 20,
    right: 20,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 5,
  },

  addText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
