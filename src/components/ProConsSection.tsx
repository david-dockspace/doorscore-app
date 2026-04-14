import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';

interface Props {
  label: string;
  items: string[];
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onChange: (items: string[]) => void;
  editable?: boolean;
}

export default function ProConsSection({ label, items, color, icon, onChange, editable = true }: Props) {
  const [draft, setDraft] = useState('');

  function addItem() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft('');
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>

      {items.map((item, i) => (
        <View key={i} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.itemText}>{item}</Text>
          {editable && (
            <TouchableOpacity onPress={() => removeItem(i)} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {editable && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={`Add ${label.toLowerCase()}...`}
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={addItem}
            returnKeyType="done"
          />
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: color }]} onPress={addItem}>
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
