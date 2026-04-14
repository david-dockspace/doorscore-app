import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PropertyStatus } from '../types';
import { statusConfig } from '../utils/theme';

interface Props {
  status: PropertyStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = statusConfig[status];
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, isSmall && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.label, { color: cfg.text }, isSmall && styles.labelSm]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  labelSm: {
    fontSize: 11,
  },
});
