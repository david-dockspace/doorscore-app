import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { CompareScreenProps } from '../navigation/types';
import { usePropertyStore } from '../store/propertyStore';
import StatusBadge from '../components/StatusBadge';
import RatingDisplay from '../components/RatingDisplay';
import { colors } from '../utils/theme';
import { formatPrice, formatBedsBaths, formatSqft } from '../utils/formatters';
import type { Property } from '../types';

const MAX_COMPARE = 3;

interface CompareRow {
  label: string;
  getValue: (p: Property) => string;
}

const ROWS: CompareRow[] = [
  { label: 'Price', getValue: (p) => formatPrice(p.price) },
  { label: 'Beds / Baths', getValue: (p) => formatBedsBaths(p.bedrooms, p.bathrooms) },
  { label: 'Sqft', getValue: (p) => formatSqft(p.sqft) },
  { label: 'Year Built', getValue: (p) => p.yearBuilt ? String(p.yearBuilt) : '—' },
  { label: 'Rating', getValue: (p) => `${p.rating}/10` },
  { label: 'Status', getValue: (p) => p.status },
  { label: 'Pros', getValue: (p) => p.pros.length ? p.pros.join(', ') : '—' },
  { label: 'Cons', getValue: (p) => p.cons.length ? p.cons.join(', ') : '—' },
  { label: 'Notes', getValue: (p) => p.notes || '—' },
  { label: 'Agent', getValue: (p) => p.agentName || '—' },
];

export default function CompareScreen({}: CompareScreenProps) {
  const { properties } = usePropertyStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const selectedProperties = selected
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is Property => !!p);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  function removeSelected(id: string) {
    setSelected((prev) => prev.filter((x) => x !== id));
  }

  const colWidth = selectedProperties.length === 1 ? 260 : selectedProperties.length === 2 ? 180 : 140;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Property selector row */}
      <View style={styles.selectorBar}>
        {selectedProperties.map((p) => (
          <View key={p.id} style={styles.selectedChip}>
            <Text style={styles.selectedChipText} numberOfLines={1}>
              {p.address.split(',')[0]}
            </Text>
            <TouchableOpacity onPress={() => removeSelected(p.id)} hitSlop={6}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ))}
        {selectedProperties.length < MAX_COMPARE && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowPicker(true)}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={styles.addBtnLabel}>
              {selectedProperties.length === 0 ? 'Add property' : 'Add another'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Empty state */}
      {selectedProperties.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⚖️</Text>
          <Text style={styles.emptyTitle}>Compare Properties</Text>
          <Text style={styles.emptySubtitle}>
            Select up to {MAX_COMPARE} properties to compare side-by-side.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowPicker(true)}>
            <Text style={styles.emptyBtnLabel}>Choose Properties</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Comparison table */
        <ScrollView showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Header row with address */}
              <View style={styles.tableHeader}>
                <View style={styles.labelCol}>
                  <Text style={styles.labelColHeader}> </Text>
                </View>
                {selectedProperties.map((p) => (
                  <View key={p.id} style={[styles.valCol, { width: colWidth }]}>
                    <Text style={styles.colAddress} numberOfLines={2}>
                      {p.address}
                    </Text>
                    <RatingDisplay rating={p.rating} size="sm" />
                    <StatusBadge status={p.status} size="sm" />
                  </View>
                ))}
              </View>

              {/* Data rows */}
              {ROWS.map((row, i) => (
                <View
                  key={row.label}
                  style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}
                >
                  <View style={styles.labelCol}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                  </View>
                  {selectedProperties.map((p) => {
                    const value = row.getValue(p);
                    const isStatus = row.label === 'Status';
                    return (
                      <View key={p.id} style={[styles.valCol, { width: colWidth }]}>
                        {isStatus ? (
                          <StatusBadge status={p.status} size="sm" />
                        ) : (
                          <Text style={styles.cellText}>{value}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      )}

      {/* Property picker modal */}
      <Modal visible={showPicker} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Property</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={properties}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptySubtitle}>No properties added yet.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = selected.includes(item.id);
              const isDisabled = selected.length >= MAX_COMPARE && !isSelected;
              return (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    isSelected && styles.pickerItemSelected,
                    isDisabled && styles.pickerItemDisabled,
                  ]}
                  onPress={() => {
                    toggleSelect(item.id);
                    setShowPicker(false);
                  }}
                  disabled={isDisabled}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerAddress}>{item.address}</Text>
                    <Text style={styles.pickerMeta}>
                      {formatPrice(item.price)} · {formatBedsBaths(item.bedrooms, item.bathrooms)}
                    </Text>
                  </View>
                  <View style={styles.pickerRight}>
                    <RatingDisplay rating={item.rating} size="sm" />
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  selectorBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: 160,
  },
  selectedChipText: {
    flex: 1,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addBtnLabel: {
    fontSize: 13,
    color: colors.primary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 48,
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
  emptyBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyBtnLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  labelCol: {
    width: 90,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  labelColHeader: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  valCol: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    gap: 4,
    justifyContent: 'flex-start',
  },
  colAddress: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  rowLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  cellText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  pickerItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pickerItemDisabled: {
    opacity: 0.4,
  },
  pickerAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  pickerMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  pickerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
