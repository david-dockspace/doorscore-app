import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import type { PropertyListScreenProps } from '../navigation/types';
import { usePropertyStore } from '../store/propertyStore';
import PropertyCard from '../components/PropertyCard';
import { colors } from '../utils/theme';
import type { Property, PropertyStatus } from '../types';

type SortKey = 'date' | 'rating' | 'price';

const STATUS_FILTERS: { label: string; value: PropertyStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Want to Tour', value: 'want_to_tour' },
  { label: 'Toured', value: 'toured' },
  { label: 'Interested', value: 'interested' },
  { label: 'Not Interested', value: 'not_interested' },
  { label: 'Offer Made', value: 'offer_made' },
];

export default function PropertyListScreen({ navigation }: PropertyListScreenProps) {
  const { properties, deleteProperty } = usePropertyStore();
  const [sort, setSort] = useState<SortKey>('date');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddProperty')}
          style={styles.headerBtn}
        >
          <Ionicons name="add" size={26} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const filtered = properties.filter((p) =>
    statusFilter === 'all' ? true : p.status === statusFilter
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'price') return b.price - a.price;
    return new Date(b.dateViewed).getTime() - new Date(a.dateViewed).getTime();
  });

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  function confirmDelete(property: Property) {
    Alert.alert(
      'Delete Property',
      `Remove "${property.address}"? This cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => swipeableRefs.current.get(property.id)?.close(),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProperty(property.id),
        },
      ]
    );
  }

  function renderDeleteAction(property: Property) {
    return (
      <TouchableOpacity style={styles.deleteAction} onPress={() => confirmDelete(property)}>
        <Ionicons name="trash" size={22} color="#fff" />
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Sort bar */}
      <View style={styles.sortBar}>
        {(['date', 'rating', 'price'] as SortKey[]).map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setSort(key)}
            style={[styles.sortBtn, sort === key && styles.sortBtnActive]}
          >
            <Text style={[styles.sortLabel, sort === key && styles.sortLabelActive]}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status filter chips */}
      <FlatList
        data={STATUS_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setStatusFilter(item.value)}
            style={[styles.chip, statusFilter === item.value && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, statusFilter === item.value && styles.chipLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Property list */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏠</Text>
            <Text style={styles.emptyTitle}>No properties yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + to add a property you've toured or want to visit.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Swipeable
            ref={(ref) => {
              if (ref) swipeableRefs.current.set(item.id, ref);
              else swipeableRefs.current.delete(item.id);
            }}
            renderRightActions={() => renderDeleteAction(item)}
            overshootRight={false}
          >
            <PropertyCard
              property={item}
              onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
            />
          </Swipeable>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddProperty')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBtn: {
    marginRight: 4,
    padding: 4,
  },
  sortBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sortLabelActive: {
    color: '#fff',
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  chipLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  list: {
    paddingTop: 6,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 4,
    borderRadius: 12,
    marginRight: 12,
    gap: 4,
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
